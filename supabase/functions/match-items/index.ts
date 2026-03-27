import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Fuzzy word-overlap similarity between two strings (0-1) */
function textSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let overlap = 0;
  for (const w of wordsA) if (wordsB.has(w)) overlap++;
  return overlap / Math.max(wordsA.size, wordsB.size);
}

/** Date proximity score: same day=1, ±1 day=0.8, ±3=0.5, ±7=0.2, else 0 */
function dateSimilarity(d1: string, d2: string): number {
  const diff = Math.abs(new Date(d1).getTime() - new Date(d2).getTime()) / 86400000;
  if (diff <= 0) return 1;
  if (diff <= 1) return 0.8;
  if (diff <= 3) return 0.5;
  if (diff <= 7) return 0.2;
  return 0;
}

/** Location similarity: exact=1, partial word overlap */
function locationSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a.toLowerCase().trim() === b.toLowerCase().trim()) return 1;
  return textSimilarity(a, b) * 0.7;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { item_id } = await req.json();
    if (!item_id) {
      return new Response(JSON.stringify({ error: "item_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the source item
    const { data: sourceItem, error: srcErr } = await supabase
      .from("items")
      .select("*")
      .eq("id", item_id)
      .single();

    if (srcErr || !sourceItem) {
      return new Response(JSON.stringify({ error: "Item not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find opposite type items (lost→found, found→lost)
    const oppositeType = sourceItem.type === "lost" ? "found" : "lost";
    const { data: candidates = [] } = await supabase
      .from("items")
      .select("*")
      .eq("type", oppositeType)
      .neq("status", "returned")
      .limit(100);

    // Score each candidate
    const WEIGHTS = {
      category: 0.30,
      description: 0.25,
      location: 0.25,
      date: 0.20,
    };

    const scored = (candidates || []).map((c: any) => {
      const categoryScore = c.category?.toLowerCase() === sourceItem.category?.toLowerCase() ? 1 : 0;
      const descScore = textSimilarity(sourceItem.description, c.description);
      const locScore = locationSimilarity(sourceItem.location_name, c.location_name);
      const dateScore = dateSimilarity(sourceItem.date, c.date);

      const totalScore =
        categoryScore * WEIGHTS.category +
        descScore * WEIGHTS.description +
        locScore * WEIGHTS.location +
        dateScore * WEIGHTS.date;

      return {
        id: c.id,
        title: c.title,
        category: c.category,
        description: c.description,
        image_url: c.image_url,
        location_name: c.location_name,
        date: c.date,
        type: c.type,
        status: c.status,
        similarity_score: Math.round(totalScore * 100),
        breakdown: {
          category: Math.round(categoryScore * 100),
          description: Math.round(descScore * 100),
          location: Math.round(locScore * 100),
          date: Math.round(dateScore * 100),
        },
      };
    });

    // Filter above threshold and sort
    const matches = scored
      .filter((m: any) => m.similarity_score >= 30)
      .sort((a: any, b: any) => b.similarity_score - a.similarity_score)
      .slice(0, 5);

    return new Response(JSON.stringify({ matches }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

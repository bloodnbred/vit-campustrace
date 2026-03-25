import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_CATEGORIES = [
  "Electronics",
  "Books",
  "Clothing",
  "Accessories",
  "ID Cards",
  "Keys",
  "Bags",
  "Stationery",
  "Water Bottles",
  "Other",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
    );
    const mimeType = file.type || "image/jpeg";

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an item classifier for a campus lost & found system. Analyze this image and classify it into exactly ONE of these categories: ${VALID_CATEGORIES.join(", ")}.

Respond ONLY with valid JSON in this exact format:
{"category": "<category>", "confidence": <0.0-1.0>}

Rules:
- "Electronics" includes phones, laptops, chargers, headphones, earbuds, tablets, power banks
- "Books" includes notebooks, textbooks, papers
- "Clothing" includes jackets, scarves, hats, shoes
- "Accessories" includes watches, sunglasses, jewelry, wallets
- "ID Cards" includes student IDs, library cards, any cards
- "Keys" includes keychains, key sets
- "Bags" includes backpacks, purses, pouches, laptop bags
- "Stationery" includes pens, pencils, calculators, rulers
- "Water Bottles" includes any drinking containers, tumblers, flasks
- "Other" for anything that doesn't fit above

Return ONLY the JSON, nothing else.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 100,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    // Parse AI response
    let result;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/\{[^}]+\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : content);
    } catch {
      result = { category: "Other", confidence: 0.5 };
    }

    // Validate category
    if (!VALID_CATEGORIES.includes(result.category)) {
      result.category = "Other";
      result.confidence = Math.min(result.confidence || 0.5, 0.5);
    }

    return new Response(
      JSON.stringify({
        category: result.category,
        confidence: Math.round((result.confidence || 0.5) * 100) / 100,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Classification error:", error);
    return new Response(
      JSON.stringify({ error: "Classification failed", category: "Other", confidence: 0 }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Loader2, Sparkles, MapPin, Calendar, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { StatusBadge } from "./StatusBadge";

interface PossibleMatchesProps {
  itemId: string;
  itemStatus: string;
}

interface Match {
  id: string;
  title: string;
  category: string;
  description: string;
  image_url: string | null;
  location_name: string;
  date: string;
  type: string;
  status: string;
  similarity_score: number;
  breakdown: {
    category: number;
    description: number;
    location: number;
    date: number;
  };
}

export function PossibleMatches({ itemId, itemStatus }: PossibleMatchesProps) {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ["matches", itemId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("match-items", {
        body: { item_id: itemId },
      });
      if (error) throw error;
      return (data?.matches || []) as Match[];
    },
    enabled: itemStatus !== "returned",
    retry: false,
  });

  if (itemStatus === "returned") return null;

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl font-semibold text-foreground">
          Possible Matches
        </h2>
        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
          AI Powered
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 justify-center text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Analyzing items for matches…</span>
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-card p-8 text-center text-muted-foreground">
          <p>No potential matches found yet.</p>
          <p className="text-xs mt-1 opacity-60">
            Matches appear automatically when similar items are reported.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match, i) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/item/${match.id}`} className="block group">
                <div className="glass-card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={
                        match.image_url ||
                        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"
                      }
                      alt={match.title}
                      className="w-full h-36 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full shadow">
                      {match.similarity_score}% match
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-background/80 backdrop-blur text-[10px] text-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        AI Detected
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-card-foreground text-sm truncate">
                        {match.title}
                      </h3>
                      <StatusBadge status={match.status as any} />
                    </div>

                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {match.category}
                    </span>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {match.location_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{" "}
                        {new Date(match.date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Score breakdown */}
                    <div className="grid grid-cols-4 gap-1 pt-2 border-t border-border">
                      {(
                        [
                          ["Cat", match.breakdown.category],
                          ["Desc", match.breakdown.description],
                          ["Loc", match.breakdown.location],
                          ["Date", match.breakdown.date],
                        ] as [string, number][]
                      ).map(([label, val]) => (
                        <div key={label} className="text-center">
                          <div className="text-[10px] text-muted-foreground">
                            {label}
                          </div>
                          <div
                            className={`text-xs font-bold ${
                              val >= 70
                                ? "text-status-found"
                                : val >= 40
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {val}%
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-end text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View Details <ArrowRight className="w-3 h-3 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

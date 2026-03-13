import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Copy, Send, MapPin, Calendar, User, ArrowLeft, Tag, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function ItemDetail() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [claimText, setClaimText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: item, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("items").select("*").eq("id", id).single();
      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        status: data.status as "lost" | "found" | "claimed" | "returned",
        type: data.type,
        imageUrl: data.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        date: data.date,
        locationId: data.location_id,
        locationName: data.location_name,
        reporterId: data.reporter_id,
        reporterName: data.reporter_name,
        reporterPhone: data.reporter_phone || "",
        createdAt: data.created_at,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Item not found.</div>
      </div>
    );
  }

  // Fetch claim requests for the reporter
  const isReporter = user && item && user.id === item.reporterId;
  const { data: claims = [] } = useQuery({
    queryKey: ["claims", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claim_requests")
        .select("*")
        .eq("item_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!isReporter,
  });

  const handleClaimAction = async (claimId: string, action: "accepted" | "rejected") => {
    try {
      await supabase.from("claim_requests").update({ status: action }).eq("id", claimId);
      if (action === "accepted") {
        await supabase.from("items").update({ status: "returned" }).eq("id", item!.id);
      }
      toast.success(`Claim ${action}!`);
      queryClient.invalidateQueries({ queryKey: ["claims", id] });
      queryClient.invalidateQueries({ queryKey: ["item", id] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const copyPhone = () => {
    navigator.clipboard.writeText(item.reporterPhone);
    toast.success("Phone number copied!");
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) {
      toast.error("Please sign in to claim an item.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("claim_requests").insert({
        item_id: item.id,
        claimant_id: user.id,
        claimant_name: profile.name,
        explanation: claimText,
      });
      if (error) throw error;

      // Update item status
      await supabase.from("items").update({ status: "claimed" }).eq("id", item.id);

      toast.success("Claim request sent! The reporter will review it.");
      setClaimText("");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={item.imageUrl} alt={item.title} className="w-full h-80 md:h-full object-cover" />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <StatusBadge status={item.status} />
                <span className="text-xs text-muted-foreground uppercase font-medium">{item.type} item</span>
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">{item.title}</h1>
            </div>

            <p className="text-muted-foreground leading-relaxed">{item.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card p-4 !transform-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Tag className="w-3 h-3" /> Category</div>
                <p className="font-semibold text-card-foreground">{item.category}</p>
              </div>
              <div className="glass-card p-4 !transform-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><MapPin className="w-3 h-3" /> Location</div>
                <p className="font-semibold text-card-foreground">{item.locationName}</p>
              </div>
              <div className="glass-card p-4 !transform-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><Calendar className="w-3 h-3" /> Date</div>
                <p className="font-semibold text-card-foreground">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <div className="glass-card p-4 !transform-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1"><User className="w-3 h-3" /> Reported by</div>
                <p className="font-semibold text-card-foreground">{item.reporterName}</p>
              </div>
            </div>

            <div className="glass-card p-5 !transform-none space-y-3">
              <h3 className="font-display font-semibold text-card-foreground">Contact Reporter</h3>
              <p className="text-sm text-muted-foreground">{item.reporterPhone || "No phone provided"}</p>
              {item.reporterPhone && (
                <div className="flex gap-2">
                  <Button asChild size="sm" className="gap-1">
                    <a href={`tel:${item.reporterPhone.replace(/\s/g, "")}`}><Phone className="w-3 h-3" /> Call</a>
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={copyPhone}>
                    <Copy className="w-3 h-3" /> Copy Number
                  </Button>
                </div>
              )}
            </div>

            {/* Claim requests section for reporter */}
            {isReporter && claims.length > 0 && (
              <div className="glass-card p-5 !transform-none space-y-4">
                <h3 className="font-display font-semibold text-card-foreground">
                  Claim Requests ({claims.length})
                </h3>
                {claims.map((claim: any) => (
                  <div key={claim.id} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-foreground">{claim.claimant_name}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        claim.status === "pending" ? "bg-accent text-accent-foreground" :
                        claim.status === "accepted" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300" :
                        "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}>
                        {claim.status === "pending" && <Clock className="w-3 h-3 inline mr-1" />}
                        {claim.status === "accepted" && <CheckCircle className="w-3 h-3 inline mr-1" />}
                        {claim.status === "rejected" && <XCircle className="w-3 h-3 inline mr-1" />}
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{claim.explanation}</p>
                    <p className="text-xs text-muted-foreground">{new Date(claim.created_at).toLocaleString()}</p>
                    {claim.status === "pending" && (
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="default" className="gap-1" onClick={() => handleClaimAction(claim.id, "accepted")}>
                          <CheckCircle className="w-3 h-3" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handleClaimAction(claim.id, "rejected")}>
                          <XCircle className="w-3 h-3" /> Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Claim form for non-reporters */}
            {item.status !== "returned" && user && user.id !== item.reporterId && (
              <div className="glass-card p-5 !transform-none">
                <h3 className="font-display font-semibold text-card-foreground mb-3">Claim This Item</h3>
                <form onSubmit={handleClaim} className="space-y-3">
                  <Textarea
                    placeholder="Explain why this item belongs to you..."
                    value={claimText}
                    onChange={e => setClaimText(e.target.value)}
                    rows={3}
                    required
                  />
                  <Button type="submit" className="gap-1 w-full" disabled={!claimText.trim() || submitting}>
                    {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Send Claim Request
                  </Button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

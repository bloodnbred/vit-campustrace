import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { mockItems } from "@/lib/mockData";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Copy, Send, MapPin, Calendar, User, ArrowLeft, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useState } from "react";

export default function ItemDetail() {
  const { id } = useParams();
  const item = mockItems.find(i => i.id === id);
  const [claimText, setClaimText] = useState("");

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Item not found.</div>
      </div>
    );
  }

  const copyPhone = () => {
    navigator.clipboard.writeText(item.reporterPhone);
    toast.success("Phone number copied!");
  };

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Claim request sent! The reporter will review it.");
    setClaimText("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="rounded-xl overflow-hidden border border-border">
            <img src={item.imageUrl} alt={item.title} className="w-full h-80 md:h-full object-cover" />
          </div>

          {/* Details */}
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
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Tag className="w-3 h-3" /> Category
                </div>
                <p className="font-semibold text-card-foreground">{item.category}</p>
              </div>
              <div className="glass-card p-4 !transform-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" /> Location
                </div>
                <p className="font-semibold text-card-foreground">{item.locationName}</p>
              </div>
              <div className="glass-card p-4 !transform-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="w-3 h-3" /> Date
                </div>
                <p className="font-semibold text-card-foreground">{new Date(item.date).toLocaleDateString()}</p>
              </div>
              <div className="glass-card p-4 !transform-none">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <User className="w-3 h-3" /> Reported by
                </div>
                <p className="font-semibold text-card-foreground">{item.reporterName}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="glass-card p-5 !transform-none space-y-3">
              <h3 className="font-display font-semibold text-card-foreground">Contact Reporter</h3>
              <p className="text-sm text-muted-foreground">{item.reporterPhone}</p>
              <div className="flex gap-2">
                <Button asChild size="sm" className="gap-1">
                  <a href={`tel:${item.reporterPhone.replace(/\s/g, "")}`}>
                    <Phone className="w-3 h-3" /> Call
                  </a>
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={copyPhone}>
                  <Copy className="w-3 h-3" /> Copy Number
                </Button>
              </div>
            </div>

            {/* Claim */}
            {item.status !== "returned" && (
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
                  <Button type="submit" className="gap-1 w-full" disabled={!claimText.trim()}>
                    <Send className="w-3 h-3" /> Send Claim Request
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

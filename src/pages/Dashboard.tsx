import { Navbar } from "@/components/Navbar";
import { ItemCard } from "@/components/ItemCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Package, CheckCircle, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Dashboard() {
  const { profile } = useAuth();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data.map((i: any) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        category: i.category,
        status: i.status,
        type: i.type,
        imageUrl: i.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        date: i.date,
        locationId: i.location_id,
        locationName: i.location_name,
        reporterId: i.reporter_id,
        reporterName: i.reporter_name,
        reporterPhone: i.reporter_phone,
        createdAt: i.created_at,
      }));
    },
  });

  const stats = [
    { label: "Total Lost", value: items.filter((i: any) => i.type === "lost").length, icon: AlertTriangle, color: "text-status-lost" },
    { label: "Total Found", value: items.filter((i: any) => i.type === "found").length, icon: Package, color: "text-status-found" },
    { label: "Returned", value: items.filter((i: any) => i.status === "returned").length, icon: CheckCircle, color: "text-status-returned" },
    { label: "Active Reports", value: items.filter((i: any) => i.status !== "returned").length, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {profile?.name || "Guest"} 👋</p>
          </div>
          <Link to="/report">
            <Button className="gap-2 shadow-md">
              <Plus className="w-4 h-4" /> Report Item
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="font-display text-3xl font-bold text-card-foreground">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Recent Reports</h2>
          <Link to="/search">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : items.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item: any, i: number) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No items reported yet. Be the first to report!</p>
          </div>
        )}
      </div>
    </div>
  );
}

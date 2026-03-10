import { Navbar } from "@/components/Navbar";
import { mockItems } from "@/lib/mockData";
import { ItemCard } from "@/components/ItemCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Package, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Total Lost", value: mockItems.filter(i => i.type === "lost").length, icon: AlertTriangle, color: "text-status-lost" },
  { label: "Total Found", value: mockItems.filter(i => i.type === "found").length, icon: Package, color: "text-status-found" },
  { label: "Returned", value: mockItems.filter(i => i.status === "returned").length, icon: CheckCircle, color: "text-status-returned" },
  { label: "Active Reports", value: mockItems.filter(i => i.status !== "returned").length, icon: TrendingUp, color: "text-primary" },
];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, Arjun 👋</p>
          </div>
          <Link to="/report">
            <Button className="gap-2 shadow-md">
              <Plus className="w-4 h-4" /> Report Item
            </Button>
          </Link>
        </div>

        {/* Stats */}
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

        {/* Recent items */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-semibold text-foreground">Recent Reports</h2>
          <Link to="/search">
            <Button variant="ghost" size="sm" className="gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockItems.map((item, i) => (
            <ItemCard key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

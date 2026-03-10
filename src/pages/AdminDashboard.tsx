import { Navbar } from "@/components/Navbar";
import { mockItems, mockLocations } from "@/lib/mockData";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, MapPin, Building, Package, BarChart3, Edit } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [tab, setTab] = useState<"items" | "locations" | "stats">("items");

  const blocks = mockLocations.filter(l => l.type === "block");
  const customLocs = mockLocations.filter(l => l.type === "custom");

  const categoryStats = mockItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationStats = mockItems.reduce((acc, item) => {
    acc[item.locationName] = (acc[item.locationName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage items, locations, and monitor platform activity.</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-border pb-4">
          {[
            { key: "items" as const, label: "All Items", icon: Package },
            { key: "locations" as const, label: "Locations", icon: MapPin },
            { key: "stats" as const, label: "Statistics", icon: BarChart3 },
          ].map(t => (
            <Button key={t.key} variant={tab === t.key ? "default" : "ghost"} onClick={() => setTab(t.key)} className="gap-2">
              <t.icon className="w-4 h-4" /> {t.label}
            </Button>
          ))}
        </div>

        {/* Items tab */}
        {tab === "items" && (
          <div className="space-y-3">
            {mockItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-4 flex items-center gap-4 !transform-none"
              >
                <img src={item.imageUrl} alt={item.title} className="w-14 h-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-card-foreground truncate">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.locationName} · {item.reporterName}</p>
                </div>
                <StatusBadge status={item.status} />
                <Button size="icon" variant="ghost" onClick={() => toast.info("Delete functionality requires backend")}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Locations tab */}
        {tab === "locations" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">Campus Locations</h2>
              <Button className="gap-2" onClick={() => toast.info("Add location requires backend")}>
                <Plus className="w-4 h-4" /> Add Location
              </Button>
            </div>

            {/* Blocks */}
            {blocks.map(block => {
              const rooms = mockLocations.filter(l => l.parentId === block.id);
              return (
                <div key={block.id} className="glass-card p-5 !transform-none">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold flex items-center gap-2 text-card-foreground">
                      <Building className="w-4 h-4 text-primary" /> {block.name}
                    </h3>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost"><Edit className="w-3 h-3" /></Button>
                      <Button size="sm" variant="ghost"><Trash2 className="w-3 h-3 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rooms.map(r => (
                      <span key={r.id} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
                        {r.name}
                      </span>
                    ))}
                    <button className="px-3 py-1 rounded-full border border-dashed border-border text-sm text-muted-foreground hover:text-foreground">
                      + Add Room
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Custom locations */}
            <div className="glass-card p-5 !transform-none">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-card-foreground">
                <MapPin className="w-4 h-4 text-primary" /> Custom Locations
              </h3>
              <div className="flex flex-wrap gap-2">
                {customLocs.map(l => (
                  <span key={l.id} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center gap-2">
                    {l.name}
                    <button><Trash2 className="w-3 h-3 text-destructive" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats tab */}
        {tab === "stats" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 !transform-none">
              <h3 className="font-display font-semibold mb-4 text-card-foreground">Items by Category</h3>
              <div className="space-y-3">
                {Object.entries(categoryStats).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / mockItems.length) * 100}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-card-foreground w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6 !transform-none">
              <h3 className="font-display font-semibold mb-4 text-card-foreground">Items by Location</h3>
              <div className="space-y-3">
                {Object.entries(locationStats).sort((a, b) => b[1] - a[1]).map(([loc, count]) => (
                  <div key={loc} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{loc}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / mockItems.length) * 100}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-card-foreground w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

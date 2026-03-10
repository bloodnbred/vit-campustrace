import { Navbar } from "@/components/Navbar";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, MapPin, Building, Package, BarChart3, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"items" | "locations" | "stats">("items");
  const [newLocName, setNewLocName] = useState("");
  const [newLocType, setNewLocType] = useState<"block" | "room" | "custom">("custom");
  const [newLocParent, setNewLocParent] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: items = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["admin-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["admin-locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campus_locations").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const blocks = locations.filter((l: any) => l.type === "block");
  const customLocs = locations.filter((l: any) => l.type === "custom");

  const categoryStats = items.reduce((acc: any, item: any) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationStats = items.reduce((acc: any, item: any) => {
    acc[item.location_name] = (acc[item.location_name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDeleteItem = async (itemId: string) => {
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) { toast.error(error.message); return; }
    toast.success("Item deleted.");
    queryClient.invalidateQueries({ queryKey: ["admin-items"] });
  };

  const handleAddLocation = async () => {
    if (!newLocName.trim()) return;
    const { error } = await supabase.from("campus_locations").insert({
      name: newLocName,
      type: newLocType,
      parent_id: newLocType === "room" && newLocParent ? newLocParent : null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Location added!");
    setNewLocName("");
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
  };

  const handleDeleteLocation = async (locId: string) => {
    const { error } = await supabase.from("campus_locations").delete().eq("id", locId);
    if (error) { toast.error(error.message); return; }
    toast.success("Location deleted.");
    queryClient.invalidateQueries({ queryKey: ["admin-locations"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage items, locations, and monitor platform activity.</p>

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

        {tab === "items" && (
          <div className="space-y-3">
            {itemsLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : items.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No items yet.</p>
            ) : (
              items.map((item: any, i: number) => (
                <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                  className="glass-card p-4 flex items-center gap-4 !transform-none">
                  <img src={item.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop"} alt={item.title} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.location_name} · {item.reporter_name}</p>
                  </div>
                  <StatusBadge status={item.status} />
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        )}

        {tab === "locations" && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold text-foreground">Campus Locations</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="w-4 h-4" /> Add Location</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add New Location</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Location Name</Label>
                      <Input value={newLocName} onChange={e => setNewLocName(e.target.value)} placeholder="e.g., C Block, Lab 301, Auditorium" />
                    </div>
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select value={newLocType} onValueChange={(v: any) => setNewLocType(v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="block">Block</SelectItem>
                          <SelectItem value="room">Room</SelectItem>
                          <SelectItem value="custom">Custom Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {newLocType === "room" && (
                      <div className="space-y-2">
                        <Label>Parent Block</Label>
                        <Select value={newLocParent} onValueChange={setNewLocParent}>
                          <SelectTrigger><SelectValue placeholder="Select block" /></SelectTrigger>
                          <SelectContent>
                            {blocks.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <Button onClick={handleAddLocation} className="w-full">Add Location</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {blocks.map((block: any) => {
              const blockRooms = locations.filter((l: any) => l.parent_id === block.id);
              return (
                <div key={block.id} className="glass-card p-5 !transform-none">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display font-semibold flex items-center gap-2 text-card-foreground">
                      <Building className="w-4 h-4 text-primary" /> {block.name}
                    </h3>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteLocation(block.id)}>
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {blockRooms.map((r: any) => (
                      <span key={r.id} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center gap-2">
                        {r.name}
                        <button onClick={() => handleDeleteLocation(r.id)}><Trash2 className="w-3 h-3 text-destructive" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            <div className="glass-card p-5 !transform-none">
              <h3 className="font-display font-semibold mb-3 flex items-center gap-2 text-card-foreground">
                <MapPin className="w-4 h-4 text-primary" /> Custom Locations
              </h3>
              <div className="flex flex-wrap gap-2">
                {customLocs.map((l: any) => (
                  <span key={l.id} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm flex items-center gap-2">
                    {l.name}
                    <button onClick={() => handleDeleteLocation(l.id)}><Trash2 className="w-3 h-3 text-destructive" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "stats" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card p-6 !transform-none">
              <h3 className="font-display font-semibold mb-4 text-card-foreground">Items by Category</h3>
              <div className="space-y-3">
                {Object.entries(categoryStats).sort((a: any, b: any) => b[1] - a[1]).map(([cat, count]: any) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{cat}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / items.length) * 100}%` }} />
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
                {Object.entries(locationStats).sort((a: any, b: any) => b[1] - a[1]).map(([loc, count]: any) => (
                  <div key={loc} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{loc}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(count / items.length) * 100}%` }} />
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

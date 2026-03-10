import { Navbar } from "@/components/Navbar";
import { ItemCard } from "@/components/ItemCard";
import { MapPin, Building, ChevronRight, Home, Loader2 } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function BrowseLocations() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campus_locations").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: allItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["all-items-browse"],
    queryFn: async () => {
      const { data, error } = await supabase.from("items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((i: any) => ({
        id: i.id, title: i.title, description: i.description, category: i.category,
        status: i.status, type: i.type,
        imageUrl: i.image_url || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
        date: i.date, locationId: i.location_id, locationName: i.location_name,
        reporterId: i.reporter_id, reporterName: i.reporter_name, reporterPhone: i.reporter_phone,
        createdAt: i.created_at,
      }));
    },
  });

  const blocks = locations.filter((l: any) => l.type === "block");
  const customLocations = locations.filter((l: any) => l.type === "custom");
  const rooms = selectedBlock ? locations.filter((l: any) => l.type === "room" && l.parent_id === selectedBlock) : [];

  const filteredItems = selectedLocation
    ? allItems.filter((i: any) => i.locationId === selectedLocation)
    : selectedBlock
    ? allItems.filter((i: any) => {
        const roomIds = locations.filter((l: any) => l.parent_id === selectedBlock).map((l: any) => l.id);
        return roomIds.includes(i.locationId) || i.locationId === selectedBlock;
      })
    : [];

  const selectedName = selectedLocation
    ? locations.find((l: any) => l.id === selectedLocation)?.name
    : selectedBlock
    ? locations.find((l: any) => l.id === selectedBlock)?.name
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => { setSelectedBlock(null); setSelectedLocation(null); }} className="hover:text-foreground flex items-center gap-1">
            <Home className="w-3 h-3" /> Campus
          </button>
          {selectedBlock && (
            <>
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => setSelectedLocation(null)} className="hover:text-foreground">
                {locations.find((l: any) => l.id === selectedBlock)?.name}
              </button>
            </>
          )}
          {selectedLocation && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">{locations.find((l: any) => l.id === selectedLocation)?.name}</span>
            </>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          {selectedName ? `Items at ${selectedName}` : "Browse Campus Locations"}
        </h1>

        {!selectedBlock && !selectedLocation && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" /> Academic Blocks
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blocks.map((block: any, i: number) => {
                  const roomCount = locations.filter((l: any) => l.parent_id === block.id).length;
                  const itemCount = allItems.filter((it: any) => {
                    const rIds = locations.filter((l: any) => l.parent_id === block.id).map((l: any) => l.id);
                    return rIds.includes(it.locationId);
                  }).length;
                  return (
                    <motion.button key={block.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedBlock(block.id)} className="glass-card p-5 text-left group">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display font-semibold text-card-foreground">{block.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{roomCount} rooms · {itemCount} items</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Other Locations
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customLocations.map((loc: any, i: number) => {
                  const itemCount = allItems.filter((it: any) => it.locationId === loc.id).length;
                  return (
                    <motion.button key={loc.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      onClick={() => { setSelectedBlock(null); setSelectedLocation(loc.id); }} className="glass-card p-5 text-left group">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-display font-semibold text-card-foreground">{loc.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{itemCount} items</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {selectedBlock && !selectedLocation && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {rooms.map((room: any, i: number) => {
                const itemCount = allItems.filter((it: any) => it.locationId === room.id).length;
                return (
                  <motion.button key={room.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedLocation(room.id)} className="glass-card p-4 text-left">
                    <h3 className="font-semibold text-card-foreground">{room.name}</h3>
                    <p className="text-xs text-muted-foreground">{itemCount} items</p>
                  </motion.button>
                );
              })}
            </div>

            {filteredItems.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-semibold mb-4 text-foreground">All items in this block</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.map((item: any, i: number) => <ItemCard key={item.id} item={item} index={i} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedLocation && (
          <div>
            {filteredItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item: any, i: number) => <ItemCard key={item.id} item={item} index={i} />)}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No items reported at this location yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

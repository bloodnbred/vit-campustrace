import { Navbar } from "@/components/Navbar";
import { mockLocations, mockItems } from "@/lib/mockData";
import { ItemCard } from "@/components/ItemCard";
import { MapPin, Building, ChevronRight, Home } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function BrowseLocations() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  const blocks = mockLocations.filter(l => l.type === "block");
  const customLocations = mockLocations.filter(l => l.type === "custom");
  const rooms = selectedBlock ? mockLocations.filter(l => l.type === "room" && l.parentId === selectedBlock) : [];

  const filteredItems = selectedLocation
    ? mockItems.filter(i => i.locationId === selectedLocation)
    : selectedBlock
    ? mockItems.filter(i => {
        const roomIds = mockLocations.filter(l => l.parentId === selectedBlock).map(l => l.id);
        return roomIds.includes(i.locationId) || i.locationId === selectedBlock;
      })
    : [];

  const selectedName = selectedLocation
    ? mockLocations.find(l => l.id === selectedLocation)?.name
    : selectedBlock
    ? mockLocations.find(l => l.id === selectedBlock)?.name
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <button onClick={() => { setSelectedBlock(null); setSelectedLocation(null); }} className="hover:text-foreground flex items-center gap-1">
            <Home className="w-3 h-3" /> Campus
          </button>
          {selectedBlock && (
            <>
              <ChevronRight className="w-3 h-3" />
              <button onClick={() => setSelectedLocation(null)} className="hover:text-foreground">
                {mockLocations.find(l => l.id === selectedBlock)?.name}
              </button>
            </>
          )}
          {selectedLocation && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground">{mockLocations.find(l => l.id === selectedLocation)?.name}</span>
            </>
          )}
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground mb-8">
          {selectedName ? `Items at ${selectedName}` : "Browse Campus Locations"}
        </h1>

        {!selectedBlock && !selectedLocation && (
          <div className="space-y-8">
            {/* Blocks */}
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" /> Academic Blocks
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {blocks.map((block, i) => {
                  const roomCount = mockLocations.filter(l => l.parentId === block.id).length;
                  const itemCount = mockItems.filter(i => {
                    const rIds = mockLocations.filter(l => l.parentId === block.id).map(l => l.id);
                    return rIds.includes(i.locationId);
                  }).length;
                  return (
                    <motion.button
                      key={block.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedBlock(block.id)}
                      className="glass-card p-5 text-left group"
                    >
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

            {/* Custom */}
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Other Locations
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customLocations.map((loc, i) => {
                  const itemCount = mockItems.filter(it => it.locationId === loc.id).length;
                  return (
                    <motion.button
                      key={loc.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { setSelectedBlock(null); setSelectedLocation(loc.id); }}
                      className="glass-card p-5 text-left group"
                    >
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

        {/* Rooms inside a block */}
        {selectedBlock && !selectedLocation && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {rooms.map((room, i) => {
                const itemCount = mockItems.filter(it => it.locationId === room.id).length;
                return (
                  <motion.button
                    key={room.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setSelectedLocation(room.id)}
                    className="glass-card p-4 text-left"
                  >
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
                  {filteredItems.map((item, i) => (
                    <ItemCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Items at selected location */}
        {selectedLocation && (
          <div>
            {filteredItems.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item, i) => (
                  <ItemCard key={item.id} item={item} index={i} />
                ))}
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

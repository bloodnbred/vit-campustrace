import { Navbar } from "@/components/Navbar";
import { mockItems } from "@/lib/mockData";
import { ItemCard } from "@/components/ItemCard";
import { CATEGORIES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, X } from "lucide-react";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"all" | "lost" | "found">("all");

  const filtered = useMemo(() => {
    return mockItems.filter((item) => {
      const matchesQuery = !query || item.title.toLowerCase().includes(query.toLowerCase()) || item.description.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = !selectedCategory || item.category === selectedCategory;
      const matchesType = selectedType === "all" || item.type === selectedType;
      return matchesQuery && matchesCategory && matchesType;
    });
  }, [query, selectedCategory, selectedType]);

  const clearFilters = () => { setQuery(""); setSelectedCategory(null); setSelectedType("all"); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Search Items</h1>

        {/* Search bar */}
        <div className="relative mb-6">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex gap-2">
            {(["all", "lost", "found"] as const).map((t) => (
              <Button key={t} size="sm" variant={selectedType === t ? "default" : "outline"} onClick={() => setSelectedType(t)} className="capitalize">
                {t === "all" ? "All Types" : t}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button key={cat} size="sm" variant={selectedCategory === cat ? "default" : "outline"} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}>
                {cat}
              </Button>
            ))}
          </div>
          {(query || selectedCategory || selectedType !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
              <X className="w-3 h-3 mr-1" /> Clear filters
            </Button>
          )}
        </div>

        {/* Results */}
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} items found</p>
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-muted-foreground">
            <SearchIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No items match your search.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

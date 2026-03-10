import { Navbar } from "@/components/Navbar";
import { mockItems, mockLocations } from "@/lib/mockData";
import { CATEGORIES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Send } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function ReportItem() {
  const navigate = useNavigate();
  const [type, setType] = useState<"lost" | "found">("lost");

  const allLocations = mockLocations.map(l => {
    if (l.type === "room") {
      const parent = mockLocations.find(p => p.id === l.parentId);
      return { ...l, displayName: `${l.name} - ${parent?.name || ""}` };
    }
    return { ...l, displayName: l.name };
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Item reported successfully! It will appear on the dashboard.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Report an Item</h1>
          <p className="text-muted-foreground mb-8">Help someone find their belongings or report what you've lost.</p>

          {/* Type toggle */}
          <div className="flex gap-2 mb-8">
            <Button size="lg" variant={type === "lost" ? "default" : "outline"} onClick={() => setType("lost")} className="flex-1">
              I Lost Something
            </Button>
            <Button size="lg" variant={type === "found" ? "default" : "outline"} onClick={() => setType("found")} className="flex-1">
              I Found Something
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Item Name</Label>
              <Input id="title" placeholder="e.g., Blue Backpack, AirPods, ID Card" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Provide details like color, brand, distinguishing marks..." rows={4} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {allLocations.map(l => <SelectItem key={l.id} value={l.id}>{l.displayName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date {type === "lost" ? "Lost" : "Found"}</Label>
              <Input id="date" type="date" required />
            </div>

            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full gap-2 shadow-md">
              <Send className="w-4 h-4" /> Submit Report
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

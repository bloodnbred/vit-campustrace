import { Navbar } from "@/components/Navbar";
import { CATEGORIES } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Send, Loader2, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface LocationOption {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
  displayName: string;
}

export default function ReportItem() {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [type, setType] = useState<"lost" | "found">("lost");
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast.error("Please sign in to report an item.");
      navigate("/auth");
      return;
    }
    fetchLocations();
  }, [user, authLoading]);

  const fetchLocations = async () => {
    const { data } = await supabase.from("campus_locations").select("*").order("name");
    if (data) {
      const mapped: LocationOption[] = data.map((l: any) => {
        if (l.type === "room") {
          const parent = data.find((p: any) => p.id === l.parent_id);
          return { ...l, displayName: `${l.name} - ${parent?.name || ""}` };
        }
        return { ...l, displayName: l.name };
      });
      setLocations(mapped);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File must be under 5MB");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setLoading(true);

    try {
      let imageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("item-images")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("item-images").getPublicUrl(filePath);
        imageUrl = urlData.publicUrl;
      }

      const location = locations.find(l => l.id === selectedLocationId);
      const form = e.target as HTMLFormElement;
      const title = (form.elements.namedItem("title") as HTMLInputElement).value;
      const description = (form.elements.namedItem("description") as HTMLTextAreaElement).value;
      const date = (form.elements.namedItem("date") as HTMLInputElement).value;

      const { error } = await supabase.from("items").insert({
        title,
        description,
        category: selectedCategory,
        type,
        status: type,
        image_url: imageUrl || null,
        date,
        location_id: selectedLocationId || null,
        location_name: location?.displayName || "Unknown",
        reporter_id: user.id,
        reporter_name: profile.name,
        reporter_phone: profile.phone || "",
      });

      if (error) throw error;
      toast.success("Item reported successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Report an Item</h1>
          <p className="text-muted-foreground mb-8">Help someone find their belongings or report what you've lost.</p>

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
              <Input id="title" name="title" placeholder="e.g., Blue Backpack, AirPods, ID Card" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" placeholder="Provide details like color, brand, distinguishing marks..." rows={4} required />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select value={selectedLocationId} onValueChange={setSelectedLocationId} required>
                  <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                  <SelectContent>
                    {locations.map(l => <SelectItem key={l.id} value={l.id}>{l.displayName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date {type === "lost" ? "Lost" : "Found"}</Label>
              <Input id="date" name="date" type="date" required />
            </div>

            <div className="space-y-2">
              <Label>Upload Image</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-border">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="absolute top-2 right-2 bg-background/80 rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>

            <Button type="submit" size="lg" className="w-full gap-2 shadow-md" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Report
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

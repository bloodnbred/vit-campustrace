import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Search, ArrowRight, Shield, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  { icon: MapPin, title: "Location-Based", description: "Browse items organized by campus blocks, rooms, and custom areas." },
  { icon: Search, title: "Smart Search", description: "Find items instantly with powerful search and category filters." },
  { icon: Shield, title: "Secure Claims", description: "Verified claim system ensures items reach the right owner." },
  { icon: Zap, title: "Real-Time", description: "Get instant updates when someone reports or claims your item." },
  { icon: Users, title: "Community", description: "Built for your campus community, replacing chaotic WhatsApp groups." },
];

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/20" />
        <div className="container mx-auto px-4 pt-20 pb-24 relative">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">CampusTrace</span>
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight mb-4 sm:mb-6">
              Smart Campus<br /><span className="text-primary">Lost & Found</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Stop scrolling through endless WhatsApp messages. Report, search, and recover lost items across your campus with ease.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to={user ? "/dashboard" : "/auth"}>
                <Button size="lg" className="gap-2 shadow-lg">
                  {user ? "Go to Dashboard" : "Get Started"} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="gap-2"><MapPin className="w-4 h-4" /> Browse Items</Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">Why CampusTrace?</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mx-auto mb-4">
                  <f.icon className="w-6 h-6 text-accent-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-2 text-card-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 CampusTrace — Smart Campus Lost & Found System</p>
        </div>
      </footer>
    </div>
  );
}

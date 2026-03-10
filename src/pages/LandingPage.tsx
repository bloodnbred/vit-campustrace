import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Search, ArrowRight, Shield, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";
import { mockItems } from "@/lib/mockData";
import { ItemCard } from "@/components/ItemCard";

const features = [
  { icon: MapPin, title: "Location-Based", description: "Browse items organized by campus blocks, rooms, and custom areas." },
  { icon: Search, title: "Smart Search", description: "Find items instantly with powerful search and category filters." },
  { icon: Shield, title: "Secure Claims", description: "Verified claim system ensures items reach the right owner." },
  { icon: Zap, title: "Real-Time", description: "Get instant updates when someone reports or claims your item." },
  { icon: Users, title: "Community", description: "Built for your campus community, replacing chaotic WhatsApp groups." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/20" />
        <div className="container mx-auto px-4 pt-20 pb-24 relative">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">CampusTrace</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Smart Campus<br />
              <span className="text-primary">Lost & Found</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              Stop scrolling through endless WhatsApp messages. Report, search, and recover lost items across your campus with ease.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 shadow-lg">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="gap-2">
                  <MapPin className="w-4 h-4" /> Browse Items
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-3 gap-6 mt-16 max-w-md"
          >
            {[
              { value: "150+", label: "Items Recovered" },
              { value: "500+", label: "Active Users" },
              { value: "20+", label: "Campus Locations" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-foreground">
            Why CampusTrace?
          </h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 text-center"
              >
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

      {/* Recent items */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-foreground">Recent Reports</h2>
            <Link to="/search">
              <Button variant="ghost" className="gap-1">View All <ArrowRight className="w-4 h-4" /></Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockItems.slice(0, 3).map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2026 CampusTrace — Smart Campus Lost & Found System</p>
        </div>
      </footer>
    </div>
  );
}

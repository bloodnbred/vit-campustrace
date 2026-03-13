import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, Plus, LayoutDashboard, Shield, LogOut, Menu, X, LogIn, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/browse", label: "Browse", icon: MapPin },
    { to: "/search", label: "Search", icon: Search },
    { to: "/report", label: "Report Item", icon: Plus },
    ...(isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">CampusTrace</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.to} to={item.to}>
                <Button
                  variant={location.pathname === item.to ? "default" : "ghost"}
                  size="sm"
                  className={cn("gap-2 text-sm", location.pathname === item.to && "shadow-sm")}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
            {user ? (
              <Button variant="ghost" size="sm" className="gap-2 text-sm ml-2" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                {profile?.name || "Sign Out"}
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="gap-2 text-sm ml-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border overflow-hidden bg-card"
          >
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}>
                  <Button variant={location.pathname === item.to ? "default" : "ghost"} className="w-full justify-start gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
              {user ? (
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

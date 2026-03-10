import { Item } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { MapPin, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export function ItemCard({ item, index = 0 }: { item: Item; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={`/items/${item.id}`} className="block">
        <div className="glass-card overflow-hidden group cursor-pointer">
          <div className="relative h-48 overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-3 left-3">
              <StatusBadge status={item.status} />
            </div>
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-display font-semibold text-card-foreground truncate">{item.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.locationName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

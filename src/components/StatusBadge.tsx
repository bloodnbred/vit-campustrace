import { ItemStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<ItemStatus, { label: string; className: string }> = {
  lost: { label: "Lost", className: "status-lost border" },
  found: { label: "Found", className: "status-found border" },
  claimed: { label: "Claimed", className: "status-claimed border" },
  returned: { label: "Returned", className: "status-returned border" },
};

export function StatusBadge({ status, className }: { status: ItemStatus; className?: string }) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn("font-semibold text-xs px-2.5 py-0.5", config.className, className)}>
      {config.label}
    </Badge>
  );
}

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant: "blue" | "green" | "purple" | "coral";
}

const variantStyles = {
  blue: "bg-kpi-blue",
  green: "bg-kpi-green",
  purple: "bg-kpi-purple",
  coral: "bg-kpi-coral",
};

const iconStyles = {
  blue: "text-blue-600",
  green: "text-emerald-600",
  purple: "text-purple-600",
  coral: "text-orange-600",
};

export function KPICard({ title, value, icon: Icon, variant }: KPICardProps) {
  return (
    <div className="group animate-fade-in rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className={cn("rounded-xl p-3", variantStyles[variant])}>
          <Icon className={cn("h-6 w-6", iconStyles[variant])} />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className="text-3xl font-bold text-foreground">{value}</span>
        </div>
      </div>
    </div>
  );
}

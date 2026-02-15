import { cn } from "@/lib/utils";

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  material: string;
  date: string;
}

interface AlertCardProps {
  alert: Alert;
}

const alertStyles = {
  critical: {
    border: "border-l-4 border-l-alert-critical",
    bg: "bg-alert-critical-bg",
  },
  warning: {
    border: "border-l-4 border-l-alert-warning",
    bg: "bg-alert-warning-bg",
  },
  info: {
    border: "border-l-4 border-l-alert-info",
    bg: "bg-alert-info-bg",
  },
};

export function AlertCard({ alert }: AlertCardProps) {
  const styles = alertStyles[alert.type];

  return (
    <div
      className={cn(
        "animate-slide-in rounded-lg p-4 transition-all duration-200 hover:shadow-md",
        styles.border,
        styles.bg
      )}
    >
      <div className="flex items-start justify-between">
        <h4 className="font-semibold text-foreground">{alert.title}</h4>
        <span className="text-xs text-muted-foreground">{alert.date}</span>
      </div>
      <p className="mt-1 text-sm text-foreground/80">{alert.message}</p>
      <p className="mt-2 text-xs text-muted-foreground">Material: {alert.material}</p>
    </div>
  );
}

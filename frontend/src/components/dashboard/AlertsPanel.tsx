import { AlertCard, Alert } from "./AlertCard";

const mockAlerts: Alert[] = [
  {
    id: "1",
    type: "critical",
    title: "Model Drift",
    message: "Steel Pipes demand model requires retraining due to pattern drift",
    material: "Steel Pipes",
    date: "Oct 6, 2025",
  },
  {
    id: "2",
    type: "critical",
    title: "Stockout Risk",
    message: "Critical inventory levels for Aluminum Sheets at Chennai plant",
    material: "Aluminum Sheets",
    date: "Oct 6, 2025",
  },
  {
    id: "3",
    type: "warning",
    title: "Supplier Delay",
    message: "Copper Wire supplier reporting 3-day delivery delay",
    material: "Copper Wire",
    date: "Oct 5, 2025",
  },
  {
    id: "4",
    type: "info",
    title: "Forecast Updated",
    message: "Weekly forecast model successfully retrained with new data",
    material: "All Materials",
    date: "Oct 4, 2025",
  },
];

export function AlertsPanel() {
  return (
    <div className="animate-fade-in rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Active Alerts</h3>
        <span className="rounded-full bg-alert-critical-bg px-2 py-1 text-xs font-medium text-alert-critical">
          {mockAlerts.filter((a) => a.type === "critical").length} Critical
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {mockAlerts.slice(0, 4).map((alert) => (
          <AlertCard key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}

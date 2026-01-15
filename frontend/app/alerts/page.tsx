import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const alerts = [
  {
    id: 1,
    type: "critical",
    title: "Stockout Risk Detected",
    message: "Steel 304 at Plant A is predicted to stock out in 2 weeks. Immediate reorder recommended.",
    date: "2 hours ago",
    material: "Steel 304",
  },
  {
    id: 2,
    type: "warning",
    title: "Demand Spike Anomalies",
    message: "Unusual demand spike detected for Aluminum 6061. Deviation > 20% from baseline.",
    date: "5 hours ago",
    material: "Aluminum 6061",
  },
  {
    id: 3,
    type: "info",
    title: "New Forecast Available",
    message: "Automated weekly forecast for Copper Wire has been generated.",
    date: "1 day ago",
    material: "Copper Wire",
  },
  {
    id: 4,
    type: "success",
    title: "Reorder Successful",
    message: "Order #4421 for Plastic Pellets has been processed.",
    date: "2 days ago",
    material: "Plastic Pellets",
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "critical": return <AlertTriangle className="h-5 w-5 text-red-600" />;
    case "warning": return <AlertCircle className="h-5 w-5 text-amber-500" />;
    case "success": return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    default: return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getBorderColor = (type: string) => {
  switch (type) {
    case "critical": return "border-l-red-500";
    case "warning": return "border-l-amber-500";
    case "success": return "border-l-green-500";
    default: return "border-l-blue-500";
  }
};

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Alerts & Notifications</h1>
      </div>

      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className={`border-l-4 ${getBorderColor(alert.type)}`}>
            <CardContent className="flex items-start gap-4 p-6">
              <div className="mt-1">
                {getIcon(alert.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                   <p className="font-semibold">{alert.title}</p>
                   <span className="text-xs text-muted-foreground">{alert.date}</span>
                </div>
                <p className="text-sm text-muted-foreground">{alert.message}</p>
                <div className="mt-2 flex items-center gap-2">
                   <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                      {alert.material}
                   </span>
                   <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 capitalize">
                      {alert.type}
                   </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

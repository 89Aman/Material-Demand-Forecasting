import { useState, useEffect } from "react";
import { AlertCard, Alert } from "@/components/dashboard/AlertCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Filter, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [materialFilter, setMaterialFilter] = useState<string>("all");

  useEffect(() => {
    async function loadAlerts() {
      try {
        const lowStock = await apiFetch("/inventory/low_stock_alert/");
        const formattedAlerts: Alert[] = lowStock.map((item: any) => ({
          id: `low-stock-${item.id}`,
          type: "critical",
          title: "Low Stock Alert",
          message: `Inventory for ${item.product_name} is at ${item.current_stock}, which is below the minimum level of ${item.minimum_stock_level}.`,
          material: item.product_name,
          date: new Date().toLocaleDateString(),
        }));
        
        // Add some info alerts if no low stock to make it look alive
        if (formattedAlerts.length === 0) {
            formattedAlerts.push({
                id: "info-1",
                type: "info",
                title: "System Ready",
                message: "Demand forecasting system is operational and ready for analysis.",
                material: "System",
                date: new Date().toLocaleDateString(),
            });
        }

        setAlerts(formattedAlerts);
      } catch (error) {
        console.error("Failed to load alerts:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAlerts();
  }, []);

  const materials = [...new Set(alerts.map((a) => a.material))];

  const filteredAlerts = alerts.filter((alert) => {
    if (severityFilter !== "all" && alert.type !== severityFilter) return false;
    if (materialFilter !== "all" && alert.material !== materialFilter) return false;
    return true;
  });

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <Bell className="h-8 w-8 text-primary" />
            Alerts
          </h1>
          <p className="text-muted-foreground">Monitor supply chain notifications and warnings</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-alert-critical-bg px-3 py-1 text-sm font-medium text-alert-critical">
            {alerts.filter((a) => a.type === "critical").length} Critical
          </span>
          <span className="rounded-full bg-alert-warning-bg px-3 py-1 text-sm font-medium text-alert-warning">
            {alerts.filter((a) => a.type === "warning").length} Warning
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>
        <Select value={materialFilter} onValueChange={setMaterialFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Materials</SelectItem>
            {materials.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(severityFilter !== "all" || materialFilter !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSeverityFilter("all");
              setMaterialFilter("all");
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Alert List */}
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
            <div className="col-span-2 py-12 flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        ) : (
            filteredAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
            ))
        )}
      </div>

      {!isLoading && filteredAlerts.length === 0 && (
        <div className="rounded-lg border bg-card p-12 text-center">
          <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No alerts match your filters</p>
          <p className="text-muted-foreground">Try adjusting your filter criteria</p>
        </div>
      )}
    </div>
  );
}
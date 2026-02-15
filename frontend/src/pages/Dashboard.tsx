import { useState, useEffect } from "react";
import { BarChart3, Target, TrendingUp, AlertTriangle, Loader2 } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { apiFetch } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    activeForecasts: 0,
    accuracy: "0%",
    totalPredictions: 0,
    activeAlerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [report, lowStock, forecasts] = await Promise.all([
          apiFetch("/forecasts/accuracy_report/"),
          apiFetch("/inventory/low_stock_alert/"),
          apiFetch("/forecasts/"),
        ]);

        const forecastList = Array.isArray(forecasts) ? forecasts : forecasts.results || [];

        setStats({
          activeForecasts: report.total_forecasts || 0,
          accuracy: report.avg_accuracy ? `${Math.round(report.avg_accuracy)}%` : "N/A",
          totalPredictions: forecastList.length,
          activeAlerts: lowStock.length,
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="container py-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Supply chain demand forecasting overview</p>
        </div>
        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
      </div>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Forecasts"
          value={stats.activeForecasts}
          icon={BarChart3}
          variant="blue"
        />
        <KPICard
          title="Avg Accuracy"
          value={stats.accuracy}
          icon={Target}
          variant="green"
        />
        <KPICard
          title="History Count"
          value={stats.totalPredictions}
          icon={TrendingUp}
          variant="purple"
        />
        <KPICard
          title="Low Stock Alerts"
          value={stats.activeAlerts}
          icon={AlertTriangle}
          variant="coral"
        />
      </div>

      {/* Chart and Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ForecastChart />
        </div>
        <div className="lg:col-span-1">
          <AlertsPanel />
        </div>
      </div>

      {/* Quick Action */}
      <div className="mt-8 flex justify-center">
        <Link to="/forecast">
          <Button size="lg" className="gap-2">
            <TrendingUp className="h-5 w-5" />
            Create New Forecast
          </Button>
        </Link>
      </div>
    </div>
  );
}
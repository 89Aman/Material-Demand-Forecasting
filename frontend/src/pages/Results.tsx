import { useLocation, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Download, TrendingUp, Package, Calendar, AlertTriangle, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ForecastChart } from "@/components/dashboard/ForecastChart";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state?.formData;
  const resultData = location.state?.result;
  const forecastId = location.state?.forecastId;

  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (forecastId) {
      setIsLoading(true);
      async function loadForecast() {
        try {
          const data = await apiFetch(`/forecasts/${forecastId}/`);
          setForecast(data);
        } catch (error) {
          console.error("Failed to load forecast:", error);
          toast.error("Failed to load forecast details");
        } finally {
          setIsLoading(false);
        }
      }
      loadForecast();
    } else if (resultData) {
      if (resultData.created_forecasts && resultData.created_forecasts.length > 0) {
        const id = resultData.created_forecasts[0];
        setIsLoading(true);
        async function loadNewForecast() {
          try {
            const data = await apiFetch(`/forecasts/${id}/`);
            setForecast(data);
          } catch (error) {
            console.error("Failed to load new forecast:", error);
            toast.error("Failed to load forecast details");
          } finally {
            setIsLoading(false);
          }
        }
        loadNewForecast();
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [forecastId, resultData]);

  if (!isLoading && !formData && !forecast) {
    return (
      <div className="container py-16 text-center">
        <h2 className="mb-4 text-2xl font-bold">No forecast data available</h2>
        <p className="mb-8 text-muted-foreground">Please generate a new forecast first</p>
        <Link to="/forecast">
          <Button>Create New Forecast</Button>
        </Link>
      </div>
    );
  }

  const handleExport = (format: string) => {
    if (!forecast || !forecast.details) {
      toast.error("No forecast data to export");
      return;
    }

    if (format === "CSV") {
      const headers = ["Date", "Predicted Quantity", "Lower Bound", "Upper Bound"];
      const rows = forecast.details.map((d: any) => [
        d.forecast_date,
        d.predicted_quantity,
        d.lower_bound,
        d.upper_bound
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row: any) => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `forecast_${forecast.product_name}_${forecast.forecast_date}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV export started");
    } else {
      toast.success(`Exporting forecast as ${format}... (Functionality coming soon)`);
    }
  };

  const handleSave = () => {
    toast.success("Forecast saved to history!");
    navigate("/history");
  };

  // Compute totals from detail records as fallback when predicted_demand is 0
  const computedDemand = forecast?.details?.reduce(
    (sum: number, d: any) => sum + (d.predicted_quantity || 0), 0
  ) || 0;
  const computedLower = forecast?.details?.reduce(
    (sum: number, d: any) => sum + (d.lower_bound || 0), 0
  ) || 0;
  const computedUpper = forecast?.details?.reduce(
    (sum: number, d: any) => sum + (d.upper_bound || 0), 0
  ) || 0;

  const displayData = forecast ? {
    ...forecast,
    // Use stored value if non-zero, otherwise compute from details
    predicted_demand: forecast.predicted_demand > 0 ? forecast.predicted_demand : computedDemand,
    confidence_interval_lower: forecast.confidence_interval_lower > 0 ? forecast.confidence_interval_lower : computedLower,
    confidence_interval_upper: forecast.confidence_interval_upper > 0 ? forecast.confidence_interval_upper : computedUpper,
  } : {
    product_name: formData?.material,
    forecast_horizon_days: (formData?.horizon || 0) * 7,
    predicted_demand: 0,
    accuracy_score: null,
  };

  return (
    <div className="container py-8">
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading forecast details...</p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Forecast Results</h1>
              <p className="text-muted-foreground">
                {displayData.product_name} · {formData?.location || 'Global'} · {Math.round(displayData.forecast_horizon_days / 7)} weeks
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("PDF")}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("CSV")}>
                <Download className="mr-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>

          {/* Chart */}
          <div className="mb-8">
            <ForecastChart forecastId={forecast?.id} />
          </div>

          {/* Recommendations and Risks */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Procurement Recommendations */}
            <div className="animate-fade-in rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5 text-primary" />
                Forecast Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total Predicted Demand</span>
                  <span className="font-semibold">{Math.round(displayData.predicted_demand).toLocaleString()} units</span>
                </div>
                {displayData.confidence_interval_lower != null && displayData.confidence_interval_upper != null && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">Confidence Range</span>
                    <span className="font-semibold text-sm">{Math.round(displayData.confidence_interval_lower).toLocaleString()} – {Math.round(displayData.confidence_interval_upper).toLocaleString()} units</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Model Accuracy</span>
                  <span className="font-semibold">{displayData.accuracy_score ? `${displayData.accuracy_score}%` : 'Pending'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Algorithm Used</span>
                  <span className="font-semibold capitalize">{displayData.algorithm || 'Ensemble'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Status</span>
                  <span className={`font-semibold capitalize ${displayData.status === 'failed' ? 'text-destructive' : 'text-green-600'}`}>
                    {displayData.status || 'Completed'}
                  </span>
                </div>
                {displayData.error_message && (
                  <div className="p-2 bg-destructive/10 text-destructive rounded text-sm">
                    {displayData.error_message}
                  </div>
                )}
              </div>
            </div>

            {/* Risk Assessment (Keep Mock for now as Backend doesn't provide specific risk scores yet) */}
            <div className="animate-fade-in rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="h-5 w-5 text-alert-warning" />
                Risk Assessment
              </h3>
              <div className="space-y-6">
                {/* Stockout Risk */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stockout Risk</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-alert-critical transition-all duration-500"
                      style={{ width: `15%` }}
                    />
                  </div>
                </div>

                {/* Overstock Risk */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overstock Risk</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-alert-warning transition-all duration-500"
                      style={{ width: `8%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/forecast">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                New Forecast
              </Button>
            </Link>
            <Button onClick={handleSave} className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Go to History
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
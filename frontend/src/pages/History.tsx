import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { History as HistoryIcon, Eye, TrendingUp, Calendar, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";

interface ForecastRecord {
  id: number;
  forecast_date: string;
  product_name: string;
  algorithm: string;
  forecast_horizon_days: number;
  predicted_demand: number;
  accuracy_score: number | null;
}

export default function History() {
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState<ForecastRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await apiFetch("/forecasts/");
        const results = Array.isArray(data) ? data : data.results || [];
        setHistory(results);
      } catch (error) {
        console.error("Failed to load history:", error);
        toast.error("Failed to load forecast history");
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, []);

  const filteredHistory = history.filter(
    (record) =>
      record.product_name?.toLowerCase().includes(search.toLowerCase()) ||
      record.algorithm?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <HistoryIcon className="h-8 w-8 text-primary" />
            Forecast History
          </h1>
          <p className="text-muted-foreground">Review past forecasts and their accuracy</p>
        </div>
        <Link to="/forecast">
          <Button className="gap-2">
            <TrendingUp className="h-4 w-4" />
            New Forecast
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6 flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by material..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="animate-fade-in rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date
                </div>
              </TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Algorithm</TableHead>
              <TableHead className="text-center">Horizon</TableHead>
              <TableHead className="text-right">Expected Demand</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                 </TableCell>
               </TableRow>
            ) : filteredHistory.map((record) => (
              <TableRow key={record.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">{new Date(record.forecast_date).toLocaleDateString()}</TableCell>
                <TableCell>{record.product_name}</TableCell>
                <TableCell className="capitalize">{record.algorithm}</TableCell>
                <TableCell className="text-center">{Math.round(record.forecast_horizon_days / 7)} weeks</TableCell>
                <TableCell className="text-right">{record.predicted_demand.toLocaleString()} units</TableCell>
                <TableCell className="text-right">
                  <span
                    className={`rounded-full px-2 py-1 text-sm font-medium ${
                      (record.accuracy_score || 0) >= 90
                        ? "bg-kpi-green text-emerald-700"
                        : (record.accuracy_score || 0) >= 85
                        ? "bg-alert-warning-bg text-alert-warning"
                        : "bg-alert-critical-bg text-alert-critical"
                    }`}
                  >
                    {record.accuracy_score ? `${record.accuracy_score}%` : 'N/A'}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Link
                    to="/results"
                    state={{
                      forecastId: record.id,
                      formData: {
                        material: record.product_name,
                        location: "N/A",
                        horizon: Math.round(record.forecast_horizon_days / 7),
                        scenario: "baseline",
                      },
                    }}
                  >
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && filteredHistory.length === 0 && (
        <div className="mt-4 rounded-lg border bg-card p-12 text-center">
          <HistoryIcon className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium">No forecasts found</p>
          <p className="text-muted-foreground">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
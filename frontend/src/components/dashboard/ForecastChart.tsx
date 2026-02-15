import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Legend,
} from "recharts";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface ChartDataPoint {
  week: string;
  demand: number;
  lower: number;
  upper: number;
}

interface ForecastChartProps {
    forecastId?: string;
}

export function ForecastChart({ forecastId }: ForecastChartProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChartData() {
        setIsLoading(true);
        try {
            let endpoint = "/forecasts/";
            if (forecastId) {
                endpoint = `/forecasts/${forecastId}/`;
            }

            const forecastData = await apiFetch(endpoint);
            
            // If multiple forecasts, pick the first one (for dashboard)
            const targetForecast = Array.isArray(forecastData) 
                ? forecastData[0] 
                : (forecastData.results ? forecastData.results[0] : forecastData);

            if (targetForecast && targetForecast.details) {
                const chartPoints = targetForecast.details.map((detail: any, index: number) => ({
                    week: `Day ${index + 1}`,
                    demand: detail.predicted_quantity,
                    lower: detail.lower_bound,
                    upper: detail.upper_bound
                }));
                setData(chartPoints);
            }
        } catch (error) {
            console.error("Failed to load chart data:", error);
        } finally {
            setIsLoading(false);
        }
    }
    loadChartData();
  }, [forecastId]);

  if (isLoading) {
      return (
          <div className="h-[400px] flex items-center justify-center border rounded-xl bg-card">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  if (data.length === 0) {
      return (
          <div className="h-[400px] flex items-center justify-center border rounded-xl bg-card text-muted-foreground">
              No forecast data available for chart
          </div>
      );
  }

  return (
    <div className="animate-fade-in rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Forecast Trends</h3>
        <p className="text-sm text-muted-foreground">8-week demand projection with confidence bands</p>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 60%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(174, 60%, 50%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis
              dataKey="week"
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
              tickLine={false}
              label={{ value: "Time Period", position: "bottom", offset: -5, fill: "hsl(215, 16%, 47%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
              tickLine={false}
              label={{ value: "Demand (Units)", angle: -90, position: "insideLeft", fill: "hsl(215, 16%, 47%)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(214, 32%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "hsl(222, 47%, 11%)", fontWeight: 600 }}
            />
            <Area
              type="monotone"
              dataKey="upper"
              stroke="transparent"
              fill="url(#confidenceGradient)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="lower"
              stroke="transparent"
              fill="hsl(0, 0%, 100%)"
              fillOpacity={1}
            />
            <Line
              type="monotone"
              dataKey="demand"
              stroke="hsl(174, 84%, 32%)"
              strokeWidth={3}
              dot={{ fill: "hsl(174, 84%, 32%)", strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, fill: "hsl(174, 84%, 25%)" }}
              name="Predicted Demand"
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

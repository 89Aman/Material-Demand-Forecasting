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
  date: string;
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
          const chartPoints = targetForecast.details.map((detail: any, index: number) => {
            // Use actual forecast_date if available, otherwise fallback
            let label = `Day ${index + 1}`;
            if (detail.forecast_date) {
              const d = new Date(detail.forecast_date);
              label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return {
              week: label,
              date: detail.forecast_date || '',
              demand: Math.round(detail.predicted_quantity * 100) / 100,
              lower: Math.round(detail.lower_bound * 100) / 100,
              upper: Math.round(detail.upper_bound * 100) / 100,
            };
          });
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
        <p className="text-sm text-muted-foreground">
          {data.length}-day demand projection with confidence bands
          {data.length >= 7 && ` (~${Math.round(data.length / 7)} week${Math.round(data.length / 7) !== 1 ? 's' : ''})`}
        </p>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 50 }}>
            <defs>
              <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(174, 60%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(174, 60%, 50%)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
            <XAxis
              dataKey="week"
              tick={(props: any) => {
                const { x, y, payload } = props;
                const shouldRotate = data.length > 14;
                return (
                  <text
                    x={x}
                    y={y + 10}
                    fill="hsl(215, 16%, 47%)"
                    fontSize={11}
                    textAnchor={shouldRotate ? 'end' : 'middle'}
                    transform={shouldRotate ? `rotate(-45, ${x}, ${y + 10})` : undefined}
                  >
                    {payload.value}
                  </text>
                );
              }}
              axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
              tickLine={false}
              interval={data.length > 30 ? Math.floor(data.length / 10) : data.length > 14 ? 1 : 0}
              label={{ value: "Time Period", position: "insideBottom", offset: -15, fill: "hsl(215, 16%, 47%)" }}
            />
            <YAxis
              tick={{ fill: "hsl(215, 16%, 47%)", fontSize: 12 }}
              axisLine={{ stroke: "hsl(214, 32%, 91%)" }}
              tickLine={false}
              width={65}
              label={{ value: "Predicted Demand", angle: -90, position: "insideLeft", offset: 5, fill: "hsl(215, 16%, 47%)", fontSize: 13, fontWeight: 600 }}
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
            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

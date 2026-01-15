'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart
} from 'recharts';

// Generate mock data
const generateData = (horizon: number) => {
  const data = [];
  let baseDemand = 1000;
  for (let i = 0; i < horizon; i++) {
    const week = `Week ${i + 1}`;
    // Random fluctuation
    const fluctuation = Math.floor(Math.random() * 200) - 100;
    const trend = i * 10;
    const forecast = baseDemand + trend + fluctuation;
    
    // Confidence intervals
    const upper = forecast + 150 + (i * 5);
    const lower = forecast - 150 - (i * 5);
    
    data.push({
      name: week,
      forecast,
      upper,
      lower,
      // For the area chart, we need a range, but Recharts Area accepts a single dataKey or we can stack.
      // A common trick for confidence bands is to use an Area with a range [lower, upper]
      // stored as an array in the data point, e.g. [lower, upper]
      range: [lower, upper]
    });
  }
  return data;
};

interface ForecastChartProps {
  horizon: number;
}

export default function ForecastChart({ horizon }: ForecastChartProps) {
  const data = generateData(horizon);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        
        {/* Confidence Interval Area */}
        <Area
          type="monotone"
          dataKey="range"
          stroke="none"
          fill="#93c5fd" // blue-300
          fillOpacity={0.3}
          name="Confidence Interval"
        />
        
        {/* Main Forecast Line */}
        <Line
          type="monotone"
          dataKey="forecast"
          stroke="#2563eb" // blue-600
          strokeWidth={3}
          activeDot={{ r: 8 }}
          name="Predicted Demand"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

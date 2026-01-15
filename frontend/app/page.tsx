'use client';

import { BarChart3, Target, TrendingUp, AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import ForecastChart from '@/components/ForecastChart';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-lg">Supply chain demand forecasting overview</p>
      </div>
      
      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-md">
          <CardContent className="flex items-center p-6 gap-4">
            <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900/30">
               <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Forecasts</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">18</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="flex items-center p-6 gap-4">
            <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900/30">
               <Target className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Model Accuracy</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">89.2%</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
           <CardContent className="flex items-center p-6 gap-4">
            <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900/30">
               <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Monthly Predictions</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">67</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
           <CardContent className="flex items-center p-6 gap-4">
            <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900/30">
               <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Alerts</p>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-50">5</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chart Section (2/3) */}
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-xl">Forecast Trends</CardTitle>
            <CardDescription className="text-slate-500">
              8-week demand projection with confidence bands
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[400px] w-full mt-4">
               <ForecastChart horizon={8} />
            </div>
          </CardContent>
        </Card>
        
        {/* Active Alerts Section (1/3) */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-4">Active Alerts</h2>
          
          {/* Critical Alert */}
          <div className="p-4 rounded-xl bg-red-50 border-l-4 border-red-500 dark:bg-red-950/20">
            <div className="flex justify-between items-start mb-2">
               <h4 className="font-bold text-red-900 dark:text-red-300">Model Drift</h4>
               <span className="text-xs text-red-700 dark:text-red-400">Oct 6, 2025</span>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200 mb-3">
              Steel Pipes demand model requires retraining due to pattern drift
            </p>
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Material: Steel Pipes</span>
          </div>

          {/* High Priority Alert with Badge */}
          <div className="p-4 rounded-xl bg-pink-50 border-l-4 border-pink-500 dark:bg-pink-950/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">LIVE</div>
             <div className="flex justify-between items-start mb-2 mt-1">
               <h4 className="font-bold text-pink-900 dark:text-pink-300">Stockout Risk</h4>
               <span className="text-xs text-pink-700 dark:text-pink-400 mr-8">Oct 6, 2025</span>
            </div>
             <p className="text-sm text-pink-800 dark:text-pink-200 mb-3">
              Critical inventory levels for Aluminum Sheets at Chennai plant
            </p>
            <span className="text-xs font-medium text-pink-600 dark:text-pink-400">Material: Aluminum Sheets</span>
          </div>

           {/* Warning Alert */}
           <div className="p-4 rounded-xl bg-amber-50 border-l-4 border-amber-500 dark:bg-amber-950/20">
            <div className="flex justify-between items-start mb-2">
               <h4 className="font-bold text-amber-900 dark:text-amber-300">Supplier Delay</h4>
               <span className="text-xs text-amber-700 dark:text-amber-400">Oct 5, 2025</span>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              Copper Wire supplier reporting 3-day delivery delay
            </p>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">Material: Copper Wire</span>
          </div>
        </div>
      </div>
    </div>
  );
}

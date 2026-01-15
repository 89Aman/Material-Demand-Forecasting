import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import ForecastChart from '@/components/ForecastChart';
import { Download, Save, ArrowLeft } from 'lucide-react';

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const material = searchParams.material as string || 'Unknown Material';
  const location = searchParams.location as string || 'Unknown Location';
  const horizon = parseInt(searchParams.horizon as string || '12', 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Forecast Results</h1>
          <p className="text-muted-foreground">
            Analysis for <span className="font-semibold text-foreground">{material}</span> at {location}
          </p>
        </div>
        <div className="flex items-center gap-2">
           <Link href="/forecast/new">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              New Forecast
            </Button>
          </Link>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Forecast
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Chart Section */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Demand Forecast ({horizon} Weeks)</CardTitle>
            <CardDescription>
              Predicted demand with 95% confidence intervals.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <ForecastChart horizon={horizon} />
          </CardContent>
        </Card>

        {/* Procurement Recommendations */}
        <div className="space-y-6">
          <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-400">Procurement Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center border-b border-blue-100 pb-2 dark:border-blue-900">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Reorder Point</span>
                <span className="text-lg font-bold">1,250 units</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-100 pb-2 dark:border-blue-900">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Safety Stock</span>
                <span className="text-lg font-bold">450 units</span>
              </div>
              <div className="flex justify-between items-center border-b border-blue-100 pb-2 dark:border-blue-900">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Order Quantity</span>
                <span className="text-lg font-bold text-green-600">3,000 units</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Next Order Date</span>
                <span className="text-lg font-bold">Feb 14, 2026</span>
              </div>
            </CardContent>
          </Card>

          <Card>
             <CardHeader>
              <CardTitle>Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                   <span>Stockout Risk</span>
                   <span className="text-red-500 font-bold">High (12%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-red-500 w-[12%]"></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                   <span>Overstock Risk</span>
                   <span className="text-green-500 font-bold">Low (2%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500 w-[2%]"></div>
                </div>
              </div>

               <div>
                <div className="flex justify-between mb-1 text-sm">
                   <span>Demand Volatility</span>
                   <span className="text-yellow-500 font-bold">Medium</span>
                </div>
                 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                   <div className="h-full bg-yellow-500 w-[45%]"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

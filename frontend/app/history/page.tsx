import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Eye, ArrowRight } from "lucide-react";

const historyData = [
  { id: 101, date: "2026-01-14", material: "Steel 304", location: "Plant A", horizon: "12 Weeks", demand: "12,400" },
  { id: 102, date: "2026-01-14", material: "Aluminum 6061", location: "Plant B", horizon: "8 Weeks", demand: "8,200" },
  { id: 103, date: "2026-01-13", material: "Copper Wire", location: "Plant A", horizon: "4 Weeks", demand: "3,150" },
  { id: 104, date: "2026-01-10", material: "Plastic Pellets", location: "Warehouse C", horizon: "24 Weeks", demand: "45,000" },
  { id: 105, date: "2026-01-08", material: "Steel 304", location: "Plant B", horizon: "12 Weeks", demand: "11,800" },
];

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Forecast History</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Forecasts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm text-left">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Date</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Material</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Location</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Horizon</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground">Est. Demand</th>
                  <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {historyData.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50">
                    <td className="p-4 align-middle">{row.date}</td>
                    <td className="p-4 align-middle font-medium">{row.material}</td>
                    <td className="p-4 align-middle">{row.location}</td>
                    <td className="p-4 align-middle">{row.horizon}</td>
                    <td className="p-4 align-middle">{row.demand}</td>
                    <td className="p-4 align-middle text-right">
                       <Link href={`/forecast/results?material=${row.material}&location=${row.location}&horizon=${row.horizon.split(' ')[0]}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

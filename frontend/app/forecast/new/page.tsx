'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Loader2 } from 'lucide-react';

const materials = [
  { id: 'mat-1', name: 'Steel 304' },
  { id: 'mat-2', name: 'Aluminum 6061' },
  { id: 'mat-3', name: 'Copper Wire' },
  { id: 'mat-4', name: 'Plastic Pellets' },
];

const locations = [
  { id: 'loc-1', name: 'Plant A - New York' },
  { id: 'loc-2', name: 'Plant B - Texas' },
  { id: 'loc-3', name: 'Warehouse C - California' },
];

export default function NewForecastPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    material: '',
    location: '',
    horizon: 12, // default 12 weeks
    scenario: 'normal',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // In a real app, we'd pass the ID or data via state management or URL params
      // For now, we'll just query param the material to the results page for demo
      const query = new URLSearchParams({
        material: formData.material,
        location: formData.location,
        horizon: formData.horizon.toString(),
      }).toString();
      
      router.push(`/forecast/results?${query}`);
    }, 2000);
  };

  return (
    <div className="flex justify-center items-start min-h-[80vh] pt-10">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Generate New Forecast</CardTitle>
          <CardDescription>
            Select material and parameters to run the ML demand forecasting model.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Select
                id="material"
                name="material"
                required
                value={formData.material}
                onChange={handleChange}
              >
                <option value="" disabled>Select a material</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.name}>{m.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location / Plant</Label>
              <Select
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
              >
                <option value="" disabled>Select a location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horizon">Forecast Horizon (Weeks): {formData.horizon}</Label>
              <Input
                id="horizon"
                name="horizon"
                type="range"
                min="4"
                max="52"
                step="1"
                value={formData.horizon}
                onChange={handleChange}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>4 Weeks</span>
                <span>52 Weeks</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="scenario">Scenario</Label>
              <Select
                id="scenario"
                name="scenario"
                value={formData.scenario}
                onChange={handleChange}
              >
                <option value="normal">Normal (Baseline)</option>
                <option value="best_case">Best Case (High Demand)</option>
                <option value="worst_case">Worst Case (Low Demand)</option>
                <option value="promotion">Upcoming Promotion</option>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Running ML Model...
                </>
              ) : (
                'Generate Forecast'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

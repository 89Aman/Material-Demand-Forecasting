import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface Product {
  id: string;
  name: string;
}

const locations = [
  "Chennai Plant",
  "Mumbai Warehouse",
  "Delhi Distribution",
  "Bangalore Factory",
  "Hyderabad Hub",
];

const scenarios = [
  { value: "baseline", label: "Baseline" },
  { value: "optimistic", label: "Optimistic (High demand)" },
  { value: "pessimistic", label: "Pessimistic (Low demand)" },
  { value: "promotional", label: "Promotional Period" },
];

export default function NewForecast() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsError, setProductsError] = useState(false);
  const [formData, setFormData] = useState({
    materialId: "",
    location: "",
    horizon: 8,
    scenario: "baseline",
  });

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await apiFetch("/products/");
        // Check if pagination is used (results array) or direct list
        const productList = Array.isArray(data) ? data : data.results || [];
        setProducts(productList);
        setProductsError(false);
      } catch (error) {
        console.error("Failed to load products:", error);
        toast.error("Failed to load products. Is the backend running?");
        setProductsError(true);
      }
    }
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.materialId || !formData.location) {
      toast.error("Please select both material and location");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiFetch("/forecasts/generate/", {
        method: "POST",
        body: JSON.stringify({
          algorithm: "ensemble",
          forecast_horizon_days: formData.horizon * 7,
          product_ids: [formData.materialId],
        }),
      });

      toast.success(`Forecast generated! Created ${response.total_forecasted} forecasts.`);
      navigate("/results", { state: { formData, result: response } });
    } catch (error: any) {
      console.error("Forecast generation failed:", error);
      toast.error(error.message || "Failed to generate forecast");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">New Forecast</h1>
        <p className="text-muted-foreground">Configure your ML-based demand forecast</p>
      </div>

      <form onSubmit={handleSubmit} className="animate-fade-in rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-6">
          {/* Material */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="material">Material</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Select the material to forecast demand for</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.materialId}
              onValueChange={(value) => setFormData({ ...formData, materialId: value })}
            >
              <SelectTrigger id="material">
                <SelectValue placeholder="Select material..." />
              </SelectTrigger>
              <SelectContent>
                {productsError ? (
                   <SelectItem value="error" disabled>Error loading products</SelectItem>
                ) : products.length === 0 ? (
                   <SelectItem value="loading" disabled>Loading products...</SelectItem>
                ) : (
                  products.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="location">Location / Plant</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Facility location for demand forecast</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData({ ...formData, location: value })}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select location..." />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Forecast Horizon */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label>Forecast Horizon</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Number of weeks to forecast ahead</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-lg font-semibold text-primary">{formData.horizon} weeks</span>
            </div>
            <Slider
              value={[formData.horizon]}
              onValueChange={([value]) => setFormData({ ...formData, horizon: value })}
              min={1}
              max={26}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 week</span>
              <span>26 weeks</span>
            </div>
          </div>

          {/* Scenario */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="scenario">Scenario</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Demand scenario assumptions for the forecast model</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Select
              value={formData.scenario}
              onValueChange={(value) => setFormData({ ...formData, scenario: value })}
            >
              <SelectTrigger id="scenario">
                <SelectValue placeholder="Select scenario..." />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submit */}
          <Button type="submit" size="lg" className="w-full gap-2" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Running ML Model...
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5" />
                Generate Forecast
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
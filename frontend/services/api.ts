const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ForecastRequest {
  material: string;
  location: string;
  horizon: number;
  scenario: string;
}

export interface ForecastResponse {
  forecast: number[];
  lower_bound: number[];
  upper_bound: number[];
  recommendations: {
    reorder_point: number;
    safety_stock: number;
    order_quantity: number;
    next_order_date: string;
  };
  risks: {
    stockout_risk: number;
    overstock_risk: number;
    volatility: string;
  };
}

export const api = {
  getMaterials: async () => {
    const res = await fetch(`${API_BASE_URL}/materials`);
    if (!res.ok) throw new Error('Failed to fetch materials');
    return res.json();
  },

  getLocations: async () => {
    const res = await fetch(`${API_BASE_URL}/locations`);
    if (!res.ok) throw new Error('Failed to fetch locations');
    return res.json();
  },

  generateForecast: async (data: ForecastRequest): Promise<ForecastResponse> => {
    const res = await fetch(`${API_BASE_URL}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to generate forecast');
    return res.json();
  },
};

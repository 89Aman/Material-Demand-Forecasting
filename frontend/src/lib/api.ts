// Production backend URL
export const PROD_API_URL = 'https://ims-backend-3sjloicekq-ew.a.run.app/api';

const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname !== 'localhost'
  ? PROD_API_URL
  : 'http://localhost:8000/api';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    // Build meaningful error message from backend response
    let message = errorData.detail || "";
    if (errorData.skipped && errorData.skipped.length > 0) {
      message = errorData.skipped.map((s: any) => `${s.product}: ${s.reason}`).join('; ');
    }
    throw new Error(message || `API request failed (${response.status})`);
  }

  return response.json();
}

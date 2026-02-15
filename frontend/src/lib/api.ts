// Production backend URL
export const PROD_API_URL = 'https://demand-backend-5obehzt5ja-uc.a.run.app/api';

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
    throw new Error(errorData.detail || "API request failed");
  }

  return response.json();
}

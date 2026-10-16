export const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

export async function apiJson<T = unknown>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.message || 'Temporarily unavailable. Please try again later. / الخدمة غير متاحة مؤقتاً');
  }
  return data as T;
}

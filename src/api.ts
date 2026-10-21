export const API_URL = import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_URL || '/api');

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) { super(message); }
}

export async function apiJson<T = unknown>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.message || 'Temporarily unavailable. Please try again later. / الخدمة غير متاحة مؤقتاً', response.status, typeof data?.code === 'string' ? data.code : undefined);
  }
  return data as T;
}

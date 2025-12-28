import { API_BASE_URL } from './constants';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      // ignore json parse error
    }
    throw new ApiError(res.status, errorMessage);
  }

  return res.json();
}

export const api = {
  getCatalog: () => fetcher<any[]>('/catalog'), // Typing as any[] initially, refined in useQuery
  getProduct: (slug: string) => fetcher<any>(`/product/${slug}`),
  quoteCart: (items: { variant_id: string; quantity: number }[], discountCode?: string) =>
    fetcher<any>('/cart/quote', {
      method: 'POST',
      body: JSON.stringify({ items, discountCode }),
    }),
  createOrder: (payload: any) =>
    fetcher<{ orderId: string; paymentUrl: string }>('/checkout/create', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
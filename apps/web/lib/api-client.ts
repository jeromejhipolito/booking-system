import { DEMO_MODE, DEMO_USER, DEMO_TOKEN, DEMO_SERVICES, DEMO_BOOKINGS, DEMO_REVIEWS } from './demo-data';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

// Demo mode interceptor — returns fake data, never hits backend
function demoIntercept(endpoint: string, options: any = {}): any | null {
  if (!DEMO_MODE) return null;

  const method = options.method || 'GET';

  // Auth
  if (endpoint === '/auth/login' && method === 'POST') {
    return { user: DEMO_USER, accessToken: DEMO_TOKEN, refreshToken: 'demo-refresh' };
  }
  if (endpoint === '/auth/register' && method === 'POST') {
    return { user: DEMO_USER, accessToken: DEMO_TOKEN, refreshToken: 'demo-refresh' };
  }

  // Services
  if (endpoint.startsWith('/services') && method === 'GET') {
    return { data: DEMO_SERVICES, meta: { total: DEMO_SERVICES.length, page: 1, limit: 20 } };
  }

  // Bookings
  if (endpoint.startsWith('/bookings') && method === 'GET') {
    return { data: DEMO_BOOKINGS };
  }
  if (endpoint === '/bookings' && method === 'POST') {
    return { id: 'demo-new-booking', status: 'confirmed', accessToken: 'demo-token' };
  }
  if (endpoint.includes('/cancel') && method === 'PATCH') {
    return { success: true };
  }

  // Reviews
  if (endpoint.startsWith('/reviews') && method === 'GET') {
    return {
      data: DEMO_REVIEWS,
      meta: { averageRating: 4.6, reviewCount: DEMO_REVIEWS.length, total: DEMO_REVIEWS.length, page: 1, limit: 10 },
    };
  }
  if (endpoint === '/reviews' && method === 'POST') {
    return { id: 'demo-review-new', rating: 5, status: 'published' };
  }

  // Providers
  if (endpoint === '/providers' && method === 'POST') {
    return { id: 'demo-provider-new', businessName: 'Demo Business' };
  }

  // Users
  if (endpoint === '/users/me') {
    return DEMO_USER;
  }

  // Availability slots
  if (endpoint.startsWith('/availability/slots') && method === 'GET') {
    const params = new URLSearchParams(endpoint.split('?')[1] || '');
    const date = params.get('date') || new Date().toISOString().split('T')[0];
    const slots = [];
    const times = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
      '16:00', '16:30', '17:00', '17:30',
    ];
    for (const t of times) {
      const startIso = `${date}T${t}:00.000Z`;
      const [h, m] = t.split(':').map(Number);
      const endMin = m + 30;
      const endH = h + Math.floor(endMin / 60);
      const endM = endMin % 60;
      const endIso = `${date}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00.000Z`;
      slots.push({ startTime: startIso, endTime: endIso, available: Math.random() > 0.2 });
    }
    return { providerId: params.get('providerId'), date, timezone: 'Asia/Manila', slots };
  }

  // Fallback
  return { data: [], meta: {} };
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

interface FetchOptions extends RequestInit {
  token?: string;
  skipAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  // Demo mode — return fake data, skip network
  const demoResult = demoIntercept(endpoint, options);
  if (demoResult !== null) {
    return demoResult as T;
  }

  const { token, skipAuth, headers: customHeaders, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  const authToken = token ?? (skipAuth ? null : getStoredToken());
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) =>
    apiClient('/auth/register', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),
  login: (data: any) =>
    apiClient('/auth/login', { method: 'POST', body: JSON.stringify(data), skipAuth: true }),

  // Services
  getServices: (params?: Record<string, string>) => {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return apiClient(`/services${query}`, { skipAuth: true });
  },

  // Bookings
  createBooking: (data: any, idempotencyKey: string) =>
    apiClient('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'x-idempotency-key': idempotencyKey },
      skipAuth: true,
    }),
  cancelBooking: (id: string, reason?: string, token?: string) =>
    apiClient(`/bookings/${id}/cancel${token ? `?token=${token}` : ''}`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
      skipAuth: !!token,
    }),

  // Providers
  createProvider: (data: any) =>
    apiClient('/providers', { method: 'POST', body: JSON.stringify(data) }),
  createService: (data: any) =>
    apiClient('/services', { method: 'POST', body: JSON.stringify(data) }),
  createAvailability: (data: any) =>
    apiClient('/availability', { method: 'POST', body: JSON.stringify(data) }),

  // Reviews
  createReview: (data: { bookingId: string; rating: number; comment?: string }) =>
    apiClient('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getServiceReviews: (serviceId: string, page = 1) =>
    apiClient(`/reviews?serviceId=${serviceId}&page=${page}`, { skipAuth: true }),

  // Generic
  get: <T>(endpoint: string, token?: string) =>
    apiClient<T>(endpoint, { method: 'GET', token }),
  post: <T>(endpoint: string, data: unknown, token?: string) =>
    apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(data), token }),
  patch: <T>(endpoint: string, data: unknown, token?: string) =>
    apiClient<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data), token }),
};

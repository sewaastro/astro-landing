import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface TopRemedy {
  remedyId: string;
  name: string;
  unitsSold: number;
  grossRevenue: number;
}

export interface TopAstrologerByCommission {
  astrologerId: string;
  astrologerName: string;
  ordersAttributed: number;
  totalCommissionEarned: number;
}

export interface RemedyAnalytics {
  totalOrders: number;
  totalRevenueGross: number;
  totalDeliveryCharges: number;
  totalAstrologerCommissionPaid: number;
  totalAstroSewaShare: number;
  topRemedies: TopRemedy[];
  topAstrologersByCommission: TopAstrologerByCommission[];
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function backendRequest<T>(path: string, token: string): Promise<T> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

  const res = await fetch(`${base}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (res.ok) return res.json() as Promise<T>;

  let message = `HTTP ${res.status}`;
  try {
    const json = await res.json();
    message = json?.message ?? message;
  } catch {
    // ignore parse errors
  }
  throw new Error(message);
}

export async function fetchRemedyAnalytics(
  token: string,
  from?: string,
  to?: string,
): Promise<RemedyAnalytics> {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString();
  const res = await backendRequest<ApiResponse<RemedyAnalytics>>(
    `analytics/admin/remedies${query ? `?${query}` : ''}`,
    token,
  );
  return res.data;
}

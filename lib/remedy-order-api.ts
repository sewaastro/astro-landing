import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export type OrderStatus = 'placed' | 'in_transit' | 'delivered';
export type DeliveryType = 'physical' | 'online' | 'onsite' | 'online_digital';

export interface AdminOrderItem {
  id: string;
  remedyId: string;
  name: string;
  currency: string;
  price: number;
  discountedPrice: number;
  discount: number;
  quantity: number;
  deliveryType: string;
  deliveryZone: string | null;
  deliveryCharge: number;
  imageUrl: string | null;
}

export interface AdminOrderAstrologer {
  id: string;
  name: string;
  email: string;
  remedyNames: string[];
}

export interface AdminRemedyOrder {
  id: string;
  trackingNumber: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryTypes: string[];
  estimatedDays: number;
  items: AdminOrderItem[];
  totalAmount: number;
  totalDeliveryCharge: number;
  createdAt: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
  astrologers: AdminOrderAstrologer[];
  shippingAddress: string | null;
  accessVia: string | null;
  onsiteAddress: string | null;
  onsiteDate: string | null;
  onsiteTime: string | null;
}

export interface AdminPaginatedOrders {
  orders: AdminRemedyOrder[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function backendRequest<T>(
  path: string,
  token: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
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

export async function fetchAdminRemedyOrders(
  token: string,
  page: number,
  limit: number,
  status?: string,
): Promise<AdminPaginatedOrders> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status) params.set('status', status);
  const res = await backendRequest<ApiResponse<AdminPaginatedOrders>>(
    `admin/remedy-orders?${params.toString()}`,
    token,
  );
  return res.data;
}

export async function updateAdminRemedyOrderStatus(
  token: string,
  id: string,
  status: string,
): Promise<void> {
  await backendRequest(`admin/remedy-orders/${id}/status`, token, 'PATCH', { status });
}

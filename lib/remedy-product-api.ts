import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';
import type { DeliveryType } from '@/lib/remedy-order-api';

export type RemedyOwnerType = 'ASTROLOGER_OWNED' | 'PLATFORM_OWNED';

export interface RemedyMedia {
  mediaId: string;
  url: string;
  order: number;
  isDefault: boolean;
}

export interface RemedyProduct {
  id: string;
  astrologer: { astrologerId: string; astrologerName: string } | null;
  ownerType: RemedyOwnerType;
  name: string;
  subtitle?: string;
  category: { categoryId: string; title: string };
  subcategory: string[];
  description: Record<string, unknown>;
  prices: { npr: number; inr: number; usd: number };
  discount: number;
  discountedPrice: number;
  stock: number;
  isActive: boolean;
  deliveryType: DeliveryType;
  media: RemedyMedia[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RemedyProductInput {
  name: string;
  subtitle?: string;
  category: string;
  subcategory: string[];
  description: Record<string, unknown>;
  prices: { npr: number; inr: number; usd: number };
  discount?: number;
  stock: number;
  isActive?: boolean;
  deliveryType: DeliveryType;
  media?: Array<{ mediaId: string; isDefault: boolean }>;
}

export interface RemedyProductListFilters {
  category?: string;
  ownerType?: RemedyOwnerType;
  isActive?: boolean;
}

export interface PaginatedRemedyProducts {
  items: RemedyProduct[];
  total: number;
  page: number;
  limit: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: { total: number; page: number; limit: number };
}

async function backendRequest<T>(
  path: string,
  token: string,
  method = 'GET',
  body?: unknown,
): Promise<ApiResponse<T>> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (res.ok) return res.json() as Promise<ApiResponse<T>>;

  let message = `HTTP ${res.status}`;
  try {
    const json = await res.json();
    message = json?.message ?? message;
  } catch {
    // ignore parse errors
  }
  throw new Error(message);
}

export async function fetchRemedyProducts(
  token: string,
  page: number,
  limit: number,
  filters?: RemedyProductListFilters,
): Promise<PaginatedRemedyProducts> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.category) params.set('category', filters.category);
  if (filters?.ownerType) params.set('ownerType', filters.ownerType);
  if (filters?.isActive !== undefined) params.set('isActive', String(filters.isActive));

  const res = await backendRequest<RemedyProduct[]>(
    `admin/remedies?${params.toString()}`,
    token,
  );
  return {
    items: res.data,
    total: res.pagination?.total ?? res.data.length,
    page: res.pagination?.page ?? page,
    limit: res.pagination?.limit ?? limit,
  };
}

export async function createRemedyProduct(
  token: string,
  input: RemedyProductInput,
): Promise<RemedyProduct> {
  const res = await backendRequest<RemedyProduct>('admin/remedies', token, 'POST', input);
  return res.data;
}

export async function updateRemedyProduct(
  token: string,
  id: string,
  input: Partial<RemedyProductInput>,
): Promise<RemedyProduct> {
  const res = await backendRequest<RemedyProduct>(
    `admin/remedies/${id}`,
    token,
    'PUT',
    input,
  );
  return res.data;
}

export async function deleteRemedyProduct(token: string, id: string): Promise<void> {
  await backendRequest<unknown>(`admin/remedies/${id}`, token, 'DELETE');
}

export async function toggleRemedyProductActive(
  token: string,
  id: string,
  isActive: boolean,
): Promise<RemedyProduct> {
  return updateRemedyProduct(token, id, { isActive });
}

interface MediaUploadData {
  mediaId: string;
  url: string;
  compressedUrl: string;
  thumbnailUrl: string;
}

export async function uploadRemedyMedia(
  token: string,
  file: File,
): Promise<{ mediaId: string; url: string }> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${base}/admin/remedies/media`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const json = await res.json();
      message = json?.message ?? message;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  const json = (await res.json()) as ApiResponse<MediaUploadData>;
  return {
    mediaId: json.data.mediaId,
    url: json.data.compressedUrl ?? json.data.url,
  };
}

export async function deleteRemedyMedia(token: string, mediaId: string): Promise<void> {
  await backendRequest<unknown>(`admin/remedies/media/${mediaId}`, token, 'DELETE');
}

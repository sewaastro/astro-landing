import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface AstrologerTag {
  _id: string;
  name: string;
  type: string;
  description?: string;
  status: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function backendRequest<T>(path: string, token: string): Promise<ApiResponse<T>> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');

  const res = await fetch(`${base}/${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
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

// The mobile app's Create Remedy screen sources subcategory options from this
// same `type=expertise` tag list, so the two dropdowns stay in sync.
export async function fetchAstrologerTags(token: string, type: string): Promise<AstrologerTag[]> {
  const params = new URLSearchParams({ type });
  const res = await backendRequest<AstrologerTag[]>(`astrologer-tags?${params.toString()}`, token);
  return res.data;
}

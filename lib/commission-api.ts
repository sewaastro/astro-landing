import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export interface CommissionSettings {
  commissionPercentage: number;
  updatedBy: string | null;
  updatedAt: string | null;
}

export type CommissionSource = 'remedy' | 'remedy_self_sale' | 'gift';

export interface AllCommissionSettings {
  remedy: CommissionSettings;
  remedySelfSale: CommissionSettings;
  gift: CommissionSettings;
}

export interface UpdateCommissionInput {
  commissionPercentage: number;
}

async function backendRequest<T>(
  path: string,
  token: string,
  method = 'GET',
  body?: unknown,
): Promise<T> {
  const base = tryGetPublicBackendBaseUrl();
  if (!base) {
    throw new Error('NEXT_PUBLIC_BACKEND_URL is not set');
  }
  const res = await fetch(`${base}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (res.ok) {
    return res.json() as Promise<T>;
  }

  let message = `HTTP ${res.status}`;
  try {
    const json = await res.json();
    message = json?.message ?? message;
  } catch {
    // ignore parse errors
  }
  throw new Error(message);
}

export async function fetchAllCommissions(token: string): Promise<AllCommissionSettings> {
  return backendRequest<AllCommissionSettings>('subscriptions/admin/commissions', token);
}

export async function updateCommissionBySource(
  token: string,
  source: CommissionSource,
  input: UpdateCommissionInput,
): Promise<CommissionSettings> {
  return backendRequest<CommissionSettings>(
    `subscriptions/admin/commission/${source}`,
    token,
    'PUT',
    input,
  );
}

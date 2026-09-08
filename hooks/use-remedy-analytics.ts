'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { fetchRemedyAnalytics } from '@/lib/remedy-analytics-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useRemedyAnalytics(from?: string, to?: string) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['remedy-analytics', from ?? '', to ?? ''],
    queryFn: () => fetchRemedyAnalytics(token!, from, to),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

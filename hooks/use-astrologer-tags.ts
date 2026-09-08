'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { fetchAstrologerTags } from '@/lib/astrologer-tags-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useAstrologerTags(type: string) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['astrologer-tags', type],
    queryFn: () => fetchAstrologerTags(token!, type),
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

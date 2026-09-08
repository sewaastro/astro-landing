'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchAdminAstrologers,
  updateLiveStreamingEnabled,
  updateRemedyManagementEnabled,
} from '@/lib/astrologers-admin-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

export function useAdminAstrologers(page: number, limit = 20, search?: string) {
  const token = useBackendToken();
  return useQuery({
    queryKey: ['astrologers', page, limit, search ?? ''],
    queryFn: () => fetchAdminAstrologers(token!, page, limit, search),
    enabled: !!token,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useUpdateLiveStreamingEnabled() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      astrologerUserId,
      isLiveStreamingEnabled,
    }: {
      astrologerUserId: string;
      isLiveStreamingEnabled: boolean;
    }) => updateLiveStreamingEnabled(token!, astrologerUserId, isLiveStreamingEnabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['astrologers'] }),
  });
}

export function useUpdateRemedyManagementEnabled() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      astrologerUserId,
      isRemedyManagementEnabled,
    }: {
      astrologerUserId: string;
      isRemedyManagementEnabled: boolean;
    }) => updateRemedyManagementEnabled(token!, astrologerUserId, isRemedyManagementEnabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['astrologers'] }),
  });
}

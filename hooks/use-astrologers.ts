'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  fetchAdminAstrologers,
  updateLiveStreamingEnabled,
  updateRemedyManagementEnabled,
  type AdminAstrologerList,
} from '@/lib/astrologers-admin-api';

function optimisticallyPatchAstrologer(
  queryClient: ReturnType<typeof useQueryClient>,
  astrologerUserId: string,
  patch: Partial<AdminAstrologerList['items'][number]>,
) {
  const previous = queryClient.getQueriesData<AdminAstrologerList>({ queryKey: ['astrologers'] });
  queryClient.setQueriesData<AdminAstrologerList>({ queryKey: ['astrologers'] }, old => {
    if (!old) return old;
    return {
      ...old,
      items: old.items.map(astrologer =>
        astrologer.user?._id === astrologerUserId ? { ...astrologer, ...patch } : astrologer,
      ),
    };
  });
  return previous;
}

function rollbackAstrologers(
  queryClient: ReturnType<typeof useQueryClient>,
  previous: [readonly unknown[], AdminAstrologerList | undefined][] | undefined,
) {
  previous?.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
}

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
    onMutate: async ({ astrologerUserId, isLiveStreamingEnabled }) => {
      await queryClient.cancelQueries({ queryKey: ['astrologers'] });
      const previous = optimisticallyPatchAstrologer(queryClient, astrologerUserId, {
        isLiveStreamingEnabled,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => rollbackAstrologers(queryClient, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['astrologers'] }),
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
    onMutate: async ({ astrologerUserId, isRemedyManagementEnabled }) => {
      await queryClient.cancelQueries({ queryKey: ['astrologers'] });
      const previous = optimisticallyPatchAstrologer(queryClient, astrologerUserId, {
        isRemedyManagementEnabled,
      });
      return { previous };
    },
    onError: (_err, _vars, context) => rollbackAstrologers(queryClient, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['astrologers'] }),
  });
}

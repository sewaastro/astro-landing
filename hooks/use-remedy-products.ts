'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import {
  createRemedyProduct,
  deleteRemedyMedia,
  deleteRemedyProduct,
  fetchRemedyProducts,
  toggleRemedyProductActive,
  updateRemedyProduct,
  uploadRemedyMedia,
  type RemedyProductInput,
  type RemedyProductListFilters,
} from '@/lib/remedy-product-api';

function useBackendToken(): string | null {
  const { data: session, status } = useSession();
  if (status === 'loading') return null;
  return session?.backendAccessToken ?? null;
}

const QUERY_KEY = 'remedy-products';

export function useRemedyProducts(
  page: number,
  limit = 20,
  filters?: RemedyProductListFilters,
) {
  const token = useBackendToken();
  return useQuery({
    queryKey: [QUERY_KEY, page, limit, filters ?? {}],
    queryFn: () => fetchRemedyProducts(token!, page, limit, filters),
    enabled: !!token,
    staleTime: 30 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useCreateRemedyProduct() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: RemedyProductInput) => createRemedyProduct(token!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUpdateRemedyProduct() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<RemedyProductInput> }) =>
      updateRemedyProduct(token!, id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useDeleteRemedyProduct() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRemedyProduct(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useToggleRemedyProductActive() {
  const token = useBackendToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleRemedyProductActive(token!, id, isActive),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [QUERY_KEY] }),
  });
}

export function useUploadRemedyMedia() {
  const token = useBackendToken();
  return useMutation({
    mutationFn: (file: File) => {
      if (!token) throw new Error('Not authenticated');
      return uploadRemedyMedia(token, file);
    },
  });
}

export function useDeleteRemedyMedia() {
  const token = useBackendToken();
  return useMutation({
    mutationFn: (mediaId: string) => {
      if (!token) throw new Error('Not authenticated');
      return deleteRemedyMedia(token, mediaId);
    },
  });
}

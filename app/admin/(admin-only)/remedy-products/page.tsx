'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRemedyProducts } from '@/hooks/use-remedy-products';
import RemedyProductsTable from '@/components/admin/remedy-products/remedy-products-table';
import { CreateEditDialog } from '@/components/admin/remedy-products/create-edit-dialog';
import { DeleteDialog } from '@/components/admin/remedy-products/delete-dialog';
import type { RemedyProduct } from '@/lib/remedy-product-api';

const DEFAULT_LIMIT = 20;

export default function RemedyProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.max(1, Number(searchParams.get('limit') ?? String(DEFAULT_LIMIT)));

  const { data, isLoading, isFetching, isError, error } = useRemedyProducts(page, limit);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RemedyProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RemedyProduct | null>(null);

  function handlePageChange(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(next));
    router.push(`?${params.toString()}`);
  }

  function handleLimitChange(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', String(next));
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Remedy Products</h1>
          <p className="mt-0.5 font-mukta text-sm text-neutral-500">
            Manage the remedy catalog available to users. Astrologer-managed remedies stay editable
            only from the mobile app.
          </p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 font-mukta text-white"
          style={{ backgroundColor: '#611508' }}
        >
          <Plus className="h-4 w-4" />
          New Remedy
        </Button>
      </div>

      <Card className="rounded-2xl border-neutral-100 shadow-sm">
        <CardContent className="p-0">
          {isError ? (
            <p className="px-6 py-10 text-center font-mukta text-sm text-red-500">
              {(error as Error).message || 'Failed to load remedy products.'}
            </p>
          ) : (
            <RemedyProductsTable
              data={data?.items ?? []}
              isLoading={isLoading}
              isFetching={isFetching}
              page={page}
              limit={limit}
              total={data?.total ?? 0}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              onEdit={row => setEditTarget(row)}
              onDelete={row => setDeleteTarget(row)}
            />
          )}
        </CardContent>
      </Card>

      <CreateEditDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <CreateEditDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        remedy={editTarget ?? undefined}
      />

      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        remedy={deleteTarget}
      />
    </div>
  );
}

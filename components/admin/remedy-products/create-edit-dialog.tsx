'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateRemedyProduct, useUpdateRemedyProduct } from '@/hooks/use-remedy-products';
import type { RemedyProduct, RemedyProductInput } from '@/lib/remedy-product-api';
import { RemedyProductForm } from './remedy-product-form';

interface CreateEditDialogProps {
  open: boolean;
  onClose: () => void;
  remedy?: RemedyProduct;
}

export function CreateEditDialog({ open, onClose, remedy }: CreateEditDialogProps) {
  const isEditing = !!remedy;
  const createMutation = useCreateRemedyProduct();
  const updateMutation = useUpdateRemedyProduct();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const mutationError = createMutation.error ?? updateMutation.error;

  async function handleSubmit(values: RemedyProductInput) {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: remedy.id, input: values });
      } else {
        await createMutation.mutateAsync(values);
      }
      onClose();
    } catch {
      // error displayed inline via mutationError
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-mukta text-neutral-800">
            {isEditing ? 'Edit Remedy Product' : 'Create Remedy Product'}
          </DialogTitle>
        </DialogHeader>

        {mutationError && (
          <p className="text-sm font-mukta text-red-600">{mutationError.message}</p>
        )}

        <RemedyProductForm
          defaultValues={remedy}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

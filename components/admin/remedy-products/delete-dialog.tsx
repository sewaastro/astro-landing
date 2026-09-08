'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDeleteRemedyProduct } from '@/hooks/use-remedy-products';
import type { RemedyProduct } from '@/lib/remedy-product-api';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  remedy: RemedyProduct | null;
}

export function DeleteDialog({ open, onClose, remedy }: DeleteDialogProps) {
  const deleteMutation = useDeleteRemedyProduct();

  async function handleDelete() {
    if (!remedy) return;
    try {
      await deleteMutation.mutateAsync(remedy.id);
      onClose();
    } catch {
      // error displayed inline
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={v => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-mukta text-neutral-800">Delete Remedy</DialogTitle>
          <DialogDescription className="font-mukta">
            Are you sure you want to delete <strong>{remedy?.name}</strong>? This will also
            permanently delete its images. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {deleteMutation.isError && (
          <p className="text-sm font-mukta text-red-600">{deleteMutation.error.message}</p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="font-mukta"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="font-mukta"
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import Image from 'next/image';
import {
  Pencil,
  Trash2,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToggleRemedyProductActive } from '@/hooks/use-remedy-products';
import type { RemedyProduct } from '@/lib/remedy-product-api';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const SKELETON_ROW_IDS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'];
const COLUMN_COUNT = 11;

function currentAmount(price: number, discount: number) {
  return discount > 0 ? Number((price * (1 - discount / 100)).toFixed(2)) : price;
}

interface RemedyProductsTableProps {
  data: RemedyProduct[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onEdit: (row: RemedyProduct) => void;
  onDelete: (row: RemedyProduct) => void;
}

function IsActiveCell({ remedy }: { remedy: RemedyProduct }) {
  const mutation = useToggleRemedyProductActive();
  return (
    <Switch
      checked={remedy.isActive}
      disabled={mutation.isPending}
      onCheckedChange={checked => mutation.mutate({ id: remedy.id, isActive: checked })}
      aria-label="Toggle visibility"
    />
  );
}

export default function RemedyProductsTable({
  data,
  isLoading,
  isFetching,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  onEdit,
  onDelete,
}: RemedyProductsTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity duration-150' : ''}>
      <Table>
        <TableHeader>
          <TableRow className="border-neutral-100">
            {[
              'Image',
              'Name',
              'Category',
              'Subcategory',
              'Price (NPR)',
              'Price (INR)',
              'Price (USD)',
              'Stock',
              'Delivery',
              'Owner',
              'Visible',
            ].map(label => (
              <TableHead
                key={label}
                className="font-mukta text-xs uppercase tracking-wide text-neutral-500"
              >
                {label}
              </TableHead>
            ))}
            <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            SKELETON_ROW_IDS.slice(0, Math.min(limit, SKELETON_ROW_IDS.length)).map(rowId => (
              <TableRow key={rowId} className="border-neutral-100">
                {Array.from({ length: COLUMN_COUNT + 1 }, (_, i) => (
                  <TableCell key={`${rowId}-${i}`}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            data.map(remedy => {
              const defaultImage = remedy.media.find(m => m.isDefault) ?? remedy.media[0];
              const isAstrologerOwned = remedy.ownerType === 'ASTROLOGER_OWNED';
              return (
                <TableRow key={remedy.id} className="border-neutral-100 hover:bg-neutral-50">
                  <TableCell>
                    {defaultImage ? (
                      <Image
                        src={defaultImage.url}
                        alt={remedy.name}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-lg object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="font-mukta text-sm text-neutral-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta font-medium text-neutral-800">{remedy.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta text-sm text-neutral-600">
                      {remedy.category.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta text-sm text-neutral-600">
                      {remedy.subcategory.length > 0 ? remedy.subcategory.join(', ') : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta text-sm text-neutral-600">
                      {currentAmount(remedy.prices.npr, remedy.discount).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta text-sm text-neutral-600">
                      {currentAmount(remedy.prices.inr, remedy.discount).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta text-sm text-neutral-600">
                      {currentAmount(remedy.prices.usd, remedy.discount).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta text-sm text-neutral-600">{remedy.stock}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-neutral-100 font-mukta text-xs text-neutral-600">
                      {remedy.deliveryType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAstrologerOwned ? (
                      <Badge className="bg-amber-50 font-mukta text-xs text-amber-800">
                        {remedy.astrologer?.astrologerName || 'Astrologer-managed'}
                      </Badge>
                    ) : (
                      <Badge className="bg-neutral-100 font-mukta text-xs text-neutral-600">
                        Astro Sewa
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <IsActiveCell remedy={remedy} />
                  </TableCell>
                  <TableCell>
                    {isAstrologerOwned ? (
                      <span className="font-mukta text-xs text-neutral-400">Managed on mobile</span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500 hover:text-[#611508]"
                          onClick={() => onEdit(remedy)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-neutral-500 hover:text-red-600"
                          onClick={() => onDelete(remedy)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

          {!isLoading && data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT + 1}
                className="py-10 text-center font-mukta text-sm text-neutral-400"
              >
                No remedy products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div
        className="flex items-center justify-end gap-6 border-t px-4"
        style={{
          height: 52,
          borderColor: 'rgba(224, 224, 224, 1)',
          fontSize: '0.875rem',
          color: 'rgba(0,0,0,0.87)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-mukta text-sm" style={{ color: 'rgba(0,0,0,0.6)' }}>
            Rows per page:
          </span>
          <Select
            value={String(limit)}
            onValueChange={val => onLimitChange(Number(val))}
            disabled={isLoading}
          >
            <SelectTrigger className="h-7 w-16 border-none font-mukta text-sm shadow-none focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROWS_PER_PAGE_OPTIONS.map(opt => (
                <SelectItem key={opt} value={String(opt)} className="font-mukta text-sm">
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <span
          className="font-mukta text-sm"
          style={{ color: 'rgba(0,0,0,0.6)', minWidth: 80, textAlign: 'right' }}
        >
          {from}–{to} of {total}
        </span>

        <div className="flex items-center">
          {(
            [
              {
                icon: ChevronsLeft,
                label: 'First page',
                disabled: page <= 1,
                action: () => onPageChange(1),
              },
              {
                icon: ChevronLeft,
                label: 'Previous page',
                disabled: page <= 1,
                action: () => onPageChange(page - 1),
              },
              {
                icon: ChevronRight,
                label: 'Next page',
                disabled: page >= totalPages,
                action: () => onPageChange(page + 1),
              },
              {
                icon: ChevronsRight,
                label: 'Last page',
                disabled: page >= totalPages,
                action: () => onPageChange(totalPages),
              },
            ] as const
          ).map(({ icon: Icon, label, disabled, action }) => (
            <button
              key={label}
              aria-label={label}
              onClick={action}
              disabled={disabled || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded transition-colors hover:bg-neutral-100 disabled:pointer-events-none"
              style={{ color: disabled ? 'rgba(0,0,0,0.26)' : 'rgba(0,0,0,0.54)' }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

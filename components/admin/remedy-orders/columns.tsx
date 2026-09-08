'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreHorizontal, Loader2, Eye } from 'lucide-react';
import { AdminRemedyOrder } from '@/lib/remedy-order-api';

const STATUS_STYLES: Record<string, string> = {
  placed: 'bg-blue-50 text-blue-700',
  in_transit: 'bg-yellow-50 text-yellow-700',
  delivered: 'bg-green-50 text-green-700',
};

const STATUS_LABELS: Record<string, string> = {
  placed: 'Placed',
  in_transit: 'In Transit',
  delivered: 'Delivered',
};

const DELIVERY_LABELS: Record<string, string> = {
  physical: 'Physical',
  online: 'Online',
  onsite: 'Onsite',
  online_digital: 'Digital',
};

/** Options available from each status — forward-only. */
const NEXT_STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  placed: [
    { value: 'in_transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' },
  ],
  in_transit: [{ value: 'delivered', label: 'Delivered' }],
  delivered: [],
};

function formatDate(iso: string | null | undefined) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(raw: string | null | undefined): string {
  if (!raw) return '—';
  const [hStr, mStr] = raw.split(':');
  const h = Number.parseInt(hStr, 10);
  if (Number.isNaN(h)) return raw;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mStr ?? '00'} ${period}`;
}

function RemedyDeliveryDetails({
  deliveryType,
  order,
}: {
  deliveryType: string;
  order: AdminRemedyOrder;
}) {
  if (deliveryType === 'physical') {
    if (!order.shippingAddress && !order.accessVia) return null;
    return (
      <ul className="mt-1 space-y-0.5 border-l border-neutral-100 pl-2">
        {order.shippingAddress && (
          <li className="flex gap-2 text-xs">
            <span className="w-28 shrink-0 text-neutral-400">Address</span>
            <span className="text-neutral-600">{order.shippingAddress}</span>
          </li>
        )}
        {order.accessVia && (
          <li className="flex gap-2 text-xs">
            <span className="w-28 shrink-0 text-neutral-400">Access Via</span>
            <span className="text-neutral-600">{order.accessVia}</span>
          </li>
        )}
      </ul>
    );
  }

  if (deliveryType === 'onsite') {
    if (!order.onsiteAddress && !order.onsiteDate && !order.onsiteTime) return null;
    return (
      <ul className="mt-1 space-y-0.5 border-l border-neutral-100 pl-2">
        {order.onsiteAddress && (
          <li className="flex gap-2 text-xs">
            <span className="w-28 shrink-0 text-neutral-400">Location</span>
            <span className="text-neutral-600">{order.onsiteAddress}</span>
          </li>
        )}
        {order.onsiteDate && (
          <li className="flex gap-2 text-xs">
            <span className="w-28 shrink-0 text-neutral-400">Date</span>
            <span className="text-neutral-600">{order.onsiteDate}</span>
          </li>
        )}
        {order.onsiteTime && (
          <li className="flex gap-2 text-xs">
            <span className="w-28 shrink-0 text-neutral-400">Time</span>
            <span className="text-neutral-600">{formatTime(order.onsiteTime)}</span>
          </li>
        )}
      </ul>
    );
  }

  // online / online_digital — no location info
  return null;
}

function OrderDetailsModal({ order }: { order: AdminRemedyOrder }) {
  const [open, setOpen] = useState(false);

  // Lookup from remedy name to order item, to resolve each remedy's delivery type/price.
  const itemsByName = new Map(order.items.map(item => [item.name, item]));

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-7 w-7 items-center justify-center rounded hover:bg-neutral-100"
        aria-label="View order details"
      >
        <Eye size={15} className="text-neutral-500" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto font-mukta">
          <DialogHeader>
            <DialogTitle className="font-mukta text-base">
              Order Details — {order.trackingNumber}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {order.astrologers.length === 0 ? (
              <p className="text-sm text-neutral-400">No astrologers assigned.</p>
            ) : (
              order.astrologers.map(a => (
                <div key={a.id} className="space-y-3 rounded-lg border border-neutral-100 p-3">
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{a.name}</p>
                    {a.email && <p className="text-xs text-neutral-400">{a.email}</p>}
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                      Remedies
                    </p>
                    <ul className="space-y-2.5">
                      {a.remedyNames.map(name => {
                        const item = itemsByName.get(name);
                        const deliveryType = item?.deliveryType ?? 'online';
                        const price = item ? (item.discountedPrice ?? item.price) : null;
                        const currency = item?.currency ?? 'NPR';
                        const deliveryCharge = item?.deliveryCharge ?? 0;
                        return (
                          <li key={name}>
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-2">
                                <span className="truncate text-xs font-medium text-neutral-700">
                                  {name}
                                </span>
                                <span className="shrink-0 rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500">
                                  {DELIVERY_LABELS[deliveryType] ?? deliveryType}
                                </span>
                              </div>
                              {price !== null && (
                                <div className="shrink-0 text-right">
                                  <span className="text-xs font-semibold text-neutral-800">
                                    {currency} {price.toLocaleString()}
                                  </span>
                                  {deliveryCharge > 0 && (
                                    <p className="text-[10px] text-neutral-400">
                                      +{currency} {deliveryCharge.toLocaleString()} delivery
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                            <RemedyDeliveryDetails deliveryType={deliveryType} order={order} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface ColumnActions {
  onStatusChange: (id: string, status: string) => void;
  pendingId: string | null;
}

export function createColumns({
  onStatusChange,
  pendingId,
}: ColumnActions): ColumnDef<AdminRemedyOrder>[] {
  return [
    {
      accessorKey: 'trackingNumber',
      header: 'Tracking #',
      cell: ({ getValue }) => (
        <span className="font-mukta text-xs font-semibold text-neutral-700">
          {getValue<string>()}
        </span>
      ),
    },
    {
      accessorKey: 'userName',
      header: 'User',
      cell: ({ row }) => (
        <div className="font-mukta">
          <p className="text-sm text-neutral-800">{row.original.userName ?? '—'}</p>
          <p className="text-xs text-neutral-400">{row.original.userEmail ?? '—'}</p>
          {row.original.userPhone && (
            <p className="text-xs text-neutral-400">{row.original.userPhone}</p>
          )}
        </div>
      ),
    },
    {
      id: 'astrologers',
      header: 'Astrologer',
      cell: ({ row }) => {
        const astrologers = row.original.astrologers ?? [];
        if (astrologers.length === 0) {
          return <span className="font-mukta text-sm text-neutral-400">—</span>;
        }
        return (
          <div className="flex flex-col gap-0.5 font-mukta">
            {astrologers.map(a => (
              <span key={a.id} className="text-sm text-neutral-800">
                {a.name}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mukta text-xs font-medium ${STATUS_STYLES[status] ?? ''}`}
          >
            <span
              className={`inline-block h-1.5 w-1.5 rounded-full ${
                status === 'placed'
                  ? 'bg-blue-500'
                  : status === 'in_transit'
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
            />
            {STATUS_LABELS[status] ?? status}
          </span>
        );
      },
    },
    {
      accessorKey: 'deliveryTypes',
      header: 'Delivery',
      cell: ({ getValue }) => {
        const types = getValue<string[] | null | undefined>() ?? [];
        return (
          <div className="flex flex-wrap gap-1">
            {types.map(type => (
              <span
                key={type}
                className="inline-flex items-center rounded border border-neutral-200 px-1.5 py-0.5 font-mukta text-xs text-neutral-600"
              >
                {DELIVERY_LABELS[type] ?? type}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'items',
      header: 'Remedies',
      cell: ({ getValue }) => (
        <span className="font-mukta text-sm text-neutral-600">
          {(getValue<AdminRemedyOrder['items'] | null | undefined>() ?? []).length}
        </span>
      ),
    },
    {
      accessorKey: 'totalAmount',
      header: 'Total (NPR)',
      cell: ({ getValue }) => (
        <span className="font-mukta text-sm font-semibold text-neutral-800">
          {(getValue<number | null | undefined>() ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="font-mukta text-sm text-neutral-500">
          {formatDate(getValue<string>())}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const status = row.original.status;
        const options = NEXT_STATUS_OPTIONS[status] ?? [];
        const isPending = pendingId === row.original.id;

        return (
          <div className="flex items-center gap-1">
            <OrderDetailsModal order={row.original} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-7 w-7 items-center justify-center rounded hover:bg-neutral-100 disabled:pointer-events-none disabled:opacity-40"
                  disabled={isPending}
                  aria-label="Row actions"
                >
                  {isPending ? (
                    <Loader2 size={15} className="animate-spin text-neutral-500" />
                  ) : (
                    <MoreHorizontal size={15} className="text-neutral-500" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="font-mukta">
                <DropdownMenuLabel className="text-xs text-neutral-400">
                  Change Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {options.length === 0 ? (
                  <DropdownMenuItem disabled className="text-xs text-neutral-400">
                    No further transitions
                  </DropdownMenuItem>
                ) : (
                  options.map(opt => (
                    <DropdownMenuItem
                      key={opt.value}
                      className="text-xs"
                      onSelect={() => onStatusChange(row.original.id, opt.value)}
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
}

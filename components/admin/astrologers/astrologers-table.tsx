'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
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
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import { ChangeTierDialog } from './change-tier-dialog';
import { useTiers } from '@/hooks/use-tiers';
import {
  useUpdateLiveStreamingEnabled,
  useUpdateRemedyManagementEnabled,
} from '@/hooks/use-astrologers';
import type { AdminAstrologer } from '@/lib/astrologers-admin-api';

const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];
const SKELETON_ROW_IDS = ['sk-1', 'sk-2', 'sk-3', 'sk-4', 'sk-5'];
const COLUMN_COUNT = 7;

interface AstrologersTableProps {
  data: AdminAstrologer[];
  isLoading: boolean;
  isFetching: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

function TierCell({ astrologer }: { astrologer: AdminAstrologer }) {
  const [open, setOpen] = useState(false);
  const { data: tiers } = useTiers();
  const tier = tiers?.find(t => t._id === astrologer.tierId);
  const userId = astrologer.user?._id ?? undefined;

  return (
    <div className="flex items-center gap-2">
      {tier ? (
        <Badge className="bg-amber-50 font-mukta text-xs text-amber-800">{tier.name}</Badge>
      ) : (
        <Badge className="bg-neutral-100 font-mukta text-xs text-neutral-500">No tier</Badge>
      )}
      {userId && (
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setOpen(true)}
            className="h-7 font-mukta text-xs"
          >
            Change Tier
          </Button>
          <ChangeTierDialog
            open={open}
            onOpenChange={setOpen}
            astrologerUserId={userId}
            astrologerName={astrologer.user?.fullName ?? astrologer.user?.email ?? 'astrologer'}
            currentTierId={astrologer.tierId ?? undefined}
          />
        </>
      )}
    </div>
  );
}

function LiveStreamingCell({ astrologer }: { astrologer: AdminAstrologer }) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.roles?.includes('SUPER_ADMIN') ?? false;
  const userId = astrologer.user?._id ?? undefined;
  const mutation = useUpdateLiveStreamingEnabled();

  if (!isSuperAdmin) {
    return (
      <Badge
        className={`font-mukta text-xs ${
          astrologer.isLiveStreamingEnabled
            ? 'bg-green-50 text-green-700'
            : 'bg-neutral-100 text-neutral-500'
        }`}
      >
        {astrologer.isLiveStreamingEnabled ? 'Enabled' : 'Disabled'}
      </Badge>
    );
  }

  return (
    <Switch
      checked={astrologer.isLiveStreamingEnabled ?? false}
      disabled={!userId || mutation.isPending}
      onCheckedChange={checked => {
        if (!userId) return;
        mutation.mutate({ astrologerUserId: userId, isLiveStreamingEnabled: checked });
      }}
      aria-label="Toggle live streaming access"
    />
  );
}

function RemedyManagementCell({ astrologer }: { astrologer: AdminAstrologer }) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.roles?.includes('SUPER_ADMIN') ?? false;
  const userId = astrologer.user?._id ?? undefined;
  const mutation = useUpdateRemedyManagementEnabled();

  if (!isSuperAdmin) {
    return (
      <Badge
        className={`font-mukta text-xs ${
          astrologer.isRemedyManagementEnabled
            ? 'bg-green-50 text-green-700'
            : 'bg-neutral-100 text-neutral-500'
        }`}
      >
        {astrologer.isRemedyManagementEnabled ? 'Enabled' : 'Disabled'}
      </Badge>
    );
  }

  return (
    <Switch
      checked={astrologer.isRemedyManagementEnabled ?? false}
      disabled={!userId || mutation.isPending}
      onCheckedChange={checked => {
        if (!userId) return;
        mutation.mutate({ astrologerUserId: userId, isRemedyManagementEnabled: checked });
      }}
      aria-label="Toggle remedy management access"
    />
  );
}

export default function AstrologersTable({
  data,
  isLoading,
  isFetching,
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
}: AstrologersTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className={isFetching && !isLoading ? 'opacity-60 transition-opacity duration-150' : ''}>
      <Table>
        <TableHeader>
          <TableRow className="border-neutral-100">
            {[
              'Astrologer',
              'Tier',
              'Other Tags',
              'Experience',
              'Booking',
              'Live Streaming',
              'Manage Remedies',
            ].map(label => (
              <TableHead
                key={label}
                className="font-mukta text-xs uppercase tracking-wide text-neutral-500"
              >
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            SKELETON_ROW_IDS.slice(0, Math.min(limit, SKELETON_ROW_IDS.length)).map(rowId => (
              <TableRow key={rowId} className="border-neutral-100">
                {Array.from({ length: COLUMN_COUNT }, (_, i) => (
                  <TableCell key={`${rowId}-${i}`}>
                    <Skeleton className="h-4 w-full rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {!isLoading &&
            data.map(astrologer => {
              const otherTags = astrologer.tags ?? [];
              return (
                <TableRow key={astrologer._id} className="border-neutral-100 hover:bg-neutral-50">
                  <TableCell>
                    <div className="font-mukta">
                      <p className="text-sm text-neutral-800">{astrologer.user?.fullName ?? '—'}</p>
                      <p className="text-xs text-neutral-400">{astrologer.user?.email ?? '—'}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TierCell astrologer={astrologer} />
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta text-sm text-neutral-600">
                      {otherTags.length > 0
                        ? otherTags
                            .slice(0, 3)
                            .map(tag => tag.name)
                            .join(', ') + (otherTags.length > 3 ? '…' : '')
                        : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mukta text-sm text-neutral-600">
                      {typeof astrologer.yearsOfExperience === 'number'
                        ? `${astrologer.yearsOfExperience} yrs`
                        : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={`font-mukta text-xs ${
                        astrologer.isBookingEnabled
                          ? 'bg-green-50 text-green-700'
                          : 'bg-neutral-100 text-neutral-500'
                      }`}
                    >
                      {astrologer.isBookingEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <LiveStreamingCell astrologer={astrologer} />
                  </TableCell>
                  <TableCell>
                    <RemedyManagementCell astrologer={astrologer} />
                  </TableCell>
                </TableRow>
              );
            })}

          {!isLoading && data.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={COLUMN_COUNT}
                className="py-10 text-center font-mukta text-sm text-neutral-400"
              >
                No astrologers found
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

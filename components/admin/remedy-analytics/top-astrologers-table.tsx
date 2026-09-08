'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import type { TopAstrologerByCommission } from '@/lib/remedy-analytics-api';

interface TopAstrologersTableProps {
  data: TopAstrologerByCommission[] | undefined;
  isLoading: boolean;
}

export function TopAstrologersTable({ data, isLoading }: TopAstrologersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-neutral-100">
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Astrologer
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Orders Attributed
          </TableHead>
          <TableHead className="font-mukta text-xs uppercase tracking-wide text-neutral-500">
            Commission Earned (NPR)
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i} className="border-neutral-100">
              {Array.from({ length: 3 }).map((_, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full rounded" />
                </TableCell>
              ))}
            </TableRow>
          ))}

        {!isLoading &&
          (data ?? []).map(row => (
            <TableRow key={row.astrologerId} className="border-neutral-100 hover:bg-neutral-50">
              <TableCell>
                <span className="font-mukta font-medium text-neutral-800">
                  {row.astrologerName}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-mukta text-sm text-neutral-600">{row.ordersAttributed}</span>
              </TableCell>
              <TableCell>
                <span className="font-mukta text-sm text-neutral-600">
                  {row.totalCommissionEarned.toLocaleString()}
                </span>
              </TableCell>
            </TableRow>
          ))}

        {!isLoading && (data ?? []).length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="py-8 text-center font-mukta text-neutral-400">
              No astrologer commissions recorded yet
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

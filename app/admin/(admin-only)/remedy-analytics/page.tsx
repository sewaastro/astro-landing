'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRemedyAnalytics } from '@/hooks/use-remedy-analytics';
import { RemedyStatsGrid } from '@/components/admin/remedy-analytics/remedy-stats-grid';
import { TopRemediesTable } from '@/components/admin/remedy-analytics/top-remedies-table';
import { TopAstrologersTable } from '@/components/admin/remedy-analytics/top-astrologers-table';

const RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
] as const;

type RangeValue = (typeof RANGE_OPTIONS)[number]['value'];

function rangeToFrom(range: RangeValue): string | undefined {
  if (range === 'all') return undefined;
  const now = new Date();
  if (range === 'today') {
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    ).toISOString();
  }
  const days = range === '7d' ? 7 : 30;
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - days);
  return from.toISOString();
}

export default function RemedyAnalyticsPage() {
  const [range, setRange] = useState<RangeValue>('30d');
  const from = useMemo(() => rangeToFrom(range), [range]);

  const { data, isPending, isError, error } = useRemedyAnalytics(from);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Remedy Analytics</h1>
          <p className="mt-0.5 font-mukta text-sm text-neutral-500">
            Catalog-wide remedy sales, commission, and top performers
          </p>
        </div>
        <Select value={range} onValueChange={v => setRange(v as RangeValue)}>
          <SelectTrigger className="w-40 font-mukta text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RANGE_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value} className="font-mukta">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <p className="font-mukta text-sm text-red-600">
          {(error as Error).message || 'Failed to load remedy analytics.'}
        </p>
      )}

      <RemedyStatsGrid data={data} isLoading={isPending} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="rounded-2xl border-neutral-100 shadow-sm">
          <CardHeader className="px-6 pb-3 pt-5">
            <CardTitle className="font-mukta text-base font-semibold text-neutral-800">
              Top Remedies
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <TopRemediesTable data={data?.topRemedies} isLoading={isPending} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-neutral-100 shadow-sm">
          <CardHeader className="px-6 pb-3 pt-5">
            <CardTitle className="font-mukta text-base font-semibold text-neutral-800">
              Top Astrologers by Commission
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-5">
            <TopAstrologersTable data={data?.topAstrologersByCommission} isLoading={isPending} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

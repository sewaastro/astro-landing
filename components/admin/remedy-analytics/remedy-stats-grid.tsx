'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, TrendingUp, HandCoins, PiggyBank } from 'lucide-react';
import type { RemedyAnalytics } from '@/lib/remedy-analytics-api';

function formatCurrency(amount: number) {
  return `NPR ${amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

interface RemedyStatsGridProps {
  data: RemedyAnalytics | undefined;
  isLoading: boolean;
}

export function RemedyStatsGrid({ data, isLoading }: RemedyStatsGridProps) {
  const stats = [
    {
      label: 'Total Remedies Sold',
      value: data?.totalOrders,
      icon: ShoppingBag,
      isCurrency: false,
    },
    { label: 'Total Revenue', value: data?.totalRevenueGross, icon: TrendingUp, isCurrency: true },
    {
      label: 'Astrologer Commission Paid',
      value: data?.totalAstrologerCommissionPaid,
      icon: HandCoins,
      isCurrency: true,
    },
    {
      label: "Astro Sewa's Share",
      value: data?.totalAstroSewaShare,
      icon: PiggyBank,
      isCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, isCurrency }) => (
        <Card key={label} className="rounded-2xl border-neutral-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between px-4 pb-2 pt-4">
            <CardTitle className="font-mukta text-sm font-medium text-neutral-500">
              {label}
            </CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#611508]/10">
              <Icon className="h-4 w-4 text-[#611508]" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {isLoading ? (
              <Skeleton className="h-8 w-20 rounded-lg" />
            ) : (
              <p className="font-mukta text-3xl font-semibold text-neutral-800">
                {isCurrency ? formatCurrency(value ?? 0) : (value ?? 0).toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

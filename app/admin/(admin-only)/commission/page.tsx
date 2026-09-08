'use client';

import { CommissionRateCard } from '@/components/admin/commission/commission-rate-card';
import { TierManagementSection } from '@/components/admin/tiers/tier-management-section';
import { useAllCommissions } from '@/hooks/use-commission';

export default function CommissionPage() {
  const { data, isPending } = useAllCommissions();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-mukta text-2xl font-semibold text-neutral-800">Commission</h1>
        <p className="mt-0.5 font-mukta text-sm text-neutral-500">
          Set the commission percentage deducted from astrologer earnings for each earning source.
          Consultation and live-call commission is set per tier below.
        </p>
      </div>

      <div className="grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <CommissionRateCard
          source="remedy"
          title="Remedy Recommendation Commission"
          description="Paid when an astrologer recommends a Super-Admin-owned remedy via a consultation and the client buys it — a referral reward."
          fieldLabel="Astrologer's Commission Percentage (%)"
          notice="Note: this percentage represents the astrologer's share of the remedy price (the opposite of every other commission on this page)."
          settings={data?.remedy}
          isLoading={isPending}
        />
        <CommissionRateCard
          source="remedy_self_sale"
          title="Remedy Self-Sale Commission"
          description="Applied when an astrologer sells a remedy from their own catalog — Astro Sewa's platform fee on their sale."
          settings={data?.remedySelfSale}
          isLoading={isPending}
        />
        <CommissionRateCard
          source="gift"
          title="Gift Commission"
          description="Applied to gifts sent to astrologers"
          settings={data?.gift}
          isLoading={isPending}
        />
      </div>

      <TierManagementSection />
    </div>
  );
}

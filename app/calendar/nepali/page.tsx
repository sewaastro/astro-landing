import type { Metadata } from 'next';

import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import NepaliCalendarPageContent from '@/components/pages/calendar/nepali';
import SectionDivider from '@/components/ui/section-divider';

export const metadata: Metadata = {
  title: 'Nepali Calendar 2083 BS | AstroSewa',
  description:
    'Browse the Nepali Calendar 2083 BS with Bikram Sambat dates, Gregorian equivalents, and Nepali festivals. Your go-to Nepali patro online.',
  keywords: [
    'Nepali Calendar 2083 BS | AstroSewa',
    'Bikram Sambat calendar',
    'Nepali patro',
    'BS calendar online',
    'Nepali festival dates',
    'Nepali calendar 2083 BS',
  ],
};

export default function NepaliCalendarPage() {
  return (
    <main className="container mx-auto min-h-screen pt-6 sm:pt-8 lg:pt-10">
      <div className="px-6 lg:px-0">
        <NepaliCalendarPageContent />
        <SectionDivider className="mt-[20px] mb-[50px]" />
        <Clarity />
        <SectionDivider className="mt-[20px] mb-[50px]" />
        <TalkToOurAstrologer className="mx-auto max-w-[1180px]" />
        <SectionDivider className="mt-[20px] mb-[50px]" />
        <Services />
        <SectionDivider className="mt-[40px] mb-[10px]" />
        <DownloadApp noBorder />
      </div>
    </main>
  );
}

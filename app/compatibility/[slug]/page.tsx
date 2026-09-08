'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';

import { ELanguage } from '@/components/enums/language.enum';

import Services from '@/components/pages/landing/services';
import DownloadApp from '@/components/pages/landing/download-app';
import Clarity from '@/components/pages/landing/clarity';
import TalkToOurAstrologer from '@/components/pages/landing/talk-to-our-astrologer';
import ChevronDownIcon from '@/components/icons/chevron-down';
import { ZodiacSignExploreSection } from '@/components/pages/zodiac-sign/zodiac-sign-explore-section';
import {
  EnglishCancerColor,
  EnglishCancerLight,
  EnglishAriesColor,
  EnglishAriesLight,
  EnglishGeminiColor,
  EnglishGeminiLight,
  EnglishLeoColor,
  EnglishLeoLight,
  EnglishVirgoColor,
  EnglishVirgoLight,
  EnglishLibraColor,
  EnglishLibraLight,
  EnglishScorpioColor,
  EnglishScorpioLight,
  EnglishSagittariusColor,
  EnglishSagittariusLight,
  EnglishCapricornColor,
  EnglishCapricornLight,
  EnglishAquariusColor,
  EnglishAquariusLight,
  EnglishPiscesColor,
  EnglishPiscesLight,
  EnglishTaurusColor,
  EnglishTaurusLight,
} from '@/components/images/zodiac/english';
import { CompatibilityHoroscopeSection } from './compatibility-horoscope-section';
import { fetchVedastroHoroscopeList } from '@/lib/api/vedastro/horoscope';
import { buildTodayHoroscopeDisplayCards } from '@/lib/horoscope/build-today-horoscope-display-cards';
import { CompatibilitySignsGrid } from '@/components/ui/compatibility-signs-grid';
import { compatibilityMatchHref, parseCompatibilitySlug } from '@/lib/constants/compatibility-nav';
import {
  persistCardDisplayLanguage,
  readCardDisplayLanguage,
  useHoroscopeLocale,
} from '@/lib/i18n';
import { HOROSCOPE_SIGNS } from '@/lib/types/horoscope';
import type { HoroscopeSign } from '@/lib/types/horoscope';
import { postZodiacCompatibility } from '@/lib/api/compatibility';
import type { HoroscopeSummaryRow, ZodiacCompatibilityData } from '@/lib/types/vedastro';

const zodiacImageMap = {
  aries: { color: EnglishAriesColor, light: EnglishAriesLight },
  taurus: { color: EnglishTaurusColor, light: EnglishTaurusLight },
  gemini: { color: EnglishGeminiColor, light: EnglishGeminiLight },
  cancer: { color: EnglishCancerColor, light: EnglishCancerLight },
  leo: { color: EnglishLeoColor, light: EnglishLeoLight },
  virgo: { color: EnglishVirgoColor, light: EnglishVirgoLight },
  libra: { color: EnglishLibraColor, light: EnglishLibraLight },
  scorpio: { color: EnglishScorpioColor, light: EnglishScorpioLight },
  sagittarius: { color: EnglishSagittariusColor, light: EnglishSagittariusLight },
  capricorn: { color: EnglishCapricornColor, light: EnglishCapricornLight },
  aquarius: { color: EnglishAquariusColor, light: EnglishAquariusLight },
  pisces: { color: EnglishPiscesColor, light: EnglishPiscesLight },
} as const;

const signLabels: Record<HoroscopeSign, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
} as const;

const compatibilityTabs = [
  { key: 'love', label: 'Love' },
  { key: 'sex', label: 'Sex' },
  { key: 'friendship', label: 'Friendship' },
  { key: 'communication', label: 'Communication' },
  { key: 'strength', label: 'Strength' },
  { key: 'weakness', label: 'Weakness' },
] as const;

function RadioDot({ selected }: { selected: boolean }) {
  return selected ? (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="4.877" cy="4.877" r="4.377" fill="#611508" />
      <circle cx="4.877" cy="4.877" r="4.377" stroke="#141414" />
    </svg>
  ) : (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="4.877" cy="4.877" r="4.377" fill="#F8F3DF" stroke="#BE7B71" />
    </svg>
  );
}

export default function CompatibilityMatchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const parsedSlug = useMemo(() => {
    if (typeof params?.slug === 'string') {
      return parseCompatibilitySlug(params.slug);
    }
    return null;
  }, [params?.slug]);

  const { dict, uiLanguage } = useHoroscopeLocale();
  const signOptions = useMemo(() => HOROSCOPE_SIGNS, []);

  const initialYourSign = parsedSlug?.yourSign ?? 'cancer';
  const initialPartnerSign = parsedSlug?.partnerSign ?? 'taurus';
  const initialYourGender = parsedSlug?.yourGender ?? 'male';
  const initialPartnerGender = parsedSlug?.partnerGender ?? 'female';

  const [yourSign, setYourSign] = useState<HoroscopeSign>(initialYourSign);
  const [partnerSign, setPartnerSign] = useState<HoroscopeSign>(initialPartnerSign);
  const [pillYourSign, setPillYourSign] = useState<HoroscopeSign>(initialYourSign);
  const [pillPartnerSign, setPillPartnerSign] = useState<HoroscopeSign>(initialPartnerSign);
  const [yourGender, setYourGender] = useState<'male' | 'female'>(initialYourGender);
  const [partnerGender, setPartnerGender] = useState<'male' | 'female'>(initialPartnerGender);
  const [activeTab, setActiveTab] = useState<(typeof compatibilityTabs)[number]['key']>('love');
  const [compatibilityData, setCompatibilityData] = useState<ZodiacCompatibilityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const targetScore = compatibilityData?.overall_match_percent;
    let animReq: number;

    if (targetScore === undefined || loading) {
      let lastTime = 0;
      const calculateStep = (timestamp: number) => {
        if (timestamp - lastTime > 60) {
          setAnimatedScore(Math.floor(Math.random() * 90) + 10);
          lastTime = timestamp;
        }
        animReq = window.requestAnimationFrame(calculateStep);
      };
      animReq = window.requestAnimationFrame(calculateStep);
      return () => window.cancelAnimationFrame(animReq);
    }

    let startTimestamp: number | null = null;
    const duration = 1500;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setAnimatedScore(Math.floor(easeProgress * targetScore));

      if (progress < 1) {
        animReq = window.requestAnimationFrame(step);
      } else {
        setAnimatedScore(targetScore);
      }
    };

    animReq = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animReq);
  }, [compatibilityData?.overall_match_percent, loading]);

  const lastHandledQueryRef = useRef<string | null>(null);

  const [horoscopeCardLang] = useState<ELanguage>(() => readCardDisplayLanguage());
  const [exploreContentLanguage, setExploreContentLanguage] = useState<ELanguage>(uiLanguage);
  const [exploreHeaderLanguage, setExploreHeaderLanguage] = useState<ELanguage>(uiLanguage);
  const [horoscopeRows, setHoroscopeRows] = useState<HoroscopeSummaryRow[] | null>(null);
  const [horoscopeListError, setHoroscopeListError] = useState<string | null>(null);
  const [horoscopeListLoading, setHoroscopeListLoading] = useState(true);
  const [horoscopeListDate, setHoroscopeListDate] = useState<string | null>(null);

  useEffect(() => {
    persistCardDisplayLanguage(horoscopeCardLang);
  }, [horoscopeCardLang]);

  useEffect(() => {
    setExploreContentLanguage(uiLanguage);
    setExploreHeaderLanguage(uiLanguage);
  }, [uiLanguage]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setHoroscopeListLoading(true);
      setHoroscopeListError(null);
      setHoroscopeRows(null);
      fetchVedastroHoroscopeList({ type: 'today' })
        .then(envelope => {
          if (cancelled) return;
          setHoroscopeRows(envelope.data?.data ?? []);
          setHoroscopeListDate(envelope.data?.date ?? envelope.data?.end_date ?? null);
        })
        .catch((e: unknown) => {
          if (!cancelled) {
            setHoroscopeListError(e instanceof Error ? e.message : 'Could not load horoscopes.');
            setHoroscopeRows([]);
          }
        })
        .finally(() => {
          if (!cancelled) setHoroscopeListLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const horoscopeSectionCards = useMemo(
    () =>
      buildTodayHoroscopeDisplayCards({
        rows: horoscopeRows,
        listLoading: horoscopeListLoading,
        listError: horoscopeListError,
        signLanguage: horoscopeCardLang,
        listDate: horoscopeListDate,
      }),
    [horoscopeRows, horoscopeListLoading, horoscopeListError, horoscopeCardLang, horoscopeListDate],
  );

  const isValidGender = useCallback((value: string | null): value is 'male' | 'female' => {
    return value === 'male' || value === 'female';
  }, []);

  const isValidSign = useCallback((value: string | null): value is HoroscopeSign => {
    return !!value && HOROSCOPE_SIGNS.includes(value as HoroscopeSign);
  }, []);

  const fetchCompatibility = useCallback(
    async (
      overrides?: Partial<{
        yourSign: HoroscopeSign;
        partnerSign: HoroscopeSign;
        yourGender: 'male' | 'female';
        partnerGender: 'male' | 'female';
      }>,
    ) => {
      const payload = {
        your_sign: overrides?.yourSign ?? yourSign,
        your_gender: overrides?.yourGender ?? yourGender,
        partner_sign: overrides?.partnerSign ?? partnerSign,
        partner_gender: overrides?.partnerGender ?? partnerGender,
      };

      try {
        setLoading(true);
        setError(null);
        const response = await postZodiacCompatibility(payload);
        if (response.success && response.data) {
          setCompatibilityData(response.data);
          setPillYourSign(payload.your_sign);
          setPillPartnerSign(payload.partner_sign);
        } else {
          setError('Failed to fetch compatibility data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Compatibility API error:', err);
      } finally {
        setLoading(false);
      }
    },
    [yourSign, partnerSign, yourGender, partnerGender],
  );

  const handleFindNow = useCallback(() => {
    const nextRoute = compatibilityMatchHref(yourSign, partnerSign, yourGender, partnerGender);
    if (nextRoute !== pathname) {
      router.push(nextRoute);
      return;
    }
    void fetchCompatibility();
  }, [yourSign, partnerSign, yourGender, partnerGender, pathname, router, fetchCompatibility]);

  useEffect(() => {
    const incomingYourSign = parsedSlug?.yourSign || searchParams.get('your_sign');
    const incomingPartnerSign = parsedSlug?.partnerSign || searchParams.get('partner_sign');
    const incomingYourGender = parsedSlug?.yourGender || searchParams.get('your_gender');
    const incomingPartnerGender = parsedSlug?.partnerGender || searchParams.get('partner_gender');

    if (
      !isValidSign(incomingYourSign) ||
      !isValidSign(incomingPartnerSign) ||
      !isValidGender(incomingYourGender) ||
      !isValidGender(incomingPartnerGender)
    ) {
      return;
    }

    const queryKey = `${incomingYourSign}-${incomingYourGender}-and-${incomingPartnerSign}-${incomingPartnerGender}`;

    if (lastHandledQueryRef.current === queryKey) return;
    lastHandledQueryRef.current = queryKey;

    setYourSign(incomingYourSign);
    setPartnerSign(incomingPartnerSign);
    setYourGender(incomingYourGender);
    setPartnerGender(incomingPartnerGender);

    void fetchCompatibility({
      yourSign: incomingYourSign,
      partnerSign: incomingPartnerSign,
      yourGender: incomingYourGender,
      partnerGender: incomingPartnerGender,
    });
  }, [searchParams, parsedSlug, isValidSign, isValidGender, fetchCompatibility]);

  const getTabContent = useCallback(() => {
    if (!compatibilityData) return null;
    const category = compatibilityData.categories.find(cat => cat.key === activeTab);
    return category?.narrative || '';
  }, [compatibilityData, activeTab]);

  const getTabScoreMap = useCallback(() => {
    if (!compatibilityData) return {};
    const scoreMap: Record<string, number> = {};
    compatibilityData.categories.forEach(cat => {
      scoreMap[cat.key] = cat.match_percent || 0;
    });
    return scoreMap;
  }, [compatibilityData]);

  const scoreMap = getTabScoreMap();
  const currentScore = scoreMap[activeTab] || 0;

  return (
    <main className="min-h-screen pt-6 sm:pt-8 lg:pt-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-0">
        <section className="flex flex-col gap-10 pb-20 sm:gap-20">
          {/* ── Hero / Header ── */}
          <div className="flex flex-col gap-6">
            {/* ── Mobile: stacked hero layout ── */}
            <div className="flex flex-col gap-3 border-b border-[#F8F3DF] pb-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Title */}
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <h1 className="font-sahitya text-[24px] font-bold leading-[48px] text-primary sm:text-[36px] sm:leading-[48px]">
                  Zodiac Compatibility
                </h1>
                <p className="font-mukta text-[20px] font-medium leading-[30px] text-[#141414] sm:text-[24px] sm:leading-[30px]">
                  Love, Sex, Friendship &amp; More
                </p>
              </div>

              {/* Zodiac pair pill — mobile centered, desktop inline */}
              <div className="flex items-center justify-center">
                <div className="relative flex items-center justify-center overflow-hidden rounded-[48px] px-4 py-4 backdrop-blur-md sm:px-10 sm:py-6">
                  {/* Your sign */}
                  <div className="flex items-center gap-2">
                    <span className="font-mukta text-[14px] font-medium uppercase leading-[20px] text-primary sm:text-[20px] sm:leading-[28px]">
                      {signLabels[pillYourSign]}
                    </span>
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#BE7B71] bg-secondary p-2 sm:h-[84px] sm:w-[84px] sm:p-3">
                      <Image
                        src={zodiacImageMap[pillYourSign].color}
                        alt={pillYourSign}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Heart icon — centered between the two circles */}
                  <div className="z-20 mx-[-10px] flex-shrink-0">
                    <svg
                      width="28"
                      height="26"
                      viewBox="0 0 37 34"
                      fill="none"
                      className="sm:w-[37px] sm:h-[34px]"
                    >
                      <path
                        d="M18.3333 33.6417L15.675 31.2217C6.23333 22.66 0 16.995 0 10.0833C0 4.41833 4.43667 0 10.0833 0C13.2733 0 16.335 1.485 18.3333 3.81333C20.3317 1.485 23.3933 0 26.5833 0C32.23 0 36.6667 4.41833 36.6667 10.0833C36.6667 16.995 30.4333 22.66 20.9917 31.2217L18.3333 33.6417Z"
                        fill="#862C23"
                      />
                    </svg>
                  </div>

                  {/* Partner sign */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-[#BE7B71] bg-secondary p-2 sm:h-[84px] sm:w-[84px] sm:p-3">
                      <Image
                        src={zodiacImageMap[pillPartnerSign].color}
                        alt={pillPartnerSign}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="font-mukta text-[14px] font-medium uppercase leading-[20px] text-primary sm:text-[20px] sm:leading-[28px]">
                      {signLabels[pillPartnerSign]}
                    </span>
                  </div>
                </div>
              </div>

              {/* Match % — centered on mobile, right-aligned on desktop */}
              <div className="text-center lg:text-right">
                <span className="font-raleway text-[36px] font-bold leading-[44px] text-primary sm:text-[48px] sm:leading-[56px] lg:text-[59px] lg:leading-[65px]">
                  {animatedScore}%{' '}
                  <span className="text-[28px] sm:text-[40px] lg:text-[52px]">Matched</span>
                </span>
              </div>
            </div>

            {/* Content + Sidebar row */}
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-8">
              {/* Left: tabs + score + description */}
              <div className="flex flex-1 flex-col gap-2.5">
                {/* Tabs — horizontal scroll on mobile */}
                <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex min-w-max gap-2">
                    {compatibilityTabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={clsx(
                          'flex-none rounded-[8px] px-4 py-2 sm:px-5 sm:py-3 font-mukta text-[13px] sm:text-[20px] font-medium uppercase leading-[18px] sm:leading-[28px] transition-colors whitespace-nowrap',
                          activeTab === tab.key
                            ? 'bg-primary text-secondary'
                            : 'bg-secondary text-primary hover:bg-[#ede8d1]',
                        )}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Score row */}
                <div className="mt-2 flex flex-col gap-3 sm:mt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mukta text-[18px] font-medium leading-[26px] text-primary capitalize sm:text-[24px] sm:leading-[32px]">
                      {activeTab} Compatibility
                    </span>
                    <span className="font-mukta text-[18px] font-semibold text-primary sm:text-[20px]">
                      {loading ? '…' : `${currentScore}%`}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-[8px] w-full overflow-hidden rounded-full bg-[#e0d0c0]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FFC107] via-[#FF9800] to-[#E74C8C] transition-all duration-500"
                      style={{ width: `${loading ? 0 : currentScore}%` }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="font-mukta text-[15px] leading-[28px] text-[#464646] sm:text-[16px] sm:leading-[32px] text-center sm:text-left">
                  {loading ? (
                    <p className="animate-pulse text-[#888]">Loading compatibility details…</p>
                  ) : error ? (
                    <p className="text-red-600">Error: {error}</p>
                  ) : getTabContent() ? (
                    <ul className="flex flex-col gap-3">
                      {getTabContent()!
                        .split(/(?:\r?\n)+|\.\s+/)
                        .map(s => s.trim())
                        .filter(Boolean)
                        .map((sentence, i) => {
                          const text = sentence.match(/[.!?]$/) ? sentence : `${sentence}.`;
                          return (
                            <li key={i} className="flex gap-3 items-start">
                              <span className="mt-[11px] h-2 w-2 flex-shrink-0 rounded-full bg-primary/70" />
                              <span>{text}</span>
                            </li>
                          );
                        })}
                    </ul>
                  ) : (
                    <p>No additional details available for this compatibility aspect.</p>
                  )}
                </div>
              </div>

              {/* Right: Find Compatible Partner — full width on mobile, sidebar on desktop */}
              <div className="w-full rounded-[20px] border-0 bg-transparent p-4 sm:border sm:border-[#BE7B71] sm:bg-[#F8F3DF] sm:p-6 lg:w-[354px] lg:flex-shrink-0 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
                <h3 className="text-center font-mukta text-[28px] font-bold leading-[38px] tracking-[0px] text-primary sm:text-left sm:text-[20px] sm:leading-[28px]">
                  Find Your Compatible Partner?
                </h3>
                <p className="mt-1 text-center font-mukta text-[14px] leading-[22px] text-[#464646] sm:text-left sm:text-[16px] sm:leading-[24px]">
                  Choose your and your partner&apos;s zodiac sign to check compatibility
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Your Sign column */}
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    {/* Zodiac circle — smaller on mobile */}
                    <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border border-[#BE7B71] bg-secondary p-3 sm:h-[130px] sm:w-[130px] sm:p-4 lg:h-[165px] lg:w-[165px] lg:p-4">
                      <Image
                        src={zodiacImageMap[yourSign].color}
                        alt={yourSign}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex w-full flex-col gap-1.5">
                      <p className="text-center font-mukta text-[13px] font-medium text-Trinary sm:text-[16px]">
                        Your Sign
                      </p>
                      <div className="relative">
                        <select
                          value={yourSign}
                          onChange={e => setYourSign(e.target.value as HoroscopeSign)}
                          className="w-full appearance-none rounded-[32px] border border-Trinary bg-white px-3 py-1 pr-7 text-center font-mukta text-[13px] font-medium uppercase leading-[22px] text-primary sm:px-4 sm:py-1.5 sm:pr-8 sm:text-[16px] sm:leading-[28px]"
                        >
                          {signOptions.map(s => (
                            <option key={s} value={s}>
                              {signLabels[s]}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-primary sm:right-3 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                    {/* Gender radio */}
                    <div className="flex items-center gap-2 font-mukta text-[12px] font-medium leading-[18px] text-[#141414] sm:text-[16px]">
                      <label className="inline-flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          name="yourGender"
                          className="sr-only"
                          checked={yourGender === 'male'}
                          onChange={() => setYourGender('male')}
                        />
                        <RadioDot selected={yourGender === 'male'} />
                        <span>Man</span>
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          name="yourGender"
                          className="sr-only"
                          checked={yourGender === 'female'}
                          onChange={() => setYourGender('female')}
                        />
                        <RadioDot selected={yourGender === 'female'} />
                        <span>Woman</span>
                      </label>
                    </div>
                  </div>

                  {/* Partner's Sign column */}
                  <div className="flex flex-col items-center gap-2 sm:gap-3">
                    <div className="flex h-[100px] w-[100px] items-center justify-center rounded-full border border-[#BE7B71] bg-secondary p-3 sm:h-[130px] sm:w-[130px] sm:p-4 lg:h-[165px] lg:w-[165px] lg:p-4">
                      <Image
                        src={zodiacImageMap[partnerSign].color}
                        alt={partnerSign}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex w-full flex-col gap-1.5">
                      <p className="text-center font-mukta text-[13px] font-medium text-Trinary sm:text-[16px]">
                        Partner&apos;s Sign
                      </p>
                      <div className="relative">
                        <select
                          value={partnerSign}
                          onChange={e => setPartnerSign(e.target.value as HoroscopeSign)}
                          className="w-full appearance-none rounded-[32px] border border-Trinary bg-white px-3 py-1 pr-7 text-center font-mukta text-[13px] font-medium uppercase leading-[22px] text-primary sm:px-4 sm:py-1.5 sm:pr-8 sm:text-[16px] sm:leading-[28px]"
                        >
                          {signOptions.map(s => (
                            <option key={s} value={s}>
                              {signLabels[s]}
                            </option>
                          ))}
                        </select>
                        <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-primary sm:right-3 sm:h-4 sm:w-4" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 font-mukta text-[12px] font-medium leading-[18px] text-[#141414] sm:text-[16px]">
                      <label className="inline-flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          name="partnerGender"
                          className="sr-only"
                          checked={partnerGender === 'male'}
                          onChange={() => setPartnerGender('male')}
                        />
                        <RadioDot selected={partnerGender === 'male'} />
                        <span>Man</span>
                      </label>
                      <label className="inline-flex cursor-pointer items-center gap-1">
                        <input
                          type="radio"
                          name="partnerGender"
                          className="sr-only"
                          checked={partnerGender === 'female'}
                          onChange={() => setPartnerGender('female')}
                        />
                        <RadioDot selected={partnerGender === 'female'} />
                        <span>Woman</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Find Now button */}
                <button
                  onClick={handleFindNow}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-[24px] bg-primary py-2.5 font-mukta text-[15px] font-semibold leading-[26px] text-secondary sm:py-2 sm:text-[16px] sm:leading-[28px]"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="sm:w-6 sm:h-6"
                  >
                    <path
                      d="M19.3 14.9C19.7 14.2 20 13.4 20 12.5C20 10 18 8 15.5 8C13 8 11 10 11 12.5C11 15 13 17 15.5 17C16.4 17 17.2 16.7 17.9 16.3L20.8 19.2L22.2 17.8L19.3 14.9ZM15.5 15C14.1 15 13 13.9 13 12.5C13 11.1 14.1 10 15.5 10C16.9 10 18 11.1 18 12.5C18 13.9 16.9 15 15.5 15ZM14.7 18.9C14.3 19.3 13.9 19.6 13.5 20L12 21.3L10.5 20C5.4 15.4 2 12.3 2 8.5C2 5.4 4.4 3 7.5 3C9.2 3 10.9 3.8 12 5.1C13.1 3.8 14.8 3 16.5 3C19.6 3 22 5.4 22 8.5C22 9.2 21.9 9.8 21.7 10.5C20.8 7.9 18.4 6 15.5 6C11.9 6 9 8.9 9 12.5C9 15.8 11.5 18.5 14.7 18.9Z"
                      fill="#F8F3DF"
                    />
                  </svg>
                  Find Now
                </button>
              </div>
            </div>
          </div>

          {/* ── Compatibility With Other Signs ── */}
          <div className="flex flex-col gap-6 sm:gap-8">
            <h2 className="font-sahitya text-[22px] font-bold leading-[30px] text-primary sm:text-[28px] sm:leading-[38px]">
              Compatibility With Other Signs
            </h2>

            <CompatibilitySignsGrid
              title=""
              currentSignLabel={signLabels[yourSign]}
              currentSignImage={zodiacImageMap[yourSign].color}
              currentSignImageLight={zodiacImageMap[yourSign].light}
              items={signOptions.map(secondSign => ({
                slug: secondSign,
                name: signLabels[secondSign],
                image: zodiacImageMap[secondSign].color,
                imageLight: zodiacImageMap[secondSign].light,
                href: compatibilityMatchHref(yourSign, secondSign),
              }))}
              variant="figma"
            />
          </div>

          <div className="sm:hidden">
            <ZodiacSignExploreSection
              title="Explore Other Zodiac Signs"
              contentLanguage={exploreContentLanguage}
              headerLanguage={exploreHeaderLanguage}
              signSlug={yourSign}
              isNepali={exploreContentLanguage === ELanguage.NEPALI}
              onContentLanguageChange={lang => {
                setExploreContentLanguage(lang);
                setExploreHeaderLanguage(lang);
              }}
            />
          </div>

          <div className="hidden sm:block">
            <CompatibilityHoroscopeSection
              title="Read Horoscope For Other Zodiac Signs"
              cards={horoscopeSectionCards}
              listError={horoscopeListError}
              uiLanguage={uiLanguage}
              readMoreLabel={dict.list.readMore}
              emptyLabel={dict.list.empty}
              errorFallbackSuffix={dict.list.errorFallbackSuffix}
              horoscopeCardLang={horoscopeCardLang}
            />
          </div>

          <Clarity />
        </section>
      </div>

      <TalkToOurAstrologer className="mx-auto mt-10 max-w-[1180px] sm:mt-14" />

      <Services />

      <div className="mt-14">
        <DownloadApp />
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import { Tiro_Devanagari_Sanskrit, Sahitya, Mukta, Raleway, Lato } from 'next/font/google';
import Script from 'next/script';
import { SessionProvider } from 'next-auth/react';

import './globals.css';
import clsx from 'clsx';

import { SiteChrome } from '@/components/layout/site-chrome';
import { env } from '@/lib/env';

const tiroDevanagari = Tiro_Devanagari_Sanskrit({
  variable: '--font-tiro-devanagari',
  subsets: ['latin', 'devanagari'],
  weight: '400',
});

const sahitya = Sahitya({
  variable: '--font-sahitya',
  subsets: ['latin', 'devanagari'],
  weight: ['400', '700'],
});

const mukta = Mukta({
  variable: '--font-mukta',
  subsets: ['latin', 'devanagari'],
  weight: '400',
});

const raleway = Raleway({
  variable: '--font-raleway',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const lato = Lato({
  variable: '--font-lato',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const SITE_URL = env.siteUrl;

export const metadata: Metadata = {
  title: {
    default: "Astro Sewa - Nepal's Trusted Online Astrology Platform",
    template: '%s | Astro Sewa',
  },
  description:
    "Astro Sewa is Nepal's most trusted online astrology platform, connecting you with over 1000+ verified and experienced astrologers. Get personalized Vedic astrology guidance, daily horoscopes, birth chart readings, and expert consultations for love, career, health, and finances.",
  keywords: [
    'astrology',
    'vedic astrology',
    'online astrology',
    'astrologer consultation',
    'horoscope',
    'birth chart',
    'Nepal astrology',
    'astrology Nepal',
    'astrologer Nepal',
    'daily horoscope',
    'astrology reading',
    'puja bidhi',
    'Astro Sewa',
  ],
  authors: [{ name: 'Astro Sewa Pvt. Ltd.' }],
  creator: 'Astro Sewa Pvt. Ltd.',
  publisher: 'Astro Sewa Pvt. Ltd.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Astro Sewa',
    title: "Astro Sewa - Nepal's Trusted Online Astrology Platform",
    description:
      'Connect with 1000+ verified astrologers for personalized Vedic astrology guidance, daily horoscopes, and expert consultations.',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: "Astro Sewa - Nepal's Trusted Online Astrology Platform",
      },
    ],
  },
  icons: {
    icon: [
      {
        url: '/light_favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/dark_favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        media: '(prefers-color-scheme: light)',
      },
    ],
    shortcut: [
      {
        url: '/light_favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/dark_favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        media: '(prefers-color-scheme: light)',
      },
    ],
    apple: [
      {
        url: '/light_favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/dark_favicon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        media: '(prefers-color-scheme: light)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Astro Sewa - Nepal's Trusted Online Astrology Platform",
    description:
      'Connect with 1000+ verified astrologers for personalized Vedic astrology guidance, daily horoscopes, and expert consultations.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="en">
      <body
        className={clsx(
          tiroDevanagari.variable,
          sahitya.variable,
          mukta.variable,
          raleway.variable,
          lato.variable,
          `antialiased`,
        )}
      >
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Astro Sewa',
              legalName: 'Astro Sewa Pvt. Ltd.',
              url: SITE_URL,
              logo: `${SITE_URL}/logo.png`,
              description:
                "Nepal's trusted online astrology platform connecting seekers with 1000+ verified Vedic astrologers.",
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Shankhamul 10, New Baneshwor',
                addressLocality: 'Kathmandu',
                addressCountry: 'NP',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+9779818080676',
                contactType: 'customer support',
                email: 'support@astrosewa.com',
              },
              sameAs: [],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Astro Sewa',
              url: SITE_URL,
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${SITE_URL}/blogs?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        <SessionProvider>
          <SiteChrome>{children}</SiteChrome>
        </SessionProvider>
      </body>
    </html>
  );
}

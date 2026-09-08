'use server';

import { redirect } from 'next/navigation';

import { tryGetPublicBackendBaseUrl } from '@/lib/utils/url';

export async function signInWithGoogleForFreeKundali() {
  const apiRoot = tryGetPublicBackendBaseUrl();
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  // This redirect URI must match the one configured in Google Cloud Console.
  const redirectUri = `${siteUrl}/api/auth/callback/google`;
  redirect(
    `${apiRoot}/auth/google/url?redirectUri=${encodeURIComponent(
      redirectUri,
    )}&deviceType=WEB&state=REQUEST`,
  );
}

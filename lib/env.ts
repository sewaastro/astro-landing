const required = (value: string | undefined, name: string): string => {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const ghostContentApiUrl =
  process.env.GHOST_CONTENT_API_URL ?? process.env.BLOG_API;
const ghostContentApiKey =
  process.env.GHOST_CONTENT_API_KEY ?? process.env.CONTENT_API_KEY;
const ghostContentApiVersion =
  process.env.GHOST_CONTENT_API_VERSION ?? 'v5.0';

// Strip trailing slashes so callers can safely do `${siteUrl}/path` without
// risking a double slash if the env var was configured with one (e.g. "https://example.com/").
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.astrosewa.com').replace(
  /\/$/,
  ''
);

export const env = {
  ghostContentApiUrl: required(
    ghostContentApiUrl,
    'GHOST_CONTENT_API_URL (or BLOG_API)'
  ),
  ghostContentApiKey: required(
    ghostContentApiKey,
    'GHOST_CONTENT_API_KEY (or CONTENT_API_KEY)'
  ),
  ghostContentApiVersion,
  siteUrl,
} as const;

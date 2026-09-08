import type { MetadataRoute } from 'next';
import { ghostClient } from '@/lib/ghostClient';
import { env } from '@/lib/env';

// Always fetch from Ghost on every request so new/updated/deleted posts
// appear in the sitemap immediately without needing webhook configuration.
export const dynamic = 'force-dynamic';

const BASE_URL = env.siteUrl;

const STATIC_PAGES: MetadataRoute.Sitemap = [
  {
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1,
  },
  {
    url: `${BASE_URL}/horoscope`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: `${BASE_URL}/calendar`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/free-kundali`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/blogs`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/zodiac-sign`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: `${BASE_URL}/zodiac-sign/zodiac-nepali`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/compatibility`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/puja-bidhi`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: `${BASE_URL}/about-us`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  },
  {
    url: `${BASE_URL}/pricing-policy`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.4,
  },
  {
    url: `${BASE_URL}/disclaimer`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
  {
    url: `${BASE_URL}/terms-and-conditions`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.3,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let blogEntries: MetadataRoute.Sitemap = [];
  let pujaBidhiEntries: MetadataRoute.Sitemap = [];

  try {
    const [allPosts, pujaPosts] = await Promise.all([
      ghostClient.posts.browse({ limit: 'all', fields: ['slug', 'updated_at'] }),
      ghostClient.posts.browse({
        filter: 'tag:puja-bidhi',
        limit: 'all',
        fields: ['slug', 'updated_at'],
      }),
    ]);

    const pujaSlugSet = new Set(pujaPosts.map(p => p.slug));

    blogEntries = allPosts
      .filter(post => !pujaSlugSet.has(post.slug))
      .map(post => ({
        url: `${BASE_URL}/blogs/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));

    pujaBidhiEntries = pujaPosts.map(post => ({
      url: `${BASE_URL}/puja-bidhi/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Sitemap: failed to fetch Ghost posts', error);
  }

  return [...STATIC_PAGES, ...blogEntries, ...pujaBidhiEntries];
}

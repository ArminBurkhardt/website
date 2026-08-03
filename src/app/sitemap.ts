import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-03');
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/en`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
}

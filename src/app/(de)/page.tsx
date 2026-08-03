import type { Metadata } from 'next';
import { Site } from '@/components/Site';
import { getDict } from '@/content/site';
import { SITE_URL } from '@/config/site';

const dict = getDict('de');

export const metadata: Metadata = {
  title: dict.meta.title,
  description: dict.meta.description,
  alternates: { canonical: '/', languages: { de: '/', en: '/en' } },
  openGraph: {
    title: dict.meta.title,
    description: dict.meta.description,
    url: '/',
    siteName: 'Armin Burkhardt',
    locale: 'de_DE',
    type: 'website',
    images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: 'Armin Burkhardt' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: dict.meta.title,
    description: dict.meta.description,
  },
};

export default function Page() {
  return <Site locale="de" />;
}

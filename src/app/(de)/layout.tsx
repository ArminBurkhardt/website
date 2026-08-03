import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/config/site';
import { Shell } from '../shell';

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell lang="de">{children}</Shell>;
}

import type { Metadata, Viewport } from 'next';
import { DEFAULT_THEME, SITE_URL } from '@/config/site';
import { Shell } from '../shell';

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

// Matches DEFAULT_THEME rather than the OS preference, which the site deliberately ignores.
export const viewport: Viewport = {
  themeColor: DEFAULT_THEME === 'dark' ? '#0a0a0a' : '#fafaf9',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell lang="de">{children}</Shell>;
}

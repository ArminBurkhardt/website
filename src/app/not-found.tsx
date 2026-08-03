import type { Metadata } from 'next';
import Link from 'next/link';
import { DEFAULT_LOCALE, SITE_URL } from '@/config/site';
import { getDict } from '@/content/site';
import { Shell } from './shell';
import styles from './not-found.module.css';

// Next renders one global 404 outside both locale route groups, so it uses the default locale.
const dict = getDict(DEFAULT_LOCALE);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: dict.notFound.metaTitle,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Shell lang={DEFAULT_LOCALE}>
      <main className={styles.wrap}>
        <p className="mono">404</p>
        <h1 className={styles.title}>{dict.notFound.heading}</h1>
        <p className={styles.body}>{dict.notFound.body}</p>
        <Link className={styles.link} href="/">
          {dict.notFound.home} <span aria-hidden="true">↗</span>
        </Link>
      </main>
    </Shell>
  );
}

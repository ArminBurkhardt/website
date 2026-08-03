import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_URL } from '@/config/site';
import { Shell } from './shell';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Seite nicht gefunden — Armin Burkhardt',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Shell lang="de">
      <main className={styles.wrap}>
        <p className="mono">404</p>
        <h1 className={styles.title}>Seite nicht gefunden</h1>
        <p className={styles.body}>Diese Seite existiert nicht — oder nicht mehr.</p>
        <Link className={styles.link} href="/">
          Zur Startseite <span aria-hidden="true">↗</span>
        </Link>
      </main>
    </Shell>
  );
}

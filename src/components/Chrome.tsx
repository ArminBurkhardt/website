'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Dict, Locale } from '@/content/types';
import { useTheme } from '@/hooks/useTheme';
import { useActiveSection } from '@/hooks/useActiveSection';
import styles from './Chrome.module.css';

const SECTION_IDS = ['start', 'intro', 'projects', 'links'] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SECTION_KEYS: Record<SectionId, keyof Dict['sections']> = {
  start: 'start',
  intro: 'intro',
  projects: 'projects',
  links: 'links',
};

export function Chrome({ dict, locale }: { dict: Dict; locale: Locale }) {
  const { theme, toggle, mounted } = useTheme();
  const active = useActiveSection(SECTION_IDS);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      progressRef.current?.style.setProperty('--progress', ratio.toFixed(4));
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const activeId: SectionId = SECTION_IDS.includes(active as SectionId)
    ? (active as SectionId)
    : 'start';
  const markerIndex = String(SECTION_IDS.indexOf(activeId)).padStart(2, '0');
  const themeLabel = theme === 'dark' ? dict.a11y.themeToLight : dict.a11y.themeToDark;

  return (
    <>
      <div ref={progressRef} className={styles.progress} data-testid="progress" aria-hidden="true" />
      <header className={styles.header}>
        <a href="#start" className={`mono ${styles.wordmark}`}>
          {dict.hero.name}
        </a>
        <nav className={styles.controls} aria-label={dict.a11y.localeSwitch}>
          <button
            type="button"
            className={styles.control}
            onClick={toggle}
            aria-label={themeLabel}
            title={themeLabel}
            data-testid="theme-toggle"
            suppressHydrationWarning
          >
            <span aria-hidden="true">{mounted && theme === 'light' ? '☀' : '☾'}</span>
          </button>
          <span className={`mono ${styles.locales}`}>
            <span data-testid="locale-current" aria-current="true">
              {locale.toUpperCase()}
            </span>
            <span aria-hidden="true"> / </span>
            <Link
              href={locale === 'de' ? '/en' : '/'}
              className={styles.localeLink}
              data-testid="locale-toggle"
              hrefLang={locale === 'de' ? 'en' : 'de'}
            >
              {locale === 'de' ? 'EN' : 'DE'}
            </Link>
          </span>
        </nav>
      </header>
      <p className={`mono ${styles.marker}`} data-testid="section-marker" aria-hidden="true">
        {markerIndex} / 03 - {dict.sections[SECTION_KEYS[activeId]]}
      </p>
    </>
  );
}

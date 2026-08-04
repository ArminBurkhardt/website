'use client';

import type { CSSProperties } from 'react';
import type { Dict } from '@/content/types';
import { useScrolled } from '@/hooks/useScrolled';
import styles from './Hero.module.css';

export function Hero({ dict }: { dict: Dict }) {
  const scrolled = useScrolled();
  return (
    <section id="start" className={styles.hero} aria-labelledby="hero-name">
      <p className={`mono ${styles.kicker}`} style={{ '--i': 0 } as CSSProperties}>
        {dict.hero.kicker}
      </p>
      <h1 id="hero-name" className={styles.name} style={{ '--i': 1 } as CSSProperties}>
        {dict.hero.name}
      </h1>
      <p className={styles.positioning} style={{ '--i': 2 } as CSSProperties}>
        {dict.hero.positioning}
      </p>
      <p
        className={`mono ${styles.scroll}`}
        style={{ '--i': 3 } as CSSProperties}
        data-hidden={scrolled}
        aria-hidden={scrolled}
      >
        {dict.hero.scroll}
        <span aria-hidden="true" className={styles.scrollLine} />
      </p>
    </section>
  );
}

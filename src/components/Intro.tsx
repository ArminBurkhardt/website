'use client';

import type { CSSProperties } from 'react';
import type { Dict } from '@/content/types';
import { useReveal } from '@/hooks/useReveal';
import { SectionHeading } from './SectionHeading';
import styles from './Intro.module.css';

export function Intro({ dict }: { dict: Dict }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  return (
    <section
      id="intro"
      ref={ref}
      data-revealed={revealed}
      className={styles.section}
      aria-labelledby="intro-heading"
    >
      <SectionHeading index={dict.intro.index} label={dict.intro.label} id="intro-heading" />
      <p className={styles.body} style={{ '--i': 0 } as CSSProperties}>
        {dict.intro.body}
      </p>
      <dl className={styles.facts}>
        {dict.intro.facts.map((fact, index) => (
          <div
            key={fact.label}
            className={styles.fact}
            data-testid="fact"
            style={{ '--i': index + 1 } as CSSProperties}
          >
            <dt className={`mono ${styles.factLabel}`}>{fact.label}</dt>
            <dd className={styles.factValue}>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

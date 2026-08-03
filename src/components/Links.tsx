'use client';

import type { CSSProperties, PointerEvent } from 'react';
import { LINKS } from '@/config/site';
import type { Dict } from '@/content/types';
import { useReveal } from '@/hooks/useReveal';
import { SectionHeading } from './SectionHeading';
import styles from './Links.module.css';

const items = [
  { key: 'linkedin', href: LINKS.linkedin },
  { key: 'github', href: LINKS.github },
] as const;

export function Links({ dict }: { dict: Dict }) {
  const { ref, revealed } = useReveal<HTMLElement>();

  function track(event: PointerEvent<HTMLAnchorElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = Math.max(-6, Math.min(6, (event.clientX - rect.right + 40) / 6));
    event.currentTarget.style.setProperty('--arrow-x', `${offset}px`);
  }

  return (
    <section
      id="links"
      ref={ref}
      data-revealed={revealed}
      className={styles.section}
      aria-labelledby="links-heading"
    >
      <SectionHeading index={dict.links.index} label={dict.links.label} id="links-heading" />
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={item.key} className={styles.item} style={{ '--i': index } as CSSProperties}>
            <a
              className={styles.link}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onPointerMove={track}
              onPointerLeave={(event) => event.currentTarget.style.removeProperty('--arrow-x')}
            >
              <span>{dict.links[item.key]}</span>
              <span aria-hidden="true" className={styles.arrow}>
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

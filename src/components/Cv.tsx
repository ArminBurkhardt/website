'use client';

import type { CSSProperties } from 'react';
import type { Dict, Locale } from '@/content/types';
import { CV_GROUPS } from '@/content/types';
import { cv } from '@/content/cv';
import { useReveal } from '@/hooks/useReveal';
import { SectionHeading } from './SectionHeading';
import styles from './Cv.module.css';

const NUMBER_LOCALE: Record<Locale, string> = { de: 'de-DE', en: 'en-GB' };

export function Cv({ dict, locale }: { dict: Dict; locale: Locale }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  const gradeFormat = new Intl.NumberFormat(NUMBER_LOCALE[locale], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <section
      id="cv"
      ref={ref}
      data-revealed={revealed}
      className={styles.section}
      aria-labelledby="cv-heading"
    >
      <SectionHeading index={dict.cv.index} label={dict.cv.label} id="cv-heading" />
      <div className={styles.groups}>
        {CV_GROUPS.map((group) => {
          const entries = cv.filter((entry) => entry.group === group);
          if (entries.length === 0) return null;
          return (
            <div key={group} className={styles.group}>
              <h3 className={`mono ${styles.groupLabel}`}>{dict.cv.groups[group]}</h3>
              <ul className={styles.list}>
                {entries.map((entry) => {
                  const copy = entry[locale];
                  return (
                    <li
                      key={entry.id}
                      className={styles.entry}
                      data-testid="cv-entry"
                      // Staggers across the whole section, so later groups arrive after earlier ones.
                      style={{ '--i': cv.indexOf(entry) } as CSSProperties}
                    >
                      <div className={styles.main}>
                        <h4 className={styles.title}>{copy.title}</h4>
                        <p className={styles.org}>{copy.org}</p>
                        {copy.detail && <p className={styles.detail}>{copy.detail}</p>}
                        {entry.grade !== undefined && (
                          <p className={styles.grade} data-testid="grade">
                            <data value={entry.grade.toFixed(2)} className={styles.gradeValue}>
                              {gradeFormat.format(entry.grade)}
                            </data>
                            <span className={styles.gradeText}>
                              <span className="mono">{dict.cv.gradeLabel}</span>
                              <span className={styles.gradeScale}>{dict.cv.gradeScale}</span>
                            </span>
                          </p>
                        )}
                      </div>
                      <p className={`mono ${styles.meta}`}>
                        <span>{copy.period}</span>
                        {copy.mode && <span>{copy.mode}</span>}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

'use client';

import { useId, type CSSProperties } from 'react';
import type { Dict, Locale, Project } from '@/content/types';
import { useLatticeHover } from './Lattice/LatticeContext';
import styles from './ProjectRow.module.css';

export function ProjectRow({
  project,
  locale,
  dict,
  index,
  open,
  onToggle,
}: {
  project: Project;
  locale: Locale;
  dict: Dict;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = useId();
  const copy = project[locale];
  const { setDomain } = useLatticeHover();
  const hasLinks = project.links.repo !== null || project.links.site !== null;
  const note = copy.pendingNote ?? dict.projects.defaultPendingNote;

  return (
    <li
      className={styles.row}
      data-testid="project-row"
      data-open={open}
      style={{ '--i': index } as CSSProperties}
      onPointerEnter={() => setDomain(project.domain)}
      onPointerLeave={() => setDomain(null)}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
        onFocus={() => setDomain(project.domain)}
        onBlur={() => setDomain(null)}
      >
        <span className={`mono ${styles.index}`} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className={styles.headline}>
          <span className={styles.title}>{copy.title}</span>
          <span className={styles.tagline}>{copy.tagline}</span>
        </span>
        <span className={`mono ${styles.meta}`}>
          <span>{project.year}</span>
          <span data-status={project.status} className={styles.status}>
            {project.status === 'wip' ? dict.projects.statusWip : dict.projects.statusLive}
          </span>
        </span>
        <span className={styles.sign} aria-hidden="true" />
      </button>

      {/* `hidden` keeps the closed panel out of the accessibility tree, which rules out a
          height transition on this element - the inner content animates instead. */}
      <div id={panelId} hidden={!open}>
        <div className={styles.panelInner}>
          <p className={styles.body}>{copy.body}</p>
          <ul className={styles.stack}>
            {copy.stack.map((item) => (
              <li key={item} className={`mono ${styles.chip}`}>
                {item}
              </li>
            ))}
          </ul>
          {hasLinks ? (
            <p className={styles.links}>
              {project.links.repo && (
                <a
                  href={project.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {dict.projects.repo} <span aria-hidden="true">↗</span>
                </a>
              )}
              {project.links.site && (
                <a
                  href={project.links.site}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  {dict.projects.site} <span aria-hidden="true">↗</span>
                </a>
              )}
            </p>
          ) : (
            <p className={`mono ${styles.note}`}>{note}</p>
          )}
        </div>
      </div>
    </li>
  );
}

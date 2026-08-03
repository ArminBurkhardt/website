'use client';

import type { Dict, Locale } from '@/content/types';
import { projects } from '@/content/projects';
import { useReveal } from '@/hooks/useReveal';
import { SectionHeading } from './SectionHeading';
import { ProjectRow } from './ProjectRow';
import styles from './Projects.module.css';

export function Projects({ dict, locale }: { dict: Dict; locale: Locale }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  return (
    <section
      id="projects"
      ref={ref}
      data-revealed={revealed}
      className={styles.section}
      aria-labelledby="projects-heading"
    >
      <SectionHeading
        index={dict.projects.index}
        label={dict.projects.label}
        id="projects-heading"
      />
      <ul className={styles.list}>
        {projects.map((project, index) => (
          <ProjectRow
            key={project.id}
            project={project}
            locale={locale}
            dict={dict}
            index={index}
          />
        ))}
      </ul>
    </section>
  );
}

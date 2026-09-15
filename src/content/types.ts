export type Locale = 'de' | 'en';
export const LOCALES: readonly Locale[] = ['de', 'en'];

export type Domain = 'quant' | 'ml' | 'law' | 'access';
export const DOMAINS: readonly Domain[] = ['quant', 'ml', 'law', 'access'];

export type Status = 'live' | 'wip';

export type ProjectCopy = {
  title: string;
  tagline: string;
  body: string;
  stack: string[];
  /** Shown instead of links while the repository is not public yet. */
  pendingNote?: string;
};

export type ProjectLinks = {
  /** Paste a public repository URL here to turn the note into a link. */
  repo: string | null;
  site: string | null;
};

export type Project = {
  id: string;
  year: string;
  domain: Domain;
  status: Status;
  links: ProjectLinks;
  de: ProjectCopy;
  en: ProjectCopy;
};

export type Fact = { label: string; value: string };

export type CvGroup = 'education' | 'experience' | 'engagement' | 'awards';
export const CV_GROUPS: readonly CvGroup[] = ['education', 'experience', 'engagement', 'awards'];

export type CvCopy = {
  title: string;
  org: string;
  /** Written out per locale, e.g. `Okt. 2024 - Aug. 2027` / `Oct 2024 - Aug 2027`. */
  period: string;
  /** Work mode such as `Hybrid` or `Vor Ort`. */
  mode?: string;
  detail?: string;
};

export type CvEntry = {
  id: string;
  group: CvGroup;
  /** Current grade on the German scale (1.0 is best), formatted per locale. */
  grade?: number;
  de: CvCopy;
  en: CvCopy;
};

export type Dict = {
  meta: { title: string; description: string };
  a11y: {
    skipToContent: string;
    themeToLight: string;
    themeToDark: string;
    localeSwitch: string;
    latticeAlt: string;
  };
  notFound: { metaTitle: string; heading: string; body: string; home: string };
  hero: { kicker: string; name: string; positioning: string; scroll: string };
  intro: { index: string; label: string; body: string; facts: Fact[] };
  cv: {
    index: string;
    label: string;
    groups: Record<CvGroup, string>;
    gradeLabel: string;
    gradeScale: string;
  };
  projects: {
    index: string;
    label: string;
    repo: string;
    site: string;
    statusLive: string;
    statusWip: string;
    defaultPendingNote: string;
  };
  links: { index: string; label: string; linkedin: string; github: string };
  footer: { copyright: string; place: string };
  sections: { start: string; intro: string; cv: string; projects: string; links: string };
  domains: Record<Domain, string>;
};

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

export type Dict = {
  meta: { title: string; description: string };
  a11y: {
    skipToContent: string;
    toTop: string;
    themeToLight: string;
    themeToDark: string;
    localeSwitch: string;
    latticeAlt: string;
  };
  hero: { kicker: string; name: string; positioning: string; scroll: string };
  intro: { index: string; label: string; body: string; facts: Fact[] };
  projects: {
    index: string;
    label: string;
    expand: string;
    collapse: string;
    repo: string;
    site: string;
    statusLive: string;
    statusWip: string;
    defaultPendingNote: string;
  };
  links: { index: string; label: string; linkedin: string; github: string };
  footer: { copyright: string; place: string };
  sections: { start: string; intro: string; projects: string; links: string };
  domains: Record<Domain, string>;
};

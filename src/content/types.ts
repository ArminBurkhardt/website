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

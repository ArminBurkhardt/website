import type { Dict, Locale } from './types.ts';

const de: Dict = {
  meta: {
    title: 'Armin Burkhardt',
    description:
      'Informatikstudent in Tübingen. Projekte an der Schnittstelle von Quantitative Finance, maschinellem Lernen und Regulierung.',
  },
  a11y: {
    skipToContent: 'Zum Inhalt springen',
    toTop: 'Zum Seitenanfang',
    themeToLight: 'Zur hellen Ansicht wechseln',
    themeToDark: 'Zur dunklen Ansicht wechseln',
    localeSwitch: 'Switch to English',
    latticeAlt:
      'Dekorative Darstellung eines Routing-Netzwerks mit den Endpunkten Quant, ML, Recht und Barrierefreiheit.',
  },
  hero: {
    kicker: 'Informatikstudent · Tübingen',
    name: 'Armin Burkhardt',
    positioning:
      'Ich baue an der Schnittstelle von Quantitative Finance, maschinellem Lernen und Regulierung.',
    scroll: 'Scrollen',
  },
  intro: {
    index: '01',
    label: 'Über mich',
    body: 'Ich studiere Informatik in Tübingen und arbeite als studentische Hilfskraft am IBMI. Am meisten interessiert mich, was passiert, wenn moderne Modelle in Bereiche kommen, in denen Fehler teuer sind — Handel, Recht, Regulierung. Parallel baue ich die Tübingen Quant Society auf, eine studentische Initiative, die genau die Lücke zwischen Theorie und Praxis schließen soll.',
    facts: [
      { label: 'Studium', value: 'B.Sc. Informatik, Universität Tübingen, 2024–2027' },
      { label: 'Rolle', value: 'Studentische Hilfskraft, IBMI Tübingen' },
      { label: 'Fokus', value: 'Quant Finance · Machine Learning · Regulierung' },
      { label: 'Initiative', value: 'Tübingen Quant Society, Mitgründer' },
    ],
  },
  projects: {
    index: '02',
    label: 'Projekte',
    expand: 'Details anzeigen',
    collapse: 'Details ausblenden',
    repo: 'Repository',
    site: 'Website',
    statusLive: 'Live',
    statusWip: 'In Arbeit',
    defaultPendingNote: 'Das Repository wird bald veröffentlicht.',
  },
  links: {
    index: '03',
    label: 'Kontakt',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
  footer: { copyright: '© 2026 Armin Burkhardt', place: 'Tübingen' },
  sections: { start: 'Start', intro: 'Über mich', projects: 'Projekte', links: 'Kontakt' },
  domains: { quant: 'Quant', ml: 'ML', law: 'Recht', access: 'Access' },
};

const en: Dict = {
  meta: {
    title: 'Armin Burkhardt',
    description:
      'Computer science student in Tübingen. Projects at the intersection of quantitative finance, machine learning and regulation.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    toTop: 'Back to top',
    themeToLight: 'Switch to light appearance',
    themeToDark: 'Switch to dark appearance',
    localeSwitch: 'Auf Deutsch wechseln',
    latticeAlt:
      'Decorative rendering of a routing network terminating in Quant, ML, Law and Access.',
  },
  hero: {
    kicker: 'Computer Science Student · Tübingen',
    name: 'Armin Burkhardt',
    positioning:
      'I build at the intersection of quantitative finance, machine learning and regulation.',
    scroll: 'Scroll',
  },
  intro: {
    index: '01',
    label: 'About',
    body: 'I study computer science in Tübingen and work as a student research assistant at IBMI. What interests me most is what happens when modern models reach domains where mistakes are expensive — trading, law, regulation. Alongside that I am building the Tübingen Quant Society, a student initiative meant to close exactly that gap between theory and practice.',
    facts: [
      { label: 'Studies', value: 'B.Sc. Computer Science, University of Tübingen, 2024–2027' },
      { label: 'Role', value: 'Student Research Assistant, IBMI Tübingen' },
      { label: 'Focus', value: 'Quant Finance · Machine Learning · Regulation' },
      { label: 'Initiative', value: 'Tübingen Quant Society, Co-Founder' },
    ],
  },
  projects: {
    index: '02',
    label: 'Projects',
    expand: 'Show details',
    collapse: 'Hide details',
    repo: 'Repository',
    site: 'Website',
    statusLive: 'Live',
    statusWip: 'In progress',
    defaultPendingNote: 'The repository is releasing soon.',
  },
  links: { index: '03', label: 'Contact', linkedin: 'LinkedIn', github: 'GitHub' },
  footer: { copyright: '© 2026 Armin Burkhardt', place: 'Tübingen' },
  sections: { start: 'Start', intro: 'About', projects: 'Projects', links: 'Contact' },
  domains: { quant: 'Quant', ml: 'ML', law: 'Law', access: 'Access' },
};

export const dictionaries: Record<Locale, Dict> = { de, en };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}

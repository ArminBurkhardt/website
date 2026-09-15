import type { Dict, Locale } from './types.ts';

const de: Dict = {
  meta: {
    title: 'Armin Burkhardt',
    description:
      'Informatikstudent in Tübingen. Projekte an der Schnittstelle von Quantitative Finance, maschinellem Lernen und branchenübergreifenden Anwendungen.',
  },
  a11y: {
    skipToContent: 'Zum Inhalt springen',
    themeToLight: 'Zur hellen Ansicht wechseln',
    themeToDark: 'Zur dunklen Ansicht wechseln',
    localeSwitch: 'Switch to English',
    latticeAlt:
      'Dekorative Darstellung eines Routing-Netzwerks mit den Endpunkten Quant, ML, Recht und Barrierefreiheit.',
  },
  notFound: {
    metaTitle: 'Seite nicht gefunden - Armin Burkhardt',
    heading: 'Seite nicht gefunden',
    body: 'Diese Seite existiert nicht - oder nicht mehr.',
    home: 'Zur Startseite',
  },
  hero: {
    kicker: 'Informatikstudent · Tübingen',
    name: 'Armin Burkhardt',
    positioning:
      'Ich arbeite an Quantitative Finance, maschinellem Lernen und branchenübergreifenden ML Anwendungen.',
    scroll: 'Scrollen',
  },
  intro: {
    index: '01',
    label: 'Über mich',
    body: 'Ich studiere Informatik in Tübingen. Am meisten interessiert mich, was passiert, wenn moderne Machine Learning Modelle in Bereiche kommen, in denen es komplex wird und Fehler teuer sind - Finanzen, Recht, Medizin, etc. Parallel baue ich mit meinem Mitgründer die Tübingen Quant Society auf, eine studentische Initiative, die genau die Lücke zwischen Theorie und Praxis schließt.',
    facts: [
      { label: 'Studium', value: 'B.Sc. Informatik, Universität Tübingen, 2024 - 2027' },
      { label: 'Rolle', value: 'Studentische Hilfskraft, Interfakultäres Institut für Biomedizinische Informatik (IBMI) Tübingen' },
      { label: 'Fokus', value: 'Quant Finance · Machine Learning · Interdisziplinäres ML' },
      { label: 'Initiative', value: 'Tübingen Quant Society, Gründungspartner' },
    ],
  },
  cv: {
    index: '03',
    label: 'Lebenslauf',
    groups: {
      education: 'Ausbildung',
      experience: 'Erfahrung',
      engagement: 'Engagement',
      awards: 'Auszeichnungen',
    },
    gradeLabel: 'Notenschnitt, aktuell',
    gradeScale: 'Deutsche Notenskala, 1,0 ist die Bestnote',
  },
  projects: {
    index: '02',
    label: 'Projekte',
    repo: 'Repository',
    site: 'Website',
    statusLive: 'Live',
    statusWip: 'In Arbeit',
    defaultPendingNote: 'Das Repository wird bald veröffentlicht.',
  },
  links: {
    index: '04',
    label: 'Kontakt',
    linkedin: 'LinkedIn',
    github: 'GitHub',
  },
  footer: { copyright: '© 2026 Armin Burkhardt', place: 'Tübingen' },
  sections: {
    start: 'Start',
    intro: 'Über mich',
    cv: 'Lebenslauf',
    projects: 'Projekte',
    links: 'Kontakt',
  },
  domains: { quant: 'Quant', ml: 'ML', law: 'Recht', access: 'Access' },
};

const en: Dict = {
  meta: {
    title: 'Armin Burkhardt',
    description:
      'Computer science student in Tübingen. Projects at the intersection of quantitative finance, machine learning and interdisciplinary applications.',
  },
  a11y: {
    skipToContent: 'Skip to content',
    themeToLight: 'Switch to light appearance',
    themeToDark: 'Switch to dark appearance',
    localeSwitch: 'Auf Deutsch wechseln',
    latticeAlt:
      'Decorative rendering of a routing network terminating in Quant, ML, Law and Access.',
  },
  notFound: {
    metaTitle: 'Page not found - Armin Burkhardt',
    heading: 'Page not found',
    body: 'This page does not exist - or does not exist any more.',
    home: 'Back to the start page',
  },
  hero: {
    kicker: 'Computer Science Student · Tübingen',
    name: 'Armin Burkhardt',
    positioning:
      'I work on quantitative finance, machine learning and interdisciplinary ML applications.',
    scroll: 'Scroll',
  },
  intro: {
    index: '01',
    label: 'About',
    body: 'I study computer science in Tübingen. What interests me most is what happens when modern machine learning models reach complex domains where mistakes are expensive - trading, law, medicine, etc. Alongside that I am building the Tübingen Quant Society with a fellow student, a student initiative that closes exactly that gap between theory and practice.',
    facts: [
      { label: 'Studies', value: 'B.Sc. Computer Science, University of Tübingen, 2024 - 2027' },
      { label: 'Role', value: 'Student Assistant, Institute for Bioinformatics and Medical Informatics (IBMI) Tübingen' },
      { label: 'Focus', value: 'Quant Finance · Machine Learning · Interdisciplinary ML' },
      { label: 'Initiative', value: 'Tübingen Quant Society, Founding Partner' },
    ],
  },
  cv: {
    index: '03',
    label: 'CV',
    groups: {
      education: 'Education',
      experience: 'Experience',
      engagement: 'Engagement',
      awards: 'Awards',
    },
    gradeLabel: 'Current grade average',
    gradeScale: 'German grading scale, where 1.0 is the top grade',
  },
  projects: {
    index: '02',
    label: 'Projects',
    repo: 'Repository',
    site: 'Website',
    statusLive: 'Live',
    statusWip: 'In progress',
    defaultPendingNote: 'The repository is releasing soon.',
  },
  links: { index: '04', label: 'Contact', linkedin: 'LinkedIn', github: 'GitHub' },
  footer: { copyright: '© 2026 Armin Burkhardt', place: 'Tübingen' },
  sections: { start: 'Start', intro: 'About', cv: 'CV', projects: 'Projects', links: 'Contact' },
  domains: { quant: 'Quant', ml: 'ML', law: 'Law', access: 'Access' },
};

export const dictionaries: Record<Locale, Dict> = { de, en };

export function getDict(locale: Locale): Dict {
  return dictionaries[locale];
}

import type { CvEntry } from './types';

/**
 * The file to edit when the CV changes. Entries render grouped in `CV_GROUPS` order and,
 * within a group, in the order listed here - newest first.
 */
export const cv: readonly CvEntry[] = [
  {
    id: `bsc-informatik`,
    group: `education`,
    grade: 1.09,
    de: {
      title: `B.Sc. Informatik`,
      org: `Eberhard Karls Universität Tübingen`,
      period: `Okt. 2024 - Aug. 2027`,
    },
    en: {
      title: `B.Sc. Computer Science`,
      org: `University of Tübingen`,
      period: `Oct 2024 - Aug 2027`,
    },
  },
  {
    id: `ibmi-assistant`,
    group: `experience`,
    de: {
      title: `Studentische Hilfskraft`,
      org: `Interfakultäres Institut für Biomedizinische Informatik (IBMI), Universität Tübingen`,
      period: `Aug. 2026 - heute`,
      mode: `Hybrid`,
      detail: `Betreuung von C++-Projekten in der Angewandten Bioinformatik.`,
    },
    en: {
      title: `Student Assistant`,
      org: `Institute for Bioinformatics and Medical Informatics (IBMI), University of Tübingen`,
      period: `Aug 2026 - present`,
      mode: `Hybrid`,
      detail: `Teaching assistant for C++ projects at the Faculty of Applied Bioinformatics.`,
    },
  },
  {
    id: `ti3-assistant`,
    group: `experience`,
    de: {
      title: `Studentische Hilfskraft`,
      org: `Eberhard Karls Universität Tübingen`,
      period: `2025 - 2026`,
      mode: `Vor Ort`,
      detail: `Tutor für die Lehrveranstaltung "Technische Informatik 3: Mikrorechnerpraktikum".`,
    },
    en: {
      title: `Student Assistant`,
      org: `University of Tübingen`,
      period: `2025 - 2026`,
      mode: `On site`,
      detail: `Teaching assistant for the course "Technical Computer Science 3: Microcomputer Lab".`,
    },
  },
  {
    id: `math-tutor`,
    group: `experience`,
    de: {
      title: `Mathematiktutor`,
      org: `Selbstständig`,
      period: `2022 - 2024`,
    },
    en: {
      title: `Mathematics Tutor`,
      org: `Self-employed`,
      period: `2022 - 2024`,
    },
  },
  {
    id: `novatec`,
    group: `experience`,
    de: {
      title: `Praktikant`,
      org: `Novatec Consulting GmbH`,
      period: `2022`,
      mode: `Vor Ort`,
      detail: `Praktikum in der Softwareentwicklung mit Java.`,
    },
    en: {
      title: `Intern`,
      org: `Novatec Consulting GmbH`,
      period: `2022`,
      mode: `On site`,
      detail: `Software development internship, working in Java.`,
    },
  },
  {
    id: `tqs`,
    group: `engagement`,
    de: {
      title: `Gründungspartner`,
      org: `Tübingen Quant Society`,
      period: `Juli 2026 - heute`,
    },
    en: {
      title: `Founding Partner`,
      org: `Tübingen Quant Society`,
      period: `Jul 2026 - present`,
    },
  },
  {
    id: `deutschlandstipendium`,
    group: `awards`,
    de: {
      title: `Deutschlandstipendium`,
      org: `Universität Tübingen`,
      period: `Sept. 2026`,
      detail: `Leistungsstipendium für besonders begabte Studierende.`,
    },
    en: {
      title: `Deutschlandstipendium`,
      org: `University of Tübingen`,
      period: `Sep 2026`,
      detail: `Merit-based national scholarship.`,
    },
  },
];

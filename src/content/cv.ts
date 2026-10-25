import type { CvEntry } from './types';

/**
 * The file to edit when the CV changes. Entries render grouped in `CV_GROUPS` order and,
 * within a group, in the order listed here - newest first.
 */
export const cv: readonly CvEntry[] = [
  {
    id: `bsc-informatik`,
    group: `education`,
    grade: 1.08,
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
    id: `denkbox`,
    group: `experience`,
    de: {
      title: `Machine Learning Engineer`,
      org: `DenkBox GmbH, Cyber Valley`,
      period: `Sept. 2026 - heute`,
      detail: `Inferenz-Optimierung, RAG- und Agenten-Features sowie Fine-Tuning und Evaluation für einen datenschutzorientierten On-Premise LLM-Assistenten.`,
    },
    en: {
      title: `Machine Learning Engineer`,
      org: `DenkBox GmbH, Cyber Valley`,
      period: `Sep 2026 - present`,
      detail: `Inference optimization, RAG and agent features, fine-tuning and evaluation for a privacy-first, on-premise LLM assistant.`,
    },
  },
  {
    id: `ibmi-assistant`,
    group: `experience`,
    de: {
      title: `Studentische Hilfskraft`,
      org: `Interfakultäres Institut für Biomedizinische Informatik (IBMI), Universität Tübingen`,
      period: `2026`,
      mode: `Hybrid`,
      detail: `Betreuung von C++-Projekten in der Angewandten Bioinformatik.`,
    },
    en: {
      title: `Student Teaching Assistant`,
      org: `Institute for Bioinformatics and Medical Informatics (IBMI), University of Tübingen`,
      period: `2026`,
      mode: `Hybrid`,
      detail: `Teaching assistant for C++ projects at the Faculty of Applied Bioinformatics.`,
    },
  },
  {
    id: `ti3-assistant`,
    group: `experience`,
    de: {
      title: `Studentische Hilfskraft`,
      org: `Lehrstuhl für Eingebettete Systeme, Universität Tübingen`,
      period: `2025 - 2026`,
      mode: `Vor Ort`,
      detail: `Tutor für "Technische Informatik 3: Mikrorechnerpraktikum": Betreuung im Labor, Bewertung der Laboraufgaben, hardwarenahe Programmierung.`,
    },
    en: {
      title: `Student Teaching Assistant`,
      org: `Chair of Embedded Systems, University of Tübingen`,
      period: `2025 - 2026`,
      mode: `On site`,
      detail: `Tutor for "Computer Engineering 3: Microcomputer Lab": supervising students in the lab, grading lab assignments, low-level programming.`,
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
      title: `Praktikant Softwareentwicklung`,
      org: `Novatec Consulting GmbH`,
      period: `2022`,
      mode: `Vor Ort`,
      detail: `Praktikum in der Softwareentwicklung mit Java.`,
    },
    en: {
      title: `Software Development Intern`,
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
      title: `Vereinsvorstand`,
      org: `Tübingen Quant Society`,
      period: `Juli 2026 - heute`,
      detail: `Mitgründer; verantwortlich für Konzept, Hochschulregistrierung und technische Infrastruktur.`,
    },
    en: {
      title: `Executive Board Member`,
      org: `Tübingen Quant Society`,
      period: `Jul 2026 - present`,
      detail: `Co-founder; responsible for the concept, university registration and technical infrastructure.`,
    },
  },
  {
    id: `deutschlandstipendium`,
    group: `awards`,
    de: {
      title: `Deutschlandstipendium`,
      org: `Universität Tübingen`,
      period: `Okt. 2026`,
      detail: `Leistungsstipendium für besonders begabte Studierende.`,
    },
    en: {
      title: `Deutschlandstipendium`,
      org: `University of Tübingen`,
      period: `Oct 2026`,
      detail: `Merit-based national scholarship.`,
    },
  },
];

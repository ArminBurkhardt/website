import type { Project } from './types';

/**
 * The file to edit when a project changes.
 * `links.repo: null` renders a "releasing soon" note instead of a link -
 * paste a URL and it becomes a link, nothing else needs to change.
 */
export const projects: readonly Project[] = [
  {
    id: `tqs`,
    year: `2026`,
    domain: `quant`,
    status: `live`,
    links: { repo: null, site: `https://tuequant.de` },
    de: {
      title: `Tübingen Quant Society`,
      tagline: `Studentische Initiative für Quantitative Finance und algorithmischen Handel.`,
      body: `Mitgegründet in Tübingen, um Studierenden praktischen Zugang zu quantitativer Finanzwirtschaft zu geben und Events zu organisieren. Für die Initiative habe ich die zweisprachige Website mitentwickelt: Next.js App Router, statisch ausgeliefert, mit einem SAML-2.0-Service-Provider für das Login über die Universität.`,
      stack: [`Next.js`, `TypeScript`, `SAML 2.0`, `Vercel`],
    },
    en: {
      title: `Tübingen Quant Society`,
      tagline: `Student initiative for quantitative finance and algorithmic trading.`,
      body: `Co-founded in Tübingen to give students hands-on access to quantitative finance and organize events. For the initiative I co-developed the bilingual website: Next.js App Router, statically served, with a SAML 2.0 service provider for university login.`,
      stack: [`Next.js`, `TypeScript`, `SAML 2.0`, `Vercel`],
    },
  },
  {
    id: `mike-t-ai-son`,
    year: `2026`,
    domain: `law`,
    status: `live`,
    links: { repo: `https://github.com/ArminBurkhardt/HackTheLaw`, site: null },
    de: {
      title: `HackTheLaw: mike t-AI-son`,
      tagline: `Adversariales Trainingstool für juristische Argumentation.`,
      body: `Gebaut bei HackTheLaw in Cambridge für Legoras Challenge "The Sparring Room". Statt Antworten zu liefern, greift das System die Argumentation der Nutzer:innen an und zwingt sie, ihre Position zu verteidigen - juristisches Sparring statt Recherche-Assistent. Python-Backend mit FastAPI, Frontend mit React und Vite.`,
      stack: [`Python`, `FastAPI`, `React`, `Vite`, `LLMs`],
    },
    en: {
      title: `HackTheLaw: mike t-AI-son`,
      tagline: `An adversarial training tool for legal argument.`,
      body: `Built at HackTheLaw in Cambridge for Legora's "The Sparring Room" challenge. Rather than answering questions, the system attacks the user's reasoning and forces them to defend their position - legal sparring instead of a research assistant. Python backend on FastAPI, frontend in React and Vite.`,
      stack: [`Python`, `FastAPI`, `React`, `Vite`, `LLMs`],
    },
  },
  {
    id: `tiny-moe-llm`,
    year: `2026`,
    domain: `ml`,
    status: `wip`,
    links: { repo: null, site: null },
    de: {
      title: `Tiny Mixture-of-Experts LLM`,
      tagline: `Sprachmodell mit ~300M Parametern und geloopter Mixture-of-Experts-Architektur.`,
      body: `Ein experimentelles LMM mit dense Gemma4-style Backbone. Danach wird ein einziger MoE-Block wird mehrfach durchlaufen (LoopLM-style) und routet die Tokens bei jedem Durchgang neu. Heterogene Experten - Self-Attention, Cross-Attention, Retrieval und MLP - teilen sich einen Router. Multi-Token-Prediction als Zusatzziel, Training u.a. in FP8 und NVFP4.`,
      stack: [`PyTorch`, `Transformer Engine`, `CUDA`, `MoE`, `MTP`],
      pendingNote: `Aktuell im Training - das Repository wird veröffentlicht, sobald der Lauf durch ist.`,
    },
    en: {
      title: `Tiny Mixture-of-Experts LLM`,
      tagline: `A ~300M-parameter language model with a looped mixture-of-experts architecture.`,
      body: `An experimental model on a dense Gemma4-style backbone: a single MoE block is applied for several iterations (LoopLM-style), rerouting tokens on every pass. Heterogeneous experts - self-attention, cross-attention, retrieval and MLP - share one router. Multi-token prediction as an auxiliary objective, trained in FP8 and NVFP4 among others.`,
      stack: [`PyTorch`, `Transformer Engine`, `CUDA`, `MoE`, `MTP`],
      pendingNote: `Currently training - the repository goes public once the run completes.`,
    },
  },
  {
    id: `assist`,
    year: `2026`,
    domain: `access`,
    status: `live`,
    links: { repo: null, site: null },
    de: {
      title: `Assist`,
      tagline: `Sprachgesteuerter Android-Assistent für blinde und sehbeeinträchtigte Nutzer:innen.`,
      body: `Alles, was sonst einen Blick auf den Bildschirm braucht - Wetter, Navigation, Kalender, Nachrichten, Wecker, Geräteeinstellungen, die Kamera als Beschreibung der Umgebung - läuft über ein Voice to Voice Interface. Ein (wahlweise lokales) LLM entscheidet, welches der On-Device-Tools es aufruft und handelt stellvertretend; die Antworten sind auf deutsche Sprachausgabe und die Zielgruppe zugeschnitten.`,
      stack: [`Android`, `Kotlin`, `LLM Tool-Use`, `TTS`, `ASR`, `RAG`],
      pendingNote: `Universitäres Teamprojekt - das Repository ist derzeit nicht öffentlich.`,
    },
    en: {
      title: `Assist`,
      tagline: `A voice-first Android assistant for blind and visually impaired users.`,
      body: `Everything that would normally need a glance at the screen - weather, directions, calendar, messages, alarms, device settings, the camera as a description of your surroundings - happens through a Voice to Voice Interface. An LLM (optionally local) decides which of the on-device tools to call and acts on the user's behalf; replies are shaped for German text-to-speech and tailored to the target audience.`,
      stack: [`Android`, `Kotlin`, `LLM Tool-Use`, `TTS`, `ASR`, `RAG`],
      pendingNote: `University team project - the repository is not public at the moment.`,
    },
  },
];

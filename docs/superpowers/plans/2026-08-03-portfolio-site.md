# arminburkhardt.com Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual, statically prerendered personal portfolio at `arminburkhardt.com` with an ambient "expert routing" canvas as its signature element, deployed on Vercel.

**Architecture:** Next.js App Router with two prerendered routes - `/` (German) and `/en` (English) - both rendering one `<Site locale>` component against a typed dictionary. All copy lives in `src/content`; all tunables in `src/config`. Motion is hand-rolled (CSS transitions + one `IntersectionObserver` hook + one `<canvas>`), no animation library. No route handlers, no middleware, no server actions: every route must appear as `○ (Static)` in the build output.

**Tech Stack:** Next.js 16.2.12, React 19.2.8, TypeScript 5.9, CSS Modules + custom properties, `geist` 1.7 fonts via `next/font`, `node:test` + `tsx` for unit tests, Playwright 1.62 + `@axe-core/playwright` for e2e.

Reference spec: `docs/superpowers/specs/2026-08-03-portfolio-site-design.md`.

## Global Constraints

- **Commits:** single line, conventional form (`feat: …`, `chore: …`, `docs: …`, `test: …`). No body, no `Co-Authored-By` trailer. Branch is `main`.
- **Dark is the default theme.** `DEFAULT_THEME` in `src/config/site.ts` is the single source of truth; no component or stylesheet may hardcode a theme. `prefers-color-scheme` is deliberately never consulted.
- **German is the default locale.** `/` is German, `/en` is English. The locale toggle is an `<a>` to a real URL, never client state.
- **No email address anywhere on the site.** LinkedIn and GitHub are the only contact paths.
- **No Impressum, no privacy page, no analytics, no cookies, no contact form.**
- **Accent discipline:** `--accent` may appear on at most three things at once - active routing packet, current-section tick, link underline on hover/focus. Never as a fill, never on body text.
- **Motion:** 400–700ms, `cubic-bezier(0.16, 1, 0.3, 1)`, 60ms stagger. Every animation must be disabled under `prefers-reduced-motion: reduce`.
- **No new runtime dependencies** beyond `next`, `react`, `react-dom`, `geist`. Anything else is a devDependency.
- **Every component file stays under ~150 lines.** Co-locate a `.module.css` per component.
- **Copy never lives in a component.** It comes from `src/content/site.ts` or `src/content/projects.ts`.

## File Structure

| Path | Responsibility |
| --- | --- |
| `src/config/site.ts` | Tunables: default locale, default theme, external links |
| `src/content/types.ts` | `Locale`, `Domain`, `Status`, `Project`, `Dict` types |
| `src/content/projects.ts` | The four project entries - the file Armin edits |
| `src/content/site.ts` | `de` / `en` dictionaries |
| `src/app/layout.tsx` | HTML shell, fonts, blocking theme script, metadata |
| `src/app/page.tsx`, `src/app/en/page.tsx` | The two locale routes |
| `src/app/globals.css` | Tokens, reset, base typography |
| `src/components/Site.tsx` | Composes sections for one locale |
| `src/components/Chrome.tsx` | Wordmark, theme + locale toggles, progress bar, section marker |
| `src/components/Hero.tsx` | Section 00 |
| `src/components/Intro.tsx` | Section 01 + fact grid |
| `src/components/Projects.tsx` | Section 02 list |
| `src/components/ProjectRow.tsx` | One expandable project row |
| `src/components/Links.tsx` | Section 03 |
| `src/components/Footer.tsx` | Footer line |
| `src/components/Lattice/LatticeContext.tsx` | Client provider holding `activeDomain` |
| `src/components/Lattice/layout.ts` | Deterministic seeded node/edge generation (pure) |
| `src/components/Lattice/draw.ts` | Per-frame canvas rendering (pure-ish) |
| `src/components/Lattice/Lattice.tsx` | Canvas mount, observers, reduced-motion gate |
| `src/hooks/useReveal.ts` | Reveal-on-scroll |
| `src/hooks/useTheme.ts` | Theme read/toggle/persist |
| `src/hooks/useActiveSection.ts` | Current section id |
| `e2e/*.spec.ts` | Playwright specs |

---

### Task 1: Scaffold and configuration

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore` (exists - verify), `src/config/site.ts`
- Test: `src/config/site.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `DEFAULT_LOCALE: 'de'`, `DEFAULT_THEME: 'dark' | 'light'`, `LINKS: { linkedin: string; github: string }`, `SITE_URL: string` from `src/config/site.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "arminburkhardt-com",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "test": "node --import tsx --test \"src/**/*.test.ts\"",
    "e2e": "playwright test",
    "check": "npm run typecheck && npm test && npm run build"
  },
  "dependencies": {
    "geist": "^1.7.2",
    "next": "^16.2.12",
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@axe-core/playwright": "^4.12.1",
    "@playwright/test": "^1.62.1",
    "@types/node": "^24.10.1",
    "@types/react": "^19.2.2",
    "@types/react-dom": "^19.2.2",
    "tsx": "^4.23.5",
    "typescript": "^5.9.3"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "verbatimModuleSyntax": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", "e2e"]
}
```

- [ ] **Step 3: Create `next.config.ts`**

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 4: Run `npm install`**

Run: `npm install`
Expected: installs cleanly, no `EBADENGINE` warning.

- [ ] **Step 5: Write the failing test**

Create `src/config/site.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_LOCALE, DEFAULT_THEME, LINKS, SITE_URL } from './site.ts';

test('german is the default locale', () => {
  assert.equal(DEFAULT_LOCALE, 'de');
});

test('dark is the default theme', () => {
  assert.equal(DEFAULT_THEME, 'dark');
});

test('every external link is an absolute https url', () => {
  for (const [name, href] of Object.entries(LINKS)) {
    const url = new URL(href);
    assert.equal(url.protocol, 'https:', `${name} must be https`);
  }
});

test('no email address is exposed in config', () => {
  assert.doesNotMatch(JSON.stringify({ LINKS, SITE_URL }), /@[a-z0-9-]+\.[a-z]{2,}/i);
});

test('site url is the production domain', () => {
  assert.equal(SITE_URL, 'https://arminburkhardt.com');
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL - cannot resolve `./site.ts`.

- [ ] **Step 7: Write the implementation**

Create `src/config/site.ts`:

```ts
export const DEFAULT_LOCALE = 'de' as const;

/** Single source of truth for the theme the site loads with. Flip to 'light' to change it. */
export const DEFAULT_THEME: 'dark' | 'light' = 'dark';

export const SITE_URL = 'https://arminburkhardt.com';

export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/armin-burkhardt-b0472a413/',
  github: 'https://github.com/ArminBurkhardt/',
} as const;
```

- [ ] **Step 8: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 5 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold next.js project and site config"
```

---

### Task 2: Project content model

**Files:**
- Create: `src/content/types.ts`, `src/content/projects.ts`
- Test: `src/content/projects.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `type Locale = 'de' | 'en'`
  - `type Domain = 'quant' | 'ml' | 'law' | 'access'`
  - `type Status = 'live' | 'wip'`
  - `type ProjectCopy = { title: string; tagline: string; body: string; stack: string[]; pendingNote?: string }`
  - `type Project = { id: string; year: string; domain: Domain; status: Status; links: { repo: string | null; site: string | null }; de: ProjectCopy; en: ProjectCopy }`
  - `const projects: readonly Project[]`
  - `const DOMAINS: readonly Domain[]`

- [ ] **Step 1: Write the failing test**

Create `src/content/projects.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projects } from './projects.ts';
import { DOMAINS } from './types.ts';

test('project ids are unique and slug-safe', () => {
  const ids = projects.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'duplicate project id');
  for (const id of ids) assert.match(id, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('every project carries both locales with non-empty copy', () => {
  for (const project of projects) {
    for (const locale of ['de', 'en'] as const) {
      const copy = project[locale];
      assert.ok(copy.title.trim().length > 0, `${project.id}.${locale}.title`);
      assert.ok(copy.tagline.trim().length > 0, `${project.id}.${locale}.tagline`);
      assert.ok(copy.body.trim().length > 0, `${project.id}.${locale}.body`);
      assert.ok(copy.stack.length > 0, `${project.id}.${locale}.stack`);
    }
  }
});

test('stack entries match across locales', () => {
  for (const project of projects) {
    assert.deepEqual(project.de.stack, project.en.stack, `${project.id} stack drift`);
  }
});

test('every declared domain is a known domain', () => {
  for (const project of projects) assert.ok(DOMAINS.includes(project.domain));
});

test('non-null links are absolute https urls', () => {
  for (const project of projects) {
    for (const [kind, href] of Object.entries(project.links)) {
      if (href === null) continue;
      assert.equal(new URL(href).protocol, 'https:', `${project.id}.${kind}`);
    }
  }
});

test('a wip project with no links supplies a pending note in both locales', () => {
  for (const project of projects) {
    const hasLink = project.links.repo !== null || project.links.site !== null;
    if (project.status === 'wip' && !hasLink) {
      assert.ok(project.de.pendingNote, `${project.id}.de.pendingNote missing`);
      assert.ok(project.en.pendingNote, `${project.id}.en.pendingNote missing`);
    }
  }
});

test('the four expected projects are present in order', () => {
  assert.deepEqual(
    projects.map((p) => p.id),
    ['tqs', 'mike-t-ai-son', 'tiny-moe-llm', 'assist'],
  );
});

test('tiny-moe-llm ships as work in progress without a repo link', () => {
  const moe = projects.find((p) => p.id === 'tiny-moe-llm');
  assert.ok(moe);
  assert.equal(moe.status, 'wip');
  assert.equal(moe.links.repo, null);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL - cannot resolve `./projects.ts`.

- [ ] **Step 3: Write `src/content/types.ts`**

```ts
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
```

- [ ] **Step 4: Write `src/content/projects.ts`**

```ts
import type { Project } from './types.ts';

/**
 * The file to edit when a project changes.
 * `links.repo: null` renders a "releasing soon" note instead of a link -
 * paste a URL and it becomes a link, nothing else needs to change.
 */
export const projects: readonly Project[] = [
  {
    id: 'tqs',
    year: '2026',
    domain: 'quant',
    status: 'live',
    links: { repo: null, site: 'https://tuequant.de' },
    de: {
      title: 'Tübingen Quant Society',
      tagline: 'Studentische Initiative für Quantitative Finance und algorithmischen Handel.',
      body: 'Mitgegründet in Tübingen, um Studierenden praktischen Zugang zu quantitativer Finanzwirtschaft zu geben - von Marktmikrostruktur über Backtesting bis zum eigenen Strategieentwurf. Für die Initiative habe ich die zweisprachige Website gebaut: Next.js App Router, statisch ausgeliefert, mit einem SAML-2.0-Service-Provider für das Login über die Universität.',
      stack: ['Next.js', 'TypeScript', 'SAML 2.0', 'Vercel'],
    },
    en: {
      title: 'Tübingen Quant Society',
      tagline: 'Student initiative for quantitative finance and algorithmic trading.',
      body: 'Co-founded in Tübingen to give students hands-on access to quantitative finance - from market microstructure through backtesting to designing their own strategies. I built the initiative’s bilingual website: Next.js App Router, statically served, with a SAML 2.0 service provider for university login.',
      stack: ['Next.js', 'TypeScript', 'SAML 2.0', 'Vercel'],
    },
  },
  {
    id: 'mike-t-ai-son',
    year: '2026',
    domain: 'law',
    status: 'live',
    links: { repo: 'https://github.com/ArminBurkhardt/HackTheLaw', site: null },
    de: {
      title: 'mike t-AI-son',
      tagline: 'Adversariales Trainingstool für juristische Argumentation.',
      body: 'Gebaut bei HackTheLaw in Cambridge für Legoras Challenge „The Sparring Room“. Statt Antworten zu liefern, greift das System die Argumentation der Nutzer:innen an und zwingt sie, ihre Position zu verteidigen - juristisches Sparring statt Recherche-Assistent. Python-Backend mit FastAPI, Frontend mit React und Vite.',
      stack: ['Python', 'FastAPI', 'React', 'Vite', 'LLMs'],
    },
    en: {
      title: 'mike t-AI-son',
      tagline: 'An adversarial training tool for legal argument.',
      body: 'Built at HackTheLaw in Cambridge for Legora’s "The Sparring Room" challenge. Rather than answering questions, the system attacks the user’s reasoning and forces them to defend their position - legal sparring instead of a research assistant. Python backend on FastAPI, frontend in React and Vite.',
      stack: ['Python', 'FastAPI', 'React', 'Vite', 'LLMs'],
    },
  },
  {
    id: 'tiny-moe-llm',
    year: '2026',
    domain: 'ml',
    status: 'wip',
    links: { repo: null, site: null },
    de: {
      title: 'tiny-moe-llm',
      tagline: 'Sprachmodell mit ~243M Parametern und geloopter Mixture-of-Experts-Architektur.',
      body: 'Ein experimentelles Modell auf einem dichten Backbone im Gemma-Stil: Ein einziger MoE-Block wird mehrfach durchlaufen und routet die Tokens bei jedem Durchgang neu. Heterogene Experten - Self-Attention, Cross-Attention, Retrieval und MLP - teilen sich einen Router, dazu ein Identity-Expert, mit dem ein Token das Routing früh verlassen kann. Multi-Token-Prediction als Zusatzziel, Training in FP8 und NVFP4.',
      stack: ['PyTorch', 'Transformer Engine', 'CUDA', 'MoE'],
      pendingNote: 'Aktuell im Training - das Repository wird veröffentlicht, sobald der Lauf durch ist.',
    },
    en: {
      title: 'tiny-moe-llm',
      tagline: 'A ~243M-parameter language model with a looped mixture-of-experts architecture.',
      body: 'An experimental model on a dense Gemma-style backbone: a single MoE block is applied for several iterations, rerouting tokens on every pass. Heterogeneous experts - self-attention, cross-attention, retrieval and MLP - share one router, plus an identity expert that lets a token exit routing early. Multi-token prediction as an auxiliary objective, trained in FP8 and NVFP4.',
      stack: ['PyTorch', 'Transformer Engine', 'CUDA', 'MoE'],
      pendingNote: 'Currently training - the repository goes public once the run completes.',
    },
  },
  {
    id: 'assist',
    year: '2026',
    domain: 'access',
    status: 'live',
    links: { repo: null, site: null },
    de: {
      title: 'Assist',
      tagline: 'Sprachgesteuerter Android-Assistent für blinde und sehbeeinträchtigte Nutzer:innen.',
      body: 'Alles, was sonst einen Blick auf den Bildschirm braucht - Wetter, Navigation, Kalender, Nachrichten, Wecker, Geräteeinstellungen, die Kamera als Beschreibung der Umgebung - läuft über ein Gespräch. Ein LLM entscheidet, welches der On-Device-Tools es aufruft und handelt stellvertretend; die Antworten sind auf deutsche Sprachausgabe zugeschnitten und vermeiden visuelle Formulierungen.',
      stack: ['Android', 'Kotlin', 'LLM Tool-Use', 'TTS'],
      pendingNote: 'Universitäres Teamprojekt - das Repository ist derzeit nicht öffentlich.',
    },
    en: {
      title: 'Assist',
      tagline: 'A voice-first Android assistant for blind and visually impaired users.',
      body: 'Everything that would normally need a glance at the screen - weather, directions, calendar, messages, alarms, device settings, the camera as a description of your surroundings - happens through conversation. An LLM decides which of the on-device tools to call and acts on the user’s behalf; replies are shaped for German text-to-speech and avoid visual language.',
      stack: ['Android', 'Kotlin', 'LLM Tool-Use', 'TTS'],
      pendingNote: 'University team project - the repository is not public at the moment.',
    },
  },
];
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 13 tests total.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add project content model and entries"
```

---

### Task 3: Locale dictionaries

**Files:**
- Create: `src/content/site.ts`
- Modify: `src/content/types.ts` (append the `Dict` type)
- Test: `src/content/site.test.ts`

**Interfaces:**
- Consumes: `Locale`, `Domain` from `src/content/types.ts`
- Produces: `type Dict`, `const dictionaries: Record<Locale, Dict>`, `function getDict(locale: Locale): Dict`

- [ ] **Step 1: Append the `Dict` type to `src/content/types.ts`**

```ts
export type Fact = { label: string; value: string };

export type Dict = {
  meta: { title: string; description: string };
  a11y: { skipToContent: string; toTop: string; themeToLight: string; themeToDark: string; localeSwitch: string; latticeAlt: string };
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
```

- [ ] **Step 2: Write the failing test**

Create `src/content/site.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dictionaries, getDict } from './site.ts';
import { LOCALES } from './types.ts';

function keyPaths(value: unknown, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => keyPaths(item, `${prefix}[${index}]`));
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [prefix];
}

function leafValues(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(leafValues);
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(leafValues);
  return [String(value)];
}

test('every locale is present', () => {
  for (const locale of LOCALES) assert.ok(dictionaries[locale], `missing ${locale}`);
});

test('locales have identical key trees', () => {
  assert.deepEqual(keyPaths(dictionaries.de).sort(), keyPaths(dictionaries.en).sort());
});

test('no dictionary value is empty', () => {
  for (const locale of LOCALES) {
    for (const value of leafValues(dictionaries[locale])) {
      assert.ok(value.trim().length > 0, `empty value in ${locale}`);
    }
  }
});

test('no email address appears in any dictionary', () => {
  assert.doesNotMatch(JSON.stringify(dictionaries), /[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
});

test('german and english copy actually differ', () => {
  assert.notEqual(dictionaries.de.hero.positioning, dictionaries.en.hero.positioning);
  assert.notEqual(dictionaries.de.intro.body, dictionaries.en.intro.body);
});

test('getDict returns the requested locale', () => {
  assert.equal(getDict('en'), dictionaries.en);
  assert.equal(getDict('de'), dictionaries.de);
});

test('each locale supplies exactly four facts', () => {
  for (const locale of LOCALES) assert.equal(dictionaries[locale].intro.facts.length, 4);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL - cannot resolve `./site.ts`.

- [ ] **Step 4: Write `src/content/site.ts`**

```ts
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
    latticeAlt: 'Dekorative Darstellung eines Routing-Netzwerks mit den Endpunkten Quant, ML, Recht und Barrierefreiheit.',
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
    body: 'Ich studiere Informatik in Tübingen und arbeite als studentische Hilfskraft am IBMI. Am meisten interessiert mich, was passiert, wenn moderne Modelle in Bereiche kommen, in denen Fehler teuer sind - Handel, Recht, Regulierung. Parallel baue ich die Tübingen Quant Society auf, eine studentische Initiative, die genau die Lücke zwischen Theorie und Praxis schließen soll.',
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
    latticeAlt: 'Decorative rendering of a routing network terminating in Quant, ML, Law and Access.',
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
    body: 'I study computer science in Tübingen and work as a student research assistant at IBMI. What interests me most is what happens when modern models reach domains where mistakes are expensive - trading, law, regulation. Alongside that I am building the Tübingen Quant Society, a student initiative meant to close exactly that gap between theory and practice.',
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 20 tests total.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add german and english dictionaries"
```

---

### Task 4: Design tokens, shell, and theme

**Files:**
- Create: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/en/page.tsx`, `src/components/Site.tsx`, `src/components/Site.module.css`, `src/hooks/useTheme.ts`, `e2e/theme.spec.ts`, `playwright.config.ts`
- Test: `e2e/theme.spec.ts`

**Interfaces:**
- Consumes: `DEFAULT_THEME`, `getDict`, `Locale`
- Produces: `<Site locale={Locale} />`; `useTheme(): { theme: 'dark' | 'light'; toggle: () => void; mounted: boolean }`; `data-theme` attribute on `<html>`; section ids `start`, `intro`, `projects`, `links`

- [ ] **Step 1: Write `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
```

- [ ] **Step 2: Write the failing e2e test**

Create `e2e/theme.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('loads dark by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('theme toggle flips the theme and survives a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('german is served at / and english at /en', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.goto('/en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npx playwright install --with-deps chromium && npm run e2e`
Expected: FAIL - build fails, there is no app directory yet.

- [ ] **Step 4: Write `src/app/globals.css`**

```css
:root {
  --bg: #0a0a0a;
  --fg: #fafaf9;
  --fg-muted: #a1a1aa;
  --fg-faint: #52525b;
  --rule: rgba(250, 250, 249, 0.1);
  --accent: #fb4a6b;

  --ease: cubic-bezier(0.16, 1, 0.3, 1);
  --dur: 560ms;
  --gutter: clamp(1.25rem, 5vw, 4rem);
  --measure: 62ch;
  --section-gap: clamp(6rem, 14vh, 10rem);
  --max: 1240px;
}

:root[data-theme='light'] {
  --bg: #fafaf9;
  --fg: #0a0a0a;
  --fg-muted: #52525b;
  --fg-faint: #a1a1aa;
  --rule: rgba(10, 10, 10, 0.1);
  --accent: #e11d48;
}

*,
*::before,
*::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-sans), system-ui, sans-serif;
  font-size: 1.0625rem;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  transition: background-color var(--dur) var(--ease), color var(--dur) var(--ease);
}

a { color: inherit; }

:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  border-radius: 2px;
}

.mono {
  font-family: var(--font-mono), ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--fg-faint);
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}
```

- [ ] **Step 5: Create the route-group structure**

`<html lang>` has to differ between the two locales, and reading the request (via `headers()`)
would opt the routes out of static rendering - which violates a global constraint. Next
supports exactly one root layout *per route group*, so use two groups:

```
src/app/
  globals.css
  shell.tsx           → the shared <html>/<body>, takes lang as a prop
  (de)/layout.tsx     → <html lang="de">
  (de)/page.tsx       → path "/"
  (en)/layout.tsx     → <html lang="en">
  (en)/en/page.tsx    → path "/en"
```

Route groups in parentheses do not appear in the URL, so `(de)/page.tsx` serves `/` and
`(en)/en/page.tsx` serves `/en`.

- [ ] **Step 6: Write `src/app/shell.tsx` and the two layouts**

The theme script must be blocking and inline so there is no flash. It reads `localStorage`
first and falls back to `DEFAULT_THEME` - never `prefers-color-scheme`. Keeping it in one
shared shell means the script exists in exactly one place.

```tsx
// src/app/shell.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { DEFAULT_THEME } from '@/config/site';
import './globals.css';

const themeScript = `(function(){try{var t=localStorage.getItem('theme');document.documentElement.setAttribute('data-theme',t==='light'||t==='dark'?t:'${DEFAULT_THEME}');}catch(e){document.documentElement.setAttribute('data-theme','${DEFAULT_THEME}');}})();`;

export function Shell({ lang, children }: { lang: 'de' | 'en'; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

Each layout also carries the `metadataBase` and `viewport` exports - a root layout is the only
place they can live, and there is one per route group:

```tsx
// src/app/(de)/layout.tsx
import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/config/site';
import { Shell } from '../shell';

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell lang="de">{children}</Shell>;
}
```

```tsx
// src/app/(en)/layout.tsx
import type { Metadata, Viewport } from 'next';
import { SITE_URL } from '@/config/site';
import { Shell } from '../shell';

export const metadata: Metadata = { metadataBase: new URL(SITE_URL) };

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#fafaf9' },
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Shell lang="en">{children}</Shell>;
}
```

- [ ] **Step 7: Write the two pages**

```tsx
// src/app/(de)/page.tsx
import type { Metadata } from 'next';
import { Site } from '@/components/Site';
import { getDict } from '@/content/site';

const dict = getDict('de');

export const metadata: Metadata = {
  title: dict.meta.title,
  description: dict.meta.description,
  alternates: { canonical: '/', languages: { de: '/', en: '/en' } },
};

export default function Page() {
  return <Site locale="de" />;
}
```

```tsx
// src/app/(en)/en/page.tsx
import type { Metadata } from 'next';
import { Site } from '@/components/Site';
import { getDict } from '@/content/site';

const dict = getDict('en');

export const metadata: Metadata = {
  title: dict.meta.title,
  description: dict.meta.description,
  alternates: { canonical: '/en', languages: { de: '/', en: '/en' } },
};

export default function Page() {
  return <Site locale="en" />;
}
```

- [ ] **Step 8: Write `src/hooks/useTheme.ts`**

```ts
'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME } from '@/config/site';

export type Theme = 'dark' | 'light';

function readTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' || attr === 'dark' ? attr : DEFAULT_THEME;
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* storage unavailable - the attribute still applies for this session */
      }
      return next;
    });
  }, []);

  return { theme, toggle, mounted };
}
```

- [ ] **Step 9: Write a minimal `src/components/Site.tsx` with a temporary theme toggle**

The full chrome arrives in Task 9; this stub exists so the e2e test can pass now.

```tsx
import type { Locale } from '@/content/types';
import { getDict } from '@/content/site';
import { ThemeToggle } from './ThemeToggle';
import styles from './Site.module.css';

export function Site({ locale }: { locale: Locale }) {
  const dict = getDict(locale);
  return (
    <>
      <a className={styles.skip} href="#start">{dict.a11y.skipToContent}</a>
      <ThemeToggle dict={dict} />
      <main id="start" className={styles.main}>
        <h1>{dict.hero.name}</h1>
      </main>
    </>
  );
}
```

Create `src/components/ThemeToggle.tsx`:

```tsx
'use client';

import { useTheme } from '@/hooks/useTheme';
import type { Dict } from '@/content/types';
import styles from './ThemeToggle.module.css';

export function ThemeToggle({ dict }: { dict: Dict }) {
  const { theme, toggle, mounted } = useTheme();
  const label = theme === 'dark' ? dict.a11y.themeToLight : dict.a11y.themeToDark;
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggle}
      aria-label={label}
      title={label}
      data-testid="theme-toggle"
      suppressHydrationWarning
    >
      <span aria-hidden="true">{mounted && theme === 'dark' ? '○' : '●'}</span>
    </button>
  );
}
```

Create `src/components/Site.module.css` and `src/components/ThemeToggle.module.css` with a
visually-hidden-until-focused skip link and a bare, borderless toggle button (24px hit area
grown to 44px with padding).

- [ ] **Step 10: Run the e2e test to verify it passes**

Run: `npm run e2e`
Expected: PASS, 3 tests.

- [ ] **Step 11: Verify both routes are static**

Run: `npm run build`
Expected: the route table lists `/` and `/en` as `○ (Static)`. If either shows `ƒ (Dynamic)`,
stop and remove whatever dynamic API caused it.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add app shell, design tokens and theme switching"
```

---

### Task 5: Reveal hook and hero

**Files:**
- Create: `src/hooks/useReveal.ts`, `src/components/Hero.tsx`, `src/components/Hero.module.css`
- Modify: `src/components/Site.tsx`
- Test: `e2e/content.spec.ts`

**Interfaces:**
- Consumes: `Dict`
- Produces: `useReveal<T extends HTMLElement>(): { ref: React.RefObject<T | null>; revealed: boolean }`; `<Hero dict={Dict} />` rendering `<section id="start">`

- [ ] **Step 1: Write the failing e2e test**

Create `e2e/content.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('german hero renders name, kicker and positioning', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Armin Burkhardt');
  await expect(page.getByText('Informatikstudent · Tübingen')).toBeVisible();
  await expect(page.getByText(/Schnittstelle von Quantitative Finance/)).toBeVisible();
});

test('english hero renders the translated positioning', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByText(/intersection of quantitative finance/)).toBeVisible();
});

test('hero occupies the first viewport', async ({ page }) => {
  await page.goto('/');
  const box = await page.locator('#start').boundingBox();
  const viewport = page.viewportSize();
  expect(box?.height ?? 0).toBeGreaterThan((viewport?.height ?? 0) * 0.8);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run e2e -- content.spec.ts`
Expected: FAIL - kicker text not found.

- [ ] **Step 3: Write `src/hooks/useReveal.ts`**

```ts
'use client';

import { useEffect, useRef, useState } from 'react';

/** Reveals once, at 15% visibility. Under reduced motion it reveals immediately. */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
```

- [ ] **Step 4: Write `src/components/Hero.tsx`**

Children carry `--i` so the stagger is pure CSS (`transition-delay: calc(var(--i) * 60ms)`).

```tsx
import type { Dict } from '@/content/types';
import styles from './Hero.module.css';

export function Hero({ dict }: { dict: Dict }) {
  return (
    <section id="start" className={styles.hero} aria-labelledby="hero-name">
      <p className={`mono ${styles.kicker}`} style={{ '--i': 0 } as React.CSSProperties}>
        {dict.hero.kicker}
      </p>
      <h1 id="hero-name" className={styles.name} style={{ '--i': 1 } as React.CSSProperties}>
        {dict.hero.name}
      </h1>
      <p className={styles.positioning} style={{ '--i': 2 } as React.CSSProperties}>
        {dict.hero.positioning}
      </p>
      <p className={`mono ${styles.scroll}`} style={{ '--i': 3 } as React.CSSProperties}>
        {dict.hero.scroll}
        <span aria-hidden="true" className={styles.scrollLine} />
      </p>
    </section>
  );
}
```

`Hero.module.css` requirements: `min-height: 100svh`, flex column with the scroll cue pinned
to the bottom, `padding-inline: var(--gutter)`, name at
`font-size: clamp(3.5rem, 9vw, 8rem); font-weight: 500; letter-spacing: -0.035em; line-height: 0.95`,
positioning at `max-width: var(--measure); color: var(--fg-muted)`. Entrance animation is a
CSS `@keyframes` on load (not scroll-driven), `animation-delay: calc(var(--i) * 80ms)`,
`animation-fill-mode: both`. The `scrollLine` is a 1px, 40px-tall element that breathes via a
2s `ease-in-out` alternating keyframe.

- [ ] **Step 5: Wire `Hero` into `Site.tsx`** (replacing the placeholder `<h1>`)

- [ ] **Step 6: Run the e2e test to verify it passes**

Run: `npm run e2e -- content.spec.ts`
Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add hero section and reveal hook"
```

---

### Task 6: Intro section

**Files:**
- Create: `src/components/Intro.tsx`, `src/components/Intro.module.css`, `src/components/SectionHeading.tsx`, `src/components/SectionHeading.module.css`
- Modify: `src/components/Site.tsx`
- Test: append to `e2e/content.spec.ts`

**Interfaces:**
- Consumes: `Dict`, `useReveal`
- Produces: `<SectionHeading index={string} label={string} id={string} />`; `<Intro dict={Dict} />` rendering `<section id="intro">`

- [ ] **Step 1: Write the failing test** - append to `e2e/content.spec.ts`:

```ts
test('intro renders the label and all four facts', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Über mich' })).toBeVisible();
  const facts = page.getByTestId('fact');
  await expect(facts).toHaveCount(4);
  await expect(page.getByText('B.Sc. Informatik, Universität Tübingen, 2024–2027')).toBeVisible();
});

test('english intro uses translated fact labels', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByText('Student Research Assistant, IBMI Tübingen')).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run e2e -- content.spec.ts`
Expected: FAIL - heading "Über mich" not found.

- [ ] **Step 3: Write `src/components/SectionHeading.tsx`**

```tsx
import styles from './SectionHeading.module.css';

export function SectionHeading({ index, label, id }: { index: string; label: string; id: string }) {
  return (
    <div className={styles.wrap}>
      <span className={`mono ${styles.index}`} aria-hidden="true">{index}</span>
      <h2 id={id} className={styles.label}>{label}</h2>
      <span className={styles.rule} aria-hidden="true" />
    </div>
  );
}
```

The `rule` element animates `transform: scaleX(0) → 1` with `transform-origin: left` when its
containing section is revealed (driven by a `data-revealed` attribute on the section).

- [ ] **Step 4: Write `src/components/Intro.tsx`**

```tsx
'use client';

import type { Dict } from '@/content/types';
import { useReveal } from '@/hooks/useReveal';
import { SectionHeading } from './SectionHeading';
import styles from './Intro.module.css';

export function Intro({ dict }: { dict: Dict }) {
  const { ref, revealed } = useReveal<HTMLElement>();
  return (
    <section
      id="intro"
      ref={ref}
      data-revealed={revealed}
      className={styles.section}
      aria-labelledby="intro-heading"
    >
      <SectionHeading index={dict.intro.index} label={dict.intro.label} id="intro-heading" />
      <p className={styles.body} style={{ '--i': 0 } as React.CSSProperties}>{dict.intro.body}</p>
      <dl className={styles.facts}>
        {dict.intro.facts.map((fact, index) => (
          <div
            key={fact.label}
            className={styles.fact}
            data-testid="fact"
            style={{ '--i': index + 1 } as React.CSSProperties}
          >
            <dt className={`mono ${styles.factLabel}`}>{fact.label}</dt>
            <dd className={styles.factValue}>{fact.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

`Intro.module.css`: section `padding-block: var(--section-gap)`, `padding-inline: var(--gutter)`,
`max-width: var(--max)`, `margin-inline: auto`. Facts grid `repeat(4, 1fr)` → `repeat(2, 1fr)`
under 900px → `1fr` under 560px; `dd { margin: 0 }`. Reveal: children start at
`opacity: 0; translateY(16px)` and transition to visible when `[data-revealed='true']`, with
`transition-delay: calc(var(--i) * 60ms)`.

- [ ] **Step 5: Wire `Intro` into `Site.tsx`, after `Hero`**

- [ ] **Step 6: Run the e2e test to verify it passes**

Run: `npm run e2e -- content.spec.ts`
Expected: PASS, 5 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add intro section with fact grid"
```

---

### Task 7: Projects list and expandable rows

**Files:**
- Create: `src/components/Projects.tsx`, `src/components/Projects.module.css`, `src/components/ProjectRow.tsx`, `src/components/ProjectRow.module.css`
- Modify: `src/components/Site.tsx`
- Test: `e2e/projects.spec.ts`

**Interfaces:**
- Consumes: `projects`, `Dict`, `Locale`, `useReveal`
- Produces: `<Projects dict={Dict} locale={Locale} />` rendering `<section id="projects">`; `<ProjectRow project={Project} locale={Locale} dict={Dict} index={number} />`

- [ ] **Step 1: Write the failing e2e test**

Create `e2e/projects.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('all four projects are listed with taglines visible while collapsed', async ({ page }) => {
  await page.goto('/');
  const rows = page.getByTestId('project-row');
  await expect(rows).toHaveCount(4);
  await expect(page.getByText('Studentische Initiative für Quantitative Finance und algorithmischen Handel.')).toBeVisible();
});

test('a row expands and collapses, and its panel leaves the a11y tree when closed', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /tiny-moe-llm/ });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText(/dichten Backbone im Gemma-Stil/)).toBeHidden();

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/dichten Backbone im Gemma-Stil/)).toBeVisible();

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText(/dichten Backbone im Gemma-Stil/)).toBeHidden();
});

test('multiple rows can be open at once', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /tiny-moe-llm/ }).click();
  await page.getByRole('button', { name: /Assist/ }).click();
  await expect(page.getByRole('button', { name: /tiny-moe-llm/ })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('button', { name: /Assist/ })).toHaveAttribute('aria-expanded', 'true');
});

test('a project with a repo shows a link, one without shows the pending note', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /mike t-AI-son/ }).click();
  await expect(page.getByRole('link', { name: /Repository/ })).toHaveAttribute(
    'href',
    'https://github.com/ArminBurkhardt/HackTheLaw',
  );

  await page.getByRole('button', { name: /tiny-moe-llm/ }).click();
  await expect(page.getByText('Aktuell im Training - das Repository wird veröffentlicht, sobald der Lauf durch ist.')).toBeVisible();
});

test('rows are operable by keyboard', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /tiny-moe-llm/ });
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

test('external project links are safely targeted', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Tübingen Quant Society/ }).click();
  const link = page.getByRole('link', { name: /Website/ });
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run e2e -- projects.spec.ts`
Expected: FAIL - no `project-row` test ids.

- [ ] **Step 3: Write `src/components/ProjectRow.tsx`**

The panel uses `hidden` when closed so it leaves the accessibility tree, and a
`grid-template-rows: 0fr → 1fr` transition for height animation without JS measurement.

```tsx
'use client';

import { useId, useState } from 'react';
import type { Dict, Locale, Project } from '@/content/types';
import { useLatticeHover } from './Lattice/LatticeContext';
import styles from './ProjectRow.module.css';

export function ProjectRow({
  project,
  locale,
  dict,
  index,
}: {
  project: Project;
  locale: Locale;
  dict: Dict;
  index: number;
}) {
  const [open, setOpen] = useState(false);
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
      onPointerEnter={() => setDomain(project.domain)}
      onPointerLeave={() => setDomain(null)}
    >
      <button
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
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

      <div id={panelId} className={styles.panel} hidden={!open}>
        <div className={styles.panelInner}>
          <p className={styles.body}>{copy.body}</p>
          <ul className={styles.stack}>
            {copy.stack.map((item) => (
              <li key={item} className={`mono ${styles.chip}`}>{item}</li>
            ))}
          </ul>
          {hasLinks ? (
            <p className={styles.links}>
              {project.links.repo && (
                <a href={project.links.repo} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {dict.projects.repo} <span aria-hidden="true">↗</span>
                </a>
              )}
              {project.links.site && (
                <a href={project.links.site} target="_blank" rel="noopener noreferrer" className={styles.link}>
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
```

Note on the `hidden` attribute: because `hidden` removes the element from rendering, the
`0fr → 1fr` transition cannot run on the same element. Resolve it by keeping `hidden` and
animating only the inner content's `opacity`/`translateY`, or by swapping `hidden` for
`inert` + `aria-hidden` after the collapse transition ends. **Pick the first option** - it is
simpler and the e2e test asserts `toBeHidden()`, which `hidden` satisfies unambiguously.

- [ ] **Step 4: Write `src/components/Projects.tsx`**

```tsx
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
      <SectionHeading index={dict.projects.index} label={dict.projects.label} id="projects-heading" />
      <ul className={styles.list}>
        {projects.map((project, index) => (
          <ProjectRow key={project.id} project={project} locale={locale} dict={dict} index={index} />
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 5: Create a temporary `LatticeContext` stub so this task builds standalone**

Create `src/components/Lattice/LatticeContext.tsx`:

```tsx
'use client';

import { createContext, useContext, useMemo, useState } from 'react';
import type { Domain } from '@/content/types';

type LatticeHover = { domain: Domain | null; setDomain: (domain: Domain | null) => void };

const LatticeHoverContext = createContext<LatticeHover>({ domain: null, setDomain: () => {} });

export function LatticeProvider({ children }: { children: React.ReactNode }) {
  const [domain, setDomain] = useState<Domain | null>(null);
  const value = useMemo(() => ({ domain, setDomain }), [domain]);
  return <LatticeHoverContext.Provider value={value}>{children}</LatticeHoverContext.Provider>;
}

export function useLatticeHover() {
  return useContext(LatticeHoverContext);
}
```

Wrap `Site`'s output in `<LatticeProvider>`.

- [ ] **Step 6: Style the rows**

`ProjectRow.module.css`: each `li` gets `border-top: 1px solid var(--rule)`, last child also
`border-bottom`. The trigger is a full-width `grid` (`auto 1fr auto auto`) button with
`background: none; border: 0; text-align: left; padding-block: clamp(1.5rem, 3vw, 2.25rem);
color: inherit; font: inherit; cursor: pointer`. Title at `clamp(1.5rem, 3vw, 2.25rem)`,
`letter-spacing: -0.02em`; tagline `var(--fg-muted)`. `.status[data-status='wip']` uses
`color: var(--accent)`. `.sign` is a `+` built from two 1px pseudo-elements that rotates 90°
and drops one bar when `[data-open='true']`. On hover the whole row shifts
`padding-left: 8px` over `--dur`. Chips are `mono`, `border: 1px solid var(--rule)`,
`padding: 0.35rem 0.6rem`, `border-radius: 2px`, laid out with `flex-wrap`. Under 640px the
grid collapses to two rows with the meta below the headline.

- [ ] **Step 7: Run the e2e test to verify it passes**

Run: `npm run e2e -- projects.spec.ts`
Expected: PASS, 6 tests.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add expandable projects section"
```

---

### Task 8: Links and footer

**Files:**
- Create: `src/components/Links.tsx`, `src/components/Links.module.css`, `src/components/Footer.tsx`, `src/components/Footer.module.css`
- Modify: `src/components/Site.tsx`
- Test: `e2e/links.spec.ts`

**Interfaces:**
- Consumes: `LINKS`, `Dict`, `useReveal`
- Produces: `<Links dict={Dict} />` rendering `<section id="links">`; `<Footer dict={Dict} />`

- [ ] **Step 1: Write the failing e2e test**

Create `e2e/links.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('linkedin and github are linked and open safely', async ({ page }) => {
  await page.goto('/');
  const linkedin = page.getByRole('link', { name: 'LinkedIn' });
  const github = page.getByRole('link', { name: 'GitHub' });
  await expect(linkedin).toHaveAttribute('href', 'https://www.linkedin.com/in/armin-burkhardt-b0472a413/');
  await expect(github).toHaveAttribute('href', 'https://github.com/ArminBurkhardt/');
  for (const link of [linkedin, github]) {
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  }
});

test('no email address appears anywhere on either locale', async ({ page }) => {
  for (const path of ['/', '/en']) {
    await page.goto(path);
    const html = await page.content();
    expect(html).not.toMatch(/mailto:/);
    expect(html).not.toMatch(/[a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
  }
});

test('footer shows the copyright line', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('© 2026 Armin Burkhardt')).toBeVisible();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run e2e -- links.spec.ts`
Expected: FAIL - LinkedIn link not found.

- [ ] **Step 3: Write `src/components/Links.tsx`**

The arrow tracks the pointer within a small range; the effect is skipped under reduced motion.

```tsx
'use client';

import type { CSSProperties } from 'react';
import { LINKS } from '@/config/site';
import type { Dict } from '@/content/types';
import { useReveal } from '@/hooks/useReveal';
import { SectionHeading } from './SectionHeading';
import styles from './Links.module.css';

const items = [
  { key: 'linkedin', href: LINKS.linkedin },
  { key: 'github', href: LINKS.github },
] as const;

export function Links({ dict }: { dict: Dict }) {
  const { ref, revealed } = useReveal<HTMLElement>();

  function track(event: React.PointerEvent<HTMLAnchorElement>) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = Math.max(-6, Math.min(6, (event.clientX - rect.right + 40) / 6));
    event.currentTarget.style.setProperty('--arrow-x', `${offset}px`);
  }

  return (
    <section id="links" ref={ref} data-revealed={revealed} className={styles.section} aria-labelledby="links-heading">
      <SectionHeading index={dict.links.index} label={dict.links.label} id="links-heading" />
      <ul className={styles.list}>
        {items.map((item, index) => (
          <li key={item.key} style={{ '--i': index } as CSSProperties}>
            <a
              className={styles.link}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onPointerMove={track}
              onPointerLeave={(event) => event.currentTarget.style.removeProperty('--arrow-x')}
            >
              <span>{dict.links[item.key]}</span>
              <span aria-hidden="true" className={styles.arrow}>↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`Links.module.css`: links at `clamp(2rem, 5vw, 3.25rem)`, `letter-spacing: -0.02em`, one per
row separated by `--rule`, `display: flex; justify-content: space-between; align-items: center;
text-decoration: none; padding-block: clamp(1.25rem, 2.5vw, 2rem)`. The underline is a
pseudo-element scaling from `transform-origin: left` on `:hover`/`:focus-visible` in
`var(--accent)`. `.arrow { transform: translateX(var(--arrow-x, 0)); transition: transform 200ms var(--ease) }`.

- [ ] **Step 4: Write `src/components/Footer.tsx`**

```tsx
import type { Dict } from '@/content/types';
import styles from './Footer.module.css';

export function Footer({ dict }: { dict: Dict }) {
  return (
    <footer className={`mono ${styles.footer}`}>
      <span>{dict.footer.copyright}</span>
      <span>{dict.footer.place}</span>
    </footer>
  );
}
```

- [ ] **Step 5: Wire both into `Site.tsx`**

- [ ] **Step 6: Run the e2e test to verify it passes**

Run: `npm run e2e -- links.spec.ts`
Expected: PASS, 3 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add contact links and footer"
```

---

### Task 9: Fixed chrome

**Files:**
- Create: `src/hooks/useActiveSection.ts`, `src/components/Chrome.tsx`, `src/components/Chrome.module.css`
- Modify: `src/components/Site.tsx` (replace the standalone `ThemeToggle` with `Chrome`)
- Test: `e2e/chrome.spec.ts`

**Interfaces:**
- Consumes: `useTheme`, `Dict`, `Locale`
- Produces: `useActiveSection(ids: readonly string[]): string`; `<Chrome dict={Dict} locale={Locale} />`

- [ ] **Step 1: Write the failing e2e test**

Create `e2e/chrome.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('the locale toggle is a real link to the other locale', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByTestId('locale-toggle');
  await expect(toggle).toHaveAttribute('href', '/en');
  await toggle.click();
  await expect(page).toHaveURL('/en');
  await expect(page.getByTestId('locale-toggle')).toHaveAttribute('href', '/');
});

test('the active locale is marked for assistive technology', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('locale-current')).toHaveAttribute('aria-current', 'true');
});

test('the section marker follows the scroll position', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('section-marker')).toContainText('Start');
  await page.locator('#projects').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('section-marker')).toContainText('Projekte');
});

test('the progress bar advances as the page scrolls', async ({ page }) => {
  await page.goto('/');
  const read = () =>
    page.getByTestId('progress').evaluate((el) => Number(getComputedStyle(el).getPropertyValue('--progress')));
  const atTop = await read();
  await page.locator('#links').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  expect(await read()).toBeGreaterThan(atTop);
});

test('the skip link moves focus to the content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Zum Inhalt springen' })).toBeFocused();
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run e2e -- chrome.spec.ts`
Expected: FAIL - no `locale-toggle` test id.

- [ ] **Step 3: Write `src/hooks/useActiveSection.ts`**

```ts
'use client';

import { useEffect, useState } from 'react';

/** Returns the id of the section currently occupying the middle of the viewport. */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    );
    for (const id of ids) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
```

- [ ] **Step 4: Write `src/components/Chrome.tsx`**

Progress is written to a CSS custom property from a passive scroll listener wrapped in
`requestAnimationFrame`, so no React state updates on scroll.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Dict, Locale } from '@/content/types';
import { useTheme } from '@/hooks/useTheme';
import { useActiveSection } from '@/hooks/useActiveSection';
import styles from './Chrome.module.css';

const SECTION_IDS = ['start', 'intro', 'projects', 'links'] as const;

export function Chrome({ dict, locale }: { dict: Dict; locale: Locale }) {
  const { theme, toggle, mounted } = useTheme();
  const active = useActiveSection(SECTION_IDS);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      progressRef.current?.style.setProperty('--progress', ratio.toFixed(4));
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const activeIndex = SECTION_IDS.indexOf(active as (typeof SECTION_IDS)[number]);
  const markerIndex = String(Math.max(0, activeIndex)).padStart(2, '0');
  const themeLabel = theme === 'dark' ? dict.a11y.themeToLight : dict.a11y.themeToDark;

  return (
    <>
      <div ref={progressRef} className={styles.progress} data-testid="progress" aria-hidden="true" />
      <header className={styles.header}>
        <a href="#start" className={`mono ${styles.wordmark}`}>{dict.hero.name}</a>
        <nav className={styles.controls} aria-label={dict.a11y.localeSwitch}>
          <button
            type="button"
            className={`mono ${styles.control}`}
            onClick={toggle}
            aria-label={themeLabel}
            title={themeLabel}
            data-testid="theme-toggle"
            suppressHydrationWarning
          >
            {mounted && theme === 'dark' ? '☾' : '☀'}
          </button>
          <span className={`mono ${styles.locales}`}>
            <span data-testid="locale-current" aria-current="true">{locale.toUpperCase()}</span>
            <span aria-hidden="true"> / </span>
            <Link
              href={locale === 'de' ? '/en' : '/'}
              className={styles.localeLink}
              data-testid="locale-toggle"
              hrefLang={locale === 'de' ? 'en' : 'de'}
            >
              {locale === 'de' ? 'EN' : 'DE'}
            </Link>
          </span>
        </nav>
      </header>
      <p className={`mono ${styles.marker}`} data-testid="section-marker" aria-hidden="true">
        {markerIndex} / 03 - {dict.sections[active === '' ? 'start' : (active as keyof Dict['sections'])]}
      </p>
    </>
  );
}
```

- [ ] **Step 5: Style the chrome**

`Chrome.module.css`: header is `position: fixed; inset: 0 0 auto 0; z-index: 10;
display: flex; justify-content: space-between; align-items: center;
padding: 1.25rem var(--gutter);` with a `backdrop-filter: blur(8px)` and a background of
`color-mix(in srgb, var(--bg) 70%, transparent)`. `.progress` is
`position: fixed; top: 0; left: 0; height: 1px; width: 100%; z-index: 11;` with
`transform: scaleX(var(--progress, 0)); transform-origin: left; background: var(--accent);`.
`.marker` is `position: fixed; right: var(--gutter); bottom: 1.25rem;` and cross-fades via a
250ms opacity transition. Hide `.marker` below 720px. Buttons reset to
`background: none; border: 0; color: var(--fg-muted); cursor: pointer` and go to `var(--fg)`
on hover.

- [ ] **Step 6: Replace the temporary `ThemeToggle` in `Site.tsx` with `Chrome`, and delete `ThemeToggle.tsx` and its CSS module**

- [ ] **Step 7: Run the full e2e suite**

Run: `npm run e2e`
Expected: PASS - including the earlier `theme.spec.ts`, which still targets `theme-toggle`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add fixed chrome with locale, theme and scroll progress"
```

---

### Task 10: Deterministic lattice layout

**Files:**
- Create: `src/components/Lattice/layout.ts`
- Test: `src/components/Lattice/layout.test.ts`

**Interfaces:**
- Consumes: `Domain`, `DOMAINS`
- Produces:
  - `type LatticeNode = { id: string; x: number; y: number; column: number; domain: Domain | null }`
  - `type LatticeEdge = { id: string; from: string; to: string }`
  - `type LatticeLayout = { nodes: LatticeNode[]; edges: LatticeEdge[]; columns: number }`
  - `function buildLattice(width: number, height: number, seed?: number): LatticeLayout`
  - `function pathToDomain(layout: LatticeLayout, domain: Domain): Set<string>` - returns edge ids on one path from a source node to that domain's terminal
  - `const LATTICE_COLUMNS = 5`

- [ ] **Step 1: Write the failing test**

Create `src/components/Lattice/layout.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLattice, pathToDomain, LATTICE_COLUMNS } from './layout.ts';
import { DOMAINS } from '@/content/types.ts';

test('layout is deterministic for the same inputs', () => {
  const a = buildLattice(1200, 800);
  const b = buildLattice(1200, 800);
  assert.deepEqual(a, b);
});

test('a different seed produces a different layout', () => {
  const a = buildLattice(1200, 800, 1);
  const b = buildLattice(1200, 800, 2);
  assert.notDeepEqual(a.nodes, b.nodes);
});

test('nodes stay inside the canvas bounds', () => {
  const { nodes } = buildLattice(1000, 600);
  for (const node of nodes) {
    assert.ok(node.x >= 0 && node.x <= 1000, `x out of bounds: ${node.x}`);
    assert.ok(node.y >= 0 && node.y <= 600, `y out of bounds: ${node.y}`);
  }
});

test('the final column holds exactly one terminal per domain', () => {
  const { nodes } = buildLattice(1200, 800);
  const terminals = nodes.filter((node) => node.column === LATTICE_COLUMNS - 1);
  assert.equal(terminals.length, DOMAINS.length);
  assert.deepEqual(
    terminals.map((node) => node.domain),
    [...DOMAINS],
  );
});

test('only terminals carry a domain', () => {
  const { nodes } = buildLattice(1200, 800);
  for (const node of nodes) {
    if (node.column !== LATTICE_COLUMNS - 1) assert.equal(node.domain, null);
  }
});

test('every edge connects adjacent columns forward', () => {
  const { nodes, edges } = buildLattice(1200, 800);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  for (const edge of edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    assert.ok(from && to, `dangling edge ${edge.id}`);
    assert.equal(to.column - from.column, 1);
  }
});

test('every terminal is reachable from the first column', () => {
  const layout = buildLattice(1200, 800);
  for (const domain of DOMAINS) {
    const path = pathToDomain(layout, domain);
    assert.ok(path.size > 0, `no path to ${domain}`);
    for (const edgeId of path) {
      assert.ok(layout.edges.some((edge) => edge.id === edgeId), `unknown edge ${edgeId}`);
    }
  }
});

test('edge ids are unique', () => {
  const { edges } = buildLattice(1200, 800);
  const ids = edges.map((edge) => edge.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('degenerate sizes do not throw', () => {
  assert.doesNotThrow(() => buildLattice(0, 0));
  assert.doesNotThrow(() => buildLattice(320, 480));
});
```

Note: `node:test` will not resolve the `@/` alias. Add to `package.json` scripts a
`--import` of a tiny loader, or simply use a relative import `../../content/types.ts` in this
test file. **Use the relative import** - no loader configuration needed.

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL - cannot resolve `./layout.ts`.

- [ ] **Step 3: Write `src/components/Lattice/layout.ts`**

```ts
import { DOMAINS, type Domain } from '../../content/types.ts';

export const LATTICE_COLUMNS = 5;
const DEFAULT_SEED = 20260803;

export type LatticeNode = { id: string; x: number; y: number; column: number; domain: Domain | null };
export type LatticeEdge = { id: string; from: string; to: string };
export type LatticeLayout = { nodes: LatticeNode[]; edges: LatticeEdge[]; columns: number };

/** mulberry32 - small, fast, and reproducible across runs. */
function rng(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const COLUMN_SIZES = [3, 5, 5, 4, DOMAINS.length];

export function buildLattice(width: number, height: number, seed = DEFAULT_SEED): LatticeLayout {
  const random = rng(seed);
  const nodes: LatticeNode[] = [];
  const edges: LatticeEdge[] = [];
  const marginX = width * 0.08;
  const usableWidth = Math.max(0, width - marginX * 2);

  for (let column = 0; column < LATTICE_COLUMNS; column += 1) {
    const count = COLUMN_SIZES[column] ?? 4;
    const x = marginX + (usableWidth * column) / Math.max(1, LATTICE_COLUMNS - 1);
    for (let row = 0; row < count; row += 1) {
      const spread = height * 0.72;
      const top = (height - spread) / 2;
      const step = spread / Math.max(1, count - 1);
      const jitterY = (random() - 0.5) * step * 0.35;
      const jitterX = (random() - 0.5) * usableWidth * 0.02;
      const isTerminal = column === LATTICE_COLUMNS - 1;
      nodes.push({
        id: `n${column}-${row}`,
        x: clamp(x + jitterX, 0, width),
        y: clamp(count === 1 ? height / 2 : top + step * row + jitterY, 0, height),
        column,
        domain: isTerminal ? (DOMAINS[row] ?? null) : null,
      });
    }
  }

  for (let column = 0; column < LATTICE_COLUMNS - 1; column += 1) {
    const from = nodes.filter((node) => node.column === column);
    const to = nodes.filter((node) => node.column === column + 1);
    for (const source of from) {
      const targets = pickTargets(source, to, random);
      for (const target of targets) {
        edges.push({ id: `${source.id}>${target.id}`, from: source.id, to: target.id });
      }
    }
  }

  ensureReachable(nodes, edges);
  return { nodes, edges, columns: LATTICE_COLUMNS };
}

function pickTargets(source: LatticeNode, candidates: LatticeNode[], random: () => number) {
  const sorted = [...candidates].sort(
    (a, b) => Math.abs(a.y - source.y) - Math.abs(b.y - source.y),
  );
  const count = 1 + Math.floor(random() * 2); // sparse: one or two forward edges
  return sorted.slice(0, Math.min(count, sorted.length));
}

/** Guarantee every node in every column beyond the first has at least one incoming edge. */
function ensureReachable(nodes: LatticeNode[], edges: LatticeEdge[]) {
  for (let column = 1; column < LATTICE_COLUMNS; column += 1) {
    const previous = nodes.filter((node) => node.column === column - 1);
    for (const node of nodes.filter((candidate) => candidate.column === column)) {
      if (edges.some((edge) => edge.to === node.id)) continue;
      const nearest = previous.reduce((best, candidate) =>
        Math.abs(candidate.y - node.y) < Math.abs(best.y - node.y) ? candidate : best,
      );
      edges.push({ id: `${nearest.id}>${node.id}`, from: nearest.id, to: node.id });
    }
  }
}

/** Walks backwards from a domain terminal to column 0, returning the edge ids on that path. */
export function pathToDomain(layout: LatticeLayout, domain: Domain): Set<string> {
  const terminal = layout.nodes.find((node) => node.domain === domain);
  const path = new Set<string>();
  if (!terminal) return path;

  let current = terminal.id;
  for (let column = LATTICE_COLUMNS - 1; column > 0; column -= 1) {
    const incoming = layout.edges.find((edge) => edge.to === current);
    if (!incoming) break;
    path.add(incoming.id);
    current = incoming.from;
  }
  return path;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test`
Expected: PASS, 29 tests total.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add deterministic lattice layout generator"
```

---

### Task 11: Lattice canvas

**Files:**
- Create: `src/components/Lattice/draw.ts`, `src/components/Lattice/Lattice.tsx`, `src/components/Lattice/Lattice.module.css`
- Modify: `src/components/Site.tsx`
- Test: `src/components/Lattice/draw.test.ts`, `e2e/lattice.spec.ts`

**Interfaces:**
- Consumes: `buildLattice`, `pathToDomain`, `LatticeLayout`, `useLatticeHover`
- Produces:
  - `type Particle = { edgeId: string; t: number; speed: number; accent: boolean }`
  - `function spawnParticle(layout: LatticeLayout, random: () => number): Particle`
  - `function advance(particles: Particle[], layout: LatticeLayout, delta: number, random: () => number): Particle[]`
  - `<Lattice dict={Dict} />`

- [ ] **Step 1: Write the failing unit test**

Create `src/components/Lattice/draw.test.ts`:

```ts
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildLattice } from './layout.ts';
import { advance, spawnParticle, MAX_PARTICLES, ACCENT_SHARE } from './draw.ts';

const layout = buildLattice(1200, 800);
const random = () => 0.5;

test('a spawned particle sits on a real edge at the start of it', () => {
  const particle = spawnParticle(layout, random);
  assert.ok(layout.edges.some((edge) => edge.id === particle.edgeId));
  assert.equal(particle.t, 0);
  assert.ok(particle.speed > 0);
});

test('advancing moves a particle forward along its edge', () => {
  const particle = spawnParticle(layout, random);
  const [moved] = advance([particle], layout, 16, random);
  assert.ok(moved);
  assert.ok(moved.t > particle.t || moved.edgeId !== particle.edgeId);
});

test('a particle that runs off the last column is removed', () => {
  const terminalEdge = layout.edges.find((edge) =>
    layout.nodes.some((node) => node.id === edge.to && node.domain !== null),
  );
  assert.ok(terminalEdge);
  const finished = [{ edgeId: terminalEdge.id, t: 0.99, speed: 0.5, accent: false }];
  assert.equal(advance(finished, layout, 100, random).length, 0);
});

test('particle count never exceeds the cap', () => {
  let particles = Array.from({ length: MAX_PARTICLES + 10 }, () => spawnParticle(layout, random));
  particles = advance(particles, layout, 16, random);
  assert.ok(particles.length <= MAX_PARTICLES);
});

test('accent share stays a small minority', () => {
  assert.ok(ACCENT_SHARE > 0 && ACCENT_SHARE <= 0.2);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL - cannot resolve `./draw.ts`.

- [ ] **Step 3: Write `src/components/Lattice/draw.ts`**

`drawFrame` takes explicit colours so it never reads CSS itself - the component resolves
`--fg-faint` and `--accent` from `getComputedStyle` and passes them in, which keeps this
module pure and testable under `node:test`.

```ts
import type { LatticeLayout, LatticeNode } from './layout.ts';

export const MAX_PARTICLES = 14;
export const ACCENT_SHARE = 0.125;
const BASE_SPEED = 0.00022; // progress per millisecond

export type Particle = { edgeId: string; t: number; speed: number; accent: boolean };

export type DrawOptions = {
  faint: string;
  accent: string;
  opacity: number;
  highlight: Set<string>;
  dpr: number;
};

export function spawnParticle(layout: LatticeLayout, random: () => number): Particle {
  const starts = layout.edges.filter((edge) =>
    layout.nodes.some((node) => node.id === edge.from && node.column === 0),
  );
  const pool = starts.length > 0 ? starts : layout.edges;
  const edge = pool[Math.floor(random() * pool.length) % pool.length];
  return {
    edgeId: edge?.id ?? '',
    t: 0,
    speed: BASE_SPEED * (0.6 + random() * 0.8),
    accent: random() < ACCENT_SHARE,
  };
}

export function advance(
  particles: Particle[],
  layout: LatticeLayout,
  delta: number,
  random: () => number,
): Particle[] {
  const next: Particle[] = [];
  for (const particle of particles) {
    const t = particle.t + particle.speed * delta;
    if (t < 1) {
      next.push({ ...particle, t });
      continue;
    }
    const edge = layout.edges.find((candidate) => candidate.id === particle.edgeId);
    const onward = edge ? layout.edges.filter((candidate) => candidate.from === edge.to) : [];
    if (onward.length === 0) continue; // reached a terminal - retire it
    const chosen = onward[Math.floor(random() * onward.length) % onward.length];
    if (chosen) next.push({ ...particle, edgeId: chosen.id, t: t - 1 });
  }
  return next.slice(0, MAX_PARTICLES);
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  layout: LatticeLayout,
  particles: Particle[],
  options: DrawOptions,
) {
  const { width, height } = ctx.canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.save();
  ctx.scale(options.dpr, options.dpr);
  ctx.globalAlpha = options.opacity;

  const byId = new Map(layout.nodes.map((node) => [node.id, node]));

  ctx.lineWidth = 1;
  for (const edge of layout.edges) {
    const from = byId.get(edge.from);
    const to = byId.get(edge.to);
    if (!from || !to) continue;
    const lit = options.highlight.has(edge.id);
    ctx.strokeStyle = lit ? options.accent : options.faint;
    ctx.globalAlpha = options.opacity * (lit ? 3.2 : 1);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }

  ctx.globalAlpha = options.opacity * 2.4;
  for (const node of layout.nodes) {
    ctx.fillStyle = options.faint;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.domain ? 3 : 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const particle of particles) {
    const edge = layout.edges.find((candidate) => candidate.id === particle.edgeId);
    const from = edge ? byId.get(edge.from) : undefined;
    const to = edge ? byId.get(edge.to) : undefined;
    if (!from || !to) continue;
    const point = interpolate(from, to, particle.t);
    ctx.globalAlpha = options.opacity * (particle.accent ? 6 : 4);
    ctx.fillStyle = particle.accent ? options.accent : options.faint;
    ctx.beginPath();
    ctx.arc(point.x, point.y, particle.accent ? 2.6 : 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function interpolate(from: LatticeNode, to: LatticeNode, t: number) {
  return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
}
```

- [ ] **Step 4: Run the unit test to verify it passes**

Run: `npm test`
Expected: PASS, 34 tests total.

- [ ] **Step 5: Write the failing e2e test**

Create `e2e/lattice.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('the canvas is decorative and hidden from assistive technology', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('lattice')).toHaveAttribute('aria-hidden', 'true');
});

test('the domain labels exist as real text for screen readers', async ({ page }) => {
  await page.goto('/');
  const labels = page.getByTestId('lattice-labels');
  await expect(labels).toContainText('Quant');
  await expect(labels).toContainText('Recht');
});

test('the canvas stays behind the content and never blocks clicks', async ({ page }) => {
  await page.goto('/');
  const events = await page.getByTestId('lattice').evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(events).toBe('none');
  await page.getByRole('button', { name: /tiny-moe-llm/ }).click();
  await expect(page.getByRole('button', { name: /tiny-moe-llm/ })).toHaveAttribute('aria-expanded', 'true');
});

test('under reduced motion the animation loop does not run', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  const frames = await page.getByTestId('lattice').evaluate((el) => el.getAttribute('data-frames'));
  await page.waitForTimeout(600);
  const later = await page.getByTestId('lattice').evaluate((el) => el.getAttribute('data-frames'));
  expect(later).toBe(frames);
  await context.close();
});
```

- [ ] **Step 6: Write `src/components/Lattice/Lattice.tsx`**

`data-frames` exists specifically so the reduced-motion test can assert the loop is idle.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import type { Dict } from '@/content/types';
import { DOMAINS } from '@/content/types';
import { buildLattice, pathToDomain, type LatticeLayout } from './layout';
import { advance, drawFrame, spawnParticle, MAX_PARTICLES, type Particle } from './draw';
import { useLatticeHover } from './LatticeContext';
import styles from './Lattice.module.css';

const FRAME_BUDGET = 1000 / 30;
const AMBIENT_OPACITY = 0.12;

export function Lattice({ dict }: { dict: Dict }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { domain } = useLatticeHover();
  const domainRef = useRef(domain);
  domainRef.current = domain;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const styles = getComputedStyle(document.documentElement);
    const faint = styles.getPropertyValue('--fg-faint').trim() || '#52525b';
    const accent = styles.getPropertyValue('--accent').trim() || '#fb4a6b';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let layout: LatticeLayout = { nodes: [], edges: [], columns: 0 };
    let particles: Particle[] = [];
    let dpr = 1;
    let frames = 0;
    let visible = true;
    let raf = 0;
    let last = 0;
    let accumulator = 0;

    const random = Math.random;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      layout = buildLattice(rect.width, rect.height);
      render(0);
    };

    const render = (delta: number) => {
      const highlight = domainRef.current ? pathToDomain(layout, domainRef.current) : new Set<string>();
      if (!reduced) {
        particles = advance(particles, layout, delta, random);
        while (particles.length < MAX_PARTICLES && random() < 0.08) {
          particles.push(spawnParticle(layout, random));
        }
      }
      drawFrame(ctx, layout, particles, {
        faint,
        accent,
        opacity: AMBIENT_OPACITY,
        highlight,
        dpr,
      });
      frames += 1;
      canvas.setAttribute('data-frames', String(frames));
    };

    const loop = (time: number) => {
      raf = requestAnimationFrame(loop);
      const delta = last === 0 ? 16 : time - last;
      last = time;
      accumulator += delta;
      if (accumulator < FRAME_BUDGET) return;
      render(accumulator);
      accumulator = 0;
    };

    const start = () => {
      if (reduced || raf !== 0) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (raf !== 0) cancelAnimationFrame(raf);
      raf = 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false;
      if (visible && !document.hidden) start();
      else stop();
    });
    observer.observe(canvas);

    const onVisibility = () => {
      if (document.hidden || !visible) stop();
      else start();
    };

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    };

    resize();
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      stop();
      observer.disconnect();
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} data-testid="lattice" aria-hidden="true" />
      <p className={styles.labels} data-testid="lattice-labels">
        {dict.a11y.latticeAlt} {DOMAINS.map((key) => dict.domains[key]).join(' · ')}
      </p>
    </div>
  );
}
```

Note: the `domain` value must reach the render loop without restarting the effect - hence
`domainRef`. Since the loop only runs while visible, a hover change while the loop is stopped
also needs a one-off redraw; add a second `useEffect` depending on `domain` that calls the
exposed redraw. **Implement this by lifting `render` into a ref** (`renderRef.current?.(0)`)
and calling it from that second effect.

- [ ] **Step 7: Style and mount**

`Lattice.module.css`: `.wrap { position: fixed; inset: 0; z-index: -1; pointer-events: none; }`,
`.canvas { width: 100%; height: 100%; pointer-events: none; opacity: 0; animation: fade 800ms var(--ease) 200ms forwards; }`,
and `.labels` is visually hidden (`clip-path: inset(50%)`, 1px box, `position: absolute`) but
present in the DOM. Under `prefers-reduced-motion` the canvas opacity is `1` with no animation.

Mount `<Lattice dict={dict} />` inside `<LatticeProvider>` in `Site.tsx`, before `<Chrome>`.

- [ ] **Step 8: Run everything**

Run: `npm test && npm run e2e`
Expected: PASS across all suites.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add ambient routing lattice canvas"
```

---

### Task 12: Metadata, sitemap and social image

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/opengraph-image.tsx`
- Modify: `src/app/(de)/page.tsx`, `src/app/(en)/en/page.tsx`
- Test: `e2e/meta.spec.ts`

**Interfaces:**
- Consumes: `SITE_URL`, `getDict`
- Produces: `/sitemap.xml`, `/robots.txt`, `/opengraph-image` - all generated at build time

- [ ] **Step 1: Write the failing e2e test**

Create `e2e/meta.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('sitemap lists both locales', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain('https://arminburkhardt.com');
  expect(body).toContain('https://arminburkhardt.com/en');
});

test('robots allows indexing and points at the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('Allow: /');
  expect(body).toContain('sitemap.xml');
});

test('each locale declares the alternate language', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(1);
  await page.goto('/en');
  await expect(page.locator('link[hreflang="de"]')).toHaveCount(1);
});

test('each locale ships its own description', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Informatikstudent/);
  await page.goto('/en');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Computer science student/);
});

test('an open graph image is referenced', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run e2e -- meta.spec.ts`
Expected: FAIL - `/sitemap.xml` returns 404.

- [ ] **Step 3: Write `src/app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date('2026-08-03');
  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/en`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ];
}
```

- [ ] **Step 4: Write `src/app/robots.ts`**

```ts
import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 5: Write `src/app/opengraph-image.tsx`**

Generated once at build time - no runtime image service.

```tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Armin Burkhardt';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          background: '#0a0a0a',
          color: '#fafaf9',
          padding: 80,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 6, color: '#52525b', textTransform: 'uppercase' }}>
          Tübingen
        </div>
        <div style={{ fontSize: 104, letterSpacing: -3, marginTop: 12 }}>Armin Burkhardt</div>
        <div style={{ fontSize: 32, color: '#a1a1aa', marginTop: 16 }}>
          Quant Finance · Machine Learning · Regulation
        </div>
        <div style={{ height: 4, width: 120, background: '#fb4a6b', marginTop: 40 }} />
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 6: Extend both pages' metadata with OpenGraph fields**

`src/app/opengraph-image.tsx` sits outside both route groups, so Next will not auto-attach it
to pages that live inside a group. Reference it explicitly on both pages - that is why
`images` is listed below.

Add to each page's exported `metadata`:

```ts
  openGraph: {
    title: dict.meta.title,
    description: dict.meta.description,
    url: '/',            // '/en' on the English page
    siteName: 'Armin Burkhardt',
    locale: 'de_DE',     // 'en_US' on the English page
    type: 'website',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Armin Burkhardt' }],
  },
  twitter: { card: 'summary_large_image', title: dict.meta.title, description: dict.meta.description },
```

- [ ] **Step 7: Run the e2e test to verify it passes**

Run: `npm run e2e -- meta.spec.ts`
Expected: PASS, 5 tests.

- [ ] **Step 8: Confirm the build stayed fully static**

Run: `npm run build`
Expected: `/`, `/en`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image` all marked `○ (Static)`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add sitemap, robots and social image"
```

---

### Task 13: Accessibility audit, reduced motion, and deployment

**Files:**
- Create: `e2e/a11y.spec.ts`, `README.md`
- Modify: whatever the audit surfaces

**Interfaces:**
- Consumes: everything
- Produces: a deployable site

- [ ] **Step 1: Write the axe audit**

Create `e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const path of ['/', '/en']) {
  for (const theme of ['dark', 'light'] as const) {
    test(`no accessibility violations on ${path} in ${theme}`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate((value) => {
        document.documentElement.setAttribute('data-theme', value);
      }, theme);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test('all project panels pass the audit when open', async ({ page }) => {
  await page.goto('/');
  for (const trigger of await page.getByTestId('project-row').getByRole('button').all()) {
    await trigger.click();
  }
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('keyboard traversal reaches every interactive element in order', async ({ page }) => {
  await page.goto('/');
  const reached: string[] = [];
  for (let index = 0; index < 12; index += 1) {
    await page.keyboard.press('Tab');
    reached.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        return el ? `${el.tagName}:${(el.textContent ?? '').slice(0, 24).trim()}` : 'none';
      }),
    );
  }
  expect(reached[0]).toContain('Zum Inhalt springen');
  expect(reached.some((entry) => entry.includes('tiny-moe-llm'))).toBeTruthy();
});
```

- [ ] **Step 2: Run it and fix every violation it reports**

Run: `npm run e2e -- a11y.spec.ts`
Expected: initially FAIL. Fix contrast, names, and roles until it passes. Do not silence
rules - fix the markup.

- [ ] **Step 3: Verify the reduced-motion path by hand**

Run: `npm run dev`, then in Chrome DevTools → Rendering → "Emulate CSS prefers-reduced-motion:
reduce", reload, and confirm: hero text appears immediately, sections are visible without
scrolling into them, the lattice paints one frame and stops, the arrow does not track the
pointer, and the scroll cue is static.

- [ ] **Step 4: Check the performance budget**

Run: `npm run build`
Expected: First Load JS for `/` under 90 kB. If it is above, the cause is almost certainly a
component that became a client component unnecessarily - check that `Hero`, `Footer` and
`SectionHeading` are still server components.

- [ ] **Step 5: Write `README.md`**

Cover: what the site is, `npm run dev`, the check gate (`npm run check && npm run e2e`), how
to add or edit a project (point at `src/content/projects.ts`, explain that `links.repo: null`
renders the pending note and pasting a URL turns it into a link), how to change the default
theme (`DEFAULT_THEME` in `src/config/site.ts`), and how to add copy in both locales.

- [ ] **Step 6: Run the full gate**

Run: `npm run check && npm run e2e`
Expected: typecheck clean, all unit tests pass, build succeeds with every route static, all
e2e suites pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "test: add accessibility audit and project readme"
```

- [ ] **Step 8: Deploy**

Push `main` to the GitHub remote, import the repository in Vercel (framework preset: Next.js,
no environment variables needed), and attach `arminburkhardt.com`. **Ask Armin before pushing
to a remote or triggering a deploy** - creating the remote and pointing DNS are his calls.

---

## Self-Review

**Spec coverage:** §3 stack → Task 1. §4 routes and locales → Tasks 3, 4, 12. §5 config and
content model → Tasks 1–3. §6.1 colour and theme persistence → Task 4. §6.2 typography →
Tasks 4, 5. §6.3 layout → Tasks 5–8. §6.4 motion → Tasks 5–8, verified in Task 13.
§7 lattice → Tasks 10, 11. §8.1 chrome → Task 9. §8.2 hero → Task 5. §8.3 intro → Task 6.
§8.4 projects → Task 7. §8.5 links → Task 8. §8.6 footer → Task 8. §9 accessibility →
Task 13. §10 performance and metadata → Tasks 12, 13. §11 testing → every task.
§12 file structure → the table above.

**Corrections against the spec:** the spec's assumption of `2025–` for the Tübingen Quant
Society is replaced by `2026` for all four projects, from the git history of each repository
(Assist 2026-04, tiny-moe-llm 2026-05, HackTheLaw 2026-06, TQS site 2026-07). Assist's stack
is confirmed as Kotlin/Android from its Gradle build files. The spec's single root layout is
replaced by two route-group layouts, because `<html lang>` must differ per locale and
`headers()` would break static rendering.

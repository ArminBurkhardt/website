# arminburkhardt.com - Design Spec

Date: 2026-08-03
Status: approved design, ready for implementation planning

## 1. Purpose

A personal portfolio at `arminburkhardt.com` for Armin Burkhardt - B.Sc. Informatik student
in Tübingen, working across quantitative finance, machine learning and financial regulation.

**Primary audience:** potential co-founders and collaborators trying to work out what makes
him interesting. Secondary: recruiters and people who searched his name.

**The page must answer, within one screen and one scroll:** who he is, what he actually
builds, and how to reach him.

**Success criteria**
- A stranger understands his focus areas within five seconds of landing.
- Every project is legible without expanding it, and rewards expanding it.
- The site feels designed, not templated - distinct character, no stock hero.
- Loads fast on mobile, works with JavaScript motion disabled, reads correctly in both
  German and English.

## 2. Non-goals

- No CMS, no blog, no contact form, no analytics, no cookies.
- No backend of any kind: no route handlers, no middleware, no server actions.
- No Impressum or privacy page (explicit decision - purely private page).
- No dedicated project detail pages; projects expand in place.
- No email address on the page. LinkedIn and GitHub are the only contact paths.

## 3. Stack and deployment

| Concern | Choice | Reason |
| --- | --- | --- |
| Framework | Next.js App Router, TypeScript | Matches the stack Armin already runs for tuequant.de |
| Rendering | Fully static (SSG) - every route prerendered | Vercel serves CDN assets only; nothing serverless to pay for or debug |
| Styling | CSS Modules + CSS custom properties | No utility-class noise, themeable via variables, zero runtime |
| Motion | Hand-rolled: CSS transitions + one `IntersectionObserver` hook + one `<canvas>` | No animation dependency; total motion code stays under ~200 lines |
| Fonts | Geist Sans + Geist Mono, self-hosted | Zero external requests, crisp geometric character |
| Hosting | Vercel, production branch `main` | Domain already owned |

Node 24.x pinned in `engines` to match the Vercel runtime.

## 4. Information architecture

Single-page scroll, two prerendered locales:

| Route | Locale | Notes |
| --- | --- | --- |
| `/` | German | Default locale, per config |
| `/en` | English | Full translation |

Both routes render the same `<Page>` component with a different dictionary. The language
toggle is an `<a>` to the other locale - a real, shareable, indexable URL, not client state.
`<html lang>` is set per route; each route emits `alternate` links to the other locale.

**Sections** (in scroll order): Hero → Intro → Projects → Links → Footer.

## 5. Configuration and content model

Three files carry everything editable. No copy lives inside components.

### 5.1 `src/config/site.ts`

```ts
export const DEFAULT_LOCALE = 'de' as const;
export const DEFAULT_THEME: 'dark' | 'light' = 'dark';
export const LINKS = {
  linkedin: 'https://www.linkedin.com/in/armin-burkhardt-b0472a413/',
  github: 'https://github.com/ArminBurkhardt/',
} as const;
```

`DEFAULT_THEME` is a single constant so the default can be flipped without touching
components or CSS.

### 5.2 `src/content/projects.ts`

The file Armin edits most. One entry per project:

```ts
type Domain = 'quant' | 'ml' | 'law' | 'access';
type Status = 'live' | 'wip';

type Project = {
  id: string;
  year: string;
  domain: Domain;          // selects which lattice terminal node lights on hover
  status: Status;
  links: {
    repo: string | null;   // null → renders the "repository follows" note
    site: string | null;
  };
  de: ProjectCopy;
  en: ProjectCopy;
};

type ProjectCopy = {
  title: string;
  tagline: string;         // one line, visible collapsed
  body: string;            // 2–4 sentences, revealed on expand
  stack: string[];         // chips
  pendingNote?: string;    // overrides the default WIP note
};
```

**Link rule:** `repo: null` renders a muted mono note in place of the link
(DE: „Repository wird bald veröffentlicht" / EN: "Repository releasing soon") rather than a
disabled link. Pasting a URL turns it into a link with no other change. A unit test enforces
that `status: 'wip'` entries either supply `pendingNote` or fall back to the default note.

**Initial entries** (years marked ⚠ are my assumption - confirm during review):

| id | year | domain | status | repo | site |
| --- | --- | --- | --- | --- | --- |
| `tqs` | 2025– ⚠ | quant | live | null | `https://tuequant.de` |
| `mike-t-ai-son` | 2026 | law | live | `https://github.com/ArminBurkhardt/HackTheLaw` | null |
| `tiny-moe-llm` | 2026 | ml | wip | null | null |
| `assist` | 2026 | access | live | null | null |

Draft copy (DE, to be refined in implementation):

- **Tübingen Quant Society** - „Studentische Initiative für Quantitative Finance und
  algorithmischen Handel, mitgegründet in Tübingen." Body covers the initiative itself plus
  the bilingual Next.js site with SAML-2.0-Uni-Login that he built for it.
- **mike t-AI-son** - „Adversariales Trainingstool für juristische Argumentation, gebaut bei
  HackTheLaw Cambridge." Body covers Legoras „The Sparring Room"-Challenge, FastAPI + React.
- **tiny-moe-llm** - „Sprachmodell mit ~243M Parametern und einer geloopten, spärlich
  gerouteten Mixture-of-Experts-Architektur." Body covers heterogene Experten, Multi-Token-Prediction,
  FP8/NVFP4-Training. Status WIP: „aktuell im Training".
- **Assist** - „Sprachgesteuerter Android-Assistent für blinde und sehbeeinträchtigte
  Nutzer:innen." Body covers on-device tools, LLM-Aktionen, deutsche TTS-Ausgabe.

### 5.3 `src/content/site.ts`

Locale dictionaries for everything that is not a project:

```ts
type Dict = { hero: {...}; intro: {...}; sections: {...}; links: {...}; footer: {...}; a11y: {...} };
export const dictionaries: Record<Locale, Dict> = { de, en };
```

Both locales are typed against the same `Dict`, so a missing key is a build error. A unit
test additionally asserts deep key parity and that no value is an empty string.

## 6. Visual system

### 6.1 Colour

Dark is the default. Both themes are defined as CSS custom properties on `:root` and
`[data-theme]`, so nothing else in the CSS knows which theme is active.

| Token | Dark (default) | Light |
| --- | --- | --- |
| `--bg` | `#0A0A0A` | `#FAFAF9` |
| `--fg` | `#FAFAF9` | `#0A0A0A` |
| `--fg-muted` | `#A1A1AA` | `#52525B` |
| `--fg-faint` | `#52525B` | `#A1A1AA` |
| `--rule` | `rgba(250,250,249,0.10)` | `rgba(10,10,10,0.10)` |
| `--accent` | `#FB4A6B` | `#E11D48` |

The accent is rose, deliberately scarce - it may appear on **at most three things at once**:
the active routing packet in the lattice, the current-section tick, and a link underline on
hover/focus. Never as a fill, never on text blocks.

**Theme persistence:** a small blocking inline script in `<head>` reads
`localStorage.theme`, falls back to `DEFAULT_THEME`, and sets `data-theme` on `<html>`
before first paint - no flash. `prefers-color-scheme` is deliberately *not* consulted; the
configured default wins until the user toggles.

### 6.2 Typography

- Display and body: **Geist Sans**. Micro-labels, indices, years, status tags: **Geist Mono**.
- Hero name: `clamp(3.5rem, 9vw, 8rem)`, weight 500, tracking `-0.035em`, line-height 0.95.
- Section headings: `clamp(1.75rem, 3.5vw, 2.75rem)`, tracking `-0.02em`.
- Body: `1.0625rem`/1.65, `--fg-muted`, max width 62ch.
- Micro-labels: mono, `0.6875rem`, `letter-spacing: 0.18em`, uppercase, `--fg-faint`.

Fonts are self-hosted, `font-display: swap`, preloaded for the two weights actually used.

### 6.3 Layout and spacing

12-column grid, `max-width: 1240px`, gutters `clamp(1.25rem, 5vw, 4rem)`. Section rhythm on
a 8px base: sections separated by `clamp(6rem, 14vh, 10rem)` and a hairline `--rule`.
Mobile collapses to a single column; the fact grid goes 4 → 2 → 1.

### 6.4 Motion

- Duration 400–700ms, easing `cubic-bezier(0.16, 1, 0.3, 1)`.
- Reveal-on-scroll: `opacity 0 → 1`, `translateY(16px) → 0`, staggered 60ms per child,
  triggered once at 15% visibility via a shared `useReveal` hook.
- Hairlines draw in via `scaleX(0) → 1`, `transform-origin: left`.
- Link hover: underline wipes in from the left; arrow eases ~4px toward the cursor.
- Accordion: height animated via a grid-rows `0fr → 1fr` transition (no JS measuring).

**`prefers-reduced-motion: reduce` kills all of it:** reveals become instant, hairlines are
drawn, the arrow stops tracking, and the lattice renders exactly one static frame.

## 7. The routing lattice

The single distinctive element, and the reason the site is his rather than generic: an
ambient visualization of sparse expert routing - the architecture of his own tiny-moe-llm -
used as the structural metaphor for a person who routes between four domains.

**Behaviour**
- A `<canvas>` fixed behind the hero and projects sections, drawn at device pixel ratio.
- A sparse lattice of nodes in ~4 columns, laid out deterministically from a fixed seed so
  it renders identically every load. Right-most column has exactly four terminal nodes,
  labelled in mono: **QUANT · ML · LAW · ACCESS**.
- Particles enter left and traverse one path per pass, choosing edges with weighted
  randomness. Roughly one particle in eight is rose; the rest are `--fg-faint`.
- Calm by default: overall opacity ~0.10–0.14, particle speed slow, at most ~14 particles
  alive. It must never compete with the text.
- Hovering a project row raises the opacity of the path leading to that project's `domain`
  terminal and tints it rose; leaving restores the ambient state over ~600ms.

**Constraints**
- Text paints first; the canvas mounts after hydration and fades in over 800ms. LCP is the
  hero heading, never the canvas.
- `requestAnimationFrame` loop pauses when the canvas leaves the viewport
  (`IntersectionObserver`) and on `document.hidden`.
- Capped at ~30fps via frame-time accumulation; skipped entirely under reduced motion after
  one static frame.
- Resize is debounced and re-seeds deterministically.
- The canvas is `aria-hidden` and not focusable.

## 8. Section specifications

### 8.1 Chrome (fixed)
Wordmark `Armin Burkhardt` top-left (mono, small, links to top). Top-right: theme toggle
(sun/moon, 24px, `aria-label` from dictionary) and `DE / EN` where the inactive locale is a
link and the active one is plain text with `aria-current="true"`. A 1px progress bar spans
the top edge, filled in `--accent` proportional to scroll. Bottom-right, a mono marker
cross-fades as sections change, using the same numbering as the section labels - hero is
`00 - START`, so the marker reads `02 / 03 - PROJEKTE` over the projects section. The chrome
remains fully visible under reduced motion; only its transitions are dropped.

### 8.2 Hero
Full viewport height (`100svh`). Mono kicker (DE: „Informatikstudent · Tübingen"), name as
display type, then one positioning line: quant finance, machine learning, financial
regulation. A mono `SCROLL` cue at the bottom with a 2px line that breathes vertically.
Entrance: kicker, name, line, cue reveal in sequence at 80ms stagger on load.

### 8.3 Intro
Section label `01 - ÜBER MICH`. Two to three sentences in first person, then a four-cell
fact grid, each cell a mono label over a value:
Studium (B.Sc. Informatik, Universität Tübingen, 2024–2027) · Rolle (Studentische Hilfskraft,
IBMI Tübingen) · Fokus (Quant Finance · ML · Regulierung) · Initiative (Tübingen Quant
Society, Mitgründer).

### 8.4 Projects
Section label `02 - PROJEKTE`. Rows separated by hairlines. Collapsed row:
mono index (`01`), title, tagline, and right-aligned year plus status tag (`LIVE` / `WIP`,
WIP in accent). The whole row is a `<button>` with `aria-expanded` and
`aria-controls`; a `+` rotates to `×` when open.

Expanded panel reveals body copy, stack chips (mono, hairline-bordered), and the link row:
repo and/or site as arrow links, or the pending note when `repo` and `site` are both null.
Multiple rows may be open at once - no forced accordion collapse.

Hovering or focusing a row lights the corresponding lattice path (section 7).

### 8.5 Links
Section label `03 - KONTAKT`. LinkedIn and GitHub as two oversized rows (display type,
hairline-separated) with a trailing `↗` that eases toward the cursor on hover.
`target="_blank"` with `rel="noopener noreferrer"`.

### 8.6 Footer
One mono line: `© 2026 Armin Burkhardt` left, `Tübingen` right. Nothing else.

## 9. Accessibility

- Semantic landmarks: `header`, `main`, `section` with `aria-labelledby`, `footer`.
- Skip-to-content link, visible on focus.
- Accordion: native `<button>`, `aria-expanded`, `aria-controls`, panel `hidden` when closed
  so its content stays out of the tab order and the accessibility tree.
- Visible `:focus-visible` ring (2px, `--accent`, 2px offset) on every interactive element.
- Contrast: `--fg` on `--bg` in both themes exceeds 15:1; `--fg-muted` exceeds 4.5:1.
  `--fg-faint` is used only for decorative micro-labels that are not the sole carrier of
  meaning.
- Canvas `aria-hidden="true"`; the four domain labels also appear as real text in the DOM
  (visually hidden) so the metaphor is not screen-reader-only decoration.
- Full keyboard traversal verified: skip link → chrome → hero → each project row → links.

## 10. Performance budget

| Metric | Budget |
| --- | --- |
| JS shipped (gzip) | < 90 kB total |
| Fonts | ≤ 3 files, subset to latin |
| LCP (mobile, 4G) | < 1.5s |
| CLS | 0 |
| Lighthouse (perf / a11y / best practices / SEO) | ≥ 95 each |

Images: none required by the design. Metadata: per-locale title/description, OG image
generated once at build time as a static asset (no `@vercel/og` runtime), `robots.txt`,
`sitemap.xml` covering both locales.

## 11. Testing strategy

**Unit (node:test + tsx, matching the tuequant.de setup):**
- Dictionary parity: `de` and `en` have identical key trees, no empty strings.
- Project config validity: ids unique and slug-safe, every entry has both locales, every
  `stack` is non-empty, `status: 'wip'` resolves to a pending note when links are null,
  non-null links parse as absolute `https:` URLs.
- Lattice layout is deterministic: same seed and dimensions produce identical node
  coordinates across two runs.

**End-to-end (Playwright, run locally against the production build):**
- `/` renders in German, `/en` in English; the toggle navigates between them.
- Each project row expands and collapses; expanded content is in the accessibility tree only
  when open.
- Theme toggle flips `data-theme` and survives a reload.
- With `prefers-reduced-motion: reduce` emulated, no animation-driven layout change occurs.
- Axe scan on both locales, both themes: zero violations.

**Gate before merge:** `npm run typecheck && npm test && npm run build && npx playwright test`.

## 12. File structure

```
src/
  app/
    layout.tsx            # html shell, fonts, theme script, metadata
    page.tsx              # German route  → <Site locale="de" />
    en/page.tsx           # English route → <Site locale="en" />
    globals.css           # tokens, reset, base type
  components/
    Site.tsx              # composes the sections for a locale
    Chrome.tsx            # wordmark, theme + locale toggles, progress, marker
    Hero.tsx
    Intro.tsx
    Projects.tsx          # list
    ProjectRow.tsx        # single expandable row
    Links.tsx
    Footer.tsx
    Lattice/
      Lattice.tsx         # canvas mount, observers, reduced-motion gate
      layout.ts           # deterministic seeded node/edge generation
      draw.ts             # per-frame rendering
  hooks/
    useReveal.ts          # IntersectionObserver reveal
    useTheme.ts
    useActiveSection.ts
  config/site.ts
  content/
    site.ts
    projects.ts
    types.ts
```

Each component owns a co-located `.module.css`. No component file exceeds ~150 lines; the
lattice is split across three files precisely so the canvas logic stays reviewable.

## 13. Assumptions to confirm

1. TQS founding year listed as `2025–`; mike t-AI-son, tiny-moe-llm and Assist as `2026`.
2. The TQS website repository and the Assist repository are private, so both ship with
   `repo: null`. `tuequant.de` is linked as a live site.
3. Intro copy will be drafted in German first and translated; Armin reviews both before merge.

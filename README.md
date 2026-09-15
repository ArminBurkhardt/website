# arminburkhardt.com

Personal portfolio for [arminburkhardt.com](https://arminburkhardt.com). Bilingual
(German at `/`, English at `/en`), fully statically prerendered, deployed on GitHub Pages.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

## Checks

```bash
npm run check
```

That runs `typecheck`, the unit tests, and a production build. The end-to-end suite runs
separately and builds the site itself:

```bash
npm run e2e
```

The e2e suite covers both locales, both themes, the project accordion, the lattice canvas,
metadata routes, and an axe accessibility audit.

## Editing content

All copy lives in `src/content`. Nothing needs touching in components.

### Projects

`src/content/projects.ts` holds one entry per project. To add or change one, edit that file:

```ts
{
  id: 'my-project',
  year: '2026',
  domain: 'ml',              // quant | ml | law - picks the lattice path that lights up on hover
  status: 'wip',             // live | wip
  links: { repo: null, site: null },
  de: { title, tagline, body, stack: ['…'], pendingNote: '…' },
  en: { title, tagline, body, stack: ['…'], pendingNote: '…' },
}
```

**`links.repo: null` renders a "releasing soon" note instead of a link.** Paste a repository
URL there and it becomes a real link - nothing else changes. The same applies to
`links.site`. Use `pendingNote` to say something specific (e.g. "currently training");
without it, the locale's `defaultPendingNote` is used.

Unit tests enforce that ids are unique, both locales are filled in, stacks match across
locales, links are absolute `https:` URLs, and that a work-in-progress project with no links
carries a pending note.

### CV

`src/content/cv.ts` holds the CV entries - education, experience, engagement and awards.
Each entry names its `group` and carries `de`/`en` copy (`title`, `org`, `period`, optional
`mode` and `detail`). List entries in group order, newest first within a group. The current
grade sits on the education entry as `grade: 1.09` and is formatted per locale (`1,09` /
`1.09`); update it there when it changes.

### Everything else

`src/content/site.ts` holds the `de` and `en` dictionaries: hero, intro, fact grid, section
labels, footer, and accessibility strings. Both locales are typed against one `Dict` shape,
so a missing key fails the build, and a test asserts the two key trees match exactly.

## Configuration

`src/config/site.ts`:

- `DEFAULT_THEME` - `'dark'` or `'light'`. The site loads with this; a blocking inline script
  applies it before first paint, so there is no flash. `prefers-color-scheme` is deliberately
  not consulted - the configured default wins until a visitor uses the toggle, and their
  choice then persists in `localStorage`.
- `DEFAULT_LOCALE`, `SITE_URL`, and `LINKS` (LinkedIn and GitHub).

## Design notes

Tokens live in `src/app/globals.css`. The rose `--accent` is deliberately scarce - the scroll
progress bar, work-in-progress status tags, link underlines on hover, and the occasional
routing packet.

The background canvas (`src/components/Lattice/`) is an ambient visualisation of sparse
expert routing: particles enter from the left and are routed to one of four terminals -
Quant, ML, Law, other. Hovering a project row lights the path to that project's domain. The
layout is generated from a fixed seed, so it renders identically on every load. The loop
pauses off-screen and on hidden tabs, and `prefers-reduced-motion` reduces it to a single
static frame.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds a static export
(`next build` with `output: 'export'`) and publishes it via GitHub Pages. In the repo's
**Settings → Pages**, set the source to "GitHub Actions". The custom domain is configured via
`public/CNAME`; point the domain's DNS at GitHub Pages (an `ALIAS`/`ANAME`/`A` record for the
apex, per [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)),
then set it again under **Settings → Pages → Custom domain** so GitHub provisions HTTPS.

Note: GitHub Pages serves static files only and doesn't support custom response headers, so the
`X-Content-Type-Options` / `Referrer-Policy` / `Permissions-Policy` headers Vercel used to send
are no longer set.

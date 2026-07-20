# Agent Notes

## Architecture

- Keep route files in `src/pages` thin. They should load data, compose the page component, and avoid embedding page content directly.
- Reusable UI belongs in `src/components`.
- Page-specific styling belongs in `src/styles`.
- Do not rewrite the homepage architecture when working on interior pages unless a genuinely shared component needs a small fix.

## I18n Contract

- Reuse `src/components/i18n/LocalizationClient.astro` for localized pages. Do not create a separate language-switching script for interior pages.
- Localized strings must ship in the `localized-content` JSON payload and be wired with the shared hooks:
  - `data-i18n`
  - `data-i18n-html`
  - `data-i18n-placeholder`
  - `data-i18n-aria-label`
  - `data-lang-toggle`
  - `data-lang-option`
- Homepage content is Keystatic-managed under `src/content/homepage/`.
- Interior-page locale content currently lives in `src/content/interior-pages/locales/en.json`, `br.json`, and `cn.json`.
- Use `src/lib/interior-pages/reader.ts` to build route-specific localized bundles. Do not reintroduce a one-off English content module for interior pages.

## Shared Shell

- Reuse `src/components/site/BrandLogo.astro` for the brand mark.
- Reuse `src/components/site/LanguageSwitcher.astro` for desktop/footer language controls.
- Reuse `src/components/site/InteriorHeader.astro` and `src/components/site/InteriorFooter.astro` for interior pages instead of copying header/footer markup into page components.
- If you change the header/footer logo or language control styling, verify both the homepage and interior pages still look aligned.

## Links And Content

- Homepage-to-interior route wiring lives in `src/lib/homepage/links.ts`.
- Keep `mockup/` in place. Do not move or delete it.
- If content is static for now, structure it so it can be localized later rather than hardcoding single-language copy inside components.

## Mockup Coverage — What Exists and What Doesn't

The `mockup/` folder is the authoritative design reference. Know its limits:

| Mockup file | Page covered |
|-------------|-------------|
| `1 - LATAMCHINATECH_desktop v 1million.htm` | Desktop homepage |
| `2 - LATAMCHINATECH_mobille.htm` | Mobile homepage |
| `3 - Challenges___Competitions_v7.htm` | Competitions listing |
| `4 - PRE registration_v13.html` | Pre-registration form |
| `5 - events_v11.htm` | Events listing |
| _(none)_ | News listing, News article, Competition detail, Event detail, Event application |

**No mockup = use design judgment.** Match the site's established visual language (colors, spacing, typography, shell components). Do not invent new patterns.

**Implementation may be ahead of mockups.** Some features are live that don't appear in any mockup (e.g. the mega-menu on interior pages). Do not remove or regress features just because a mockup doesn't show them.

## Verification

- Run `npm test`.
- Run `npm run build`.
- If you touched localized UI, verify language switching in the browser for at least one interior page and the homepage.
- **Use browser/screenshot tools to visually confirm changes before claiming a fix is complete.** Build the site and capture screenshots of affected pages; don't rely solely on code inspection.

## CHECKLIST.md

`CHECKLIST.md` tracks 56 UI/UX refinement items. Treat it as a starting point, not ground truth:

- Items marked ✅ may not actually be complete — verify in code before trusting the status.
- Items marked ⚠️ (partial) are known to be incomplete.
- After finishing any work, update `CHECKLIST.md` to reflect the actual current state.

## Customer Feedback Loop

A multi-agent workflow for processing UI/UX feedback against HTML mockups. Uses the `customer-feedback-loop` skill (in `~/.agents/skills/superpowers/customer-feedback-loop/`).

### Pipeline

1. **Triage** (orchestrator) — collect feedback, identify mockup refs and affected routes
2. **Analysis** (analyst subagent) — compare mockup HTML/CSS vs implementation, produce `.opencode/feedback/analysis-YYYY-MM-DD.md`
3. **Implementation** (implementer subagents) — fix approved batches, one commit per batch
4. **Verification** (fresh verifier subagent) — independently confirm fixes match mockups, using screenshots

### Artifacts

- Analysis artifacts live in `.opencode/feedback/` (project-level, gitignored)
- Each feedback item gets a stable ID: FB-001, FB-002, etc.
- Verification reports are appended to the analysis artifact

### Rules for Feedback Implementers

- All rules in this file (Architecture, I18n, Shared Shell, etc.) still apply
- Match exact CSS values from mockups — no approximations
- Minimal changes only — fix what's specified, don't refactor surroundings
- One commit per coherent batch, message format: `fix(ui): [theme] — FB-NNN, FB-NNN`
- Run `npm run build` after each batch before proceeding
- Capture screenshots of affected pages after implementation; include in report

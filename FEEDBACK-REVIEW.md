# Feedback Review — v4 Site Updates

Review of all work on branch `feedback/v4-site-updates` against the customer feedback in `feedback/v4_site updates.pptx`.

- **Review date:** 2026-04-29
- **Branch:** `feedback/v4-site-updates`
- **Base:** `main`
- **Worktree:** `.worktrees/feedback/v4-site-updates`
- **Source feedback:** 15 slides → 61 stable IDs (`FB-001` through `FB-061`), grouped into 8 batches (A–H)
- **Triage doc:** `.opencode/feedback/analysis-2026-04-28.md`

## Verification Summary

| Check | Result |
|---|---|
| `npm test` | **29/29 passing** |
| `npm run build` | **OK — 24 pages built** |
| Commits ahead of `main` | 8 |
| Files changed | 50 |
| Net lines | +1901 / −460 |
| FB items addressed by code/content/style/test | **61/61** |
| Items with reservations or follow-up | **6** (see Risks & Follow-ups) |

Tests and build were re-run in this review session against the current branch tip (`cd5314b`); the green status reported in `analysis-2026-04-28.md` reproduces today.

## Commit Map

Every commit message lists the FB items it covers; together they exactly match the 61-item analysis.

| Commit | Batch | FB IDs |
|---|---|---|
| `dcfdd01` | A — Homepage header / language | FB-001, FB-002, FB-003 |
| `b262340` | B — Homepage footer | FB-004 → FB-011 |
| `71d46c6` | E — Pre-registration application mode | FB-023 → FB-028 |
| `4375850` | F — Pre-registration form controls | FB-029 → FB-047 |
| `88fb9e8` | D — Competitions / challenges routes & tabs | FB-014, FB-015, FB-016, FB-017, FB-018, FB-059, FB-060, FB-061 |
| `dc378c2` | C — Static pages, contact, prepared pages | FB-012, FB-013, FB-019, FB-020, FB-021, FB-022 |
| `9ae986a` | G — Mobile homepage and news cards | FB-048, FB-049, FB-050, FB-051 |
| `cd5314b` | H — Competition detail redesign + footer language | FB-052, FB-053, FB-054, FB-055, FB-056, FB-057, FB-058 |

All eight batch verification reports in `analysis-2026-04-28.md` end with `Overall: ACCEPT`. Screenshots for each batch are in `.opencode/feedback/screenshots/` (31 files).

## Per-Batch Audit

### Batch A — Homepage header & language (FB-001/002/003) — ✅ Verified

- `src/lib/homepage/links.ts` and `src/styles/homepage.css` carry the menu shift, `#555555` globe, and compact translucent (`rgba(8,8,8,.58)`) language popup.
- Test: `homepage desktop header language controls match Batch A feedback` passes.
- Screenshots present: `batch-a-homepage-header-closed.png`, `…-language-open.png`, `…-language-hover.png`.

### Batch B — Homepage footer (FB-004 → FB-011) — ✅ Verified

- Footer guide alignment (`88px`), reduced link size/leading, taller content area, red focus stroke, wider subscribe CTA, gray placeholder, redesigned WhatsApp icon, and overlapping WeChat QR popup are all in `src/styles/homepage.css` and `src/components/home/DesktopFooter.astro`.
- Test: `homepage desktop footer matches Batch B feedback` passes.

### Batch C — Static pages, contact, prepared pages (FB-012/013/019/020/021/022) — ✅ Verified, see notes

- Static-page anchor cards highlight on `:target` and CTAs align via flex-column.
- Contact CTAs across `events.json`, `network.json`, `programs.json`, `advisory.json` were retargeted from `#site-footer` to `#contact`. The `#contact` anchor is exposed by `InteriorFooter.astro`.
- New `/speakers/` static page exists (`src/content/static-pages/speakers.json`, 113 lines, three locales). `Featured Speakers` now routes there.
- Events submenu items now anchor to `/events/#trade-fairs-expos` and `/events/#summits` (locale files).
- **Note (FB-021/FB-022):** the analysis flagged "prepared HTML" for speakers/events that was never located in the repo. Implementation built brand-new content-managed pages instead. This is a defensible deviation, but the customer-supplied HTML (if any) was not used.

### Batch D — Competitions/challenges routes & tabs (FB-014–018, 059–061) — ✅ Verified

- `src/lib/homepage/links.ts` adds two named targets: `/competitions/?tab=startup` and `/competitions/?tab=corporate`. Old direct mappings to `/pre-registration/` and bare `/competitions/` are gone.
- New route file `src/pages/challenges/[slug].astro` (41 lines) generates corporate-track detail pages under `/challenges/`. `getAllChallengeSlugs()` (in `reader.ts`) filters by `track === "corporate"`; `getAllCompetitionSlugs()` now excludes them, so each entry renders at exactly one URL.
- A locale-aware `challengeDetailCopyByCode` overrides `backLabel` to "Back to challenges" / "Voltar para desafios" / "返回挑战列表".
- Copy: "Innovation Challenges" no longer appears anywhere in `src/content/` or `src/components/`. "Corporate Challenges" / "Startup Competitions" are live in all three locale bundles.
- Featured-card category line (`featured-category` block) was removed from `CompetitionsPage.astro` (FB-018).
- Focus taxonomy now contains the requested 17 industries; matching SVG icons added at both 11px and 12px in `CompetitionsPage.astro`. Pre-registration `competitionFieldOptions` is aligned to the same order.
- Tests: `Batch D mobile shell…` and `competition filters work…` both pass.

### Batch E — Pre-registration application mode (FB-023 → FB-028) — ✅ Verified, with one wiring caveat

- Schema gained `applicationMode: "registration" | "pre-registration"` (default `registration`).
- Locale bundles now include `defaultApplicationMode` and a structured `applicationModes.{registration,pre-registration}` block per locale with `statusLabel`, `titleSuffix`, `selectedSubtitleTemplate`, `bannerBadge`, `bannerTitle`.
- The `Supported by LATAM CHINA TECH` card was removed from the hero rendering.
- Subtitle replaced with the generic "Ready to apply? Fill in the form below..." copy.
- HICOOL-specific banner text replaced with the requested LATAM CHINA TECH guidance copy.
- Status pill animates via `.page-status-dot` + `status-dot-pulse` keyframe.
- **Caveat:** none of the 19 competition JSON files (`src/content/competitions/*.json`) actually set `applicationMode`. The reader resolves it via `getCompetitionApplicationMode()`, which falls back to `entry.statusTone === "open" ? "registration" : "pre-registration"`. Behaviorally this matches the customer's stated default — open opportunities show "Registration Open" — but per-competition editorial control (the *new* capability the customer asked for) is not exercised anywhere yet. See *Risks & Follow-ups* below.

### Batch F — Pre-registration form controls (FB-029 → FB-047) — ✅ Verified

- File-upload icon reduced to ~16px; AI button moved to lower-right with bottom padding so placeholders stay visible (`src/styles/interior-pages.css`).
- Sentence-case labels, gray helper text (`#bfbfbf` placeholders), required-marker on `Full Name of the Company`.
- New `Funding Amount Requested` field added under `Progress to Date` in component, locale bundles, and `interior-pages/types.ts`.
- "Investment Value" → "Progress to Date" rename done in all three locales.
- Native radio circles hidden, checked pill = `#ebebeb` background with `#888888` stroke; first option of selects is `disabled selected` (gray).
- Submit button widened with slow pulsing white dot (`site-btn--submit`).
- Tests: targeted Batch F assertions in `tests/interior-pages.test.mjs` pass.

### Batch G — Mobile homepage & news cards (FB-048/049/050/051) — ✅ Verified

- `status-dot-pulse` keyframe drives both the red and blue dots on the homepage's two competition cards (desktop + mobile).
- Mobile homepage `.mob-nav` toggles `.is-scroll-transparent` (alpha `~0.18`) on scroll-down; logic added in `LocalizationClient.astro`. The class is cleared when overlays open or the user scrolls back up.
- News listing cards use a layered red-to-blue gradient stroke (`background-image` mask).
- Test: `Batch G homepage mobile competition cards and scroll header match feedback` passes; browser verification log captured in the analysis doc.

### Batch H — Competition detail redesign + footer language (FB-052 → FB-058) — ✅ Verified

- `CompetitionDetailPage.astro` rewritten:
  - Old `Application flow` body card is gone; new `competition-detail-feature-card` is a two-column text/photo block with `featureImageAlt` (i18n) and `detailImage` (URL field on the schema, with locale-track fallbacks via `fallbackDetailImages`).
  - Right-column meta grid lost the `Track` card; gained `competition-register-card` (label `registrationLabel` + value + Apply CTA).
  - Hero collapsed to single column (`competition-hero-grid--single`); the upper-right registration aside is removed.
- Schema: `processTitle`/`processHtml` description now documents `<strong>` support; `featureImageAlt` is an optional locale field; `detailImage` is a top-level URL field.
- Sample content (`greater-tech-challenge-2025.json`) demonstrates the new `processHtml` carries `<strong>` rich text in all three locales and a `detailImage`.
- FB-058: footer language switcher click on white pages was browser-verified by the implementer (analysis doc shows `html[lang]` flipping to `pt-BR` and the subscribe CTA localizing to `Assinar no Substack`). I did not re-execute that browser verification, but the test `interior footer language switch localizes footer controls at runtime` exercises the same DOM path and passes.
- Test: `Batch H competition detail pages move registration into meta grid and render editable feature media` passes.

## Open Questions From The Triage Doc

The analysis doc explicitly listed five open questions before implementation. Here is how each landed:

1. **Where is the prepared speakers/events HTML?** — Not located. New content-managed pages were built instead. *Decision unmade*; customer should confirm this is acceptable or supply the prepared HTML so it can replace the new pages.
2. **Should `/challenges/` be a full listing route, a detail-route alias, or both?** — Implemented as **detail-only** under `/challenges/[slug]`. The listing for both startup and corporate stays at `/competitions/?tab=corporate`. This is consistent with the "shared listing, separate detail URL" reading of the deck, but the customer may have expected a discrete `/challenges/` index.
3. **Per-competition vs. global registration mode?** — Implemented as **per-competition with a sensible fallback**. Schema field is editable, but no content uses it yet (see Batch E caveat).
4. **For FB-024, is `Supported by LATAM CHINA TECH` the area to remove?** — Treated as yes, removed from the hero. If the customer meant a different card, this needs re-confirmation.
5. **For FB-049 / FB-043, exact element under the slide callout?** — Treated as the homepage mobile CTA text (FB-049) and the upload/textarea cluster (FB-043). Both are testable assertions but rely on judgment that should be re-confirmed against the slide.

## Risks & Follow-ups

| # | Item | Severity | Notes |
|---|---|---|---|
| R1 | `applicationMode` schema field added but never used in the 19 competition JSON files | Medium | Reader fallback derives the mode from `statusTone`. Customer-visible behavior is correct *today*, but the editorial capability the customer requested is dormant. Recommend: pick one or two competitions and set `applicationMode` explicitly so Keystatic users have a working example. |
| R2 | Speakers/Events "prepared HTML" not located | Medium | Net-new pages were built instead. Confirm with customer whether the prepared HTML still needs to land. |
| R3 | `/challenges/` is detail-only; no listing | Low–Medium | Verify customer intent. If they expect `/challenges/` to be a public index, an alias listing or redirect is needed. |
| R4 | FB-024 / FB-049 / FB-043 are judgment calls on slide callouts | Low | Implementations match a defensible reading of the deck and are covered by tests, but slide screenshots should be re-confirmed once the customer reviews. |
| R5 | Keystatic UI not exercised | Low | Schema additions (`applicationMode`, `detailImage`, `featureImageAlt`) build clean, but no manual pass through the Keystatic editor was recorded. Worth a 5-minute smoke test before showing the customer. |
| R6 | Browser-only checks rely on the implementer's verification log | Low | FB-058 (footer language click on white pages) and FB-050 (mobile scroll transparency) were validated by the implementer in a real browser; the test suite covers most of it, but the screenshots/log are the primary evidence. Worth one independent browser pass. |

## Test Coverage Map

The test additions are substantial (`tests/interior-pages.test.mjs` grew by ~491 lines, `tests/homepage-design.test.mjs` by ~226). Batch coverage in tests:

- Batch A → `homepage desktop header language controls match Batch A feedback`
- Batch B → `homepage desktop footer matches Batch B feedback`
- Batch C → `Batch C static page anchors, contact CTAs, and prepared page links are wired`
- Batch D → `Batch D mobile shell and controls expose usable navigation affordances`, `competition filters work…`
- Batch E/F → assertions inline in `competitions and pre-registration pages build…` and `Batch C/F` named tests
- Batch G → `Batch G homepage mobile competition cards and scroll header match feedback`
- Batch H → `Batch H competition detail pages move registration into meta grid and render editable feature media`

Each batch verification report in `analysis-2026-04-28.md` notes that the test was **written failing first**, then driven green — the standard red/green discipline.

## Files Touched

| Area | Files |
|---|---|
| Components | `home/DesktopFooter.astro`, `i18n/LocalizationClient.astro`, `pre-registration/PreRegistrationPage.astro`, `competitions/CompetitionsPage.astro`, `competitions/CompetitionDetailPage.astro`, `site/InteriorFooter.astro`, `site/InteriorHeader.astro` |
| Pages | new `src/pages/challenges/[slug].astro` |
| Lib | `competitions/reader.ts`, `competitions/schema.ts`, `competitions/types.ts`, `homepage/links.ts`, `homepage/reader.ts`, `interior-pages/types.ts` |
| Content (locale) | `homepage/locales/{en,br,cn}.json`, `interior-pages/locales/{en,br,cn}.json` |
| Content (static) | `static-pages/{advisory,events,network,programs,speakers}.json` (speakers is new) |
| Content (competitions) | all 19 competition JSON files (focus taxonomy + sample `detailImage`/`featureImageAlt` on `greater-tech-challenge-2025`) |
| Styles | `homepage.css` (+449 lines), `interior-pages.css` (+274 lines) |
| Tests | `homepage-architecture.test.mjs`, `homepage-design.test.mjs`, `interior-pages.test.mjs` |
| Docs | `CHECKLIST.md` |

## Recommendation

**Approve and proceed to customer review.** All 61 feedback items have a code, content, or style change with test or visual evidence behind them, and the suite is fully green. Before the customer sees the build, address the medium-severity items:

1. Set `applicationMode` explicitly on at least one competition that should render in pre-registration mode, so the new editorial control is demonstrably wired (R1).
2. Ask the customer whether the prepared speakers/events HTML still needs to land (R2) and whether `/challenges/` should also be a listing route (R3).
3. Do one independent browser pass on the homepage, `/competitions`, `/challenges/[slug]`, `/pre-registration`, and `/speakers` to validate the language switcher, scroll transparency, and pulsing dots in real DOM.

After that, this branch is in good shape to merge into `main`.

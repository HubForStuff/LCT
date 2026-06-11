# Advisory: Data-Driven Services with Dedicated Pages

**Date:** 2026-06-11

## Goal

Restructure the Advisory area so each advisory service is a Keystatic-managed
entry rendered as a card on the `/advisory/` hub and linking to its own dedicated
detail page. "Book a strategy call" stays a call-to-action (its button will open a
contact form built later; for now it targets `#contact`) and does **not** get a
detail page.

## Decisions (from brainstorming)

- **/advisory/ stays a hub** (Keystatic-managed title + description), showing the
  service cards plus the strategy-call CTA.
- **Cards** use the news "All insights" style (updated), each linking to a detail
  page. **Thumbnail is optional** (text-only cards reuse the `--no-media` layout).
- **Detail page main content** is localized rich `bodyHtml` (same convention as
  news), fully customizable.
- **Detail page header** reuses the existing interior page-header split (eyebrow +
  title on the left, summary / "side text" on the right) — no new sidebar.
- **Detail page hero image is optional.**
- **Book a strategy call** is a card/CTA → `#contact` (contact form is future work).

## Architecture

Mirror the existing **`programs`** pattern (static-page hub + collection + detail
route), which is the closest precedent in the codebase.

### Routing

| Route | Source | Notes |
|-------|--------|-------|
| `/advisory/` | static-pages `advisory.json` (hub) + `advisory` collection (cards) | Hub: header + service cards + strategy-call CTA |
| `/advisory/<slug>/` | `advisory` collection | New detail route `src/pages/advisory/[slug].astro` |

### Content model

**Keystatic collection `advisory`** (`src/content/advisory/*`, format json), one
entry per service. Schema (mirrors `programs`/`news` conventions):

```
slug: fields.slug({ name, slug })            // routable: /advisory/<slug>/
order: integer (required, min 1)
thumbnail: url (optional)                      // card image; blank => text-only card
thumbnailAlt: text (optional, required when thumbnail set)
heroImage: url (optional)                      // detail-page hero; blank => no hero
heroImageAlt: text (optional, required when heroImage set)
en / br / cn: {
  eyebrow: text (required)
  title: text (required)
  summary: text (required, multiline)          // card summary + detail side text
  metaTitle: text (required)
  metaDescription: text (required, multiline)
  bodyHtml: text (required, multiline)         // detail main content, semantic HTML
}
```

Seed with the three existing services, reusing the localized copy currently in
`advisory.json`'s sections as starter `summary`/`bodyHtml`:
`consulting`, `investment-matchmaking`, `tech-transfer` (orders 1–3).

**Static-pages `advisory.json` (hub) changes:** keep `eyebrow`/`title`/`summary`/
`bodyHtml`; **remove** the `consulting`, `investment-matchmaking`, and
`tech-transfer` sections (they move to the collection); **keep** the
`strategy-call` section (its `ctaHref` stays `#contact`) — it renders as the CTA.

### Library: `src/lib/advisory/`

Mirror `src/lib/programs/`:
- `types.ts` — `AdvisoryServiceCard`, `AdvisoryListingContent` (the per-locale card
  list merged into the hub), `AdvisoryDetail`, `AdvisoryDetailRouteLocale`,
  `AdvisoryDetailData`, plus raw Keystatic shapes.
- `schema.ts` — the `advisoryCollectionSchema` above.
- `reader.ts` —
  - `getAdvisoryServicesByLocale(): Record<HomepageLocaleCode, AdvisoryListingContent>`
    — used by the static-pages reader to populate the hub cards (analogous to
    `getProgramListingContentByLocale`). Each card: `{ eyebrow, title, summary,
    href: "/advisory/<slug>/", thumbnail?, thumbnailAlt? }`, sorted by `order`.
  - `getAllAdvisorySlugs(): string[]` and
    `getAdvisoryDetailData(slug): AdvisoryDetailData` — for the detail route
    (analogous to the program detail reader), composing nav/footer/ui from
    `INTERIOR_LOCALES` + homepage `desktopMenuSections` exactly like the existing
    detail/listing readers.

Register the `advisory` collection in `keystatic.config.ts` and add `advisory` to
`src/content/config.ts`.

### Static-pages reader + StaticPage component

- `src/lib/static-pages/reader.ts`: when `slug === "advisory"`, load
  `getAdvisoryServicesByLocale()` and attach `advisoryServices` to each route
  locale — exactly how it already attaches `programs` via
  `getProgramListingContentByLocale()` for slug `programs`. Extend the
  `StaticPageRouteLocale` type with an optional `advisoryServices`.
- `src/components/static-pages/StaticPage.astro`: when `locale.advisoryServices`
  is present, render an **advisory card grid** (new `AdvisoryCards.astro`) before
  the existing `sections` grid. The lone remaining `strategy-call` section then
  renders through the normal sections grid as the CTA. (The `programs` branch is
  unchanged; advisory is an additive, parallel branch.)

### Components

- `src/components/advisory/AdvisoryCards.astro` — the hub card grid. Reuses the
  `news-list-card` "All insights" style as **links** (`<a href>` to the detail
  page), with optional thumbnail (`news-list-card--no-media` when absent) and
  **no** meta footer and **no** tag pill. Localized via
  `advisoryServices.${index}.{title,summary,thumbnailAlt}` data-i18n hooks.
- `src/components/advisory/AdvisoryDetailPage.astro` — interior header
  (`activeHref="/advisory/"`) → page-header split (eyebrow + title + summary) →
  optional hero image → `bodyHtml` article → back link to `/advisory/` → interior
  footer. Mirror `ProgramDetailPage.astro` / `NewsArticlePage.astro` structure and
  the localized back-link pattern used there.
- `src/pages/advisory/[slug].astro` — `getStaticPaths` from
  `getAllAdvisorySlugs()`; renders `AdvisoryDetailPage` + `LocalizationClient`
  (mirror `src/pages/programs/[slug].astro`).

### Navigation (`src/lib/homepage/links.ts`)

- `desktopMenuLinkTargets[0]` (Advisory submenu): re-point the three links from
  `/advisory/#consulting` / `#investment-matchmaking` / `#tech-transfer` to
  `/advisory/consulting/`, `/advisory/investment-matchmaking/`,
  `/advisory/tech-transfer/`.
- `desktopMenuCardTargets[0]` ("Book a Strategy Call" mega-card): **unchanged** —
  stays `/advisory/#strategy-call` (lands on the hub's strategy-call CTA, whose
  button targets `#contact`).
- `footerLinkTargets[0]`: re-point `/advisory/#investment-matchmaking` and
  `/advisory/#tech-transfer` to the corresponding detail routes.
- Grep for any other `#consulting` / `#investment-matchmaking` / `#tech-transfer`
  references and re-point them to the detail routes.

## Card / detail markup details

- Cards: `news-list-grid` containing `<a class="news-list-card …">`; copy block
  (title `news-card-title`, summary `news-card-summary`); optional
  `news-card-media` + single `news-card-media-layer`. No `news-card-meta`, no
  `news-card-tag`. Reuse existing `--no-media` modifier (already in
  `interior-pages.css`).
- Detail hero: optional, reuse `news-article-hero-image` style when `heroImage`
  is set.
- Detail body: `data-i18n-html="page.bodyHtml"` rendered with `set:html`, using the
  shared `news-article-body` styling.

## Testing (build-and-assert, node --test)

Add a test asserting:
1. `/advisory/index.html` renders the **three service cards** as links to
   `/advisory/consulting/`, `/advisory/investment-matchmaking/`,
   `/advisory/tech-transfer/`, in the All-insights style, with localized
   `advisoryServices.0.title` hooks and **no** `news-card-meta` / `news-card-tag`.
2. The hub still renders the **strategy-call CTA** (`id="strategy-call"`, CTA →
   `#contact`) and no longer renders `id="consulting"` section card.
3. Each `/advisory/<slug>/index.html` renders its localized title + summary
   (split header) and `data-i18n-html="page.bodyHtml"`, includes the shared
   `id="localized-content"` payload, and a back link to `/advisory/`.
4. A service with no thumbnail uses `news-list-card--no-media`; one with a
   thumbnail renders a `news-card-media-layer`.
5. Nav: Advisory submenu links point to the detail routes (not `#consulting`
   anchors); homepage no longer links `/advisory/#consulting`.
6. Existing suite stays green — in particular the "static pages build" test
   (advisory hub still matches `/Advisory Services/i` + `/Investment matchmaking/i`
   from its retained `bodyHtml`) and Batch C. Update any existing assertion that
   referenced the removed advisory section anchors.

## Out of scope

- The contact form itself (future work); the strategy-call CTA targets `#contact`.
- Final marketing copy beyond migrating the existing localized service text.
- Visual redesign of the card beyond reusing the All-insights style with optional
  thumbnail.

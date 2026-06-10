# Network: Data-Driven City Partnerships & Featured Speakers

**Date:** 2026-06-10
**Branch:** `feat/network-data-driven`

## Goal

Turn the Network area into a hub with two data-driven sub-pages, each fully
managed in Keystatic:

1. **City Partnerships** — `/network/city-partnerships/`
2. **Featured Speakers** — `/network/featured-speakers/`

Each sub-page has a Keystatic-managed title + description, followed by a list of
display-only cards in the news "All insights" visual style (optional thumbnail,
no meta footer, no tag pill).

## Routing

| Route | Change |
|-------|--------|
| `/network/` | Stays a hub. Keep **only two** section cards: **City Partnerships** → `/network/city-partnerships/` and **Featured Speakers** → `/network/featured-speakers/`. Remove the third "active partners" card. |
| `/network/city-partnerships/` | New route — `src/pages/network/city-partnerships.astro`. |
| `/network/featured-speakers/` | New route — `src/pages/network/featured-speakers.astro`. |
| `/speakers/` | **Removed.** The existing top-level speakers static page is redundant. Delete `src/content/static-pages/speakers.json`. |

Nav mega-menu updates (homepage `desktopMenuSections`):
- "City Partnerships" link: `/network/#city-partnerships` → `/network/city-partnerships/`.
- "Featured Speakers" link: `/speakers/` → `/network/featured-speakers/`.

The network hub's own two section cards (in `network.json`) get their `ctaHref`
re-pointed to the two sub-pages.

## Data Model (Keystatic)

### Page meta — two singletons

`cityPartnershipsPage` and `featuredSpeakersPage`, each with localized objects
for `en` / `br` / `cn`:

```
{
  eyebrow: string,
  title: string,         // seeded default e.g. "City Partnerships"
  description: string,   // multiline, shown under the title
  metaTitle: string,
  metaDescription: string,
}
```

Seeded title defaults:
- City Partnerships: EN "City Partnerships", BR "Parcerias entre Cidades", CN "城市合作".
- Featured Speakers: EN "Featured Speakers", BR "Palestrantes em Destaque", CN "特邀讲者".

### List items — two collections

`cityPartnerships` (`src/content/city-partnerships/*`) and `speakers`
(`src/content/speakers/*`). Each entry:

```
{
  order: integer (required, min 1),
  thumbnail: url (optional),
  imageAlt: text (optional),     // required when thumbnail set; enforced in reader/UI guidance
  en: { name: string, intro: string (multiline) },
  br: { name: string, intro: string (multiline) },
  cn: { name: string, intro: string (multiline) },
}
```

`name` maps to the card title; `intro` maps to the card summary. Entries sort by
`order` ascending.

## Components

### `NetworkListingPage.astro` (shared)

One reusable component used by both sub-pages. Props: the resolved route locale
(meta, nav, footer, ui, desktopMenuSections, page `{ eyebrow, title, description }`,
and `items[]`), plus `siteSettings` and `currentLanguage`.

Structure:
- `InteriorHeader` (with `activeHref="/network/"` so Network stays highlighted)
- `page-header` section: eyebrow + title + description (with `data-i18n` hooks)
- card grid: reuse `news-list-grid` styling
- `InteriorFooter`

### Card rendering

Reuse the **`news-list-card`** visual style, with these differences:
- **Display-only**: render as a `<div>`/`<article>`, not an `<a>`. No `href`.
- **No meta footer**: omit the published-date / reading-time row.
- **No tag pill**: omit `news-card-tag`.
- **Optional thumbnail**: when `thumbnail` is set, render the `news-card-media`
  block (single layer — no hover image). When absent, add a `--no-media`
  modifier so the copy spans the full card width.

New CSS in `src/styles/interior-pages.css`: cards use the base `news-list-card`
class (to inherit the "All insights" look) plus a `news-list-card--static`
modifier that removes the link/hover affordances, and a
`news-list-card--no-media` modifier that makes the copy span the full card width
when there is no thumbnail.

Card content order: name (title) → intro (summary) → thumbnail (if present),
mirroring the news card's copy/media split.

## Library structure (`src/lib/network/`)

Mirror the existing `programs` / `static-pages` lib layout:
- `types.ts` — `NetworkListingItem`, `NetworkListingPageMeta`,
  `NetworkListingRouteLocale`, `NetworkListingData`.
- `schema.ts` — Keystatic schemas for the two singletons and two collections.
- `reader.ts` — `getCityPartnershipsData()` and `getFeaturedSpeakersData()`,
  each returning `{ siteSettings, defaultLanguage, defaultLocale, localizedContent }`,
  composing nav/footer/ui from `INTERIOR_LOCALES` + homepage `desktopMenuSections`
  (same composition the static-pages reader uses).

Register the two singletons and two collections in `keystatic.config.ts`.

## Localization

Same runtime i18n as other interior pages:
- `data-i18n` on eyebrow/title, `data-i18n-html` / `data-i18n` on description and
  each card's name/intro (indexed: `items.${index}.name`, `items.${index}.intro`).
- `LocalizationClient` wired with `defaultLanguage` + `localizedContent` so the
  page switches language in-browser.

## Seed Content

- `cityPartnershipsPage` + `featuredSpeakersPage` singletons with the default
  titles/descriptions above (EN/BR/CN).
- 3 seed `cityPartnerships` entries and 3 seed `speakers` entries (mix of with /
  without thumbnail to exercise both layouts), localized for EN/BR/CN.

## Testing

Add a test (in the existing `tests/interior-pages.test.mjs` Batch style) that
builds the site once and asserts:

1. `/network/city-partnerships/index.html` and
   `/network/featured-speakers/index.html` exist.
2. Each renders its localized title + description with `data-i18n` hooks.
3. Each renders the seeded list items (by name) using the news card style.
4. Cards have **no** meta footer (no published/reading-time row) and **no** tag pill.
5. A card with no thumbnail carries the `--no-media` modifier; a card with a
   thumbnail renders a media block.
6. The `/network/` hub has exactly two section cards linking to the two sub-pages,
   and no "active partners" card.
7. The nav "Featured Speakers" link points to `/network/featured-speakers/` (and no
   longer to `/speakers/`); "City Partnerships" points to `/network/city-partnerships/`.
8. `/speakers/index.html` is no longer built.

All existing tests continue to pass.

## Out of Scope

- Detail pages for partnerships or speakers (cards are display-only).
- Changes to the `/network/` hub beyond trimming to two cards + re-pointing links.
- Search / filtering / pagination on the lists.

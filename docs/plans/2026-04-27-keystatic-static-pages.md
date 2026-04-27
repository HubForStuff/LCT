# Keystatic Static Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create the missing static/detail pages linked from the homepage, submenus, and interior shell, with page content editable in Keystatic.

**Architecture:** Add a `staticPages` Keystatic collection for the four currently missing top-level pages: `/advisory/`, `/events/`, `/programs/`, and `/network/`. Keep routes thin with a root `[slug].astro` route, a `static-pages` reader, and a reusable page component that reuses the existing interior header/footer, localization client, and news-style article body treatment.

**Tech Stack:** Astro 5, Keystatic local storage, shared localization client, Node test runner

---

### Task 1: Lock Expected Coverage With Tests

**Files:**
- Modify: `tests/homepage-architecture.test.mjs`
- Modify: `tests/homepage-design.test.mjs`
- Modify: `tests/interior-pages.test.mjs`

**Steps:**
1. Add architecture assertions for a Keystatic `staticPages` collection, `src/lib/static-pages/reader.ts`, `src/lib/static-pages/schema.ts`, `src/components/static-pages/StaticPage.astro`, `src/pages/[slug].astro`, and seeded JSON entries.
2. Add homepage build assertions that the generated home page links to `/advisory/`, `/events/`, `/programs/`, and `/network/` instead of placeholders.
3. Add interior build assertions that the four static pages are generated, render seeded content, include shared localization hooks, and keep route logic thin.
4. Run the targeted tests and verify they fail for missing implementation.

### Task 2: Add Keystatic Content Model And Seed Entries

**Files:**
- Create: `src/lib/static-pages/schema.ts`
- Create: `src/lib/static-pages/types.ts`
- Create: `src/content/static-pages/advisory.json`
- Create: `src/content/static-pages/events.json`
- Create: `src/content/static-pages/programs.json`
- Create: `src/content/static-pages/network.json`
- Modify: `keystatic.config.ts`
- Modify: `src/content/config.ts`

**Steps:**
1. Define shared page fields and localized EN/BR/CN content fields similar to `newsCollectionSchema`.
2. Include editable meta title/description, eyebrow, title, summary, image URL/alt, body HTML, and repeatable sections with anchors and CTA links.
3. Register the `staticPages` collection in Keystatic and Astro content config.
4. Seed first-version content for the four missing pages.

### Task 3: Implement Reader, Route, Component, And Link Wiring

**Files:**
- Create: `src/lib/static-pages/reader.ts`
- Create: `src/components/static-pages/StaticPage.astro`
- Create: `src/pages/[slug].astro`
- Modify: `src/lib/homepage/links.ts`
- Modify: `src/lib/interior-pages/types.ts`
- Modify: `src/styles/interior-pages.css`

**Steps:**
1. Build localized route bundles from the collection, homepage chrome, and interior locales.
2. Render a news-style detail page using shared shell components and localization data attributes.
3. Wire homepage desktop/mobile/category/footer and interior nav/footer links to the new routes and anchor sections.
4. Add only scoped CSS needed for the static page layout.

### Task 4: Verify And Update Project Tracking

**Files:**
- Modify: `CHECKLIST.md`
- Modify: `README.md`

**Steps:**
1. Run `npm test`.
2. Run `npm run build`.
3. Start a local static server, open the homepage and at least one static page, switch language, and capture screenshots.
4. Update `CHECKLIST.md` and README CMS/project-structure notes to reflect the new static pages.

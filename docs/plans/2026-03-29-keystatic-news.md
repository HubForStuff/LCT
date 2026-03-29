# Keystatic News Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the homepage’s static News & Insights cards with a Keystatic-managed news system that powers the homepage section, a full news listing page, and individual localized article detail pages.

**Architecture:** Add a dedicated `news` Keystatic collection where each entry stores shared publishing metadata plus EN/BR/CN localized content in one source of truth. Keep route files thin by introducing a focused news reader module and reusable Astro page components, while reusing the shared localization client and interior header/footer shell.

**Tech Stack:** Astro 5, Keystatic local storage, shared localization client, Node test runner

---

### Task 1: Guard the new news flow with failing tests

**Files:**
- Modify: `tests/homepage-architecture.test.mjs`
- Modify: `tests/homepage-design.test.mjs`
- Modify: `tests/interior-pages.test.mjs`

**Step 1: Write the failing test**

Add assertions that require:
- a Keystatic `news` collection to exist
- homepage output to link News & Insights cards to `/news/` and `/news/<slug>/`
- `/news/` and `/news/<slug>/` pages to build
- localized payloads and language switchers to work on a news route

**Step 2: Run test to verify it fails**

Run: `node --test tests/homepage-architecture.test.mjs tests/homepage-design.test.mjs tests/interior-pages.test.mjs`
Expected: FAIL because the collection, routes, and links do not exist yet.

### Task 2: Create the Keystatic news model and reader

**Files:**
- Modify: `keystatic.config.ts`
- Create: `src/lib/news/schema.ts`
- Create: `src/lib/news/types.ts`
- Create: `src/lib/news/reader.ts`
- Create: `src/content/news/` seeded entries and assets

**Step 1: Define the content model**

Add a news collection with:
- slug field
- publish date
- author
- reading time
- featured/homepage visibility flag
- normal and hover thumbnail images
- per-locale category/tag, title, summary, image alt text, SEO metadata, and rich article body

**Step 2: Add typed reader helpers**

Create helpers that:
- list all articles in publish-date order
- return homepage cards from the latest items
- build localized list/detail payloads for EN/BR/CN
- expose article slugs for static route generation

### Task 3: Wire routes and reusable news components

**Files:**
- Create: `src/components/news/NewsIndexPage.astro`
- Create: `src/components/news/NewsArticlePage.astro`
- Create: `src/pages/news/index.astro`
- Create: `src/pages/news/[slug].astro`
- Modify: `src/components/home/DesktopHome.astro`
- Modify: `src/components/home/MobileHome.astro`
- Modify: `src/lib/homepage/types.ts`
- Modify: `src/lib/homepage/reader.ts`
- Modify: `src/lib/homepage/links.ts`
- Modify: `src/lib/interior-pages/types.ts`
- Modify: `src/lib/interior-pages/reader.ts`
- Modify: `src/content/interior-pages/locales/en.json`
- Modify: `src/content/interior-pages/locales/br.json`
- Modify: `src/content/interior-pages/locales/cn.json`
- Modify: `src/styles/interior-pages.css`

**Step 1: Add localized page-shell copy**

Extend the interior locale bundles with the shared News listing/detail UI strings such as breadcrumb/back labels, list hero copy, and empty-state copy.

**Step 2: Build the list page**

Render:
- shared interior header/footer
- list hero and intro
- responsive article grid
- localized card metadata and summaries

**Step 3: Build the detail page**

Render:
- shared interior header/footer
- article hero metadata
- main article body from Keystatic rich content
- related/back navigation to `/news/`

**Step 4: Rewire homepage cards**

Replace `href="#"` placeholders with real routes and source the card content from the Keystatic news entries while preserving the existing homepage architecture.

### Task 4: Verify end to end

**Files:**
- Modify as needed: `tests/homepage-design.test.mjs`
- Modify as needed: `tests/interior-pages.test.mjs`

**Step 1: Run targeted tests**

Run: `node --test tests/homepage-architecture.test.mjs tests/homepage-design.test.mjs tests/interior-pages.test.mjs`
Expected: PASS

**Step 2: Run full verification**

Run:
- `npm test`
- `npm run build`

Expected: PASS

**Step 3: Verify language switching in the browser**

Run local static preview checks for:
- homepage language switching after the news cards link to the collection-backed content
- `/news/` or `/news/<slug>/` language switching using the shared localization hooks

Expected: PASS with EN, BR, and CN content switching correctly.

# Interior Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the competitions and pre-registration interior mockups as real Astro pages while preserving the current thin-route, reusable-component, dedicated-stylesheet architecture.

**Architecture:** Keep page entrypoints in `src/pages` as composition-only route files. Add a dedicated content module plus a small shared interior-page component set for the recurring header/footer/logo patterns, and render page-specific sections through focused Astro components with a new interior stylesheet.

**Tech Stack:** Astro 5, Tailwind integration baseline, Keystatic-oriented content structure, Node test runner

---

### Task 1: Guard the new routes with tests

**Files:**
- Create: `tests/interior-pages.test.mjs`

**Step 1: Write the failing test**

Add assertions that require:
- `src/pages/competitions.astro` and `src/pages/pre-registration.astro` to exist and stay thin.
- the built output to include the core competitions page sections from the mockup.
- the built output to include the core pre-registration form sections from the mockup.

**Step 2: Run test to verify it fails**

Run: `node --test tests/interior-pages.test.mjs`
Expected: FAIL because the routes and built pages do not exist yet.

### Task 2: Create content and shared interior-page building blocks

**Files:**
- Create: `src/content/interior-pages.ts`
- Create: `src/components/site/BrandLogo.astro`
- Create: `src/components/site/InteriorHeader.astro`
- Create: `src/components/site/InteriorFooter.astro`

**Step 1: Define static content objects**

Add typed data for:
- competitions page hero, filters, tabs, featured cards, listing cards, and footer CTA
- pre-registration page hero, guide resources, form section definitions, benefits, and footer CTA

**Step 2: Add reusable shell components**

Create shared components that capture the recurring light navigation, logo, language button, and footer CTA/footer columns visible across the interior mockups.

### Task 3: Implement page-specific sections and routes

**Files:**
- Create: `src/components/competitions/CompetitionsPage.astro`
- Create: `src/components/pre-registration/PreRegistrationPage.astro`
- Create: `src/pages/competitions.astro`
- Create: `src/pages/pre-registration.astro`
- Create: `src/styles/interior-pages.css`
- Modify: `src/components/home/BrandLogo.astro`

**Step 1: Build the competitions page**

Render:
- page header
- filter pills
- tab strip
- featured startup and corporate cards
- card grids
- academic placeholder

**Step 2: Build the pre-registration page**

Render:
- page header
- pre-registration support banner
- guide/tutorial callouts
- progress indicator
- multi-section form with fields, uploads, benefits, and submit area

**Step 3: Keep route files thin**

Restrict each route file to imports, content loading, stylesheet import, and page composition through `Layout`.

### Task 4: Verify end to end

**Files:**
- Modify as needed: `tests/interior-pages.test.mjs`

**Step 1: Run targeted test**

Run: `node --test tests/interior-pages.test.mjs`
Expected: PASS

**Step 2: Run full verification**

Run:
- `npm test`
- `npm run build`

Expected: PASS with homepage still building and both new interior routes emitted.

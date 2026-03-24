# Homepage Modularity and Keystatic Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the homepage so `src/pages/index.astro` becomes a thin composition layer, while homepage content is editable through Keystatic local mode.

**Architecture:** Move homepage copy and locale data into Keystatic-managed content files, load that data through a dedicated server-side reader utility, and render it with section-focused Astro components. Extract inline client behavior and global styles into dedicated modules so presentation, content, and behavior are maintained independently.

**Tech Stack:** Astro 5, Tailwind CSS, Keystatic local mode, Node test runner

---

### Task 1: Guard the architecture with tests

**Files:**
- Create: `tests/homepage-architecture.test.mjs`

**Step 1: Write the failing test**

Add assertions that require:
- `src/pages/index.astro` to stay small and import modular helpers/components.
- `src/pages/index.astro` to stop declaring large inline localization payloads.
- `astro.config.mjs` to register the Keystatic Astro integration.
- `src/content/homepage/` to contain seeded locale content files.

**Step 2: Run test to verify it fails**

Run: `node --test tests/homepage-architecture.test.mjs`
Expected: FAIL because the homepage is still monolithic and Keystatic is not integrated into Astro.

### Task 2: Define the editable content model

**Files:**
- Modify: `keystatic.config.ts`
- Create: `src/content/homepage/site-settings.json`
- Create: `src/content/homepage/locales/en.json`
- Create: `src/content/homepage/locales/br.json`
- Create: `src/content/homepage/locales/cn.json`
- Create: `src/lib/homepage/types.ts`
- Create: `src/lib/homepage/reader.ts`

**Step 1: Implement the schema**

Define Keystatic singletons/collections for:
- global site settings and links
- homepage locale entries with hero, navigation, cards, footer, and mobile content

**Step 2: Implement the data reader**

Create a typed utility that reads the homepage settings plus all locale entries and normalizes them into the shape required by the UI.

### Task 3: Split the homepage into modules

**Files:**
- Modify: `src/pages/index.astro`
- Create: `src/components/home/DesktopHome.astro`
- Create: `src/components/home/DesktopNavigation.astro`
- Create: `src/components/home/DesktopFooter.astro`
- Create: `src/components/home/MobileHome.astro`
- Create: `src/components/home/HomeClient.astro`
- Create: `src/styles/homepage.css`

**Step 1: Move rendering into components**

Create focused Astro components for the desktop shell, footer/navigation, mobile shell, and shared client bootstrap.

**Step 2: Keep `index.astro` thin**

Limit `src/pages/index.astro` to loading content, importing styles, and composing the page.

### Task 4: Wire Keystatic into Astro

**Files:**
- Modify: `astro.config.mjs`

**Step 1: Add the Astro integration**

Register `@keystatic/astro` alongside existing integrations so the local editor UI and API routes are available.

### Task 5: Verify end to end

**Files:**
- Modify as needed: `tests/homepage-design.test.mjs`

**Step 1: Run targeted tests**

Run:
- `node --test tests/homepage-architecture.test.mjs`
- `node --test tests/homepage-design.test.mjs`

Expected: PASS

**Step 2: Run full build**

Run: `npm run build`
Expected: PASS with generated homepage output and Keystatic routes configured for local editing.

# LATAMChina Tech Homepage Rebuild Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Astro homepage so it matches the supplied desktop and mobile HTML mockups as closely as possible.

**Architecture:** Replace the current component-led marketing page with a single responsive Astro implementation driven by structured content arrays and custom CSS tuned to the provided mockups. Keep the document shell in `Layout.astro`, render both desktop and mobile navigation variants from the page, and use a small inline script for menu/language/footer interactions.

**Tech Stack:** Astro 5, Tailwind integration already present, plain CSS, Node test runner, agent-browser for visual verification

---

### Task 1: Lock the expected homepage structure

**Files:**
- Create: `tests/homepage-design.test.mjs`
- Test: `dist/index.html`

**Step 1: Write the failing test**

Write a build-based test that asserts the generated homepage includes:
- the `Accelerating Innovation` hero copy
- desktop and mobile navigation/menu markup
- the three category cards
- the competitions section
- the news section
- the footer CTA

**Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because the current homepage does not match the supplied mockup structure.

**Step 3: Write minimal implementation**

Add the responsive homepage markup and styles needed to satisfy the new structural assertions.

**Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS

### Task 2: Rebuild the layout and homepage

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/layouts/Layout.astro`

**Step 1: Replace the existing landing page composition**

Build one responsive page that mirrors the mockups:
- desktop sticky nav with mega panels
- mobile sticky nav with menu sheet
- shared hero copy with desktop/mobile typography changes
- category cards
- competitions section
- news/insights cards
- CTA/footer blocks

**Step 2: Preserve the mockup look**

Implement custom CSS variables, font imports, spacing, radii, gradients, borders, and hover/focus states that track the reference HTML closely on both desktop and mobile breakpoints.

**Step 3: Add small interaction scripts**

Support:
- mobile menu open/close
- expandable mobile menu groups
- language picker active state
- WeChat modal and footer newsletter button placeholders

**Step 4: Run build to verify output**

Run: `npm run build`
Expected: Astro static build succeeds and generates `dist/index.html`.

### Task 3: Verify visual fidelity

**Files:**
- No source file required

**Step 1: Launch the site locally**

Run: `npm run dev -- --host 0.0.0.0 --port 4321`

**Step 2: Capture baseline mockup screenshots**

Use browser automation to open:
- `file:///.../ideas/LATAMCHINATECH_desktop%20v%201million.htm`
- `file:///.../ideas/LATAMCHINATECH_mobille.htm`

Capture desktop and mobile screenshots for comparison.

**Step 3: Capture rebuilt site screenshots**

Use browser automation to open the local Astro page at desktop and mobile widths and capture full-page screenshots.

**Step 4: Compare and refine**

Adjust typography, spacing, colors, and section proportions until the rebuilt page visually tracks the mockups closely and obvious regressions are removed.

**Step 5: Re-run verification**

Run:
- `npm test`
- `npm run build`

Expected: all verification commands pass after the final visual adjustments.

# July 16 2026 Feedback — Refinements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the July 16 2026 customer feedback for the landing page, language selector, Network, Advisory, Competition/Challenge detail, form, and Programs — everything except the Events feature.

**Architecture:** Restyles and content changes against the existing Astro static site. Two structural pieces: the homepage language control converges onto the shared `site/LanguageSwitcher.astro`, and a new lightweight eligibility form gets its own route plus an Apps Script `formType` router.

**Tech Stack:** Astro 5 (static), Tailwind 3, Keystatic, plain CSS in `src/styles/`, Node's built-in test runner (`node --test`).

**Spec:** `docs/superpowers/specs/2026-07-17-july-16-feedback-design.md`
**Companion plan:** Events is planned separately (`2026-07-17-july-16-feedback-events.md`), same branch.
**Branch:** `feedback/2026-07-16-updates` (already exists, already has the spec commit).

## Global Constraints

- **Read `AGENTS.md` before touching anything.** Its Architecture, I18n Contract, and Shared Shell rules are binding for every task here.
- **All three locales, always.** Any copy change ships in `en`, `br`, and `cn`. Never hardcode a single-language string in a component. Wire with `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria-label`.
- **Route files in `src/pages` stay thin** — load data, compose a component. UI goes in `src/components/`, styling in `src/styles/`.
- **Icons are Lucide (ISC), inlined as SVG paths.** No new package dependency, no CDN. Existing icons are stroke SVGs with `fill="none"` and `stroke-width` 1.2–1.5; match that.
- **Verify per `AGENTS.md`:** `npm test` and `npm run build` after every task, plus screenshots of affected pages. Code inspection alone is not sufficient evidence.
- **Commit format:** `fix(ui): [theme] — FB-NNN` or conventional commits. Author is Ash. **Do not add a Claude co-author trailer.**
- **"bottom" in the feedback means "button".** See the spec.

## Known Hazards

These are verified facts about the codebase. Ignoring them causes regressions:

1. **`.news-list-card` is shared** by the Advisory cards *and* the News listing (`interior-pages.css:3218`). Restyling the bare class regresses News. Scope Advisory changes to `.advisory-card-grid .news-list-card`.
2. **`src/lib/homepage/links.ts` uses index-based maps** (`getCategoryCardHref`, `4: network`, `3: [network]`). Removing entries shifts indices and silently mis-wires unrelated links. Tasks 3 and 4 both touch this; do them in order and test.
3. **`/challenges/[slug].astro` imports `CompetitionDetailPage`.** Competitions and challenges share one template — changes land for both automatically. This is why the feedback's "confirm this is seen in both" is a verification step, not implementation.
4. **There are two language-switcher implementations**: `.site-lang` (shared component) and `.desk-lang` (hand-rolled homepage). That duplication is the bug.

---

## Task 1: Advisory card restyle + header cleanup

Smallest, fully isolated, no shared-state risk. Good first task.

**Files:**
- Modify: `src/styles/interior-pages.css`
- Modify: `src/content/static-pages/advisory.json`
- Test: `tests/interior-pages.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: nothing later tasks depend on.

**Feedback items:** Remove gradient background from the cards making it white; use a light gray border matching the horizontal divider below; match the card corner radius to the Competition cards; remove the text below the title; remove the text on the right side.

- [ ] **Step 1: Confirm the shared-class hazard yourself**

Run: `grep -rn "news-list-card" src/components/ src/styles/interior-pages.css | head -20`

Expected: hits in **both** `advisory/AdvisoryCards.astro` and the news components. This is why the next step scopes to `.advisory-card-grid`. Do not skip this — it is the difference between a fix and a regression.

- [ ] **Step 2: Write the failing test**

Add to `tests/interior-pages.test.mjs` (follow the existing build-and-assert style in that file — read it first):

```js
test("advisory cards are white with a light gray border, scoped away from news", async () => {
  const css = await readFile("src/styles/interior-pages.css", "utf8");
  const scoped = css.match(/\.advisory-card-grid \.news-list-card \{[^}]*\}/);
  assert.ok(scoped, "expected a .advisory-card-grid .news-list-card rule");
  assert.match(scoped[0], /background:\s*#fff/, "advisory cards must be white");
  assert.match(scoped[0], /border-radius:\s*18px/, "must match .ccard radius");
  assert.doesNotMatch(scoped[0], /linear-gradient/, "gradient must be gone");
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npm test`
Expected: FAIL — "expected a .advisory-card-grid .news-list-card rule".

- [ ] **Step 4: Add the scoped CSS**

Append to `src/styles/interior-pages.css`. The radius `18px` is copied from `.ccard` at line 1252 — verify it still reads 18px before trusting this. The border color matches the horizontal divider below the cards; read that divider's actual color in the browser and use the same value rather than approximating (`rgba(0, 0, 0, 0.07)` is used by the dividers at lines 1199 and 1409 and is the expected answer).

```css
.advisory-card-grid .news-list-card {
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 18px;
  background: #fff;
  box-shadow: none;
}

.advisory-card-grid .news-list-card:hover {
  transform: none;
  border-color: rgba(0, 0, 0, 0.14);
  box-shadow: none;
}
```

- [ ] **Step 5: Run the test and watch it pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Remove the header text**

In `src/content/static-pages/advisory.json`, clear the `summary` field (the text below the title) for **all three locales** (`en`, `br`, `cn`). The right-side text is the `page-header-inner--split` right column, which renders `page.summary` — clearing the content removes both, since they are the same field. Confirm in the browser that the header renders title-only with no empty gap; if an empty element still reserves space, hide it in CSS scoped to the advisory page rather than deleting the shared markup in `StaticPage.astro`.

- [ ] **Step 7: Build and screenshot**

Run: `npm run build`
Then screenshot `/advisory/` and `/news/`. **Both.** News shares the card class, so it is the regression surface. Advisory cards must be white with a thin gray border; News cards must look exactly as before.

- [ ] **Step 8: Commit**

```bash
git add src/styles/interior-pages.css src/content/static-pages/advisory.json tests/interior-pages.test.mjs
git commit -m "fix(ui): advisory cards white with gray border, header text removed"
```

---

## Task 2: Competition + Challenge detail page

**Files:**
- Modify: `src/components/competitions/CompetitionDetailPage.astro:40-136`
- Modify: `src/content/interior-pages/locales/{en,br,cn}.json`
- Modify: `src/styles/interior-pages.css`
- Test: `tests/interior-pages.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: the detail-page layout that the Events detail page reuses in the companion Events plan — specifically the meta-grid card order and the centered bottom action row.

**Feedback items:** Remove the description below the title; first card Total Award + award value; keep Timeline; keep Focus; right card Status; remove orange button; registration button at the bottom of the page reading "Register Now"; confirm in both Competitions and Challenges; View All link centralized.

- [ ] **Step 1: Confirm both routes share the template**

Run: `grep -n "CompetitionDetailPage" src/pages/competitions/\[slug\].astro src/pages/challenges/\[slug\].astro`

Expected: both import `CompetitionDetailPage`. This means every change below lands for challenges too, satisfying "confirm this also is seen in both" structurally. You must still screenshot both.

- [ ] **Step 2: Add the Total Award label to all three locales**

In each of `src/content/interior-pages/locales/{en,br,cn}.json`, add `totalAwardLabel` next to the existing `detailPage.statusLabel` / `deadlineLabel` / `focusLabel` keys:

- `en`: `"totalAwardLabel": "Total Award"`
- `br`: `"totalAwardLabel": "Premiação Total"`
- `cn`: `"totalAwardLabel": "总奖金"`

Leave `registrationLabel` in place for now; it becomes unused but removing it is a separate cleanup and the i18n readers may assert on shape.

- [ ] **Step 3: Rewrite the meta grid**

In `src/components/competitions/CompetitionDetailPage.astro`, replace the four `competition-meta-card` articles (lines 57–99) with this order. The award value is the existing `locale.page.value`; the orange `competition-register-card` is deleted entirely.

```astro
<article class="competition-meta-card">
  <div class="competition-meta-label" data-i18n="detailPage.totalAwardLabel">
    {locale.detailPage.totalAwardLabel}
  </div>
  <div class="competition-meta-value" data-i18n="page.value">{locale.page.value}</div>
</article>

<article class="competition-meta-card">
  <div class="competition-meta-label" data-i18n="detailPage.deadlineLabel">
    {locale.detailPage.deadlineLabel}
  </div>
  <div class="competition-meta-value">
    <span data-i18n="page.deadlinePrefix">{locale.page.deadlinePrefix}</span>{" "}
    <strong data-i18n="page.deadlineValue">{locale.page.deadlineValue}</strong>
  </div>
</article>

<article class="competition-meta-card">
  <div class="competition-meta-label" data-i18n="detailPage.focusLabel">
    {locale.detailPage.focusLabel}
  </div>
  <div class="competition-focus-tags">
    {locale.page.focusTags.map((tag) => (
      <span class="competition-focus-tag">{tag}</span>
    ))}
  </div>
</article>

<article class="competition-meta-card">
  <div class="competition-meta-label" data-i18n="detailPage.statusLabel">
    {locale.detailPage.statusLabel}
  </div>
  <div class:list={["competition-meta-value", `competition-meta-value--${locale.page.statusTone}`]}>
    {locale.page.statusLabel}
  </div>
</article>
```

- [ ] **Step 4: Remove the subtitle below the title**

Delete the `<p class="page-subtitle page-subtitle--wide" data-i18n="page.detailSubtitle">` block (lines 43–45). Leave the `detailSubtitle` content field in place — other pages may read it, and removing schema fields is out of scope.

- [ ] **Step 5: Rebuild the bottom action row**

Replace the `competition-detail-actions` block (lines 134–136) with a centered row carrying both the primary Register Now button and the View All link:

```astro
<div class="interior-wrap competition-detail-actions competition-detail-actions--center">
  <a
    href={locale.page.applicationHref}
    class="site-btn site-btn--primary"
    data-i18n="page.applicationLabel"
  >
    {locale.page.applicationLabel}
  </a>
  <a href="/competitions/" class="site-btn site-btn--secondary" data-i18n="detailPage.viewAllLabel">
    {locale.detailPage.viewAllLabel}
  </a>
</div>
```

Note the View All link now reads from `locale.detailPage.viewAllLabel` instead of the hardcoded `View All` text that was there — that string was a latent i18n bug. Confirm the key exists in all three locales; add it if missing (`en`: "View All", `br`: "Ver Todos", `cn`: "查看全部").

The feedback says the registration button text is "Register Now". `page.applicationLabel` already holds the per-competition CTA text; verify what it currently renders. If it is not "Register Now", update the content, not the component — the Programs plan (Task 7) depends on this label being content-driven so it can read "Check Eligibility" there.

- [ ] **Step 6: Center the action row in CSS**

```css
.competition-detail-actions--center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding-bottom: 48px;
}
```

Remove the inline `style="padding-bottom: 48px;"` from the markup since the class now owns it.

- [ ] **Step 7: Delete the orange register card CSS**

Remove `.competition-register-card` and `.competition-register-value` rules from `src/styles/interior-pages.css`. Grep first — if either class is used anywhere else, leave it and scope instead:

Run: `grep -rn "competition-register" src/`
Expected: no remaining usages after Step 3.

- [ ] **Step 8: Build, test, screenshot both**

Run: `npm test && npm run build`
Screenshot a **competition** detail page and a **challenge** detail page. Both must show: no subtitle, meta grid reading Total Award / Timeline / Focus / Status, no orange card, and a centered Register Now + View All row at the bottom.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "fix(ui): competition detail card set, bottom register button, centered View All"
```

---

## Task 3: Landing page section callouts

Do this **before** Task 4 (Network). Both touch `links.ts` index maps, and this task removes the `categoryCards` those indices serve.

**Files:**
- Create: `src/components/home/SectionCallouts.astro`
- Create: `src/components/site/Icon.astro`
- Modify: `src/components/home/DesktopHome.astro:58-85` and its stacking script (~lines 173-230)
- Modify: `src/components/home/MobileHome.astro`
- Modify: `src/content/homepage/locales/{en,br,cn}.json`
- Modify: `src/styles/homepage.css`
- Test: `tests/homepage-design.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `Icon.astro` with the signature below — **Task 6 (form benefit icons) depends on this exact interface**:

```astro
---
// src/components/site/Icon.astro
interface Props {
  name: string;      // Lucide icon name, e.g. "briefcase"
  class?: string;
  size?: number;     // default 24
}
---
```

It renders an inline `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">` with the named icon's paths. Icons are stored as a `Record<string, string>` of raw path markup in the component. Add only the icons actually used — do not vendor the whole Lucide set.

- [ ] **Step 1: Create `Icon.astro` with the four landing icons**

Get the paths from lucide.dev (ISC licensed — inlining is fine, no attribution required in-page). The four landing icons:

| Callout | Lucide icon |
|---|---|
| Advisory | `compass` |
| Competitions & Challenges | `trophy` |
| Events | `calendar-days` |
| Programs | `rocket` |

- [ ] **Step 2: Write the failing test**

Add to `tests/homepage-design.test.mjs` (read the file first for its existing style):

```js
test("landing page has four section callouts and no stacked cards", async () => {
  const html = await readFile("dist/index.html", "utf8");
  assert.doesNotMatch(html, /desk-catblock/, "stacked category cards must be gone");
  const callouts = html.match(/class="[^"]*section-callout\b/g) ?? [];
  assert.equal(callouts.length, 4, "expected exactly four callouts");
  for (const href of ["/advisory/", "/competitions/", "/events/", "/programs/"]) {
    assert.ok(html.includes(`href="${href}"`), `callout must link to ${href}`);
  }
  // Network is excluded from the CALLOUTS here. It still appears in the mega menu
  // and footer until Task 4 strips them — so scope this to the callout section.
  // Task 4 introduces the document-wide assertion.
  const section = html.match(/<section[^>]*id="desktop-categories"[\s\S]*?<\/section>/)?.[0] ?? "";
  assert.ok(section, "expected the callout section to exist");
  assert.doesNotMatch(section, /href="\/network\//, "Network is excluded from the callouts");
});
```

**Why scoped, not document-wide:** `/network/` appears ~7 times in `dist/index.html` — the two category cards this task removes, plus the desktop mega-menu nav item and card, the mobile menu card, and the two `/network/*` sub-links. Only Task 4 removes the latter five. A document-wide assertion here would force this task into Task 4's scope and leave Task 4's review unable to prove its own work.

- [ ] **Step 3: Run it and watch it fail**

Run: `npm run build && npm test`
Expected: FAIL — `desk-catblock` still present.

- [ ] **Step 4: Add the callout content to all three locales**

In `src/content/homepage/locales/{en,br,cn}.json`, replace the `categoryCards` array with `sectionCallouts`:

```json
"sectionCallouts": [
  {
    "icon": "compass",
    "title": "Advisory",
    "description": "Strategic guidance for investors, operators, and institutions moving between China and Latin America. Corridor complexity translated into concrete next steps.",
    "cta": "Explore Advisory",
    "href": "/advisory/"
  },
  {
    "icon": "trophy",
    "title": "Competitions & Challenges",
    "description": "Startup competitions and corporate-backed open innovation designed to surface high-potential founders and investable cross-border opportunities.",
    "cta": "View Competitions",
    "href": "/competitions/"
  },
  {
    "icon": "calendar-days",
    "title": "Events",
    "description": "Trade fairs, expos, summits, and corridor briefings built for qualified meetings and follow-through after the room clears.",
    "cta": "See Events",
    "href": "/events/"
  },
  {
    "icon": "rocket",
    "title": "Programs",
    "description": "From online exploration to boots-on-the-ground business missions, moving companies from initial interest to real market presence.",
    "cta": "Browse Programs",
    "href": "/programs/"
  }
]
```

**This is interim copy.** Andre will supply the final text; the shape is final so the swap is content-only. Translate faithfully for `br` and `cn` — do not leave English in the other locale files.

- [ ] **Step 5: Create `SectionCallouts.astro`**

A classic hero callout per section: icon, title, description, CTA button linking to `href`. Wire every string with `data-i18n={`sectionCallouts.${index}.title`}` etc., per the i18n contract. Use `Icon.astro` for the icon. Match the homepage's existing visual language (read `homepage.css` for the established type scale, spacing, and button styles — `desk-btn` variants exist already). Do not invent new patterns.

- [ ] **Step 6: Wire it into the homepage and delete the stacked cards**

In `DesktopHome.astro`: replace the `desk-categories` section (lines 58–85) with `<SectionCallouts locale={locale} />`, keeping the `id="desktop-categories"` anchor — the hero CTA at line 44 links to `#desktop-categories` and will break otherwise.

Delete the entire scroll-stacking `<script>` block (from the `/** Scroll-based stacking card effect` comment through its close) and the `desk-catblock*` CSS in `homepage.css`.

Do the equivalent in `MobileHome.astro`. Read it first — its structure differs from desktop.

- [ ] **Step 7: Update the types**

`src/lib/homepage/types.ts` and `schema.ts` (and `keystatic.config.ts`) reference `categoryCards`. Rename to `sectionCallouts` with the field shape above. Keystatic manages homepage content, so its config must match or the CMS breaks.

- [ ] **Step 8: Build, test, screenshot**

Run: `npm run build && npm test`
Expected: PASS.
Screenshot the desktop homepage and the mobile homepage. Verify the `#desktop-categories` anchor still scrolls from the hero CTA.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(home): replace stacked cards with four section callouts"
```

---

## Task 4: Unpublish Network

Do this **after** Task 3.

**Files:**
- Delete: `src/pages/network/city-partnerships.astro`, `src/pages/network/featured-speakers.astro`
- Modify: `src/lib/homepage/links.ts`
- Modify: `src/content/homepage/locales/{en,br,cn}.json`
- Modify: `src/content/static-pages/network.json`
- Test: `tests/no-network-routes.test.mjs` (create)

**Interfaces:**
- Consumes: the `sectionCallouts` shape from Task 3.
- Produces: nothing.

**Feedback item:** Disable the Network section temporarily. Decision: fully unpublish — links removed, routes 404, content kept for easy re-enable.

- [ ] **Step 1: Write the failing test**

Create `tests/no-network-routes.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function allHtml(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await allHtml(p)));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

test("network routes are not emitted", async () => {
  const files = await allHtml("dist");
  const network = files.filter((f) => f.includes("/network/"));
  assert.deepEqual(network, [], "no /network/ routes should be built");
});

test("nothing links to network", async () => {
  for (const file of await allHtml("dist")) {
    const html = await readFile(file, "utf8");
    assert.doesNotMatch(html, /href="\/network\//, `${file} still links to /network/`);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm run build && npm test`
Expected: FAIL — network routes exist and are linked.

- [ ] **Step 3: Delete the routes**

```bash
git rm src/pages/network/city-partnerships.astro src/pages/network/featured-speakers.astro
```

Keep `src/components/network/`, `src/lib/network/`, `src/content/network/`, and `src/content/speakers/` — re-enabling must be a route + link change only.

- [ ] **Step 4: Stop emitting the `/network/` static page**

`src/pages/[slug].astro` generates static pages from `src/content/static-pages/*.json` via `getStaticPaths`. Exclude the network entry — prefer a `published: false` flag in `network.json` honoured by `src/lib/static-pages/reader.ts`, so the mechanism is reusable and self-documenting, over a hardcoded slug filter in the route.

- [ ] **Step 5: Remove every link to Network**

- `src/lib/homepage/links.ts`: remove the `network`, `cityPartnerships`, and `featuredSpeakers` targets and every map entry referencing them. **Read the whole file first.** The maps are index-keyed (`4: network`, `3: [network]`) and Task 3 removed the `categoryCards` those indices served — re-derive the mapping rather than deleting lines mechanically.
- `src/content/homepage/locales/{en,br,cn}.json`: remove the Network entry from `desktopMenuSections`, `mobileMenuSections`, and the `footerColumns` Network group.

- [ ] **Step 6: Run the tests and watch them pass**

Run: `npm run build && npm test`
Expected: PASS, including Task 3's homepage test.

- [ ] **Step 7: Screenshot**

Homepage and one interior page. The mega menu must show four sections, not five, with no gap where Network was. The footer must have no Network column.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(network): temporarily unpublish network routes and links"
```

---

## Task 5: Language selector convergence

**Files:**
- Modify: `src/components/site/LanguageSwitcher.astro`
- Modify: `src/components/home/DesktopNavigation.astro:163-195`, `DesktopFooter.astro`, `MobileHome.astro`
- Modify: `src/styles/homepage.css:359-500`, `src/styles/interior-pages.css:359-460,2699-2720`
- Test: `tests/homepage-architecture.test.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `LanguageSwitcher.astro` gains a `tone` prop:

```astro
interface Props {
  languages: LanguageOption[];
  currentLanguage?: string;
  label?: string;
  labelTranslationKey?: string;
  className?: string;
  align?: "left" | "right";
  tone?: "light" | "dark";   // NEW — "dark" for the black homepage, "light" for white interior pages
}
```

**Feedback items:** Make the language icon the same size and format in black and white site versions; use a fixed width for the language selector in both the header and footer regardless of the selected language; remove the fixed highlight from the selected language.

**Why a refactor:** `AGENTS.md` mandates reusing `site/LanguageSwitcher.astro` for desktop/footer language controls; the homepage violates this with a hand-rolled `.desk-lang`. That duplication is exactly why the icon differs between the black and white versions. Converging fixes the cause. This is a targeted swap of one control — **not** a homepage architecture rewrite, which `AGENTS.md` forbids.

- [ ] **Step 1: Read both implementations side by side**

Run: `grep -n -A 25 "desk-lang" src/components/home/DesktopNavigation.astro | head -40`

Note the homepage variant renders a `.desk-lang-active-code` span showing the current code next to the globe; the shared component does not. Decide deliberately whether the converged control keeps the active code (recommended: keep it — it aids orientation, and fixed width makes it safe). Whatever you choose must be identical in both tones.

- [ ] **Step 2: Write the failing test**

Add to `tests/homepage-architecture.test.mjs`:

```js
test("homepage reuses the shared language switcher", async () => {
  const nav = await readFile("src/components/home/DesktopNavigation.astro", "utf8");
  assert.match(nav, /LanguageSwitcher/, "homepage nav must use the shared component");
  assert.doesNotMatch(nav, /desk-lang-btn/, "hand-rolled switcher markup must be gone");
});

test("language switcher has a fixed width and no active highlight", async () => {
  const css = await readFile("src/styles/interior-pages.css", "utf8");
  const btn = css.match(/\.site-lang-btn \{[^}]*\}/);
  assert.ok(btn && /width:\s*\d/.test(btn[0]), "switcher button needs an explicit width");
  assert.doesNotMatch(css, /\.site-lang-option\.is-active \{[^}]*background/, "no selected-language highlight");
});
```

- [ ] **Step 3: Run it and watch it fail**

Run: `npm test`
Expected: FAIL — homepage nav has no `LanguageSwitcher` import.

- [ ] **Step 4: Add the `tone` prop**

Render `class:list={["site-lang", className, `site-lang--${align}`, `site-lang--${tone}`]}`. Move the homepage's dark-surface colors into a `.site-lang--dark` block in `interior-pages.css`, keeping the **same** SVG, the same `viewBox="0 0 24 24"`, the same box size, and the same stroke width across both tones. Only colors may differ.

- [ ] **Step 5: Fixed width**

Set an explicit width on `.site-lang-btn` and `.site-lang-menu` sized to the widest option. Language codes are EN/BR/CN (all 2 chars) but the menu labels are "English"/"Portuguese"/"Chinese" — size to the longest, and verify by switching languages that nothing shifts. This is the actual feedback item; a width that still reflows fails it.

- [ ] **Step 6: Remove the selected highlight**

Delete the `background`/`color` treatment from `.site-lang-option.is-active` (`interior-pages.css:447-455`). Keep the `is-active` class in the markup — the JS and a11y state rely on it; only the *fixed highlight* styling goes. Verify hover still gives feedback.

- [ ] **Step 7: Swap the homepage over**

Replace the `.desk-lang` markup in `DesktopNavigation.astro`, `DesktopFooter.astro`, and `MobileHome.astro` with `<LanguageSwitcher ... tone="dark" />`. Then delete the now-dead `.desk-lang*` CSS from `homepage.css`.

**Critical:** the homepage language JS binds to `data-lang-toggle`, `data-lang-menu`, and `data-lang-option`. The shared component already emits all three, so `LocalizationClient.astro` keeps working — but verify by actually switching languages, not by reading the code.

- [ ] **Step 8: Build, test, screenshot**

Run: `npm test && npm run build`
Screenshot the homepage header, homepage footer, an interior header, and an interior footer. The globe must be visually identical in all four. **Switch languages on both the homepage and an interior page** — this is mandatory per `AGENTS.md` and this task is the highest-risk one in the plan.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "fix(ui): converge homepage language switcher onto shared component"
```

---

## Task 6: Form benefit icons and footer cleanup

**Files:**
- Modify: `src/components/pre-registration/PreRegistrationPage.astro:637-650`
- Modify: `src/components/site/Icon.astro` (add 12 icons)
- Modify: `src/lib/interior-pages/types.ts:120`
- Modify: `src/content/interior-pages/locales/{en,br,cn}.json`
- Modify: `src/styles/interior-pages.css:2240-2280`
- Test: `tests/pre-registration-form.test.mjs`

**Interfaces:**
- Consumes: `Icon.astro` from Task 3 — exact signature in that task's Interfaces block.
- Produces: `BenefitOption` becomes:

```ts
export type BenefitOption = {
  label: string;
  value: string;
  icon: string;   // was: short — a 2-letter initial
  tone: "blue" | "green" | "sand" | "lilac";
};
```

**Feedback items:** Use white card backgrounds; replace the letter initials with icons; keep the icons colorful using the same colors as the Challenges list; on hover change only the card border; remove the gray placeholder background; make the bottom confirmation area narrower; move the drafts note under the Save button in grey.

- [ ] **Step 1: Write the failing test**

```js
test("benefit options use icons, not letter initials", async () => {
  const en = JSON.parse(await readFile("src/content/interior-pages/locales/en.json", "utf8"));
  const benefits = en.preRegistrationPage.benefits;
  assert.equal(benefits.length, 12);
  for (const b of benefits) {
    assert.ok(b.icon, `${b.value} must have an icon`);
    assert.equal(b.short, undefined, `${b.value} must not keep the letter initial`);
  }
});
```

- [ ] **Step 2: Run it and watch it fail**

Run: `npm test`
Expected: FAIL — benefits still carry `short`.

- [ ] **Step 3: Map the 12 benefits to Lucide icons**

Replace `short` with `icon` in all three locale files, keeping each option's existing `tone` (the four tones are already the site palette — this is the spec's reading of "same colors as the Challenges list", which only has two accents and so does not map literally):

| value | was | icon |
|---|---|---|
| policy | PD | `scroll-text` |
| talent | TS | `users` |
| tax | BT | `receipt` |
| listing | LG | `trending-up` |
| fund | HF | `piggy-bank` |
| fa | FA | `line-chart` |
| vc | VC | `handshake` |
| industrial | IM | `factory` |
| scenario | SM | `map` |
| exhibition | EX | `presentation` |
| pitching | PT | `mic` |
| branding | BR | `megaphone` |

Add these 12 icons to `Icon.astro`.

- [ ] **Step 4: Update the type and the markup**

Change `BenefitOption.short` → `icon` in `src/lib/interior-pages/types.ts:120`. In `PreRegistrationPage.astro`, replace `{benefit.short}` (line 645) with `<Icon name={benefit.icon} />`.

- [ ] **Step 5: Run the test and watch it pass**

Run: `npm test && npm run build`
Expected: PASS.

- [ ] **Step 6: Restyle the benefit cards**

White backgrounds; hover changes **only** the border — no transform, no shadow, no background change; remove the gray placeholder background. Keep the four tone colors on the icons themselves (`.benefit-icon--blue` etc. at `interior-pages.css:2253-2272` already define them — the icon now inherits via `currentColor`, so the `color` property carries over and the `background` tint on those rules should be reconsidered against the white-card requirement).

- [ ] **Step 7: Narrow the bottom confirmation area**

The "By submitting, you confirm that the information is accurate and agree to…" block is too wide. Give it a smaller max-width than the default section width. It explicitly does **not** need to match the site's standard content width. Pick a value that reads well and screenshot it.

- [ ] **Step 8: Move the drafts note**

Remove "Drafts are saved in this browser only (files aren't saved)" from its current position and re-render it as small grey text directly beneath the Save button. Keep it localized — find its key in the locale files and move the markup, not the string.

- [ ] **Step 9: Build and screenshot**

Run: `npm test && npm run build`
Screenshot `/pre-registration/`: the 12 benefit cards with icons, hover state on one card (border only), the narrowed confirmation area, and the drafts note under Save.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "fix(ui): form benefit icons, white cards, narrowed footer, drafts note under save"
```

---

## Task 7: Eligibility form + Apps Script routing

Do this **before** Task 8 — the Check Eligibility button needs a destination.

**Files:**
- Create: `src/pages/eligibility.astro`
- Create: `src/components/eligibility/EligibilityPage.astro`
- Create: `src/lib/eligibility/sheet-columns.ts`
- Create: `src/lib/eligibility/submit.mjs`
- Modify: `scripts/apps-script/Code.gs`
- Test: `tests/eligibility-form.test.mjs` (create)

**Interfaces:**
- Consumes: nothing.
- Produces: the route `/eligibility/?program=<slug>`, consumed by Task 8.

**Spec constraint — read carefully:** eligibility (program qualification), event application (attending an event), and event submission (an organizer listing an event) are **three different forms**. This task builds only eligibility. It does **not** get reused for event application — the Events plan builds that separately. They share only the Apps Script endpoint, discriminated by `formType`. See "Three Forms, Not One" in the spec.

- [ ] **Step 1: Read the existing form's submission path**

Read `src/lib/pre-registration/submit.mjs`, `src/lib/pre-registration/sheet-columns.ts`, `scripts/apps-script/Code.gs`, and `tests/pre-registration-form.test.mjs`. This task mirrors that architecture exactly. The column-order-matches-Code.gs test is the contract to copy.

- [ ] **Step 2: Write the failing test**

Create `tests/eligibility-form.test.mjs`:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ELIGIBILITY_SHEET_COLUMNS } from "../src/lib/eligibility/sheet-columns.ts";

test("eligibility columns match Code.gs", async () => {
  const gs = await readFile("scripts/apps-script/Code.gs", "utf8");
  const block = gs.match(/var ELIGIBILITY_SHEET_COLUMNS = \[([\s\S]*?)\];/);
  assert.ok(block, "Code.gs must declare ELIGIBILITY_SHEET_COLUMNS");
  const declared = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(declared, ELIGIBILITY_SHEET_COLUMNS, "column order must match exactly");
});
```

Note: importing a `.ts` file from a `.mjs` test may need the same mechanism `tests/pre-registration-form.test.mjs` uses — check how that test reads `PRE_REGISTRATION_SHEET_COLUMNS` and copy the approach rather than inventing one.

- [ ] **Step 3: Run it and watch it fail**

Run: `npm test`
Expected: FAIL — module not found.

- [ ] **Step 4: Define the columns**

```ts
// src/lib/eligibility/sheet-columns.ts
// Canonical column order for the eligibility Google Sheet tab.
// scripts/apps-script/Code.gs MUST declare the same ELIGIBILITY_SHEET_COLUMNS array,
// in the same order — the build test in tests/eligibility-form.test.mjs asserts they match.

export const ELIGIBILITY_SHEET_COLUMNS = [
  "Submitted At",
  "Submission ID",
  "Language",
  "Program Slug",
  "Program Name",
  "Name",
  "Email",
  "Company",
  "Message",
] as const;
```

- [ ] **Step 5: Add `formType` routing to Code.gs**

Route to a sheet by `formType`, defaulting to pre-registration so existing behaviour is preserved:

```js
var SHEET_NAME = "Submissions";
var ELIGIBILITY_SHEET_NAME = "Eligibility";

var ELIGIBILITY_SHEET_COLUMNS = [
  "Submitted At",
  "Submission ID",
  "Language",
  "Program Slug",
  "Program Name",
  "Name",
  "Email",
  "Company",
  "Message"
];

function routeForFormType(formType) {
  if (formType === "eligibility") {
    return { sheetName: ELIGIBILITY_SHEET_NAME, columns: ELIGIBILITY_SHEET_COLUMNS };
  }
  return { sheetName: SHEET_NAME, columns: SHEET_COLUMNS };
}
```

Then use `routeForFormType(params.formType)` where `Code.gs` currently hardcodes `SHEET_NAME` and `SHEET_COLUMNS` (around line 62: `var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);`). Read the whole file before editing — do not guess its structure.

- [ ] **Step 6: Run the test and watch it pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 7: Build the form**

`EligibilityPage.astro` with five fields: Program (pre-filled from `?program=<slug>`, read the program name from the programs reader), Name (required), Email (required), Company (required), Short message (textarea). One screen. No file uploads. Submit posts `formType: "eligibility"` to the same `PUBLIC_PREREG_SCRIPT_URL`.

Reuse the existing form's styling classes rather than inventing new ones — read `PreRegistrationPage.astro` for the established field markup. All labels localized in all three locales per the i18n contract.

- [ ] **Step 8: Build and screenshot**

Run: `npm test && npm run build`
Screenshot `/eligibility/?program=market-entry-cohort-8` — the program must be pre-filled.

**Expected limitation:** submission will not actually reach a sheet. `Code.gs` is not yet deployed and `PUBLIC_PREREG_SCRIPT_URL` is not set — a pre-existing gap this task inherits, documented in the spec. Do not claim the form submits successfully; verify only that the request is well-formed.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(eligibility): lightweight program eligibility form with Apps Script routing"
```

---

## Task 8: Programs list + detail

**Files:**
- Modify: `src/content/static-pages/programs.json`
- Modify: `src/components/programs/ProgramDetailPage.astro`
- Modify: `src/content/programs/*.json`
- Test: `tests/interior-pages.test.mjs`

**Interfaces:**
- Consumes: the `/eligibility/?program=<slug>` route from Task 7; the detail-page layout from Task 2.
- Produces: nothing.

**Feedback items:** Programs list — remove the description below the title and the text on the right side. Program detail — use the same style as the Competition detail page; remove the Award card (do not display cost); instead of "Register Now", "Check Eligibility" linking to a simplified form.

- [ ] **Step 1: Clean the list header**

In `src/content/static-pages/programs.json`, clear `summary` in all three locales — same approach as Task 1 Step 6.

- [ ] **Step 2: Write the failing test**

```js
test("program detail has no award card and links to eligibility", async () => {
  const html = await readFile("dist/programs/market-entry-cohort-8/index.html", "utf8");
  assert.doesNotMatch(html, /Total Award/, "programs must not display cost");
  assert.match(html, /href="\/eligibility\/\?program=market-entry-cohort-8"/);
  assert.match(html, /Check Eligibility/);
});
```

Confirm that slug exists before relying on it: `ls src/content/programs/`.

- [ ] **Step 3: Run it and watch it fail**

Run: `npm run build && npm test`
Expected: FAIL.

- [ ] **Step 4: Align the detail page with Task 2**

Bring `ProgramDetailPage.astro` in line with `CompetitionDetailPage.astro`'s structure from Task 2: same meta-grid treatment, same centered bottom action row. The meta grid is **Timeline / Focus / Status** — three cards, no Award card, no cost displayed anywhere.

If the two detail pages end up structurally identical apart from the card set and CTA, extract the shared shell into a component both use. If they diverge meaningfully, leave them separate — do not force a bad abstraction. Use judgment and say which you chose and why.

- [ ] **Step 5: Point the CTA at eligibility**

The bottom button reads **Check Eligibility** and links to `/eligibility/?program=<slug>`. Per Task 2 Step 5, the label is content-driven — set it in the program content, all three locales (`en`: "Check Eligibility", `br`: "Verificar Elegibilidade", `cn`: "查看申请条件").

- [ ] **Step 6: Build, test, screenshot**

Run: `npm test && npm run build`
Screenshot `/programs/` and a program detail page. Click through Check Eligibility and confirm it lands on the eligibility form with the program pre-filled.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix(ui): programs header cleanup, competition-style detail, check eligibility CTA"
```

---

## Task 9: Update CHECKLIST.md

**Files:**
- Modify: `CHECKLIST.md`

`AGENTS.md` requires `CHECKLIST.md` to reflect actual state after any work, and warns its ✅ marks are not trustworthy — verify in code before trusting any status.

- [ ] **Step 1: Reconcile**

Go through `CHECKLIST.md` and mark what Tasks 1–8 actually completed. Where an item is marked done but the code disagrees, fix the mark. Add any July 16 feedback items not already tracked.

- [ ] **Step 2: Commit**

```bash
git add CHECKLIST.md
git commit -m "docs: update CHECKLIST for July 16 feedback refinements"
```

---

## Self-Review Notes

**Spec coverage:** A→Task 3; B→Task 5; C→Task 4; D→Task 1; E→Task 2; F→Task 6; G→Task 8; G2→Task 7; H→companion Events plan. All refinement feedback items are mapped.

**Deliberately deferred:**
- `detailPage.registrationLabel` and `page.detailSubtitle` become unused content fields (Task 2). Removing them is a schema cleanup, out of scope.
- The Events feature, per the companion plan.

**Open questions carried from the spec** (do not guess — flag to the user):
- Andre's landing copy: Task 3 ships interim text in the final shape.
- "Same colors as the Challenges list": the challenges list has two accents, the benefit icons four tones. Task 6 keeps the four tones.

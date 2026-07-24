# UI/UX Refinement Checklist — All 56 Items

## Current Status Review — 2026-04-27

The historical checklist is no longer sufficient as the sole source of truth. A fresh app review against the current build, stale customer feedback, and mockups found implementation items, including production-visible test competitions, interior CTA contrast regressions, missing mobile interior navigation, and pre-registration drift from the supplied mockup.

The 2026-04-27 implementation pass has resolved TODO-001 through TODO-012 in `.opencode/feedback/current-status-todo-2026-04-27.md`. Current screenshot evidence lives in `.opencode/feedback/2026-04-27-implementation/shots/`.

## New Customer Feedback Intake — 2026-04-28

Customer feedback from `feedback/v4_site updates.pptx` has been triaged in `.opencode/feedback/analysis-2026-04-28.md`.

Status: Batches A-H are implemented and visually verified for FB-001 through FB-061. The completed statuses below reflect the older 56-item checklist; the only remaining waiting/deferred items are historical items outside the new PPT feedback scope.

## July 16 2026 Customer Feedback

Source: `July 16 2026 updates.docx`. Design: `docs/superpowers/specs/2026-07-17-july-16-feedback-design.md`. Plan: `docs/superpowers/plans/2026-07-17-july-16-feedback-refinements.md`. Branch: `feedback/2026-07-16-updates`.

Refinements (Tasks 1–8) are implemented, each reviewed clean. Events (area H) is a separate, larger build not yet started — it needs its own plan from `mockup/5 - events_v11.htm`.

| Area | Item | Status | Notes |
|---|---|---|---|
| Landing | Remove stacked cards; four section callouts (Advisory/Competitions/Events/Programs) | ✅ Done | Interim copy in final content shape; Andre to supply final text. Network deliberately excluded. `SectionCallouts.astro` + Lucide `Icon.astro`/`icons.ts`. |
| Landing | Language icon same size/format across dark & light | ✅ Done | Homepage `.desk-lang` converged onto shared `LanguageSwitcher.astro` with a `tone` prop; one SVG serves both. |
| Landing | Fixed-width language selector, header & footer | ✅ Done | `width` (not min-width); menu always lists all 3 langs, so no reflow on selection. |
| Landing | Remove fixed highlight from selected language | ✅ Done | Desktop dropdown `.is-active` highlight removed, class kept for JS/a11y. Mobile bottom-sheet checkmark left as-is (open question — see below). |
| Landing | Disable Network temporarily | ✅ Done | Fully unpublished: routes 404, all links removed, content kept for easy re-enable via `git revert`. |
| Advisory | Cards white, gray border matching divider, radius = competition cards | ✅ Done | Scoped to `.advisory-card-grid` so the shared News card class is unaffected. |
| Advisory | Remove text below title and on the right | ✅ Done | `summary` cleared, all 3 locales. |
| Competitions | Detail: remove subtitle; cards Total Award / Timeline / Focus / Status; remove orange button; centered Register Now + View All at bottom | ✅ Done | Challenges share `CompetitionDetailPage.astro`, so both are covered. |
| Challenges | Same card layout/styling as competition detail | ✅ Done | Structural — same template. |
| Form | White benefit cards; icons replace letter initials; colorful; hover changes only border; remove gray placeholder | ✅ Done | 12 Lucide icons; four existing tones kept. |
| Form | Narrow the "By submitting…" area; move drafts note under Save in grey | ✅ Done | `.submit-note` max-width 340px; `.save-draft-hint`. |
| Programs | List: remove description and right-side text | ✅ Done | `summary` cleared, all 3 locales. |
| Programs | Detail: competition style; no Award card; Check Eligibility → simplified form | ✅ Done | Links to `/eligibility/?program=<slug>`. |
| Eligibility | New lightweight form (program qualification) | ✅ Done (code) | Code-complete but NOT live — `Code.gs` undeployed, `PUBLIC_PREREG_SCRIPT_URL` unset. |
| Events | List (larger cards, filters, no highlighted event), detail, application form | ✅ Done | Delivered via `docs/superpowers/plans/2026-07-23-events.md`: `/events/` lists two tabs (Trade Fairs / Summits) with counts derived from the CMS, Status + Region (China-by-location / LATAM-by-country) + Industry filters, month-grouped cards, no featured/highlighted block, and a "List Your Event" panel pointing at the contact modal. `/events/[slug]` detail pages match the competition-detail visual family (meta grid, no award card). `/event-application` is its own minimal form routed to a future "Event Applications" sheet in `Code.gs` (`formType=event-application`). **The collection ships seed content (25 entries: 14 trade fairs + 11 summits) pending Andre's real calendar** — see `src/content/events/README.md` for the editor constraints Keystatic replacement must respect. |

Open questions carried to the user:
- Andre's final landing copy (interim text shipped in the final shape).
- Mobile language bottom-sheet still shows a selected-language checkmark — likely not what "remove the fixed highlight" meant (that was desktop-framed), left as-is pending confirmation.
- Selected benefit card is now signalled by border + bolder label only (no fill) — a literal reading of "hover changes only the border"; a stronger selected treatment is possible if wanted.
- Events open items — resolved 2026-07-23: "Book a Booth" and "List Your Event" both point at the existing contact modal; the event application sits behind the detail-page hop (list → detail → apply). Confirmed by the user; Andre may still override either.

Deploy dependency (pre-existing, blocks the pre-registration, eligibility, AND event-application forms going live): deploy `scripts/apps-script/Code.gs` and set `PUBLIC_PREREG_SCRIPT_URL`. One deploy now covers all three `formType` routes (`pre-registration` → Submissions, `eligibility` → Eligibility, `event-application` → Event Applications).

## LANDING PAGE

| # | Description | Status | Notes |
|---|---|---|---|
| **1** | Nav layout: full width, 3-part split (logo \| centered nav \| switcher), logo & switcher same width | ✅ Done | Fixed: 3-part flex with `flex: 0 0 200px` on brand/lang, centered nav |
| **2** | Confirm Roboto is the font site-wide | ⏳ Pending | Roboto is base font; some sections use Outfit/DM Sans — leave for later review |
| **3** | Language switcher in gray, reduced font size | ✅ Done | |
| **4** | Language switcher: show selected lang, no menu resize on open; EN/中文/BR in red, hover shows full name in white | ✅ Done | Re-verified 2026-04-28 for Batch A: closed trigger is a 36px `#555555` globe, compact menu uses 80px translucent mockup styling, and hover expands full labels only on the hovered option |
| **5** | Reduce mega submenu height by ~50px | ✅ Done  - Submenu content updates via keystatic pending | FB-006: Set `height: 260px`, padding `36px 58px 40px`, gap `48px` on `.site-mega-grid` to match mockup |
| **6** | Video: better resolution needed | ⏳ Waiting on user | User needs to provide a higher-res video file |
| **7** | "Accelerating Innovation" block lower, buttons at page bottom | ✅ Done | |
| **8** | Card stacking smoother, animated speed change | ✅ Done | |
| **9** | Competition area: red on left (Startup), blue on right (Corporate) | ✅ Done | Fixed: swapped themes in all 3 locale files |
| **10** | News cards: match design in mockup/news-card.png | ✅ Done | FB-001: Removed border/shadow/min-height, tightened gap to 14px, padding to 16px 16px 14px, flush accent stripe |
| **11** | Footer: match design in mockup/footer-index.png | ✅ Done | Re-verified 2026-04-28 for Batch B: footer content aligns to wider guide margins, content area is taller, link typography is tighter, and QR popup overlaps the lower stripe from the left side |
| **12** | Footer: WhatsApp icon outlined, next to WeChat | ✅ Done | Re-verified 2026-04-28 for Batch B: WhatsApp control now uses the proposed outlined bubble plus inner phone mark |
| **13** | Footer: newsletter/social area positioning, button sizes | ✅ Done | Re-verified 2026-04-28 for Batch B: newsletter input focus uses a thin red stroke, placeholder is smaller gray text, and subscribe CTA is wider/larger |
| **14** | Footer: language switcher reduced width, no extra blank space | ✅ Done | Fixed: reduced menu width, label always visible with opacity |
| **15** | Footer: WeChat QR 18% transparency, centered text | ✅ Done | |

## CHALLENGES & COMPETITIONS

| # | Description | Status | Notes |
|---|---|---|---|
| **16** | *(Skipped in document — numbering goes 15→17)* | N/A | |
| **17** | Interior nav positioning | ✅ Done | Fixed: applied same 3-part centered layout as homepage (`flex: 0 0 200px` on brand/lang, `flex: 1` centered nav) |
| **18** | Mega menu layout: match mockup HTML `mockup/1 - LATAMCHINATECH_desktop v 1million.htm` | ✅ Done | Fixed: added layout variants (standard, two-cards, events) with conditional rendering |
| **19** | Mega menu content for all 5 sections (Advisory, Competitions, Events, Programs, Network) | ✅ Done | Fixed: updated all 3 locale files with mockup-matched content |
| **20** | STATUS/FOCUS filter pills: check against `mockup/3 - Challenges__Competitions_v7.htm` | ✅ Done | Re-verified 2026-04-26: mockup pill sizing, `8px` filter bar gap, icon colors/opacity, active state, hover-only treatment, and 34px rendered pill height covered by browser/test assertions |
| **21** | Small dot on top-left label (eyebrow area) | ✅ Done | Re-verified 2026-04-26: red dot renders before the localized eyebrow on `/competitions/` |
| **22** | Tab fonts larger and bold | ✅ Done | Re-verified 2026-04-26: rendered tabs are `26px` / `800`; form-control font reset no longer overrides tab/filter/select typography |
| **23** | "Featured Competition" text in Startup tab + red star | ✅ Done | Re-verified: startup featured tag now comes from competition content as "Featured Competition" |
| **24** | Blue star on "Featured Challenge" in Corporate tab | ✅ Done | |
| **25** | Pulsing red dot next to "Open Now", font reduced 1pt | ✅ Done | |
| **26** | Filter: smaller font, more rounded | ✅ Done | Re-verified 2026-04-26: sort select is functional and renders as compact `13px` rounded mockup pill |
| **27** | Featured card: preview text in black, title less bold | ✅ Done | Re-verified (FB-003): updated to mockup-exact featured card values (radius `20px`, margin `20px 0`, title `26px/800`, accent `3px`, hover lift/shadow) |
| **28** | Featured card: footer elements on one line (nowrap) | ✅ Done | Re-verified 2026-04-26: footer uses `justify-content: space-between`, `flex-wrap: nowrap`, and responsive wrap below narrow widths |
| **29** | Cards taller; OPEN/FUTURE/CLOSED badges with distinct icons and solid colored backgrounds | ✅ Done | Re-verified (FB-004): card image area `height: 260px`, badge/prize/body/footer sizing matched mockup, CTA converted to themed pill button |
| **30** | "View Competition" in competition tab, "View Challenge" in challenge tab | ✅ Done | Re-reviewed 2026-04-26: reviewed CTA copy is `Apply Now`, with white text in non-featured card buttons across link states |
| **31** | Category priority with industry-specific pastel icon on each card | ✅ Done | Fixed 2026-04-26: cards now use the mockup's 12px card icon SVGs/colors instead of reusing filter icons |
| **32** | "Load More" button: smaller font, red icon, gray outline/font | ✅ Done | |
| **33** | "View Programs" button: white icon/text, red-orange gradient | ✅ Done | |
| **34** | Footer: aligned with homepage, "Subscribe on Substack" visible | ✅ Done | Re-reviewed 2026-04-26: interior footer now uses the white/black mockup treatment, red buttons with white text across link states, mockup sizing, divider, light WeChat popup, footer language menu opens upward, header language menu sits close to the globe trigger, newsletter input/button keep compact mockup computed styles, and all footer social icons use the muted mockup color despite generic interior link rules |
| **35** | Footer: remove gray divider line AND bottom note text | ✅ Done | Re-verified: legacy bottom note row removed and the gray divider is no longer rendered |
| **36** | Replace footer title with "NEWSLETTER" | ✅ Done | |
| **37** | Colored stripe bar at page bottom | ✅ Done | |

## NEWS & INSIGHTS

| # | Description | Status | Notes |
|---|---|---|---|
| **38** | Fonts in black, same size as Challenges page; red button text in white with dot | ✅ Done | |
| **39** | "REPORT" tag in red; other categories in gray | ✅ Done | Added gray muted-tag rule for `.news-card-tag--muted` |
| **40** | Bottom text in news cards 2pts smaller | ✅ Done | |
| **41** | "All News & Insights" button before footer | ✅ Done | |
| **42** | Subtitle balanced across two similar-length lines | ✅ Done | Added `text-wrap: balance` via `.page-subtitle--balanced` |
| **43** | Red dot next to "Latest", consistent pattern | ✅ Done | |

## DEEP DIVE — NEWS ARTICLE

| # | Description | Status | Notes |
|---|---|---|---|
| **44** | Meta (published/author/read time): 2pts smaller, gray, below title | ✅ Done | |
| **45** | Rename "Back to all insights" → "Back" | ✅ Done | |
| **46** | Remove subtitle below title | ✅ Done | |
| **47** | Photo insertion in article body | ⏳ Deferred | Future CMS functionality |
| **48** | "View all insights" → "View All", gray, 2pts smaller | ✅ Done | Added smaller gray muted-link rule for `.news-list-link--muted` |

## DEEP DIVE — COMPETITION DETAIL

| # | Description | Status | Notes |
|---|---|---|---|
| **49** | Remove eyebrow; back link: arrow, 2pts smaller, gray | ✅ Done | Added muted back-link styling for `news-back-link--muted` |
| **50** | Top focus area icons/tags | ✅ Done | |
| **51** | Remove "GTC" watermark | ✅ Done | |
| **52** | Wide photo placeholder | ✅ Done | Added visible placeholder block styling (`min-height`, border radius, background) |
| **53** | "Open Now" pulsing circle; compact apply button with white text | ✅ Done | |
| **54** | Reduce height of status/timeline/track/focus meta cards | ✅ Done | Reduced card padding for lighter, shorter meta cards |
| **55** | "View All" link back to competitions | ✅ Done | |
| **56** | Reduce drop shadow for whiter background | ✅ Done | Reduced shared competition detail card shadow intensity |

---

## Summary

| Status | Count | Items |
|---|---|---|
| ✅ Done | 52 | 1, 3–5, 7–15, 17–46, 48–56 |
| ⚠️ Partial / Needs attention | 0 | |
| ⏳ Waiting / Deferred | 3 | 2, 6, 47 |
| N/A | 1 | 16 |

## Implementation notes — 2026-04-27

- Missing static pages linked from the homepage, submenus, and interior shell are now generated from Keystatic-managed content: `/advisory/`, `/events/`, `/programs/`, `/network/`, and `/speakers/`.
- Current-status TODOs TODO-001 through TODO-012 are implemented and verified against the relevant mockups/routes. Production-visible competition fixtures are draft-filtered, competition ordering is date-backed, shared interior CTA/back-link regressions are fixed, pre-registration matches the approved generic/selected-competition flow, and mobile shell/control/logo issues are addressed.

## Visual verification list — 2026-04-27

- Competitions desktop
  Screenshot: `.opencode/feedback/2026-04-27-implementation/shots/competitions-desktop.png`
- Competitions mobile and opened interior mobile menu
  Screenshots: `.opencode/feedback/2026-04-27-implementation/shots/competitions-mobile.png`, `.opencode/feedback/2026-04-27-implementation/shots/competitions-mobile-menu.png`
- Pre-registration desktop and mobile
  Screenshots: `.opencode/feedback/2026-04-27-implementation/shots/pre-registration-desktop.png`, `.opencode/feedback/2026-04-27-implementation/shots/pre-registration-mobile.png`
- News article and competition detail desktop
  Screenshots: `.opencode/feedback/2026-04-27-implementation/shots/news-article-desktop.png`, `.opencode/feedback/2026-04-27-implementation/shots/competition-detail-desktop.png`
- Homepage mobile and language-switch check
  Screenshots: `.opencode/feedback/2026-04-27-implementation/shots/home-mobile.png`, `.opencode/feedback/2026-04-27-implementation/shots/home-mobile-cn.png`
- Interior language-switch check
  Screenshot: `.opencode/feedback/2026-04-27-implementation/shots/competitions-desktop-br.png`

## Visual verification list — 2026-04-28

- Batch A homepage desktop header, language menu closed/open/hover
  Screenshots: `.opencode/feedback/screenshots/batch-a-homepage-header-closed.png`, `.opencode/feedback/screenshots/batch-a-homepage-language-open.png`, `.opencode/feedback/screenshots/batch-a-homepage-language-hover.png`
- Batch B homepage desktop footer idle/input-focus/WeChat-popup
  Screenshots: `.opencode/feedback/screenshots/batch-b-homepage-footer-idle.png`, `.opencode/feedback/screenshots/batch-b-homepage-footer-input-focus.png`, `.opencode/feedback/screenshots/batch-b-homepage-footer-wechat-open.png`
- Batch E pre-registration default and selected competition application-mode states
  Screenshots: `.opencode/feedback/screenshots/batch-e-pre-registration-default.png`, `.opencode/feedback/screenshots/batch-e-pre-registration-selected.png`
- Batch F pre-registration form copy, controls, submit area, and BR language-switch spot check
  Screenshots: `.opencode/feedback/screenshots/batch-f-pre-registration-top.png`, `.opencode/feedback/screenshots/batch-f-pre-registration-section-1-radio.png`, `.opencode/feedback/screenshots/batch-f-pre-registration-section-3-ai-benefits.png`, `.opencode/feedback/screenshots/batch-f-pre-registration-submit.png`, `.opencode/feedback/screenshots/batch-f-pre-registration-br-guide.png`
- Batch D homepage competition menu, startup/corporate listing tabs, and challenge detail route
  Screenshots: `.opencode/feedback/screenshots/batch-d-homepage-competitions-menu.png`, `.opencode/feedback/screenshots/batch-d-competitions-startup-tab.png`, `.opencode/feedback/screenshots/batch-d-competitions-corporate-tab.png`, `.opencode/feedback/screenshots/batch-d-challenge-detail.png`
- Batch C static page anchor highlighting, dedicated speakers page, and contact target
  Screenshots: `.opencode/feedback/screenshots/batch-c-network-target-highlight.png`, `.opencode/feedback/screenshots/batch-c-speakers-page.png`, `.opencode/feedback/screenshots/batch-c-contact-target.png`
- Batch G mobile homepage competition status dots/transparent scroll header and news gradient cards
  Screenshots: `.opencode/feedback/screenshots/batch-g-mobile-competitions-scroll.png`, `.opencode/feedback/screenshots/batch-g-news-gradient-cards.png`
- Batch H competition/challenge detail redesign and white-page footer language switching
  Screenshots: `.opencode/feedback/screenshots/batch-h-competition-detail-top.png`, `.opencode/feedback/screenshots/batch-h-competition-detail-feature.png`, `.opencode/feedback/screenshots/batch-h-challenge-detail.png`, `.opencode/feedback/screenshots/batch-h-footer-language-br.png`
  Browser check: footer `BR` on a white challenge-detail page switched the footer subscribe label to `Assinar no Substack`, set `html[lang]` to `pt-BR`, and marked `BR` active.

## Visual verification list — 2026-04-01

- Homepage competitions mega menu hover height / white submenu treatment  
  Screenshot: `.opencode/feedback/2026-04-01/shots/home-hover-competitions.png`
- Interior competitions mega menu parity (two-card variant)  
  Screenshot: `.opencode/feedback/2026-04-01/shots/interior-hover-competitions.png`
- Competitions listing: `Featured Competition` label, `View Competition` / `View Challenge` CTA split, footer parity  
  Screenshot: `.opencode/feedback/2026-04-01/shots/competitions-current-final.png`
- News listing: balanced subtitle, gray non-report tags, footer parity  
  Screenshot: `.opencode/feedback/2026-04-01/shots/news-current-post.png`
- News article: muted `View All` link treatment  
  Screenshot: `.opencode/feedback/2026-04-01/shots/article-current-post.png`
- Competition detail: muted back link, hero placeholder, lighter meta/content cards  
  Screenshot: `.opencode/feedback/2026-04-01/shots/competition-detail-current-post.png`
- Interior footer WeChat treatment / QR hover parity  
  Screenshot: `.opencode/feedback/2026-04-01/shots/interior-footer-wechat-final.png`
- Browser language switching spot-checks  
  Screenshots: `.opencode/feedback/2026-04-01/shots/home-lang-cn.png`, `.opencode/feedback/2026-04-01/shots/competitions-lang-br.png`

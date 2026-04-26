# UI/UX Refinement Checklist — All 56 Items

## LANDING PAGE

| # | Description | Status | Notes |
|---|---|---|---|
| **1** | Nav layout: full width, 3-part split (logo \| centered nav \| switcher), logo & switcher same width | ✅ Done | Fixed: 3-part flex with `flex: 0 0 200px` on brand/lang, centered nav |
| **2** | Confirm Roboto is the font site-wide | ⏳ Pending | Roboto is base font; some sections use Outfit/DM Sans — leave for later review |
| **3** | Language switcher in gray, reduced font size | ✅ Done | |
| **4** | Language switcher: show selected lang, no menu resize on open; EN/中文/BR in red, hover shows full name in white | ✅ Done | Fixed: added `data-lang-active-code` span, labels always visible with opacity transition |
| **5** | Reduce mega submenu height by ~50px | ✅ Done  - Submenu content updates via keystatic pending | FB-006: Set `height: 260px`, padding `36px 58px 40px`, gap `48px` on `.site-mega-grid` to match mockup |
| **6** | Video: better resolution needed | ⏳ Waiting on user | User needs to provide a higher-res video file |
| **7** | "Accelerating Innovation" block lower, buttons at page bottom | ✅ Done | |
| **8** | Card stacking smoother, animated speed change | ✅ Done | |
| **9** | Competition area: red on left (Startup), blue on right (Corporate) | ✅ Done | Fixed: swapped themes in all 3 locale files |
| **10** | News cards: match design in mockup/news-card.png | ✅ Done | FB-001: Removed border/shadow/min-height, tightened gap to 14px, padding to 16px 16px 14px, flush accent stripe |
| **11** | Footer: match design in mockup/footer-index.png | ✅ Done | Fixed: social icon order (WeChat, Instagram, LinkedIn, WhatsApp), sizes, subscribe pill button |
| **12** | Footer: WhatsApp icon outlined, next to WeChat | ✅ Done | Fixed with item 11 |
| **13** | Footer: newsletter/social area positioning, button sizes | ✅ Done | Fixed with item 11 |
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
| **34** | Footer: aligned with homepage, "Subscribe on Substack" visible | ✅ Done | Re-reviewed 2026-04-26: interior footer now uses the white/black mockup treatment, red buttons with white text across link states, mockup sizing, divider, light WeChat popup, footer language menu opens upward, and header language menu sits close to the globe trigger |
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

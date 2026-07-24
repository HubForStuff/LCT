# July 16 2026 Customer Feedback — Design

Source: `July 16 2026 updates.docx` (customer meeting, 2026-07-16).
Mockup reference: `mockup/5 - events_v11.htm` (new).
Branch: `feedback/2026-07-16-updates`. One commit per area, squash-merge to `main`.

## Reading The Feedback

Two transcription notes that shape the work:

- **"bottom" means "button"** throughout. "Remove orange bottom" = remove the orange button; "Make registration bottom at the bottom of the page" = put the registration button at the page bottom. Confirmed by the Programs line, which swaps that same button's text to "Check Eligibility".
- The feedback is written **against mockups**, not against the deployed site — consistent with the `customer-feedback-loop` process in `AGENTS.md`. This matters for Events, which does not exist in code at all.

## Scope

Eight areas, all in one branch, landing in this order:

| Area | Nature | Size |
|---|---|---|
| A. Landing page | Remove stacked cards, add four section callouts | medium |
| B. Language selector | Converge two implementations into one | medium |
| C. Network | Fully unpublish | small |
| D. Advisory | Card restyle, header cleanup | small |
| E. Competition + Challenge detail | Card set, bottom button, centered View All | medium |
| F. Form | Benefit icons, white cards, footer cleanup | medium |
| G. Programs | Header cleanup, detail restyle, Check Eligibility | small |
| G2. Eligibility form | New lightweight program-qualification form + Apps Script routing | medium |
| H. Events | New feature: collection, list, detail, application form | large |

G depends on G2 (the Check Eligibility button needs somewhere to point). H depends on E (the events detail page reuses the competition detail template) and on G2 only for the `formType` routing added to `Code.gs` — the event application form is its own component, not a reuse of eligibility. A depends on C only insofar as both touch the index-based maps in `links.ts`; do them adjacently.

---

## A. Landing Page

**Files:** `src/components/home/DesktopHome.astro`, `MobileHome.astro`, `src/styles/homepage.css`, `src/content/homepage/locales/{en,br,cn}.json`, `src/lib/homepage/links.ts`

The three stacked cards (`categoryCards`) are Programs, Network, and Advisory, rendered with a scroll-driven stacking effect (~80 lines of inline script in `DesktopHome.astro`). The feedback's "Remove the stacked cards" and "Remove the three content Cards" are the same instruction stated twice.

**Remove:** the three `categoryCards`, the `desk-catblock*` markup, the stacking script, and the associated CSS.

**Add:** `src/components/home/SectionCallouts.astro` — four classic hero callouts, each with a Lucide icon, title, description, and a CTA button linking to its section:

| Callout | Target |
|---|---|
| Advisory | `/advisory/` |
| Competitions & Challenges | `/competitions/` |
| Events | `/events/` |
| Programs | `/programs/` |

Network is deliberately absent (see C).

Copy lives in `src/content/homepage/locales/{en,br,cn}.json` as a `sectionCallouts[]` array so it stays Keystatic-managed and localized, wired with `data-i18n` per the i18n contract. Andre will supply final copy; ship reasonable interim text in the same shape so the swap is content-only.

## B. Language Selector

**Files:** `src/components/site/LanguageSwitcher.astro`, `src/components/home/DesktopNavigation.astro`, `DesktopFooter.astro`, `MobileHome.astro`, `src/styles/{homepage,interior-pages}.css`

There are two parallel implementations today: `.site-lang` (the shared `site/LanguageSwitcher.astro`, used by interior header/footer) and `.desk-lang` (hand-rolled in the homepage nav/footer). That duplication is the root cause of the inconsistency the customer saw — "black and white site versions" are the dark homepage versus the light interior pages.

**Converge the homepage onto the shared `site/LanguageSwitcher.astro`**, which `AGENTS.md` already mandates. This makes "same icon, same size, same format" true by construction rather than by keeping two CSS blocks in sync. Add a `tone` prop (`dark` | `light`) for the two site versions; the globe SVG and its box size stay identical across both.

Then:

- **Fixed width** on the switcher button and menu, independent of the selected language. Today the active code (EN/BR/CN) and label widths shift the control. Set an explicit width sized to the widest option, in both header and footer.
- **Remove the selected-language highlight**: drop the `is-active` background/color treatment on `.site-lang-option` (and the `.desk-lang-option` equivalent as it is retired).

Risk: the homepage is explicitly protected by `AGENTS.md` ("do not rewrite the homepage architecture"). This is a targeted swap of one control, not an architecture change, and it reduces duplication rather than adding it. Verify homepage and interior alignment visually before claiming done.

## C. Network — Fully Unpublish

**Files:** `src/pages/network/*.astro`, `src/lib/homepage/links.ts`, `src/content/homepage/locales/*.json`, `src/content/static-pages/network.json`

Temporary, and reversible by design.

- **Delete the routes** `src/pages/network/city-partnerships.astro` and `src/pages/network/featured-speakers.astro`, and stop emitting the `/network/` static page, so all three URLs 404.
- **Remove every link**: the Network mega-menu section (`desktopMenuSections`, `mobileMenuSections` in all three locales), the footer column entries, and the `HOMEPAGE_ROUTE_TARGETS.network` targets.
- **Keep** `src/components/network/`, `src/lib/network/`, `src/content/network/`, `src/content/speakers/`, and `src/content/static-pages/network.json` untouched, so re-enabling is a route + link change only.

**Hazard:** `src/lib/homepage/links.ts` uses **index-based** maps (`getCategoryCardHref`, `4: network`, `3: [network]`). Removing entries shifts indices and can silently mis-wire unrelated links. The `categoryCards` those indices serve are being removed in A anyway, so both changes must be reasoned about together.

**Test:** assert the build emits no `/network/` routes and that no emitted page links to `/network/`.

## D. Advisory

**Files:** `src/components/advisory/AdvisoryCards.astro`, `src/styles/interior-pages.css`

- Cards: remove the gradient background (`linear-gradient(#fff,#fff) padding-box, linear-gradient(155deg, ...) border-box` at `interior-pages.css:1013` and `:1024`) in favour of a plain white background.
- Border: light gray, matching the horizontal divider rendered below the cards. Read the divider's actual color from CSS and reuse the same token — do not approximate.
- Corner radius: match the Competition card (`.ccard`) radius exactly.
- Page header: remove the text below the title (`page.summary`) and the right-side text (the `page-header-inner--split` right column).

## E. Competition + Challenge Detail

**Files:** `src/components/competitions/CompetitionDetailPage.astro`, `src/lib/competitions/{schema,types}.ts`, `src/content/interior-pages/locales/*.json`, `src/styles/interior-pages.css`

`src/pages/challenges/[slug].astro` already imports `CompetitionDetailPage`, so **both routes share one template** and every change here lands for competitions and challenges simultaneously. This answers the customer's "Confirm this also is seen in both Competitions and Challenges" — it is structurally guaranteed, and the verification step must show both.

The `Challenges` section's "Use the same card layout and styling as the Competition detail page" is therefore satisfied by construction; verify rather than implement.

**Current meta grid:** Status / Deadline / Focus / Register (orange card, holds award value + button).

**New meta grid:**

| Position | Card |
|---|---|
| 1 | Total Award + award value (e.g. "150,000 RMB") |
| 2 | Timeline |
| 3 | Focus |
| 4 | Status |

- Remove `page.detailSubtitle` below the title.
- Remove the orange `competition-register-card` entirely, along with its orange styling.
- The award value already exists as `page.value`; the label needs a new `detailPage.totalAwardLabel` i18n key in all three locales. `detailPage.registrationLabel` becomes unused.
- **Bottom action area:** a centered row at the end of the page holding a primary **Register Now** button (`page.applicationHref`) and the **View All** link. The View All link is centered per the feedback.

## F. Form

**Files:** `src/components/pre-registration/PreRegistrationPage.astro`, `src/lib/interior-pages/types.ts`, `src/content/interior-pages/locales/{en,br,cn}.json`, `src/styles/interior-pages.css`

Under "What do you expect to receive?" there are 12 benefit checkboxes. Each currently renders a two-letter initial (`short`: PD, TS, BT, LG, HF, FA, VC, IM, SM, EX, PT, BR) in one of four tones (blue, green, sand, lilac).

- **Replace initials with icons.** `BenefitOption.short` becomes `BenefitOption.icon`, holding a Lucide icon name; update all three locale files. Keep the existing four tones — they are already the site palette and already match the challenges list's color language.
- **White card backgrounds** on the benefit cards.
- **Hover changes only the border.** No background, shadow, or transform change on hover.
- **Remove the gray placeholder background.**
- **Bottom confirmation area** (the "By submitting, you confirm that the information is accurate and agree to…" block) gets a **narrower width** than the default section width. It does not need to match the site's standard content width; it is currently too wide.
- **Drafts note:** remove "Drafts are saved in this browser only (files aren't saved)" from its current position and re-place it as small grey text directly under the Save button.

## G. Programs

**Files:** `src/components/programs/ProgramDetailPage.astro`, `ProgramTabs.astro`, `src/components/static-pages/StaticPage.astro`, `src/content/static-pages/programs.json`

**Programs list:** remove the description below the title and the right-side header text — the same header cleanup as D.

**Program detail:**

- Adopt the Competition detail style (E), so the two detail templates read as one family.
- **No Award card** — cost is not displayed. The meta grid is Timeline / Focus / Status.
- The bottom button reads **Check Eligibility** (not "Register Now") and links to the new eligibility form, carrying the program slug.

## G2. Eligibility Form (new)

**Files:** `src/pages/eligibility.astro`, `src/components/eligibility/EligibilityPage.astro`, `src/lib/eligibility/*`, `scripts/apps-script/Code.gs`

A separate lightweight form, not a mode of the 4-section / ~34-field pre-registration form.

**This form is program-qualification only.** It is unrelated to event submission and unrelated to event application — see the "Three Forms" note below. It is reached from the Programs detail page's Check Eligibility button.

**Fields (minimal, one screen, no uploads):**

| Field | Notes |
|---|---|
| Program | Pre-filled from the program slug in the link |
| Name | required |
| Email | required |
| Company | required |
| Short message | textarea |

**Submission** reuses the existing Apps Script deployment and `PUBLIC_PREREG_SCRIPT_URL` rather than adding a second backend. `Code.gs` gains a `formType` field that routes to a sheet by name:

- `formType: "pre-registration"` → `Submissions` sheet, `PRE_REGISTRATION_SHEET_COLUMNS`
- `formType: "eligibility"` → `Eligibility` sheet, `ELIGIBILITY_SHEET_COLUMNS`
- `formType: "event-application"` → `Event Applications` sheet, `EVENT_APPLICATION_SHEET_COLUMNS` (see H)

Absent or unknown `formType` defaults to `pre-registration`, preserving current behaviour. Routing by `formType` is a backend detail and does **not** imply the forms share a component — they do not.

`src/lib/eligibility/sheet-columns.ts` declares the canonical column order, mirrored in `Code.gs` and asserted by a build test — the same contract `tests/pre-registration-form.test.mjs` already enforces for pre-registration.

**Known dependency:** `Code.gs` is not yet deployed and `PUBLIC_PREREG_SCRIPT_URL` is not yet set. The eligibility form inherits that gap: it will be code-complete but not live until the script is deployed. This is a pre-existing condition, not introduced here.

## Three Forms, Not One

The feedback and mockup imply three distinct submissions. They are easy to conflate because their minimal field sets look alike. They are **not** the same form and do not share a component:

| Form | Who fills it | Entry point | Status |
|---|---|---|---|
| Check Eligibility | A company asking whether it qualifies for a **program** | Programs detail page | In scope (G2) |
| Event application | Someone applying to **attend/join an event** | Events detail page | In scope (H) |
| Submit your event | An **organizer listing their event** on the site | "List Your Event" panel on the events list | **Out of scope** |

Each in-scope form gets its own component, its own route, its own column set, and its own sheet tab. They share only the Apps Script endpoint, discriminated by `formType`. The field sets are near-identical today; separate implementations let them diverge without a rename or a migration, which is the likelier future given they answer different questions.

"Submit your event" is not mentioned anywhere in the July 16 feedback, and every CTA in the mockup — Join, Book a Booth, List Your Event, Submit your event — is an `href="#"` placeholder with no defined destination. Build the panel visually as the mockup shows it and point it at the existing contact modal. Do not invent a third form or a third sheet. Flag it for Andre.

## H. Events (new feature)

**Mockup:** `mockup/5 - events_v11.htm`
**Files:** `src/content/events/*.json`, `src/lib/events/{reader,schema,types}.ts`, `src/pages/events/index.astro`, `src/pages/events/[slug].astro`, `src/components/events/*`, `src/content/config.ts`

Events does not exist in code today. `/events/` is a plain static page (`src/content/static-pages/events.json`) rendering three prose sections. The customer's Events feedback is written against the v11 mockup.

**The mockup reuses the Competitions list's class names verbatim** — `ccard`, `ccard-apply`, `ccard-badge`, `badge-open`, `badge-upcoming`, `comp-grid`, `filter-pill`, `month-sep`. This is deliberate: the events list is the competitions list with events data. Reuse `CompetitionsPage.astro`'s existing machinery (filters bar, filter pills, sort select, tabs with counts, card grid, load-more) rather than building a parallel implementation. Extract shared pieces into components where the two genuinely diverge; do not fork the file.

**Content collection** — 21 events across two categories, following the established data-driven pattern (`src/content/competitions/*.json` + `src/lib/competitions/reader.ts`):

> **Correction, 2026-07-23:** the "21" above was read off the mockup's hardcoded, stale tab-count badges — the mockup markup itself actually holds 24 event cards. **The mockup is UI/UX guidance only; its event cards are demo fixtures, not a content source.** The shipped collection is a 25-entry seed set (14 trade fairs + 11 summits — one more "past"-status summit than the mockup has, added so the Past filter has something to match), entered through Keystatic and replaced wholesale by Andre's real calendar before production. Do not re-derive an event count from the mockup file; treat `src/content/events/*.json` (or `npm run keystatic` / the CMS) as the only source of truth for counts.

- Category: `trade-fair` (12) or `summit` (9); plus a `LATAM CHINA TECH Event` type
- `status`: `open` | `upcoming` | `past`
- Date range, 3-letter code badge (AGR, MIN, SRC…), title, description, city
- `region` (China / LATAM) and `location` (city), `industry`
- `flagship: boolean` — the "· Flagship" modifier (AGX, SMT)
- CTA: `Join`, and `Book a Booth` on some events

**List page (`/events/`):**

- **No featured/highlighted block.** The Competitions list has one (`featured-accent`, `featured-visual`); the events mockup has none. This is the feedback's "Remove the highlighted event" — do not carry the featured block over. Flagship events keep their "· Flagship" label.
- **Larger cards and larger fonts** than the competitions cards, per the feedback ("similar to the Challenge page cards").
- Two tabs with counts: Trade Fairs & Expos (12), Conferences & Summits (9).
- Filters: Status (All/Open/Upcoming/Past), Region (All/China/LATAM, with nested locations), Industry (16 options). Sort: Date (nearest) / Region.
- Month separators grouping cards (January 2026, February 2026, …).
- "More Q2 2026" load-more, and a "List Your Event / Submit your event →" panel that points at the existing contact modal (out of scope as a form — see "Three Forms, Not One").
- **The whole card is a link to the detail page**, and the **Join button also opens the detail page** — not an external or modal target. Both per the feedback.

**Detail page (`/events/[slug]`):** no mockup exists. Per `AGENTS.md`, use design judgment and match the established visual language — specifically, the Competition detail template from E (meta grid, bottom action button, centered View All), so the site reads as one family.

**Application page (`/events/[slug]/apply` or `/event-application?event=<slug>`):** a simplified application form "similar to the Competition application page with key information". Its **own** component, route, and column set — not a mode of the eligibility form.

**Fields (minimal, one screen, no uploads):**

| Field | Notes |
|---|---|
| Event | Pre-filled from the event slug in the link |
| Name | required |
| Email | required |
| Company | required |
| Short message | textarea |

`src/lib/event-application/sheet-columns.ts` declares the canonical column order, mirrored in `Code.gs` under `formType: "event-application"` → `Event Applications` sheet, and asserted by a build test.

The list page replaces the current `/events/` static page; `src/content/static-pages/events.json` and its three prose sections are retired.

---

## Architecture Notes

- Route files in `src/pages` stay thin: load data, compose a component. All new UI lands in `src/components/`, styling in `src/styles/`.
- New collections follow the existing reader/schema/types split under `src/lib/<domain>/`, matching `competitions` and `advisory`.
- All new copy ships in the `localized-content` payload with `data-i18n` hooks, in `en`/`br`/`cn`. No hardcoded single-language strings in components.
- Icons: Lucide (ISC), inlined as SVG paths in a small shared `Icon.astro`. No new package dependency and no CDN — the site is static and the existing icons are all hand-inlined stroke SVGs (`fill="none"`, stroke-width 1.2–1.5), which Lucide matches.

## Verification

Per `AGENTS.md`, for each area:

1. `npm test` and `npm run build`.
2. Screenshots of every affected page — code inspection alone is not sufficient.
3. Language switching verified on the homepage and at least one interior page (B touches shared shell, so this is mandatory).
4. E must be shown on **both** a competition and a challenge detail page.
5. New build-and-assert tests: no `/network/` routes or links (C); eligibility column order matches `Code.gs` (G2); events collection loads and the list renders all 21 (H).

Update `CHECKLIST.md` to reflect actual state when done.

## Open Questions

- **Andre's landing copy** has not arrived. A ships with interim text in the final content shape; the swap is content-only.
- **"Same colors as the Challenges list"** (F): the challenges list uses only two accents (`cool`, `warm`), while the benefit icons use four tones. Read as "keep them colorful in the site palette"; keeping the existing four tones is the interpretation here.
- **"Book a Booth"** (H) — **resolved 2026-07-23:** appears on two flagship events (AGX, CNT) in the mockup with an `href="#"` placeholder; the feedback does not mention it. Confirmed by the user: it points at the existing contact modal, same as "List Your Event". Andre may still override.
- **"Submit your event" / "List Your Event"** (H) — **resolved 2026-07-23:** in the mockup, absent from the feedback, no destination defined. Confirmed by the user: rendered as a panel pointing at the contact modal; no organizer submission form is built. Andre may still override.
- **Event application entry point** (H) — **resolved 2026-07-23:** the feedback says the Join button opens the *detail* page, so the application form is reached from the detail page rather than from the list (list → detail → apply). Confirmed by the user that the customer expects that second hop. Andre may still override.

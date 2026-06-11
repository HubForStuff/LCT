# Contact Form Modal (3rd-party email submission)

**Date:** 2026-06-11

## Goal

A site-wide accessible contact **modal** with a simple "send us a message" form
that submits to a 3rd-party form backend (**Web3Forms**) which emails the
submission to the team's inbox. No backend is added — the site stays a static
GitHub Pages build; submission is a client-side `fetch` POST. Bot protection via
a honeypot (always on) plus optional invisible hCaptcha.

## Constraints / context

- Site is `output: "static"`, deployed to GitHub Pages — **no server / serverless**.
  Submission must be a client-side POST to a hosted form backend.
- Both the homepage (`src/pages/index.astro`) and all interior pages render through
  `src/layouts/Layout.astro`, so a modal injected there is global on every page.
- `#contact` is the existing universal contact target: mega-menu note links,
  advisory "Book a strategy call" card, network/other CTAs, and the interior
  footer anchor (`InteriorFooter` has `<span id="contact">`). Trigger = intercept
  clicks on `a[href$="#contact"]`.
- Site language is EN/BR/CN; active language is stored in
  `localStorage.preferredLanguage` (managed by `LocalizationClient`).
- The pre-registration form is **out of scope** (separate future task → Google
  Sheets); nothing here should block it. Provider is chosen for contact only.

## Provider: Web3Forms

- Free tier 250 submissions/mo, no account lock-in, **public access key** (safe to
  ship in a static build), JSON AJAX endpoint `https://api.web3forms.com/submit`,
  built-in honeypot + optional hCaptcha, emails to the configured inbox.
- Submission is wrapped in a thin **adapter** so the provider/endpoint/key is a
  single config change later (and doesn't constrain pre-reg's future provider).

## Architecture

### Files

- `src/lib/contact/config.ts` — provider config:
  - `CONTACT_ENDPOINT = "https://api.web3forms.com/submit"`
  - `CONTACT_ACCESS_KEY = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY ?? "REPLACE_WITH_WEB3FORMS_ACCESS_KEY"`
  - `HCAPTCHA_SITE_KEY = import.meta.env.PUBLIC_HCAPTCHA_SITE_KEY ?? ""` (empty ⇒ hCaptcha disabled)
- `src/lib/contact/submit.ts` — the swappable adapter:
  - `submitContact(payload): Promise<{ ok: boolean; error?: string }>` — POSTs JSON
    (`Content-Type`/`Accept: application/json`) to `CONTACT_ENDPOINT`, returns
    `{ ok: true }` when the provider responds `success: true`, otherwise
    `{ ok: false, error }`. Catches network/timeout errors. No DOM access — pure
    function, unit-testable by mocking `fetch`.
- `src/lib/contact/i18n.ts` — `CONTACT_COPY: Record<"EN"|"BR"|"CN", ContactCopy>`
  with all modal strings (title, intro, field labels, placeholders, submit label,
  sending/success/error messages, close label, privacy note). One source of truth,
  serialized into the modal's i18n island.
- `src/components/contact/ContactModal.astro` — the modal markup + i18n island +
  client `<script>` (open/close/trigger/i18n/submit behavior).
- `src/styles/contact.css` — modal styling (reuses existing design tokens and
  `site-btn site-btn--primary`).
- `src/layouts/Layout.astro` — import + render `<ContactModal />` once (global) and
  import `contact.css`.

### Modal markup (accessible dialog)

- Overlay `div` + dialog container: `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby` (title id), hidden by default (`hidden` / `is-open` class).
- Close button (`aria-label`, localized), Esc-to-close, overlay-click-to-close,
  body scroll lock while open, focus moved into the dialog on open and **returned
  to the triggering element** on close, basic focus trap (Tab cycles within dialog).
- Form fields (all localized labels/placeholders via `data-contact-i18n*` hooks):
  - `name` (text, required)
  - `email` (email, required, browser + JS validation)
  - `company` (text, optional)
  - `message` (textarea, required)
  - Hidden: `access_key` (= `CONTACT_ACCESS_KEY`), `subject`
    (e.g. `"New contact request — LATAM China Tech"`), `from_name` (set on submit to
    the submitter's entered name, so the notification email shows who it's from), and
    `context` (auto-filled on open with the source page path + the trigger CTA text).
  - Honeypot: hidden `botcheck` checkbox (Web3Forms convention) — kept off-screen,
    never shown; if checked on submit, the request is dropped client-side and the
    provider also rejects it.
  - If `HCAPTCHA_SITE_KEY` is non-empty: render the invisible hCaptcha widget and
    include its token in the payload; if empty, hCaptcha is omitted entirely.

### Trigger wiring (global)

A delegated listener (in the modal's script) catches clicks on `a[href$="#contact"]`
anywhere in the document: `preventDefault`, set `context` to
`location.pathname + " — " + triggerText`, open the modal, focus the first field.
The footer `id="contact"` anchor remains as a no-JS fallback target.

### Submission flow

1. On `submit`: `preventDefault`; run client validation (required + email format);
   if invalid, show inline field errors and stop.
2. If honeypot filled → silently treat as success (drop) to not tip off bots.
3. Disable submit, swap label to the localized "Sending…" state.
4. Build payload `{ access_key, subject, from_name, name, email, company, message,
   context, botcheck, [h-captcha-response] }` and call `submitContact`.
5. On `{ ok: true }`: show inline success panel (localized "Thanks, we'll be in
   touch"), reset the form. On `{ ok: false }`: show inline error (localized) with a
   retry affordance; re-enable submit. No page navigation occurs.

### Localization (self-contained)

- The modal embeds `<script type="application/json" id="contact-i18n">` with
  `CONTACT_COPY` (EN/BR/CN). A small script applies the active locale to all
  `data-contact-i18n` (textContent) and `data-contact-i18n-placeholder` elements on
  load, reading `localStorage.preferredLanguage` (default `EN`), and re-applies when
  the language changes (listening on `[data-lang-option]` clicks — the same controls
  `LocalizationClient` uses). This keeps the modal fully self-contained, identical on
  every page, with **zero per-page reader changes**.

## Configuration & setup

- Build embeds `PUBLIC_WEB3FORMS_ACCESS_KEY` (public-safe). Until set, the placeholder
  builds fine and the UI works, but live submissions need the real key.
- Setup doc (README or `docs/`): create a Web3Forms access key for the destination
  inbox; set `PUBLIC_WEB3FORMS_ACCESS_KEY` in the build environment (and optionally
  `PUBLIC_HCAPTCHA_SITE_KEY` to enable hCaptcha).
- `.env.example` documents both variables.

## Error handling

- Network failure / non-2xx / `success:false` → localized inline error, submit
  re-enabled, no data loss (field values preserved).
- Missing access key (placeholder) → submission will fail at the provider; the UI
  still shows the localized error rather than crashing.
- hCaptcha disabled when no site key — never blocks submission.

## Testing

- **Adapter unit test** (`node --test`): mock `globalThis.fetch`; assert
  `submitContact` POSTs JSON to `CONTACT_ENDPOINT` with the access key + fields,
  returns `{ ok: true }` on `success:true`, `{ ok: false }` on `success:false` and on
  a thrown/network error. No live API call.
- **Build-and-assert** (extends the existing interior-pages test style): build the
  site, then on a homepage and an interior page assert the modal is present
  (`role="dialog"`), the required fields (`name`/`email`/`message`) + honeypot
  (`botcheck`) + hidden `access_key` exist, the `a[href$="#contact"]` trigger script
  is shipped, and the i18n island JSON includes EN/BR/CN keys.
- Existing suite stays green.

## Out of scope

- The pre-registration form and any Google Sheets routing (separate future task).
- A submissions dashboard / archive (Web3Forms free is email-only).
- Auto-responder emails to the submitter (provider feature; can be enabled later).
- Real hCaptcha keys/turn-on (built in but disabled until a site key is provided).

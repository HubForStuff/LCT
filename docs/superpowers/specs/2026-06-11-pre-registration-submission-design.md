# Pre-Registration Form Submission — Design

**Date:** 2026-06-11
**Status:** Approved (design); pending implementation plan
**Branch:** `feat/pre-registration-submission`

## Problem

`src/components/pre-registration/PreRegistrationPage.astro` renders a complete,
4-section pre-registration form with all fields present, but it is a **non-functional
placeholder**: the `<form>` has `method="post"` with no `action` and no submit handler.
Submissions go nowhere.

We need to wire the form so submissions land **directly in a Google Spreadsheet**,
including the two file-upload fields (pitch deck + supplementary materials).

## Constraints

- The site is **Astro `output: "static"` on GitHub Pages** — no backend, no serverless
  (see memory `static-deploy-and-form-backends`). Every form must submit **client-side**
  to a hosted third party. We will **not** convert to Next.js or add a Vercel runtime.
- Data must land **in Google Sheets**, directly or trivially importable.
- Files (Google Sheets can't store them) must be saved somewhere with a link written
  into the sheet row.
- Follow existing patterns: the contact form's swappable adapter
  (`src/lib/contact/config.ts` placeholder key + pure `submit.mjs` + client wiring with
  honeypot + pending/success/error states) is the template.

## Chosen approach: Google Apps Script Web App (direct, free)

A **Google Apps Script Web App**, bound to the destination spreadsheet, deployed with
"Execute as me" / "Who has access: Anyone". The form POSTs **`FormData`** directly to the
script's `/exec` URL. The script appends a row to the sheet and saves uploaded files to a
Drive folder, writing the shareable links into the row.

**Why Apps Script over Web3Forms/Formspree:** it is free, requires no monthly plan for
files or Sheets sync, and lands data *literally in Google Sheets* — the user's first-choice
requirement. Web3Forms (the contact form's provider) would need a paid plan for **both**
file uploads and Sheets sync, and only reaches Sheets indirectly.

### Why `FormData` (not JSON)

Apps Script Web Apps respond to a POST with a 302 redirect to
`script.googleusercontent.com`, which serves the real response with permissive CORS
headers. `fetch` follows that redirect automatically **only if no CORS preflight blocks
the request**. `multipart/form-data` is a CORS-safe-listed content type → **no preflight**
→ the redirect is followed and we can read the JSON `{ ok }` response. Sending
`application/json` would trigger a preflight `OPTIONS` that Apps Script does not answer
correctly, breaking the read. Therefore the adapter sends `FormData`.

### File handling

A public static page cannot do an authenticated resumable Drive upload, so files ride
inside the POST as **base64 text fields**:

- Client reads each file, base64-encodes it, and appends it (plus filename + mime) to the
  `FormData`.
- Apps Script `doPost` decodes (`Utilities.base64Decode`) → `DriveApp` folder →
  shareable link, written into the sheet row.

**Size limits.** Apps Script caps a POST at ~50MB and base64 inflates ~33%. We enforce
**client-side** caps before encoding:

- **20MB per file** (`deckFile` and each `suppFile`).
- A **total-payload cap (~35MB)** to stay under the Apps Script limit when multiple files
  are present.
- Over-limit files produce an inline validation error and block submission.

**The pitch deck (the hard one).** Media-heavy `.pptx` decks routinely exceed 20MB. To
guarantee no applicant is hard-blocked, we add **one optional URL field** next to the deck
uploader: *"Deck over 20MB? Paste a Google Drive / Dropbox link instead."* The sheet stores
either the uploaded-to-Drive link (file path) or the pasted link (link path) in the deck
column. Applicants are also nudged that **exporting to PDF** (already an accepted type)
produces a much smaller file.

## Form structure changes (harvested from `feature/vercel-blob-google-sheets-form`)

The prior session's `feature/vercel-blob-google-sheets-form` branch took a Vercel-runtime
direction we are **not** adopting, but it restructured the form's UI in ways we **are**
keeping. We replicate these changes manually on the new branch (cleaner than untangling the
branch's server commits):

1. **Remove the per-field "Write with AI" buttons** (`.ai-btn`) from every textarea/input.
2. **Move the pitch deck (`deckFile`) up into Section 1**, right after the project
   introduction.
3. **Add a single AI panel under the deck**, gated behind
   `import.meta.env.PUBLIC_ENABLE_AI_ASSISTANCE === "true"`. With the flag unset (default),
   the panel is **not rendered** and the button stays `disabled`. It exists in markup for a
   future AI-assistance session; **no AI backend is built now**.

## Save Draft → local browser

Wire the existing "Save draft" button to **`localStorage`**:

- On click, serialize all text/select/checkbox/radio values to a per-page `localStorage`
  key; show a transient *"Draft saved ✓ {time}"* confirmation.
- On page load, restore saved values into the form.
- **Files cannot be persisted** — a hint under the button states *"Drafts are saved in this
  browser only (files aren't saved)."*
- Clear the saved draft on successful submission.

## Components & data flow

```
PreRegistrationPage.astro (<script>)
  ├─ on submit: preventDefault
  ├─ validate required fields  ──────────────► inline validation message
  ├─ files.mjs: validateSizes() + toBase64()  ─► inline file-too-large error
  ├─ assemble FormData:
  │     named fields + benefits[] + base64 files + filenames + deckLink + honeypot
  ├─ submit.mjs: submitPreRegistration(endpoint, formData)
  │     POST FormData ──► Apps Script /exec ──► doPost:
  │                                               decode files → Drive folder → links
  │                                               appendRow(sheet-columns order)
  │                                               return { ok: true }
  └─ states: pending → success (swap form for thank-you panel) | error
```

### New / changed files

| File | Purpose |
|------|---------|
| `src/lib/pre-registration/config.ts` | `PREREG_ENDPOINT` from `PUBLIC_PREREG_SCRIPT_URL ?? "REPLACE_WITH_APPS_SCRIPT_URL"` |
| `src/lib/pre-registration/submit.mjs` | Pure adapter: POST `FormData`, read `{ ok }`, map errors |
| `src/lib/pre-registration/files.mjs` | Pure size validation (20MB/file, ~35MB total) + base64 encode |
| `src/lib/pre-registration/sheet-columns.ts` | Canonical column header order + row builder (adapted from branch; Drive-link columns replace Blob-pathname columns; AI-warning/consent columns dropped) |
| `src/components/pre-registration/PreRegistrationPage.astro` | Form restructure (deck → §1, AI buttons removed, gated AI panel), submit wiring, save-draft wiring, deck-link field |
| `scripts/apps-script/Code.gs` | Apps Script `doPost`: decode files → Drive, append row; returns JSON |
| `scripts/apps-script/README.md` | Setup: bind to sheet, deploy as Web App, copy `/exec` URL into build env |
| `src/content/interior-pages/locales/{en,br,cn}.json` | Harvest `submission.*`, `aiAssistance.*`, `competitionTrackLabels`; add save-draft hint/confirmation copy |
| `src/lib/interior-pages/types.ts` | Types for the new copy keys |

## Configuration

- `PUBLIC_PREREG_SCRIPT_URL` — the Apps Script `/exec` URL. Placeholder default
  `REPLACE_WITH_APPS_SCRIPT_URL`; set in the build env before production deploy (same model
  as `PUBLIC_WEB3FORMS_ACCESS_KEY`). Until set, the form renders and validates but live
  submissions show the error state.
- `PUBLIC_ENABLE_AI_ASSISTANCE` — unset/false hides the AI panel (default). Out of scope to
  wire this session.

## Sheet columns (adapted)

Reuse the branch's `PRE_REGISTRATION_SHEET_COLUMNS` ordering, with these adaptations for
the Apps Script / Drive model:

- Replace `Pitch Deck Blob Pathname` / `Pitch Deck Download Link` →
  **`Pitch Deck Link`** (Drive link or pasted deck link).
- Replace `Supplementary Blob Pathnames` / `Supplementary Download Links` →
  **`Supplementary Links`** (newline-joined Drive links).
- Drop `AI Assistance Used`, `AI Warnings`, `Consent AI Disclosure`,
  `Consent Submit Terms` (not collected this session).
- Keep `Submitted At`, `Submission ID`, `Language`, competition fields, all applicant /
  project fields, `Hear About`, `Expansion Plan`, `Incorporation Timeline`,
  `User Agent`, `Referrer`, `Raw JSON`.

The row order is the single source of truth shared between `sheet-columns.ts` (asserted in a
unit test) and `Code.gs` (which writes the header row on first run and appends in this
order).

## Error handling

- **Validation** (missing required fields / no deck and no deck-link): inline message from
  `submission.validationMessage`; no network call.
- **File too large**: inline message naming the offending file and the 20MB cap; suggests
  the deck-link field / PDF export.
- **Network / non-OK / `{ ok:false }`**: error state from `submission.errorMessage`; the
  form stays populated so the user can retry.
- **Honeypot** (`botcheck` filled): silently treat as success, do not submit.
- **Success**: swap the form for a thank-you panel (`submission.successMessage`) and clear
  the saved draft.

## Testing

- **Unit (`node --test`):**
  - `submit.mjs`: success (`{ ok:true }`), non-OK status, `{ ok:false }`, thrown/network
    error — via injected `fetchImpl`; assert it sends `FormData`.
  - `files.mjs`: under/over per-file cap, over total cap, base64 round-trip on a small blob.
  - `sheet-columns.ts`: row builder maps fields to the expected column order/length.
- **Build-and-assert (`buildSite()` helper):** the rendered page wires the honeypot input,
  the `PUBLIC_PREREG_SCRIPT_URL` placeholder, a submit handler; the deck input is in
  Section 1; the AI panel is absent when `PUBLIC_ENABLE_AI_ASSISTANCE` is unset; the
  save-draft hint is present.
- Localization browser test may be flaky on "Timed out waiting for local server" — re-run
  once (per `codebase-conventions`).

## Out of scope

- AI form assistance (panel stays gated/hidden; no backend).
- Server-side virus scanning / file re-validation.
- Multi-step draft sync across devices (drafts are local-browser only).
- Setting the real `PUBLIC_PREREG_SCRIPT_URL` (user deploys the Apps Script and provides
  the URL).
</content>
</invoke>

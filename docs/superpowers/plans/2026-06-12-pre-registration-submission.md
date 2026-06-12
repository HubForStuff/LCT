# Pre-Registration Form Submission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the placeholder pre-registration form to submit directly into a Google Spreadsheet via a Google Apps Script Web App, including base64 file uploads to Drive, with local-browser draft saving and the AI-assist panel hidden behind a flag.

**Architecture:** Static Astro site (GitHub Pages, no backend). The form POSTs `FormData` client-side to a Google Apps Script `/exec` endpoint. The script decodes base64 files into a Drive folder and appends a row to the bound sheet. A pure, DOM-free submit adapter and pure file/size helpers keep logic unit-testable; the Astro component holds the wiring. Mirrors the existing contact-form adapter pattern (`src/lib/contact/*`).

**Tech Stack:** Astro (static), vanilla TS/JS client `<script>`, `node --test` (build-and-assert + pure-unit), Google Apps Script (`Code.gs`).

**Reference branch:** `feature/vercel-blob-google-sheets-form` contains a prior (rejected) Vercel-runtime version. We harvest **only** its localized copy, form restructure, and column ordering — never its server/Blob/Sheets-API code. Read it via `git show feature/vercel-blob-google-sheets-form:<path>`.

**Spec:** `docs/superpowers/specs/2026-06-11-pre-registration-submission-design.md`

**Conventions reminder:** Tests are `npm test` = `node --test --test-concurrency=1` over `tests/*.test.mjs` (build-and-assert style via a `buildSite()` helper). Git author is **Ash** — commit with `-c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com"` and **no** Claude trailer. Ignore the known baseline LSP diagnostics listed in memory `codebase-conventions` (e.g. `Cannot find name 'process'`, `astro:content` module, `import.meta.env` typing).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/lib/pre-registration/config.ts` | Endpoint + flags from `import.meta.env` with safe placeholder defaults |
| `src/lib/pre-registration/files.mjs` | Pure: per-file/total size validation + base64 encoding |
| `src/lib/pre-registration/submit.mjs` | Pure: POST `FormData` to Apps Script, normalize `{ ok, error }` |
| `src/lib/pre-registration/sheet-columns.ts` | Canonical column header order (documentation + sync-guard test) |
| `scripts/apps-script/Code.gs` | Apps Script `doPost`: decode files → Drive, append row |
| `scripts/apps-script/README.md` | One-time deploy instructions |
| `src/lib/interior-pages/types.ts` | Add `submission`, `aiAssistance`, `competitionTrackLabels`, `saveDraft` copy types |
| `src/content/interior-pages/locales/{en,br,cn}.json` | Harvested + new copy |
| `src/components/pre-registration/PreRegistrationPage.astro` | Form restructure + client wiring |
| `tests/pre-registration-files.test.mjs` | Unit tests for `files.mjs` |
| `tests/pre-registration-submit.test.mjs` | Unit tests for `submit.mjs` |
| `tests/pre-registration-form.test.mjs` | Build-and-assert + Code.gs/column sync guard |

---

## Task 1: Submit adapter (`submit.mjs`)

**Files:**
- Create: `src/lib/pre-registration/submit.mjs`
- Test: `tests/pre-registration-submit.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// tests/pre-registration-submit.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { submitPreRegistration } from "../src/lib/pre-registration/submit.mjs";

function fakeFetch(response, capture) {
  return async (url, init) => {
    if (capture) { capture.url = url; capture.init = init; }
    return response;
  };
}
const jsonResponse = (ok, body) => ({ ok, status: ok ? 200 : 500, json: async () => body });

test("returns ok when Apps Script replies { ok: true }", async () => {
  const capture = {};
  const fd = new FormData();
  fd.append("projectName", "Acme");
  const result = await submitPreRegistration("https://script/exec", fd, fakeFetch(jsonResponse(true, { ok: true }), capture));
  assert.equal(result.ok, true);
  assert.equal(capture.url, "https://script/exec");
  assert.equal(capture.init.method, "POST");
  assert.ok(capture.init.body instanceof FormData, "sends FormData (no JSON Content-Type → no preflight)");
  assert.equal(capture.init.headers, undefined, "must not set Content-Type so the browser sets multipart boundary");
});

test("returns error when Apps Script replies { ok: false }", async () => {
  const result = await submitPreRegistration("https://script/exec", new FormData(), fakeFetch(jsonResponse(true, { ok: false, error: "bad" })));
  assert.equal(result.ok, false);
  assert.equal(result.error, "bad");
});

test("returns error on non-OK HTTP status", async () => {
  const result = await submitPreRegistration("https://script/exec", new FormData(), fakeFetch(jsonResponse(false, {})));
  assert.equal(result.ok, false);
  assert.match(result.error, /500/);
});

test("returns error on network throw", async () => {
  const throwing = async () => { throw new Error("Network down"); };
  const result = await submitPreRegistration("https://script/exec", new FormData(), throwing);
  assert.equal(result.ok, false);
  assert.equal(result.error, "Network down");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/pre-registration-submit.test.mjs`
Expected: FAIL — cannot find module `submit.mjs`.

- [ ] **Step 3: Write minimal implementation**

```js
// src/lib/pre-registration/submit.mjs
/**
 * Pure, framework-agnostic submit adapter for the pre-registration form.
 * Sends multipart FormData (a CORS-safe-listed content type → no preflight), so the
 * Apps Script Web App's 302→googleusercontent redirect is followed and the JSON
 * response is readable. Do NOT set Content-Type: the browser must add the multipart boundary.
 *
 * @param {string} endpoint  Apps Script /exec URL
 * @param {FormData} formData
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function submitPreRegistration(endpoint, formData, fetchImpl = globalThis.fetch) {
  try {
    const response = await fetchImpl(endpoint, { method: "POST", body: formData });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data && data.ok) return { ok: true };
    return { ok: false, error: (data && data.error) || `Request failed (${response.status})` };
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : "Network error" };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/pre-registration-submit.test.mjs`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pre-registration/submit.mjs tests/pre-registration-submit.test.mjs
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "feat(pre-reg): pure FormData submit adapter for Apps Script"
```

---

## Task 2: File helpers (`files.mjs`)

**Files:**
- Create: `src/lib/pre-registration/files.mjs`
- Test: `tests/pre-registration-files.test.mjs`

`files.mjs` exposes:
- `MAX_FILE_BYTES` = `20 * 1024 * 1024`, `MAX_TOTAL_BYTES` = `35 * 1024 * 1024`.
- `validateFileSizes(files)` → `{ ok, error? }` where `files` is `[{ name, size }]`. Pure (no DOM).
- `fileToBase64(file, readerImpl?)` → `Promise<string>` base64 (no data-URL prefix). Uses `FileReader` in the browser; `readerImpl` injectable for tests.

- [ ] **Step 1: Write the failing test**

```js
// tests/pre-registration-files.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateFileSizes, fileToBase64, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from "../src/lib/pre-registration/files.mjs";

test("accepts files within caps", () => {
  const result = validateFileSizes([{ name: "deck.pdf", size: 5_000_000 }, { name: "extra.pdf", size: 1_000_000 }]);
  assert.equal(result.ok, true);
});

test("rejects a single file over the per-file cap and names it", () => {
  const result = validateFileSizes([{ name: "huge.pptx", size: MAX_FILE_BYTES + 1 }]);
  assert.equal(result.ok, false);
  assert.match(result.error, /huge\.pptx/);
});

test("rejects when total exceeds the total cap", () => {
  const half = Math.ceil(MAX_TOTAL_BYTES / 2) + 1;
  const result = validateFileSizes([{ name: "a.pdf", size: half }, { name: "b.pdf", size: half }]);
  assert.equal(result.ok, false);
  assert.match(result.error, /total/i);
});

test("ignores empty/absent file slots", () => {
  assert.equal(validateFileSizes([{ name: "", size: 0 }]).ok, true);
  assert.equal(validateFileSizes([]).ok, true);
});

test("fileToBase64 encodes bytes via an injected reader", async () => {
  // Fake File + FileReader producing a data URL for the bytes "hi"
  const fakeFile = { name: "x.txt", size: 2 };
  class FakeReader {
    readAsDataURL() { this.result = "data:text/plain;base64,aGk="; queueMicrotask(() => this.onload()); }
  }
  const b64 = await fileToBase64(fakeFile, () => new FakeReader());
  assert.equal(b64, "aGk=");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/pre-registration-files.test.mjs`
Expected: FAIL — module not found.

- [ ] **Step 3: Write minimal implementation**

```js
// src/lib/pre-registration/files.mjs
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 35 * 1024 * 1024;

/**
 * @param {{ name: string, size: number }[]} files
 * @returns {{ ok: boolean, error?: string }}
 */
export function validateFileSizes(files) {
  const present = (files || []).filter((f) => f && f.size > 0);
  let total = 0;
  for (const file of present) {
    if (file.size > MAX_FILE_BYTES) {
      return { ok: false, error: `${file.name} exceeds the 20MB per-file limit. Export to PDF or use the deck link field.` };
    }
    total += file.size;
  }
  if (total > MAX_TOTAL_BYTES) {
    return { ok: false, error: "The total size of all attachments is too large (max 35MB). Remove some files or use the deck link field." };
  }
  return { ok: true };
}

/**
 * @param {File} file
 * @param {() => { readAsDataURL: (file: any) => void, onload?: () => void, onerror?: () => void, result?: string, error?: unknown }} [readerImpl]
 * @returns {Promise<string>} base64 without the data-URL prefix
 */
export function fileToBase64(file, readerImpl = () => new FileReader()) {
  return new Promise((resolve, reject) => {
    const reader = readerImpl();
    reader.onload = () => {
      const result = String(reader.result || "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error || new Error("File read failed"));
    reader.readAsDataURL(file);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/pre-registration-files.test.mjs`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/pre-registration/files.mjs tests/pre-registration-files.test.mjs
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "feat(pre-reg): pure file size-validation and base64 helpers"
```

---

## Task 3: Config (`config.ts`)

**Files:**
- Create: `src/lib/pre-registration/config.ts`

(No dedicated test — exercised by the build test in Task 8. Mirrors `src/lib/contact/config.ts`.)

- [ ] **Step 1: Write the file**

```ts
// src/lib/pre-registration/config.ts
// Public, build-time config for the pre-registration form.
// The Apps Script /exec URL is public-safe; commit a placeholder and set
// PUBLIC_PREREG_SCRIPT_URL in the build env for real submissions.

export const PREREG_ENDPOINT =
  import.meta.env.PUBLIC_PREREG_SCRIPT_URL ?? "REPLACE_WITH_APPS_SCRIPT_URL";

// AI assistance panel stays hidden unless explicitly enabled (no AI backend yet).
export const AI_ASSISTANCE_ENABLED =
  import.meta.env.PUBLIC_ENABLE_AI_ASSISTANCE === "true";
```

- [ ] **Step 2: Verify it builds**

Run: `npx astro check --minimumSeverity error 2>/dev/null; echo "astro-check-exit:$?"` — ignore the known baseline `import.meta.env` diagnostic per memory. Then confirm the dev build is unaffected: `npm run build` (full build run also happens in Task 9).
Expected: no NEW errors beyond the documented baseline.

- [ ] **Step 3: Commit**

```bash
git add src/lib/pre-registration/config.ts
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "feat(pre-reg): public config for Apps Script endpoint and AI flag"
```

---

## Task 4: Sheet columns (`sheet-columns.ts`)

**Files:**
- Create: `src/lib/pre-registration/sheet-columns.ts`

This is the canonical column order. `Code.gs` (Task 6) must mirror it exactly; the sync-guard test in Task 9 enforces that.

- [ ] **Step 1: Write the file**

```ts
// src/lib/pre-registration/sheet-columns.ts
// Canonical column order for the pre-registration Google Sheet.
// scripts/apps-script/Code.gs MUST declare the same SHEET_COLUMNS array, in the same
// order — the build test in tests/pre-registration-form.test.mjs asserts they match.

export const PRE_REGISTRATION_SHEET_COLUMNS = [
  "Submitted At",
  "Submission ID",
  "Language",
  "Competition Slug",
  "Competition Name",
  "Project Name",
  "Project Introduction",
  "Competition Field",
  "Company Headquarters",
  "Company Location",
  "Company Full Name",
  "Office Address",
  "Applicant Name",
  "Gender",
  "Date Of Birth",
  "Nationality",
  "Graduation Institution",
  "Highest Degree",
  "WeChat Or WhatsApp",
  "LinkedIn",
  "Email",
  "Elevator Pitch",
  "Project Overview",
  "Product Features",
  "Business Model",
  "Team Introduction",
  "Investment Value",
  "Funding Amount Requested",
  "Expected Benefits",
  "Hear About",
  "Expansion Plan",
  "Incorporation Timeline",
  "Pitch Deck Link",
  "Supplementary Links",
  "User Agent",
  "Referrer",
  "Raw JSON",
] as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/pre-registration/sheet-columns.ts
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "feat(pre-reg): canonical Google Sheet column order"
```

---

## Task 5: Apps Script (`Code.gs` + README)

**Files:**
- Create: `scripts/apps-script/Code.gs`
- Create: `scripts/apps-script/README.md`

The client sends these `FormData` fields by name: `submissionId`, `language`, `competitionSlug`, `competitionName`, `projectName`, `projectIntro`, `compField`, `companyHeadquarters`, `compLocation`, `compFullName`, `officeAddress`, `applicantName`, `gender`, `dob`, `nationality`, `university`, `degree`, `wechat`, `linkedin`, `email`, `elevatorPitch`, `projectOverview`, `productFeatures`, `businessModel`, `teamIntroduction`, `investmentValue`, `fundingAmountRequested`, `benefits` (comma-joined), `hearAbout`, `beijingPlan`, `incorporationTimeline`, `deckLink`, `userAgent`, `referrer`. Files arrive as base64 fields: `deckFile_base64` + `deckFile_name` + `deckFile_type`, and supplementary as `suppFile_base64_0..n` + `suppFile_name_0..n` + `suppFile_type_0..n`, with `suppFile_count`.

- [ ] **Step 1: Write `Code.gs`**

```js
// scripts/apps-script/Code.gs
// Google Apps Script Web App for LATAM CHINA TECH pre-registration submissions.
// Deploy: bind to the destination spreadsheet, Deploy > New deployment > Web app,
// Execute as: Me, Who has access: Anyone. Paste the /exec URL into PUBLIC_PREREG_SCRIPT_URL.
// SHEET_COLUMNS MUST stay in sync with src/lib/pre-registration/sheet-columns.ts.

var SHEET_NAME = "Submissions";
var DRIVE_FOLDER_NAME = "Pre-Registration Uploads";

var SHEET_COLUMNS = [
  "Submitted At", "Submission ID", "Language", "Competition Slug", "Competition Name",
  "Project Name", "Project Introduction", "Competition Field", "Company Headquarters",
  "Company Location", "Company Full Name", "Office Address", "Applicant Name", "Gender",
  "Date Of Birth", "Nationality", "Graduation Institution", "Highest Degree",
  "WeChat Or WhatsApp", "LinkedIn", "Email", "Elevator Pitch", "Project Overview",
  "Product Features", "Business Model", "Team Introduction", "Investment Value",
  "Funding Amount Requested", "Expected Benefits", "Hear About", "Expansion Plan",
  "Incorporation Timeline", "Pitch Deck Link", "Supplementary Links", "User Agent",
  "Referrer", "Raw JSON"
];

function doPost(e) {
  try {
    var p = (e && e.parameter) || {};
    var folder = getUploadFolder_();

    var deckLink = String(p.deckLink || "");
    if (p.deckFile_base64) {
      deckLink = saveFile_(folder, p.deckFile_base64, p.deckFile_type, p.deckFile_name || "pitch-deck");
    }

    var suppLinks = [];
    var suppCount = parseInt(p.suppFile_count || "0", 10) || 0;
    for (var i = 0; i < suppCount; i++) {
      var b64 = p["suppFile_base64_" + i];
      if (!b64) continue;
      suppLinks.push(saveFile_(folder, b64, p["suppFile_type_" + i], p["suppFile_name_" + i] || ("file-" + i)));
    }

    var row = [
      new Date(),
      p.submissionId || "", p.language || "", p.competitionSlug || "", p.competitionName || "",
      p.projectName || "", p.projectIntro || "", p.compField || "", p.companyHeadquarters || "",
      p.compLocation || "", p.compFullName || "", p.officeAddress || "", p.applicantName || "",
      p.gender || "", p.dob || "", p.nationality || "", p.university || "", p.degree || "",
      p.wechat || "", p.linkedin || "", p.email || "", p.elevatorPitch || "", p.projectOverview || "",
      p.productFeatures || "", p.businessModel || "", p.teamIntroduction || "", p.investmentValue || "",
      p.fundingAmountRequested || "", p.benefits || "", p.hearAbout || "", p.beijingPlan || "",
      p.incorporationTimeline || "", deckLink, suppLinks.join("\n"), p.userAgent || "", p.referrer || "",
      JSON.stringify(p)
    ];

    appendRow_(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function appendRow_(row) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) sheet.appendRow(SHEET_COLUMNS);
  sheet.appendRow(row);
}

function getUploadFolder_() {
  var existing = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  return existing.hasNext() ? existing.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

function saveFile_(folder, base64, mimeType, name) {
  var bytes = Utilities.base64Decode(base64);
  var blob = Utilities.newBlob(bytes, mimeType || "application/octet-stream", name);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return file.getUrl();
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
```

- [ ] **Step 2: Write `README.md`**

```markdown
# Pre-Registration Apps Script

Routes pre-registration form submissions into a Google Sheet, saving uploaded files to Drive.

## One-time setup
1. Create (or open) the destination Google Spreadsheet.
2. **Extensions → Apps Script**. Replace `Code.gs` contents with this folder's `Code.gs`. Save.
3. **Deploy → New deployment → Web app.** Execute as: **Me**. Who has access: **Anyone**. Deploy and authorize.
4. Copy the **Web app `/exec` URL**.
5. Set it as the build env var `PUBLIC_PREREG_SCRIPT_URL` (GitHub Actions / local `.env`), then redeploy the site.

## Notes
- Files arrive base64-encoded inside the POST (≤20MB/file, ≤35MB total, enforced client-side) and are saved to a Drive folder named `Pre-Registration Uploads`; the sheet stores shareable links.
- The first submission writes the header row automatically.
- `SHEET_COLUMNS` here MUST match `src/lib/pre-registration/sheet-columns.ts` (a build test enforces this).
- After editing `Code.gs`, create a **new deployment version** for changes to take effect.
```

- [ ] **Step 3: Commit**

```bash
git add scripts/apps-script/Code.gs scripts/apps-script/README.md
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "feat(pre-reg): Apps Script web app and deploy README"
```

---

## Task 6: Localized copy + types

**Files:**
- Modify: `src/lib/interior-pages/types.ts` (the `PreRegistrationPageContent` type)
- Modify: `src/content/interior-pages/locales/en.json`, `br.json`, `cn.json`

- [ ] **Step 1: Update the type**

In `src/lib/interior-pages/types.ts`, inside `PreRegistrationPageContent`, replace the `writeWithAiLabel: string;` line with:

```ts
  competitionTrackLabels: {
    startup: string;
    corporate: string;
    academic: string;
  };
  aiAssistance: {
    buttonLabel: string;
    disabledLabel: string;
    loadingLabel: string;
    disclosure: string;
    successMessage: string;
    errorMessage: string;
    overwritePrompt: string;
    unsupportedFileMessage: string;
  };
  submission: {
    uploadPendingMessage: string;
    submittingMessage: string;
    successMessage: string;
    errorMessage: string;
    validationMessage: string;
  };
  saveDraft: {
    hint: string;
    confirmation: string;
  };
  deckLinkLabel: string;
  deckLinkPlaceholder: string;
  deckLinkHint: string;
```

- [ ] **Step 2: Update `en.json`**

In `src/content/interior-pages/locales/en.json`, inside `preRegistrationPage`, replace `"writeWithAiLabel": "Write with AI",` with the block below. (The `competitionTrackLabels`, `aiAssistance`, `submission` values are harvested verbatim from the reference branch — verify with `git show feature/vercel-blob-google-sheets-form:src/content/interior-pages/locales/en.json`.)

```json
    "competitionTrackLabels": {
      "startup": "Startup Competition",
      "corporate": "Corporate Challenge",
      "academic": "Academic Innovation"
    },
    "aiAssistance": {
      "buttonLabel": "Fill Form With AI Assistance",
      "disabledLabel": "Upload a pitch deck to use AI Assistance",
      "loadingLabel": "Analyzing deck...",
      "disclosure": "By using AI Assistance, you agree that LATAM CHINA TECH may process your pitch deck and current form inputs through third-party AI providers to generate draft application text. AI output may be incomplete or inaccurate. Please review and edit all fields before submitting, and only upload materials you are authorized to share.",
      "successMessage": "AI draft added. Please review every field before submitting.",
      "errorMessage": "AI Assistance could not analyze this file. You can continue filling the form manually.",
      "overwritePrompt": "AI found suggestions for fields you already filled. Replace existing text with the AI draft?",
      "unsupportedFileMessage": "AI Assistance supports PDF and PPTX decks. You can still submit this file manually."
    },
    "submission": {
      "uploadPendingMessage": "Uploading files...",
      "submittingMessage": "Submitting application...",
      "successMessage": "Application submitted. Our team will contact you with next steps.",
      "errorMessage": "We could not submit the form. Please try again.",
      "validationMessage": "Please complete the required fields and upload a pitch deck (or paste a deck link) before submitting."
    },
    "saveDraft": {
      "hint": "Drafts are saved in this browser only (files aren't saved).",
      "confirmation": "Draft saved ✓"
    },
    "deckLinkLabel": "Or paste a deck link",
    "deckLinkPlaceholder": "https://drive.google.com/...",
    "deckLinkHint": "Deck over 20MB? Paste a Google Drive / Dropbox link instead.",
```

- [ ] **Step 3: Update `cn.json`**

Same replacement in `src/content/interior-pages/locales/cn.json` (`competitionTrackLabels`/`aiAssistance`/`submission` harvested from the branch's `cn.json`):

```json
    "competitionTrackLabels": {
      "startup": "创业竞赛",
      "corporate": "企业挑战",
      "academic": "学术创新"
    },
    "aiAssistance": {
      "buttonLabel": "使用 AI 辅助填写表单",
      "disabledLabel": "请先上传路演材料以使用 AI 辅助",
      "loadingLabel": "正在分析材料...",
      "disclosure": "使用 AI 辅助即表示你同意 LATAM CHINA TECH 可通过第三方 AI 服务处理你的路演材料和当前表单内容，用于生成申请草稿。AI 输出可能不完整或不准确。提交前请检查并编辑所有字段，并仅上传你有权分享的材料。",
      "successMessage": "AI 草稿已添加。提交前请检查所有字段。",
      "errorMessage": "AI 辅助暂时无法分析该文件。你仍可继续手动填写表单。",
      "overwritePrompt": "AI 为你已填写的字段找到了建议内容。是否用 AI 草稿替换现有文本？",
      "unsupportedFileMessage": "AI 辅助支持 PDF 和 PPTX 路演材料。你仍可手动提交该文件。"
    },
    "submission": {
      "uploadPendingMessage": "正在上传文件...",
      "submittingMessage": "正在提交申请...",
      "successMessage": "申请已提交。我们的团队将与你联系并说明下一步。",
      "errorMessage": "表单提交失败。请重试。",
      "validationMessage": "请完成必填字段并上传路演材料（或粘贴材料链接）后再提交。"
    },
    "saveDraft": {
      "hint": "草稿仅保存在此浏览器中（不保存文件）。",
      "confirmation": "草稿已保存 ✓"
    },
    "deckLinkLabel": "或粘贴材料链接",
    "deckLinkPlaceholder": "https://drive.google.com/...",
    "deckLinkHint": "材料超过 20MB？请改为粘贴 Google Drive / Dropbox 链接。",
```

- [ ] **Step 4: Update `br.json`**

Same replacement in `src/content/interior-pages/locales/br.json`. First check whether the branch already has BR translations to harvest: `git show feature/vercel-blob-google-sheets-form:src/content/interior-pages/locales/br.json | grep -A30 competitionTrackLabels`. If present, harvest verbatim. Otherwise use:

```json
    "competitionTrackLabels": {
      "startup": "Competição de Startups",
      "corporate": "Desafio Corporativo",
      "academic": "Inovação Acadêmica"
    },
    "aiAssistance": {
      "buttonLabel": "Preencher formulário com assistência de IA",
      "disabledLabel": "Envie um pitch deck para usar a assistência de IA",
      "loadingLabel": "Analisando o deck...",
      "disclosure": "Ao usar a assistência de IA, você concorda que a LATAM CHINA TECH pode processar seu pitch deck e os dados atuais do formulário por meio de provedores de IA terceiros para gerar um rascunho do texto da candidatura. O resultado da IA pode estar incompleto ou impreciso. Revise e edite todos os campos antes de enviar e envie apenas materiais que você tem autorização para compartilhar.",
      "successMessage": "Rascunho de IA adicionado. Revise cada campo antes de enviar.",
      "errorMessage": "A assistência de IA não conseguiu analisar este arquivo. Você pode continuar preenchendo o formulário manualmente.",
      "overwritePrompt": "A IA encontrou sugestões para campos que você já preencheu. Substituir o texto existente pelo rascunho da IA?",
      "unsupportedFileMessage": "A assistência de IA suporta decks em PDF e PPTX. Você ainda pode enviar este arquivo manualmente."
    },
    "submission": {
      "uploadPendingMessage": "Enviando arquivos...",
      "submittingMessage": "Enviando candidatura...",
      "successMessage": "Candidatura enviada. Nossa equipe entrará em contato com os próximos passos.",
      "errorMessage": "Não conseguimos enviar o formulário. Tente novamente.",
      "validationMessage": "Preencha os campos obrigatórios e envie um pitch deck (ou cole um link do deck) antes de enviar."
    },
    "saveDraft": {
      "hint": "Os rascunhos são salvos apenas neste navegador (arquivos não são salvos).",
      "confirmation": "Rascunho salvo ✓"
    },
    "deckLinkLabel": "Ou cole um link do deck",
    "deckLinkPlaceholder": "https://drive.google.com/...",
    "deckLinkHint": "Deck com mais de 20MB? Cole um link do Google Drive / Dropbox.",
```

- [ ] **Step 5: Verify JSON validity**

Run: `node -e "['en','br','cn'].forEach(l=>JSON.parse(require('fs').readFileSync('src/content/interior-pages/locales/'+l+'.json','utf8')));console.log('json ok')"`
Expected: `json ok`.

- [ ] **Step 6: Commit**

```bash
git add src/lib/interior-pages/types.ts src/content/interior-pages/locales/en.json src/content/interior-pages/locales/br.json src/content/interior-pages/locales/cn.json
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "feat(pre-reg): submission/AI/draft localized copy and types"
```

---

## Task 7: Form markup restructure

**Files:**
- Modify: `src/components/pre-registration/PreRegistrationPage.astro` (markup only; the `<script>` is Task 8)

Reference the prior structure with `git show feature/vercel-blob-google-sheets-form:src/components/pre-registration/PreRegistrationPage.astro` for the deck-in-§1 + gated AI panel layout (around lines 305-351).

- [ ] **Step 1: Add config import to the frontmatter**

At the top `---` block of `PreRegistrationPage.astro`, add:

```ts
import { PREREG_ENDPOINT, AI_ASSISTANCE_ENABLED } from "../../lib/pre-registration/config";
```

Also delete the now-unused `aiTextareaFields` array's reliance on per-field AI buttons (the array itself stays for rendering the textareas, but the `<button class="ai-btn">` inside the map is removed in Step 3).

- [ ] **Step 2: Wire the form element**

Change the opening form tag from:

```html
<form class="pre-reg-form" method="post" enctype="multipart/form-data">
```

to:

```html
<form class="pre-reg-form" method="post" enctype="multipart/form-data" data-prereg-form data-endpoint={PREREG_ENDPOINT}>
  <input type="checkbox" class="prereg-honeypot" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;opacity:0" />
```

- [ ] **Step 3: Remove every per-field "Write with AI" button**

Delete all five `<button type="button" class="ai-btn" ...>{page.writeWithAiLabel}</button>` blocks (in `projectIntro`, `elevatorPitch`, the `aiTextareaFields` map, and `beijingPlan`). For the `field-wrap` wrappers that only existed to position the AI button, you may keep the `<div class="field-wrap">` (harmless) or unwrap — keep them to minimize churn.

- [ ] **Step 4: Move the pitch-deck `form-row` into Section 1**

Cut the entire `deckFile` `<div class="form-row">…</div>` block (currently in section-3, the `<label for="deckFile">` row) and paste it into `section-1`, immediately after the `projectIntro` `form-row` (the one containing `<div class="word-count">`). Add `data-deck-file-input` to the file `<input>` and a status span, matching the branch:

```html
              <label class="file-upload-area" for="deckFile">
                <input id="deckFile" name="deckFile" type="file" accept=".pdf,.ppt,.pptx" data-deck-file-input />
                <span class="file-upload-icon">↑</span>
                <span class="file-upload-label" data-i18n="page.fields.pitchingDeckUploadLabel">{page.fields.pitchingDeckUploadLabel}</span>
                <span class="file-upload-sub" data-i18n="page.fields.pitchingDeckUploadSubtext">{page.fields.pitchingDeckUploadSubtext}</span>
                <span class="file-upload-selected" data-deck-file-status hidden></span>
              </label>
```

- [ ] **Step 5: Add the deck-link fallback field**

Immediately after the moved deck `form-row`, add:

```html
            <div class="form-row">
              <label for="deckLink">
                <span data-i18n="page.deckLinkLabel">{page.deckLinkLabel}</span>{" "}
                <span class="hint" data-i18n="page.deckLinkHint">{page.deckLinkHint}</span>
              </label>
              <input id="deckLink" name="deckLink" type="url" placeholder={page.deckLinkPlaceholder} data-i18n-placeholder="page.deckLinkPlaceholder" />
            </div>
```

- [ ] **Step 6: Add the gated AI panel after the deck-link field**

```html
            {AI_ASSISTANCE_ENABLED && (
              <div class="form-row ai-assistance-panel" data-ai-assistance-panel>
                <button type="button" class="site-btn site-btn--dark" data-ai-assistance-button data-i18n="page.aiAssistance.buttonLabel" disabled>
                  {page.aiAssistance.buttonLabel}
                </button>
                <p class="ai-assistance-disclosure" data-i18n="page.aiAssistance.disclosure">{page.aiAssistance.disclosure}</p>
                <p class="form-status" data-ai-assistance-status role="status" aria-live="polite"></p>
              </div>
            )}
```

- [ ] **Step 7: Add submit status region + save-draft hint, wire save-draft button**

In the `submit-section`, change the save-draft button and add a hint + status region:

```html
          <section class="submit-section">
            <p class="submit-note" data-i18n-html="page.submitNoteHtml" set:html={page.submitNoteHtml}></p>
            <p class="form-status" data-prereg-status role="status" aria-live="polite"></p>
            <div class="submit-actions">
              <button type="button" class="site-btn site-btn--secondary" data-save-draft data-i18n="page.saveDraftLabel">{page.saveDraftLabel}</button>
              <button type="submit" class="site-btn site-btn--primary site-btn--submit" data-prereg-submit data-i18n="page.submitLabel">{page.submitLabel}</button>
            </div>
            <p class="save-draft-hint" data-save-draft-hint data-i18n="page.saveDraft.hint">{page.saveDraft.hint}</p>
            <p class="save-draft-confirmation" data-save-draft-confirmation hidden></p>
          </section>
```

Add a success panel right after the `</form>` (hidden by default), inside `.form-wrap`:

```html
        <div class="prereg-success-panel" data-prereg-success hidden>
          <h2 data-i18n="page.submission.successMessage">{page.submission.successMessage}</h2>
        </div>
```

- [ ] **Step 8: Build to verify markup compiles**

Run: `npm run build`
Expected: build succeeds; `dist/pre-registration/index.html` exists. (Behavior wired in Task 8.)

- [ ] **Step 9: Commit**

```bash
git add src/components/pre-registration/PreRegistrationPage.astro
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "feat(pre-reg): restructure form (deck in section 1, deck link, gated AI, honeypot)"
```

---

## Task 8: Client submission wiring

**Files:**
- Modify: `src/components/pre-registration/PreRegistrationPage.astro` (extend the existing `<script>`)

Append the following to the existing `<script>` block (after the competition-sync logic). It reads localized submission copy from the `#localized-content` island (same island `LocalizationClient` uses), handles draft save/restore, validation, file encoding, submission, and states.

- [ ] **Step 1: Add the wiring code**

```js
  // ---- Pre-registration submission wiring ----
  import { submitPreRegistration } from "../../lib/pre-registration/submit.mjs";
  import { validateFileSizes, fileToBase64 } from "../../lib/pre-registration/files.mjs";

  const preregForm = document.querySelector("[data-prereg-form]");
  if (preregForm instanceof HTMLFormElement) {
    const endpoint = preregForm.dataset.endpoint || "";
    const statusEl = document.querySelector("[data-prereg-status]");
    const submitBtn = preregForm.querySelector("[data-prereg-submit]");
    const successPanel = document.querySelector("[data-prereg-success]");
    const saveDraftBtn = document.querySelector("[data-save-draft]");
    const draftConfirmEl = document.querySelector("[data-save-draft-confirmation]");
    const DRAFT_KEY = "preRegistrationDraft";

    const island = document.getElementById("localized-content");
    const content = island ? JSON.parse(island.textContent || "{}") : {};
    const lang = () => {
      const code = window.localStorage.getItem("preferredLanguage") || "EN";
      return content[code] ? code : (content.EN ? "EN" : Object.keys(content)[0]);
    };
    const copy = () => (content[lang()] && content[lang()].preRegistrationPage) || {};
    const submissionCopy = () => copy().submission || {};
    const draftCopy = () => copy().saveDraft || {};

    const setStatus = (type, message) => {
      if (!(statusEl instanceof HTMLElement)) return;
      statusEl.textContent = message || "";
      statusEl.className = `form-status${type ? ` form-status--${type}` : ""}`;
    };

    // ---- Draft persistence (localStorage; files are NOT persisted) ----
    const draftableFields = () =>
      Array.from(preregForm.elements).filter(
        (el) =>
          (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) &&
          el.name && el.type !== "file" && el.name !== "botcheck",
      );

    const saveDraft = () => {
      const data = {};
      draftableFields().forEach((el) => {
        if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
          if (el.checked) { (data[el.name] = data[el.name] || []).push(el.value); }
        } else {
          data[el.name] = el.value;
        }
      });
      try { window.localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (_) {}
      if (draftConfirmEl instanceof HTMLElement) {
        draftConfirmEl.textContent = `${draftCopy().confirmation || "Draft saved"} ${new Date().toLocaleTimeString()}`;
        draftConfirmEl.hidden = false;
      }
    };

    const restoreDraft = () => {
      let data;
      try { data = JSON.parse(window.localStorage.getItem(DRAFT_KEY) || "null"); } catch (_) { data = null; }
      if (!data) return;
      draftableFields().forEach((el) => {
        const saved = data[el.name];
        if (saved === undefined) return;
        if (el instanceof HTMLInputElement && (el.type === "checkbox" || el.type === "radio")) {
          el.checked = Array.isArray(saved) && saved.includes(el.value);
        } else {
          el.value = saved;
        }
      });
      const select = preregForm.querySelector("[data-competition-select]");
      if (select instanceof HTMLSelectElement) select.dispatchEvent(new Event("change"));
    };

    if (saveDraftBtn instanceof HTMLElement) saveDraftBtn.addEventListener("click", saveDraft);
    restoreDraft();

    // ---- Required validation ----
    const REQUIRED = [
      "selectedCompetition", "projectName", "projectIntro", "compField", "companyHeadquarters",
      "compLocation", "compFullName", "applicantName", "gender", "dob", "nationality",
      "university", "degree", "wechat", "email", "elevatorPitch", "projectOverview",
      "productFeatures", "businessModel", "teamIntroduction", "investmentValue",
      "fundingAmountRequested", "hearAbout", "beijingPlan",
    ];
    const fieldValue = (name) => {
      const els = preregForm.elements[name];
      if (!els) return "";
      if (els instanceof RadioNodeList) return els.value;
      if (els instanceof HTMLInputElement && els.type === "radio") return els.checked ? els.value : "";
      return (els.value || "").trim();
    };
    const validate = () => {
      for (const name of REQUIRED) { if (!fieldValue(name)) return false; }
      const benefits = preregForm.querySelectorAll('input[name="benefits"]:checked');
      if (benefits.length === 0) return false;
      const deck = preregForm.querySelector("[data-deck-file-input]");
      const deckLink = fieldValue("deckLink");
      const hasDeck = deck instanceof HTMLInputElement && deck.files && deck.files.length > 0;
      if (!hasDeck && !deckLink) return false;
      return true;
    };

    // ---- Submit ----
    preregForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const sc = submissionCopy();
      if (preregForm.querySelector('[name="botcheck"]')?.checked) { /* bot */ return; }
      if (!validate()) { setStatus("error", sc.validationMessage || "Please complete required fields."); return; }

      const deckInput = preregForm.querySelector("[data-deck-file-input]");
      const suppInput = preregForm.querySelector('input[name="suppFile"]');
      const deckFiles = deckInput instanceof HTMLInputElement && deckInput.files ? Array.from(deckInput.files) : [];
      const suppFiles = suppInput instanceof HTMLInputElement && suppInput.files ? Array.from(suppInput.files) : [];
      const sizeCheck = validateFileSizes([...deckFiles, ...suppFiles].map((f) => ({ name: f.name, size: f.size })));
      if (!sizeCheck.ok) { setStatus("error", sizeCheck.error); return; }

      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = true;
      setStatus("pending", sc.uploadPendingMessage || "Uploading...");

      const fd = new FormData();
      const append = (k, v) => fd.append(k, v == null ? "" : String(v));
      const selectEl = preregForm.querySelector("[data-competition-select]");
      const selectedOption = selectEl instanceof HTMLSelectElement ? selectEl.selectedOptions[0] : null;
      append("submissionId", `prereg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
      append("language", lang());
      append("competitionSlug", fieldValue("selectedCompetition"));
      append("competitionName", selectedOption ? selectedOption.textContent.trim() : "");
      ["projectName","projectIntro","compField","companyHeadquarters","compLocation","compFullName",
       "officeAddress","applicantName","gender","dob","nationality","university","degree","wechat",
       "linkedin","email","elevatorPitch","projectOverview","productFeatures","businessModel",
       "teamIntroduction","investmentValue","fundingAmountRequested","hearAbout","beijingPlan",
       "incorporationTimeline","deckLink"].forEach((name) => append(name, fieldValue(name)));
      append("benefits", Array.from(preregForm.querySelectorAll('input[name="benefits"]:checked')).map((b) => b.value).join(", "));
      append("userAgent", navigator.userAgent);
      append("referrer", document.referrer);

      try {
        if (deckFiles[0]) {
          setStatus("pending", sc.submittingMessage || "Submitting...");
          append("deckFile_base64", await fileToBase64(deckFiles[0]));
          append("deckFile_name", deckFiles[0].name);
          append("deckFile_type", deckFiles[0].type);
        }
        append("suppFile_count", String(suppFiles.length));
        for (let i = 0; i < suppFiles.length; i++) {
          append(`suppFile_base64_${i}`, await fileToBase64(suppFiles[i]));
          append(`suppFile_name_${i}`, suppFiles[i].name);
          append(`suppFile_type_${i}`, suppFiles[i].type);
        }
      } catch (_) {
        if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;
        setStatus("error", sc.errorMessage || "We could not read your files. Please try again.");
        return;
      }

      setStatus("pending", sc.submittingMessage || "Submitting...");
      const result = await submitPreRegistration(endpoint, fd);
      if (submitBtn instanceof HTMLButtonElement) submitBtn.disabled = false;

      if (result.ok) {
        try { window.localStorage.removeItem(DRAFT_KEY); } catch (_) {}
        preregForm.hidden = true;
        if (successPanel instanceof HTMLElement) successPanel.hidden = false;
        setStatus("", "");
      } else {
        setStatus("error", sc.errorMessage || "We could not submit the form. Please try again.");
      }
    });
  }
```

- [ ] **Step 2: Build to verify the script compiles**

Run: `npm run build`
Expected: build succeeds (Astro bundles the `<script>` imports).

- [ ] **Step 3: Manual smoke (optional but recommended)**

Run: `npm run preview` then open `/pre-registration/`. Submit with empty fields → inline validation message. (Live POST needs a real `PUBLIC_PREREG_SCRIPT_URL`; without it the error state is expected.)

- [ ] **Step 4: Commit**

```bash
git add src/components/pre-registration/PreRegistrationPage.astro
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "feat(pre-reg): client submission, validation, file encode, draft persistence"
```

---

## Task 9: Build-and-assert test + Code.gs sync guard

**Files:**
- Create: `tests/pre-registration-form.test.mjs`

Mirror the `buildSite()` helper used by existing tests — copy the build-helper pattern from `tests/contact-form.test.mjs` (it builds once to a temp `--outDir` and reads the HTML).

- [ ] **Step 1: Write the test**

```js
// tests/pre-registration-form.test.mjs
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { PRE_REGISTRATION_SHEET_COLUMNS } from "../src/lib/pre-registration/sheet-columns.ts";

const projectRoot = resolve(import.meta.dirname, "..");
let html = "";

before(() => {
  const outDir = mkdtempSync(resolve(tmpdir(), "prereg-build-"));
  execFileSync("npx", ["astro", "build", "--outDir", outDir], { cwd: projectRoot, stdio: "inherit" });
  html = readFileSync(resolve(outDir, "pre-registration", "index.html"), "utf8");
});

test("form wires the Apps Script endpoint placeholder and honeypot", () => {
  assert.match(html, /data-prereg-form/);
  assert.match(html, /data-endpoint="[^"]+"/);
  assert.match(html, /name="botcheck"/);
});

test("pitch deck input appears before the applicant section (moved to section 1)", () => {
  const deckIdx = html.indexOf('data-deck-file-input');
  const applicantIdx = html.indexOf('id="section-2"');
  assert.ok(deckIdx > 0 && applicantIdx > 0 && deckIdx < applicantIdx, "deck input should be in section 1");
});

test("AI panel is hidden when PUBLIC_ENABLE_AI_ASSISTANCE is unset", () => {
  assert.doesNotMatch(html, /data-ai-assistance-panel/);
});

test("deck-link fallback and save-draft hint are present", () => {
  assert.match(html, /name="deckLink"/);
  assert.match(html, /data-save-draft-hint/);
});

test("per-field 'Write with AI' buttons are removed", () => {
  assert.doesNotMatch(html, /class="ai-btn"/);
});

test("Code.gs SHEET_COLUMNS matches the canonical column order", () => {
  const gs = readFileSync(resolve(projectRoot, "scripts/apps-script/Code.gs"), "utf8");
  const match = gs.match(/var SHEET_COLUMNS = \[([\s\S]*?)\];/);
  assert.ok(match, "Code.gs must declare SHEET_COLUMNS");
  const gsColumns = match[1].match(/"([^"]+)"/g).map((s) => s.replace(/"/g, ""));
  assert.deepEqual(gsColumns, [...PRE_REGISTRATION_SHEET_COLUMNS]);
});
```

> Note: if importing a `.ts` file from a `node --test` `.mjs` fails in this repo's setup, replace the import with a regex parse of `src/lib/pre-registration/sheet-columns.ts` (read the file, extract the quoted strings) — check how other tests consume `.ts` sources first (`rg "lib/.*\.ts" tests`).

- [ ] **Step 2: Run the test**

Run: `node --test tests/pre-registration-form.test.mjs`
Expected: PASS (6 tests).

- [ ] **Step 3: Commit**

```bash
git add tests/pre-registration-form.test.mjs
git -c user.name="Ash" -c user.email="ash.bruehstdio@outlook.com" commit -m "test(pre-reg): build-and-assert form wiring and Code.gs column sync"
```

---

## Task 10: Full verification

- [ ] **Step 1: Run the whole suite**

Run: `npm test`
Expected: all tests pass. The browser-driven localization test may flake on "Timed out waiting for local server on port" — re-run once per memory `codebase-conventions`.

- [ ] **Step 2: Full production build**

Run: `npm run build`
Expected: success; `dist/pre-registration/index.html` present.

- [ ] **Step 3: Confirm no stray placeholders shipped**

Run: `rg -n "writeWithAiLabel|ai-btn" src/components/pre-registration/PreRegistrationPage.astro || echo "clean"`
Expected: `clean`.

- [ ] **Step 4: Final commit (if anything uncommitted)**

```bash
git status --short
```

Then hand off to `superpowers:finishing-a-development-branch` (squash-merge into `main`, delete the feature branch, push `main` to `origin`, `ash`, `lct` — per memory `dev-workflow-and-shipping`).

---

## Self-Review notes (addressed)

- **Spec coverage:** Apps Script + FormData (Tasks 1,5), base64→Drive + size caps (Tasks 2,5,8), deck-link fallback (Tasks 6,7,8), form restructure / AI hidden (Task 7), save-draft localStorage + hint (Tasks 6,8), sheet columns adapted (Tasks 4,5), config placeholders (Task 3), i18n harvested (Task 6), tests (Tasks 1,2,9,10). All spec sections map to tasks.
- **Type consistency:** field names used in client `append(...)`, `Code.gs` parameters, and `REQUIRED`/columns all use the form's existing `name=` attributes (`projectIntro`, `beijingPlan`, `compFullName`, etc.). `submitPreRegistration(endpoint, formData, fetchImpl?)` signature consistent across Task 1 and Task 8. `validateFileSizes`/`fileToBase64` signatures consistent across Task 2 and Task 8.
- **Funding field:** `fundingAmountRequested` is included as a column (the reference branch omitted it) and is required.
```

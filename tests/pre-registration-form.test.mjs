// tests/pre-registration-form.test.mjs
import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDir, "..");

// FALLBACK: read sheet-columns.ts as text and regex-extract column strings,
// because node --test (no TS loader) cannot import .ts files at runtime.
const sheetColsSrc = readFileSync(
  resolve(projectRoot, "src/lib/pre-registration/sheet-columns.ts"),
  "utf8",
);
// Extract all quoted strings inside the PRE_REGISTRATION_SHEET_COLUMNS array
const colArrayMatch = sheetColsSrc.match(
  /PRE_REGISTRATION_SHEET_COLUMNS\s*=\s*\[([\s\S]*?)\]\s*as\s*const/,
);
assert.ok(colArrayMatch, "sheet-columns.ts must export PRE_REGISTRATION_SHEET_COLUMNS array");
const SHEET_COLUMNS_FROM_TS = colArrayMatch[1]
  .match(/"([^"]+)"/g)
  .map((s) => s.replace(/"/g, ""));

let html = "";

before(() => {
  const outDir = mkdtempSync(resolve(tmpdir(), "prereg-build-"));
  const build = spawnSync("npm", ["run", "build", "--", "--outDir", outDir], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  assert.equal(
    build.status,
    0,
    `Astro build failed.\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`,
  );
  html = readFileSync(resolve(outDir, "pre-registration", "index.html"), "utf8");
});

test("form wires the Apps Script endpoint placeholder and honeypot", () => {
  assert.match(html, /data-prereg-form/);
  assert.match(html, /data-endpoint="[^"]+"/);
  assert.match(html, /name="botcheck"/);
});

test("pitch deck input appears before the applicant section (moved to section 1)", () => {
  const deckIdx = html.indexOf("data-deck-file-input");
  const applicantIdx = html.indexOf('id="section-2"');
  assert.ok(
    deckIdx > 0 && applicantIdx > 0 && deckIdx < applicantIdx,
    "deck input should be in section 1",
  );
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

test("benefit options use icons, not letter initials", () => {
  const en = JSON.parse(
    readFileSync(
      resolve(projectRoot, "src/content/interior-pages/locales/en.json"),
      "utf8",
    ),
  );
  const benefits = en.preRegistrationPage.benefits;
  assert.equal(benefits.length, 12);
  for (const b of benefits) {
    assert.ok(b.icon, `${b.value} must have an icon`);
    assert.equal(b.short, undefined, `${b.value} must not keep the letter initial`);
  }
});

test("Code.gs SHEET_COLUMNS matches the canonical column order", () => {
  const gs = readFileSync(
    resolve(projectRoot, "scripts/apps-script/Code.gs"),
    "utf8",
  );
  const match = gs.match(/var SHEET_COLUMNS = \[([\s\S]*?)\];/);
  assert.ok(match, "Code.gs must declare SHEET_COLUMNS");
  const gsColumns = match[1].match(/"([^"]+)"/g).map((s) => s.replace(/"/g, ""));
  assert.deepEqual(gsColumns, SHEET_COLUMNS_FROM_TS);
});

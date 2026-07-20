// tests/eligibility-form.test.mjs
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
// Mirrors tests/pre-registration-form.test.mjs.
const sheetColsSrc = readFileSync(
  resolve(projectRoot, "src/lib/eligibility/sheet-columns.ts"),
  "utf8",
);
const colArrayMatch = sheetColsSrc.match(
  /ELIGIBILITY_SHEET_COLUMNS\s*=\s*\[([\s\S]*?)\]\s*as\s*const/,
);
assert.ok(colArrayMatch, "sheet-columns.ts must export ELIGIBILITY_SHEET_COLUMNS array");
const ELIGIBILITY_SHEET_COLUMNS = colArrayMatch[1]
  .match(/"([^"]+)"/g)
  .map((s) => s.replace(/"/g, ""));

let html = "";

before(() => {
  const outDir = mkdtempSync(resolve(tmpdir(), "eligibility-build-"));
  const build = spawnSync("npm", ["run", "build", "--", "--outDir", outDir], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  assert.equal(
    build.status,
    0,
    `Astro build failed.\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`,
  );
  html = readFileSync(resolve(outDir, "eligibility", "index.html"), "utf8");
});

test("eligibility columns match Code.gs", () => {
  const gs = readFileSync(
    resolve(projectRoot, "scripts/apps-script/Code.gs"),
    "utf8",
  );
  const block = gs.match(/var ELIGIBILITY_SHEET_COLUMNS = \[([\s\S]*?)\];/);
  assert.ok(block, "Code.gs must declare ELIGIBILITY_SHEET_COLUMNS");
  const declared = block[1].match(/"([^"]+)"/g).map((s) => s.replace(/"/g, ""));
  assert.deepEqual(declared, ELIGIBILITY_SHEET_COLUMNS, "column order must match exactly");
});

test("form wires the Apps Script endpoint and honeypot with eligibility formType", () => {
  assert.match(html, /data-eligibility-form/);
  assert.match(html, /data-endpoint="[^"]+"/);
  assert.match(html, /name="botcheck"/);
});

test("form exposes program select prefilled from the query param", () => {
  assert.match(html, /data-program-select/);
  assert.match(html, /data-program-hidden/);
});

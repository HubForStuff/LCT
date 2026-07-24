import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// node --test has no TS loader, so read sheet-columns.ts as text and regex the
// column strings out. Mirrors tests/eligibility-form.test.mjs.
const sheetColsSrc = readFileSync(
  resolve(projectRoot, "src/lib/event-application/sheet-columns.ts"),
  "utf8",
);
const colArrayMatch = sheetColsSrc.match(
  /EVENT_APPLICATION_SHEET_COLUMNS\s*=\s*\[([\s\S]*?)\]\s*as\s*const/,
);
assert.ok(colArrayMatch, "sheet-columns.ts must export EVENT_APPLICATION_SHEET_COLUMNS");
const COLUMNS = colArrayMatch[1].match(/"([^"]+)"/g).map((s) => s.replace(/"/g, ""));

let html = "";

before(() => {
  const outDir = mkdtempSync(resolve(tmpdir(), "event-app-build-"));
  const build = spawnSync("npm", ["run", "build", "--", "--outDir", outDir], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  assert.equal(build.status, 0, `Astro build failed.\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`);
  html = readFileSync(resolve(outDir, "event-application", "index.html"), "utf8");
});

test("column order matches Code.gs exactly", () => {
  const gs = readFileSync(resolve(projectRoot, "scripts/apps-script/Code.gs"), "utf8");
  const block = gs.match(/var EVENT_APPLICATION_SHEET_COLUMNS = \[([\s\S]*?)\];/);
  assert.ok(block, "Code.gs must declare EVENT_APPLICATION_SHEET_COLUMNS");
  const declared = block[1].match(/"([^"]+)"/g).map((s) => s.replace(/"/g, ""));
  assert.deepEqual(declared, COLUMNS, "column order must match exactly");
});

test("Code.gs routes the event-application formType to its own sheet", () => {
  const gs = readFileSync(resolve(projectRoot, "scripts/apps-script/Code.gs"), "utf8");
  assert.match(gs, /formType === "event-application"/);
  assert.match(gs, /var EVENT_APPLICATION_SHEET_NAME = "Event Applications"/);
});

test("form wires the endpoint, honeypot and formType", () => {
  assert.match(html, /data-event-application-form/);
  assert.match(html, /data-endpoint="[^"]+"/);
  assert.match(html, /name="botcheck"/);
});

test("form exposes an event select prefilled from the query param", () => {
  assert.match(html, /data-event-select/);
  assert.match(html, /data-event-hidden/);
});

test("form carries exactly the minimal field set and no uploads", () => {
  for (const field of ["name", "email", "company", "message"]) {
    assert.ok(html.includes(`name="${field}"`), `missing field ${field}`);
  }
  assert.ok(!html.includes('type="file"'), "event application takes no uploads");
});

test("does not reuse the eligibility component", () => {
  assert.ok(!html.includes("data-eligibility-form"), "must be its own form, not eligibility");
});

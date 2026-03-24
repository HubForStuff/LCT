import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDir, "..");

const readProjectFile = (relativePath) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");

test("homepage entrypoint stays thin and delegates content/rendering", () => {
  const indexSource = readProjectFile("src/pages/index.astro");
  const lineCount = indexSource.trim().split("\n").length;

  assert.ok(
    lineCount < 250,
    `expected src/pages/index.astro to be a thin composition file, found ${lineCount} lines`,
  );
  assert.match(indexSource, /getHomepage/i, "expected a dedicated homepage data loader");
  assert.doesNotMatch(
    indexSource,
    /const localizedContent\s*=/,
    "expected localized content to live outside src/pages/index.astro",
  );
  assert.doesNotMatch(
    indexSource,
    /<style is:global>/,
    "expected homepage styles to live in a dedicated stylesheet",
  );
});

test("astro is configured with the keystatic integration", () => {
  const astroConfig = readProjectFile("astro.config.mjs");

  assert.match(
    astroConfig,
    /@keystatic\/astro/,
    "expected astro.config.mjs to import @keystatic/astro",
  );
  assert.match(
    astroConfig,
    /keystatic\(\)/,
    "expected astro.config.mjs to register the keystatic integration",
  );
});

test("homepage content is seeded into keystatic-managed files", () => {
  const homepageDir = resolve(projectRoot, "src/content/homepage");
  const localesDir = resolve(homepageDir, "locales");

  assert.equal(
    existsSync(resolve(homepageDir, "site-settings.json")),
    true,
    "expected global homepage settings to be stored in Keystatic content files",
  );
  assert.equal(
    existsSync(localesDir),
    true,
    "expected localized homepage content to live under src/content/homepage/locales",
  );

  const localeFiles = readdirSync(localesDir).filter((entry) => entry.endsWith(".json"));
  assert.deepEqual(
    localeFiles.sort(),
    ["br.json", "cn.json", "en.json"],
    `expected localized homepage content for EN, BR, and CN, found ${localeFiles.join(", ")}`,
  );
});

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
  const packageJson = JSON.parse(readProjectFile("package.json"));
  const reactVersion = packageJson.dependencies?.react;
  const reactDomVersion = packageJson.dependencies?.["react-dom"];

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
  assert.match(
    astroConfig,
    /@astrojs\/react/,
    "expected astro.config.mjs to import @astrojs/react so Keystatic can render its React admin UI",
  );
  assert.match(
    astroConfig,
    /react\(\)/,
    "expected astro.config.mjs to register the React renderer required by Keystatic",
  );
  assert.equal(
    typeof packageJson.dependencies?.["@astrojs/react"],
    "string",
    "expected package.json to install @astrojs/react for the Keystatic admin UI",
  );
  assert.equal(
    typeof reactVersion,
    "string",
    "expected package.json to install react for the Keystatic admin UI",
  );
  assert.equal(
    typeof reactDomVersion,
    "string",
    "expected package.json to install react-dom for the Keystatic admin UI",
  );
  assert.equal(
    reactVersion,
    reactDomVersion,
    "expected react and react-dom to stay pinned to the exact same version",
  );
  assert.doesNotMatch(
    reactVersion,
    /^[~^]/,
    "expected react to be pinned exactly so Keystatic cannot pick up a mismatched version",
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

test("news content is modeled as a keystatic-managed collection", () => {
  const keystaticConfig = readProjectFile("keystatic.config.ts");
  const newsSchemaModule = resolve(projectRoot, "src/lib/news/schema.ts");
  const newsReaderModule = resolve(projectRoot, "src/lib/news/reader.ts");
  const newsContentDir = resolve(projectRoot, "src/content/news");

  assert.match(
    keystaticConfig,
    /collection\s*\(/,
    "expected keystatic.config.ts to declare at least one collection",
  );
  assert.match(
    keystaticConfig,
    /collections:\s*\{[\s\S]*news:\s*collection\s*\(/,
    "expected keystatic.config.ts to register a news collection",
  );
  assert.equal(
    existsSync(newsSchemaModule),
    true,
    "expected the news collection schema to live in src/lib/news/schema.ts",
  );
  assert.equal(
    existsSync(newsReaderModule),
    true,
    "expected the news reader helpers to live in src/lib/news/reader.ts",
  );
  assert.equal(
    existsSync(newsContentDir),
    true,
    "expected news entries to be stored in src/content/news",
  );

  const newsEntries = existsSync(newsContentDir)
    ? readdirSync(newsContentDir).filter((entry) => !entry.startsWith("."))
    : [];

  assert.ok(
    newsEntries.length >= 3,
    `expected at least 3 seeded news entries, found ${newsEntries.length}`,
  );
});

test("competitions content is modeled as a keystatic-managed collection", () => {
  const keystaticConfig = readProjectFile("keystatic.config.ts");
  const competitionsSchemaModule = resolve(projectRoot, "src/lib/competitions/schema.ts");
  const competitionsReaderModule = resolve(projectRoot, "src/lib/competitions/reader.ts");
  const competitionsContentDir = resolve(projectRoot, "src/content/competitions");

  assert.match(
    keystaticConfig,
    /collections:\s*\{[\s\S]*competitions:\s*collection\s*\(/,
    "expected keystatic.config.ts to register a competitions collection",
  );
  assert.equal(
    existsSync(competitionsSchemaModule),
    true,
    "expected the competitions collection schema to live in src/lib/competitions/schema.ts",
  );
  assert.equal(
    existsSync(competitionsReaderModule),
    true,
    "expected the competitions reader helpers to live in src/lib/competitions/reader.ts",
  );
  assert.equal(
    existsSync(competitionsContentDir),
    true,
    "expected competitions entries to be stored in src/content/competitions",
  );

  const competitionEntries = existsSync(competitionsContentDir)
    ? readdirSync(competitionsContentDir).filter((entry) => !entry.startsWith("."))
    : [];

  assert.ok(
    competitionEntries.length >= 6,
    `expected at least 6 seeded competition entries, found ${competitionEntries.length}`,
  );
});

test("static pages content is modeled as a keystatic-managed collection", () => {
  const keystaticConfig = readProjectFile("keystatic.config.ts");
  const staticPagesSchemaModule = resolve(projectRoot, "src/lib/static-pages/schema.ts");
  const staticPagesReaderModule = resolve(projectRoot, "src/lib/static-pages/reader.ts");
  const staticPagesContentDir = resolve(projectRoot, "src/content/static-pages");
  const staticPageRoute = resolve(projectRoot, "src/pages/[slug].astro");
  const staticPageComponent = resolve(projectRoot, "src/components/static-pages/StaticPage.astro");

  assert.match(
    keystaticConfig,
    /collections:\s*\{[\s\S]*staticPages:\s*collection\s*\(/,
    "expected keystatic.config.ts to register a staticPages collection",
  );
  assert.equal(
    existsSync(staticPagesSchemaModule),
    true,
    "expected the static pages collection schema to live in src/lib/static-pages/schema.ts",
  );
  assert.equal(
    existsSync(staticPagesReaderModule),
    true,
    "expected static pages reader helpers to live in src/lib/static-pages/reader.ts",
  );
  assert.equal(
    existsSync(staticPageRoute),
    true,
    "expected a thin root dynamic route for generated static pages",
  );
  assert.equal(
    existsSync(staticPageComponent),
    true,
    "expected static pages to delegate rendering to a reusable component",
  );
  assert.equal(
    existsSync(staticPagesContentDir),
    true,
    "expected static page entries to be stored in src/content/static-pages",
  );

  const staticPageEntries = existsSync(staticPagesContentDir)
    ? readdirSync(staticPagesContentDir).filter((entry) => !entry.startsWith(".")).sort()
    : [];

  assert.deepEqual(
    staticPageEntries,
    ["advisory.json", "events.json", "network.json", "programs.json", "speakers.json"],
    `expected seeded static page entries for advisory, events, network, programs, and speakers; found ${staticPageEntries.join(", ")}`,
  );
});

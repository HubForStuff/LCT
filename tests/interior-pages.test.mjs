import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const testDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDir, "..");

const readProjectFile = (relativePath) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");

const buildSite = () => {
  const outDir = mkdtempSync(resolve(tmpdir(), "inovacao-hub-interior-"));
  const build = spawnSync("npm", ["run", "build", "--", "--outDir", outDir], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  assert.equal(
    build.status,
    0,
    `Astro build failed.\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`,
  );

  return {
    outDir,
    cleanup() {
      rmSync(outDir, { force: true, recursive: true });
    },
  };
};

test("interior page route files stay thin and delegate rendering", () => {
  const competitionsRoute = resolve(projectRoot, "src/pages/competitions.astro");
  const preRegistrationRoute = resolve(projectRoot, "src/pages/pre-registration.astro");
  const contentModule = resolve(projectRoot, "src/content/interior-pages.ts");

  assert.equal(existsSync(competitionsRoute), true, "expected competitions route to exist");
  assert.equal(
    existsSync(preRegistrationRoute),
    true,
    "expected pre-registration route to exist",
  );
  assert.equal(
    existsSync(contentModule),
    true,
    "expected interior page content to live in a dedicated module",
  );

  const competitionsSource = readProjectFile("src/pages/competitions.astro");
  const preRegistrationSource = readProjectFile("src/pages/pre-registration.astro");

  assert.ok(
    competitionsSource.trim().split("\n").length < 80,
    "expected competitions route to stay thin",
  );
  assert.ok(
    preRegistrationSource.trim().split("\n").length < 80,
    "expected pre-registration route to stay thin",
  );

  assert.match(
    competitionsSource,
    /CompetitionsPage/,
    "expected competitions route to delegate to a reusable page component",
  );
  assert.match(
    preRegistrationSource,
    /PreRegistrationPage/,
    "expected pre-registration route to delegate to a reusable page component",
  );
  assert.match(
    competitionsSource,
    /interior-pages\.css/,
    "expected competitions route to import the dedicated interior stylesheet",
  );
  assert.match(
    preRegistrationSource,
    /interior-pages\.css/,
    "expected pre-registration route to import the dedicated interior stylesheet",
  );
});

test("competitions and pre-registration pages build with the expected mockup content", () => {
  const build = buildSite();

  try {
    const competitionsHtml = readFileSync(
      resolve(build.outDir, "competitions", "index.html"),
      "utf8",
    );
    const preRegistrationHtml = readFileSync(
      resolve(build.outDir, "pre-registration", "index.html"),
      "utf8",
    );

    assert.match(
      competitionsHtml,
      /Challenges\s*&amp;\s*Competitions|Challenges\s*&\s*Competitions/i,
      "expected the competitions page hero heading from the mockup",
    );
    assert.match(
      competitionsHtml,
      /Greater Tech Challenge 2025/i,
      "expected the featured startup competition",
    );
    assert.match(
      competitionsHtml,
      /China Market Entry Accelerator 2025/i,
      "expected the featured corporate challenge",
    );
    assert.match(
      competitionsHtml,
      /Academic Innovation/i,
      "expected the academic placeholder tab content",
    );
    assert.match(
      competitionsHtml,
      /Load More Challenges/i,
      "expected the load more CTA from the mockup",
    );

    assert.match(
      preRegistrationHtml,
      /HICOOL Global[\s\S]*Startup Competition/i,
      "expected the pre-registration page hero heading from the mockup",
    );
    assert.match(
      preRegistrationHtml,
      /This is a Pre-Registration/i,
      "expected the pre-registration explainer banner",
    );
    assert.match(
      preRegistrationHtml,
      /Application Guide\s*&amp;\s*Tutorial|Application Guide\s*&\s*Tutorial/i,
      "expected the guide/tutorial callout",
    );
    assert.match(
      preRegistrationHtml,
      /Competition Information/i,
      "expected the first form section heading",
    );
    assert.match(
      preRegistrationHtml,
      /Plan for Incorporation in Beijing/i,
      "expected the Beijing plan section heading",
    );
    assert.match(
      preRegistrationHtml,
      /Submit Pre-Registration/i,
      "expected the final submit CTA",
    );

    const benefitCount = (preRegistrationHtml.match(/benefit-item/g) ?? []).length;
    assert.ok(
      benefitCount >= 8,
      `expected at least 8 benefit options, found ${benefitCount}`,
    );
  } finally {
    build.cleanup();
  }
});

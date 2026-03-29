import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn, spawnSync } from "node:child_process";

const testDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDir, "..");

const readProjectFile = (relativePath) =>
  readFileSync(resolve(projectRoot, relativePath), "utf8");

const waitForServer = async (port) => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`);
      if (response.ok) {
        return;
      }
    } catch {
      // keep retrying until the server is ready
    }

    await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
  }

  throw new Error(`Timed out waiting for local server on port ${port}`);
};

const runAgentBrowser = (args) =>
  execFileSync("agent-browser", args, {
    cwd: projectRoot,
    encoding: "utf8",
  });

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

test("interior page route files stay thin and delegate rendering", { concurrency: false }, () => {
  const competitionsRoute = resolve(projectRoot, "src/pages/competitions.astro");
  const preRegistrationRoute = resolve(projectRoot, "src/pages/pre-registration.astro");
  const contentLocalesDir = resolve(projectRoot, "src/content/interior-pages/locales");
  const readerModule = resolve(projectRoot, "src/lib/interior-pages/reader.ts");

  assert.equal(existsSync(competitionsRoute), true, "expected competitions route to exist");
  assert.equal(
    existsSync(preRegistrationRoute),
    true,
    "expected pre-registration route to exist",
  );
  assert.equal(
    existsSync(contentLocalesDir),
    true,
    "expected interior page content to live in dedicated locale files",
  );
  assert.equal(
    existsSync(readerModule),
    true,
    "expected interior pages to use a dedicated localized data reader",
  );

  const localeFiles = readdirSync(contentLocalesDir).filter((entry) => entry.endsWith(".json"));
  assert.deepEqual(
    localeFiles.sort(),
    ["br.json", "cn.json", "en.json"],
    `expected interior page locales for EN, BR, and CN, found ${localeFiles.join(", ")}`,
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
    competitionsSource,
    /getInteriorPageData\("competitionsPage"\)/,
    "expected competitions route to load localized content through the reader",
  );
  assert.match(
    preRegistrationSource,
    /getInteriorPageData\("preRegistrationPage"\)/,
    "expected pre-registration route to load localized content through the reader",
  );
  assert.match(
    competitionsSource,
    /LocalizationClient/,
    "expected competitions route to include the shared localization client",
  );
  assert.match(
    preRegistrationSource,
    /LocalizationClient/,
    "expected pre-registration route to include the shared localization client",
  );
  assert.match(
    preRegistrationSource,
    /interior-pages\.css/,
    "expected pre-registration route to import the dedicated interior stylesheet",
  );
  assert.doesNotMatch(
    `${competitionsSource}\n${preRegistrationSource}`,
    /content\/interior-pages/,
    "expected the routes to avoid the old one-off interior content module",
  );
});

test("competitions and pre-registration pages build with the expected mockup content", { concurrency: false }, () => {
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

test("interior pages expose shared localization hooks and localize in the browser", { concurrency: false }, async () => {
  const build = buildSite();
  const competitionsHtml = readFileSync(
    resolve(build.outDir, "competitions", "index.html"),
    "utf8",
  );

  assert.match(
    competitionsHtml,
    /id="localized-content"/,
    "expected interior pages to ship the shared localized content payload",
  );
  assert.match(
    competitionsHtml,
    /data-lang-toggle/,
    "expected interior pages to use the shared language switcher hooks",
  );
  assert.match(
    competitionsHtml,
    /data-lang-option="CN"/,
    "expected interior pages to expose the shared language options",
  );
  assert.match(
    competitionsHtml,
    /alt="LATAM China Tech"/,
    "expected interior pages to reuse the shared brand logo asset",
  );

  const port = 4300 + Math.floor(Math.random() * 500);
  const session = `interior-i18n-${Date.now()}`;
  const server = spawn("python3", ["-m", "http.server", String(port), "-d", build.outDir], {
    cwd: projectRoot,
    stdio: "ignore",
  });

  try {
    await waitForServer(port);

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // session may not exist yet
    }

    runAgentBrowser(["--session", session, "set", "viewport", "1440", "900"]);
    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/competitions/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);
    runAgentBrowser(["--session", session, "click", ".site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-lang [data-lang-option='CN']"]);
    runAgentBrowser(["--session", session, "wait", "500"]);

    const competitionsHeading = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      ".page-title",
    ]);
    const competitionsFilter = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      ".filter-group-label",
    ]);

    assert.match(
      competitionsHeading,
      /挑战|竞赛/u,
      "expected the competitions page heading to switch to Chinese",
    );
    assert.match(
      competitionsFilter,
      /状态/u,
      "expected the competitions filters to switch to Chinese",
    );

    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/pre-registration/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);
    runAgentBrowser(["--session", session, "click", ".site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-lang [data-lang-option='BR']"]);
    runAgentBrowser(["--session", session, "wait", "500"]);

    const preRegistrationHeading = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      ".page-title",
    ]);
    const submitLabel = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      ".submit-actions .site-btn--primary",
    ]);

    assert.match(
      preRegistrationHeading,
      /Pré|Inscrição/i,
      "expected the pre-registration page heading to switch to Portuguese",
    );
    assert.match(
      submitLabel,
      /Enviar|Pré-inscrição/i,
      "expected the submit CTA to switch to Portuguese",
    );
  } finally {
    build.cleanup();
    server.kill("SIGTERM");

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // ignore cleanup failures
    }
  }
});

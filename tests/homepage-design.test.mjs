import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn, spawnSync } from "node:child_process";

const testDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDir, "..");
const distIndexPath = resolve(projectRoot, "dist", "index.html");

const buildSite = () => {
  const build = spawnSync("npm", ["run", "build"], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  assert.equal(
    build.status,
    0,
    `Astro build failed.\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`,
  );
};

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

test("homepage build matches the supplied design structure", () => {
  buildSite();

  const html = readFileSync(distIndexPath, "utf8");

  assert.match(
    html,
    /<img[^>]+alt="LATAM China Tech"/i,
    "expected the homepage to render the LATAM China Tech logo image",
  );
  assert.match(html, /Accelerating/i, "expected the new hero heading from the design");
  assert.match(
    html,
    /Competitions[\s\S]*Challenges/i,
    "expected the competitions and challenges section from the design",
  );
  assert.match(html, /News\s*&amp;\s*Insights|News\s*&\s*Insights/i, "expected the insights section");
  assert.match(html, /Fuel your growth/i, "expected the footer CTA copy");
  assert.match(html, /mobile-menu|mobileMenu/, "expected mobile navigation markup");

  const categoryCardCount = (html.match(/cat-card|catblock/g) ?? []).length;
  assert.ok(categoryCardCount >= 3, `expected at least 3 category cards, found ${categoryCardCount}`);

  const competitionCardCount = (html.match(/comp-card|comp-square/g) ?? []).length;
  assert.ok(
    competitionCardCount >= 2,
    `expected at least 2 competition cards, found ${competitionCardCount}`,
  );

  assert.match(
    html,
    /desk-comp-square--light-shell/,
    "expected the desktop competitions cards to use the bordered light-shell treatment from the mockup",
  );
  assert.match(
    html,
    /mob-section--contrast/,
    "expected the mobile news section to include the higher-contrast treatment from the mockup",
  );
  assert.match(
    html,
    /desk-news-card--shell/,
    "expected the desktop news cards to expose the bordered shell treatment from the mockup",
  );
  assert.match(
    html,
    /mob-lang-sheet--top/,
    "expected the mobile language sheet to expose the top-anchored treatment from the mockup",
  );
  assert.match(
    html,
    /href="\/competitions\/"/,
    "expected the homepage to link into the competitions route",
  );
  assert.match(
    html,
    /href="\/pre-registration\/"/,
    "expected the homepage to link into the pre-registration route",
  );

  const mobileGlowCount = (html.match(/mob-cat-glow/g) ?? []).length;
  assert.ok(
    mobileGlowCount >= 3,
    `expected at least 3 mobile category glow layers, found ${mobileGlowCount}`,
  );
});

test("language switching localizes the homepage on desktop and mobile", async () => {
  buildSite();

  const port = 4173;
  const session = `homepage-i18n-${Date.now()}`;
  const server = spawn("python3", ["-m", "http.server", String(port), "-d", resolve(projectRoot, "dist")], {
    cwd: projectRoot,
    stdio: "ignore",
  });

  try {
    await waitForServer(port);

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Session may not exist yet.
    }

    runAgentBrowser(["--session", session, "set", "viewport", "1440", "900"]);
    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);
    runAgentBrowser(["--session", session, "click", ".desk-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".desk-lang [data-lang-option='CN']"]);
    runAgentBrowser(["--session", session, "wait", "400"]);

    const desktopHero = runAgentBrowser(["--session", session, "get", "text", ".desk-hero h1"]);
    const desktopFooterCta = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      ".desk-footer-title",
    ]);

    assert.match(desktopHero, /加速/u, "expected the desktop hero to switch to Chinese");
    assert.match(
      desktopFooterCta,
      /获得资金|跨越/u,
      "expected the desktop footer CTA to switch to Chinese",
    );

    runAgentBrowser(["--session", session, "set", "viewport", "393", "852"]);
    runAgentBrowser(["--session", session, "reload"]);
    runAgentBrowser(["--session", session, "wait", "1000"]);
    runAgentBrowser(["--session", session, "click", "#mobileLangBtn"]);
    runAgentBrowser(["--session", session, "click", "#mobileLangSheet [data-lang-option='BR']"]);
    runAgentBrowser(["--session", session, "wait", "400"]);
    runAgentBrowser(["--session", session, "reload"]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const mobileHero = runAgentBrowser(["--session", session, "get", "text", ".mob-hero h1"]);
    const mobileCta = runAgentBrowser(["--session", session, "get", "text", ".mob-cta h2"]);

    assert.match(mobileHero, /Acelerando/i, "expected the mobile hero to switch to Portuguese");
    assert.match(
      mobileCta,
      /Receba investimento|cresca/i,
      "expected the mobile CTA to switch to Portuguese and persist after reload",
    );
  } finally {
    server.kill("SIGTERM");

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Ignore cleanup failures.
    }
  }
});

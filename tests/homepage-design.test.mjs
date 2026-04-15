import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

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
  assert.match(
    html,
    /href="\/news\/"/,
    "expected the homepage insights section to link to the full news listing route",
  );

  const articleLinkCount = (html.match(/href="\/news\/[^"]+\/"/g) ?? []).length;
  assert.ok(
    articleLinkCount >= 3,
    `expected at least 3 homepage cards to link to news detail pages, found ${articleLinkCount}`,
  );

  const mobileGlowCount = (html.match(/mob-cat-glow/g) ?? []).length;
  assert.ok(
    mobileGlowCount >= 3,
    `expected at least 3 mobile category glow layers, found ${mobileGlowCount}`,
  );

  assert.match(
    html,
    /data-i18n="desktopMenuSections\.1\.card\.title">\s*Greater Tech Challenge 2025\s*</,
    "expected the competitions submenu to surface the featured startup competition from the CMS",
  );
  assert.match(
    html,
    /data-i18n="desktopMenuSections\.1\.card2\.title">\s*China Market Entry Accelerator 2025\s*</,
    "expected the competitions submenu to surface the featured corporate challenge from the CMS",
  );
  assert.match(
    html,
    /href="\/competitions\/greater-tech-challenge-2025\/"/,
    "expected the startup submenu card to link to the highlighted competition detail page",
  );
  assert.match(
    html,
    /href="\/competitions\/china-market-entry-accelerator-2025\/"/,
    "expected the corporate submenu card to link to the highlighted challenge detail page",
  );
  assert.doesNotMatch(
    html,
    /ByteDance Corporate Challenge|Registration Open/,
    "expected the competitions submenu to stop rendering the old static card placeholders",
  );
});

test("language switching localizes the homepage on desktop and mobile", async () => {
  buildSite();

  const homepageFileUrl = `file://${resolve(projectRoot, "dist", "index.html")}`;
  const session = `homepage-i18n-${Date.now()}`;

  try {
    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Session may not exist yet.
    }

    runAgentBrowser(["--session", session, "set", "viewport", "1440", "900"]);
    runAgentBrowser(["--allow-file-access", "--session", session, "open", homepageFileUrl]);
    runAgentBrowser(["--session", session, "wait", "1000"]);
    runAgentBrowser([
      "--session",
      session,
      "eval",
      "document.querySelector('.desk-lang [data-lang-toggle]')?.click()",
    ]);
    runAgentBrowser([
      "--session",
      session,
      "eval",
      "document.querySelector('.desk-lang [data-lang-option=\"CN\"]')?.click()",
    ]);
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
    runAgentBrowser(["--session", session, "eval", "document.querySelector('#mobileLangBtn')?.click()"]);
    runAgentBrowser([
      "--session",
      session,
      "eval",
      "document.querySelector('#mobileLangSheet [data-lang-option=\"BR\"]')?.click()",
    ]);
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
    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Ignore cleanup failures.
    }
  }
});

test("desktop mega menus stay within the viewport at narrow desktop widths", async () => {
  buildSite();

  const homepageFileUrl = `file://${resolve(projectRoot, "dist", "index.html")}`;
  const session = `homepage-nav-${Date.now()}`;

  const getMenuBox = (selector) =>
    (() => {
      const rawResult = runAgentBrowser([
        "--session",
        session,
        "eval",
        `JSON.stringify((() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) { throw new Error("Mega menu element not found"); } const rect = el.getBoundingClientRect(); return { left: rect.left, right: rect.right, width: rect.width, viewport: window.innerWidth }; })())`,
      ]);
      const parsedResult = JSON.parse(rawResult);
      return typeof parsedResult === "string" ? JSON.parse(parsedResult) : parsedResult;
    })();

  try {
    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Session may not exist yet.
    }

    runAgentBrowser(["--session", session, "set", "viewport", "1266", "768"]);
    runAgentBrowser(["--allow-file-access", "--session", session, "open", homepageFileUrl]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const leftMenuBox = getMenuBox(".desk-nav-item:first-child .desk-mega");
    assert.ok(
      leftMenuBox.left >= 0,
      `expected the first mega menu to stay within the left viewport edge, received ${JSON.stringify(leftMenuBox)}`,
    );
    assert.ok(
      leftMenuBox.right <= leftMenuBox.viewport,
      `expected the first mega menu to stay within the right viewport edge, received ${JSON.stringify(leftMenuBox)}`,
    );

    const rightMenuBox = getMenuBox(".desk-nav-item:last-child .desk-mega");
    assert.ok(
      rightMenuBox.left >= 0,
      `expected the last mega menu to stay within the left viewport edge, received ${JSON.stringify(rightMenuBox)}`,
    );
    assert.ok(
      rightMenuBox.right <= rightMenuBox.viewport,
      `expected the last mega menu to stay within the right viewport edge, received ${JSON.stringify(rightMenuBox)}`,
    );
  } finally {
    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Ignore cleanup failures.
    }
  }
});

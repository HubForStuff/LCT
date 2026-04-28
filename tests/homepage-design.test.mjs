import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, spawn, spawnSync } from "node:child_process";

const testDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDir, "..");
const distIndexPath = resolve(projectRoot, "dist", "index.html");
const homepageCssPath = resolve(projectRoot, "src/styles/homepage.css");
const localizationClientPath = resolve(projectRoot, "src/components/i18n/LocalizationClient.astro");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCssRuleDeclarations = (css, selector) => {
  const match = css.match(new RegExp(`${escapeRegExp(selector)}\\s*\\{([^}]*)\\}`));

  assert.ok(match, `expected to find CSS rule for ${selector}`);

  return match[1]
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .reduce((declarations, declaration) => {
      const separatorIndex = declaration.indexOf(":");
      assert.notEqual(separatorIndex, -1, `expected valid declaration in ${selector}: ${declaration}`);

      const property = declaration.slice(0, separatorIndex).trim();
      const value = declaration.slice(separatorIndex + 1).trim().replace(/\s+/g, " ");
      declarations.set(property, value);

      return declarations;
    }, new Map());
};

const assertCssDeclaration = (declarations, property, expectedValue) => {
  assert.equal(declarations.get(property), expectedValue, `expected ${property}: ${expectedValue}`);
};

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

test("homepage desktop header language controls match Batch A feedback", () => {
  const css = readFileSync(homepageCssPath, "utf8");

  const navInner = getCssRuleDeclarations(css, ".desktop-home .desk-nav-inner");
  assertCssDeclaration(navInner, "gap", "0");

  const nav = getCssRuleDeclarations(css, ".desktop-home .desk-nav-inner > nav");
  assertCssDeclaration(nav, "justify-content", "flex-start");

  const navList = getCssRuleDeclarations(css, ".desktop-home .desk-nav-list");
  assertCssDeclaration(navList, "padding-left", "58px");

  const langButton = getCssRuleDeclarations(css, ".desktop-home .desk-lang-btn");
  assertCssDeclaration(langButton, "width", "36px");
  assertCssDeclaration(langButton, "height", "36px");
  assertCssDeclaration(langButton, "padding", "0");
  assertCssDeclaration(langButton, "border-radius", "50%");
  assertCssDeclaration(langButton, "color", "#555555");

  const activeCode = getCssRuleDeclarations(css, ".desktop-home .desk-lang-active-code");
  assertCssDeclaration(activeCode, "display", "none");

  const langMenu = getCssRuleDeclarations(css, ".desktop-home .desk-lang-menu");
  assertCssDeclaration(langMenu, "top", "calc(100% + 8px)");
  assertCssDeclaration(langMenu, "min-width", "80px");
  assertCssDeclaration(langMenu, "padding", "6px");
  assertCssDeclaration(langMenu, "border-radius", "12px");
  assertCssDeclaration(langMenu, "background", "rgba(8, 8, 8, 0.58)");
  assertCssDeclaration(langMenu, "backdrop-filter", "blur(12px)");
  assertCssDeclaration(langMenu, "transform", "translateY(-6px)");

  const langOption = getCssRuleDeclarations(css, ".desktop-home .desk-lang-option");
  assertCssDeclaration(langOption, "justify-content", "flex-start");
  assertCssDeclaration(langOption, "gap", "6px");
  assertCssDeclaration(langOption, "padding", "7px 12px");
  assertCssDeclaration(langOption, "border-radius", "8px");
  assertCssDeclaration(langOption, "font-size", "12px");
  assertCssDeclaration(langOption, "font-weight", "600");
  assertCssDeclaration(langOption, "color", "var(--desk-red)");

  const langOptionLabel = getCssRuleDeclarations(css, ".desktop-home .desk-lang-option small");
  assertCssDeclaration(langOptionLabel, "opacity", "0");
  assertCssDeclaration(langOptionLabel, "max-width", "0");
  assertCssDeclaration(langOptionLabel, "overflow", "hidden");

  const langOptionHoverLabel = getCssRuleDeclarations(
    css,
    ".desktop-home .desk-lang-option:hover small",
  );
  assertCssDeclaration(langOptionHoverLabel, "opacity", "1");
  assertCssDeclaration(langOptionHoverLabel, "max-width", "160px");
});

test("homepage desktop footer matches Batch B feedback", () => {
  const css = readFileSync(homepageCssPath, "utf8");

  const footerCta = getCssRuleDeclarations(css, ".desktop-home .desk-footer-cta-inner");
  assertCssDeclaration(footerCta, "padding", "53px 88px");

  const footerMain = getCssRuleDeclarations(css, ".desktop-home .desk-footer-main");
  assertCssDeclaration(footerMain, "padding", "44px 88px 35px");

  const footerLinks = getCssRuleDeclarations(css, ".desktop-home .desk-footer-group-links");
  assertCssDeclaration(footerLinks, "gap", "7px");

  const footerLink = getCssRuleDeclarations(css, ".desktop-home .desk-footer-group-links a");
  assertCssDeclaration(footerLink, "font-size", "16px");
  assertCssDeclaration(footerLink, "line-height", "1.15");

  const newsletterInput = getCssRuleDeclarations(css, ".desktop-home .desk-footer-newsletter input");
  assertCssDeclaration(newsletterInput, "width", "186px");
  assertCssDeclaration(newsletterInput, "outline", "none");
  assertCssDeclaration(newsletterInput, "transition", "border-color 0.18s ease");

  const newsletterInputFocus = getCssRuleDeclarations(
    css,
    ".desktop-home .desk-footer-newsletter input:focus",
  );
  assertCssDeclaration(newsletterInputFocus, "border-color", "var(--desk-red)");
  assertCssDeclaration(newsletterInputFocus, "box-shadow", "none");

  const newsletterPlaceholder = getCssRuleDeclarations(
    css,
    ".desktop-home .desk-footer-newsletter input::placeholder",
  );
  assertCssDeclaration(newsletterPlaceholder, "color", "#8a8a8a");
  assertCssDeclaration(newsletterPlaceholder, "font-size", "12px");

  const subscribe = getCssRuleDeclarations(css, ".desktop-home .desk-footer-subscribe");
  assertCssDeclaration(subscribe, "min-width", "170px");
  assertCssDeclaration(subscribe, "font-size", "13px");

  const wechatPopup = getCssRuleDeclarations(css, ".desktop-home .desk-wechat-popup");
  assertCssDeclaration(wechatPopup, "right", "calc(100% + 12px)");
  assertCssDeclaration(wechatPopup, "top", "-52px");
  assertCssDeclaration(wechatPopup, "bottom", "auto");
  assertCssDeclaration(wechatPopup, "transform", "translateX(8px)");

  const wechatVisible = getCssRuleDeclarations(
    css,
    ".desktop-home .desk-wechat:hover .desk-wechat-popup,\n  .desktop-home .desk-wechat:focus-within .desk-wechat-popup",
  );
  assertCssDeclaration(wechatVisible, "transform", "translateX(0)");

  const html = readFileSync(resolve(projectRoot, "src/components/home/DesktopFooter.astro"), "utf8");
  assert.match(
    html,
    /class="desk-social-btn desk-social-btn--whatsapp"/,
    "expected the footer WhatsApp link to expose the adjusted WhatsApp icon treatment",
  );
  assert.match(
    html,
    /M9\.5 8\.8/,
    "expected the footer WhatsApp icon to include the inner phone mark from the proposed design",
  );
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
    /href="\/competitions\/\?tab=startup"/,
    "expected the homepage startup competition link to activate the startup tab",
  );
  assert.match(
    html,
    /href="\/competitions\/\?tab=corporate"/,
    "expected the homepage corporate challenge link to activate the corporate tab",
  );
  assert.match(
    html,
    /href="\/news\/"/,
    "expected the homepage insights section to link to the full news listing route",
  );
  for (const href of ["/advisory/", "/events/", "/programs/", "/network/"]) {
    assert.match(
      html,
      new RegExp(`href="${href}"`),
      `expected the homepage navigation to link to ${href}`,
    );
  }

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
    /href="\/challenges\/china-market-entry-accelerator-2025\/"/,
    "expected the corporate submenu card to link to the highlighted challenge detail page",
  );
  assert.doesNotMatch(
    html,
    /ByteDance Corporate Challenge|Registration Open/,
    "expected the competitions submenu to stop rendering the old static card placeholders",
  );
});

test("Batch G homepage mobile competition cards and scroll header match feedback", () => {
  buildSite();

  const html = readFileSync(distIndexPath, "utf8");
  const css = readFileSync(homepageCssPath, "utf8");
  const localizationClient = readFileSync(localizationClientPath, "utf8");

  assert.match(
    html,
    /mob-comp-card mob-comp-card--red[\s\S]*mob-comp-card mob-comp-card--blue/,
    "expected the mobile competition cards to render left/red before right/blue",
  );
  assert.match(
    css,
    /@keyframes status-dot-pulse\s*\{/,
    "expected homepage status dots to use a shared pulsing animation",
  );
  assert.match(
    css,
    /\.desktop-home \.desk-comp-badge::before\s*\{[^}]*animation:\s*status-dot-pulse 2\.6s ease-in-out infinite;/s,
    "expected desktop competition status dots to pulse",
  );
  assert.match(
    css,
    /\.mobile-home \.mob-comp-card--red\s*\{[^}]*--status-dot-color:\s*var\(--mob-red\);[^}]*--status-pulse-glow:\s*rgba\(255,\s*45,\s*0,\s*0\.32\);/s,
    "expected the left mobile competition card to use the red pulsing dot",
  );
  assert.match(
    css,
    /\.mobile-home \.mob-comp-card--blue\s*\{[^}]*--status-dot-color:\s*var\(--mob-blue\);[^}]*--status-pulse-glow:\s*rgba\(0,\s*34,\s*255,\s*0\.32\);/s,
    "expected the right mobile competition card to use the blue pulsing dot",
  );
  assert.match(
    css,
    /\.mobile-home \.mob-comp-badge::before\s*\{[^}]*background:\s*var\(--status-dot-color\);[^}]*animation:\s*status-dot-pulse 2\.6s ease-in-out infinite;/s,
    "expected mobile competition status dots to pulse with their card color",
  );
  assert.match(
    css,
    /\.mobile-home \.mob-comp-card\s*\{[^}]*background:\s*#fff;[^}]*color:\s*#000;/s,
    "expected mobile competition cards to use the light-card treatment that keeps black text readable",
  );
  assert.match(
    css,
    /\.desktop-home \.desk-comp-square--red \.desk-comp-cta\s*\{[^}]*color:\s*#000;/s,
    "expected the marked desktop competition CTA text to be black",
  );
  assert.match(
    css,
    /\.mobile-home \.mob-comp-cta\s*\{[^}]*color:\s*#000;/s,
    "expected the marked mobile competition CTA text to be black",
  );
  assert.match(
    css,
    /\.mobile-home \.mob-nav\s*\{[^}]*transition:\s*background 0\.24s ease,\s*border-color 0\.24s ease,\s*box-shadow 0\.24s ease;/s,
    "expected the mobile header to animate its transparent scroll state",
  );
  assert.match(
    css,
    /\.mobile-home \.mob-nav\.is-scroll-transparent\s*\{[^}]*background:\s*rgba\(5,\s*5,\s*7,\s*0\.18\);[^}]*border-bottom-color:\s*transparent;/s,
    "expected the mobile header to become transparent on scroll down",
  );
  assert.match(
    localizationClient,
    /is-scroll-transparent/,
    "expected the localization client to toggle the mobile header transparent-scroll class",
  );
});

test("language switching localizes the homepage on desktop and mobile", async () => {
  buildSite();

  const port = 5600 + Math.floor(Math.random() * 400);
  const server = spawn("python3", ["-m", "http.server", String(port), "-d", "dist"], {
    cwd: projectRoot,
    stdio: "ignore",
  });
  const homepageUrl = `http://127.0.0.1:${port}/`;
  const session = `homepage-i18n-${Date.now()}`;

  try {
    await waitForServer(port);

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Session may not exist yet.
    }

    runAgentBrowser(["--session", session, "set", "viewport", "1440", "900"]);
    runAgentBrowser(["--session", session, "open", homepageUrl]);
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
    server.kill("SIGTERM");

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Ignore cleanup failures.
    }
  }
});

test("desktop mega menus stay within the viewport at narrow desktop widths", async () => {
  buildSite();

  const port = 6000 + Math.floor(Math.random() * 400);
  const server = spawn("python3", ["-m", "http.server", String(port), "-d", "dist"], {
    cwd: projectRoot,
    stdio: "ignore",
  });
  const homepageUrl = `http://127.0.0.1:${port}/`;
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
    await waitForServer(port);

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Session may not exist yet.
    }

    runAgentBrowser(["--session", session, "set", "viewport", "1266", "768"]);
    runAgentBrowser(["--session", session, "open", homepageUrl]);
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
    server.kill("SIGTERM");

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // Ignore cleanup failures.
    }
  }
});

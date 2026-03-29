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
  const competitionDetailRoute = resolve(projectRoot, "src/pages/competitions/[slug].astro");
  const preRegistrationRoute = resolve(projectRoot, "src/pages/pre-registration.astro");
  const newsIndexRoute = resolve(projectRoot, "src/pages/news/index.astro");
  const newsArticleRoute = resolve(projectRoot, "src/pages/news/[slug].astro");
  const contentLocalesDir = resolve(projectRoot, "src/content/interior-pages/locales");
  const readerModule = resolve(projectRoot, "src/lib/interior-pages/reader.ts");
  const newsReaderModule = resolve(projectRoot, "src/lib/news/reader.ts");
  const competitionsReaderModule = resolve(projectRoot, "src/lib/competitions/reader.ts");

  assert.equal(existsSync(competitionsRoute), true, "expected competitions route to exist");
  assert.equal(
    existsSync(competitionDetailRoute),
    true,
    "expected competition detail route to exist",
  );
  assert.equal(
    existsSync(preRegistrationRoute),
    true,
    "expected pre-registration route to exist",
  );
  assert.equal(existsSync(newsIndexRoute), true, "expected news index route to exist");
  assert.equal(existsSync(newsArticleRoute), true, "expected news article route to exist");
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
  assert.equal(
    existsSync(newsReaderModule),
    true,
    "expected news pages to use a dedicated Keystatic-backed reader",
  );
  assert.equal(
    existsSync(competitionsReaderModule),
    true,
    "expected competitions pages to use a dedicated Keystatic-backed reader",
  );

  const localeFiles = readdirSync(contentLocalesDir).filter((entry) => entry.endsWith(".json"));
  assert.deepEqual(
    localeFiles.sort(),
    ["br.json", "cn.json", "en.json"],
    `expected interior page locales for EN, BR, and CN, found ${localeFiles.join(", ")}`,
  );

  const competitionsSource = readProjectFile("src/pages/competitions.astro");
  const competitionDetailSource = readProjectFile("src/pages/competitions/[slug].astro");
  const preRegistrationSource = readProjectFile("src/pages/pre-registration.astro");
  const newsIndexSource = readProjectFile("src/pages/news/index.astro");
  const newsArticleSource = readProjectFile("src/pages/news/[slug].astro");

  assert.ok(
    competitionsSource.trim().split("\n").length < 80,
    "expected competitions route to stay thin",
  );
  assert.ok(
    preRegistrationSource.trim().split("\n").length < 80,
    "expected pre-registration route to stay thin",
  );
  assert.ok(
    competitionDetailSource.trim().split("\n").length < 120,
    "expected competition detail route to stay thin",
  );
  assert.ok(
    newsIndexSource.trim().split("\n").length < 80,
    "expected news index route to stay thin",
  );
  assert.ok(
    newsArticleSource.trim().split("\n").length < 120,
    "expected news article route to stay thin",
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
    newsIndexSource,
    /NewsIndexPage/,
    "expected news index route to delegate to a reusable page component",
  );
  assert.match(
    newsArticleSource,
    /NewsArticlePage/,
    "expected news article route to delegate to a reusable page component",
  );
  assert.match(
    competitionDetailSource,
    /CompetitionDetailPage/,
    "expected competition detail route to delegate to a reusable page component",
  );
  assert.match(
    competitionsSource,
    /interior-pages\.css/,
    "expected competitions route to import the dedicated interior stylesheet",
  );
  assert.match(
    competitionsSource,
    /getCompetitionsListingPageData\(/,
    "expected competitions route to load collection-backed content through the competitions reader",
  );
  assert.match(
    competitionDetailSource,
    /getCompetitionDetailPageData\(/,
    "expected competition detail route to load collection-backed content through the competitions reader",
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
    newsIndexSource,
    /LocalizationClient/,
    "expected news index route to include the shared localization client",
  );
  assert.match(
    newsArticleSource,
    /LocalizationClient/,
    "expected news article route to include the shared localization client",
  );
  assert.match(
    preRegistrationSource,
    /interior-pages\.css/,
    "expected pre-registration route to import the dedicated interior stylesheet",
  );
  assert.match(
    newsIndexSource,
    /interior-pages\.css/,
    "expected news index route to import the shared interior stylesheet",
  );
  assert.match(
    newsArticleSource,
    /interior-pages\.css/,
    "expected news article route to import the shared interior stylesheet",
  );
  assert.doesNotMatch(
    `${competitionsSource}\n${preRegistrationSource}\n${newsIndexSource}\n${newsArticleSource}`,
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
    const competitionDetailHtml = readFileSync(
      resolve(
        build.outDir,
        "competitions",
        "greater-tech-challenge-2025",
        "index.html",
      ),
      "utf8",
    );
    const preRegistrationHtml = readFileSync(
      resolve(build.outDir, "pre-registration", "index.html"),
      "utf8",
    );
    const newsIndexHtml = readFileSync(resolve(build.outDir, "news", "index.html"), "utf8");
    const newsArticleHtml = readFileSync(
      resolve(
        build.outDir,
        "news",
        "why-chinese-giants-need-latam-startups-more-than-ever",
        "index.html",
      ),
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
      competitionsHtml,
      /href="\/competitions\/greater-tech-challenge-2025\/"/,
      "expected the competitions listing to link to generated detail pages",
    );
    assert.match(
      competitionsHtml,
      /\[TEST DATA\]/i,
      "expected the competitions listing to include clearly marked test data entries",
    );

    assert.match(
      competitionDetailHtml,
      /Greater Tech Challenge 2025/i,
      "expected the competition detail page title to render",
    );
    assert.match(
      competitionDetailHtml,
      /Apply Now|Apply to this challenge/i,
      "expected the competition detail page to include the application CTA",
    );
    assert.match(
      competitionDetailHtml,
      /href="\/pre-registration\/\?competition=greater-tech-challenge-2025"/,
      "expected the competition detail page CTA to pass the selected competition into the shared form route",
    );

    assert.match(
      preRegistrationHtml,
      /Competition Application|Pre-Registration|Application Form/i,
      "expected the shared competition application form heading",
    );
    assert.match(
      preRegistrationHtml,
      /This is a Pre-Registration/i,
      "expected the shared form to keep the original black-banner headline",
    );
    assert.match(
      preRegistrationHtml,
      /Application coaching/i,
      "expected the original black-banner support items to remain visible",
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
      /Project Information/i,
      "expected the form to retain the shared project-information section",
    );
    assert.match(
      preRegistrationHtml,
      /Submit/i,
      "expected the final submit CTA",
    );

    const benefitCount = (preRegistrationHtml.match(/benefit-item/g) ?? []).length;
    assert.ok(
      benefitCount >= 8,
      `expected at least 8 benefit options, found ${benefitCount}`,
    );

    assert.match(
      newsIndexHtml,
      /News\s*&amp;\s*Insights|News\s*&\s*Insights/i,
      "expected the news listing page heading",
    );
    assert.match(
      newsIndexHtml,
      /Why Chinese Giants Need LATAM Startups More Than Ever/i,
      "expected the seeded article to appear on the news listing page",
    );
    assert.match(
      newsIndexHtml,
      /Why 73% of Startups Fail in Cross-Border Market Entry/i,
      "expected the fourth mockup article to appear on the news listing page",
    );
    assert.match(
      newsIndexHtml,
      /The Rise of AgriTech Corridors Between China and Brazil/i,
      "expected the fifth mockup article to appear on the news listing page",
    );
    assert.match(
      newsIndexHtml,
      /href="\/news\/why-chinese-giants-need-latam-startups-more-than-ever\/"/,
      "expected the news listing page to link to seeded article detail pages",
    );

    const newsCardCount = (newsIndexHtml.match(/class="news-list-card/g) ?? []).length;
    assert.ok(
      newsCardCount >= 4,
      `expected at least 4 grid cards beneath the featured article, found ${newsCardCount}`,
    );

    assert.match(
      newsArticleHtml,
      /Why Chinese Giants Need LATAM Startups More Than Ever/i,
      "expected the seeded news detail page title",
    );
    assert.match(
      newsArticleHtml,
      /Back to all insights/i,
      "expected the news detail page to include the back-to-list CTA",
    );
    assert.match(
      newsArticleHtml,
      /Cross-border execution is no longer a side bet/i,
      "expected the news detail page to render article body content",
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
    runAgentBrowser([
      "--session",
      session,
      "open",
      `http://127.0.0.1:${port}/competitions/greater-tech-challenge-2025/`,
    ]);
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
      ".competition-meta-label",
    ]);

    assert.match(
      competitionsHeading,
      /Greater Tech Challenge|竞赛|挑战/u,
      "expected the competition detail heading to switch to Chinese",
    );
    assert.match(
      competitionsFilter,
      /状态|阶段/u,
      "expected the competition detail metadata to switch to Chinese",
    );

    runAgentBrowser([
      "--session",
      session,
      "open",
      `http://127.0.0.1:${port}/pre-registration/?competition=greater-tech-challenge-2025`,
    ]);
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
      /Aplica|Inscri/i,
      "expected the shared competition application heading to switch to Portuguese",
    );
    assert.match(
      submitLabel,
      /Enviar|Inscri/i,
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

test("competition filters work on the listing page, names link to detail pages, and the application page surfaces the selected competition", { concurrency: false }, async () => {
  const build = buildSite();
  const port = 4500 + Math.floor(Math.random() * 500);
  const session = `competition-filters-${Date.now()}`;
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
    runAgentBrowser(["--session", session, "click", "[data-status-filter='future']"]);
    runAgentBrowser(["--session", session, "click", "[data-focus-filter='ai']"]);
    runAgentBrowser(["--session", session, "wait", "300"]);

    const visibleCards = runAgentBrowser([
      "--session",
      session,
      "eval",
      `(() => {
        const nodes = Array.from(document.querySelectorAll("#panel-startup [data-filter-item]"));
        return nodes.filter((node) => !node.hasAttribute("hidden")).length;
      })()`,
    ]);

    const filteredHeading = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      "#panel-startup [data-filter-item]:not([hidden]) [data-competition-name-link]",
    ]);

    assert.match(visibleCards, /^1\s*$/, "expected the combined filters to leave exactly one visible startup competition");
    assert.match(
      filteredHeading,
      /\[TEST DATA\].*AI/i,
      "expected the future + AI filters to isolate the marked test-data entry",
    );

    runAgentBrowser([
      "--session",
      session,
      "click",
      "#panel-startup [data-filter-item]:not([hidden]) [data-competition-name-link]",
    ]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const detailHeading = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      ".competition-detail-title",
    ]);

    assert.match(
      detailHeading,
      /\[TEST DATA\].*AI/i,
      "expected clicking the competition name to open the matching detail page",
    );

    runAgentBrowser([
      "--session",
      session,
      "open",
      `http://127.0.0.1:${port}/pre-registration/?competition=test-data-ai-sandbox`,
    ]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const selectedCompetition = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      "[data-selected-competition-name]",
    ]);

    assert.match(
      selectedCompetition,
      /\[TEST DATA\].*AI/i,
      "expected the application page to surface the selected competition name",
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

test("news pages expose shared localization hooks and localize article content in the browser", { concurrency: false }, async () => {
  const build = buildSite();
  const newsArticleHtml = readFileSync(
    resolve(
      build.outDir,
      "news",
      "why-chinese-giants-need-latam-startups-more-than-ever",
      "index.html",
    ),
    "utf8",
  );

  assert.match(
    newsArticleHtml,
    /id="localized-content"/,
    "expected news pages to ship the shared localized content payload",
  );
  assert.match(
    newsArticleHtml,
    /data-lang-toggle/,
    "expected news pages to use the shared language switcher hooks",
  );
  assert.match(
    newsArticleHtml,
    /data-i18n-html="page\.bodyHtml"/,
    "expected news article bodies to use shared HTML localization hooks",
  );

  const port = 4800 + Math.floor(Math.random() * 500);
  const session = `news-i18n-${Date.now()}`;
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
    runAgentBrowser([
      "--session",
      session,
      "open",
      `http://127.0.0.1:${port}/news/why-chinese-giants-need-latam-startups-more-than-ever/`,
    ]);
    runAgentBrowser(["--session", session, "wait", "1000"]);
    runAgentBrowser(["--session", session, "click", ".site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-lang [data-lang-option='CN']"]);
    runAgentBrowser(["--session", session, "wait", "500"]);

    const articleHeading = runAgentBrowser(["--session", session, "get", "text", ".news-article-title"]);
    const articleBody = runAgentBrowser(["--session", session, "get", "text", ".news-article-body"]);

    assert.match(
      articleHeading,
      /中国科技巨头|拉美创业公司/u,
      "expected the news article title to switch to Chinese",
    );
    assert.match(
      articleBody,
      /跨境执行|拉美团队/u,
      "expected the news article body to switch to Chinese",
    );

    runAgentBrowser(["--session", session, "click", ".site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-lang [data-lang-option='BR']"]);
    runAgentBrowser(["--session", session, "wait", "500"]);

    const backLink = runAgentBrowser(["--session", session, "get", "text", ".news-back-link"]);

    assert.match(
      backLink,
      /Voltar|insights/i,
      "expected the news article back link to switch to Portuguese",
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

test("news listing keeps metadata visible and separates the featured CTA from the publish row", { concurrency: false }, async () => {
  const build = buildSite();
  const port = 4900 + Math.floor(Math.random() * 500);
  const session = `news-layout-${Date.now()}`;
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

    runAgentBrowser(["--session", session, "set", "viewport", "1440", "1400"]);
    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/news/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const rawLayoutMetrics = runAgentBrowser([
      "--session",
      session,
      "eval",
      `(() => {
        const featuredMeta = document.querySelector(".news-featured-copy .news-card-meta");
        const featuredButton = document.querySelector(".news-featured-copy .site-btn");
        const firstCard = document.querySelector(".news-list-card");
        const firstCardMeta = firstCard?.querySelector(".news-card-meta");

        if (!featuredMeta || !featuredButton || !firstCard || !firstCardMeta) {
          throw new Error("News layout elements not found");
        }

        const featuredMetaRect = featuredMeta.getBoundingClientRect();
        const featuredButtonRect = featuredButton.getBoundingClientRect();
        const firstCardRect = firstCard.getBoundingClientRect();
        const firstCardMetaRect = firstCardMeta.getBoundingClientRect();

        return JSON.stringify({
          featuredGap: featuredButtonRect.top - featuredMetaRect.bottom,
          firstCardMetaVisible: firstCardMetaRect.top >= firstCardRect.top && firstCardMetaRect.bottom <= firstCardRect.bottom,
          firstCardMetaBottomGap: firstCardRect.bottom - firstCardMetaRect.bottom
        });
      })()`,
    ]);
    const parsedLayoutMetrics = JSON.parse(rawLayoutMetrics);
    const layoutMetrics =
      typeof parsedLayoutMetrics === "string"
        ? JSON.parse(parsedLayoutMetrics)
        : parsedLayoutMetrics;

    assert.ok(
      layoutMetrics.featuredGap >= 16,
      `expected at least 16px between featured meta row and CTA, received ${layoutMetrics.featuredGap}`,
    );
    assert.equal(
      layoutMetrics.firstCardMetaVisible,
      true,
      `expected first card metadata to remain fully visible, received ${JSON.stringify(layoutMetrics)}`,
    );
    assert.ok(
      layoutMetrics.firstCardMetaBottomGap >= 16,
      `expected at least 16px of breathing room below the first card metadata, received ${layoutMetrics.firstCardMetaBottomGap}`,
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

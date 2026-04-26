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

const resolvePythonExecutable = () => {
  const resolved = spawnSync(
    "python3",
    ["-c", "import os, sys; print(os.path.realpath(sys.executable))"],
    {
      cwd: projectRoot,
      encoding: "utf8",
    },
  );

  assert.equal(
    resolved.status,
    0,
    `Failed to resolve python executable.\nSTDOUT:\n${resolved.stdout}\nSTDERR:\n${resolved.stderr}`,
  );

  const executablePath = resolved.stdout.trim();
  assert.equal(
    existsSync(executablePath),
    true,
    `Resolved python executable does not exist: ${executablePath}`,
  );

  return executablePath;
};

const pythonExecutable = resolvePythonExecutable();

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
      /Back/i,
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

test("interior header supports homepage mega-menu layout variants", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const competitionsHtml = readFileSync(
      resolve(build.outDir, "competitions", "index.html"),
      "utf8",
    );
    const interiorStyles = readProjectFile("src/styles/interior-pages.css");

    assert.match(
      competitionsHtml,
      /site-mega-grid--two-cards/,
      "expected interior header to render the two-cards mega-menu variant",
    );
    assert.match(
      competitionsHtml,
      /data-i18n="desktopMenuSections\.1\.card2\.title"/,
      "expected the competitions mega menu to render the secondary card content",
    );
    assert.match(
      competitionsHtml,
      /data-i18n="desktopMenuSections\.1\.card\.title">\s*Greater Tech Challenge 2025\s*</,
      "expected the interior competitions submenu to surface the featured startup competition",
    );
    assert.match(
      competitionsHtml,
      /data-i18n="desktopMenuSections\.1\.card2\.title">\s*China Market Entry Accelerator 2025\s*</,
      "expected the interior competitions submenu to surface the featured corporate challenge",
    );
    assert.match(
      competitionsHtml,
      /href="\/competitions\/greater-tech-challenge-2025\/"/,
      "expected the interior startup submenu card to link to the competition detail page",
    );
    assert.match(
      competitionsHtml,
      /href="\/competitions\/china-market-entry-accelerator-2025\/"/,
      "expected the interior corporate submenu card to link to the challenge detail page",
    );
    assert.match(
      competitionsHtml,
      /site-mega-grid--events/,
      "expected interior header to render the events mega-menu variant",
    );
    assert.match(
      competitionsHtml,
      /site-mega-event/,
      "expected interior header to render event cards for the events variant",
    );
    assert.match(
      competitionsHtml,
      /data-i18n="desktopMenuSections\.2\.events\.0\.title"/,
      "expected interior header events variant to localize event entries",
    );
    assert.match(
      interiorStyles,
      /\.site-mega-grid\s*\{[^}]*background:\s*#080808;[^}]*\}/s,
      "expected the interior mega menu shell to use an opaque background instead of transparency",
    );
    assert.match(
      interiorStyles,
      /\.site-mega-grid\s*\{[^}]*gap:\s*44px;[^}]*padding:\s*20px 42px 22px;[^}]*\}/s,
      "expected the interior mega menu shell to match the homepage submenu spacing and height",
    );
    assert.doesNotMatch(
      interiorStyles,
      /\.site-mega-grid\s*\{[^}]*height:\s*260px;[^}]*\}/s,
      "expected the interior mega menu shell to avoid the old fixed taller height",
    );
    assert.match(
      interiorStyles,
      /\.site-lang-menu\s*\{[^}]*top:\s*calc\(100% \+ 2px\);/s,
      "expected the header language menu to stay close to the globe trigger",
    );
  } finally {
    build.cleanup();
  }
});

test("interior footer matches homepage structure without legacy bottom note row", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const competitionsHtml = readFileSync(
      resolve(build.outDir, "competitions", "index.html"),
      "utf8",
    );
    const interiorStyles = readProjectFile("src/styles/interior-pages.css");

    assert.doesNotMatch(
      competitionsHtml,
      /data-i18n="footer\.bottomNote"/,
      "expected interior footer to remove the legacy localized bottom note",
    );
    assert.doesNotMatch(
      competitionsHtml,
      /class="site-footer-bottom"/,
      "expected interior footer to remove the old bottom row wrapper",
    );
    assert.match(
      competitionsHtml,
      /class="site-footer-newsletter"/,
      "expected interior footer to keep newsletter section",
    );
    assert.match(
      competitionsHtml,
      /class="site-footer-socials"/,
      "expected interior footer to keep social links section",
    );
    assert.match(
      competitionsHtml,
      /class="site-wechat"/,
      "expected interior footer socials to include homepage-style WeChat wrapper",
    );
    assert.match(
      competitionsHtml,
      /class="site-wechat-popup"/,
      "expected interior footer WeChat control to expose the QR popup container",
    );
    assert.match(
      competitionsHtml,
      /data-i18n="footer\.scanWechat"/,
      "expected interior footer WeChat popup to keep shared localized scan label",
    );
    assert.match(
      competitionsHtml,
      /data-i18n-aria-label="footer\.scanWechat"/,
      "expected interior footer WeChat button to localize its accessible label through the shared hooks",
    );
    assert.doesNotMatch(
      competitionsHtml,
      /aria-label="WeChat"/,
      "expected interior footer WeChat button to avoid a hard-coded English accessible label",
    );
    assert.match(
      competitionsHtml,
      /class="site-lang site-lang--footer site-lang--right"/,
      "expected interior footer to keep shared footer language switcher",
    );
    assert.match(
      competitionsHtml,
      /class="site-footer-bottom-stripe"/,
      "expected interior footer to keep the bottom animated stripe",
    );
    assert.match(
      interiorStyles,
      /\.site-wechat:hover \.site-wechat-popup,\s*\.site-wechat:focus-within \.site-wechat-popup\s*\{/s,
      "expected interior footer WeChat popup to be reachable on keyboard focus as well as hover",
    );
    assert.match(
      interiorStyles,
      /\.site-footer-hero\s*\{[^}]*padding:\s*59px 0;/s,
      "expected interior footer hero spacing to match the competitions mockup",
    );
    assert.match(
      interiorStyles,
      /\.site-footer-title\s*\{[^}]*font-size:\s*clamp\(26px,\s*2\.6vw,\s*40px\);/s,
      "expected interior footer heading scale to match the competitions mockup",
    );
    assert.match(
      interiorStyles,
      /\.site-footer-newsletter-row input\s*\{[^}]*width:\s*150px;[^}]*height:\s*38px;/s,
      "expected interior footer newsletter input sizing to match the competitions mockup",
    );
    assert.match(
      interiorStyles,
      /\.site-wechat-popup\s*\{[^}]*top:\s*50%;[^}]*right:\s*calc\(100% \+ 10px\);[^}]*background:\s*rgba\(255, 255, 255, 0\.95\);/s,
      "expected interior footer WeChat popup to use the light side-aligned mockup treatment",
    );
    assert.match(
      interiorStyles,
      /\.site-lang--footer \.site-lang-menu\s*\{[^}]*top:\s*auto;[^}]*bottom:\s*calc\(100% \+ 8px\);/s,
      "expected footer language menu to open above the icon so it avoids the bottom stripe",
    );
  } finally {
    build.cleanup();
  }
});

test("competitions listing/detail Batch B polish matches approved copy and shell styling", { concurrency: false }, () => {
  const build = buildSite();
  const featuredCompetitionContent = JSON.parse(
    readProjectFile("src/content/competitions/greater-tech-challenge-2025.json"),
  );

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
    const interiorStyles = readProjectFile("src/styles/interior-pages.css");

    const startupPanelMatch = competitionsHtml.match(
      /<section[^>]*data-tab-panel="startup"[\s\S]*?<\/section>/i,
    );
    const challengePanelMatch = competitionsHtml.match(
      /<section[^>]*data-tab-panel="corporate"[\s\S]*?<\/section>/i,
    );

    assert.ok(startupPanelMatch, "expected startup tab panel to render");
    assert.ok(challengePanelMatch, "expected corporate challenge tab panel to render");

    assert.equal(
      featuredCompetitionContent.br.featuredTag,
      "Competição em destaque",
      "expected the Portuguese startup featured tag to use competition wording",
    );
    assert.equal(
      featuredCompetitionContent.br.detailEyebrow,
      "Competição principal",
      "expected the Portuguese startup eyebrow to preserve accented competition wording",
    );
    assert.equal(
      featuredCompetitionContent.cn.featuredTag,
      "重点竞赛",
      "expected the Chinese startup featured tag to use competition wording",
    );

    const startupPanelHtml = startupPanelMatch?.[0] ?? "";
    const challengePanelHtml = challengePanelMatch?.[0] ?? "";

    assert.match(
      startupPanelHtml,
      />\s*Featured Competition\s*</i,
      "expected startup featured tag to use competition wording",
    );
    assert.doesNotMatch(
      startupPanelHtml,
      />\s*Featured Challenge\s*</i,
      "expected startup featured tag to avoid challenge wording",
    );

    assert.match(
      startupPanelHtml,
      />\s*Apply Now\s*</i,
      "expected startup competition CTAs to use the reviewed Apply Now wording",
    );
    assert.doesNotMatch(
      startupPanelHtml,
      />\s*View Challenge\s*</i,
      "expected startup competition CTAs to avoid legacy challenge wording",
    );

    assert.match(
      competitionDetailHtml,
      /class="news-back-link news-back-link--muted"/,
      "expected competition detail back link to use the muted treatment hook",
    );
    assert.match(
      interiorStyles,
      /\.competition-hero-image-placeholder\s*\{[^}]*min-height:\s*320px;[^}]*border-radius:\s*24px;[^}]*background:/s,
      "expected competition detail hero placeholder to render as a visible media block",
    );
    assert.match(
      interiorStyles,
      /\.competition-hero-card,\s*\.competition-meta-card,\s*\.competition-rich-card\s*\{[^}]*box-shadow:\s*0 16px 32px rgba\(15, 23, 42, 0\.06\);/s,
      "expected competition detail cards to use lighter shared shadows",
    );
    assert.match(
      interiorStyles,
      /\.competition-meta-card\s*\{[^}]*padding:\s*18px 20px;/s,
      "expected competition meta cards to reduce their vertical weight",
    );
    assert.match(
      interiorStyles,
      /\.competition-rich-card\s*\{[^}]*padding:\s*24px 26px;/s,
      "expected competition rich cards to use tighter spacing",
    );
    assert.match(
      interiorStyles,
      /\.featured-footer\s*\{[^}]*justify-content:\s*space-between;[^}]*flex-wrap:\s*nowrap;/s,
      "expected featured card footer to keep equal spacing on one row",
    );
    assert.doesNotMatch(
      interiorStyles,
      /\.featured-footer \.site-btn\s*\{[^}]*margin-left:\s*auto;/s,
      "expected featured footer spacing to come from the row layout rather than pushing only the CTA",
    );
    assert.match(
      competitionsHtml,
      /class="ccard-category-icon"[^>]*>\s*<svg width="12" height="12"/,
      "expected card category icons to use the mockup-sized card icon set",
    );
    assert.match(
      interiorStyles,
      /\.filters-bar\s*\{[^}]*gap:\s*8px;/s,
      "expected filter groups to use the mockup 8px gap",
    );

    for (const expectedCardIconColor of ["#2563EB", "#7c3aed", "#d97706", "#0d9488", "#475569", "#dc2626"]) {
      assert.match(
        competitionsHtml,
        new RegExp(`stroke="${expectedCardIconColor}"`, "i"),
        `expected card category icons to include mockup color ${expectedCardIconColor}`,
      );
    }
  } finally {
    build.cleanup();
  }
});

test("news Batch C styling hooks render and map to concrete muted/balanced CSS rules", { concurrency: false }, () => {
  const build = buildSite();

  try {
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
    const interiorStyles = readProjectFile("src/styles/interior-pages.css");

    assert.match(
      newsIndexHtml,
      /class="page-subtitle page-subtitle--wide page-subtitle--balanced"/,
      "expected news index subtitle to render the balancing hook",
    );
    assert.match(
      newsIndexHtml,
      /class="news-card-tag news-card-tag--muted"[^>]*data-tag-type="(?!report)[^"]+"/,
      "expected non-report news tags on the index page to render with the muted hook",
    );
    assert.match(
      newsArticleHtml,
      /class="news-list-link news-list-link--muted"/,
      "expected article related-content View All link to render with the muted hook",
    );

    assert.match(
      interiorStyles,
      /\.news-card-tag--muted\s*\{[^}]*color:\s*#64748b;/s,
      "expected muted news tags to receive a concrete gray color rule",
    );
    assert.match(
      interiorStyles,
      /\.page-subtitle--balanced\s*\{[^}]*text-wrap:\s*balance;/s,
      "expected balanced subtitle hook to apply text-wrap balancing",
    );
    assert.match(
      interiorStyles,
      /\.news-list-link--muted\s*\{[^}]*font-size:\s*0\.74rem;[^}]*letter-spacing:\s*0\.12em;[^}]*color:\s*#64748b;/s,
      "expected related-content View All muted link to use the smaller gray treatment",
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
  const server = spawn(pythonExecutable, ["-m", "http.server", String(port), "-d", build.outDir], {
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
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-option='CN']"]);
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
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-option='BR']"]);
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
  const server = spawn(pythonExecutable, ["-m", "http.server", String(port), "-d", build.outDir], {
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

    const competitionControlStyles = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify({
            tabFontSize: getComputedStyle(document.querySelector(".tab")).fontSize,
            tabFontWeight: getComputedStyle(document.querySelector(".tab")).fontWeight,
            filterFontSize: getComputedStyle(document.querySelector(".filter-pill")).fontSize,
            filterFontWeight: getComputedStyle(document.querySelector(".filter-pill")).fontWeight,
            filterLineHeight: getComputedStyle(document.querySelector(".filter-pill")).lineHeight,
            filterHeight: Math.round(document.querySelector(".filter-pill").getBoundingClientRect().height) + "px",
            sortFontSize: getComputedStyle(document.querySelector(".sort-select")).fontSize,
          })`,
        ]),
      ),
    );

    assert.deepEqual(
      competitionControlStyles,
      {
        tabFontSize: "26px",
        tabFontWeight: "800",
        filterFontSize: "14px",
        filterFontWeight: "500",
        filterLineHeight: "normal",
        filterHeight: "34px",
        sortFontSize: "13px",
      },
      `expected competition controls to render mockup typography, received ${JSON.stringify(competitionControlStyles)}`,
    );

    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-option='BR']"]);
    runAgentBrowser(["--session", session, "wait", "500"]);

    const portugueseFeaturedTag = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      "#panel-startup .featured-tag-pill",
    ]);

    assert.match(
      portugueseFeaturedTag,
      /Competição em destaque/i,
      "expected the visible startup featured tag to switch to Portuguese competition wording",
    );

    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-option='CN']"]);
    runAgentBrowser(["--session", session, "wait", "500"]);

    const chineseFeaturedTag = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      "#panel-startup .featured-tag-pill",
    ]);

    assert.match(
      chineseFeaturedTag,
      /重点竞赛/u,
      "expected the visible startup featured tag to switch to Chinese competition wording",
    );

    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-option='EN']"]);
    runAgentBrowser(["--session", session, "wait", "500"]);

    runAgentBrowser(["--session", session, "click", "[data-status-filter='future']"]);
    runAgentBrowser(["--session", session, "click", "[data-focus-filter='ai']"]);
    runAgentBrowser(["--session", session, "wait", "300"]);

    const visibleCards = runAgentBrowser([
      "--session",
      session,
      "eval",
      `(() => {
        const nodes = Array.from(document.querySelectorAll("#panel-startup [data-filter-item]"));
        return nodes.filter((node) => {
          const style = window.getComputedStyle(node);
          const rect = node.getBoundingClientRect();
          return !node.hasAttribute("hidden") && style.display !== "none" && rect.height > 0;
        }).length;
      })()`,
    ]);

    const filteredHeading = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      "#panel-startup [data-filter-item]:not([hidden]) [data-competition-name-link]",
    ]);
    const filteredHref = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify((() => {
            const link = document.querySelector('#panel-startup [data-filter-item]:not([hidden]) [data-competition-name-link]');
            return link?.getAttribute('href') ?? null;
          })())`,
        ]),
      ),
    );

    const tabCountState = JSON.parse(
      JSON.parse(
      runAgentBrowser([
        "--session",
        session,
        "eval",
        `JSON.stringify(
          Array.from(document.querySelectorAll("[data-tab-trigger]")).map((trigger) => {
            const tabId = trigger.getAttribute("data-tab-trigger");
            const panel = document.querySelector(\`[data-tab-panel="\${tabId}"]\`);
            const visibleCount = panel
              ? Array.from(panel.querySelectorAll("[data-filter-item]")).filter((node) => {
                  const style = window.getComputedStyle(node);
                  const rect = node.getBoundingClientRect();
                  return !node.hasAttribute("hidden") && style.display !== "none" && rect.height > 0;
                }).length
              : 0;

            return {
              tabId,
              renderedCount: trigger.querySelector(".tab-count")?.textContent?.trim() ?? "",
              visibleCount,
            };
          })
        )`,
      ]),
      ),
    );

    assert.match(visibleCards, /^1\s*$/, "expected the combined filters to leave exactly one visible startup competition");
    assert.match(
      filteredHeading,
      /\[TEST DATA\].*AI/i,
      "expected the future + AI filters to isolate the marked test-data entry",
    );
    assert.match(
      filteredHref,
      /\/competitions\/test-data-ai-sandbox\//,
      `expected the filtered startup link to point at the AI sandbox detail page, received ${filteredHref}`,
    );
    assert.equal(
      tabCountState.every((entry) => entry.renderedCount === String(entry.visibleCount)),
      true,
      `expected each tab badge to match the number of rendered items after filtering, received ${JSON.stringify(tabCountState)}`,
    );

    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}${filteredHref}`]);
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

test("interior footer WeChat popup is reachable on keyboard focus", { concurrency: false }, async () => {
  const build = buildSite();
  const port = 5000 + Math.floor(Math.random() * 500);
  const session = `interior-footer-focus-${Date.now()}`;
  const server = spawn(pythonExecutable, ["-m", "http.server", String(port), "-d", build.outDir], {
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

    runAgentBrowser(["--session", session, "set", "viewport", "1440", "1200"]);
    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/news/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);
    runAgentBrowser([
      "--session",
      session,
      "eval",
      "document.querySelector('.site-wechat .site-social-btn')?.focus()",
    ]);
    runAgentBrowser(["--session", session, "wait", "150"]);

    const popupState = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify((() => {
            const popup = document.querySelector('.site-wechat-popup');
            if (!popup) {
              throw new Error('WeChat popup not found');
            }

            const style = window.getComputedStyle(popup);
            return {
              opacity: style.opacity,
              pointerEvents: style.pointerEvents,
            };
          })())`,
        ]),
      ),
    );

    assert.equal(popupState.opacity, "1", `expected WeChat popup opacity to be 1 on keyboard focus, received ${JSON.stringify(popupState)}`);
    assert.equal(popupState.pointerEvents, "auto", `expected WeChat popup to accept pointer events on keyboard focus, received ${JSON.stringify(popupState)}`);
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

test("interior footer language switch localizes footer controls at runtime", { concurrency: false }, async () => {
  const build = buildSite();
  const port = 5200 + Math.floor(Math.random() * 500);
  const session = `interior-footer-i18n-${Date.now()}`;
  const server = spawn(pythonExecutable, ["-m", "http.server", String(port), "-d", build.outDir], {
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

    runAgentBrowser(["--session", session, "set", "viewport", "1440", "1200"]);
    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/news/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);
    runAgentBrowser(["--session", session, "click", ".site-footer-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-footer-lang [data-lang-option='BR']"]);
    runAgentBrowser(["--session", session, "wait", "500"]);

    const footerButton = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      ".site-footer-subscribe",
    ]);

    assert.match(
      footerButton,
      /Substack/i,
      "expected the footer language switcher to update the footer subscribe control at runtime",
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
  const server = spawn(pythonExecutable, ["-m", "http.server", String(port), "-d", build.outDir], {
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
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-option='CN']"]);
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

    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-toggle]"]);
    runAgentBrowser(["--session", session, "click", ".site-header .site-lang [data-lang-option='BR']"]);
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
  const server = spawn(pythonExecutable, ["-m", "http.server", String(port), "-d", build.outDir], {
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

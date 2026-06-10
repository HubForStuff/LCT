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
  const challengeDetailRoute = resolve(projectRoot, "src/pages/challenges/[slug].astro");
  const preRegistrationRoute = resolve(projectRoot, "src/pages/pre-registration.astro");
  const newsIndexRoute = resolve(projectRoot, "src/pages/news/index.astro");
  const newsArticleRoute = resolve(projectRoot, "src/pages/news/[slug].astro");
  const staticPageRoute = resolve(projectRoot, "src/pages/[slug].astro");
  const contentLocalesDir = resolve(projectRoot, "src/content/interior-pages/locales");
  const readerModule = resolve(projectRoot, "src/lib/interior-pages/reader.ts");
  const newsReaderModule = resolve(projectRoot, "src/lib/news/reader.ts");
  const competitionsReaderModule = resolve(projectRoot, "src/lib/competitions/reader.ts");
  const staticPagesReaderModule = resolve(projectRoot, "src/lib/static-pages/reader.ts");

  assert.equal(existsSync(competitionsRoute), true, "expected competitions route to exist");
  assert.equal(
    existsSync(competitionDetailRoute),
    true,
    "expected competition detail route to exist",
  );
  assert.equal(
    existsSync(challengeDetailRoute),
    true,
    "expected challenge detail route aliases to exist",
  );
  assert.equal(
    existsSync(preRegistrationRoute),
    true,
    "expected pre-registration route to exist",
  );
  assert.equal(existsSync(newsIndexRoute), true, "expected news index route to exist");
  assert.equal(existsSync(newsArticleRoute), true, "expected news article route to exist");
  assert.equal(existsSync(staticPageRoute), true, "expected generated static page route to exist");
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
  assert.equal(
    existsSync(staticPagesReaderModule),
    true,
    "expected static pages to use a dedicated Keystatic-backed reader",
  );

  const localeFiles = readdirSync(contentLocalesDir).filter((entry) => entry.endsWith(".json"));
  assert.deepEqual(
    localeFiles.sort(),
    ["br.json", "cn.json", "en.json"],
    `expected interior page locales for EN, BR, and CN, found ${localeFiles.join(", ")}`,
  );

  const competitionsSource = readProjectFile("src/pages/competitions.astro");
  const competitionDetailSource = readProjectFile("src/pages/competitions/[slug].astro");
  const challengeDetailSource = readProjectFile("src/pages/challenges/[slug].astro");
  const preRegistrationSource = readProjectFile("src/pages/pre-registration.astro");
  const newsIndexSource = readProjectFile("src/pages/news/index.astro");
  const newsArticleSource = readProjectFile("src/pages/news/[slug].astro");
  const staticPageSource = readProjectFile("src/pages/[slug].astro");

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
    challengeDetailSource.trim().split("\n").length < 120,
    "expected challenge detail route to stay thin",
  );
  assert.ok(
    newsIndexSource.trim().split("\n").length < 80,
    "expected news index route to stay thin",
  );
  assert.ok(
    newsArticleSource.trim().split("\n").length < 120,
    "expected news article route to stay thin",
  );
  assert.ok(
    staticPageSource.trim().split("\n").length < 120,
    "expected generated static page route to stay thin",
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
    challengeDetailSource,
    /CompetitionDetailPage/,
    "expected challenge detail route to reuse the competition detail component",
  );
  assert.match(
    staticPageSource,
    /StaticPage/,
    "expected generated static page route to delegate to a reusable page component",
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
    challengeDetailSource,
    /getAllChallengeSlugs/,
    "expected challenge detail routes to be generated from corporate challenge entries",
  );
  assert.match(
    staticPageSource,
    /getStaticPageData\(/,
    "expected generated static pages to load collection-backed content through the static pages reader",
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
    staticPageSource,
    /LocalizationClient/,
    "expected generated static page route to include the shared localization client",
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
  assert.match(
    staticPageSource,
    /interior-pages\.css/,
    "expected generated static page route to import the shared interior stylesheet",
  );
  assert.doesNotMatch(
    `${competitionsSource}\n${preRegistrationSource}\n${newsIndexSource}\n${newsArticleSource}\n${staticPageSource}`,
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
    const challengeDetailPath = resolve(
      build.outDir,
      "challenges",
      "china-market-entry-accelerator-2025",
      "index.html",
    );
    const legacyChallengeDetailPath = resolve(
      build.outDir,
      "competitions",
      "china-market-entry-accelerator-2025",
      "index.html",
    );
    const preRegistrationHtml = readFileSync(
      resolve(build.outDir, "pre-registration", "index.html"),
      "utf8",
    );
    const homepageHtml = readFileSync(resolve(build.outDir, "index.html"), "utf8");
    const enInteriorLocale = JSON.parse(readProjectFile("src/content/interior-pages/locales/en.json"));
    const preRegistrationLocale = enInteriorLocale.preRegistrationPage;
    const expectedIndustryOptions = [
      "AI",
      "Biotech",
      "Deep Tech",
      "Education",
      "Energy & Climate",
      "Entertainment",
      "Fintech",
      "Food & AgriTech",
      "Healthtech",
      "Manufacturing",
      "Marketplaces",
      "Media & Community",
      "Mobility",
      "Proptech",
      "Robotics",
      "Security",
      "Other",
    ];
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
      homepageHtml,
      /href="\/competitions\/\?tab=startup"/,
      "expected homepage startup competition links to open the startup tab",
    );
    assert.match(
      homepageHtml,
      /href="\/competitions\/\?tab=corporate"/,
      "expected homepage corporate challenge links to open the corporate tab",
    );
    assert.doesNotMatch(
      homepageHtml,
      /Innovation Challenges/,
      "expected homepage/menu copy to use Corporate Challenges instead of Innovation Challenges",
    );
    assert.deepEqual(
      enInteriorLocale.footer.columns[1].links.map((link) => link.href),
      ["/competitions/?tab=startup", "/competitions/?tab=corporate"],
      "expected interior footer competition links to open the relevant listing tab",
    );
    assert.deepEqual(
      enInteriorLocale.competitionsPage.focusFilters.map((filter) => filter.label),
      ["All Industries", ...expectedIndustryOptions],
      "expected competitions focus filters to follow the requested industry taxonomy order",
    );
    assert.deepEqual(
      preRegistrationLocale.competitionFieldOptions,
      expectedIndustryOptions,
      "expected pre-registration competition fields to match the competitions taxonomy",
    );
    assert.match(
      competitionsHtml,
      /href="\/challenges\/china-market-entry-accelerator-2025\/"/,
      "expected corporate challenge cards to use challenge detail URLs",
    );
    assert.doesNotMatch(
      competitionsHtml,
      /href="\/competitions\/china-market-entry-accelerator-2025\/"/,
      "expected corporate challenge cards to avoid competition detail URLs",
    );
    assert.doesNotMatch(
      competitionsHtml,
      /class="featured-category"/,
      "expected the featured competition focus/category line to be removed",
    );
    assert.doesNotMatch(
      competitionsHtml,
      /\[TEST DATA\]/i,
      "expected the public competitions listing to exclude internal test data entries",
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
    assert.doesNotMatch(
      competitionDetailHtml,
      /class="competition-detail-category"/,
      "expected competition detail pages to remove the category line above the hero",
    );
    assert.equal(
      existsSync(challengeDetailPath),
      true,
      "expected corporate challenge detail pages to be generated under /challenges/",
    );
    assert.equal(
      existsSync(legacyChallengeDetailPath),
      false,
      "expected corporate challenge detail pages to avoid the /competitions/ route",
    );
    const challengeDetailHtml = readFileSync(challengeDetailPath, "utf8");
    assert.match(
      challengeDetailHtml,
      /Back to challenges/i,
      "expected challenge detail pages to use challenge-specific back copy",
    );
    assert.match(
      challengeDetailHtml,
      /href="\/competitions\/\?tab=corporate"/,
      "expected challenge detail back links to return to the corporate tab",
    );

    assert.match(
      preRegistrationHtml,
      /Competition\s*<br[^>]*>\s*<em>Registration<\/em>|Competition Registration/i,
      "expected the shared competition application heading to use registration copy",
    );
    assert.match(
      preRegistrationHtml,
      /Registration Open/i,
      "expected the application status label to be registration-mode copy",
    );
    assert.match(
      preRegistrationHtml,
      /Register now/i,
      "expected the shared form banner headline to be customizable by application mode",
    );
    assert.match(
      preRegistrationHtml,
      /Submit this form and <strong>LATAM CHINA TECH<\/strong> will personally guide you through your full application: reviewing your submission, strengthening your pitch, and maximizing your chances of winning\./i,
      "expected the banner body to use the generic application guidance copy",
    );
    assert.doesNotMatch(
      preRegistrationHtml,
      /full HICOOL application|Application coaching|prereg-support-card/i,
      "expected the top banner support card and HICOOL-specific copy to be removed",
    );
    assert.match(
      preRegistrationHtml,
      /data-application-mode="registration"/,
      "expected competition options to expose the content-managed registration mode",
    );
    assert.match(
      preRegistrationHtml,
      /Application Guide\s*&amp;\s*Tutorial|Application Guide\s*&\s*Tutorial/i,
      "expected the guide/tutorial callout",
    );
    assert.equal(
      preRegistrationLocale.guide.description,
      "If you need support, download our step-by-step PDF guide. It covers competition rules, timeline, and tips for a winning application. It's available in English, Spanish, and Portuguese.",
      "expected the pre-registration guide copy to match Batch F feedback",
    );
    assert.doesNotMatch(
      preRegistrationHtml,
      /class="tutorial-actions"[\s\S]*href="#"/,
      "expected placeholder pre-registration resource actions to avoid fake # links",
    );
    assert.match(
      preRegistrationHtml,
      /class="[^"]*site-btn--disabled[^"]*"[^>]*disabled/,
      "expected unavailable pre-registration resources to render as disabled controls",
    );
    assert.match(
      preRegistrationHtml,
      /Competition Information/i,
      "expected the first form section heading",
    );
    assert.equal(
      preRegistrationLocale.fields.companyHeadquarters,
      "Is your company a legally registered entity?",
      "expected the legal entity question to replace the headquarters question",
    );
    assert.deepEqual(
      preRegistrationLocale.companyHeadquartersOptions,
      ["Registered as a company", "Not yet established as a company"],
      "expected the legal entity options to remove country choices",
    );
    assert.match(
      preRegistrationHtml,
      /<input[^>]*id="compFullName"[^>]*required/,
      "expected Full Name of the Company to be required",
    );
    assert.equal(
      preRegistrationLocale.notes.applicant,
      "Instructions: The main applicant must be the company's largest shareholder, with 30% or more equity.",
      "expected the applicant note to match Batch F feedback",
    );
    assert.equal(
      preRegistrationLocale.fields.emailPlaceholder,
      "your@companyemail.com - Enter a valid email address to receive confirmations and updates.",
      "expected the email placeholder to match Batch F feedback",
    );
    assert.match(
      preRegistrationHtml,
      /Project Information/i,
      "expected the form to retain the shared project-information section",
    );
    assert.equal(
      preRegistrationLocale.sections.projectSubtitle,
      "Tell us about your startup - if you need, you can also use AI as a tool to help you write each section faster",
      "expected the project information helper copy to match Batch F feedback",
    );
    assert.equal(
      preRegistrationLocale.fields.investmentValue,
      "Progress to Date",
      "expected Investment Value to be renamed",
    );
    assert.equal(
      preRegistrationLocale.fields.investmentValuePlaceholder,
      "Describe what your company has achieved so far, such as product progress, users, specific revenue, and key milestones.",
      "expected the Progress to Date placeholder to match Batch F feedback",
    );
    assert.equal(
      preRegistrationLocale.fields.fundingAmountRequested,
      "Funding Amount Requested",
      "expected the new funding amount field to be content-managed",
    );
    assert.ok(
      preRegistrationHtml.indexOf('id="fundingAmountRequested"') >
        preRegistrationHtml.indexOf('id="investmentValue"'),
      "expected Funding Amount Requested to render immediately after Progress to Date",
    );
    assert.match(
      preRegistrationHtml,
      /Submit application/i,
      "expected the final submit CTA to use sentence case",
    );
    assert.match(
      preRegistrationHtml,
      /Save draft/i,
      "expected the draft CTA to use sentence case",
    );
    assert.doesNotMatch(
      preRegistrationHtml,
      /\[TEST DATA\]/i,
      "expected the pre-registration competition selector to exclude internal test data entries",
    );
    assert.equal(
      existsSync(resolve(build.outDir, "competitions", "test-data-ai-sandbox", "index.html")),
      false,
      "expected internal test-data competition detail pages to stay out of the public build",
    );

    const benefitCount = (preRegistrationHtml.match(/benefit-item/g) ?? []).length;
    assert.ok(
      benefitCount >= 8,
      `expected at least 8 benefit options, found ${benefitCount}`,
    );

    const interiorCss = readProjectFile("src/styles/interior-pages.css");
    assert.match(
      interiorCss,
      /\.page-eyebrow \.page-status-dot\s*\{[^}]*animation:\s*pulse-dot 1\.8s ease-in-out infinite;/s,
      "expected the pre-registration status dot to pulse",
    );
    assert.match(
      interiorCss,
      /\.form-row label,\s*\.label-like\s*\{[^}]*text-transform:\s*none;[^}]*letter-spacing:\s*0;/s,
      "expected pre-registration form labels to render in sentence case",
    );
    assert.match(
      interiorCss,
      /::placeholder\s*\{[^}]*color:\s*#bfbfbf;/s,
      "expected pre-registration placeholders to use the requested gray",
    );
    assert.match(
      interiorCss,
      /\.radio-pill input\s*\{[^}]*display:\s*none;/s,
      "expected radio inputs to hide the native black circle",
    );
    assert.match(
      interiorCss,
      /\.radio-pill:has\(input:checked\)\s*\{[^}]*background:\s*#ebebeb;[^}]*border-color:\s*#888888;/s,
      "expected selected radio pills to use the requested full-button gray state",
    );
    assert.match(
      interiorCss,
      /\.file-upload-icon\s*\{[^}]*font-size:\s*16px;/s,
      "expected file upload icons to be reduced in size",
    );
    assert.match(
      interiorCss,
      /textarea\.has-ai\s*\{[^}]*padding-bottom:\s*52px;/s,
      "expected textarea AI controls to avoid covering placeholder text",
    );
    assert.match(
      interiorCss,
      /\.benefit-item\s*\{[^}]*background:\s*#f7f7f7;[^}]*font-weight:\s*400;/s,
      "expected benefit options to use a gray unbold base style",
    );
    assert.match(
      interiorCss,
      /\.benefit-item:hover \.benefit-icon\s*\{[^}]*opacity:\s*1;/s,
      "expected benefit icons to become highlighted on hover",
    );
    assert.match(
      interiorCss,
      /\.submit-actions \.site-btn\s*\{[^}]*text-transform:\s*none;/s,
      "expected submit controls to use sentence case styling",
    );
    assert.match(
      interiorCss,
      /\.submit-actions \.site-btn--secondary::before\s*\{[^}]*display:\s*none;/s,
      "expected the save-draft button to remove the black dot",
    );
    assert.match(
      interiorCss,
      /\.submit-actions \.site-btn--primary\s*\{[^}]*min-width:\s*190px;/s,
      "expected the red submit button to be wider",
    );
    assert.match(
      interiorCss,
      /\.submit-actions \.site-btn--primary::before\s*\{[^}]*animation:\s*pulse-white-dot 2\.8s ease-in-out infinite;/s,
      "expected the submit button white dot to pulse slowly",
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
      /<a href="\/news\/" class="news-back-link">\s*<svg[\s\S]*?<\/svg>\s*<span data-i18n="articlePage\.backLabel">Back<\/span>\s*<\/a>/,
      "expected the localized news back link label to live beside the preserved arrow icon",
    );
    assert.doesNotMatch(
      newsArticleHtml,
      /<a href="\/news\/" class="news-back-link" data-i18n="articlePage\.backLabel"/,
      "expected localization to avoid replacing the entire news back link contents",
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

test("static pages build from Keystatic content and reuse the shared localization shell", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const expectedPages = [
      ["advisory", /Advisory Services/i, /Investment matchmaking/i],
      ["events", /Events\s*&amp;\s*Calendar|Events\s*&\s*Calendar/i, /Trade fairs and expos/i],
      ["programs", /Programs/i, /Market entry/i],
      ["network", /Network\s*&amp;\s*Partnerships|Network\s*&\s*Partnerships/i, /City partnerships/i],
    ];

    for (const [slug, titlePattern, bodyPattern] of expectedPages) {
      const html = readFileSync(resolve(build.outDir, slug, "index.html"), "utf8");

      assert.match(html, titlePattern, `expected /${slug}/ to render its page title`);
      assert.match(html, bodyPattern, `expected /${slug}/ to render seeded body content`);
      assert.match(
        html,
        /id="localized-content"/,
        `expected /${slug}/ to ship the shared localized content payload`,
      );
      assert.match(
        html,
        /data-i18n-html="page\.bodyHtml"/,
        `expected /${slug}/ body content to use shared localization hooks`,
      );
      assert.match(
        html,
        /Interior navigation|site-header|site-footer/,
        `expected /${slug}/ to reuse the shared interior shell`,
      );
    }
  } finally {
    build.cleanup();
  }
});

test("Batch C static page anchors, contact CTAs, and prepared page links are wired", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const homeHtml = readFileSync(resolve(build.outDir, "index.html"), "utf8");
    const networkHtml = readFileSync(resolve(build.outDir, "network", "index.html"), "utf8");
    const programsHtml = readFileSync(resolve(build.outDir, "programs", "index.html"), "utf8");
    const interiorStyles = readProjectFile("src/styles/interior-pages.css");

    assert.match(
      homeHtml,
      /href="\/network\/featured-speakers\/"/,
      "expected Featured Speakers menu links to route to the network sub-page",
    );
    assert.doesNotMatch(
      homeHtml,
      /href="\/speakers\/"/,
      "expected the removed top-level speakers route to no longer be linked",
    );
    assert.match(
      homeHtml,
      /href="\/events\/#trade-fairs-expos"[\s\S]*href="\/events\/#summits"/,
      "expected event submenu links to route to the dedicated events page anchors",
    );
    assert.match(
      homeHtml,
      /href="\/programs\/#market-entry"[\s\S]*href="\/programs\/#business-mission"/,
      "expected programs submenu links to route to standard programs page anchors",
    );
    assert.match(
      homeHtml,
      /href="\/network\/city-partnerships\/"/,
      "expected network city partnerships to route to the network sub-page",
    );
    assert.match(
      networkHtml,
      /href="#contact"/,
      "expected static page CTAs to use the shared contact target",
    );
    assert.doesNotMatch(
      networkHtml,
      /href="#site-footer"/,
      "expected static page CTAs not to point at the generic footer anchor",
    );
    assert.match(
      networkHtml,
      /id="contact"/,
      "expected the interior footer to expose a shared contact target",
    );
    assert.match(
      networkHtml,
      /href="\/network\/city-partnerships\/"/,
      "expected the network hub to link to the city partnerships sub-page",
    );
    assert.match(
      networkHtml,
      /href="\/network\/featured-speakers\/"/,
      "expected the network hub to link to the featured speakers sub-page",
    );
    assert.doesNotMatch(
      networkHtml,
      /id="active-partners"/,
      "expected the network hub to drop the active partners section card",
    );
    assert.match(
      programsHtml,
      /id="market-entry"[\s\S]*id="business-mission"/,
      "expected submenu anchor targets to remain present on the programs page",
    );
    assert.match(
      interiorStyles,
      /\.static-page-section-card:target\s*\{[^}]*transform:\s*scale\(1\.015\);[^}]*border-color:\s*rgba\(255,\s*59,\s*0,\s*0\.42\);/s,
      "expected anchored static page cards to enlarge and highlight when targeted",
    );
    assert.match(
      interiorStyles,
      /\.static-page-section-card\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s,
      "expected static page cards to align their CTAs with flex layout",
    );
    assert.match(
      interiorStyles,
      /\.static-page-section-link\s*\{[^}]*margin-top:\s*auto;/s,
      "expected static page CTA links to align along a consistent horizontal line",
    );
    assert.match(
      interiorStyles,
      /\.static-page-section-link:hover,[\s\S]*?\.static-page-section-link:focus\s*\{[^}]*color:\s*#ff3b00;/s,
      "expected static page CTA hover and focus states to turn red",
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
      /href="\/challenges\/china-market-entry-accelerator-2025\/"/,
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

test("Batch D mobile shell and controls expose usable navigation affordances", { concurrency: false }, async () => {
  const build = buildSite();
  const port = 5300 + Math.floor(Math.random() * 500);
  const session = `batch-d-mobile-${Date.now()}`;
  const server = spawn(pythonExecutable, ["-m", "http.server", String(port), "-d", build.outDir], {
    cwd: projectRoot,
    stdio: "ignore",
  });

  try {
    const competitionsHtml = readFileSync(
      resolve(build.outDir, "competitions", "index.html"),
      "utf8",
    );
    const homeHtml = readFileSync(resolve(build.outDir, "index.html"), "utf8");
    const interiorStyles = readProjectFile("src/styles/interior-pages.css");
    const homepageStyles = readProjectFile("src/styles/homepage.css");

    assert.match(
      competitionsHtml,
      /id="mobileMenuBtn"/,
      "expected interior pages to expose a mobile menu trigger",
    );
    assert.match(
      competitionsHtml,
      /class="site-mobile-menu"[^>]*id="mobileMenu"/,
      "expected interior pages to render a mobile navigation panel",
    );
    assert.match(
      competitionsHtml,
      /data-mobile-accordion/,
      "expected the interior mobile menu to reuse the shared accordion hook",
    );
    assert.match(
      competitionsHtml,
      /data-i18n="desktopMenuSections\.1\.links\.0\.title"/,
      "expected interior mobile menu items to localize from the shared desktop menu sections",
    );
    assert.match(
      competitionsHtml,
      /href="\/advisory\/"[\s\S]*href="\/competitions\/"[\s\S]*href="\/events\/"[\s\S]*href="\/programs\/"[\s\S]*href="\/network\/"/,
      "expected the interior mobile menu to include a path to each primary section",
    );
    assert.match(
      interiorStyles,
      /\.site-mobile-menu-btn\s*\{[^}]*display:\s*none;[^}]*\}/s,
      "expected the interior mobile menu button to stay hidden on desktop",
    );
    assert.match(
      interiorStyles,
      /@media \(max-width:\s*980px\)[\s\S]*\.site-mobile-menu-btn\s*\{[^}]*display:\s*inline-flex;/s,
      "expected the interior mobile menu button to appear at the mobile shell breakpoint",
    );
    assert.match(
      interiorStyles,
      /@media \(max-width:\s*720px\)[\s\S]*\.filters-bar\s*\{[^}]*flex-wrap:\s*nowrap;[^}]*overflow-x:\s*auto;/s,
      "expected mobile competition filters to use one compact horizontal scroll row",
    );
    assert.match(
      interiorStyles,
      /@media \(max-width:\s*720px\)[\s\S]*\.tab\s*\{[^}]*font-size:\s*18px;/s,
      "expected mobile competition tabs to use compact readable typography",
    );
    assert.match(
      homeHtml,
      /home-logo--mobile-wordmark/,
      "expected the mobile homepage to render a wordmark-specific brand mark",
    );
    assert.match(
      homepageStyles,
      /\.mobile-home \.mob-brand-wordmark\s*\{[^}]*width:\s*140px;[^}]*height:\s*28px;/s,
      "expected the mobile homepage wordmark to match the mockup dimensions",
    );

    await waitForServer(port);

    try {
      runAgentBrowser(["--session", session, "close"]);
    } catch {
      // session may not exist yet
    }

    runAgentBrowser(["--session", session, "set", "viewport", "390", "844"]);
    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/competitions/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const closedMenuState = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify((() => {
            const button = document.getElementById("mobileMenuBtn");
            const menu = document.getElementById("mobileMenu");
            if (!button || !menu) {
              throw new Error("Interior mobile menu controls not found");
            }

            const buttonStyle = getComputedStyle(button);
            return {
              buttonDisplay: buttonStyle.display,
              expanded: button.getAttribute("aria-expanded"),
              menuOpen: menu.classList.contains("is-open"),
            };
          })())`,
        ]),
      ),
    );

    assert.match(
      closedMenuState.buttonDisplay,
      /^(inline-)?flex$/,
      `expected the interior mobile menu trigger to be visible at 390px, received ${JSON.stringify(closedMenuState)}`,
    );
    assert.equal(
      closedMenuState.expanded,
      "false",
      `expected the interior mobile menu trigger to start collapsed, received ${JSON.stringify(closedMenuState)}`,
    );
    assert.equal(
      closedMenuState.menuOpen,
      false,
      `expected the interior mobile menu panel to start closed, received ${JSON.stringify(closedMenuState)}`,
    );

    runAgentBrowser(["--session", session, "click", "#mobileMenuBtn"]);
    runAgentBrowser(["--session", session, "wait", "250"]);

    const openMenuState = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify((() => {
            const button = document.getElementById("mobileMenuBtn");
            const menu = document.getElementById("mobileMenu");
            return {
              expanded: button?.getAttribute("aria-expanded") ?? "",
              menuOpen: menu?.classList.contains("is-open") ?? false,
              text: menu?.textContent ?? "",
              primaryLinks: Array.from(menu?.querySelectorAll(".site-mobile-menu-primary") ?? []).map((link) => link.getAttribute("href")),
            };
          })())`,
        ]),
      ),
    );

    assert.equal(
      openMenuState.expanded,
      "true",
      `expected the interior mobile menu trigger to track expanded state, received ${JSON.stringify(openMenuState)}`,
    );
    assert.equal(
      openMenuState.menuOpen,
      true,
      `expected the interior mobile menu panel to open after tapping the trigger, received ${JSON.stringify(openMenuState)}`,
    );
    assert.match(
      openMenuState.text,
      /Advisory|Competitions|Events|Programs|Network/i,
      `expected the open interior mobile menu to expose primary navigation text, received ${JSON.stringify(openMenuState)}`,
    );
    assert.deepEqual(
      openMenuState.primaryLinks,
      ["/advisory/", "/competitions/", "/events/", "/programs/", "/network/"],
      `expected primary mobile menu links for every section, received ${JSON.stringify(openMenuState)}`,
    );

    const mobileControlState = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify((() => {
            const filters = document.querySelector(".filters-bar");
            const tab = document.querySelector(".tab");
            const tabGroup = document.querySelector(".tab-group");
            const filtersStyle = getComputedStyle(filters);
            const tabStyle = getComputedStyle(tab);
            const tabGroupStyle = getComputedStyle(tabGroup);

            return {
              filtersHeight: Math.round(filters.getBoundingClientRect().height),
              filtersFlexWrap: filtersStyle.flexWrap,
              filtersOverflowX: filtersStyle.overflowX,
              tabFontSize: tabStyle.fontSize,
              tabOverflowX: tabGroupStyle.overflowX,
            };
          })())`,
        ]),
      ),
    );

    assert.equal(
      mobileControlState.filtersFlexWrap,
      "nowrap",
      `expected mobile competition filters to stay in a compact horizontal row, received ${JSON.stringify(mobileControlState)}`,
    );
    assert.match(
      mobileControlState.filtersOverflowX,
      /auto|scroll/,
      `expected mobile competition filters to scroll horizontally, received ${JSON.stringify(mobileControlState)}`,
    );
    assert.ok(
      mobileControlState.filtersHeight <= 76,
      `expected mobile competition filters to avoid taking several rows, received ${JSON.stringify(mobileControlState)}`,
    );
    assert.equal(
      mobileControlState.tabFontSize,
      "18px",
      `expected mobile competition tabs to use compact typography, received ${JSON.stringify(mobileControlState)}`,
    );
    assert.match(
      mobileControlState.tabOverflowX,
      /auto|scroll/,
      `expected mobile competition tabs to remain horizontally scrollable, received ${JSON.stringify(mobileControlState)}`,
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
      /\.interior-page \.site-footer-newsletter-row input\[type="email"\]\s*\{[^}]*width:\s*150px;[^}]*height:\s*38px;/s,
      "expected interior footer newsletter input sizing to match the competitions mockup",
    );
    assert.match(
      interiorStyles,
      /\.site-wechat-popup\s*\{[^}]*top:\s*-84px;[^}]*right:\s*calc\(100% \+ 10px\);[^}]*background:\s*rgba\(255, 255, 255, 0\.95\);/s,
      "expected interior footer WeChat popup to anchor its top to the email-input row above the icon",
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
      competitionDetailHtml,
      /<a href="\/competitions\/\?tab=startup" class="news-back-link news-back-link--muted">\s*<svg[\s\S]*?<\/svg>\s*<span data-i18n="detailPage\.backLabel">Back to competitions<\/span>\s*<\/a>/,
      "expected the localized competition back link label to live beside the preserved arrow icon",
    );
    assert.doesNotMatch(
      competitionDetailHtml,
      /<a href="\/competitions\/\?tab=startup" class="news-back-link news-back-link--muted" data-i18n="detailPage\.backLabel"/,
      "expected localization to avoid replacing the entire competition back link contents",
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
    assert.match(
      interiorStyles,
      /\.form-progress\s*\{[^}]*display:\s*flex;[^}]*gap:\s*0;[^}]*background:\s*#f5f5f5;[^}]*border-radius:\s*12px;[^}]*overflow:\s*hidden;/s,
      "expected pre-registration progress to use the connected segmented bar from the mockup",
    );
    assert.match(
      interiorStyles,
      /\.progress-step\.is-active\s*\{[^}]*background:\s*#000;[^}]*color:\s*#fff;/s,
      "expected the active pre-registration segment to render black with white text",
    );

    for (const expectedCardIconColor of ["#2563EB", "#16a34a", "#0891b2", "#d97706", "#475569", "#dc2626"]) {
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

test("Batch H competition detail pages move registration into meta grid and render editable feature media", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const competitionDetailHtml = readFileSync(
      resolve(
        build.outDir,
        "competitions",
        "greater-tech-challenge-2025",
        "index.html",
      ),
      "utf8",
    );
    const challengeDetailHtml = readFileSync(
      resolve(
        build.outDir,
        "challenges",
        "china-market-entry-accelerator-2025",
        "index.html",
      ),
      "utf8",
    );
    const schemaSource = readProjectFile("src/lib/competitions/schema.ts");
    const typesSource = readProjectFile("src/lib/competitions/types.ts");
    const interiorStyles = readProjectFile("src/styles/interior-pages.css");

    assert.doesNotMatch(
      competitionDetailHtml,
      /class="competition-hero-card"/,
      "expected competition detail pages to remove the upper-right hero registration card",
    );
    assert.doesNotMatch(
      competitionDetailHtml,
      />\s*Application flow\s*</i,
      "expected the old Application flow card title to be removed",
    );
    assert.doesNotMatch(
      competitionDetailHtml,
      /data-i18n="detailPage\.trackLabel"/,
      "expected the Track meta card to be removed from detail pages",
    );
    assert.match(
      competitionDetailHtml,
      /data-i18n="detailPage\.focusLabel"[\s\S]*class="competition-meta-card competition-register-card"/,
      "expected the Focus card to move into the former track slot before the registration card",
    );
    assert.match(
      competitionDetailHtml,
      /class="competition-meta-card competition-register-card"[\s\S]*data-i18n="detailPage\.registrationLabel"[\s\S]*href="\/pre-registration\/\?competition=greater-tech-challenge-2025"/,
      "expected registration CTA/value to live in the right-side meta card",
    );
    assert.match(
      competitionDetailHtml,
      /class="competition-rich-card competition-detail-feature-card"[\s\S]*class="competition-feature-media"/,
      "expected the old process area to render as a text/photo feature section",
    );
    assert.match(
      competitionDetailHtml,
      /<strong>pitch narrative<\/strong>/,
      "expected the editable feature text to support bold rich text",
    );
    assert.match(
      challengeDetailHtml,
      /class="competition-meta-card competition-register-card"[\s\S]*href="\/pre-registration\/\?competition=china-market-entry-accelerator-2025"/,
      "expected corporate challenge detail pages to use the same moved registration card",
    );
    assert.match(
      schemaSource,
      /detailImage:\s*fields\.url/,
      "expected competition detail feature images to be editable in the collection schema",
    );
    assert.match(
      schemaSource,
      /processHtml:\s*requiredText\(\s*"Feature body HTML"[\s\S]*<strong>/,
      "expected the feature rich text field to document bold HTML support",
    );
    assert.match(
      typesSource,
      /detailImage\?:\s*string;/,
      "expected the competition entry type to expose editable detail image URLs",
    );
    assert.match(
      interiorStyles,
      /\.competition-detail-feature-card\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(300px,\s*0\.82fr\);/s,
      "expected the detail feature card to use a text/photo layout",
    );
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
    assert.match(
      interiorStyles,
      /\.news-list-card\s*\{[^}]*border:\s*1px solid transparent;[^}]*background:\s*linear-gradient\(180deg,\s*rgba\(255,\s*255,\s*255,\s*0\.96\)\s*0%,\s*rgba\(248,\s*250,\s*252,\s*0\.92\)\s*100%\) padding-box,\s*linear-gradient\(135deg,\s*var\(--site-red\)\s*0%,\s*var\(--site-blue\)\s*100%\) border-box;/s,
      "expected news listing cards to use a red-to-blue gradient border stroke",
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

    const defaultCardOrder = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify(Array.from(document.querySelectorAll("#panel-startup .comp-grid [data-filter-item]")).map((node) => ({
            name: node.querySelector("[data-competition-name-link]")?.textContent?.trim() ?? "",
            status: node.getAttribute("data-status"),
            sortDate: node.getAttribute("data-sort-date"),
          })))`,
        ]),
      ),
    );
    const firstClosedIndex = defaultCardOrder.findIndex((entry) => entry.status === "closed");

    assert.equal(
      defaultCardOrder.every((entry) => Boolean(entry.sortDate)),
      true,
      `expected public cards to expose machine-readable sort dates, received ${JSON.stringify(defaultCardOrder)}`,
    );
    assert.equal(
      firstClosedIndex === -1 || defaultCardOrder.slice(firstClosedIndex).every((entry) => entry.status === "closed"),
      true,
      `expected default deadline sorting to keep closed cards last, received ${JSON.stringify(defaultCardOrder)}`,
    );

    runAgentBrowser(["--session", session, "click", "[data-status-filter='open']"]);
    runAgentBrowser(["--session", session, "click", "[data-focus-filter='fintech']"]);
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
      /China-LATAM FinTech Cup/i,
      "expected the open + fintech filters to isolate the public fintech competition",
    );
    assert.match(
      filteredHref,
      /\/competitions\/china-latam-fintech-cup\//,
      `expected the filtered startup link to point at the fintech cup detail page, received ${filteredHref}`,
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
      /China-LATAM FinTech Cup/i,
      "expected clicking the competition name to open the matching detail page",
    );

    runAgentBrowser([
      "--session",
      session,
      "open",
      `http://127.0.0.1:${port}/pre-registration/?competition=china-latam-fintech-cup`,
    ]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const selectedCompetition = runAgentBrowser([
      "--session",
      session,
      "get",
      "text",
      "[data-selected-competition-name]",
    ]);
    const selectedCompetitionFlow = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify({
            title: document.querySelector(".page-title")?.textContent?.trim() ?? "",
            subtitle: document.querySelector(".page-subtitle")?.textContent?.trim() ?? "",
            selectorHidden: document.querySelector("[data-competition-select-row]")?.hidden ?? false,
            selectDisabled: document.querySelector("[data-competition-select]")?.disabled ?? false,
          })`,
        ]),
      ),
    );

    assert.match(
      selectedCompetition,
      /China-LATAM FinTech Cup/i,
      "expected the application page to surface the selected competition name",
    );
    assert.match(
      selectedCompetitionFlow.title,
      /China-LATAM FinTech Cup[\s\S]*Registration/i,
      `expected selected competition flow to personalize the page title, received ${JSON.stringify(selectedCompetitionFlow)}`,
    );
    assert.match(
      selectedCompetitionFlow.subtitle,
      /Ready to apply\? Fill in the form below and our team personally guides you through every step of your application\./i,
      `expected selected competition flow to use the generic application guidance subtitle, received ${JSON.stringify(selectedCompetitionFlow)}`,
    );
    assert.equal(
      selectedCompetitionFlow.selectorHidden,
      true,
      `expected selected competition flow to hide the selector row, received ${JSON.stringify(selectedCompetitionFlow)}`,
    );
    assert.equal(
      selectedCompetitionFlow.selectDisabled,
      true,
      `expected selected competition flow to lock the selected competition, received ${JSON.stringify(selectedCompetitionFlow)}`,
    );

    runAgentBrowser(["--session", session, "set", "viewport", "390", "844"]);
    runAgentBrowser([
      "--session",
      session,
      "open",
      `http://127.0.0.1:${port}/pre-registration/?competition=china-latam-fintech-cup`,
    ]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const preregMobileLayout = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify((() => {
            const banner = document.querySelector(".prereg-banner");
            const support = document.querySelector(".prereg-support-card");
            const bannerStyle = getComputedStyle(banner);
            const watermarkStyle = getComputedStyle(banner, "::after");
            return {
              bannerWidth: Math.round(banner.getBoundingClientRect().width),
              supportExists: Boolean(support),
              flexDirection: bannerStyle.flexDirection,
              watermarkDisplay: watermarkStyle.display,
            };
          })())`,
        ]),
      ),
    );

    assert.equal(
      preregMobileLayout.supportExists,
      false,
      `expected mobile pre-registration banner support card to be removed, received ${JSON.stringify(preregMobileLayout)}`,
    );
    assert.equal(
      preregMobileLayout.watermarkDisplay,
      "none",
      `expected mobile pre-registration banner watermark to be hidden, received ${JSON.stringify(preregMobileLayout)}`,
    );
    assert.ok(
      preregMobileLayout.bannerWidth >= 340,
      `expected mobile pre-registration banner to use the available width, received ${JSON.stringify(preregMobileLayout)}`,
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

    const newsPrimaryButtonStyle = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify({
            color: getComputedStyle(document.querySelector(".news-featured-copy .site-btn--primary")).color,
            markerColor: getComputedStyle(document.querySelector(".news-featured-copy .site-btn--primary"), "::before").backgroundColor,
          })`,
        ]),
      ),
    );

    assert.deepEqual(
      newsPrimaryButtonStyle,
      {
        color: "rgb(255, 255, 255)",
        markerColor: "rgb(255, 255, 255)",
      },
      `expected interior primary CTA text and dot to render white, received ${JSON.stringify(newsPrimaryButtonStyle)}`,
    );

    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/pre-registration/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const preregDarkButtonStyle = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify((() => {
            const probe = document.createElement("a");
            probe.href = "#";
            probe.className = "site-btn site-btn--dark";
            probe.textContent = "Dark CTA";
            document.querySelector(".interior-page").appendChild(probe);
            const result = {
              color: getComputedStyle(probe).color,
              markerColor: getComputedStyle(probe, "::before").backgroundColor,
            };
            probe.remove();
            return result;
          })())`,
        ]),
      ),
    );

    assert.deepEqual(
      preregDarkButtonStyle,
      {
        color: "rgb(255, 255, 255)",
        markerColor: "rgb(255, 255, 255)",
      },
      `expected interior dark CTA text and dot to render white, received ${JSON.stringify(preregDarkButtonStyle)}`,
    );

    runAgentBrowser(["--session", session, "open", `http://127.0.0.1:${port}/news/`]);
    runAgentBrowser(["--session", session, "wait", "1000"]);

    const footerHeroButtonStyle = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify({
            color: getComputedStyle(document.querySelector(".site-footer-hero-btn")).color,
            markerColor: getComputedStyle(document.querySelector(".site-footer-hero-btn"), "::before").backgroundColor,
          })`,
        ]),
      ),
    );

    assert.deepEqual(
      footerHeroButtonStyle,
      {
        color: "rgb(255, 255, 255)",
        markerColor: "rgb(255, 255, 255)",
      },
      `expected footer hero CTA text and dot to render white, received ${JSON.stringify(footerHeroButtonStyle)}`,
    );

    const footerNewsletterStyle = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify((() => {
            const input = document.querySelector(".site-footer-newsletter-row input");
            const subscribe = document.querySelector(".site-footer-subscribe");
            const inputStyle = getComputedStyle(input);
            const subscribeStyle = getComputedStyle(subscribe);
            const inputRect = input.getBoundingClientRect();

            return {
              input: {
                width: inputRect.width,
                height: inputRect.height,
                padding: inputStyle.padding,
                borderRadius: inputStyle.borderRadius,
                backgroundColor: inputStyle.backgroundColor,
                fontSize: inputStyle.fontSize,
              },
              subscribe: {
                color: subscribeStyle.color,
                backgroundColor: subscribeStyle.backgroundColor,
              },
            };
          })())`,
        ]),
      ),
    );

    assert.deepEqual(
      footerNewsletterStyle,
      {
        input: {
          width: 150,
          height: 38,
          padding: "9px 14px",
          borderRadius: "8px",
          backgroundColor: "rgba(0, 0, 0, 0.03)",
          fontSize: "14px",
        },
        subscribe: {
          color: "rgb(255, 255, 255)",
          backgroundColor: "rgb(255, 59, 0)",
        },
      },
      `expected footer newsletter controls to keep mockup sizing and color, received ${JSON.stringify(footerNewsletterStyle)}`,
    );

    const footerSocialStyles = JSON.parse(
      JSON.parse(
        runAgentBrowser([
          "--session",
          session,
          "eval",
          `JSON.stringify(Array.from(document.querySelectorAll(".site-footer-socials .site-social-btn")).map((control) => {
            const style = getComputedStyle(control);
            return {
              tag: control.tagName,
              color: style.color,
              borderColor: style.borderColor,
            };
          }))`,
        ]),
      ),
    );

    assert.deepEqual(
      footerSocialStyles,
      [
        { tag: "BUTTON", color: "rgba(0, 0, 0, 0.38)", borderColor: "rgba(0, 0, 0, 0.12)" },
        { tag: "A", color: "rgba(0, 0, 0, 0.38)", borderColor: "rgba(0, 0, 0, 0.12)" },
        { tag: "A", color: "rgba(0, 0, 0, 0.38)", borderColor: "rgba(0, 0, 0, 0.12)" },
        { tag: "A", color: "rgba(0, 0, 0, 0.38)", borderColor: "rgba(0, 0, 0, 0.12)" },
      ],
      `expected all footer social icons to use the muted mockup color, received ${JSON.stringify(footerSocialStyles)}`,
    );

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

test("Network sub-pages render Keystatic-driven city partnerships and speakers lists", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const cityHtml = readFileSync(
      resolve(build.outDir, "network", "city-partnerships", "index.html"),
      "utf8",
    );
    const speakersHtml = readFileSync(
      resolve(build.outDir, "network", "featured-speakers", "index.html"),
      "utf8",
    );

    // Localizable title + description
    assert.match(
      cityHtml,
      /data-i18n="page\.title"[^>]*>\s*City Partnerships/,
      "expected the city partnerships page title",
    );
    assert.match(
      cityHtml,
      /data-i18n="page\.description"/,
      "expected the city partnerships description to be localizable",
    );
    assert.match(
      speakersHtml,
      /data-i18n="page\.title"[^>]*>\s*Featured Speakers/,
      "expected the featured speakers page title",
    );

    // Seeded items render in the All-insights card style
    assert.match(cityHtml, /news-list-card/, "expected city cards to reuse the All insights style");
    assert.match(cityHtml, /Sao Paulo - Shenzhen Corridor/, "expected a seeded city partnership name");
    assert.match(
      cityHtml,
      /data-i18n="items\.0\.name"/,
      "expected city card names to be localizable",
    );
    assert.match(speakersHtml, /Mariana Alves/, "expected a seeded speaker name");
    assert.match(
      speakersHtml,
      /data-i18n="items\.0\.intro"/,
      "expected speaker intros to be localizable",
    );

    // Display-only: no meta footer, no tag pill
    assert.doesNotMatch(cityHtml, /news-card-meta/, "expected no published/reading-time footer");
    assert.doesNotMatch(cityHtml, /news-card-tag/, "expected no tag pill on network cards");
    assert.doesNotMatch(speakersHtml, /news-card-meta/, "expected no footer on speaker cards");

    // Optional thumbnail behavior
    assert.match(
      cityHtml,
      /news-list-card--no-media/,
      "expected text-only cards to use the no-media modifier",
    );
    assert.match(
      cityHtml,
      /news-card-media-layer/,
      "expected thumbnailed cards to render a media layer",
    );

    // Shared localization shell
    assert.match(cityHtml, /id="localized-content"/, "expected the shared localized content payload");
    assert.match(speakersHtml, /id="localized-content"/, "expected the shared localized content payload");
  } finally {
    build.cleanup();
  }
});

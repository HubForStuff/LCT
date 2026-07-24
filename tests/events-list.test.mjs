import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let outDir = "";
let html = "";

before(() => {
  outDir = mkdtempSync(resolve(tmpdir(), "events-build-"));
  const build = spawnSync("npm", ["run", "build", "--", "--outDir", outDir], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  assert.equal(
    build.status,
    0,
    `Astro build failed.\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`,
  );
  html = readFileSync(resolve(outDir, "events", "index.html"), "utf8");
});

// The collection is CMS-managed, so these assertions derive their expectations from the
// content on disk. Nothing here may hardcode a count or name a specific event.
const allEntries = readdirSync(resolve(projectRoot, "src/content/events"))
  .filter((f) => f.endsWith(".json"))
  .map((f) => JSON.parse(readFileSync(resolve(projectRoot, "src/content/events", f), "utf8")));

const publishedEvents = allEntries.filter((e) => e.draft !== true);

test("renders one card per published event", () => {
  const cards = html.match(/data-event-card/g) || [];
  assert.equal(cards.length, publishedEvents.length);
});

test("draft events are not rendered", () => {
  const drafts = allEntries.filter((e) => e.draft === true);
  for (const draft of drafts) {
    assert.ok(!html.includes(`/events/${draft.slug.slug}/`), `draft ${draft.slug.slug} leaked`);
  }
});

test("tab counts are derived from the content, not hardcoded", () => {
  for (const [category, tabId] of [
    ["trade-fair", "trade-fair"],
    ["summit", "summit"],
  ]) {
    const expected = publishedEvents.filter((e) => e.category === category).length;
    const pattern = new RegExp(
      `data-tab-trigger="${tabId}"[\\s\\S]{0,400}?<span class="tab-count">${expected}</span>`,
    );
    assert.match(html, pattern, `${tabId} count should be ${expected}`);
  }
});

test("keeps the mega-menu and footer anchor targets alive", () => {
  for (const anchor of ["trade-fairs-expos", "summits", "calendar"]) {
    assert.ok(html.includes(`id="${anchor}"`), `missing anchor target #${anchor}`);
  }
});

test("has no featured/highlighted block", () => {
  assert.ok(
    !html.includes("featured-card"),
    "events list must not carry the competitions featured block",
  );
  assert.ok(!html.includes("featured-visual"));
});

test("groups cards under one separator per distinct month, per tab panel", () => {
  // Cards are grouped by month *inside each tab panel*, so the expected separator count is
  // the sum of the distinct months per category — not the distinct months of the whole
  // collection. A month that occurs in both categories legitimately renders twice.
  let expectedTotal = 0;

  for (const category of ["trade-fair", "summit"]) {
    const categoryEvents = publishedEvents.filter((e) => e.category === category);
    const months = new Set(categoryEvents.map((e) => e.startDate.slice(0, 7)));
    expectedTotal += months.size;

    const panelStart = html.indexOf(`data-tab-panel="${category}"`);
    assert.ok(panelStart > -1, `missing tab panel for ${category}`);
    const nextPanel = html.indexOf("data-tab-panel=", panelStart + 1);
    const panelHtml = html.slice(panelStart, nextPanel === -1 ? undefined : nextPanel);
    const panelSeparators = panelHtml.match(/class="month-sep"/g) || [];
    assert.equal(
      panelSeparators.length,
      months.size,
      `${category} should render one separator per month it contains`,
    );
  }

  const separators = html.match(/class="month-sep"/g) || [];
  assert.equal(separators.length, expectedTotal);
});

test("every published event links to its detail page, and Join points there too", () => {
  for (const event of publishedEvents) {
    assert.ok(
      html.includes(`href="/events/${event.slug.slug}/"`),
      `no link to /events/${event.slug.slug}/`,
    );
  }
  const joinButtons = html.match(/class="ccard-apply"[^>]*href="\/events\/[^"]+\/"/g) || [];
  assert.ok(joinButtons.length > 0, "Join must point at the detail page, not the form");
});

test("the booth button renders for exactly the events flagged for it", () => {
  const expected = publishedEvents.filter((e) => e.booth).length;
  const booth = html.match(/class="ccard-booth"/g) || [];
  assert.equal(booth.length, expected);
});

test("renders status, region and industry filter groups", () => {
  assert.match(html, /data-status-filter="open"/);
  assert.match(html, /data-region-filter="china"/);
  assert.match(html, /data-region-filter="latam"/);
  assert.match(html, /data-industry-filter="fintech"/);
  assert.match(html, /data-china-location="Shenzhen"/);
  assert.match(html, /data-latam-country="Brazil"/);
});

// Scans forward from the index of a `<div ...>` open tag and returns the index just past its
// matching `</div>`, tracking only div nesting depth (siblings of other tag types are opaque).
function findDivCloseIndex(source, divOpenIndex) {
  const tagPattern = /<div\b[^>]*>|<\/div>/g;
  tagPattern.lastIndex = divOpenIndex;
  let depth = 0;
  let match;
  while ((match = tagPattern.exec(source))) {
    if (match[0] === "</div>") {
      depth -= 1;
      if (depth === 0) {
        return tagPattern.lastIndex;
      }
    } else {
      depth += 1;
    }
  }
  return -1;
}

test("the List Your Event panel points at the contact modal and survives outside every month grid", () => {
  assert.match(html, /class="list-your-event-panel"/);
  assert.match(html, /data-i18n="page\.listYourEventLabel"/);
  assert.match(html, /data-i18n="page\.listYourEventCtaLabel"/);

  const panelStart = html.indexOf('class="list-your-event-panel"');
  assert.ok(panelStart > -1, "List Your Event panel not found");
  const panelHtml = html.slice(panelStart, panelStart + 600);
  assert.match(panelHtml, /data-contact-trigger/);

  // The panel must not be nested inside a `.comp-grid` (`[data-month-grid]`), which the
  // filter script can hide entirely when every card in it is filtered out — see task-4
  // review Finding 1. Every `[data-month-grid]` div that opens before the panel must also
  // close before the panel starts.
  const gridOpenPattern = /<div class="comp-grid" data-month-grid="[^"]*">/g;
  let gridMatch;
  let checkedAtLeastOneGrid = false;
  while ((gridMatch = gridOpenPattern.exec(html)) && gridMatch.index < panelStart) {
    checkedAtLeastOneGrid = true;
    const gridCloseIndex = findDivCloseIndex(html, gridMatch.index);
    assert.ok(gridCloseIndex > -1, "unbalanced .comp-grid div in output");
    assert.ok(
      gridCloseIndex <= panelStart,
      "the List Your Event panel must be rendered outside of every [data-month-grid]",
    );
  }
  assert.ok(checkedAtLeastOneGrid, "expected at least one month grid before the panel");
});

test("the retired static events page no longer emits a duplicate route", () => {
  const staticEntry = JSON.parse(
    readFileSync(resolve(projectRoot, "src/content/static-pages/events.json"), "utf8"),
  );
  assert.equal(staticEntry.published, false, "static events page must be unpublished");
});

test("ships localized copy for all three languages", () => {
  assert.match(html, /id="localized-content"/);
  for (const code of ["EN", "BR", "CN"]) {
    assert.ok(html.includes(`"${code}"`), `localized payload missing ${code}`);
  }
});

test("every published event gets a detail page", () => {
  for (const event of publishedEvents) {
    assert.ok(
      existsSync(resolve(outDir, "events", event.slug.slug, "index.html")),
      `missing detail page for ${event.slug.slug}`,
    );
  }
});

test("detail pages carry the meta grid and link back to the listing", () => {
  for (const event of publishedEvents) {
    const slug = event.slug.slug;
    const detail = readFileSync(resolve(outDir, "events", slug, "index.html"), "utf8");
    assert.match(detail, /class="[^"]*detail-meta-grid/, `${slug}: no meta grid`);
    assert.ok(detail.includes('href="/events/"'), `${slug}: no link back to the listing`);
  }
});

test("non-past events' detail pages link to the application form; past events do not", () => {
  // A past event cannot be attended, so its detail page must not offer the "Apply to attend"
  // action (which would deep-link into a form dropdown that excludes past events — see
  // getEventFormOptions). Derived from content on disk, not a hardcoded slug.
  const nonPastEvents = publishedEvents.filter((e) => e.status !== "past");
  const pastEvents = publishedEvents.filter((e) => e.status === "past");

  assert.ok(nonPastEvents.length > 0, "expected at least one non-past event to cover the common case");

  for (const event of nonPastEvents) {
    const slug = event.slug.slug;
    const detail = readFileSync(resolve(outDir, "events", slug, "index.html"), "utf8");
    assert.ok(
      detail.includes(`href="/event-application/?event=${slug}"`),
      `${slug}: no link to the application form`,
    );
  }

  for (const event of pastEvents) {
    const slug = event.slug.slug;
    const detail = readFileSync(resolve(outDir, "events", slug, "index.html"), "utf8");
    // The rendered anchor (as an actual href attribute) must be gone. Note the localized
    // payload embedded for the language switcher still carries the raw "applicationHref"/
    // "applyLabel" strings for every locale regardless of what's rendered, so we must assert
    // against the anchor markup itself, not the label text.
    assert.ok(
      !detail.includes(`href="/event-application/?event=${slug}"`),
      `${slug}: past event must not link to the application form`,
    );
    assert.ok(
      !detail.includes('data-i18n="detail.applyLabel"'),
      `${slug}: past event must not render the Apply to attend action`,
    );
  }
});

test("detail pages have no award card", () => {
  for (const event of publishedEvents) {
    const detail = readFileSync(
      resolve(outDir, "events", event.slug.slug, "index.html"),
      "utf8",
    );
    assert.ok(!detail.includes("Total Award"), `${event.slug.slug}: events have no award`);
  }
});

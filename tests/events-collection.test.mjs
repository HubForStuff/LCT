import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const eventsDir = resolve(projectRoot, "src/content/events");

const files = readdirSync(eventsDir).filter((f) => f.endsWith(".json"));
const entries = files.map((f) => JSON.parse(readFileSync(resolve(eventsDir, f), "utf8")));

const CATEGORIES = ["trade-fair", "summit"];
const STATUSES = ["open", "upcoming", "past"];
const REGIONS = ["china", "latam"];
const LOCALES = ["en", "br", "cn"];

// NOTE: these tests assert *invariants every entry must satisfy*, never a count or a
// specific event. The collection is CMS-managed — Andre adds and removes events — so a
// test pinned to "24 entries" or to a named event would fail on the first real edit.

test("the collection is non-empty and exercises both categories", () => {
  assert.ok(entries.length > 0, "at least one event must be published");
  for (const category of CATEGORIES) {
    assert.ok(
      entries.some((e) => e.category === category),
      `no seed event in category ${category} — the list page tab would render empty`,
    );
  }
});

test("seed content covers every UI state the list page can render", () => {
  for (const status of STATUSES) {
    assert.ok(entries.some((e) => e.status === status), `no event with status ${status}`);
  }
  for (const region of REGIONS) {
    assert.ok(entries.some((e) => e.region === region), `no event in region ${region}`);
  }
  assert.ok(entries.some((e) => e.flagship), "no flagship event — the flagship label is unrendered");
  assert.ok(entries.some((e) => e.booth), "no booth event — the Book a Booth button is unrendered");
  assert.ok(entries.some((e) => e.lctHosted), "no LCT-hosted event");
  const months = new Set(entries.map((e) => e.startDate.slice(0, 7)));
  assert.ok(months.size >= 2, "events must span 2+ months so month separators are exercised");
});

test("every entry has a valid slug object and enum fields", () => {
  for (const entry of entries) {
    assert.equal(typeof entry.slug?.name, "string", `${entry.slug?.slug}: slug.name`);
    assert.match(entry.slug?.slug ?? "", /^[a-z0-9-]+$/, "slug must be kebab-case ascii");
    assert.ok(CATEGORIES.includes(entry.category), `${entry.slug.slug}: category`);
    assert.ok(STATUSES.includes(entry.status), `${entry.slug.slug}: status`);
    assert.ok(REGIONS.includes(entry.region), `${entry.slug.slug}: region`);
  }
});

test("every entry carries an industry and a 3-letter code", () => {
  for (const entry of entries) {
    assert.match(entry.industry, /^[a-z-]+$/, `${entry.slug.slug}: industry key`);
    assert.match(entry.code, /^[A-Z]{3}$/, `${entry.slug.slug}: code`);
  }
});

test("dates are ISO and endDate is not before startDate", () => {
  for (const entry of entries) {
    assert.match(entry.startDate, /^\d{4}-\d{2}-\d{2}$/, `${entry.slug.slug}: startDate`);
    assert.match(entry.endDate, /^\d{4}-\d{2}-\d{2}$/, `${entry.slug.slug}: endDate`);
    assert.ok(entry.endDate >= entry.startDate, `${entry.slug.slug}: endDate before startDate`);
  }
});

test("every entry is fully localized in en, br and cn", () => {
  const required = ["category", "name", "description", "statusLabel", "dateLabel", "ctaLabel"];
  for (const entry of entries) {
    for (const locale of LOCALES) {
      assert.ok(entry[locale], `${entry.slug.slug}: missing ${locale}`);
      for (const field of required) {
        assert.equal(
          typeof entry[locale][field],
          "string",
          `${entry.slug.slug}.${locale}.${field}`,
        );
        assert.ok(entry[locale][field].length > 0, `${entry.slug.slug}.${locale}.${field} empty`);
      }
    }
  }
});

test("China events filter by location, LATAM events by country", () => {
  const chinaCities = ["Beijing", "Shenzhen", "Shanghai", "Chengdu", "Hangzhou", "Macau", "Hong Kong", "Taiwan", "Guangzhou"];
  for (const entry of entries.filter((e) => e.region === "china")) {
    assert.ok(
      chinaCities.some((city) => entry.location.includes(city)),
      `${entry.slug.slug}: China event location "${entry.location}" is not a known city`,
    );
  }
  for (const entry of entries.filter((e) => e.region === "latam")) {
    assert.ok(entry.country.length > 0, `${entry.slug.slug}: LATAM event needs a country`);
  }
});

test("a booth event supplies a booth CTA label in every locale", () => {
  for (const entry of entries.filter((e) => e.booth)) {
    for (const locale of LOCALES) {
      assert.ok(
        entry[locale].boothCtaLabel.length > 0,
        `${entry.slug.slug}.${locale}: booth is true but boothCtaLabel is empty`,
      );
    }
  }
});

test("industry values come from the supported taxonomy", () => {
  const SUPPORTED = [
    "ai", "biotech", "deep-tech", "education", "energy-and-climate", "entertainment",
    "fintech", "food-and-agritech", "healthtech", "manufacturing", "media-and-community",
    "mobility", "proptech", "robotics", "security", "other",
  ];
  for (const entry of entries) {
    assert.ok(
      SUPPORTED.includes(entry.industry),
      `${entry.slug.slug}: industry "${entry.industry}" has no filter pill or icon`,
    );
  }
});

test("slugs are unique", () => {
  const slugs = entries.map((e) => e.slug.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate slug would collide on /events/[slug]");
});

test("display order is unique within each category", () => {
  for (const category of CATEGORIES) {
    const orders = entries.filter((e) => e.category === category).map((e) => e.order);
    assert.equal(new Set(orders).size, orders.length, `${category}: duplicate order values`);
  }
});

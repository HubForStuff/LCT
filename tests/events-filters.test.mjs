import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupByMonth,
  matchesFilters,
  monthKey,
  monthLabel,
  sortByDate,
  sortByRegion,
} from "../src/lib/events/filters.mjs";

const card = (over = {}) => ({
  slug: "x",
  startDate: "2026-01-15",
  status: "open",
  region: "latam",
  country: "Argentina",
  location: "Buenos Aires",
  industry: "manufacturing",
  order: 1,
  ...over,
});

const ALL = { status: "all", region: "all", latamCountries: [], chinaLocations: [], industries: [] };

test("monthKey buckets by year and month", () => {
  assert.equal(monthKey("2026-01-15"), "2026-01");
  assert.equal(monthKey("2026-12-01"), "2026-12");
});

test("monthLabel localizes the month name", () => {
  assert.equal(monthLabel("2026-01-15", "EN"), "January 2026");
  assert.equal(monthLabel("2026-02-01", "BR"), "Fevereiro 2026");
  assert.equal(monthLabel("2026-03-01", "CN"), "2026年3月");
});

test("groupByMonth preserves card order inside a group and orders groups chronologically", () => {
  const groups = groupByMonth(
    [card({ slug: "b", startDate: "2026-02-05" }), card({ slug: "a", startDate: "2026-01-15" }), card({ slug: "c", startDate: "2026-01-30" })],
    "EN",
  );
  assert.deepEqual(groups.map((g) => g.key), ["2026-01", "2026-02"]);
  assert.deepEqual(groups[0].cards.map((c) => c.slug), ["a", "c"]);
});

test("sortByDate ranks open before upcoming before past", () => {
  const sorted = sortByDate([
    card({ slug: "past", status: "past", startDate: "2026-01-01" }),
    card({ slug: "upcoming", status: "upcoming", startDate: "2026-01-02" }),
    card({ slug: "open", status: "open", startDate: "2026-01-03" }),
  ]);
  assert.deepEqual(sorted.map((c) => c.slug), ["open", "upcoming", "past"]);
});

test("sortByDate breaks ties on startDate then order", () => {
  const sorted = sortByDate([
    card({ slug: "second", startDate: "2026-01-15", order: 2 }),
    card({ slug: "first", startDate: "2026-01-15", order: 1 }),
    card({ slug: "earliest", startDate: "2026-01-01", order: 9 }),
  ]);
  assert.deepEqual(sorted.map((c) => c.slug), ["earliest", "first", "second"]);
});

test("sortByRegion groups china before latam then sorts by location", () => {
  const sorted = sortByRegion([
    card({ slug: "bue", region: "latam", location: "Buenos Aires" }),
    card({ slug: "sha", region: "china", location: "Shanghai" }),
    card({ slug: "bei", region: "china", location: "Beijing" }),
  ]);
  assert.deepEqual(sorted.map((c) => c.slug), ["bei", "sha", "bue"]);
});

test("matchesFilters passes everything when no filter is active", () => {
  assert.equal(matchesFilters(card(), ALL), true);
});

test("status filter matches exactly", () => {
  assert.equal(matchesFilters(card({ status: "open" }), { ...ALL, status: "open" }), true);
  assert.equal(matchesFilters(card({ status: "past" }), { ...ALL, status: "open" }), false);
});

test("LATAM country selection filters within the latam region only", () => {
  const state = { ...ALL, region: "latam", latamCountries: ["Brazil"] };
  assert.equal(matchesFilters(card({ region: "latam", country: "Brazil" }), state), true);
  assert.equal(matchesFilters(card({ region: "latam", country: "Chile" }), state), false);
  assert.equal(matchesFilters(card({ region: "china", location: "Beijing" }), state), false);
});

test("region latam with no country selected matches every latam event", () => {
  const state = { ...ALL, region: "latam" };
  assert.equal(matchesFilters(card({ region: "latam", country: "Chile" }), state), true);
});

test("China selection filters on location, not country", () => {
  const state = { ...ALL, region: "china", chinaLocations: ["Shenzhen"] };
  assert.equal(matchesFilters(card({ region: "china", country: "China", location: "Shenzhen" }), state), true);
  assert.equal(matchesFilters(card({ region: "china", country: "China", location: "Beijing" }), state), false);
});

test("industry filter is multi-select OR", () => {
  const state = { ...ALL, industries: ["fintech", "deep-tech"] };
  assert.equal(matchesFilters(card({ industry: "fintech" }), state), true);
  assert.equal(matchesFilters(card({ industry: "deep-tech" }), state), true);
  assert.equal(matchesFilters(card({ industry: "manufacturing" }), state), false);
});

test("filters combine with AND across dimensions", () => {
  const state = { status: "open", region: "latam", latamCountries: ["Brazil"], chinaLocations: [], industries: ["fintech"] };
  assert.equal(matchesFilters(card({ status: "open", region: "latam", country: "Brazil", industry: "fintech" }), state), true);
  assert.equal(matchesFilters(card({ status: "past", region: "latam", country: "Brazil", industry: "fintech" }), state), false);
  assert.equal(matchesFilters(card({ status: "open", region: "latam", country: "Chile", industry: "fintech" }), state), false);
});

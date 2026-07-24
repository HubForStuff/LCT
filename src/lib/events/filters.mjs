/**
 * Pure filter/sort/group helpers for the events listing.
 * Framework-agnostic and dependency-free so they can be unit-tested directly
 * and imported by both the Astro component (build time) and its client script.
 */

const MONTH_NAMES = {
  EN: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  BR: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
};

const STATUS_RANK = { open: 0, upcoming: 1, past: 2 };

/** @param {string} isoDate @returns {string} */
export function monthKey(isoDate) {
  return isoDate.slice(0, 7);
}

/** @param {string} isoDate @param {"EN"|"BR"|"CN"} locale @returns {string} */
export function monthLabel(isoDate, locale) {
  const year = isoDate.slice(0, 4);
  const monthIndex = Number(isoDate.slice(5, 7)) - 1;

  if (locale === "CN") {
    return `${year}年${monthIndex + 1}月`;
  }

  const names = MONTH_NAMES[locale] || MONTH_NAMES.EN;
  return `${names[monthIndex]} ${year}`;
}

/**
 * @param {{startDate: string}[]} cards
 * @param {"EN"|"BR"|"CN"} locale
 * @returns {{key: string, label: string, cards: any[]}[]}
 */
export function groupByMonth(cards, locale) {
  const buckets = new Map();

  for (const card of cards) {
    const key = monthKey(card.startDate);
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: monthLabel(card.startDate, locale), cards: [] });
    }
    buckets.get(key).cards.push(card);
  }

  return [...buckets.values()].sort((left, right) => left.key.localeCompare(right.key));
}

/** @param {any[]} cards @returns {any[]} */
export function sortByDate(cards) {
  return [...cards].sort((left, right) => {
    const rankDifference = (STATUS_RANK[left.status] ?? 3) - (STATUS_RANK[right.status] ?? 3);
    if (rankDifference) {
      return rankDifference;
    }

    const dateDifference = left.startDate.localeCompare(right.startDate);
    if (dateDifference) {
      return dateDifference;
    }

    return (left.order ?? 0) - (right.order ?? 0);
  });
}

/** @param {any[]} cards @returns {any[]} */
export function sortByRegion(cards) {
  return [...cards].sort((left, right) => {
    const regionDifference = left.region.localeCompare(right.region);
    if (regionDifference) {
      return regionDifference;
    }

    const locationDifference = left.location.localeCompare(right.location);
    if (locationDifference) {
      return locationDifference;
    }

    return left.startDate.localeCompare(right.startDate);
  });
}

/**
 * @param {any} card
 * @param {{status: string, region: string, latamCountries: string[], chinaLocations: string[], industries: string[]}} state
 * @returns {boolean}
 */
export function matchesFilters(card, state) {
  const matchesStatus = state.status === "all" || card.status === state.status;

  let matchesRegion;
  if (state.region === "all") {
    matchesRegion = true;
  } else if (state.region === "latam") {
    matchesRegion =
      card.region === "latam" &&
      (state.latamCountries.length === 0 || state.latamCountries.includes(card.country));
  } else {
    matchesRegion =
      card.region === "china" &&
      (state.chinaLocations.length === 0 || state.chinaLocations.includes(card.location));
  }

  const matchesIndustry =
    state.industries.length === 0 || state.industries.includes(card.industry);

  return matchesStatus && matchesRegion && matchesIndustry;
}

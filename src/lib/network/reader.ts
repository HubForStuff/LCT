import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";

import type {
  NetworkListingCollectionEntry,
  NetworkListingData,
  NetworkListingItem,
  NetworkListingPageSingleton,
  NetworkListingRouteLocale,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<
  HomepageLocaleCode,
  keyof Pick<NetworkListingCollectionEntry, "en" | "br" | "cn">
>;

function buildItems(
  entries: NetworkListingCollectionEntry[],
  code: HomepageLocaleCode,
): NetworkListingItem[] {
  return entries
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((entry) => {
      const localized = entry[localeFieldByCode[code]];
      const thumbnail = entry.thumbnail?.trim() ? entry.thumbnail : undefined;

      return {
        name: localized.name,
        intro: localized.intro,
        thumbnail,
        imageAlt: thumbnail ? entry.imageAlt : undefined,
      };
    });
}

async function buildNetworkListingData(
  pageSingleton: NetworkListingPageSingleton,
  entries: NetworkListingCollectionEntry[],
): Promise<NetworkListingData> {
  const homepageData = await getHomepageData();
  const siteSettings = homepageData.siteSettings;

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const pageLocale = pageSingleton[localeFieldByCode[code]];

      const routeLocale: NetworkListingRouteLocale = {
        meta: {
          htmlLang: locale.competitionsPage.meta.htmlLang,
          title: pageLocale.metaTitle,
          description: pageLocale.metaDescription,
        },
        ui: locale.ui,
        navItems: locale.navItems,
        footer: locale.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        page: {
          eyebrow: pageLocale.eyebrow,
          title: pageLocale.title,
          description: pageLocale.description,
        },
        items: buildItems(entries, code),
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, NetworkListingRouteLocale>;

  return {
    siteSettings,
    languages: siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

function normalizeEntries(
  entries: { slug: string; entry: NetworkListingCollectionEntry }[],
): NetworkListingCollectionEntry[] {
  return entries.map(({ entry }) => entry);
}

export async function getCityPartnershipsData(): Promise<NetworkListingData> {
  const [pageSingleton, entries] = await Promise.all([
    keystaticReader.singletons.cityPartnershipsPage.readOrThrow() as Promise<NetworkListingPageSingleton>,
    keystaticReader.collections.cityPartnerships.all() as Promise<
      { slug: string; entry: NetworkListingCollectionEntry }[]
    >,
  ]);

  return buildNetworkListingData(pageSingleton, normalizeEntries(entries));
}

export async function getFeaturedSpeakersData(): Promise<NetworkListingData> {
  const [pageSingleton, entries] = await Promise.all([
    keystaticReader.singletons.featuredSpeakersPage.readOrThrow() as Promise<NetworkListingPageSingleton>,
    keystaticReader.collections.speakers.all() as Promise<
      { slug: string; entry: NetworkListingCollectionEntry }[]
    >,
  ]);

  return buildNetworkListingData(pageSingleton, normalizeEntries(entries));
}

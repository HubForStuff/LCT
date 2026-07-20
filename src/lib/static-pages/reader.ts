import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";
import { getProgramListingContentByLocale } from "../programs/reader";
import { getAdvisoryServicesByLocale } from "../advisory/reader";

import type {
  StaticPage,
  StaticPageCollectionEntry,
  StaticPageData,
  StaticPageLocaleContent,
  StaticPageRouteLocale,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<HomepageLocaleCode, keyof Pick<StaticPageCollectionEntry, "en" | "br" | "cn">>;

function buildStaticPageHref(slug: string): string {
  return `/${slug}/`;
}

/**
 * A static page is published unless it explicitly opts out with `published: false`.
 * Entries predating the flag omit it, so absence must mean published.
 */
function isPublished(entry: StaticPageCollectionEntry): boolean {
  return entry.published !== false;
}

/** Returns only published entries — unpublished pages keep their content but get no route. */
async function getAllStaticPageEntries(): Promise<StaticPageCollectionEntry[]> {
  const entries = (await keystaticReader.collections.staticPages.all()) as {
    slug: string;
    entry: StaticPageCollectionEntry;
  }[];

  return entries
    .map(({ slug, entry }) => ({
      ...entry,
      slug,
    }))
    .filter(isPublished)
    .sort((left, right) => left.order - right.order);
}

function getLocalizedPageContent(
  entry: StaticPageCollectionEntry,
  code: HomepageLocaleCode,
): StaticPageLocaleContent {
  return entry[localeFieldByCode[code]];
}

function buildStaticPage(entry: StaticPageCollectionEntry, code: HomepageLocaleCode): StaticPage {
  const localized = getLocalizedPageContent(entry, code);

  return {
    ...localized,
    slug: entry.slug,
    href: buildStaticPageHref(entry.slug),
    image: entry.primaryImage,
    hideHero: Boolean(entry.hideHero),
  };
}

export async function getAllStaticPageSlugs(): Promise<string[]> {
  const entries = await getAllStaticPageEntries();

  return entries.map((entry) => entry.slug);
}

export async function getStaticPageData(slug: string): Promise<StaticPageData> {
  const [homepageData, entries, programListingByLocale, advisoryByLocale] = await Promise.all([
    getHomepageData(),
    getAllStaticPageEntries(),
    slug === "programs" ? getProgramListingContentByLocale() : Promise.resolve(undefined),
    slug === "advisory" ? getAdvisoryServicesByLocale() : Promise.resolve(undefined),
  ]);
  const targetEntry = entries.find((entry) => entry.slug === slug);

  if (!targetEntry) {
    throw new Error(`Static page not found for slug "${slug}"`);
  }

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const localized = getLocalizedPageContent(targetEntry, code);

      const routeLocale: StaticPageRouteLocale = {
        meta: {
          htmlLang: locale.competitionsPage.meta.htmlLang,
          title: localized.metaTitle,
          description: localized.metaDescription,
        },
        ui: locale.ui,
        navItems: locale.navItems,
        footer: locale.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        page: buildStaticPage(targetEntry, code),
        programs: programListingByLocale?.[code],
        advisoryServices: advisoryByLocale?.[code],
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, StaticPageRouteLocale>;

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

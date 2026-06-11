import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";

import type {
  AdvisoryCollectionEntry,
  AdvisoryDetail,
  AdvisoryDetailCopy,
  AdvisoryDetailData,
  AdvisoryDetailRouteLocale,
  AdvisoryLocaleContent,
  AdvisoryServiceCard,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<
  HomepageLocaleCode,
  keyof Pick<AdvisoryCollectionEntry, "en" | "br" | "cn">
>;

const detailCopyByCode: Record<HomepageLocaleCode, AdvisoryDetailCopy> = {
  EN: { backLabel: "Back to advisory" },
  BR: { backLabel: "Voltar para assessoria" },
  CN: { backLabel: "返回咨询服务" },
};

function buildAdvisoryHref(slug: string): string {
  return `/advisory/${slug}/`;
}

function localized(
  entry: AdvisoryCollectionEntry,
  code: HomepageLocaleCode,
): AdvisoryLocaleContent {
  return entry[localeFieldByCode[code]];
}

async function getAllAdvisoryEntries(): Promise<AdvisoryCollectionEntry[]> {
  const entries = (await keystaticReader.collections.advisory.all()) as {
    slug: string;
    entry: AdvisoryCollectionEntry;
  }[];

  return entries
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .sort((left, right) => left.order - right.order);
}

function buildCard(
  entry: AdvisoryCollectionEntry,
  code: HomepageLocaleCode,
): AdvisoryServiceCard {
  const l = localized(entry, code);
  const thumbnail = entry.thumbnail?.trim() ? entry.thumbnail : undefined;

  return {
    href: buildAdvisoryHref(entry.slug),
    slug: entry.slug,
    eyebrow: l.eyebrow,
    title: l.title,
    summary: l.summary,
    thumbnail,
    thumbnailAlt: thumbnail ? entry.thumbnailAlt : undefined,
  };
}

function buildDetail(
  entry: AdvisoryCollectionEntry,
  code: HomepageLocaleCode,
): AdvisoryDetail {
  const l = localized(entry, code);
  const heroImage = entry.heroImage?.trim() ? entry.heroImage : undefined;

  return {
    slug: entry.slug,
    href: buildAdvisoryHref(entry.slug),
    listingHref: "/advisory/",
    heroImage,
    heroImageAlt: heroImage ? entry.heroImageAlt : undefined,
    ...l,
  };
}

export async function getAdvisoryServicesByLocale(): Promise<
  Record<HomepageLocaleCode, AdvisoryServiceCard[]>
> {
  const entries = await getAllAdvisoryEntries();

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => [
      code,
      entries.map((entry) => buildCard(entry, code)),
    ]),
  ) as Record<HomepageLocaleCode, AdvisoryServiceCard[]>;
}

export async function getAllAdvisorySlugs(): Promise<string[]> {
  const entries = await getAllAdvisoryEntries();
  return entries.map((entry) => entry.slug);
}

export async function getAdvisoryDetailPageData(slug: string): Promise<AdvisoryDetailData> {
  const [homepageData, entries] = await Promise.all([
    getHomepageData(),
    getAllAdvisoryEntries(),
  ]);
  const targetEntry = entries.find((entry) => entry.slug === slug);

  if (!targetEntry) {
    throw new Error(`Advisory service not found for slug "${slug}"`);
  }

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const l = localized(targetEntry, code);

      const routeLocale: AdvisoryDetailRouteLocale = {
        meta: {
          htmlLang: locale.competitionsPage.meta.htmlLang,
          title: l.metaTitle,
          description: l.metaDescription,
        },
        ui: locale.ui,
        navItems: locale.navItems,
        footer: locale.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        detail: detailCopyByCode[code],
        page: buildDetail(targetEntry, code),
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, AdvisoryDetailRouteLocale>;

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

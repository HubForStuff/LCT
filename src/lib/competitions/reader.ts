import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";

import type {
  CompetitionCollectionEntry,
  CompetitionDetail,
  CompetitionDetailPageCopy,
  CompetitionDetailPageData,
  CompetitionDetailRouteLocale,
  CompetitionFormOption,
  CompetitionListingPageData,
  CompetitionLocalizedEntry,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<HomepageLocaleCode, keyof Pick<CompetitionCollectionEntry, "en" | "br" | "cn">>;

const detailCopyByCode = {
  EN: {
    backLabel: "Back to competitions",
    statusLabel: "Status",
    deadlineLabel: "Timeline",
    trackLabel: "Track",
    focusLabel: "Focus",
    applyLabel: "Apply now",
  },
  BR: {
    backLabel: "Voltar para competicoes",
    statusLabel: "Status",
    deadlineLabel: "Prazo",
    trackLabel: "Trilha",
    focusLabel: "Foco",
    applyLabel: "Aplicar agora",
  },
  CN: {
    backLabel: "返回竞赛列表",
    statusLabel: "状态",
    deadlineLabel: "时间",
    trackLabel: "赛道",
    focusLabel: "方向",
    applyLabel: "立即申请",
  },
} as const satisfies Record<HomepageLocaleCode, CompetitionDetailPageCopy>;

const statusFilterValues = ["all", "open", "future", "closed"] as const;
const focusFilterValues = [
  "all",
  "deep-tech",
  "sustainability",
  "fintech",
  "agritech",
  "ai",
  "healthtech",
  "logistics",
  "biotech",
  "manufacturing",
] as const;

function buildCompetitionHref(slug: string): string {
  return `/competitions/${slug}/`;
}

function buildCompetitionApplicationHref(slug: string): string {
  return `/pre-registration/?competition=${slug}`;
}

function normalizeFocusKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function localizeCompetitionEntry(
  entry: CompetitionCollectionEntry,
  code: HomepageLocaleCode,
): CompetitionLocalizedEntry {
  return {
    ...entry,
    localized: entry[localeFieldByCode[code]],
  };
}

function isPublicCompetitionEntry(entry: CompetitionCollectionEntry): boolean {
  return entry.draft !== true;
}

function getCompetitionSortDate(entry: CompetitionCollectionEntry): string {
  if (entry.statusTone === "future") {
    return entry.applicationOpensAt ?? entry.applicationDeadlineAt ?? "";
  }

  return entry.applicationDeadlineAt ?? entry.applicationOpensAt ?? "";
}

async function getAllCompetitionEntries(options: { includeDrafts?: boolean } = {}): Promise<CompetitionCollectionEntry[]> {
  const entries = (await keystaticReader.collections.competitions.all()) as {
    slug: string;
    entry: CompetitionCollectionEntry;
  }[];

  return entries
    .map(({ slug, entry }) => ({
      ...entry,
      slug,
    }))
    .filter((entry) => options.includeDrafts || isPublicCompetitionEntry(entry))
    .sort((left, right) => left.order - right.order);
}

function getTrackLabel(code: HomepageLocaleCode, track: CompetitionCollectionEntry["track"]): string {
  const locale = INTERIOR_LOCALES[code];
  const tab = locale.competitionsPage.tabs.find((item) => item.id === track);

  return tab?.label ?? track;
}

function buildListingCard(entry: CompetitionLocalizedEntry) {
  return {
    href: buildCompetitionHref(entry.slug),
    slug: entry.slug,
    category: entry.localized.category,
    name: entry.localized.name,
    description: entry.localized.description,
    watermark: entry.watermark,
    prize: entry.value,
    status: entry.localized.statusLabel,
    statusTone: entry.statusTone,
    focusKeys: entry.focusTags.map((tag) => normalizeFocusKey(tag)),
    deadlinePrefix: entry.localized.deadlinePrefix,
    deadlineValue: entry.localized.deadlineValue,
    ctaLabel: entry.localized.ctaLabel,
    accent: entry.accent,
    sortDate: getCompetitionSortDate(entry),
    displayOrder: entry.order,
  };
}

function buildFeaturedCard(entry: CompetitionLocalizedEntry) {
  return {
    href: buildCompetitionHref(entry.slug),
    slug: entry.slug,
    theme: entry.track === "corporate" ? "corporate" : "startup",
    tag: entry.localized.featuredTag,
    category: entry.localized.category,
    title: entry.localized.name,
    description: entry.localized.description,
    value: entry.value,
    valueCaption: entry.localized.featuredValueCaption,
    status: entry.localized.statusLabel,
    statusTone: entry.statusTone,
    focusKeys: entry.focusTags.map((tag) => normalizeFocusKey(tag)),
    deadlinePrefix: entry.localized.deadlinePrefix,
    deadlineValue: entry.localized.deadlineValue,
    ctaLabel: entry.localized.ctaLabel,
    watermark: entry.watermark,
    sortDate: getCompetitionSortDate(entry),
    displayOrder: entry.order,
  };
}

function buildCompetitionDetail(
  entry: CompetitionLocalizedEntry,
  code: HomepageLocaleCode,
): CompetitionDetail {
  return {
    slug: entry.slug,
    href: buildCompetitionHref(entry.slug),
    applicationHref: buildCompetitionApplicationHref(entry.slug),
    track: entry.track,
    trackLabel: getTrackLabel(code, entry.track),
    statusTone: entry.statusTone,
    watermark: entry.watermark,
    value: entry.value,
    focusTags: entry.focusTags,
    category: entry.localized.category,
    name: entry.localized.name,
    description: entry.localized.description,
    statusLabel: entry.localized.statusLabel,
    deadlinePrefix: entry.localized.deadlinePrefix,
    deadlineValue: entry.localized.deadlineValue,
    detailEyebrow: entry.localized.detailEyebrow,
    detailSubtitle: entry.localized.detailSubtitle,
    metaTitle: entry.localized.metaTitle,
    metaDescription: entry.localized.metaDescription,
    overviewHtml: entry.localized.overviewHtml,
    eligibilityTitle: entry.localized.eligibilityTitle,
    eligibilityHtml: entry.localized.eligibilityHtml,
    supportTitle: entry.localized.supportTitle,
    supportHtml: entry.localized.supportHtml,
    processTitle: entry.localized.processTitle,
    processHtml: entry.localized.processHtml,
    applicationLabel: entry.localized.applicationLabel,
  };
}

export async function getCompetitionFormOptionsByLocale(): Promise<
  Record<HomepageLocaleCode, CompetitionFormOption[]>
> {
  const entries = await getAllCompetitionEntries();

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => [
      code,
      entries.map((entry) => {
        const localizedEntry = localizeCompetitionEntry(entry, code);

        return {
          slug: entry.slug,
          label: localizedEntry.localized.name,
          track: entry.track,
          statusTone: entry.statusTone,
        };
      }),
    ]),
  ) as Record<HomepageLocaleCode, CompetitionFormOption[]>;
}

export async function getAllCompetitionSlugs(): Promise<string[]> {
  const entries = await getAllCompetitionEntries();
  return entries.map((entry) => entry.slug);
}

export async function getCompetitionsListingPageData(): Promise<CompetitionListingPageData> {
  const [homepageData, entries] = await Promise.all([getHomepageData(), getAllCompetitionEntries()]);

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const tabs = locale.competitionsPage.tabs.map((tab) => {
        const localizedEntries = entries
          .filter((entry) => entry.track === tab.id)
          .map((entry) => localizeCompetitionEntry(entry, code));
        const featuredEntry = localizedEntries.find((entry) => entry.featured) ?? localizedEntries[0];
        const cards = localizedEntries
          .filter((entry) => entry.slug !== featuredEntry?.slug)
          .map((entry) => buildListingCard(entry));

        if (localizedEntries.length === 0) {
          return {
            ...tab,
            count: 0,
            featured: undefined,
            cards: undefined,
          };
        }

        return {
          ...tab,
          count: localizedEntries.length,
          featured: featuredEntry ? buildFeaturedCard(featuredEntry) : undefined,
          cards: cards.length > 0 ? cards : undefined,
        };
      });

      return [
        code,
        {
          meta: locale.competitionsPage.meta,
          ui: locale.ui,
          navItems: locale.navItems,
          footer: locale.footer,
          desktopMenuSections: homepageLocale.desktopMenuSections,
          navExploreLabel: homepageLocale.navExploreLabel,
          page: {
            ...locale.competitionsPage,
            statusFilters: locale.competitionsPage.statusFilters.map((filter, index) => ({
              ...filter,
              value: statusFilterValues[index] ?? filter.tone,
            })),
            focusFilters: locale.competitionsPage.focusFilters.map((filter, index) => ({
              ...filter,
              value: focusFilterValues[index] ?? normalizeFocusKey(filter.label),
            })),
            tabs,
          },
        },
      ];
    }),
  ) as CompetitionListingPageData["localizedContent"];

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

export async function getCompetitionDetailPageData(slug: string): Promise<CompetitionDetailPageData> {
  const [homepageData, entries] = await Promise.all([getHomepageData(), getAllCompetitionEntries()]);
  const targetEntry = entries.find((entry) => entry.slug === slug);

  if (!targetEntry) {
    throw new Error(`Competition not found for slug "${slug}"`);
  }

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const localizedEntry = localizeCompetitionEntry(targetEntry, code);
      const routeLocale: CompetitionDetailRouteLocale = {
        meta: {
          htmlLang: locale.competitionsPage.meta.htmlLang,
          title: localizedEntry.localized.metaTitle,
          description: localizedEntry.localized.metaDescription,
        },
        ui: locale.ui,
        navItems: locale.navItems,
        footer: locale.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        listingPage: locale.competitionsPage,
        detailPage: detailCopyByCode[code],
        page: buildCompetitionDetail(localizedEntry, code),
      };

      return [code, routeLocale];
    }),
  ) as CompetitionDetailPageData["localizedContent"];

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

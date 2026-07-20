import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { getHomepageData } from "../homepage/reader";
import {
  HOMEPAGE_LOCALE_CODES,
  type DesktopMenuCard,
  type HomepageLocaleCode,
} from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";

import type {
  ProgramCard,
  ProgramCollectionEntry,
  ProgramDetail,
  ProgramDetailCopy,
  ProgramDetailData,
  ProgramDetailRouteLocale,
  ProgramFeaturedCard,
  ProgramListingContent,
  ProgramLocaleContent,
  ProgramMenuCardsByLocale,
  ProgramTabContent,
  ProgramTrack,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<
  HomepageLocaleCode,
  keyof Pick<ProgramCollectionEntry, "en" | "br" | "cn">
>;

const tabLabelsByCode: Record<
  HomepageLocaleCode,
  Record<ProgramTrack, string>
> = {
  EN: {
    "market-entry": "Market Entry",
    "business-mission": "Business Missions",
  },
  BR: {
    "market-entry": "Entrada em Mercado",
    "business-mission": "Missões de Negócios",
  },
  CN: {
    "market-entry": "市场进入",
    "business-mission": "商务考察",
  },
};

const listingCopyByCode: Record<
  HomepageLocaleCode,
  {
    tabsAriaLabel: string;
    emptyStateTitle: string;
    emptyStateBody: string;
  }
> = {
  EN: {
    tabsAriaLabel: "Program tracks",
    emptyStateTitle: "More programs coming soon",
    emptyStateBody: "We're preparing the next cohort. Check back shortly or contact us to express interest.",
  },
  BR: {
    tabsAriaLabel: "Trilhas de programas",
    emptyStateTitle: "Mais programas em breve",
    emptyStateBody: "Estamos preparando a próxima turma. Volte em breve ou entre em contato para manifestar interesse.",
  },
  CN: {
    tabsAriaLabel: "项目方向",
    emptyStateTitle: "更多项目即将推出",
    emptyStateBody: "下一期正在筹备中。稍后再来查看，或联系我们表达参与意向。",
  },
};

const detailCopyByCode: Record<HomepageLocaleCode, ProgramDetailCopy> = {
  EN: {
    backLabel: "Back to programs",
    viewAllLabel: "View All",
    timelineLabel: "Timeline",
    focusLabel: "Focus",
    statusLabel: "Status",
  },
  BR: {
    backLabel: "Voltar para programas",
    viewAllLabel: "Ver Todos",
    timelineLabel: "Prazo",
    focusLabel: "Foco",
    statusLabel: "Status",
  },
  CN: {
    backLabel: "返回项目列表",
    viewAllLabel: "查看全部",
    timelineLabel: "时间",
    focusLabel: "方向",
    statusLabel: "状态",
  },
};

const PROGRAM_TRACKS: readonly ProgramTrack[] = ["market-entry", "business-mission"];

function buildProgramHref(slug: string): string {
  return `/programs/${slug}/`;
}

function buildProgramListingHref(): string {
  return "/programs/";
}

function buildProgramApplicationHref(slug: string): string {
  return `/eligibility/?program=${slug}`;
}

function buildProgramFocusTags(category: string): string[] {
  return category
    .split("·")
    .map((part) => part.trim())
    .filter(Boolean);
}

function getProgramSortDate(entry: ProgramCollectionEntry): string {
  if (entry.statusTone === "future") {
    return entry.applicationOpensAt ?? entry.applicationDeadlineAt ?? "";
  }
  return entry.applicationDeadlineAt ?? entry.applicationOpensAt ?? "";
}

function isPublic(entry: ProgramCollectionEntry): boolean {
  return entry.draft !== true;
}

async function getAllProgramEntries(): Promise<ProgramCollectionEntry[]> {
  const entries = (await keystaticReader.collections.programs.all()) as {
    slug: string;
    entry: ProgramCollectionEntry;
  }[];

  return entries
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .filter(isPublic)
    .sort((left, right) => left.order - right.order);
}

function localized(
  entry: ProgramCollectionEntry,
  code: HomepageLocaleCode,
): ProgramLocaleContent {
  return entry[localeFieldByCode[code]];
}

function buildCard(
  entry: ProgramCollectionEntry,
  code: HomepageLocaleCode,
): ProgramCard {
  const l = localized(entry, code);

  return {
    href: buildProgramHref(entry.slug),
    slug: entry.slug,
    category: l.category,
    name: l.name,
    description: l.description,
    status: l.statusLabel,
    statusTone: entry.statusTone,
    deadlinePrefix: l.deadlinePrefix,
    deadlineValue: l.deadlineValue,
    ctaLabel: l.ctaLabel,
    sortDate: getProgramSortDate(entry),
    displayOrder: entry.order,
  };
}

function buildFeaturedCard(
  entry: ProgramCollectionEntry,
  code: HomepageLocaleCode,
): ProgramFeaturedCard {
  const base = buildCard(entry, code);
  const l = localized(entry, code);

  return {
    ...base,
    tag: l.featuredTag,
    value: l.featuredValue ?? l.name,
    valueCaption: l.featuredValueCaption ?? l.category,
  };
}

function buildDetail(
  entry: ProgramCollectionEntry,
  code: HomepageLocaleCode,
): ProgramDetail {
  const l = localized(entry, code);

  return {
    slug: entry.slug,
    href: buildProgramHref(entry.slug),
    listingHref: buildProgramListingHref(),
    applicationHref: buildProgramApplicationHref(entry.slug),
    track: entry.track,
    statusTone: entry.statusTone,
    detailImage: entry.detailImage,
    applicationOpensAt: entry.applicationOpensAt,
    applicationDeadlineAt: entry.applicationDeadlineAt,
    focusTags: buildProgramFocusTags(l.category),
    ...l,
  };
}

export async function getAllProgramSlugs(): Promise<string[]> {
  const entries = await getAllProgramEntries();
  return entries.map((entry) => entry.slug);
}

export type ProgramFormOption = {
  slug: string;
  name: string;
};

export async function getProgramFormOptionsByLocale(): Promise<
  Record<HomepageLocaleCode, ProgramFormOption[]>
> {
  const entries = await getAllProgramEntries();

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => [
      code,
      entries.map((entry) => ({
        slug: entry.slug,
        name: localized(entry, code).name,
      })),
    ]),
  ) as Record<HomepageLocaleCode, ProgramFormOption[]>;
}

export async function getProgramListingContentByLocale(): Promise<
  Record<HomepageLocaleCode, ProgramListingContent>
> {
  const entries = await getAllProgramEntries();

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const copy = listingCopyByCode[code];
      const tabs: ProgramTabContent[] = PROGRAM_TRACKS.map((track) => {
        const tabEntries = entries.filter((entry) => entry.track === track);
        const featuredEntry = tabEntries.find((entry) => entry.featured) ?? tabEntries[0];
        const cards = tabEntries
          .filter((entry) => entry.slug !== featuredEntry?.slug)
          .map((entry) => buildCard(entry, code));

        return {
          id: track,
          label: tabLabelsByCode[code][track],
          count: tabEntries.length,
          featured: featuredEntry ? buildFeaturedCard(featuredEntry, code) : undefined,
          cards,
        };
      });

      return [
        code,
        {
          tabsAriaLabel: copy.tabsAriaLabel,
          emptyStateTitle: copy.emptyStateTitle,
          emptyStateBody: copy.emptyStateBody,
          tabs,
        },
      ];
    }),
  ) as Record<HomepageLocaleCode, ProgramListingContent>;
}

export async function getProgramMenuCardsByLocale(): Promise<ProgramMenuCardsByLocale> {
  const entries = await getAllProgramEntries();

  function buildMenuCard(
    entry: ProgramCollectionEntry,
    code: HomepageLocaleCode,
  ): DesktopMenuCard {
    const l = localized(entry, code);
    return {
      title: l.name,
      body: l.description,
      cta: l.ctaLabel,
      href: buildProgramHref(entry.slug),
    };
  }

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const marketEntry =
        entries.find((entry) => entry.track === "market-entry" && entry.featured) ??
        entries.find((entry) => entry.track === "market-entry");
      const businessMission =
        entries.find((entry) => entry.track === "business-mission" && entry.featured) ??
        entries.find((entry) => entry.track === "business-mission");

      return [
        code,
        {
          marketEntry: marketEntry ? buildMenuCard(marketEntry, code) : undefined,
          businessMission: businessMission
            ? buildMenuCard(businessMission, code)
            : undefined,
        },
      ];
    }),
  ) as ProgramMenuCardsByLocale;
}

export async function getProgramDetailPageData(slug: string): Promise<ProgramDetailData> {
  const [homepageData, entries] = await Promise.all([
    getHomepageData(),
    getAllProgramEntries(),
  ]);
  const targetEntry = entries.find((entry) => entry.slug === slug);

  if (!targetEntry) {
    throw new Error(`Program not found for slug "${slug}"`);
  }

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const l = localized(targetEntry, code);

      const routeLocale: ProgramDetailRouteLocale = {
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
  ) as Record<HomepageLocaleCode, ProgramDetailRouteLocale>;

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

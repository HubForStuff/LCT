import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";
import { groupByMonth, sortByDate } from "./filters.mjs";

import type {
  EventCollectionEntry,
  EventDetail,
  EventDetailCopy,
  EventDetailPageData,
  EventDetailRouteLocale,
  EventFormOption,
  EventListCard,
  EventListingPageData,
  EventListingRouteLocale,
  EventMonthGroup,
  EventTab,
  EventsPageContent,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

/**
 * The two tab panels double as the mega-menu and footer anchor targets
 * (`/events/#trade-fairs-expos`, `/events/#summits` — see `src/lib/homepage/links.ts`).
 * Those links predate this page; keep the ids stable.
 */
export const EVENT_TAB_ANCHORS: Record<string, string> = {
  "trade-fair": "trade-fairs-expos",
  summit: "summits",
};

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<
  HomepageLocaleCode,
  keyof Pick<EventCollectionEntry, "en" | "br" | "cn">
>;

type EventTabConfig = {
  id: string;
  label: string;
};

function buildEventHref(slug: string): string {
  return `/events/${slug}/`;
}

function buildEventApplicationHref(slug: string): string {
  return `/event-application/?event=${slug}`;
}

async function getAllEventEntries(
  options: { includeDrafts?: boolean } = {},
): Promise<EventCollectionEntry[]> {
  const entries = (await keystaticReader.collections.events.all()) as {
    slug: string;
    entry: Omit<EventCollectionEntry, "slug">;
  }[];

  return entries
    .map(({ slug, entry }) => ({ ...entry, slug }) as EventCollectionEntry)
    .filter((entry) => options.includeDrafts || entry.draft !== true)
    .sort((left, right) => left.order - right.order);
}

function buildListingCard(entry: EventCollectionEntry, code: HomepageLocaleCode): EventListCard {
  const localized = entry[localeFieldByCode[code]];

  return {
    slug: entry.slug,
    href: buildEventHref(entry.slug),
    applicationHref: buildEventApplicationHref(entry.slug),
    code: entry.code,
    category: entry.category,
    categoryLabel: localized.category,
    name: localized.name,
    description: localized.description,
    status: entry.status,
    statusLabel: localized.statusLabel,
    dateLabel: localized.dateLabel,
    location: entry.location,
    country: entry.country,
    region: entry.region,
    industry: entry.industry,
    flagship: entry.flagship,
    booth: entry.booth,
    // The booth CTA opens the site-wide contact modal rather than a dedicated form —
    // ContactModal.astro binds every `a[href$="#contact"]` on the page.
    boothHref: "#contact",
    boothCtaLabel: localized.boothCtaLabel,
    ctaLabel: localized.ctaLabel,
    startDate: entry.startDate,
    order: entry.order,
  };
}

function buildTabs(
  entries: EventCollectionEntry[],
  code: HomepageLocaleCode,
  tabConfig: EventTabConfig[],
): EventTab[] {
  return tabConfig.map((tab) => {
    const cards = sortByDate(
      entries
        .filter((entry) => entry.category === tab.id)
        .map((entry) => buildListingCard(entry, code)),
    ) as EventListCard[];

    return {
      id: tab.id,
      label: tab.label,
      count: cards.length,
      anchorId: EVENT_TAB_ANCHORS[tab.id] ?? tab.id,
      months: groupByMonth(cards, code) as EventMonthGroup[],
    };
  });
}

export async function getEventsListingPageData(): Promise<EventListingPageData> {
  const [homepageData, entries] = await Promise.all([getHomepageData(), getAllEventEntries()]);

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const source = locale.eventsPage as unknown as Omit<EventsPageContent, "tabs"> & {
        tabs: EventTabConfig[];
      };

      const page: EventsPageContent = {
        ...source,
        tabs: buildTabs(entries, code, source.tabs),
      };

      const routeLocale: EventListingRouteLocale = {
        meta: source.meta,
        ui: locale.ui,
        navItems: locale.navItems,
        footer: locale.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        page,
      };

      return [code, routeLocale];
    }),
  ) as EventListingPageData["localizedContent"];

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

export async function getAllEventSlugs(): Promise<string[]> {
  const entries = await getAllEventEntries();
  return entries.map((entry) => entry.slug);
}

// Detail-page chrome copy lives here rather than the interior-pages locale JSON — the same
// precedent as `src/lib/competitions/reader.ts` and `src/lib/programs/reader.ts`.
const detailCopyByCode: Record<HomepageLocaleCode, EventDetailCopy> = {
  EN: {
    backLabel: "Back to events",
    viewAllLabel: "View All",
    statusLabel: "Status",
    datesLabel: "Dates",
    locationLabel: "Location",
    industryLabel: "Industry",
    applyLabel: "Apply to attend",
    boothLabel: "Book a Booth",
  },
  BR: {
    backLabel: "Voltar para eventos",
    viewAllLabel: "Ver Todos",
    statusLabel: "Status",
    datesLabel: "Datas",
    locationLabel: "Local",
    industryLabel: "Setor",
    applyLabel: "Inscreva-se",
    boothLabel: "Reservar estande",
  },
  CN: {
    backLabel: "返回活动列表",
    viewAllLabel: "查看全部",
    statusLabel: "状态",
    datesLabel: "日期",
    locationLabel: "地点",
    industryLabel: "行业",
    applyLabel: "申请参加",
    boothLabel: "预订展位",
  },
};

// Keys must stay in sync with eventsPage.industryFilters (Task 4, Step 3) and with
// FOCUS_FILTER_ICONS, so the detail page, the filter pill, and the icon never disagree. Labels
// are copied verbatim from src/content/interior-pages/locales/{en,br,cn}.json's
// eventsPage.industryFilters block (minus the "all" entry) so the two never drift apart. The BR
// column is diacritic-free ASCII, matching every other BR string in this repo.
const INDUSTRY_LABELS: Record<HomepageLocaleCode, Record<string, string>> = {
  EN: {
    ai: "AI",
    biotech: "Biotech",
    "deep-tech": "Deep Tech",
    education: "Education",
    "energy-and-climate": "Energy & Climate",
    entertainment: "Entertainment",
    fintech: "Fintech",
    "food-and-agritech": "Food & Agritech",
    healthtech: "Healthtech",
    manufacturing: "Manufacturing",
    "media-and-community": "Media",
    mobility: "Mobility",
    proptech: "Proptech",
    robotics: "Robotics",
    security: "Security",
    other: "Other",
  },
  BR: {
    ai: "AI",
    biotech: "Biotech",
    "deep-tech": "Deep Tech",
    education: "Educacao",
    "energy-and-climate": "Energia e Clima",
    entertainment: "Entretenimento",
    fintech: "Fintech",
    "food-and-agritech": "Food & AgriTech",
    healthtech: "Healthtech",
    manufacturing: "Manufatura",
    "media-and-community": "Midia",
    mobility: "Mobilidade",
    proptech: "Proptech",
    robotics: "Robotica",
    security: "Seguranca",
    other: "Outros",
  },
  CN: {
    ai: "AI",
    biotech: "生物科技",
    "deep-tech": "深科技",
    education: "教育",
    "energy-and-climate": "能源与气候",
    entertainment: "娱乐",
    fintech: "金融科技",
    "food-and-agritech": "食品与农业科技",
    healthtech: "健康科技",
    manufacturing: "制造业",
    "media-and-community": "媒体",
    mobility: "出行",
    proptech: "地产科技",
    robotics: "机器人",
    security: "安全",
    other: "其他",
  },
};

function buildDetail(entry: EventCollectionEntry, code: HomepageLocaleCode): EventDetail {
  const localized = entry[localeFieldByCode[code]];

  return {
    slug: entry.slug,
    href: buildEventHref(entry.slug),
    listingHref: "/events/",
    applicationHref: buildEventApplicationHref(entry.slug),
    code: entry.code,
    categoryLabel: localized.category,
    name: localized.name,
    description: localized.description,
    status: entry.status,
    statusLabel: localized.statusLabel,
    dateLabel: localized.dateLabel,
    location: entry.location,
    industry: entry.industry,
    industryLabel: INDUSTRY_LABELS[code][entry.industry] ?? entry.industry,
    flagship: entry.flagship,
    booth: entry.booth,
    detailImage: entry.detailImage ?? "",
    metaTitle: localized.metaTitle,
    metaDescription: localized.metaDescription,
    overviewHtml: localized.overviewHtml,
    whoShouldAttendTitle: localized.whoShouldAttendTitle,
    whoShouldAttendHtml: localized.whoShouldAttendHtml,
    formatTitle: localized.formatTitle,
    formatHtml: localized.formatHtml,
  };
}

export async function getEventDetailPageData(slug: string): Promise<EventDetailPageData> {
  const [homepageData, entries] = await Promise.all([getHomepageData(), getAllEventEntries()]);
  const target = entries.find((entry) => entry.slug === slug);

  if (!target) {
    throw new Error(`Unknown event slug: ${slug}`);
  }

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const interior = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      // Cast for the same reason getEventsListingPageData casts `locale.eventsPage`: the shared
      // InteriorPageLocaleContent type doesn't declare the events-specific keys (known-noise
      // LSP diagnostic "Property 'eventsPage' does not exist").
      const eventsMeta = (interior.eventsPage as unknown as EventsPageContent).meta;
      const page = buildDetail(target, code);

      const routeLocale: EventDetailRouteLocale = {
        meta: { title: page.metaTitle, description: page.metaDescription, htmlLang: eventsMeta.htmlLang },
        ui: interior.ui,
        navItems: interior.navItems,
        footer: interior.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        detail: detailCopyByCode[code],
        page,
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, EventDetailRouteLocale>;

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

export async function getEventFormOptions(): Promise<Record<HomepageLocaleCode, EventFormOption[]>> {
  const entries = await getAllEventEntries();

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => [
      code,
      entries
        .filter((entry) => entry.status !== "past")
        .map((entry) => ({
          slug: entry.slug,
          label: entry[localeFieldByCode[code]].name,
          status: entry.status,
        })),
    ]),
  ) as Record<HomepageLocaleCode, EventFormOption[]>;
}

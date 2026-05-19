import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";
import type { CompetitionCollectionEntry } from "../competitions/types";

import {
  HOMEPAGE_LOCALE_CODES,
  type DesktopMenuCard,
  type HomepageData,
  type HomepageLocaleCode,
  type HomepageLocaleContent,
  type HomepageLocaleManagedContent,
  type HomepageLocalizedContent,
  type SiteSettings,
} from "./types";
import { getHomepageNewsItemsByLocale } from "../news/reader";
import { getProgramMenuCardsByLocale } from "../programs/reader";
import type { ProgramMenuCardsByLocale } from "../programs/types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);
const COMPETITIONS_MENU_SECTION_INDEX = 1;
const PROGRAMS_MENU_SECTION_INDEX = 3;
type CompetitionMenuEntry = CompetitionCollectionEntry & { slug: string };

const localeReaders = {
  EN: keystaticReader.singletons.homepageEn,
  BR: keystaticReader.singletons.homepageBr,
  CN: keystaticReader.singletons.homepageCn,
} as const;

const competitionLocaleFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<HomepageLocaleCode, keyof Pick<CompetitionCollectionEntry, "en" | "br" | "cn">>;

const isLocaleCode = (value: string): value is HomepageLocaleCode =>
  HOMEPAGE_LOCALE_CODES.includes(value as HomepageLocaleCode);

function buildCompetitionHref(entry: CompetitionMenuEntry): string {
  return entry.track === "corporate" ? `/challenges/${entry.slug}/` : `/competitions/${entry.slug}/`;
}

function buildMenuCard(entry: CompetitionMenuEntry, code: HomepageLocaleCode): DesktopMenuCard {
  const localized = entry[competitionLocaleFieldByCode[code]];

  return {
    title: localized.name,
    body: localized.description,
    cta: localized.ctaLabel,
    href: buildCompetitionHref(entry),
  };
}

async function getCompetitionMenuCardsByLocale(): Promise<
  Record<HomepageLocaleCode, { startup?: DesktopMenuCard; corporate?: DesktopMenuCard }>
> {
  const entries = (await keystaticReader.collections.competitions.all()) as {
    slug: string;
    entry: CompetitionCollectionEntry;
  }[];

  const sortedEntries = entries
    .map(({ slug, entry }) => ({
      ...entry,
      slug,
    }))
    .sort((left, right) => left.order - right.order) as CompetitionMenuEntry[];

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const startupEntry =
        sortedEntries.find((entry) => entry.track === "startup" && entry.featured) ??
        sortedEntries.find((entry) => entry.track === "startup");
      const corporateEntry =
        sortedEntries.find((entry) => entry.track === "corporate" && entry.featured) ??
        sortedEntries.find((entry) => entry.track === "corporate");

      return [
        code,
        {
          startup: startupEntry ? buildMenuCard(startupEntry, code) : undefined,
          corporate: corporateEntry ? buildMenuCard(corporateEntry, code) : undefined,
        },
      ];
    }),
  ) as Record<HomepageLocaleCode, { startup?: DesktopMenuCard; corporate?: DesktopMenuCard }>;
}

function applyCompetitionMenuCards(
  locale: HomepageLocaleContent,
  menuCards: { startup?: DesktopMenuCard; corporate?: DesktopMenuCard },
): HomepageLocaleContent {
  const section = locale.desktopMenuSections[COMPETITIONS_MENU_SECTION_INDEX];

  if (!section || section.layout !== "two-cards") {
    return locale;
  }

  const desktopMenuSections = [...locale.desktopMenuSections];
  desktopMenuSections[COMPETITIONS_MENU_SECTION_INDEX] = {
    ...section,
    card: menuCards.startup ?? section.card,
    card2: menuCards.corporate ?? section.card2,
  };

  return {
    ...locale,
    desktopMenuSections,
  };
}

function applyProgramMenuCards(
  locale: HomepageLocaleContent,
  menuCards: { marketEntry?: DesktopMenuCard; businessMission?: DesktopMenuCard },
): HomepageLocaleContent {
  const section = locale.desktopMenuSections[PROGRAMS_MENU_SECTION_INDEX];

  if (!section) {
    return locale;
  }

  if (!menuCards.marketEntry && !menuCards.businessMission) {
    return locale;
  }

  const desktopMenuSections = [...locale.desktopMenuSections];
  desktopMenuSections[PROGRAMS_MENU_SECTION_INDEX] = {
    ...section,
    layout: "two-cards",
    card: menuCards.marketEntry ?? section.card,
    card2: menuCards.businessMission ?? section.card2,
  };

  return {
    ...locale,
    desktopMenuSections,
  };
}

export async function getHomepageData(): Promise<HomepageData> {
  const [siteSettings, homepageNewsItems, competitionMenuCardsByLocale, programMenuCardsByLocale, localeEntries] =
    await Promise.all([
      keystaticReader.singletons.siteSettings.readOrThrow() as Promise<SiteSettings>,
      getHomepageNewsItemsByLocale(),
      getCompetitionMenuCardsByLocale(),
      getProgramMenuCardsByLocale() as Promise<ProgramMenuCardsByLocale>,
      Promise.all(
        HOMEPAGE_LOCALE_CODES.map(
          async (code): Promise<[HomepageLocaleCode, HomepageLocaleManagedContent]> => [
            code,
            (await localeReaders[code].readOrThrow()) as HomepageLocaleManagedContent,
          ],
        ),
      ),
    ]);

  const localizedContent = Object.fromEntries(
    localeEntries.map(([code, locale]) => [
      code,
      applyProgramMenuCards(
        applyCompetitionMenuCards(
          {
            ...locale,
            newsItems: homepageNewsItems[code],
          },
          competitionMenuCardsByLocale[code],
        ),
        programMenuCardsByLocale[code],
      ),
    ]),
  ) as HomepageLocalizedContent;

  const defaultLanguage = isLocaleCode(siteSettings.defaultLanguage)
    ? siteSettings.defaultLanguage
    : "EN";

  return {
    siteSettings: {
      ...siteSettings,
      defaultLanguage,
      languages: siteSettings.languages.filter((language) => isLocaleCode(language.code)),
    },
    defaultLanguage,
    defaultLocale: localizedContent[defaultLanguage],
    localizedContent,
  };
}

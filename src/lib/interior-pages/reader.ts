import { getHomepageData } from "../homepage/reader";
import { type HomepageLocaleCode, type HomepageLocaleContent } from "../homepage/types";
import { INTERIOR_LOCALES } from "./locales";

import type {
  InteriorPageContentByKey,
  InteriorPageData,
  InteriorPageKey,
  InteriorPageLocalizedContent,
  InteriorPageRouteLocale,
} from "./types";

function buildRouteLocale<TKey extends InteriorPageKey>(
  locale: (typeof INTERIOR_LOCALES)[keyof typeof INTERIOR_LOCALES],
  pageKey: TKey,
  homepageLocale: HomepageLocaleContent,
): InteriorPageRouteLocale<InteriorPageContentByKey[TKey]> {
  const page = locale[pageKey] as InteriorPageContentByKey[TKey];

  return {
    meta: page.meta,
    ui: locale.ui,
    navItems: locale.navItems,
    footer: locale.footer,
    desktopMenuSections: homepageLocale.desktopMenuSections,
    navExploreLabel: homepageLocale.navExploreLabel,
    page,
  };
}

export async function getInteriorPageData<TKey extends InteriorPageKey>(
  pageKey: TKey,
): Promise<InteriorPageData<InteriorPageContentByKey[TKey]>> {
  const homepageData = await getHomepageData();

  const localizedContent = Object.fromEntries(
    Object.entries(INTERIOR_LOCALES).map(([languageCode, locale]) => {
      const homepageLocale = homepageData.localizedContent[languageCode as HomepageLocaleCode];

      return [
        languageCode,
        buildRouteLocale(locale, pageKey, homepageLocale),
      ];
    }),
  ) as InteriorPageLocalizedContent<InteriorPageContentByKey[TKey]>;

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

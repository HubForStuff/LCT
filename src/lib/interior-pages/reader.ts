import { getHomepageData } from "../homepage/reader";
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
): InteriorPageRouteLocale<InteriorPageContentByKey[TKey]> {
  const page = locale[pageKey];

  return {
    meta: page.meta,
    ui: locale.ui,
    navItems: locale.navItems,
    footer: locale.footer,
    page,
  };
}

export async function getInteriorPageData<TKey extends InteriorPageKey>(
  pageKey: TKey,
): Promise<InteriorPageData<InteriorPageContentByKey[TKey]>> {
  const homepageData = await getHomepageData();

  const localizedContent = Object.fromEntries(
    Object.entries(INTERIOR_LOCALES).map(([languageCode, locale]) => [
      languageCode,
      buildRouteLocale(locale, pageKey),
    ]),
  ) as InteriorPageLocalizedContent<InteriorPageContentByKey[TKey]>;

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

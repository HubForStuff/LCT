import localeBr from "../../content/interior-pages/locales/br.json";
import localeCn from "../../content/interior-pages/locales/cn.json";
import localeEn from "../../content/interior-pages/locales/en.json";
import { getHomepageData } from "../homepage/reader";

import type {
  InteriorPageContentByKey,
  InteriorPageData,
  InteriorPageKey,
  InteriorPageLocaleContent,
  InteriorPageLocalizedContent,
  InteriorPageRouteLocale,
} from "./types";

const interiorLocales = {
  EN: localeEn,
  BR: localeBr,
  CN: localeCn,
} as const satisfies Record<string, InteriorPageLocaleContent>;

function buildRouteLocale<TKey extends InteriorPageKey>(
  locale: InteriorPageLocaleContent,
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
    Object.entries(interiorLocales).map(([languageCode, locale]) => [
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

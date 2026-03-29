import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import {
  HOMEPAGE_LOCALE_CODES,
  type HomepageData,
  type HomepageLocaleCode,
  type HomepageLocaleContent,
  type HomepageLocaleManagedContent,
  type HomepageLocalizedContent,
  type SiteSettings,
} from "./types";
import { getHomepageNewsItemsByLocale } from "../news/reader";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeReaders = {
  EN: keystaticReader.singletons.homepageEn,
  BR: keystaticReader.singletons.homepageBr,
  CN: keystaticReader.singletons.homepageCn,
} as const;

const isLocaleCode = (value: string): value is HomepageLocaleCode =>
  HOMEPAGE_LOCALE_CODES.includes(value as HomepageLocaleCode);

export async function getHomepageData(): Promise<HomepageData> {
  const [siteSettings, homepageNewsItems, localeEntries] = await Promise.all([
    keystaticReader.singletons.siteSettings.readOrThrow() as Promise<SiteSettings>,
    getHomepageNewsItemsByLocale(),
    Promise.all(
      HOMEPAGE_LOCALE_CODES.map(async (code) => [
        code,
        (await localeReaders[code].readOrThrow()) as HomepageLocaleManagedContent,
      ]),
    ),
  ]);

  const localizedContent = Object.fromEntries(
    localeEntries.map(([code, locale]) => [
      code,
      {
        ...locale,
        newsItems: homepageNewsItems[code],
      },
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

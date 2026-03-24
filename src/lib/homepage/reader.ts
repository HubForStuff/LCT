import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import {
  HOMEPAGE_LOCALE_CODES,
  type HomepageData,
  type HomepageLocaleCode,
  type HomepageLocaleContent,
  type HomepageLocalizedContent,
  type SiteSettings,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeReaders = {
  EN: keystaticReader.singletons.homepageEn,
  BR: keystaticReader.singletons.homepageBr,
  CN: keystaticReader.singletons.homepageCn,
} as const;

const isLocaleCode = (value: string): value is HomepageLocaleCode =>
  HOMEPAGE_LOCALE_CODES.includes(value as HomepageLocaleCode);

export async function getHomepageData(): Promise<HomepageData> {
  const [siteSettings, localizedContent] = await Promise.all([
    keystaticReader.singletons.siteSettings.readOrThrow() as Promise<SiteSettings>,
    Promise.all(
      HOMEPAGE_LOCALE_CODES.map(async (code) => [
        code,
        (await localeReaders[code].readOrThrow()) as HomepageLocaleContent,
      ]),
    ).then((entries) => Object.fromEntries(entries) as HomepageLocalizedContent),
  ]);

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

import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode, type NewsItem, type SiteSettings } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";

import type {
  NewsArticle,
  NewsArticlePageData,
  NewsArticleRouteLocale,
  NewsChrome,
  NewsCollectionEntry,
  NewsListItem,
  NewsListingPageData,
  NewsListingRouteLocale,
  NewsLocaleContent,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<HomepageLocaleCode, keyof Pick<NewsCollectionEntry, "en" | "br" | "cn">>;

const isLocaleCode = (value: string): value is HomepageLocaleCode =>
  HOMEPAGE_LOCALE_CODES.includes(value as HomepageLocaleCode);

function buildNewsHref(slug: string): string {
  return `/news/${slug}/`;
}

async function getSiteSettings(): Promise<SiteSettings> {
  const siteSettings = (await keystaticReader.singletons.siteSettings.readOrThrow()) as SiteSettings;

  return {
    ...siteSettings,
    defaultLanguage: isLocaleCode(siteSettings.defaultLanguage)
      ? siteSettings.defaultLanguage
      : "EN",
    languages: siteSettings.languages.filter((language) => isLocaleCode(language.code)),
  };
}

async function getAllNewsEntries(): Promise<NewsCollectionEntry[]> {
  const entries = (await keystaticReader.collections.news.all()) as {
    slug: string;
    entry: NewsCollectionEntry;
  }[];

  return entries
    .map(({ slug, entry }) => ({
      ...entry,
      slug,
    }))
    .sort(
      (left, right) =>
        new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime(),
    );
}

function getLocalizedNewsContent(
  entry: NewsCollectionEntry,
  code: HomepageLocaleCode,
): NewsLocaleContent {
  return entry[localeFieldByCode[code]];
}

function buildNewsArticle(entry: NewsCollectionEntry, code: HomepageLocaleCode): NewsArticle {
  const localized = getLocalizedNewsContent(entry, code);

  return {
    slug: entry.slug,
    href: buildNewsHref(entry.slug),
    publishedAt: entry.publishedAt,
    publishedDateText: localized.publishedDateText,
    author: entry.author,
    readTimeMinutes: entry.readTimeMinutes,
    featured: entry.featured,
    image: entry.primaryImage,
    hoverImage: entry.hoverImage,
    imageAlt: localized.imageAlt,
    tag: localized.tag,
    title: localized.title,
    summary: localized.summary,
    metaTitle: localized.metaTitle,
    metaDescription: localized.metaDescription,
    bodyHtml: localized.bodyHtml,
  };
}

function buildNewsCard(entry: NewsCollectionEntry, code: HomepageLocaleCode): NewsListItem {
  const { metaTitle: _metaTitle, metaDescription: _metaDescription, bodyHtml: _bodyHtml, ...card } =
    buildNewsArticle(entry, code);

  return card;
}

function buildNewsChrome(code: HomepageLocaleCode): NewsChrome {
  const locale = INTERIOR_LOCALES[code];

  return {
    ui: locale.ui,
    navItems: locale.navItems,
    footer: locale.footer,
    listingPage: locale.newsListingPage,
    articlePage: locale.newsArticlePage,
  };
}

export async function getHomepageNewsItemsByLocale(
  limit = 5,
): Promise<Record<HomepageLocaleCode, NewsItem[]>> {
  const entries = await getAllNewsEntries();
  const homepageEntries = entries.filter((entry) => entry.featured).slice(0, limit);
  const items = homepageEntries.length > 0 ? homepageEntries : entries.slice(0, limit);

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => [
      code,
      items.map((entry) => {
        const localized = getLocalizedNewsContent(entry, code);

        return {
          tag: localized.tag,
          title: localized.title,
          image: entry.primaryImage,
          altImage: entry.hoverImage,
          href: buildNewsHref(entry.slug),
        };
      }),
    ]),
  ) as Record<HomepageLocaleCode, NewsItem[]>;
}

export async function getAllNewsArticleSlugs(): Promise<string[]> {
  return keystaticReader.collections.news.list();
}

export async function getNewsListingPageData(): Promise<NewsListingPageData> {
  const [siteSettings, entries] = await Promise.all([getSiteSettings(), getAllNewsEntries()]);

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const chrome = buildNewsChrome(code);
      const cards = entries.map((entry) => buildNewsCard(entry, code));

      const routeLocale: NewsListingRouteLocale = {
        meta: chrome.listingPage.meta,
        ui: chrome.ui,
        navItems: chrome.navItems,
        footer: chrome.footer,
        page: chrome.listingPage,
        featuredItem: cards[0] ?? null,
        items: cards.slice(1),
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, NewsListingRouteLocale>;

  return {
    siteSettings,
    languages: siteSettings.languages,
    defaultLanguage: siteSettings.defaultLanguage,
    defaultLocale: localizedContent[siteSettings.defaultLanguage],
    localizedContent,
  };
}

export async function getNewsArticlePageData(slug: string): Promise<NewsArticlePageData> {
  const [siteSettings, entries] = await Promise.all([getSiteSettings(), getAllNewsEntries()]);
  const targetEntry = entries.find((entry) => entry.slug === slug);

  if (!targetEntry) {
    throw new Error(`News article not found for slug "${slug}"`);
  }

  const relatedEntries = entries.filter((entry) => entry.slug !== slug).slice(0, 2);

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const chrome = buildNewsChrome(code);
      const localized = getLocalizedNewsContent(targetEntry, code);

      const routeLocale: NewsArticleRouteLocale = {
        meta: {
          htmlLang: chrome.listingPage.meta.htmlLang,
          title: localized.metaTitle,
          description: localized.metaDescription,
        },
        ui: chrome.ui,
        navItems: chrome.navItems,
        footer: chrome.footer,
        listingPage: chrome.listingPage,
        articlePage: chrome.articlePage,
        page: buildNewsArticle(targetEntry, code),
        relatedArticles: relatedEntries.map((entry) => buildNewsCard(entry, code)),
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, NewsArticleRouteLocale>;

  return {
    siteSettings,
    languages: siteSettings.languages,
    defaultLanguage: siteSettings.defaultLanguage,
    defaultLocale: localizedContent[siteSettings.defaultLanguage],
    localizedContent,
  };
}

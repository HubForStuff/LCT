import type { HomepageLocaleCode, LanguageOption, SiteSettings } from "../homepage/types";
import type {
  InteriorFooterContent,
  InteriorNavItem,
  InteriorPageMeta,
  InteriorPageUi,
  NewsArticlePageContent,
  NewsListingPageContent,
} from "../interior-pages/types";

export type NewsLocaleContent = {
  tag: string;
  title: string;
  summary: string;
  imageAlt: string;
  publishedDateText: string;
  metaTitle: string;
  metaDescription: string;
  bodyHtml: string;
};

export type NewsCollectionEntry = {
  slug: string;
  publishedAt: string;
  author: string;
  readTimeMinutes: number;
  featured: boolean;
  primaryImage: string;
  hoverImage: string;
  en: NewsLocaleContent;
  br: NewsLocaleContent;
  cn: NewsLocaleContent;
};

export type NewsArticle = {
  slug: string;
  href: string;
  publishedAt: string;
  publishedDateText: string;
  author: string;
  readTimeMinutes: number;
  featured: boolean;
  image: string;
  hoverImage: string;
  imageAlt: string;
  tag: string;
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  bodyHtml: string;
};

export type NewsListItem = Omit<NewsArticle, "metaTitle" | "metaDescription" | "bodyHtml">;

export type NewsChrome = {
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  listingPage: NewsListingPageContent;
  articlePage: NewsArticlePageContent;
};

export type NewsListingRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  page: NewsListingPageContent;
  featuredItem: NewsListItem | null;
  items: NewsListItem[];
};

export type NewsArticleRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  listingPage: NewsListingPageContent;
  articlePage: NewsArticlePageContent;
  page: NewsArticle;
  relatedArticles: NewsListItem[];
};

type BaseNewsPageData<TLocale> = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: TLocale;
  localizedContent: Record<HomepageLocaleCode, TLocale>;
};

export type NewsListingPageData = BaseNewsPageData<NewsListingRouteLocale>;
export type NewsArticlePageData = BaseNewsPageData<NewsArticleRouteLocale>;

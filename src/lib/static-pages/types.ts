import type { DesktopMenuSection, HomepageLocaleCode, LanguageOption, SiteSettings } from "../homepage/types";
import type {
  InteriorFooterContent,
  InteriorNavItem,
  InteriorPageMeta,
  InteriorPageUi,
} from "../interior-pages/types";
import type { ProgramListingContent } from "../programs/types";
import type { AdvisoryServiceCard } from "../advisory/types";

export type StaticPageSection = {
  id: string;
  eyebrow: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type StaticPageLocaleContent = {
  eyebrow: string;
  title: string;
  summary?: string;
  imageAlt: string;
  metaTitle: string;
  metaDescription: string;
  bodyHtml: string;
  sections: StaticPageSection[];
};

export type StaticPageCollectionEntry = {
  slug: string;
  order: number;
  /** Defaults to true when absent. `false` keeps the content but skips the route. */
  published?: boolean;
  hideHero?: boolean;
  primaryImage: string;
  en: StaticPageLocaleContent;
  br: StaticPageLocaleContent;
  cn: StaticPageLocaleContent;
};

export type StaticPage = StaticPageLocaleContent & {
  slug: string;
  href: string;
  image: string;
  hideHero: boolean;
};

export type StaticPageRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
  page: StaticPage;
  programs?: ProgramListingContent;
  advisoryServices?: AdvisoryServiceCard[];
};

export type StaticPageData = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: StaticPageRouteLocale;
  localizedContent: Record<HomepageLocaleCode, StaticPageRouteLocale>;
};

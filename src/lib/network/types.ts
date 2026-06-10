import type {
  DesktopMenuSection,
  HomepageLocaleCode,
  LanguageOption,
  SiteSettings,
} from "../homepage/types";
import type {
  InteriorFooterContent,
  InteriorNavItem,
  InteriorPageMeta,
  InteriorPageUi,
} from "../interior-pages/types";

// Resolved shapes consumed by the component
export type NetworkListingItem = {
  name: string;
  intro: string;
  thumbnail?: string;
  imageAlt?: string;
};

export type NetworkListingPageMeta = {
  eyebrow: string;
  title: string;
  description: string;
};

export type NetworkListingRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
  page: NetworkListingPageMeta;
  items: NetworkListingItem[];
};

export type NetworkListingData = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: NetworkListingRouteLocale;
  localizedContent: Record<HomepageLocaleCode, NetworkListingRouteLocale>;
};

// Raw Keystatic shapes
export type NetworkListingLocaleContent = {
  name: string;
  intro: string;
};

export type NetworkListingCollectionEntry = {
  slug: { name: string; slug: string };
  order: number;
  thumbnail: string | null;
  imageAlt: string;
  en: NetworkListingLocaleContent;
  br: NetworkListingLocaleContent;
  cn: NetworkListingLocaleContent;
};

export type NetworkListingPageLocaleContent = {
  eyebrow: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
};

export type NetworkListingPageSingleton = {
  en: NetworkListingPageLocaleContent;
  br: NetworkListingPageLocaleContent;
  cn: NetworkListingPageLocaleContent;
};

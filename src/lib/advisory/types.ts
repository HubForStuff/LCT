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

export type AdvisoryLocaleContent = {
  eyebrow: string;
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  bodyHtml: string;
};

export type AdvisoryCollectionEntry = {
  slug: string;
  order: number;
  thumbnail: string | null;
  thumbnailAlt: string;
  heroImage: string | null;
  heroImageAlt: string;
  en: AdvisoryLocaleContent;
  br: AdvisoryLocaleContent;
  cn: AdvisoryLocaleContent;
};

export type AdvisoryServiceCard = {
  href: string;
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  thumbnail?: string;
  thumbnailAlt?: string;
};

export type AdvisoryDetail = {
  slug: string;
  href: string;
  listingHref: string;
  heroImage?: string;
  heroImageAlt?: string;
} & AdvisoryLocaleContent;

export type AdvisoryDetailCopy = {
  backLabel: string;
};

export type AdvisoryDetailRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
  detail: AdvisoryDetailCopy;
  page: AdvisoryDetail;
};

export type AdvisoryDetailData = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: AdvisoryDetailRouteLocale;
  localizedContent: Record<HomepageLocaleCode, AdvisoryDetailRouteLocale>;
};

import type { DesktopMenuSection, HomepageLocaleCode, LanguageOption, SiteSettings } from "../homepage/types";
import type {
  CompetitionCard,
  CompetitionFeaturedCard,
  CompetitionTab,
  CompetitionsPageContent,
  InteriorFooterContent,
  InteriorNavItem,
  InteriorPageMeta,
  InteriorPageUi,
  InteriorPageRouteLocale,
  PreRegistrationPageContent,
} from "../interior-pages/types";

export type CompetitionTrack = "startup" | "corporate" | "academic";
export type CompetitionStatusTone = "open" | "future" | "closed";
export type CompetitionAccent = "warm" | "cool";

export type CompetitionLocaleContent = {
  category: string;
  name: string;
  description: string;
  statusLabel: string;
  deadlinePrefix: string;
  deadlineValue: string;
  ctaLabel: string;
  featuredTag: string;
  featuredValueCaption: string;
  detailEyebrow: string;
  detailSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  overviewHtml: string;
  eligibilityTitle: string;
  eligibilityHtml: string;
  supportTitle: string;
  supportHtml: string;
  processTitle: string;
  processHtml: string;
  applicationLabel: string;
};

export type CompetitionCollectionEntry = {
  slug: string;
  track: CompetitionTrack;
  statusTone: CompetitionStatusTone;
  draft?: boolean;
  accent: CompetitionAccent;
  featured: boolean;
  order: number;
  applicationOpensAt?: string;
  applicationDeadlineAt?: string;
  watermark: string;
  value: string;
  focusTags: string[];
  en: CompetitionLocaleContent;
  br: CompetitionLocaleContent;
  cn: CompetitionLocaleContent;
};

export type CompetitionDetailPageCopy = {
  backLabel: string;
  statusLabel: string;
  deadlineLabel: string;
  trackLabel: string;
  focusLabel: string;
  applyLabel: string;
};

export type CompetitionDetail = {
  slug: string;
  href: string;
  applicationHref: string;
  track: CompetitionTrack;
  trackLabel: string;
  statusTone: CompetitionStatusTone;
  watermark: string;
  value: string;
  focusTags: string[];
  category: string;
  name: string;
  description: string;
  statusLabel: string;
  deadlinePrefix: string;
  deadlineValue: string;
  detailEyebrow: string;
  detailSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  overviewHtml: string;
  eligibilityTitle: string;
  eligibilityHtml: string;
  supportTitle: string;
  supportHtml: string;
  processTitle: string;
  processHtml: string;
  applicationLabel: string;
};

export type CompetitionDetailRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
  listingPage: CompetitionsPageContent;
  detailPage: CompetitionDetailPageCopy;
  page: CompetitionDetail;
};

export type CompetitionFormOption = {
  slug: string;
  label: string;
  track: CompetitionTrack;
  statusTone: CompetitionStatusTone;
};

export type CompetitionFormRouteLocale = InteriorPageRouteLocale<PreRegistrationPageContent> & {
  competitionOptions: CompetitionFormOption[];
};

export type CompetitionListCard = CompetitionCard & {
  href: string;
  slug: string;
  statusTone: CompetitionStatusTone;
  focusKeys: string[];
  sortDate: string;
  displayOrder: number;
};

export type CompetitionListFeaturedCard = CompetitionFeaturedCard & {
  href: string;
  slug: string;
  statusTone: CompetitionStatusTone;
  focusKeys: string[];
  sortDate: string;
  displayOrder: number;
};

export type CompetitionListingTab = Omit<CompetitionTab, "featured" | "cards"> & {
  featured?: CompetitionListFeaturedCard;
  cards?: CompetitionListCard[];
};

export type CompetitionListingPageContent = Omit<CompetitionsPageContent, "tabs"> & {
  tabs: CompetitionListingTab[];
};

export type CompetitionListingRouteLocale = Omit<
  InteriorPageRouteLocale<CompetitionsPageContent>,
  "page"
> & {
  page: CompetitionListingPageContent;
};

type BaseCompetitionPageData<TLocale> = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: TLocale;
  localizedContent: Record<HomepageLocaleCode, TLocale>;
};

export type CompetitionListingPageData = BaseCompetitionPageData<CompetitionListingRouteLocale>;
export type CompetitionDetailPageData = BaseCompetitionPageData<CompetitionDetailRouteLocale>;

export type CompetitionLocalizedEntry = {
  slug: string;
  track: CompetitionTrack;
  statusTone: CompetitionStatusTone;
  draft?: boolean;
  accent: CompetitionAccent;
  featured: boolean;
  order: number;
  applicationOpensAt?: string;
  applicationDeadlineAt?: string;
  watermark: string;
  value: string;
  focusTags: string[];
  localized: CompetitionLocaleContent;
};

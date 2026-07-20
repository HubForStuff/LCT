import type {
  DesktopMenuCard,
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

export type ProgramTrack = "market-entry" | "business-mission";
export type ProgramStatusTone = "open" | "future" | "closed";

export type ProgramLocaleContent = {
  category: string;
  name: string;
  description: string;
  statusLabel: string;
  deadlinePrefix: string;
  deadlineValue: string;
  ctaLabel: string;
  featuredTag: string;
  featuredValueCaption?: string;
  featuredValue?: string;
  detailEyebrow: string;
  detailSubtitle: string;
  metaTitle: string;
  metaDescription: string;
  bodyHtml: string;
  applicationLabel: string;
};

export type ProgramCollectionEntry = {
  slug: string;
  track: ProgramTrack;
  statusTone: ProgramStatusTone;
  draft?: boolean;
  featured: boolean;
  order: number;
  applicationOpensAt?: string;
  applicationDeadlineAt?: string;
  detailImage?: string;
  en: ProgramLocaleContent;
  br: ProgramLocaleContent;
  cn: ProgramLocaleContent;
};

export type ProgramCard = {
  href: string;
  slug: string;
  category: string;
  name: string;
  description: string;
  status: string;
  statusTone: ProgramStatusTone;
  deadlinePrefix: string;
  deadlineValue: string;
  ctaLabel: string;
  sortDate: string;
  displayOrder: number;
};

export type ProgramFeaturedCard = ProgramCard & {
  tag: string;
  value: string;
  valueCaption: string;
};

export type ProgramTabContent = {
  id: ProgramTrack;
  label: string;
  count: number;
  featured?: ProgramFeaturedCard;
  cards: ProgramCard[];
};

export type ProgramListingContent = {
  tabsAriaLabel: string;
  emptyStateTitle: string;
  emptyStateBody: string;
  tabs: ProgramTabContent[];
};

export type ProgramDetailCopy = {
  backLabel: string;
  viewAllLabel: string;
  timelineLabel: string;
  focusLabel: string;
  statusLabel: string;
};

export type ProgramDetail = {
  slug: string;
  href: string;
  listingHref: string;
  applicationHref: string;
  track: ProgramTrack;
  statusTone: ProgramStatusTone;
  detailImage?: string;
  applicationOpensAt?: string;
  applicationDeadlineAt?: string;
  focusTags: string[];
} & ProgramLocaleContent;

export type ProgramDetailRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: import("../homepage/types").DesktopMenuSection[];
  navExploreLabel: string;
  detail: ProgramDetailCopy;
  page: ProgramDetail;
};

export type ProgramDetailData = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: ProgramDetailRouteLocale;
  localizedContent: Record<HomepageLocaleCode, ProgramDetailRouteLocale>;
};

export type ProgramMenuCardsByLocale = Record<
  HomepageLocaleCode,
  { marketEntry?: DesktopMenuCard; businessMission?: DesktopMenuCard }
>;

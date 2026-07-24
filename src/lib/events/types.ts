import type { DesktopMenuSection, HomepageLocaleCode, LanguageOption, SiteSettings } from "../homepage/types";
import type {
  InteriorFooterContent,
  InteriorNavItem,
  InteriorPageMeta,
  InteriorPageUi,
} from "../interior-pages/types";

export type EventCategory = "trade-fair" | "summit";
export type EventStatus = "open" | "upcoming" | "past";
export type EventRegion = "china" | "latam";

export type EventLocaleContent = {
  category: string;
  name: string;
  description: string;
  statusLabel: string;
  dateLabel: string;
  locationLabel: string;
  ctaLabel: string;
  boothCtaLabel: string;
  metaTitle: string;
  metaDescription: string;
  overviewHtml: string;
  whoShouldAttendTitle: string;
  whoShouldAttendHtml: string;
  formatTitle: string;
  formatHtml: string;
};

export type EventCollectionEntry = {
  slug: string;
  category: EventCategory;
  status: EventStatus;
  region: EventRegion;
  country: string;
  location: string;
  industry: string;
  code: string;
  flagship: boolean;
  lctHosted: boolean;
  booth: boolean;
  draft?: boolean;
  order: number;
  startDate: string;
  endDate: string;
  detailImage?: string;
  en: EventLocaleContent;
  br: EventLocaleContent;
  cn: EventLocaleContent;
};

export type EventListCard = {
  slug: string;
  href: string;
  applicationHref: string;
  code: string;
  category: EventCategory;
  categoryLabel: string;
  name: string;
  description: string;
  status: EventStatus;
  statusLabel: string;
  dateLabel: string;
  location: string;
  country: string;
  region: EventRegion;
  industry: string;
  flagship: boolean;
  booth: boolean;
  boothHref: string;
  boothCtaLabel: string;
  ctaLabel: string;
  startDate: string;
  order: number;
};

export type EventMonthGroup = {
  key: string;
  label: string;
  cards: EventListCard[];
};

export type EventTab = {
  id: string;
  label: string;
  count: number;
  anchorId: string;
  months: EventMonthGroup[];
};

export type EventFilterOption = {
  value: string;
  label: string;
};

export type EventsPageContent = {
  meta: InteriorPageMeta;
  eyebrow: string;
  titleHtml: string;
  statusLabel: string;
  regionLabel: string;
  industryLabel: string;
  locationPanelLabel: string;
  sortLabel: string;
  filtersAriaLabel: string;
  tabsAriaLabel: string;
  statusFilters: EventFilterOption[];
  regionFilters: EventFilterOption[];
  industryFilters: EventFilterOption[];
  chinaLocations: EventFilterOption[];
  latamGroups: { label: string; countries: EventFilterOption[] }[];
  sortOptions: string[];
  placeholderLabel: string;
  listYourEventLabel: string;
  listYourEventCtaLabel: string;
  tabs: EventTab[];
};

export type EventDetailCopy = {
  backLabel: string;
  viewAllLabel: string;
  statusLabel: string;
  datesLabel: string;
  locationLabel: string;
  industryLabel: string;
  applyLabel: string;
  boothLabel: string;
};

export type EventDetail = {
  slug: string;
  href: string;
  listingHref: string;
  applicationHref: string;
  code: string;
  categoryLabel: string;
  name: string;
  description: string;
  status: EventStatus;
  statusLabel: string;
  dateLabel: string;
  location: string;
  industry: string;
  industryLabel: string;
  flagship: boolean;
  booth: boolean;
  detailImage: string;
  metaTitle: string;
  metaDescription: string;
  overviewHtml: string;
  whoShouldAttendTitle: string;
  whoShouldAttendHtml: string;
  formatTitle: string;
  formatHtml: string;
};

type BaseEventRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
};

export type EventListingRouteLocale = BaseEventRouteLocale & {
  page: EventsPageContent;
};

export type EventDetailRouteLocale = BaseEventRouteLocale & {
  detail: EventDetailCopy;
  page: EventDetail;
};

type BaseEventPageData<TLocale> = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: TLocale;
  localizedContent: Record<HomepageLocaleCode, TLocale>;
};

export type EventListingPageData = BaseEventPageData<EventListingRouteLocale>;
export type EventDetailPageData = BaseEventPageData<EventDetailRouteLocale>;

export type EventFormOption = {
  slug: string;
  label: string;
  status: EventStatus;
};

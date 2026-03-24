export const HOMEPAGE_LOCALE_CODES = ["EN", "BR", "CN"] as const;

export type HomepageLocaleCode = (typeof HOMEPAGE_LOCALE_CODES)[number];

export type LanguageOption = {
  code: HomepageLocaleCode;
  label: string;
};

export type SocialLinks = {
  instagram: string;
  linkedin: string;
  whatsapp: string;
};

export type SiteSettings = {
  siteName: string;
  brandLead: string;
  brandMain: string;
  brandFoot: string;
  defaultLanguage: HomepageLocaleCode;
  languages: LanguageOption[];
  newsletterUrl: string;
  socialLinks: SocialLinks;
};

export type HomepageMeta = {
  htmlLang: string;
  title: string;
  description: string;
};

export type HomepageUi = {
  chooseLanguage: string;
  language: string;
  menu: string;
  newsletterEmail: string;
  newsletterPlaceholder: string;
  close: string;
  learnMore: string;
  contact: string;
  insights: string;
  programs: string;
  followWechat: string;
  wechatCopy: string;
  scanWechat: string;
  homeLabel: string;
};

export type DesktopMenuLink = {
  title: string;
  subtitle: string;
};

export type DesktopMenuCard = {
  title: string;
  body: string;
  cta: string;
};

export type DesktopMenuSection = {
  label: string;
  links: DesktopMenuLink[];
  note: string;
  noteLink: string;
  description: string;
  card: DesktopMenuCard;
};

export type HeroContent = {
  desktopTitleHtml: string;
  mobileTitleHtml: string;
  subtitle: string;
  ctas: string[];
};

export type CategoryCard = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  theme: "dark" | "light";
};

export type CompetitionsSection = {
  eye: string;
  desktopTitle: string;
  mobileTitleHtml: string;
  allLink: string;
};

export type CompetitionCard = {
  label: string;
  titleHtml: string;
  description: string;
  status: string;
  cta: string;
  watermark: string;
  theme: "blue" | "red";
};

export type NewsSection = {
  eye: string;
  title: string;
  allLink: string;
};

export type NewsItem = {
  tag: string;
  title: string;
  image: string;
  altImage: string;
};

export type FooterCta = {
  eye: string;
  titleHtml: string;
  button: string;
};

export type FooterColumn = {
  title: string;
  links: string[];
};

export type MobileMenuCard = {
  title: string;
  description: string;
  cta: string;
  theme: "red" | "white";
};

export type MobileMenuSection = {
  label: string;
  cards: MobileMenuCard[];
};

export type FooterContent = {
  newsletterTitle: string;
  desktopSubscribe: string;
  mobileSubscribe: string;
  scanWechat: string;
  followWechat: string;
  wechatCopy: string;
};

export type HomepageLocaleContent = {
  meta: HomepageMeta;
  ui: HomepageUi;
  hero: HeroContent;
  navExploreLabel: string;
  desktopMenuSections: DesktopMenuSection[];
  categoryCards: CategoryCard[];
  competitionsSection: CompetitionsSection;
  competitionCards: CompetitionCard[];
  newsSection: NewsSection;
  newsItems: NewsItem[];
  footerCta: FooterCta;
  footerColumns: FooterColumn[];
  mobileMenuSections: MobileMenuSection[];
  mobileBottomLinks: string[];
  footer: FooterContent;
};

export type HomepageLocalizedContent = Record<HomepageLocaleCode, HomepageLocaleContent>;

export type HomepageData = {
  siteSettings: SiteSettings;
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: HomepageLocaleContent;
  localizedContent: HomepageLocalizedContent;
};

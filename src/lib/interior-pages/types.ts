import type { HomepageLocaleCode, LanguageOption, SiteSettings } from "../homepage/types";

export type InteriorPageMeta = {
  htmlLang: string;
  title: string;
  description: string;
};

export type InteriorPageUi = {
  chooseLanguage: string;
  homeLabel: string;
  newsletterEmail: string;
  newsletterPlaceholder: string;
};

export type InteriorLink = {
  label: string;
  href: string;
};

export type InteriorNavItem = {
  label: string;
  href: string;
};

export type InteriorFooterColumn = {
  title: string;
  links: InteriorLink[];
};

export type InteriorFooterContent = {
  eyebrow: string;
  titleHtml: string;
  buttonLabel: string;
  buttonHref: string;
  newsletterTitle: string;
  newsletterButtonLabel: string;
  bottomNote: string;
  columns: InteriorFooterColumn[];
};

export type CompetitionFilter = {
  label: string;
  tone: "neutral" | "open" | "future" | "closed" | "blue" | "green" | "orange" | "violet" | "teal";
  active?: boolean;
};

export type CompetitionCard = {
  category: string;
  name: string;
  description: string;
  watermark: string;
  prize: string;
  status: string;
  statusTone: "open" | "future" | "closed";
  deadlinePrefix: string;
  deadlineValue: string;
  ctaLabel: string;
  accent: "warm" | "cool";
};

export type CompetitionFeaturedCard = {
  theme: "startup" | "corporate";
  tag: string;
  category: string;
  title: string;
  description: string;
  value: string;
  valueCaption: string;
  status: string;
  deadlinePrefix: string;
  deadlineValue: string;
  ctaLabel: string;
  watermark: string;
};

export type CompetitionTab = {
  id: string;
  label: string;
  count: number;
  featured?: CompetitionFeaturedCard;
  cards?: CompetitionCard[];
  placeholderLabel?: string;
  emptyStateTitle?: string;
  emptyStateBody?: string;
};

export type CompetitionsPageContent = {
  meta: InteriorPageMeta;
  eyebrow: string;
  titleHtml: string;
  statusLabel: string;
  focusLabel: string;
  sortLabel: string;
  filtersAriaLabel: string;
  tabsAriaLabel: string;
  statusFilters: CompetitionFilter[];
  focusFilters: CompetitionFilter[];
  sortOptions: string[];
  loadMoreLabel: string;
  tabs: CompetitionTab[];
};

export type ResourceAction = {
  label: string;
  href: string;
  theme: "dark" | "light";
  icon: "download" | "play";
};

export type ProgressStep = {
  number: string;
  label: string;
  target: string;
};

export type BenefitOption = {
  label: string;
  value: string;
  short: string;
  tone: "blue" | "green" | "sand" | "lilac";
};

export type PreRegistrationPageContent = {
  meta: InteriorPageMeta;
  eyebrow: string;
  titleHtml: string;
  subtitle: string;
  formProgressLabel: string;
  banner: {
    badge: string;
    title: string;
    descriptionHtml: string;
    supportLabel: string;
    supportName: string;
    supportItems: string[];
  };
  guide: {
    title: string;
    description: string;
    actions: ResourceAction[];
  };
  progressSteps: ProgressStep[];
  sections: {
    competitionInformationTitle: string;
    competitionInformationSubtitle: string;
    applicantTitle: string;
    applicantSubtitle: string;
    projectTitle: string;
    projectSubtitle: string;
    beijingTitle: string;
    beijingSubtitle: string;
  };
  notes: {
    applicant: string;
    beijing: string;
  };
  fields: {
    selectedCompetition: string;
    selectedCompetitionPlaceholder: string;
    projectName: string;
    projectNamePlaceholder: string;
    projectIntroduction: string;
    projectIntroductionHint: string;
    projectIntroductionPlaceholder: string;
    competitionField: string;
    competitionFieldPlaceholder: string;
    companyHeadquarters: string;
    companyLocation: string;
    companyLocationPlaceholder: string;
    companyFullName: string;
    companyFullNamePlaceholder: string;
    officeAddress: string;
    officeAddressPlaceholder: string;
    fullName: string;
    fullNamePlaceholder: string;
    gender: string;
    dateOfBirth: string;
    nationality: string;
    nationalityPlaceholder: string;
    graduationInstitution: string;
    graduationInstitutionPlaceholder: string;
    highestDegree: string;
    highestDegreePlaceholder: string;
    wechatOrWhatsapp: string;
    wechatOrWhatsappPlaceholder: string;
    linkedIn: string;
    linkedInPlaceholder: string;
    email: string;
    emailPlaceholder: string;
    elevatorPitch: string;
    elevatorPitchHint: string;
    elevatorPitchPlaceholder: string;
    projectOverview: string;
    projectOverviewPlaceholder: string;
    productFeatures: string;
    productFeaturesPlaceholder: string;
    businessModel: string;
    businessModelPlaceholder: string;
    teamIntroduction: string;
    teamIntroductionPlaceholder: string;
    investmentValue: string;
    investmentValuePlaceholder: string;
    pitchingDeck: string;
    pitchingDeckHint: string;
    pitchingDeckUploadLabel: string;
    pitchingDeckUploadSubtext: string;
    supplementaryMaterials: string;
    supplementaryMaterialsHint: string;
    supplementaryMaterialsUploadLabel: string;
    supplementaryMaterialsUploadSubtext: string;
    expectedBenefits: string;
    hearAbout: string;
    hearAboutPlaceholder: string;
    beijingPlan: string;
    beijingPlanPlaceholder: string;
    incorporationTimeline: string;
    incorporationTimelineHint: string;
    incorporationTimelinePlaceholder: string;
  };
  writeWithAiLabel: string;
  wordCountTarget: string;
  companyHeadquartersOptions: string[];
  genderOptions: string[];
  degreeOptions: string[];
  competitionFieldOptions: string[];
  benefits: BenefitOption[];
  hearAboutOptions: string[];
  incorporationTimelineOptions: string[];
  submitNoteHtml: string;
  saveDraftLabel: string;
  submitLabel: string;
};

export type NewsListingPageContent = {
  meta: InteriorPageMeta;
  eyebrow: string;
  title: string;
  description: string;
  featuredLabel: string;
  allArticlesLabel: string;
  readArticleLabel: string;
  publishedLabel: string;
  readingTimeLabel: string;
  emptyStateTitle: string;
  emptyStateBody: string;
};

export type NewsArticlePageContent = {
  backLabel: string;
  publishedLabel: string;
  readingTimeLabel: string;
  writtenByLabel: string;
  moreInsightsLabel: string;
  allInsightsLabel: string;
};

export type InteriorPageLocaleContent = {
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  competitionsPage: CompetitionsPageContent;
  preRegistrationPage: PreRegistrationPageContent;
  newsListingPage: NewsListingPageContent;
  newsArticlePage: NewsArticlePageContent;
};

export type InteriorPageKey = keyof Pick<
  InteriorPageLocaleContent,
  "competitionsPage" | "preRegistrationPage"
>;

export type InteriorPageContentByKey = {
  competitionsPage: CompetitionsPageContent;
  preRegistrationPage: PreRegistrationPageContent;
};

export type InteriorPageRouteLocale<TPage> = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  page: TPage;
};

export type InteriorPageLocalizedContent<TPage> = Record<
  HomepageLocaleCode,
  InteriorPageRouteLocale<TPage>
>;

export type InteriorPageData<TPage> = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: InteriorPageRouteLocale<TPage>;
  localizedContent: InteriorPageLocalizedContent<TPage>;
};

import homepageSiteSettings from "./homepage/site-settings.json";

import type { SiteSettings } from "../lib/homepage/types";

export type InteriorNavItem = {
  label: string;
  href: string;
};

export type InteriorFooterLink = {
  label: string;
  href: string;
};

export type InteriorFooterColumn = {
  title: string;
  links: InteriorFooterLink[];
};

export type InteriorFooterContent = {
  eyebrow: string;
  titleHtml: string;
  buttonLabel: string;
  buttonHref: string;
  columns: InteriorFooterColumn[];
  newsletterTitle: string;
  newsletterPlaceholder: string;
  newsletterButtonLabel: string;
  bottomNote: string;
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
  emptyStateTitle?: string;
  emptyStateBody?: string;
};

export type CompetitionsPageContent = {
  meta: {
    title: string;
    description: string;
  };
  eyebrow: string;
  titleHtml: string;
  statusFilters: CompetitionFilter[];
  focusFilters: CompetitionFilter[];
  sortOptions: string[];
  tabs: CompetitionTab[];
  loadMoreLabel: string;
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
  meta: {
    title: string;
    description: string;
  };
  eyebrow: string;
  titleHtml: string;
  subtitle: string;
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
  competitionFieldOptions: string[];
  companyHeadquartersOptions: string[];
  degreeOptions: string[];
  benefits: BenefitOption[];
  hearAboutOptions: string[];
  incorporationTimelineOptions: string[];
  submitNoteHtml: string;
};

export const interiorSiteSettings = homepageSiteSettings as SiteSettings;

export const interiorNavItems: InteriorNavItem[] = [
  { label: "Advisory", href: "/" },
  { label: "Competitions & Challenges", href: "/competitions/" },
  { label: "Events", href: "/" },
  { label: "Programs", href: "/" },
  { label: "Network", href: "/" },
];

export const interiorFooter: InteriorFooterContent = {
  eyebrow: "Scale with us",
  titleHtml:
    "Get funded, connected,<br />and scale with <span>LATAM CHINA TECH</span>",
  buttonLabel: "View Programs",
  buttonHref: "/",
  columns: [
    {
      title: "Services",
      links: [
        { label: "Investment", href: "/" },
        { label: "Tech Transfer", href: "/" },
      ],
    },
    {
      title: "Competitions",
      links: [
        { label: "Startup Competitions", href: "/competitions/" },
        { label: "Corporate Challenges", href: "/competitions/" },
      ],
    },
    {
      title: "Events",
      links: [
        { label: "Trade Fairs & Expos", href: "/" },
        { label: "Summits", href: "/" },
      ],
    },
    {
      title: "Expansion",
      links: [
        { label: "Market Entry", href: "/" },
        { label: "Business Mission", href: "/" },
      ],
    },
  ],
  newsletterTitle: "Stay close to the next China-LATAM opportunity",
  newsletterPlaceholder: "Your email",
  newsletterButtonLabel: "Subscribe on Substack",
  bottomNote:
    "Built for founders, investors, and corporate innovators bridging Latin America and China.",
};

export const competitionsPage: CompetitionsPageContent = {
  meta: {
    title: "Challenges & Competitions | LATAM China Tech",
    description:
      "Explore startup competitions, corporate challenges, and innovation opportunities connecting Latin America and China.",
  },
  eyebrow: "Open for Applications",
  titleHtml: "Challenges &amp; <em>Competitions</em>",
  statusFilters: [
    { label: "All", tone: "neutral", active: true },
    { label: "Open", tone: "open" },
    { label: "Future", tone: "future" },
    { label: "Closed", tone: "closed" },
  ],
  focusFilters: [
    { label: "All Industries", tone: "neutral", active: true },
    { label: "Deep Tech", tone: "violet" },
    { label: "Sustainability", tone: "green" },
    { label: "FinTech", tone: "blue" },
    { label: "AgriTech", tone: "green" },
    { label: "AI", tone: "violet" },
    { label: "HealthTech", tone: "orange" },
    { label: "Logistics", tone: "orange" },
    { label: "BioTech", tone: "teal" },
    { label: "Manufacturing", tone: "closed" },
  ],
  sortOptions: [
    "Sort: Deadline (nearest)",
    "Sort: Prize (highest)",
    "Sort: Newest",
  ],
  loadMoreLabel: "Load More Challenges",
  tabs: [
    {
      id: "startup",
      label: "Startup Competitions",
      count: 9,
      featured: {
        theme: "startup",
        tag: "Featured Challenge",
        category: "Deep Tech · Cross-Border",
        title: "Greater Tech Challenge 2025",
        description:
          "The flagship innovation competition bridging Latin America and China. Submit your breakthrough solution in AI, cleantech, or biotech and compete for the largest prize pool in the region.",
        value: "$500K",
        valueCaption: "Total Awards",
        status: "Open Now",
        deadlinePrefix: "Closes",
        deadlineValue: "Sep 30, 2025",
        ctaLabel: "Apply Now",
        watermark: "GTC",
      },
      cards: [
        {
          category: "FinTech",
          name: "China-LATAM FinTech Cup",
          description:
            "Financial inclusion innovation across emerging markets. Build solutions for the unbanked across Brazil, Mexico, and Southeast China.",
          watermark: "FIN",
          prize: "$200K",
          status: "Open",
          statusTone: "open",
          deadlinePrefix: "Closes",
          deadlineValue: "Aug 15, 2025",
          ctaLabel: "Apply Now",
          accent: "warm",
        },
        {
          category: "AgriTech · Sustainability",
          name: "Food Future Challenge",
          description:
            "Transforming agriculture supply chains between Latin America's farmlands and China's markets using AI, IoT, and precision agriculture.",
          watermark: "AGR",
          prize: "$150K",
          status: "Future",
          statusTone: "future",
          deadlinePrefix: "Opens",
          deadlineValue: "Jul 1, 2025",
          ctaLabel: "Learn More",
          accent: "warm",
        },
        {
          category: "CleanTech",
          name: "Clean Energy Sprint",
          description:
            "Accelerating decarbonization across Latin American cities using Chinese clean energy technology. Solar, wind, and grid innovation welcome.",
          watermark: "CLN",
          prize: "$300K",
          status: "Open",
          statusTone: "open",
          deadlinePrefix: "Closes",
          deadlineValue: "Oct 10, 2025",
          ctaLabel: "Apply Now",
          accent: "warm",
        },
        {
          category: "AI · Startup",
          name: "AI Founders Battle",
          description:
            "Early-stage AI founders competing for market access, seed investment, and a 6-month acceleration in Shenzhen and São Paulo.",
          watermark: "AI",
          prize: "$120K + inv.",
          status: "Open",
          statusTone: "open",
          deadlinePrefix: "Closes",
          deadlineValue: "Jul 31, 2025",
          ctaLabel: "Apply Now",
          accent: "warm",
        },
        {
          category: "Logistics · Supply Chain",
          name: "Trade Route 2050 Challenge",
          description:
            "Reimagining cross-Pacific logistics for the next generation with autonomous freight, port automation, and smart customs solutions.",
          watermark: "LOG",
          prize: "$180K",
          status: "Future",
          statusTone: "future",
          deadlinePrefix: "Opens",
          deadlineValue: "Aug 1, 2025",
          ctaLabel: "Learn More",
          accent: "warm",
        },
        {
          category: "EdTech · Social Impact",
          name: "EduBridge Hackathon",
          description:
            "A 48-hour sprint for multilingual education tools serving underserved communities through Chinese EdTech infrastructure.",
          watermark: "EDU",
          prize: "$60K",
          status: "Open",
          statusTone: "open",
          deadlinePrefix: "Closes",
          deadlineValue: "Jun 20, 2025",
          ctaLabel: "Apply Now",
          accent: "warm",
        },
        {
          category: "BioTech · Health",
          name: "Pacific BioVenture Prize",
          description:
            "Connecting biotech startups with LATAM-China co-development pathways. The 2024 edition closed and 2026 early access is now open.",
          watermark: "BIO",
          prize: "$90K",
          status: "Closed",
          statusTone: "closed",
          deadlinePrefix: "Closed",
          deadlineValue: "Apr 15, 2025",
          ctaLabel: "Join Waitlist",
          accent: "warm",
        },
        {
          category: "Manufacturing · Deep Tech",
          name: "Smart Factory Sprint",
          description:
            "Industry 4.0 solutions for LATAM manufacturing powered by Chinese automation and IoT technology. Hardware and software welcome.",
          watermark: "MFG",
          prize: "$175K",
          status: "Open",
          statusTone: "open",
          deadlinePrefix: "Closes",
          deadlineValue: "Nov 5, 2025",
          ctaLabel: "Apply Now",
          accent: "warm",
        },
      ],
    },
    {
      id: "corporate",
      label: "Corporate Challenges",
      count: 5,
      featured: {
        theme: "corporate",
        tag: "Featured Challenge",
        category: "Corporate · Market Entry",
        title: "China Market Entry Accelerator 2025",
        description:
          "The premier programme for established LATAM companies ready to enter the Chinese market through structured support, in-market immersion, and direct access to distribution partners.",
        value: "Market Access",
        valueCaption: "Advisory Package",
        status: "Open Now",
        deadlinePrefix: "Closes",
        deadlineValue: "Oct 15, 2025",
        ctaLabel: "Apply Now",
        watermark: "COR",
      },
      cards: [
        {
          category: "SME · Scale-Up",
          name: "SME Export Accelerator",
          description:
            "For established companies seeking to scale their China market strategy with structured advisory, trade facilitation, and on-ground support.",
          watermark: "SME",
          prize: "Market Access",
          status: "Open",
          statusTone: "open",
          deadlinePrefix: "Rolling",
          deadlineValue: "Applications",
          ctaLabel: "Apply Now",
          accent: "cool",
        },
        {
          category: "HealthTech · Corporate",
          name: "MedBridge Innovation Award",
          description:
            "Connecting Latin American biotech companies with China's healthcare distribution and co-development market through an enterprise track.",
          watermark: "MED",
          prize: "$250K",
          status: "Open",
          statusTone: "open",
          deadlinePrefix: "Closes",
          deadlineValue: "Dec 1, 2025",
          ctaLabel: "Apply Now",
          accent: "cool",
        },
        {
          category: "Retail · Consumer Goods",
          name: "LATAM Brands in China",
          description:
            "A corporate challenge for LATAM consumer brands preparing to launch on China's e-commerce platforms with Tier-1 distribution partners.",
          watermark: "RET",
          prize: "Distribution",
          status: "Future",
          statusTone: "future",
          deadlinePrefix: "Opens",
          deadlineValue: "Sep 1, 2025",
          ctaLabel: "Learn More",
          accent: "cool",
        },
        {
          category: "Energy · Infrastructure",
          name: "Green Infrastructure Challenge",
          description:
            "Corporate track for infrastructure teams partnering with Chinese EPC firms on LATAM renewable energy projects.",
          watermark: "ENR",
          prize: "$400K",
          status: "Open",
          statusTone: "open",
          deadlinePrefix: "Closes",
          deadlineValue: "Aug 30, 2025",
          ctaLabel: "Apply Now",
          accent: "cool",
        },
        {
          category: "Financial Services",
          name: "Cross-Border Finance Forum",
          description:
            "A challenge for banks, fintechs, and payments companies building LATAM-China FX infrastructure and payment corridors.",
          watermark: "FIN",
          prize: "Partnership",
          status: "Future",
          statusTone: "future",
          deadlinePrefix: "Opens",
          deadlineValue: "Oct 1, 2025",
          ctaLabel: "Learn More",
          accent: "cool",
        },
      ],
    },
    {
      id: "academic",
      label: "Academic Innovation",
      count: 0,
      emptyStateTitle: "Academic Innovation",
      emptyStateBody:
        "Programmes for universities, research institutes, and academic entrepreneurs are coming soon.",
    },
  ],
};

export const preRegistrationPage: PreRegistrationPageContent = {
  meta: {
    title: "HICOOL Pre-Registration | LATAM China Tech",
    description:
      "Start your HICOOL Global Startup Competition pre-registration with LATAM China Tech guidance and application support.",
  },
  eyebrow: "Pre-Registration Open",
  titleHtml: "HICOOL Global<br /><em>Startup Competition</em>",
  subtitle:
    "Ready to apply? Fill in the form below and our team will guide you through every step of your HICOOL application.",
  banner: {
    badge: "Pre-Registration",
    title: "This is a Pre-Registration",
    descriptionHtml:
      "Submit this form and <strong>LATAM CHINA TECH</strong> will personally guide you through your full HICOOL application: reviewing your submission, strengthening your pitch, and maximizing your chances of winning.",
    supportLabel: "Supported by",
    supportName: "LATAM CHINA TECH",
    supportItems: [
      "Application coaching",
      "Network introductions",
      "China market guide",
    ],
  },
  guide: {
    title: "Application Guide & Tutorial",
    description:
      "Before you begin, download our step-by-step PDF guide. It covers competition rules, judging criteria, Beijing incorporation requirements, and tips for a winning application in English, Spanish, and Portuguese.",
    actions: [
      { label: "Download PDF Guide", href: "#", theme: "dark", icon: "download" },
      { label: "Watch Tutorial", href: "#", theme: "light", icon: "play" },
    ],
  },
  progressSteps: [
    { number: "01", label: "Competition Info", target: "section-1" },
    { number: "02", label: "Applicant Details", target: "section-2" },
    { number: "03", label: "Project Information", target: "section-3" },
    { number: "04", label: "Beijing Plan", target: "section-4" },
  ],
  competitionFieldOptions: [
    "Artificial Intelligence & Machine Learning",
    "FinTech & Digital Finance",
    "CleanTech & Sustainability",
    "BioTech & Life Sciences",
    "AgriTech & FoodTech",
    "Smart Manufacturing & Industry 4.0",
    "EdTech & Future of Work",
    "HealthTech & MedTech",
    "Mobility & Logistics",
    "Enterprise SaaS & Cloud",
    "Deep Tech & Hardware",
    "Other Tech Vertical",
  ],
  companyHeadquartersOptions: [
    "China",
    "Other Countries",
    "Not yet established as a company",
  ],
  degreeOptions: [
    "High School Diploma",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "MBA",
    "PhD / Doctorate",
    "Other",
  ],
  benefits: [
    { label: "Policy Declaration", value: "policy", short: "PD", tone: "blue" },
    { label: "Talent Services", value: "talent", short: "TS", tone: "green" },
    { label: "Business & Taxation", value: "tax", short: "BT", tone: "lilac" },
    { label: "Listing Guidance", value: "listing", short: "LG", tone: "sand" },
    { label: "HICOOL Fund Investment", value: "fund", short: "HF", tone: "green" },
    { label: "Financial Advisory", value: "fa", short: "FA", tone: "blue" },
    { label: "VC Matchmaking", value: "vc", short: "VC", tone: "sand" },
    { label: "Industrial Matchmaking", value: "industrial", short: "IM", tone: "lilac" },
    { label: "Scenario Matchmaking", value: "scenario", short: "SM", tone: "blue" },
    { label: "Exhibition", value: "exhibition", short: "EX", tone: "green" },
    { label: "Pitching", value: "pitching", short: "PT", tone: "sand" },
    { label: "Branding", value: "branding", short: "BR", tone: "lilac" },
  ],
  hearAboutOptions: [
    "LATAM CHINA TECH Website",
    "LATAM CHINA TECH Social Media",
    "LinkedIn",
    "Instagram",
    "WhatsApp / WeChat",
    "Friend or Colleague",
    "University or Accelerator",
    "Trade Fair or Event",
    "News Article or Media",
    "Other",
  ],
  incorporationTimelineOptions: [
    "Immediately upon winning",
    "Within 3 months of award",
    "Within 6 months of award",
    "Within 12 months of award",
    "Still evaluating the timeline",
  ],
  submitNoteHtml:
    "By submitting, you confirm that all information is accurate and agree to be contacted by <strong>LATAM CHINA TECH</strong> to support your full application. This is a pre-registration, not the final HICOOL submission.",
};

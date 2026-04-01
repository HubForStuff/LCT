import { fields } from "@keystatic/core";

const requiredText = (label: string, multiline = false) =>
  fields.text({
    label,
    multiline,
    validation: { isRequired: true },
  });

const requiredUrl = (label: string) =>
  fields.url({
    label,
    validation: { isRequired: true },
  });

const localeCodeOptions = [
  { label: "English", value: "EN" },
  { label: "Português", value: "BR" },
  { label: "中文", value: "CN" },
] as const;

const heroCtaField = fields.array(requiredText("CTA label"), {
  label: "Hero CTAs",
});

const simpleLinksField = (label: string) =>
  fields.array(requiredText("Link label"), {
    label,
  });

const desktopMenuLinkFields = fields.object(
  {
    title: requiredText("Title"),
    subtitle: requiredText("Subtitle"),
  },
  { label: "Desktop menu link" },
);

const desktopMenuSectionFields = fields.object(
  {
    label: requiredText("Label"),
    layout: fields.select({
      label: "Layout",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Two cards", value: "two-cards" },
        { label: "Events", value: "events" },
      ],
      defaultValue: "standard",
    }),
    links: fields.array(desktopMenuLinkFields, {
      label: "Links",
    }),
    note: requiredText("Note"),
    noteLink: requiredText("Note link"),
    description: requiredText("Description", true),
    card: fields.object(
      {
        title: requiredText("Card title"),
        body: requiredText("Card body", true),
        cta: requiredText("Card CTA"),
      },
      { label: "Callout card" },
    ),
    card2: fields.object(
      {
        title: fields.text({ label: "Card 2 title" }),
        body: fields.text({ label: "Card 2 body", multiline: true }),
        cta: fields.text({ label: "Card 2 CTA" }),
      },
      { label: "Second callout card" },
    ),
    events: fields.array(
      fields.object(
        {
          tag: requiredText("Tag"),
          title: requiredText("Title"),
          body: requiredText("Body", true),
          linkText: requiredText("Link text"),
        },
        { label: "Event" },
      ),
      { label: "Events" },
    ),
  },
  { label: "Desktop menu section" },
);

const categoryCardFields = fields.object(
  {
    eyebrow: requiredText("Eyebrow"),
    title: requiredText("Title"),
    description: requiredText("Description", true),
    cta: requiredText("CTA"),
    theme: fields.select({
      label: "Theme",
      options: [
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" },
      ],
      defaultValue: "dark",
    }),
  },
  { label: "Category card" },
);

const competitionCardFields = fields.object(
  {
    label: requiredText("Label"),
    titleHtml: requiredText("Title HTML", true),
    description: requiredText("Description", true),
    status: requiredText("Status"),
    cta: requiredText("CTA"),
    watermark: requiredText("Watermark"),
    theme: fields.select({
      label: "Theme",
      options: [
        { label: "Blue", value: "blue" },
        { label: "Red", value: "red" },
      ],
      defaultValue: "blue",
    }),
  },
  { label: "Competition card" },
);

const footerColumnFields = fields.object(
  {
    title: requiredText("Title"),
    links: simpleLinksField("Links"),
  },
  { label: "Footer column" },
);

const mobileMenuCardFields = fields.object(
  {
    title: requiredText("Title"),
    description: requiredText("Description", true),
    cta: requiredText("CTA"),
    theme: fields.select({
      label: "Theme",
      options: [
        { label: "Red", value: "red" },
        { label: "White", value: "white" },
      ],
      defaultValue: "red",
    }),
  },
  { label: "Mobile menu card" },
);

const mobileMenuSectionFields = fields.object(
  {
    label: requiredText("Label"),
    cards: fields.array(mobileMenuCardFields, {
      label: "Cards",
    }),
  },
  { label: "Mobile menu section" },
);

export const siteSettingsSchema = {
  siteName: requiredText("Site name"),
  brandLead: requiredText("Brand lead"),
  brandMain: requiredText("Brand main"),
  brandFoot: requiredText("Brand foot"),
  defaultLanguage: fields.select({
    label: "Default language",
    options: [...localeCodeOptions],
    defaultValue: "EN",
  }),
  languages: fields.array(
    fields.object(
      {
        code: fields.select({
          label: "Code",
          options: [...localeCodeOptions],
          defaultValue: "EN",
        }),
        label: requiredText("Label"),
      },
      { label: "Language option" },
    ),
    {
      label: "Language switcher",
    },
  ),
  newsletterUrl: requiredUrl("Newsletter URL"),
  socialLinks: fields.object(
    {
      instagram: requiredUrl("Instagram URL"),
      linkedin: requiredUrl("LinkedIn URL"),
      whatsapp: requiredUrl("WhatsApp URL"),
    },
    { label: "Social links" },
  ),
};

export const homepageLocaleSchema = {
  meta: fields.object(
    {
      htmlLang: requiredText("HTML lang"),
      title: requiredText("Meta title"),
      description: requiredText("Meta description", true),
    },
    { label: "Meta" },
  ),
  ui: fields.object(
    {
      chooseLanguage: requiredText("Choose language"),
      language: requiredText("Language"),
      menu: requiredText("Menu"),
      newsletterEmail: requiredText("Newsletter email"),
      newsletterPlaceholder: requiredText("Newsletter placeholder"),
      close: requiredText("Close"),
      learnMore: requiredText("Learn more"),
      contact: requiredText("Contact"),
      insights: requiredText("Insights"),
      programs: requiredText("Programs"),
      followWechat: requiredText("Follow WeChat"),
      wechatCopy: requiredText("WeChat copy", true),
      scanWechat: requiredText("Scan WeChat"),
      homeLabel: requiredText("Homepage aria label"),
    },
    { label: "Shared UI" },
  ),
  hero: fields.object(
    {
      desktopTitleHtml: requiredText("Desktop title HTML", true),
      mobileTitleHtml: requiredText("Mobile title HTML", true),
      subtitle: requiredText("Subtitle", true),
      ctas: heroCtaField,
    },
    { label: "Hero" },
  ),
  navExploreLabel: requiredText("Navigation explore label"),
  desktopMenuSections: fields.array(desktopMenuSectionFields, {
    label: "Desktop menu sections",
  }),
  categoryCards: fields.array(categoryCardFields, {
    label: "Category cards",
  }),
  competitionsSection: fields.object(
    {
      eye: requiredText("Eyebrow"),
      desktopTitle: requiredText("Desktop title", true),
      mobileTitleHtml: requiredText("Mobile title HTML", true),
      allLink: requiredText("All link label"),
    },
    { label: "Competitions section" },
  ),
  competitionCards: fields.array(competitionCardFields, {
    label: "Competition cards",
  }),
  newsSection: fields.object(
    {
      eye: requiredText("Eyebrow"),
      title: requiredText("Title"),
      allLink: requiredText("All link label"),
    },
    { label: "News section" },
  ),
  footerCta: fields.object(
    {
      eye: requiredText("Eyebrow"),
      titleHtml: requiredText("Title HTML", true),
      button: requiredText("Button label"),
    },
    { label: "Footer CTA" },
  ),
  footerColumns: fields.array(footerColumnFields, {
    label: "Footer columns",
  }),
  mobileMenuSections: fields.array(mobileMenuSectionFields, {
    label: "Mobile menu sections",
  }),
  mobileBottomLinks: simpleLinksField("Mobile bottom links"),
  footer: fields.object(
    {
      newsletterTitle: requiredText("Newsletter title"),
      desktopSubscribe: requiredText("Desktop subscribe label"),
      mobileSubscribe: requiredText("Mobile subscribe label"),
      scanWechat: requiredText("Scan WeChat title"),
      followWechat: requiredText("Follow WeChat title"),
      wechatCopy: requiredText("WeChat copy", true),
    },
    { label: "Footer" },
  ),
};

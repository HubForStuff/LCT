import { fields } from "@keystatic/core";

const requiredText = (label: string) =>
  fields.text({ label, validation: { isRequired: true } });

const localizedEventFields = (label: string) =>
  fields.object(
    {
      category: requiredText("Category label"),
      name: requiredText("Event name"),
      description: requiredText("Card description"),
      statusLabel: requiredText("Status label"),
      dateLabel: requiredText("Date badge label"),
      locationLabel: requiredText("Location label"),
      ctaLabel: requiredText("Card CTA label"),
      boothCtaLabel: fields.text({ label: "Booth CTA label" }),
      metaTitle: requiredText("Meta title"),
      metaDescription: requiredText("Meta description"),
      overviewHtml: fields.text({ label: "Overview HTML", multiline: true }),
      whoShouldAttendTitle: fields.text({ label: "Who should attend — title" }),
      whoShouldAttendHtml: fields.text({ label: "Who should attend — HTML", multiline: true }),
      formatTitle: fields.text({ label: "Format — title" }),
      formatHtml: fields.text({ label: "Format — HTML", multiline: true }),
    },
    { label },
  );

export const INDUSTRY_OPTIONS = [
  { label: "AI", value: "ai" },
  { label: "Biotech", value: "biotech" },
  { label: "Deep Tech", value: "deep-tech" },
  { label: "Education", value: "education" },
  { label: "Energy & Climate", value: "energy-and-climate" },
  { label: "Entertainment", value: "entertainment" },
  { label: "Fintech", value: "fintech" },
  { label: "Food & Agritech", value: "food-and-agritech" },
  { label: "Healthtech", value: "healthtech" },
  { label: "Manufacturing", value: "manufacturing" },
  { label: "Media", value: "media-and-community" },
  { label: "Mobility", value: "mobility" },
  { label: "Proptech", value: "proptech" },
  { label: "Robotics", value: "robotics" },
  { label: "Security", value: "security" },
  { label: "Other", value: "other" },
] as const;

export const eventCollectionSchema = {
  slug: fields.slug({
    name: {
      label: "Event name",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Stable route segment used for /events/[slug]/.",
    },
  }),
  category: fields.select({
    label: "Category",
    options: [
      { label: "Trade Fair & Expo", value: "trade-fair" },
      { label: "Conference & Summit", value: "summit" },
    ],
    defaultValue: "trade-fair",
  }),
  status: fields.select({
    label: "Status",
    options: [
      { label: "Open", value: "open" },
      { label: "Upcoming", value: "upcoming" },
      { label: "Past", value: "past" },
    ],
    defaultValue: "upcoming",
  }),
  region: fields.select({
    label: "Region",
    options: [
      { label: "China", value: "china" },
      { label: "LATAM", value: "latam" },
    ],
    defaultValue: "latam",
  }),
  country: fields.text({
    label: "Country",
    description: "Used by the LATAM location filter. Leave as 'China' for China-region events.",
  }),
  location: requiredText("City"),
  industry: fields.select({
    label: "Industry",
    options: [...INDUSTRY_OPTIONS],
    defaultValue: "other",
  }),
  code: fields.text({
    label: "Watermark code",
    description: "Three uppercase letters shown on the card image.",
    validation: { isRequired: true, length: { min: 3, max: 3 } },
  }),
  flagship: fields.checkbox({ label: "Flagship event", defaultValue: false }),
  lctHosted: fields.checkbox({ label: "LATAM CHINA TECH hosted event", defaultValue: false }),
  booth: fields.checkbox({ label: "Offers booth booking", defaultValue: false }),
  draft: fields.checkbox({
    label: "Hide from public pages",
    defaultValue: false,
  }),
  order: fields.integer({
    label: "Display order within its category",
    validation: { isRequired: true, min: 1 },
  }),
  startDate: fields.date({ label: "Start date", validation: { isRequired: true } }),
  endDate: fields.date({ label: "End date", validation: { isRequired: true } }),
  detailImage: fields.url({ label: "Detail hero image URL" }),
  en: localizedEventFields("English"),
  br: localizedEventFields("Português"),
  cn: localizedEventFields("中文"),
};

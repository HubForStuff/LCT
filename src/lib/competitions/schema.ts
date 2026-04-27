import { fields } from "@keystatic/core";

const requiredText = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    multiline,
    description,
    validation: { isRequired: true },
  });

const localizedCompetitionFields = (label: string) =>
  fields.object(
    {
      category: requiredText("Category"),
      name: requiredText("Name"),
      description: requiredText("Description", true),
      statusLabel: requiredText("Status label"),
      deadlinePrefix: requiredText("Deadline prefix"),
      deadlineValue: requiredText("Deadline value"),
      ctaLabel: requiredText("Listing CTA label"),
      featuredTag: requiredText("Featured tag"),
      featuredValueCaption: requiredText("Featured value caption"),
      detailEyebrow: requiredText("Detail eyebrow"),
      detailSubtitle: requiredText("Detail subtitle", true),
      metaTitle: requiredText("Meta title"),
      metaDescription: requiredText("Meta description", true),
      overviewHtml: requiredText(
        "Overview HTML",
        true,
        "Supports semantic HTML such as <p>, <h2>, <ul>, and <strong>.",
      ),
      eligibilityTitle: requiredText("Eligibility section title"),
      eligibilityHtml: requiredText("Eligibility HTML", true),
      supportTitle: requiredText("Support section title"),
      supportHtml: requiredText("Support HTML", true),
      processTitle: requiredText("Process section title"),
      processHtml: requiredText("Process HTML", true),
      applicationLabel: requiredText("Detail CTA label"),
    },
    { label },
  );

export const competitionCollectionSchema = {
  slug: fields.slug({
    name: {
      label: "Competition name",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Stable route segment used for /competitions/[slug]/.",
    },
  }),
  track: fields.select({
    label: "Track",
    options: [
      { label: "Startup competitions", value: "startup" },
      { label: "Corporate challenges", value: "corporate" },
      { label: "Academic innovation", value: "academic" },
    ],
    defaultValue: "startup",
  }),
  statusTone: fields.select({
    label: "Status tone",
    options: [
      { label: "Open", value: "open" },
      { label: "Future", value: "future" },
      { label: "Closed", value: "closed" },
    ],
    defaultValue: "open",
  }),
  draft: fields.checkbox({
    label: "Hide from public pages",
    description: "Use for fixtures, internal QA entries, or unpublished competition drafts.",
    defaultValue: false,
  }),
  accent: fields.select({
    label: "Card accent",
    options: [
      { label: "Warm", value: "warm" },
      { label: "Cool", value: "cool" },
    ],
    defaultValue: "warm",
  }),
  featured: fields.checkbox({
    label: "Feature this competition inside its track tab",
    defaultValue: false,
  }),
  order: fields.integer({
    label: "Display order",
    validation: { isRequired: true, min: 1 },
  }),
  applicationOpensAt: fields.date({
    label: "Application opens at",
    description: "Machine-readable date used for sorting future opportunities.",
  }),
  applicationDeadlineAt: fields.date({
    label: "Application deadline at",
    description: "Machine-readable date used for sorting open and closed opportunities.",
  }),
  watermark: requiredText("Watermark"),
  value: requiredText("Prize / value label"),
  focusTags: fields.array(requiredText("Focus tag"), {
    label: "Focus tags",
    itemLabel: (props) => props.value || "Focus tag",
  }),
  en: localizedCompetitionFields("English"),
  br: localizedCompetitionFields("Português"),
  cn: localizedCompetitionFields("中文"),
};

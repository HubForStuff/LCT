import { fields } from "@keystatic/core";

const requiredText = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    multiline,
    description,
    validation: { isRequired: true },
  });

const optionalText = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    multiline,
    description,
  });

const localizedProgramFields = (label: string) =>
  fields.object(
    {
      category: requiredText("Category"),
      name: requiredText("Name"),
      description: requiredText("Short description", true),
      statusLabel: requiredText("Status label"),
      deadlinePrefix: requiredText("Deadline prefix"),
      deadlineValue: requiredText("Deadline value"),
      ctaLabel: requiredText("Listing CTA label"),
      featuredTag: requiredText("Featured tag"),
      featuredValueCaption: optionalText("Featured value caption"),
      featuredValue: optionalText("Featured value"),
      detailEyebrow: requiredText("Detail eyebrow"),
      detailSubtitle: requiredText("Detail subtitle", true),
      metaTitle: requiredText("Meta title"),
      metaDescription: requiredText("Meta description", true),
      bodyHtml: requiredText(
        "Detail body HTML",
        true,
        "Supports semantic HTML such as <p>, <h2>, <ul>, and <strong>.",
      ),
      applicationLabel: requiredText("Detail CTA label"),
    },
    { label },
  );

export const programCollectionSchema = {
  slug: fields.slug({
    name: {
      label: "Program name",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Stable route segment used for /programs/[slug]/.",
    },
  }),
  track: fields.select({
    label: "Track",
    options: [
      { label: "Market Entry", value: "market-entry" },
      { label: "Business Missions", value: "business-mission" },
    ],
    defaultValue: "market-entry",
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
    description: "Use for unpublished or internal program drafts.",
    defaultValue: false,
  }),
  featured: fields.checkbox({
    label: "Feature this program inside its track tab",
    defaultValue: false,
  }),
  order: fields.integer({
    label: "Display order",
    validation: { isRequired: true, min: 1 },
  }),
  applicationOpensAt: fields.date({
    label: "Application opens at",
    description: "Machine-readable date used for sorting future programs.",
  }),
  applicationDeadlineAt: fields.date({
    label: "Application deadline at",
    description: "Machine-readable date used for sorting open and closed programs.",
  }),
  detailImage: fields.url({
    label: "Detail hero image URL",
    description: "Banner image displayed at the top of the program detail page.",
  }),
  en: localizedProgramFields("English"),
  br: localizedProgramFields("Português"),
  cn: localizedProgramFields("中文"),
};

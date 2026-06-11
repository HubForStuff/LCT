import { fields } from "@keystatic/core";

const requiredText = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    multiline,
    description,
    validation: { isRequired: true },
  });

const localizedAdvisoryFields = (label: string) =>
  fields.object(
    {
      eyebrow: requiredText("Eyebrow"),
      title: requiredText("Title"),
      summary: requiredText("Summary", true),
      metaTitle: requiredText("Meta title"),
      metaDescription: requiredText("Meta description", true),
      bodyHtml: requiredText(
        "Body HTML",
        true,
        "Supports semantic HTML such as <p>, <h2>, <ul>, and <strong>.",
      ),
    },
    { label },
  );

export const advisoryCollectionSchema = {
  slug: fields.slug({
    name: {
      label: "Service name",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Stable route segment used for /advisory/<slug>/.",
    },
  }),
  order: fields.integer({
    label: "Display order",
    validation: { isRequired: true, min: 1 },
  }),
  thumbnail: fields.url({
    label: "Card thumbnail URL",
    description: "Optional. Leave blank for a text-only card.",
  }),
  thumbnailAlt: fields.text({
    label: "Card thumbnail alt text",
    description: "Required when a thumbnail URL is set.",
  }),
  heroImage: fields.url({
    label: "Detail hero image URL",
    description: "Optional hero shown on the detail page.",
  }),
  heroImageAlt: fields.text({
    label: "Detail hero alt text",
    description: "Required when a hero image URL is set.",
  }),
  en: localizedAdvisoryFields("English"),
  br: localizedAdvisoryFields("Português"),
  cn: localizedAdvisoryFields("中文"),
};

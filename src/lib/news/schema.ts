import { fields } from "@keystatic/core";

const requiredText = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    multiline,
    description,
    validation: { isRequired: true },
  });

const requiredUrl = (label: string) =>
  fields.url({
    label,
    validation: { isRequired: true },
  });

const localizedNewsFields = (label: string) =>
  fields.object(
    {
      tag: requiredText("Tag"),
      title: requiredText("Title", true),
      summary: requiredText("Summary", true),
      imageAlt: requiredText("Image alt text"),
      publishedDateText: requiredText("Published date label"),
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

export const newsCollectionSchema = {
  slug: fields.slug({
    name: {
      label: "Article name",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Stable route segment used for /news/[slug]/.",
    },
  }),
  publishedAt: fields.date({
    label: "Publish date",
    validation: { isRequired: true },
  }),
  author: requiredText("Author"),
  readTimeMinutes: fields.integer({
    label: "Reading time (minutes)",
    validation: { isRequired: true, min: 1 },
  }),
  featured: fields.checkbox({
    label: "Show in homepage News & Insights section",
    defaultValue: true,
  }),
  primaryImage: requiredUrl("Primary image URL"),
  hoverImage: requiredUrl("Hover image URL"),
  en: localizedNewsFields("English"),
  br: localizedNewsFields("Português"),
  cn: localizedNewsFields("中文"),
};

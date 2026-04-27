import { fields } from "@keystatic/core";

const requiredText = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    multiline,
    description,
    validation: { isRequired: true },
  });

const optionalText = (label: string, multiline = false) =>
  fields.text({
    label,
    multiline,
  });

const requiredUrl = (label: string) =>
  fields.url({
    label,
    validation: { isRequired: true },
  });

const localizedSectionFields = fields.object(
  {
    id: requiredText("Anchor ID"),
    eyebrow: requiredText("Eyebrow"),
    title: requiredText("Title"),
    bodyHtml: requiredText(
      "Body HTML",
      true,
      "Supports semantic HTML such as <p>, <ul>, <ol>, and <strong>.",
    ),
    ctaLabel: optionalText("CTA label"),
    ctaHref: optionalText("CTA href"),
  },
  { label: "Section" },
);

const localizedStaticPageFields = (label: string) =>
  fields.object(
    {
      eyebrow: requiredText("Eyebrow"),
      title: requiredText("Title", true),
      summary: requiredText("Summary", true),
      imageAlt: requiredText("Image alt text"),
      metaTitle: requiredText("Meta title"),
      metaDescription: requiredText("Meta description", true),
      bodyHtml: requiredText(
        "Body HTML",
        true,
        "Supports semantic HTML such as <p>, <h2>, <ul>, and <strong>.",
      ),
      sections: fields.array(localizedSectionFields, {
        label: "Page sections",
      }),
    },
    { label },
  );

export const staticPageCollectionSchema = {
  slug: fields.slug({
    name: {
      label: "Page name",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Stable route segment used for /[slug]/.",
    },
  }),
  order: fields.integer({
    label: "Display order",
    validation: { isRequired: true, min: 1 },
  }),
  primaryImage: requiredUrl("Primary image URL"),
  en: localizedStaticPageFields("English"),
  br: localizedStaticPageFields("Português"),
  cn: localizedStaticPageFields("中文"),
};

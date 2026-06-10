import { fields } from "@keystatic/core";

const requiredText = (label: string, multiline = false, description?: string) =>
  fields.text({
    label,
    multiline,
    description,
    validation: { isRequired: true },
  });

const localizedItemFields = (label: string) =>
  fields.object(
    {
      name: requiredText("Name"),
      intro: requiredText("Intro", true),
    },
    { label },
  );

// Shared shape for both list collections (city partnerships + speakers)
export const networkListingCollectionSchema = {
  slug: fields.slug({
    name: {
      label: "Name",
      validation: { isRequired: true },
    },
    slug: {
      label: "Slug",
      description: "Stable identifier used for the content filename.",
    },
  }),
  order: fields.integer({
    label: "Display order",
    validation: { isRequired: true, min: 1 },
  }),
  thumbnail: fields.url({
    label: "Thumbnail URL",
    description: "Optional. Leave blank to render a text-only card.",
  }),
  imageAlt: fields.text({
    label: "Thumbnail alt text",
    description: "Required when a thumbnail URL is set.",
  }),
  en: localizedItemFields("English"),
  br: localizedItemFields("Português"),
  cn: localizedItemFields("中文"),
};

const localizedPageFields = (label: string) =>
  fields.object(
    {
      eyebrow: requiredText("Eyebrow"),
      title: requiredText("Title"),
      description: requiredText("Description", true),
      metaTitle: requiredText("Meta title"),
      metaDescription: requiredText("Meta description", true),
    },
    { label },
  );

// Factory so each singleton gets its own field instances
export const networkListingPageSchema = () => ({
  en: localizedPageFields("English"),
  br: localizedPageFields("Português"),
  cn: localizedPageFields("中文"),
});

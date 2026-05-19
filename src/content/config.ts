import { defineCollection, z } from "astro:content";

const homepage = defineCollection({
  type: "data",
  schema: z.any(),
});

const interiorPages = defineCollection({
  type: "data",
  schema: z.any(),
});

const news = defineCollection({
  type: "data",
  schema: z.any(),
});

const competitions = defineCollection({
  type: "data",
  schema: z.any(),
});

const staticPages = defineCollection({
  type: "data",
  schema: z.any(),
});

const programs = defineCollection({
  type: "data",
  schema: z.any(),
});

export const collections = {
  homepage,
  "interior-pages": interiorPages,
  competitions,
  news,
  "static-pages": staticPages,
  programs,
};

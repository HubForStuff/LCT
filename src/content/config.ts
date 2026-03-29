import { defineCollection, z } from "astro:content";

const homepage = defineCollection({
  type: "data",
  schema: z.any(),
});

const interiorPages = defineCollection({
  type: "data",
  schema: z.any(),
});

export const collections = {
  homepage,
  "interior-pages": interiorPages,
};

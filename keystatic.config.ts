import { collection, config, singleton } from "@keystatic/core";

import { competitionCollectionSchema } from "./src/lib/competitions/schema.ts";
import { homepageLocaleSchema, siteSettingsSchema } from "./src/lib/homepage/schema.ts";
import { newsCollectionSchema } from "./src/lib/news/schema.ts";
import { programCollectionSchema } from "./src/lib/programs/schema.ts";
import { staticPageCollectionSchema } from "./src/lib/static-pages/schema.ts";

export default config({
  storage: {
    kind: "local",
  },
  collections: {
    competitions: collection({
      label: "Competitions",
      path: "src/content/competitions/*",
      format: "json",
      columns: ["track", "statusTone", "featured"],
      schema: competitionCollectionSchema,
    }),
    news: collection({
      label: "News",
      path: "src/content/news/*",
      format: "json",
      columns: ["publishedAt", "author", "featured"],
      schema: newsCollectionSchema,
    }),
    staticPages: collection({
      label: "Static pages",
      path: "src/content/static-pages/*",
      format: "json",
      columns: ["order"],
      schema: staticPageCollectionSchema,
    }),
    programs: collection({
      label: "Programs",
      path: "src/content/programs/*",
      format: "json",
      columns: ["track", "statusTone", "featured"],
      schema: programCollectionSchema,
    }),
  },
  singletons: {
    siteSettings: singleton({
      label: "Site settings",
      path: "src/content/homepage/site-settings",
      format: "json",
      schema: siteSettingsSchema,
    }),
    homepageEn: singleton({
      label: "Homepage EN",
      path: "src/content/homepage/locales/en",
      format: "json",
      schema: homepageLocaleSchema,
    }),
    homepageBr: singleton({
      label: "Homepage BR",
      path: "src/content/homepage/locales/br",
      format: "json",
      schema: homepageLocaleSchema,
    }),
    homepageCn: singleton({
      label: "Homepage CN",
      path: "src/content/homepage/locales/cn",
      format: "json",
      schema: homepageLocaleSchema,
    }),
  },
});

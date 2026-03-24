import { config, singleton } from "@keystatic/core";

import { homepageLocaleSchema, siteSettingsSchema } from "./src/lib/homepage/schema.ts";

export default config({
  storage: {
    kind: "local",
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

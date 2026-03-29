import localeBr from "../../content/interior-pages/locales/br.json";
import localeCn from "../../content/interior-pages/locales/cn.json";
import localeEn from "../../content/interior-pages/locales/en.json";

import type { InteriorPageLocaleContent } from "./types";

export const INTERIOR_LOCALES = {
  EN: localeEn,
  BR: localeBr,
  CN: localeCn,
} as const satisfies Record<string, InteriorPageLocaleContent>;

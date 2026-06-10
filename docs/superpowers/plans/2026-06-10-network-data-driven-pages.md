# Network Data-Driven Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Network area into a hub linking to two Keystatic-driven sub-pages — City Partnerships (`/network/city-partnerships/`) and Featured Speakers (`/network/featured-speakers/`) — each rendering a title + description and a list of display-only cards in the news "All insights" style.

**Architecture:** A new `src/lib/network/` module (types + Keystatic schema + reader) feeds a shared `NetworkListingPage.astro` component from two thin Astro routes. Page metadata lives in two Keystatic singletons; list items live in two Keystatic collections. Navigation hrefs (centralized in `src/lib/homepage/links.ts`) and the `/network/` hub cards (`network.json`) are re-pointed at the new routes, and the now-redundant top-level `/speakers/` static page is removed.

**Tech Stack:** Astro 5, Keystatic (local reader), TypeScript, Tailwind + `src/styles/interior-pages.css`, Node test runner (`node --test`) with a build-and-assert-HTML integration style.

---

## File Structure

**Create:**
- `src/lib/network/types.ts` — route/locale/data types for the listing pages.
- `src/lib/network/schema.ts` — Keystatic schemas for the two singletons + two collections.
- `src/lib/network/reader.ts` — `getCityPartnershipsData()` / `getFeaturedSpeakersData()`.
- `src/components/network/NetworkListingPage.astro` — shared header → title/description → card grid → footer.
- `src/pages/network/city-partnerships.astro` — route (`/network/city-partnerships/`).
- `src/pages/network/featured-speakers.astro` — route (`/network/featured-speakers/`).
- `src/content/network/city-partnerships-page.json` — City Partnerships singleton seed.
- `src/content/network/featured-speakers-page.json` — Featured Speakers singleton seed.
- `src/content/city-partnerships/*.json` — 3 seed city-partnership entries.
- `src/content/speakers/*.json` — 3 seed speaker entries.

**Modify:**
- `keystatic.config.ts` — register 2 collections + 2 singletons.
- `src/styles/interior-pages.css` — `news-list-card--static` / `--no-media` modifiers.
- `src/lib/homepage/links.ts` — re-point nav targets; drop `/speakers/`.
- `src/content/static-pages/network.json` — keep only two hub cards, re-point their CTAs.
- `tests/interior-pages.test.mjs` — new sub-page test; update Batch C + expectedPages.
- `tests/homepage-architecture.test.mjs` — drop `speakers.json` from expected entries.

**Delete:**
- `src/content/static-pages/speakers.json`.

---

## Task 1: Network lib (types, schema, reader) + Keystatic registration

**Files:**
- Create: `src/lib/network/types.ts`
- Create: `src/lib/network/schema.ts`
- Create: `src/lib/network/reader.ts`
- Modify: `keystatic.config.ts`

- [ ] **Step 1: Create `src/lib/network/types.ts`**

```ts
import type {
  DesktopMenuSection,
  HomepageLocaleCode,
  LanguageOption,
  SiteSettings,
} from "../homepage/types";
import type {
  InteriorFooterContent,
  InteriorNavItem,
  InteriorPageMeta,
  InteriorPageUi,
} from "../interior-pages/types";

// Resolved shapes consumed by the component
export type NetworkListingItem = {
  name: string;
  intro: string;
  thumbnail?: string;
  imageAlt?: string;
};

export type NetworkListingPageMeta = {
  eyebrow: string;
  title: string;
  description: string;
};

export type NetworkListingRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
  page: NetworkListingPageMeta;
  items: NetworkListingItem[];
};

export type NetworkListingData = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: NetworkListingRouteLocale;
  localizedContent: Record<HomepageLocaleCode, NetworkListingRouteLocale>;
};

// Raw Keystatic shapes
export type NetworkListingLocaleContent = {
  name: string;
  intro: string;
};

export type NetworkListingCollectionEntry = {
  order: number;
  thumbnail: string | null;
  imageAlt: string;
  en: NetworkListingLocaleContent;
  br: NetworkListingLocaleContent;
  cn: NetworkListingLocaleContent;
};

export type NetworkListingPageLocaleContent = {
  eyebrow: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
};

export type NetworkListingPageSingleton = {
  en: NetworkListingPageLocaleContent;
  br: NetworkListingPageLocaleContent;
  cn: NetworkListingPageLocaleContent;
};
```

- [ ] **Step 2: Create `src/lib/network/schema.ts`**

```ts
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
```

- [ ] **Step 3: Create `src/lib/network/reader.ts`**

```ts
import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";

import type {
  NetworkListingCollectionEntry,
  NetworkListingData,
  NetworkListingItem,
  NetworkListingPageSingleton,
  NetworkListingRouteLocale,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<
  HomepageLocaleCode,
  keyof Pick<NetworkListingCollectionEntry, "en" | "br" | "cn">
>;

function buildItems(
  entries: NetworkListingCollectionEntry[],
  code: HomepageLocaleCode,
): NetworkListingItem[] {
  return entries
    .slice()
    .sort((left, right) => left.order - right.order)
    .map((entry) => {
      const localized = entry[localeFieldByCode[code]];
      const thumbnail = entry.thumbnail?.trim() ? entry.thumbnail : undefined;

      return {
        name: localized.name,
        intro: localized.intro,
        thumbnail,
        imageAlt: thumbnail ? entry.imageAlt : undefined,
      };
    });
}

async function buildNetworkListingData(
  pageSingleton: NetworkListingPageSingleton,
  entries: NetworkListingCollectionEntry[],
): Promise<NetworkListingData> {
  const homepageData = await getHomepageData();
  const siteSettings = homepageData.siteSettings;

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const pageLocale = pageSingleton[localeFieldByCode[code]];

      const routeLocale: NetworkListingRouteLocale = {
        meta: {
          htmlLang: locale.competitionsPage.meta.htmlLang,
          title: pageLocale.metaTitle,
          description: pageLocale.metaDescription,
        },
        ui: locale.ui,
        navItems: locale.navItems,
        footer: locale.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        page: {
          eyebrow: pageLocale.eyebrow,
          title: pageLocale.title,
          description: pageLocale.description,
        },
        items: buildItems(entries, code),
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, NetworkListingRouteLocale>;

  return {
    siteSettings,
    languages: siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}

async function getCollectionEntries(
  collection: "cityPartnerships" | "speakers",
): Promise<NetworkListingCollectionEntry[]> {
  const entries = (await keystaticReader.collections[collection].all()) as {
    slug: string;
    entry: NetworkListingCollectionEntry;
  }[];

  return entries.map(({ entry }) => entry);
}

export async function getCityPartnershipsData(): Promise<NetworkListingData> {
  const [pageSingleton, entries] = await Promise.all([
    keystaticReader.singletons.cityPartnershipsPage.readOrThrow() as Promise<NetworkListingPageSingleton>,
    getCollectionEntries("cityPartnerships"),
  ]);

  return buildNetworkListingData(pageSingleton, entries);
}

export async function getFeaturedSpeakersData(): Promise<NetworkListingData> {
  const [pageSingleton, entries] = await Promise.all([
    keystaticReader.singletons.featuredSpeakersPage.readOrThrow() as Promise<NetworkListingPageSingleton>,
    getCollectionEntries("speakers"),
  ]);

  return buildNetworkListingData(pageSingleton, entries);
}
```

- [ ] **Step 4: Register collections + singletons in `keystatic.config.ts`**

Add the import near the other schema imports:

```ts
import {
  networkListingCollectionSchema,
  networkListingPageSchema,
} from "./src/lib/network/schema.ts";
```

Inside `collections: { ... }` (after the `programs` collection, before the closing `}`):

```ts
    cityPartnerships: collection({
      label: "City partnerships",
      path: "src/content/city-partnerships/*",
      format: "json",
      columns: ["order"],
      schema: networkListingCollectionSchema,
    }),
    speakers: collection({
      label: "Speakers",
      path: "src/content/speakers/*",
      format: "json",
      columns: ["order"],
      schema: networkListingCollectionSchema,
    }),
```

Inside `singletons: { ... }` (after `homepageCn`):

```ts
    cityPartnershipsPage: singleton({
      label: "City partnerships page",
      path: "src/content/network/city-partnerships-page",
      format: "json",
      schema: networkListingPageSchema(),
    }),
    featuredSpeakersPage: singleton({
      label: "Featured speakers page",
      path: "src/content/network/featured-speakers-page",
      format: "json",
      schema: networkListingPageSchema(),
    }),
```

- [ ] **Step 5: Verify the build still passes**

Run: `npm run build`
Expected: build completes (no route reads the new singletons yet, so missing content does not fail the build).

- [ ] **Step 6: Commit**

```bash
git add src/lib/network keystatic.config.ts
git commit -m "feat(network): add network listing lib and keystatic registration"
```

---

## Task 2: Seed Keystatic content

**Files:**
- Create: `src/content/network/city-partnerships-page.json`
- Create: `src/content/network/featured-speakers-page.json`
- Create: `src/content/city-partnerships/sao-paulo-shenzhen.json`
- Create: `src/content/city-partnerships/bogota-hangzhou.json`
- Create: `src/content/city-partnerships/mexico-city-shenzhen.json`
- Create: `src/content/speakers/mariana-alves.json`
- Create: `src/content/speakers/diego-fernandez.json`
- Create: `src/content/speakers/li-wei.json`

- [ ] **Step 1: Create `src/content/network/city-partnerships-page.json`**

```json
{
  "en": {
    "eyebrow": "Network",
    "title": "City Partnerships",
    "description": "City-to-city technology exchange, delegation design, and corridor positioning across the China-LATAM ecosystem.",
    "metaTitle": "City Partnerships | LATAM China Tech",
    "metaDescription": "Explore LATAM China Tech city partnerships connecting municipal and regional ecosystems across China and Latin America."
  },
  "br": {
    "eyebrow": "Rede",
    "title": "Parcerias entre Cidades",
    "description": "Intercambio tecnologico cidade-a-cidade, desenho de delegacoes e posicionamento de corredor no ecossistema China-LATAM.",
    "metaTitle": "Parcerias entre Cidades | LATAM China Tech",
    "metaDescription": "Explore as parcerias entre cidades da LATAM China Tech conectando ecossistemas municipais e regionais entre China e America Latina."
  },
  "cn": {
    "eyebrow": "网络",
    "title": "城市合作",
    "description": "城市间技术交流、代表团设计与走廊定位，覆盖中国—拉美生态系统。",
    "metaTitle": "城市合作 | LATAM China Tech",
    "metaDescription": "探索 LATAM China Tech 的城市合作，连接中国与拉丁美洲的城市与区域生态系统。"
  }
}
```

- [ ] **Step 2: Create `src/content/network/featured-speakers-page.json`**

```json
{
  "en": {
    "eyebrow": "Network",
    "title": "Featured Speakers",
    "description": "Curated founders, investors, operators, and public-sector leaders for conferences, missions, roundtables, and executive briefings.",
    "metaTitle": "Featured Speakers | LATAM China Tech",
    "metaDescription": "Request featured speakers for China-LATAM technology events, delegations, and executive briefings."
  },
  "br": {
    "eyebrow": "Rede",
    "title": "Palestrantes em Destaque",
    "description": "Founders, investidores, operadores e lideres do setor publico selecionados para conferencias, missoes, mesas-redondas e briefings executivos.",
    "metaTitle": "Palestrantes em Destaque | LATAM China Tech",
    "metaDescription": "Solicite palestrantes em destaque para eventos de tecnologia China-LATAM, delegacoes e briefings executivos."
  },
  "cn": {
    "eyebrow": "网络",
    "title": "特邀讲者",
    "description": "为会议、考察、圆桌与高管闭门会精选的创始人、投资人、运营者与公共部门领袖。",
    "metaTitle": "特邀讲者 | LATAM China Tech",
    "metaDescription": "为中国—拉美科技活动、代表团与高管闭门会邀请特邀讲者。"
  }
}
```

- [ ] **Step 3: Create the three city-partnership entries**

`src/content/city-partnerships/sao-paulo-shenzhen.json`:

```json
{
  "order": 1,
  "thumbnail": "https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "imageAlt": "City skyline representing a cross-border city partnership.",
  "en": {
    "name": "Sao Paulo - Shenzhen Corridor",
    "intro": "A working corridor for hardware, mobility, and cleantech pilots between Brazil's largest market and Shenzhen's manufacturing base."
  },
  "br": {
    "name": "Corredor Sao Paulo - Shenzhen",
    "intro": "Um corredor de trabalho para pilotos de hardware, mobilidade e cleantech entre o maior mercado do Brasil e a base industrial de Shenzhen."
  },
  "cn": {
    "name": "圣保罗—深圳走廊",
    "intro": "连接巴西最大市场与深圳制造基地的硬件、出行与清洁技术试点走廊。"
  }
}
```

`src/content/city-partnerships/bogota-hangzhou.json`:

```json
{
  "order": 2,
  "thumbnail": "https://images.pexels.com/photos/417344/pexels-photo-417344.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "imageAlt": "Urban view representing a city-to-city technology exchange.",
  "en": {
    "name": "Bogota - Hangzhou Exchange",
    "intro": "Digital-economy and smart-city collaboration linking Colombia's capital with Hangzhou's platform and fintech ecosystem."
  },
  "br": {
    "name": "Intercambio Bogota - Hangzhou",
    "intro": "Colaboracao em economia digital e cidades inteligentes ligando a capital da Colombia ao ecossistema de plataformas e fintech de Hangzhou."
  },
  "cn": {
    "name": "波哥大—杭州交流",
    "intro": "连接哥伦比亚首都与杭州平台及金融科技生态的数字经济与智慧城市合作。"
  }
}
```

`src/content/city-partnerships/mexico-city-shenzhen.json` (no thumbnail — exercises the text-only layout):

```json
{
  "order": 3,
  "thumbnail": null,
  "imageAlt": "",
  "en": {
    "name": "Mexico City - Shenzhen Link",
    "intro": "An emerging link focused on advanced manufacturing, EV supply chains, and nearshoring-aligned trade missions."
  },
  "br": {
    "name": "Conexao Cidade do Mexico - Shenzhen",
    "intro": "Uma conexao emergente focada em manufatura avancada, cadeias de suprimento de VEs e missoes comerciais alinhadas ao nearshoring."
  },
  "cn": {
    "name": "墨西哥城—深圳连接",
    "intro": "聚焦先进制造、电动车供应链与近岸外包导向贸易考察的新兴连接。"
  }
}
```

- [ ] **Step 4: Create the three speaker entries**

`src/content/speakers/mariana-alves.json`:

```json
{
  "order": 1,
  "thumbnail": "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800",
  "imageAlt": "Portrait of a featured speaker.",
  "en": {
    "name": "Mariana Alves",
    "intro": "Cross-border venture investor focused on LATAM founders scaling hardware and climate startups into Chinese supply chains."
  },
  "br": {
    "name": "Mariana Alves",
    "intro": "Investidora de venture cross-border focada em founders da LATAM que escalam startups de hardware e clima nas cadeias chinesas."
  },
  "cn": {
    "name": "Mariana Alves",
    "intro": "专注于帮助拉美创始人将硬件与气候创业公司接入中国供应链的跨境风险投资人。"
  }
}
```

`src/content/speakers/diego-fernandez.json`:

```json
{
  "order": 2,
  "thumbnail": "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=800",
  "imageAlt": "Portrait of a featured speaker.",
  "en": {
    "name": "Diego Fernandez",
    "intro": "Operator and former market-entry lead who has launched LATAM consumer brands across Greater China retail channels."
  },
  "br": {
    "name": "Diego Fernandez",
    "intro": "Operador e ex-lider de entrada em mercado que lancou marcas de consumo da LATAM nos canais de varejo da Grande China."
  },
  "cn": {
    "name": "Diego Fernandez",
    "intro": "曾主导市场进入的运营者，已将多个拉美消费品牌带入大中华区零售渠道。"
  }
}
```

`src/content/speakers/li-wei.json` (no thumbnail):

```json
{
  "order": 3,
  "thumbnail": null,
  "imageAlt": "",
  "en": {
    "name": "Li Wei",
    "intro": "Policy and ecosystem advisor on China-LATAM technology corridors, city diplomacy, and bilateral innovation programs."
  },
  "br": {
    "name": "Li Wei",
    "intro": "Consultor de politicas e ecossistema sobre corredores de tecnologia China-LATAM, diplomacia entre cidades e programas bilaterais de inovacao."
  },
  "cn": {
    "name": "李伟",
    "intro": "专注于中国—拉美技术走廊、城市外交与双边创新项目的政策与生态顾问。"
  }
}
```

- [ ] **Step 5: Validate JSON parses**

Run: `node -e "['src/content/network/city-partnerships-page.json','src/content/network/featured-speakers-page.json','src/content/city-partnerships/sao-paulo-shenzhen.json','src/content/city-partnerships/bogota-hangzhou.json','src/content/city-partnerships/mexico-city-shenzhen.json','src/content/speakers/mariana-alves.json','src/content/speakers/diego-fernandez.json','src/content/speakers/li-wei.json'].forEach(f=>{JSON.parse(require('fs').readFileSync(f,'utf8'));console.log('ok',f);})"`
Expected: `ok` printed for all eight files.

- [ ] **Step 6: Commit**

```bash
git add src/content/network src/content/city-partnerships src/content/speakers
git commit -m "feat(network): seed city partnerships and speakers content"
```

---

## Task 3: Shared component, routes, and styles (TDD)

**Files:**
- Test: `tests/interior-pages.test.mjs` (new test block, append before the final closing of the file)
- Create: `src/components/network/NetworkListingPage.astro`
- Create: `src/pages/network/city-partnerships.astro`
- Create: `src/pages/network/featured-speakers.astro`
- Modify: `src/styles/interior-pages.css`

- [ ] **Step 1: Write the failing test**

Append this test to `tests/interior-pages.test.mjs` (it uses the existing `buildSite`, `readFileSync`, `resolve`, and `assert` already imported at the top of the file):

```js
test("Network sub-pages render Keystatic-driven city partnerships and speakers lists", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const cityHtml = readFileSync(
      resolve(build.outDir, "network", "city-partnerships", "index.html"),
      "utf8",
    );
    const speakersHtml = readFileSync(
      resolve(build.outDir, "network", "featured-speakers", "index.html"),
      "utf8",
    );

    // Localizable title + description
    assert.match(
      cityHtml,
      /data-i18n="page\.title"[^>]*>\s*City Partnerships/,
      "expected the city partnerships page title",
    );
    assert.match(
      cityHtml,
      /data-i18n="page\.description"/,
      "expected the city partnerships description to be localizable",
    );
    assert.match(
      speakersHtml,
      /data-i18n="page\.title"[^>]*>\s*Featured Speakers/,
      "expected the featured speakers page title",
    );

    // Seeded items render in the All-insights card style
    assert.match(cityHtml, /news-list-card/, "expected city cards to reuse the All insights style");
    assert.match(cityHtml, /Sao Paulo - Shenzhen Corridor/, "expected a seeded city partnership name");
    assert.match(
      cityHtml,
      /data-i18n="items\.0\.name"/,
      "expected city card names to be localizable",
    );
    assert.match(speakersHtml, /Mariana Alves/, "expected a seeded speaker name");
    assert.match(
      speakersHtml,
      /data-i18n="items\.0\.intro"/,
      "expected speaker intros to be localizable",
    );

    // Display-only: no meta footer, no tag pill
    assert.doesNotMatch(cityHtml, /news-card-meta/, "expected no published/reading-time footer");
    assert.doesNotMatch(cityHtml, /news-card-tag/, "expected no tag pill on network cards");
    assert.doesNotMatch(speakersHtml, /news-card-meta/, "expected no footer on speaker cards");

    // Optional thumbnail behavior
    assert.match(
      cityHtml,
      /news-list-card--no-media/,
      "expected text-only cards to use the no-media modifier",
    );
    assert.match(
      cityHtml,
      /news-card-media-layer/,
      "expected thumbnailed cards to render a media layer",
    );

    // Shared localization shell
    assert.match(cityHtml, /id="localized-content"/, "expected the shared localized content payload");
    assert.match(speakersHtml, /id="localized-content"/, "expected the shared localized content payload");
  } finally {
    build.cleanup();
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test --test-concurrency=1 --test-name-pattern="Network sub-pages render" 2>&1 | tail -20`
Expected: FAIL — the build cannot find `network/city-partnerships/index.html` (route does not exist yet).

- [ ] **Step 3: Create `src/components/network/NetworkListingPage.astro`**

```astro
---
import InteriorFooter from "../site/InteriorFooter.astro";
import InteriorHeader from "../site/InteriorHeader.astro";

import type { HomepageLocaleCode, SiteSettings } from "../../lib/homepage/types";
import type { NetworkListingRouteLocale } from "../../lib/network/types";

interface Props {
  locale: NetworkListingRouteLocale;
  siteSettings: SiteSettings;
  currentLanguage: HomepageLocaleCode;
}

const { locale, siteSettings, currentLanguage } = Astro.props;
---

<div class="interior-page">
  <InteriorHeader
    navItems={locale.navItems}
    activeHref="/network/"
    siteSettings={siteSettings}
    currentLanguage={currentLanguage}
    languageLabel={locale.ui.chooseLanguage}
    homeLabel={locale.ui.homeLabel}
    menuLabel={locale.ui.menu}
    desktopMenuSections={locale.desktopMenuSections}
    navExploreLabel={locale.navExploreLabel}
  />

  <main>
    <section class="page-header">
      <div class="interior-wrap page-header-inner page-header-inner--split">
        <div>
          <div class="page-eyebrow" data-i18n="page.eyebrow">
            <span class="dot"></span>
            {locale.page.eyebrow}
          </div>
          <h1 class="page-title" data-i18n="page.title">{locale.page.title}</h1>
        </div>
        <p class="page-subtitle page-subtitle--wide page-subtitle--balanced" data-i18n="page.description">
          {locale.page.description}
        </p>
      </div>
    </section>

    <section class="interior-wrap news-list-shell">
      {locale.items.length > 0 ? (
        <div class="news-list-grid">
          {locale.items.map((item, index) => (
            <article
              class:list={[
                "news-list-card",
                "news-list-card--static",
                !item.thumbnail && "news-list-card--no-media",
              ]}
            >
              <div class="news-list-card-inner">
                <div class="news-card-copy">
                  <h3 class="news-card-title" data-i18n={`items.${index}.name`}>{item.name}</h3>
                  <p class="news-card-summary" data-i18n={`items.${index}.intro`}>{item.intro}</p>
                </div>

                {item.thumbnail && (
                  <div
                    class="news-card-media"
                    role="img"
                    aria-label={item.imageAlt}
                    data-i18n-aria-label={`items.${index}.imageAlt`}
                  >
                    <div class="news-card-media-layer" style={`background-image:url('${item.thumbnail}')`}></div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div class="news-empty-state">
          <p>No entries yet.</p>
        </div>
      )}
    </section>
  </main>

  <InteriorFooter
    footer={locale.footer}
    ui={locale.ui}
    siteSettings={siteSettings}
    currentLanguage={currentLanguage}
  />
</div>
```

- [ ] **Step 4: Create `src/pages/network/city-partnerships.astro`**

```astro
---
import LocalizationClient from "../../components/i18n/LocalizationClient.astro";
import NetworkListingPage from "../../components/network/NetworkListingPage.astro";
import Layout from "../../layouts/Layout.astro";
import { getCityPartnershipsData } from "../../lib/network/reader";
import "../../styles/interior-pages.css";

const { defaultLanguage, defaultLocale, localizedContent, siteSettings } =
  await getCityPartnershipsData();
---

<Layout
  title={defaultLocale.meta.title}
  description={defaultLocale.meta.description}
  htmlLang={defaultLocale.meta.htmlLang}
  bodyClass="interior-body"
>
  <NetworkListingPage
    locale={defaultLocale}
    siteSettings={siteSettings}
    currentLanguage={defaultLanguage}
  />
  <LocalizationClient defaultLanguage={defaultLanguage} localizedContent={localizedContent} />
</Layout>
```

- [ ] **Step 5: Create `src/pages/network/featured-speakers.astro`**

```astro
---
import LocalizationClient from "../../components/i18n/LocalizationClient.astro";
import NetworkListingPage from "../../components/network/NetworkListingPage.astro";
import Layout from "../../layouts/Layout.astro";
import { getFeaturedSpeakersData } from "../../lib/network/reader";
import "../../styles/interior-pages.css";

const { defaultLanguage, defaultLocale, localizedContent, siteSettings } =
  await getFeaturedSpeakersData();
---

<Layout
  title={defaultLocale.meta.title}
  description={defaultLocale.meta.description}
  htmlLang={defaultLocale.meta.htmlLang}
  bodyClass="interior-body"
>
  <NetworkListingPage
    locale={defaultLocale}
    siteSettings={siteSettings}
    currentLanguage={defaultLanguage}
  />
  <LocalizationClient defaultLanguage={defaultLanguage} localizedContent={localizedContent} />
</Layout>
```

- [ ] **Step 6: Add the card modifier styles to `src/styles/interior-pages.css`**

Insert immediately after the `.news-list-card .news-card-meta { ... }` rule (around line 3271):

```css
.news-list-card--static {
  cursor: default;
}

.news-list-card--static:hover {
  transform: none;
  border-color: transparent;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.08);
}

.news-list-card--static .news-card-copy {
  padding-bottom: 28px;
}

.news-list-card--no-media .news-list-card-inner {
  grid-template-columns: minmax(0, 1fr);
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `node --test --test-concurrency=1 --test-name-pattern="Network sub-pages render" 2>&1 | tail -20`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/components/network src/pages/network src/styles/interior-pages.css tests/interior-pages.test.mjs
git commit -m "feat(network): render city partnerships and featured speakers pages"
```

---

## Task 4: Re-point navigation, trim the hub, remove the old speakers page

This task updates the affected existing tests first (so they express the new intent and fail), then makes the implementation changes to turn them green.

**Files:**
- Modify: `tests/interior-pages.test.mjs`
- Modify: `tests/homepage-architecture.test.mjs`
- Modify: `src/lib/homepage/links.ts`
- Modify: `src/content/static-pages/network.json`
- Delete: `src/content/static-pages/speakers.json`

- [ ] **Step 1: Update `tests/interior-pages.test.mjs` — drop the speakers static page row**

Find:

```js
      ["network", /Network\s*&amp;\s*Partnerships|Network\s*&\s*Partnerships/i, /City partnerships/i],
      ["speakers", /Featured Speakers/i, /flagship stages/i],
    ];
```

Replace with:

```js
      ["network", /Network\s*&amp;\s*Partnerships|Network\s*&\s*Partnerships/i, /City partnerships/i],
    ];
```

- [ ] **Step 2: Update `tests/interior-pages.test.mjs` — Batch C nav targets + hub assertions**

In the "Batch C static page anchors..." test, remove the `speakersHtml` read line:

```js
    const speakersHtml = readFileSync(resolve(build.outDir, "speakers", "index.html"), "utf8");
```

Replace the Featured Speakers menu assertion. Find:

```js
    assert.match(
      homeHtml,
      /href="\/speakers\/"/,
      "expected Featured Speakers menu links to route to the dedicated speakers page",
    );
    assert.doesNotMatch(
      homeHtml,
      /href="\/network\/#featured-speakers"/,
      "expected Featured Speakers to stop routing to the network section anchor",
    );
```

Replace with:

```js
    assert.match(
      homeHtml,
      /href="\/network\/featured-speakers\/"/,
      "expected Featured Speakers menu links to route to the network sub-page",
    );
    assert.doesNotMatch(
      homeHtml,
      /href="\/speakers\/"/,
      "expected the removed top-level speakers route to no longer be linked",
    );
```

Replace the City Partnerships menu assertion. Find:

```js
    assert.match(
      homeHtml,
      /href="\/network\/#city-partnerships"/,
      "expected network city partnerships to route to the standard network page anchor",
    );
```

Replace with:

```js
    assert.match(
      homeHtml,
      /href="\/network\/city-partnerships\/"/,
      "expected network city partnerships to route to the network sub-page",
    );
```

Remove the speakers-page localization assertion. Find and delete:

```js
    assert.match(
      speakersHtml,
      /data-i18n-html="page\.bodyHtml"/,
      "expected the dedicated speakers page to remain localizable through the shared static-page component",
    );
```

Add hub assertions. Immediately after the existing `networkHtml`/`id="contact"` assertion block (the `assert.match(networkHtml, /id="contact"/, ...)` call), insert:

```js
    assert.match(
      networkHtml,
      /href="\/network\/city-partnerships\/"/,
      "expected the network hub to link to the city partnerships sub-page",
    );
    assert.match(
      networkHtml,
      /href="\/network\/featured-speakers\/"/,
      "expected the network hub to link to the featured speakers sub-page",
    );
    assert.doesNotMatch(
      networkHtml,
      /120\+ active partners/i,
      "expected the network hub to drop the active partners card",
    );
```

- [ ] **Step 3: Update `tests/homepage-architecture.test.mjs` — expected static page entries**

Find:

```js
  assert.deepEqual(
    staticPageEntries,
    ["advisory.json", "events.json", "network.json", "programs.json", "speakers.json"],
    `expected seeded static page entries for advisory, events, network, programs, and speakers; found ${staticPageEntries.join(", ")}`,
  );
```

Replace with:

```js
  assert.deepEqual(
    staticPageEntries,
    ["advisory.json", "events.json", "network.json", "programs.json"],
    `expected seeded static page entries for advisory, events, network, and programs; found ${staticPageEntries.join(", ")}`,
  );
```

- [ ] **Step 4: Run the updated tests to verify they fail**

Run: `node --test --test-concurrency=1 --test-name-pattern="Batch C static page anchors|static pages build from Keystatic|seeded static page entries" 2>&1 | tail -25`
Expected: FAIL — implementation still links `/speakers/`, the hub still shows active partners, and `speakers.json` still exists.

- [ ] **Step 5: Re-point nav targets in `src/lib/homepage/links.ts`**

In `HOMEPAGE_ROUTE_TARGETS`, replace the `speakers` line:

```ts
  speakers: "/speakers/",
```

with:

```ts
  cityPartnerships: "/network/city-partnerships/",
  featuredSpeakers: "/network/featured-speakers/",
```

Replace the section-4 link targets. Find:

```ts
  4: [
    `${HOMEPAGE_ROUTE_TARGETS.network}#city-partnerships`,
    HOMEPAGE_ROUTE_TARGETS.speakers,
  ],
```

Replace with:

```ts
  4: [
    HOMEPAGE_ROUTE_TARGETS.cityPartnerships,
    HOMEPAGE_ROUTE_TARGETS.featuredSpeakers,
  ],
```

Replace the section-4 mega-card target. Find:

```ts
  4: `${HOMEPAGE_ROUTE_TARGETS.network}#active-partners`,
```

Replace with:

```ts
  4: HOMEPAGE_ROUTE_TARGETS.network,
```

- [ ] **Step 6: Trim `src/content/static-pages/network.json` to two hub cards**

In **each** of the `en`, `br`, and `cn` blocks:

1. Delete the entire `active-partners` section object (the one with `"id": "active-partners"`), including the trailing comma that separated it from the previous section.
2. In the `city-partnerships` section, change `"ctaHref": "#contact"` to `"ctaHref": "/network/city-partnerships/"`.
3. In the `featured-speakers` section, change `"ctaHref": "#contact"` to `"ctaHref": "/network/featured-speakers/"`.

For reference, the resulting `en.sections` array must be exactly:

```json
    "sections": [
      {
        "id": "city-partnerships",
        "eyebrow": "Cities",
        "title": "City partnerships",
        "bodyHtml": "<p>We support city-to-city technology exchange, delegation design, innovation programming, and corridor positioning for municipal and regional partners.</p>",
        "ctaLabel": "Explore city partnerships",
        "ctaHref": "/network/city-partnerships/"
      },
      {
        "id": "featured-speakers",
        "eyebrow": "Voices",
        "title": "Featured speakers",
        "bodyHtml": "<p>LATAM China Tech curates founders, investors, operators, policymakers, and technical leaders for conferences, missions, panels, and private briefings.</p>",
        "ctaLabel": "View featured speakers",
        "ctaHref": "/network/featured-speakers/"
      }
    ]
```

Apply the equivalent edits to the `br.sections` and `cn.sections` arrays — remove their `active-partners` objects and re-point the two `ctaHref` values to `/network/city-partnerships/` and `/network/featured-speakers/`. Leave the localized `eyebrow`, `title`, `bodyHtml`, and `ctaLabel` text in `br`/`cn` unchanged (only drop the third section and swap the two hrefs).

- [ ] **Step 7: Delete the redundant speakers static page**

```bash
git rm src/content/static-pages/speakers.json
```

- [ ] **Step 8: Run the full test suite**

Run: `npm test 2>&1 | tail -15`
Expected: all tests pass (29 existing + 1 new = 30), 0 failures.

- [ ] **Step 9: Commit**

```bash
git add tests/interior-pages.test.mjs tests/homepage-architecture.test.mjs src/lib/homepage/links.ts src/content/static-pages/network.json
git commit -m "feat(network): point nav and hub at new sub-pages, remove old speakers page"
```

---

## Task 5: Final verification

- [ ] **Step 1: Clean build**

Run: `npm run build 2>&1 | tail -15`
Expected: build completes; output includes `/network/city-partnerships/index.html` and `/network/featured-speakers/index.html`, and no longer includes `/speakers/index.html`.

- [ ] **Step 2: Full test suite**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 30`, `fail 0`.

- [ ] **Step 3: Confirm the old route is gone and new routes exist**

Run: `ls dist/network/city-partnerships/index.html dist/network/featured-speakers/index.html; test ! -e dist/speakers && echo "speakers route removed"`
Expected: both new files listed; `speakers route removed` printed.

---

## Notes for the implementer

- **Default language is EN**, so statically-rendered HTML shows English names; `LocalizationClient` swaps to BR/CN client-side from the `localized-content` JSON payload. Tests assert the EN strings.
- **Astro directory output**: a file route like `src/pages/network/city-partnerships.astro` emits `/network/city-partnerships/index.html`. The existing `src/pages/[slug].astro` continues to emit `/network/index.html`; the two do not collide.
- **`thumbnail: null`** in seed JSON is the correct "no thumbnail" value for a Keystatic `fields.url`. The reader coerces empty/blank to `undefined`, which drives the `--no-media` layout and omits the media block.
- Keep all non-ASCII content (CN, accented BR) as UTF-8.

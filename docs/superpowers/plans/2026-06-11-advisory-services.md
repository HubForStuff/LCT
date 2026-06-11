# Advisory Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make each advisory service a Keystatic-managed entry rendered as a card on the `/advisory/` hub and linking to its own dedicated detail page (`/advisory/<slug>/`); keep "Book a strategy call" as a CTA (→ `#contact`).

**Architecture:** Mirror the existing `programs` pattern. `/advisory/` stays a static-pages hub; a new `advisory` collection feeds the hub cards (merged into the static-pages reader, like program tabs) and the detail pages (`/advisory/[slug].astro`, like `/programs/[slug].astro`). Cards reuse the news "All insights" style as links with optional thumbnail; detail pages reuse the interior page-header split + `bodyHtml` body with an optional hero.

**Tech Stack:** Astro 5, Keystatic local reader, TypeScript, `src/styles/interior-pages.css`, Node `node --test` (build-and-assert-HTML).

---

## File Structure

**Create:**
- `src/lib/advisory/types.ts` — card/detail/route/data types + raw Keystatic shapes.
- `src/lib/advisory/schema.ts` — `advisoryCollectionSchema`.
- `src/lib/advisory/reader.ts` — `getAdvisoryServicesByLocale`, `getAllAdvisorySlugs`, `getAdvisoryDetailPageData`.
- `src/components/advisory/AdvisoryCards.astro` — hub card grid (links).
- `src/components/advisory/AdvisoryDetailPage.astro` — detail page.
- `src/pages/advisory/[slug].astro` — detail route.
- `src/content/advisory/consulting.json`, `investment-matchmaking.json`, `tech-transfer.json` — seed entries.

**Modify:**
- `keystatic.config.ts` — register `advisory` collection.
- `src/content/config.ts` — register `advisory` data collection.
- `src/content/static-pages/advisory.json` — drop 3 service sections, keep `strategy-call`.
- `src/lib/static-pages/types.ts` — add `advisoryServices?` to route locale.
- `src/lib/static-pages/reader.ts` — merge advisory services for slug `advisory`.
- `src/components/static-pages/StaticPage.astro` — render advisory cards when present.
- `src/lib/homepage/links.ts` — re-point advisory submenu + footer link targets.
- `src/content/interior-pages/locales/{en,br,cn}.json` — re-point footer Advisory links.
- `tests/interior-pages.test.mjs` — new hub + detail tests; nav assertions.

---

## Task 1: Advisory lib + Keystatic/content registration

**Files:**
- Create: `src/lib/advisory/types.ts`, `src/lib/advisory/schema.ts`, `src/lib/advisory/reader.ts`
- Modify: `keystatic.config.ts`, `src/content/config.ts`

- [ ] **Step 1: Create `src/lib/advisory/types.ts`**

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

export type AdvisoryLocaleContent = {
  eyebrow: string;
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  bodyHtml: string;
};

export type AdvisoryCollectionEntry = {
  slug: string;
  order: number;
  thumbnail: string | null;
  thumbnailAlt: string;
  heroImage: string | null;
  heroImageAlt: string;
  en: AdvisoryLocaleContent;
  br: AdvisoryLocaleContent;
  cn: AdvisoryLocaleContent;
};

// Resolved card shown on the hub
export type AdvisoryServiceCard = {
  href: string;
  slug: string;
  eyebrow: string;
  title: string;
  summary: string;
  thumbnail?: string;
  thumbnailAlt?: string;
};

// Resolved detail page content
export type AdvisoryDetail = {
  slug: string;
  href: string;
  listingHref: string;
  heroImage?: string;
  heroImageAlt?: string;
} & AdvisoryLocaleContent;

export type AdvisoryDetailCopy = {
  backLabel: string;
};

export type AdvisoryDetailRouteLocale = {
  meta: InteriorPageMeta;
  ui: InteriorPageUi;
  navItems: InteriorNavItem[];
  footer: InteriorFooterContent;
  desktopMenuSections: DesktopMenuSection[];
  navExploreLabel: string;
  detail: AdvisoryDetailCopy;
  page: AdvisoryDetail;
};

export type AdvisoryDetailData = {
  siteSettings: SiteSettings;
  languages: LanguageOption[];
  defaultLanguage: HomepageLocaleCode;
  defaultLocale: AdvisoryDetailRouteLocale;
  localizedContent: Record<HomepageLocaleCode, AdvisoryDetailRouteLocale>;
};
```

- [ ] **Step 2: Create `src/lib/advisory/schema.ts`**

Open `src/lib/programs/schema.ts` first to confirm the `fields.slug` shape, then write:

```ts
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
```

- [ ] **Step 3: Create `src/lib/advisory/reader.ts`**

This mirrors `src/lib/programs/reader.ts` (listing + detail). Confirm the access paths against that file before finalizing.

```ts
import { createReader } from "@keystatic/core/reader";

import keystaticConfig from "../../../keystatic.config.ts";

import { getHomepageData } from "../homepage/reader";
import { HOMEPAGE_LOCALE_CODES, type HomepageLocaleCode } from "../homepage/types";
import { INTERIOR_LOCALES } from "../interior-pages/locales";

import type {
  AdvisoryCollectionEntry,
  AdvisoryDetail,
  AdvisoryDetailCopy,
  AdvisoryDetailData,
  AdvisoryDetailRouteLocale,
  AdvisoryLocaleContent,
  AdvisoryServiceCard,
} from "./types";

const keystaticReader = createReader(process.cwd(), keystaticConfig);

const localeFieldByCode = {
  EN: "en",
  BR: "br",
  CN: "cn",
} as const satisfies Record<
  HomepageLocaleCode,
  keyof Pick<AdvisoryCollectionEntry, "en" | "br" | "cn">
>;

const detailCopyByCode: Record<HomepageLocaleCode, AdvisoryDetailCopy> = {
  EN: { backLabel: "Back to advisory" },
  BR: { backLabel: "Voltar para assessoria" },
  CN: { backLabel: "返回咨询服务" },
};

function buildAdvisoryHref(slug: string): string {
  return `/advisory/${slug}/`;
}

function localized(
  entry: AdvisoryCollectionEntry,
  code: HomepageLocaleCode,
): AdvisoryLocaleContent {
  return entry[localeFieldByCode[code]];
}

async function getAllAdvisoryEntries(): Promise<AdvisoryCollectionEntry[]> {
  const entries = (await keystaticReader.collections.advisory.all()) as {
    slug: string;
    entry: AdvisoryCollectionEntry;
  }[];

  return entries
    .map(({ slug, entry }) => ({ ...entry, slug }))
    .sort((left, right) => left.order - right.order);
}

function buildCard(
  entry: AdvisoryCollectionEntry,
  code: HomepageLocaleCode,
): AdvisoryServiceCard {
  const l = localized(entry, code);
  const thumbnail = entry.thumbnail?.trim() ? entry.thumbnail : undefined;

  return {
    href: buildAdvisoryHref(entry.slug),
    slug: entry.slug,
    eyebrow: l.eyebrow,
    title: l.title,
    summary: l.summary,
    thumbnail,
    thumbnailAlt: thumbnail ? entry.thumbnailAlt : undefined,
  };
}

function buildDetail(
  entry: AdvisoryCollectionEntry,
  code: HomepageLocaleCode,
): AdvisoryDetail {
  const l = localized(entry, code);
  const heroImage = entry.heroImage?.trim() ? entry.heroImage : undefined;

  return {
    slug: entry.slug,
    href: buildAdvisoryHref(entry.slug),
    listingHref: "/advisory/",
    heroImage,
    heroImageAlt: heroImage ? entry.heroImageAlt : undefined,
    ...l,
  };
}

export async function getAdvisoryServicesByLocale(): Promise<
  Record<HomepageLocaleCode, AdvisoryServiceCard[]>
> {
  const entries = await getAllAdvisoryEntries();

  return Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => [
      code,
      entries.map((entry) => buildCard(entry, code)),
    ]),
  ) as Record<HomepageLocaleCode, AdvisoryServiceCard[]>;
}

export async function getAllAdvisorySlugs(): Promise<string[]> {
  const entries = await getAllAdvisoryEntries();
  return entries.map((entry) => entry.slug);
}

export async function getAdvisoryDetailPageData(slug: string): Promise<AdvisoryDetailData> {
  const [homepageData, entries] = await Promise.all([
    getHomepageData(),
    getAllAdvisoryEntries(),
  ]);
  const targetEntry = entries.find((entry) => entry.slug === slug);

  if (!targetEntry) {
    throw new Error(`Advisory service not found for slug "${slug}"`);
  }

  const localizedContent = Object.fromEntries(
    HOMEPAGE_LOCALE_CODES.map((code) => {
      const locale = INTERIOR_LOCALES[code];
      const homepageLocale = homepageData.localizedContent[code];
      const l = localized(targetEntry, code);

      const routeLocale: AdvisoryDetailRouteLocale = {
        meta: {
          htmlLang: locale.competitionsPage.meta.htmlLang,
          title: l.metaTitle,
          description: l.metaDescription,
        },
        ui: locale.ui,
        navItems: locale.navItems,
        footer: locale.footer,
        desktopMenuSections: homepageLocale.desktopMenuSections,
        navExploreLabel: homepageLocale.navExploreLabel,
        detail: detailCopyByCode[code],
        page: buildDetail(targetEntry, code),
      };

      return [code, routeLocale];
    }),
  ) as Record<HomepageLocaleCode, AdvisoryDetailRouteLocale>;

  return {
    siteSettings: homepageData.siteSettings,
    languages: homepageData.siteSettings.languages,
    defaultLanguage: homepageData.defaultLanguage,
    defaultLocale: localizedContent[homepageData.defaultLanguage],
    localizedContent,
  };
}
```

- [ ] **Step 4: Register the collection in `keystatic.config.ts`**

Add import next to the other schema imports:

```ts
import { advisoryCollectionSchema } from "./src/lib/advisory/schema.ts";
```

In `collections: { ... }` (after `programs`):

```ts
    advisory: collection({
      label: "Advisory services",
      path: "src/content/advisory/*",
      format: "json",
      columns: ["order"],
      schema: advisoryCollectionSchema,
    }),
```

- [ ] **Step 5: Register the data collection in `src/content/config.ts`**

Add (mirroring the existing `type: "data", schema: z.any()` entries):

```ts
const advisory = defineCollection({
  type: "data",
  schema: z.any(),
});
```

And add `advisory,` to the `export const collections = { ... }` object.

- [ ] **Step 6: Verify the build still passes**

Run: `npm run build 2>&1 | tail -8`
Expected: build completes; no `[WARN] [glob-loader]` for `advisory` (the data collection is now registered). No route reads the advisory reader yet, so missing content does not fail the build.

- [ ] **Step 7: Commit**

```bash
git add src/lib/advisory keystatic.config.ts src/content/config.ts
git commit -m "feat(advisory): add advisory lib and keystatic/content registration"
```

---

## Task 2: Seed advisory collection + trim the hub

**Files:**
- Create: `src/content/advisory/consulting.json`, `investment-matchmaking.json`, `tech-transfer.json`
- Modify: `src/content/static-pages/advisory.json`

- [ ] **Step 1: Create `src/content/advisory/consulting.json`** (thumbnail + hero)

```json
{
  "slug": { "name": "Consulting", "slug": "consulting" },
  "order": 1,
  "thumbnail": "https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "thumbnailAlt": "Strategy team mapping a market-entry plan.",
  "heroImage": "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=1600",
  "heroImageAlt": "Advisors reviewing market expansion plans around a meeting table.",
  "en": {
    "eyebrow": "Consulting",
    "title": "Market and execution strategy",
    "summary": "Customer segments, regulatory constraints, channels, and launch risks mapped before you commit time or capital to a new market.",
    "metaTitle": "Market & Execution Strategy | LATAM China Tech",
    "metaDescription": "Advisory for market-entry strategy: opportunity scans, partner shortlists, and board-ready briefs across the LATAM-China corridor.",
    "bodyHtml": "<p>We map customer segments, regulatory constraints, channel options, and launch risks before teams commit time or capital to a new market.</p><ul><li>Opportunity scans and go-to-market sequencing.</li><li>Partner and distributor shortlists.</li><li>Board-ready market-entry briefs.</li></ul>"
  },
  "br": {
    "eyebrow": "Consultoria",
    "title": "Estrategia de mercado e execucao",
    "summary": "Segmentos de clientes, restricoes regulatorias, canais e riscos de lancamento mapeados antes de comprometer tempo ou capital.",
    "metaTitle": "Estrategia de Mercado e Execucao | LATAM China Tech",
    "metaDescription": "Assessoria de estrategia de entrada em mercado: mapas de oportunidade, shortlists de parceiros e briefs para diretoria no corredor LATAM-China.",
    "bodyHtml": "<p>Mapeamos segmentos de clientes, restricoes regulatorias, canais e riscos de lancamento antes que o time comprometa capital ou tempo em um novo mercado.</p><ul><li>Mapas de oportunidade e sequencia de go-to-market.</li><li>Shortlists de parceiros e distribuidores.</li><li>Briefs de entrada em mercado para diretoria.</li></ul>"
  },
  "cn": {
    "eyebrow": "咨询",
    "title": "市场与执行策略",
    "summary": "在投入时间或资金进入新市场之前，先梳理客户群、监管限制、渠道与启动风险。",
    "metaTitle": "市场与执行策略 | LATAM China Tech",
    "metaDescription": "市场进入策略咨询：机会扫描、合作伙伴名单与面向董事会的简报，覆盖拉美—中国走廊。",
    "bodyHtml": "<p>在团队投入时间或资金进入新市场之前，我们会梳理客户群、监管限制、渠道选择和启动风险。</p><ul><li>机会扫描与进入顺序设计。</li><li>合作伙伴和分销渠道名单。</li><li>面向董事会的市场进入简报。</li></ul>"
  }
}
```

- [ ] **Step 2: Create `src/content/advisory/investment-matchmaking.json`** (thumbnail, no hero)

```json
{
  "slug": { "name": "Investment Matchmaking", "slug": "investment-matchmaking" },
  "order": 2,
  "thumbnail": "https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "thumbnailAlt": "Investors and founders in a working session.",
  "heroImage": null,
  "heroImageAlt": "",
  "en": {
    "eyebrow": "Capital",
    "title": "Investment matchmaking",
    "summary": "Founder and growth-company preparation for high-context investor conversations, matched to capital aligned with stage, sector, and geography.",
    "metaTitle": "Investment Matchmaking | LATAM China Tech",
    "metaDescription": "Investor readiness and capital matchmaking across stage, sector, geography, and cross-border ambition.",
    "bodyHtml": "<p>We prepare founders and growth companies for high-context investor conversations, then match them with capital aligned to stage, sector, geography, and cross-border ambition.</p>"
  },
  "br": {
    "eyebrow": "Capital",
    "title": "Matchmaking de investimento",
    "summary": "Preparacao de founders e empresas para conversas com investidores e conexao com capital alinhado a estagio, setor e geografia.",
    "metaTitle": "Matchmaking de Investimento | LATAM China Tech",
    "metaDescription": "Preparacao para investidores e matchmaking de capital por estagio, setor, geografia e ambicao cross-border.",
    "bodyHtml": "<p>Preparamos founders e empresas em crescimento para conversas com investidores de alto contexto e conectamos com capital alinhado a estagio, setor, geografia e ambicao cross-border.</p>"
  },
  "cn": {
    "eyebrow": "资本",
    "title": "投资对接",
    "summary": "帮助创始人与成长型公司准备高质量投资人沟通，并按阶段、行业与地域匹配合适资本。",
    "metaTitle": "投资对接 | LATAM China Tech",
    "metaDescription": "按阶段、行业、地域与跨境目标进行投资人准备与资本匹配。",
    "bodyHtml": "<p>我们帮助创始人和成长型公司准备高质量投资人沟通，并根据阶段、行业、地域和跨境目标匹配合适资本。</p>"
  }
}
```

- [ ] **Step 3: Create `src/content/advisory/tech-transfer.json`** (no thumbnail, no hero)

```json
{
  "slug": { "name": "Technology Transfer", "slug": "tech-transfer" },
  "order": 3,
  "thumbnail": null,
  "thumbnailAlt": "",
  "heroImage": null,
  "heroImageAlt": "",
  "en": {
    "eyebrow": "Technology",
    "title": "Technology transfer",
    "summary": "Licensing, co-development, pilot packaging, and institutional introductions for teams moving IP or applied technology between regions.",
    "metaTitle": "Technology Transfer | LATAM China Tech",
    "metaDescription": "Support for licensing, co-development, pilot packaging, and institutional introductions across the LATAM-China corridor.",
    "bodyHtml": "<p>We support licensing, co-development, pilot packaging, and institutional introductions for teams moving intellectual property or applied technology between regions.</p>"
  },
  "br": {
    "eyebrow": "Tecnologia",
    "title": "Transferencia de tecnologia",
    "summary": "Licenciamento, co-desenvolvimento, desenho de pilotos e introducoes institucionais para mover PI ou tecnologia entre regioes.",
    "metaTitle": "Transferencia de Tecnologia | LATAM China Tech",
    "metaDescription": "Apoio a licenciamento, co-desenvolvimento, pilotos e introducoes institucionais no corredor LATAM-China.",
    "bodyHtml": "<p>Apoiamos licenciamento, co-desenvolvimento, desenho de pilotos e introducoes institucionais para equipes que movem propriedade intelectual ou tecnologia aplicada entre regioes.</p>"
  },
  "cn": {
    "eyebrow": "技术",
    "title": "技术转移",
    "summary": "为在两地之间推动知识产权或应用技术落地的团队提供许可、共同开发、试点包装与机构引荐。",
    "metaTitle": "技术转移 | LATAM China Tech",
    "metaDescription": "在拉美—中国走廊提供许可、共同开发、试点包装与机构引荐支持。",
    "bodyHtml": "<p>我们支持许可、共同开发、试点包装和机构引荐，帮助团队在两地之间推动知识产权或应用技术落地。</p>"
  }
}
```

- [ ] **Step 4: Trim `src/content/static-pages/advisory.json`**

In EACH of `en`, `br`, `cn`: delete the `consulting`, `investment-matchmaking`, and `tech-transfer` section objects, leaving **only** the `strategy-call` section in the `sections` array. Do not change any other field (`eyebrow`, `title`, `summary`, `bodyHtml`, `metaTitle`, etc. stay as-is). The `strategy-call` section keeps `"ctaHref": "#contact"`.

For reference, the resulting `en.sections` must be exactly:

```json
    "sections": [
      {
        "id": "strategy-call",
        "eyebrow": "Next step",
        "title": "Book a strategy call",
        "bodyHtml": "<p>Use the first conversation to clarify the market, timeline, and partner profile. The team will route the opportunity to the right advisor before proposing scope.</p>",
        "ctaLabel": "Contact us",
        "ctaHref": "#contact"
      }
    ]
```

Apply the equivalent trim to `br.sections` and `cn.sections` (keep their localized `strategy-call` objects unchanged).

- [ ] **Step 5: Validate JSON + build**

Run: `node -e "['src/content/advisory/consulting.json','src/content/advisory/investment-matchmaking.json','src/content/advisory/tech-transfer.json','src/content/static-pages/advisory.json'].forEach(f=>{JSON.parse(require('fs').readFileSync(f,'utf8'));console.log('ok',f)})"`
Then: `npm run build 2>&1 | tail -6`
Expected: all `ok`; build passes (hub now renders only the strategy-call section; advisory collection entries exist but are not yet rendered).

- [ ] **Step 6: Commit**

```bash
git add src/content/advisory src/content/static-pages/advisory.json
git commit -m "feat(advisory): seed advisory services and trim hub to strategy-call CTA"
```

---

## Task 3: Render advisory cards on the hub (TDD)

**Files:**
- Test: `tests/interior-pages.test.mjs` (new test)
- Modify: `src/lib/static-pages/types.ts`, `src/lib/static-pages/reader.ts`, `src/components/static-pages/StaticPage.astro`
- Create: `src/components/advisory/AdvisoryCards.astro`

- [ ] **Step 1: Write the failing test** (append to `tests/interior-pages.test.mjs`)

```js
test("Advisory hub renders Keystatic-driven service cards linking to detail pages", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const advisoryHtml = readFileSync(resolve(build.outDir, "advisory", "index.html"), "utf8");

    // Three service cards link to their detail routes, in the All-insights style
    assert.match(advisoryHtml, /news-list-card/, "expected advisory cards to reuse the All insights style");
    assert.match(advisoryHtml, /href="\/advisory\/consulting\/"/, "expected a card linking to the consulting detail page");
    assert.match(advisoryHtml, /href="\/advisory\/investment-matchmaking\/"/, "expected a card linking to the investment-matchmaking detail page");
    assert.match(advisoryHtml, /href="\/advisory\/tech-transfer\/"/, "expected a card linking to the tech-transfer detail page");
    assert.match(advisoryHtml, /data-i18n="advisoryServices\.0\.title"/, "expected advisory card titles to be localizable");
    assert.match(advisoryHtml, /Market and execution strategy/, "expected a seeded advisory service title");

    // Display: no meta footer, no tag pill
    assert.doesNotMatch(advisoryHtml, /news-card-meta/, "expected no published/reading-time footer on advisory cards");
    assert.doesNotMatch(advisoryHtml, /news-card-tag/, "expected no tag pill on advisory cards");

    // Optional thumbnail: tech-transfer has none, consulting has one
    assert.match(advisoryHtml, /news-list-card--no-media/, "expected the text-only advisory card to use the no-media modifier");
    assert.match(advisoryHtml, /news-card-media-layer/, "expected a thumbnailed advisory card to render a media layer");

    // Strategy-call CTA retained; the migrated service section anchors are gone
    assert.match(advisoryHtml, /id="strategy-call"/, "expected the strategy-call CTA to remain on the hub");
    assert.doesNotMatch(advisoryHtml, /id="consulting"/, "expected the consulting section card to be gone from the hub");
  } finally {
    build.cleanup();
  }
});
```

- [ ] **Step 2: Run the test, verify it FAILS**

Run: `node --test --test-concurrency=1 --test-name-pattern="Advisory hub renders" 2>&1 | tail -20`
Expected: FAIL (no advisory cards rendered yet; `href="/advisory/consulting/"` absent).

- [ ] **Step 3: Extend `src/lib/static-pages/types.ts`**

Add the import (near the `ProgramListingContent` import):

```ts
import type { AdvisoryServiceCard } from "../advisory/types";
```

Add the optional field to `StaticPageRouteLocale` (next to `programs?`):

```ts
  advisoryServices?: AdvisoryServiceCard[];
```

- [ ] **Step 4: Extend `src/lib/static-pages/reader.ts`**

Add the import (near the programs reader import):

```ts
import { getAdvisoryServicesByLocale } from "../advisory/reader";
```

In `getStaticPageData`, extend the `Promise.all` to also load advisory services for slug `advisory`:

```ts
  const [homepageData, entries, programListingByLocale, advisoryByLocale] = await Promise.all([
    getHomepageData(),
    getAllStaticPageEntries(),
    slug === "programs" ? getProgramListingContentByLocale() : Promise.resolve(undefined),
    slug === "advisory" ? getAdvisoryServicesByLocale() : Promise.resolve(undefined),
  ]);
```

In the `routeLocale` object (next to `programs: programListingByLocale?.[code],`) add:

```ts
        advisoryServices: advisoryByLocale?.[code],
```

- [ ] **Step 5: Create `src/components/advisory/AdvisoryCards.astro`**

```astro
---
import type { AdvisoryServiceCard } from "../../lib/advisory/types";

interface Props {
  services: AdvisoryServiceCard[];
}

const { services } = Astro.props;
---

<div class="news-list-grid advisory-card-grid">
  {services.map((service, index) => (
    <a
      href={service.href}
      class:list={["news-list-card", !service.thumbnail && "news-list-card--no-media"]}
    >
      <div class="news-list-card-inner">
        <div class="news-card-copy">
          <div class="static-page-section-eyebrow" data-i18n={`advisoryServices.${index}.eyebrow`}>
            {service.eyebrow}
          </div>
          <h3 class="news-card-title" data-i18n={`advisoryServices.${index}.title`}>{service.title}</h3>
          <p class="news-card-summary" data-i18n={`advisoryServices.${index}.summary`}>{service.summary}</p>
        </div>

        {service.thumbnail && (
          <div
            class="news-card-media"
            role="img"
            aria-label={service.thumbnailAlt}
            data-i18n-aria-label={`advisoryServices.${index}.thumbnailAlt`}
          >
            <div class="news-card-media-layer" style={`background-image:url('${service.thumbnail}')`}></div>
          </div>
        )}
      </div>
    </a>
  ))}
</div>
```

- [ ] **Step 6: Render the cards in `src/components/static-pages/StaticPage.astro`**

Add the import at the top of the frontmatter (next to the `ProgramTabs` import):

```ts
import AdvisoryCards from "../advisory/AdvisoryCards.astro";
```

In the template, immediately AFTER the `<article class="static-page-body …" … set:html={locale.page.bodyHtml}></article>` element and BEFORE the `{locale.programs && <ProgramTabs … />}` line, insert:

```astro
      {locale.advisoryServices && locale.advisoryServices.length > 0 && (
        <AdvisoryCards services={locale.advisoryServices} />
      )}
```

(The existing `{!locale.programs && (… sections grid …)}` still renders below; for advisory it now contains only the strategy-call section, which is the intended CTA.)

- [ ] **Step 7: Run the test, verify it PASSES**

Run: `node --test --test-concurrency=1 --test-name-pattern="Advisory hub renders" 2>&1 | tail -20`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/static-pages src/components/static-pages/StaticPage.astro src/components/advisory/AdvisoryCards.astro tests/interior-pages.test.mjs
git commit -m "feat(advisory): render service cards on the hub"
```

---

## Task 4: Advisory detail pages (TDD)

**Files:**
- Test: `tests/interior-pages.test.mjs` (new test)
- Create: `src/components/advisory/AdvisoryDetailPage.astro`, `src/pages/advisory/[slug].astro`

- [ ] **Step 1: Write the failing test** (append to `tests/interior-pages.test.mjs`)

```js
test("Advisory detail pages render localized content with a back link", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const consultingHtml = readFileSync(
      resolve(build.outDir, "advisory", "consulting", "index.html"),
      "utf8",
    );
    const techTransferHtml = readFileSync(
      resolve(build.outDir, "advisory", "tech-transfer", "index.html"),
      "utf8",
    );

    // Localized split header (title + summary side text)
    assert.match(consultingHtml, /data-i18n="page\.title"[^>]*>\s*Market and execution strategy/, "expected the consulting detail title");
    assert.match(consultingHtml, /data-i18n="page\.summary"/, "expected the consulting summary side text");

    // Fully-custom body + shared localization shell + back link
    assert.match(consultingHtml, /data-i18n-html="page\.bodyHtml"/, "expected the detail body to render bodyHtml");
    assert.match(consultingHtml, /id="localized-content"/, "expected the shared localized content payload");
    assert.match(consultingHtml, /href="\/advisory\/"/, "expected a back link to the advisory hub");

    // Optional hero: consulting has one, tech-transfer does not
    assert.match(consultingHtml, /news-article-hero-image/, "expected consulting to render its hero image");
    assert.doesNotMatch(techTransferHtml, /news-article-hero-image/, "expected tech-transfer (no hero) to omit the hero image");
  } finally {
    build.cleanup();
  }
});
```

- [ ] **Step 2: Run the test, verify it FAILS**

Run: `node --test --test-concurrency=1 --test-name-pattern="Advisory detail pages render" 2>&1 | tail -20`
Expected: FAIL (route `advisory/consulting/index.html` does not exist).

- [ ] **Step 3: Create `src/components/advisory/AdvisoryDetailPage.astro`**

```astro
---
import InteriorFooter from "../site/InteriorFooter.astro";
import InteriorHeader from "../site/InteriorHeader.astro";

import type { HomepageLocaleCode, SiteSettings } from "../../lib/homepage/types";
import type { AdvisoryDetailRouteLocale } from "../../lib/advisory/types";

interface Props {
  locale: AdvisoryDetailRouteLocale;
  siteSettings: SiteSettings;
  currentLanguage: HomepageLocaleCode;
}

const { locale, siteSettings, currentLanguage } = Astro.props;
const { page, detail } = locale;
---

<div class="interior-page">
  <InteriorHeader
    navItems={locale.navItems}
    activeHref={page.listingHref}
    siteSettings={siteSettings}
    currentLanguage={currentLanguage}
    languageLabel={locale.ui.chooseLanguage}
    homeLabel={locale.ui.homeLabel}
    menuLabel={locale.ui.menu}
    desktopMenuSections={locale.desktopMenuSections}
    navExploreLabel={locale.navExploreLabel}
  />

  <main>
    <section class="page-header news-article-header">
      <div class="interior-wrap">
        <a href={page.listingHref} class="news-back-link news-back-link--muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span data-i18n="detail.backLabel">{detail.backLabel}</span>
        </a>

        <div class="page-header-inner page-header-inner--split">
          <div>
            <div class="page-eyebrow" data-i18n="page.eyebrow">
              <span class="dot"></span>
              {page.eyebrow}
            </div>
            <h1 class="page-title" data-i18n="page.title">{page.title}</h1>
          </div>
          <p class="page-subtitle page-subtitle--wide page-subtitle--balanced" data-i18n="page.summary">
            {page.summary}
          </p>
        </div>
      </div>
    </section>

    {page.heroImage && (
      <section class="interior-wrap">
        <div
          class="news-article-hero-image"
          role="img"
          aria-label={page.heroImageAlt}
          data-i18n-aria-label="page.heroImageAlt"
          style={`background-image:url('${page.heroImage}')`}
        ></div>
      </section>
    )}

    <section class="interior-wrap static-page-shell">
      <article
        class="static-page-body static-page-body--plain"
        data-i18n-html="page.bodyHtml"
        set:html={page.bodyHtml}
      ></article>
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

Before finalizing, confirm `news-article-header`, `news-back-link`, `news-back-link--muted`, `page-header-inner--split`, `news-article-hero-image`, and `static-page-body--plain` all exist in `src/styles/interior-pages.css` (they are used by `NewsArticlePage.astro` / `ProgramDetailPage.astro`). If a class name differs, match the real one.

- [ ] **Step 4: Create `src/pages/advisory/[slug].astro`** (mirror `src/pages/programs/[slug].astro`)

```astro
---
import LocalizationClient from "../../components/i18n/LocalizationClient.astro";
import AdvisoryDetailPage from "../../components/advisory/AdvisoryDetailPage.astro";
import Layout from "../../layouts/Layout.astro";
import {
  getAllAdvisorySlugs,
  getAdvisoryDetailPageData,
} from "../../lib/advisory/reader";
import "../../styles/interior-pages.css";

export async function getStaticPaths() {
  const slugs = await getAllAdvisorySlugs();

  return slugs.map((slug) => ({
    params: { slug },
  }));
}

const slug = Astro.params.slug;

if (!slug) {
  throw new Error("Missing advisory slug.");
}

const { defaultLanguage, defaultLocale, localizedContent, siteSettings } =
  await getAdvisoryDetailPageData(slug);
---

<Layout
  title={defaultLocale.meta.title}
  description={defaultLocale.meta.description}
  htmlLang={defaultLocale.meta.htmlLang}
  bodyClass="interior-body"
>
  <AdvisoryDetailPage
    locale={defaultLocale}
    siteSettings={siteSettings}
    currentLanguage={defaultLanguage}
  />
  <LocalizationClient defaultLanguage={defaultLanguage} localizedContent={localizedContent} />
</Layout>
```

- [ ] **Step 5: Run the test, verify it PASSES**

Run: `node --test --test-concurrency=1 --test-name-pattern="Advisory detail pages render" 2>&1 | tail -20`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/advisory/AdvisoryDetailPage.astro src/pages/advisory tests/interior-pages.test.mjs
git commit -m "feat(advisory): add advisory service detail pages"
```

---

## Task 5: Re-point navigation + final verification (TDD)

**Files:**
- Test: `tests/interior-pages.test.mjs` (new nav assertions)
- Modify: `src/lib/homepage/links.ts`, `src/content/interior-pages/locales/{en,br,cn}.json`

- [ ] **Step 1: Write the failing nav test** (append to `tests/interior-pages.test.mjs`)

```js
test("Advisory navigation points at service detail pages", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const homeHtml = readFileSync(resolve(build.outDir, "index.html"), "utf8");

    assert.match(homeHtml, /href="\/advisory\/consulting\/"/, "expected the Advisory submenu to link to the consulting detail page");
    assert.match(homeHtml, /href="\/advisory\/investment-matchmaking\/"/, "expected the Advisory submenu to link to the investment-matchmaking detail page");
    assert.match(homeHtml, /href="\/advisory\/tech-transfer\/"/, "expected the Advisory submenu to link to the tech-transfer detail page");
    assert.doesNotMatch(homeHtml, /href="\/advisory\/#consulting"/, "expected the old advisory section anchors to be gone");
  } finally {
    build.cleanup();
  }
});
```

- [ ] **Step 2: Run it, verify it FAILS**

Run: `node --test --test-concurrency=1 --test-name-pattern="Advisory navigation points" 2>&1 | tail -20`
Expected: FAIL (homepage still emits `/advisory/#consulting`).

- [ ] **Step 3: Re-point `src/lib/homepage/links.ts`**

Replace the Advisory submenu targets. Find:

```ts
  0: [
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#consulting`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#investment-matchmaking`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#tech-transfer`,
  ],
```

with:

```ts
  0: [
    `${HOMEPAGE_ROUTE_TARGETS.advisory}consulting/`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}investment-matchmaking/`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}tech-transfer/`,
  ],
```

Replace the footer Advisory targets. Find:

```ts
  0: [
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#investment-matchmaking`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#tech-transfer`,
  ],
```

with:

```ts
  0: [
    `${HOMEPAGE_ROUTE_TARGETS.advisory}investment-matchmaking/`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}tech-transfer/`,
  ],
```

(Leave `desktopMenuCardTargets[0]` = `${HOMEPAGE_ROUTE_TARGETS.advisory}#strategy-call` unchanged — the strategy-call section still exists on the hub.)

- [ ] **Step 4: Re-point the interior footer locale links** in `src/content/interior-pages/locales/en.json`, `br.json`, `cn.json`

In each file, the `footer.columns` array's first column (`"title": "Advisory"` in en) has two links pointing at `/advisory/#investment-matchmaking` and `/advisory/#tech-transfer`. Change those two `href` values to `/advisory/investment-matchmaking/` and `/advisory/tech-transfer/` respectively. Leave the `label` text and all other columns unchanged. (The BR/CN files have the same structure with localized labels.)

- [ ] **Step 5: Run the nav test + full suite**

Run: `node --test --test-concurrency=1 --test-name-pattern="Advisory navigation points" 2>&1 | tail -10`
Expected: PASS.

Then: `npm test 2>&1 | tail -15`
Expected: all tests pass, 0 failures (33 total: 30 prior + 3 added in Tasks 3–5). If the only failure is a browser test reporting a port/server-startup timeout, re-run once — that test is occasionally flaky.

- [ ] **Step 6: Commit**

```bash
git add src/lib/homepage/links.ts src/content/interior-pages/locales tests/interior-pages.test.mjs
git commit -m "feat(advisory): point advisory nav and footer at service detail pages"
```

---

## Task 6: Final verification

- [ ] **Step 1: Clean build**

Run: `npm run build 2>&1 | tail -15`
Expected: build completes; output includes `/advisory/consulting/index.html`, `/advisory/investment-matchmaking/index.html`, `/advisory/tech-transfer/index.html`, and the `/advisory/` hub.

- [ ] **Step 2: Full suite**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 33`, `fail 0`.

- [ ] **Step 3: Confirm routes**

Run: `ls dist/advisory/consulting/index.html dist/advisory/investment-matchmaking/index.html dist/advisory/tech-transfer/index.html`
Expected: all three listed.

---

## Notes for the implementer

- **Default language is EN** — static HTML renders English; `LocalizationClient` swaps BR/CN client-side from the `localized-content` payload. Tests assert EN strings.
- **`thumbnail`/`heroImage` are Keystatic `fields.url`** → `string | null`; the reader coerces blank/null to `undefined`, which drives the `--no-media` card layout and omits the detail hero.
- **No new CSS** should be needed: cards reuse `news-list-card` + the existing `--no-media` modifier; detail pages reuse `news-article-header`, `news-back-link`, `page-header-inner--split`, `news-article-hero-image`, and `static-page-body--plain`. If something is visually off, prefer reusing an existing class over adding new rules unless clearly necessary.
- **Astro directory output**: `src/pages/advisory/[slug].astro` emits `/advisory/<slug>/index.html`; the existing `src/pages/[slug].astro` still emits `/advisory/index.html` (the hub). No collision.
- Keep all non-ASCII (CN, accented BR) as UTF-8.

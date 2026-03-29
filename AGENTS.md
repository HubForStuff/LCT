# Agent Notes

## Architecture

- Keep route files in `src/pages` thin. They should load data, compose the page component, and avoid embedding page content directly.
- Reusable UI belongs in `src/components`.
- Page-specific styling belongs in `src/styles`.
- Do not rewrite the homepage architecture when working on interior pages unless a genuinely shared component needs a small fix.

## I18n Contract

- Reuse `src/components/i18n/LocalizationClient.astro` for localized pages. Do not create a separate language-switching script for interior pages.
- Localized strings must ship in the `localized-content` JSON payload and be wired with the shared hooks:
  - `data-i18n`
  - `data-i18n-html`
  - `data-i18n-placeholder`
  - `data-i18n-aria-label`
  - `data-lang-toggle`
  - `data-lang-option`
- Homepage content is Keystatic-managed under `src/content/homepage/`.
- Interior-page locale content currently lives in `src/content/interior-pages/locales/en.json`, `br.json`, and `cn.json`.
- Use `src/lib/interior-pages/reader.ts` to build route-specific localized bundles. Do not reintroduce a one-off English content module for interior pages.

## Shared Shell

- Reuse `src/components/site/BrandLogo.astro` for the brand mark.
- Reuse `src/components/site/LanguageSwitcher.astro` for desktop/footer language controls.
- Reuse `src/components/site/InteriorHeader.astro` and `src/components/site/InteriorFooter.astro` for interior pages instead of copying header/footer markup into page components.
- If you change the header/footer logo or language control styling, verify both the homepage and interior pages still look aligned.

## Links And Content

- Homepage-to-interior route wiring lives in `src/lib/homepage/links.ts`.
- Keep `mockup/` in place. Do not move or delete it.
- If content is static for now, structure it so it can be localized later rather than hardcoding single-language copy inside components.

## Verification

- Run `npm test`.
- Run `npm run build`.
- If you touched localized UI, verify language switching in the browser for at least one interior page and the homepage.

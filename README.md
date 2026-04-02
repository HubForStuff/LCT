# LATAM China Tech

Innovation bridge between Latin America and China. Built with Astro 5, Keystatic CMS, and Tailwind CSS.

---

## Quick Start

```bash
npm install
npm run dev        # dev server at http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the production build locally
npm test           # run test suite
```

## CMS

Content is managed via [Keystatic](https://keystatic.com/) (Git-based CMS).

```bash
npm run dev        # Keystatic admin is available at http://localhost:4321/keystatic
```

Keystatic manages:
- **Homepage content** — `src/content/homepage/` (locales: en / br / cn)
- **Competitions** — `src/content/competitions/*.json`
- **News articles** — `src/content/news/*.json`

Interior-page localized strings live in `src/content/interior-pages/locales/` (en.json, br.json, cn.json) and are edited directly as JSON files.

## Supported Languages

The site ships in three languages switchable at runtime:

| Code | Language |
|------|----------|
| `en` | English |
| `br` | Portuguese (Brazil) |
| `cn` | Chinese (Simplified) |

## Project Structure

```
src/
  pages/           # Route files (thin — load data, compose components)
    index.astro            homepage
    competitions.astro     competitions listing
    competitions/[slug].astro   competition detail
    news/index.astro       news listing
    news/[slug].astro      article detail
    pre-registration.astro pre-registration form

  components/
    home/            homepage-specific components (desktop & mobile)
    site/            shared shell: InteriorHeader, InteriorFooter, BrandLogo, LanguageSwitcher
    competitions/    competitions listing & detail components
    news/            news index & article components
    pre-registration/ multi-step form components
    i18n/            LocalizationClient (language switching runtime)

  content/
    homepage/locales/   en.json, br.json, cn.json  (Keystatic-managed)
    interior-pages/locales/  en.json, br.json, cn.json  (hand-edited JSON)
    competitions/       per-competition JSON files
    news/               per-article JSON files

  lib/
    homepage/        data reader, schema, types, route links
    interior-pages/  locale bundle builder (reader.ts)
    competitions/    data reader & types
    news/            data reader & types

  styles/
    homepage.css       homepage-specific styles
    interior-pages.css interior pages styles

mockup/              Customer's design reference HTML files (read-only — never modify)
```

## Design Reference (Mockups)

The `mockup/` folder contains the customer's final design intent as self-contained HTML files:

| File | Page |
|------|------|
| `1 - LATAMCHINATECH_desktop v 1million.htm` | Desktop homepage |
| `2 - LATAMCHINATECH_mobille.htm` | Mobile homepage |
| `3 - Challenges___Competitions_v7.htm` | Competitions listing |
| `4 - PRE registration_v13.html` | Pre-registration form |

> News pages (listing and article) have **no mockup** — use design judgment consistent with the site's visual language.

## Deploy

O site é automaticamente deployado para GitHub Pages via GitHub Actions quando há push para a branch `main`.

URL: https://bruehstdio.github.io/latamchina-tech/

## Estrutura

- `/src/pages` - Páginas do site
- `/src/components` - Componentes reutilizáveis
- `/src/layouts` - Layouts de página
- `/src/content` - Coleções de conteúdo
- `/public` - Arquivos estáticos

## Licença

MIT
Pushes to `main` trigger automatic deployment to GitHub Pages via GitHub Actions.

The build output (`dist/`) is a fully static site. Any static file server pointed at `dist/` will work.

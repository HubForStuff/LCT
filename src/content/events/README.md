# Events content

The entries here are **seed content**, not the real event calendar. They exist so the
/events/ list, its filters, and the detail pages have something to render, and so
`tests/events-collection.test.mjs` can assert that every UI state is reachable.

Replace them with real events via Keystatic. When editing:

- Keep at least one entry in each category, each status, and each region, or the
  coverage test fails — it is guarding the UI, not the content.
- `industry` must be one of the 16 keys in `src/lib/events/schema.ts` (`INDUSTRY_OPTIONS`);
  anything else renders no filter pill and no icon.
- For China events, `location` must be the city — the China filter panel matches on it.
  For LATAM events, `country` must match a country in `eventsPage.latamGroups`.
- Use `draft: true` to stage an event without publishing it.

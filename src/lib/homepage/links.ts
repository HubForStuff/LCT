// NOTE: Network is temporarily unpublished. Its route targets, menu entries, and
// content links were removed here and from the locale JSON menu arrays. See the
// "Re-enabling Network" notes in the task report: restoring it means re-adding the
// `network` / `cityPartnerships` / `featuredSpeakers` targets below, re-appending the
// Network section to `desktopMenuSections` (index 4) and `mobileMenuSections`, and
// restoring the index entries called out in each map's comment.
export const HOMEPAGE_ROUTE_TARGETS = {
  home: "/",
  advisory: "/advisory/",
  competitions: "/competitions/",
  startupCompetitions: "/competitions/?tab=startup",
  corporateChallenges: "/competitions/?tab=corporate",
  events: "/events/",
  programs: "/programs/",
  preRegistration: "/pre-registration/",
  news: "/news/",
} as const;

// Indexed by position in `desktopMenuSections`: 0 Advisory, 1 Competitions, 2 Events,
// 3 Programs. (Network was index 4 — last — so removing it shifted nothing.)
const desktopSectionTargets = [
  HOMEPAGE_ROUTE_TARGETS.advisory,
  HOMEPAGE_ROUTE_TARGETS.competitions,
  HOMEPAGE_ROUTE_TARGETS.events,
  HOMEPAGE_ROUTE_TARGETS.programs,
] as const;

const desktopMenuLinkTargets: Record<number, string[]> = {
  0: [
    `${HOMEPAGE_ROUTE_TARGETS.advisory}consulting/`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}investment-matchmaking/`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}tech-transfer/`,
  ],
  2: [
    `${HOMEPAGE_ROUTE_TARGETS.events}#trade-fairs-expos`,
    `${HOMEPAGE_ROUTE_TARGETS.events}#summits`,
  ],
  3: [
    `${HOMEPAGE_ROUTE_TARGETS.programs}#market-entry`,
    `${HOMEPAGE_ROUTE_TARGETS.programs}#business-mission`,
  ],
  // 4 was Network (cityPartnerships, featuredSpeakers) — removed, was last.
};

// Keyed by `desktopMenuSections` index; same 0..3 mapping as `desktopSectionTargets`.
const desktopMenuCardTargets: Record<number, string> = {
  0: `${HOMEPAGE_ROUTE_TARGETS.advisory}#strategy-call`,
  2: `${HOMEPAGE_ROUTE_TARGETS.events}#calendar`,
  3: `${HOMEPAGE_ROUTE_TARGETS.programs}#cohort-8`,
  // 4 was Network — removed, was last.
};

const footerLinkTargets: Record<number, string[]> = {
  0: [
    `${HOMEPAGE_ROUTE_TARGETS.advisory}investment-matchmaking/`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}tech-transfer/`,
  ],
  1: [
    HOMEPAGE_ROUTE_TARGETS.startupCompetitions,
    HOMEPAGE_ROUTE_TARGETS.corporateChallenges,
  ],
  2: [
    `${HOMEPAGE_ROUTE_TARGETS.events}#trade-fairs-expos`,
    `${HOMEPAGE_ROUTE_TARGETS.events}#summits`,
  ],
  3: [
    `${HOMEPAGE_ROUTE_TARGETS.programs}#market-entry`,
    `${HOMEPAGE_ROUTE_TARGETS.programs}#business-mission`,
  ],
};

// Keyed by position in `mobileMenuSections`: 0 Advisory, 1 Competitions, 2 Events,
// 3 Programs. NOTE: Network used to sit at index 3 with Programs at 4 — unlike the
// desktop menu, Network was NOT last here, so removing it shifted Programs 4 -> 3.
// This map is re-derived from the current array order, not line-deleted.
const mobileMenuCardTargets: Record<number, string[]> = {
  0: [HOMEPAGE_ROUTE_TARGETS.advisory],
  1: [
    HOMEPAGE_ROUTE_TARGETS.startupCompetitions,
    HOMEPAGE_ROUTE_TARGETS.corporateChallenges,
  ],
  2: [HOMEPAGE_ROUTE_TARGETS.events],
  3: [HOMEPAGE_ROUTE_TARGETS.programs],
};

export function getNewsListingHref(): string {
  return HOMEPAGE_ROUTE_TARGETS.news;
}

export function getNewsArticleHref(slug: string): string {
  return `${HOMEPAGE_ROUTE_TARGETS.news}${slug}/`;
}

export function getDesktopMenuSectionHref(sectionIndex: number): string {
  return desktopSectionTargets[sectionIndex] ?? "#";
}

export function getDesktopMenuLinkHref(sectionIndex: number, linkIndex: number): string {
  if (sectionIndex === 1) {
    if (linkIndex === 0) {
      return HOMEPAGE_ROUTE_TARGETS.startupCompetitions;
    }

    return HOMEPAGE_ROUTE_TARGETS.corporateChallenges;
  }

  return (
    desktopMenuLinkTargets[sectionIndex]?.[linkIndex] ??
    getDesktopMenuSectionHref(sectionIndex)
  );
}

export function getDesktopMenuCardHref(sectionIndex: number): string {
  if (sectionIndex === 1) {
    return HOMEPAGE_ROUTE_TARGETS.competitions;
  }

  return desktopMenuCardTargets[sectionIndex] ?? getDesktopMenuSectionHref(sectionIndex);
}

export function getCompetitionSectionHref(cardIndex: number): string {
  if (cardIndex === 0) {
    return HOMEPAGE_ROUTE_TARGETS.startupCompetitions;
  }

  return HOMEPAGE_ROUTE_TARGETS.corporateChallenges;
}

export function getFooterLinkHref(
  columnIndex: number,
  linkIndex: number,
  fallbackHref = "#desktop-footer",
): string {
  return footerLinkTargets[columnIndex]?.[linkIndex] ?? fallbackHref;
}

export function getFooterCtaHref(): string {
  return HOMEPAGE_ROUTE_TARGETS.programs;
}

export function getMobileMenuCardHref(sectionIndex: number, cardIndex: number): string {
  return mobileMenuCardTargets[sectionIndex]?.[cardIndex] ?? "#mobile-footer";
}

export function getMobileFooterLinkHref(columnIndex: number, linkIndex: number): string {
  return getFooterLinkHref(columnIndex, linkIndex, "#mobile-footer");
}

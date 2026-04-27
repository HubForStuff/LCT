export const HOMEPAGE_ROUTE_TARGETS = {
  home: "/",
  advisory: "/advisory/",
  competitions: "/competitions/",
  events: "/events/",
  programs: "/programs/",
  network: "/network/",
  preRegistration: "/pre-registration/",
  news: "/news/",
} as const;

const desktopSectionTargets = [
  HOMEPAGE_ROUTE_TARGETS.advisory,
  HOMEPAGE_ROUTE_TARGETS.competitions,
  HOMEPAGE_ROUTE_TARGETS.events,
  HOMEPAGE_ROUTE_TARGETS.programs,
  HOMEPAGE_ROUTE_TARGETS.network,
] as const;

const desktopMenuLinkTargets: Record<number, string[]> = {
  0: [
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#consulting`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#investment-matchmaking`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#tech-transfer`,
  ],
  2: [
    `${HOMEPAGE_ROUTE_TARGETS.events}#trade-fairs-expos`,
    `${HOMEPAGE_ROUTE_TARGETS.events}#summits`,
  ],
  3: [
    `${HOMEPAGE_ROUTE_TARGETS.programs}#market-entry`,
    `${HOMEPAGE_ROUTE_TARGETS.programs}#business-mission`,
  ],
  4: [
    `${HOMEPAGE_ROUTE_TARGETS.network}#city-partnerships`,
    `${HOMEPAGE_ROUTE_TARGETS.network}#featured-speakers`,
  ],
};

const desktopMenuCardTargets: Record<number, string> = {
  0: `${HOMEPAGE_ROUTE_TARGETS.advisory}#strategy-call`,
  2: `${HOMEPAGE_ROUTE_TARGETS.events}#calendar`,
  3: `${HOMEPAGE_ROUTE_TARGETS.programs}#cohort-8`,
  4: `${HOMEPAGE_ROUTE_TARGETS.network}#active-partners`,
};

const categoryCardTargets = [
  `${HOMEPAGE_ROUTE_TARGETS.programs}#market-entry`,
  HOMEPAGE_ROUTE_TARGETS.network,
  HOMEPAGE_ROUTE_TARGETS.advisory,
] as const;

const footerLinkTargets: Record<number, string[]> = {
  0: [
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#investment-matchmaking`,
    `${HOMEPAGE_ROUTE_TARGETS.advisory}#tech-transfer`,
  ],
  1: [
    HOMEPAGE_ROUTE_TARGETS.preRegistration,
    HOMEPAGE_ROUTE_TARGETS.competitions,
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

const mobileMenuCardTargets: Record<number, string[]> = {
  0: [HOMEPAGE_ROUTE_TARGETS.advisory],
  1: [
    HOMEPAGE_ROUTE_TARGETS.competitions,
    HOMEPAGE_ROUTE_TARGETS.preRegistration,
  ],
  2: [HOMEPAGE_ROUTE_TARGETS.events],
  3: [HOMEPAGE_ROUTE_TARGETS.network],
  4: [HOMEPAGE_ROUTE_TARGETS.programs],
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
      return HOMEPAGE_ROUTE_TARGETS.preRegistration;
    }

    return HOMEPAGE_ROUTE_TARGETS.competitions;
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
    return `${HOMEPAGE_ROUTE_TARGETS.competitions}?tab=startup`;
  }

  return `${HOMEPAGE_ROUTE_TARGETS.competitions}?tab=corporate`;
}

export function getCategoryCardHref(cardIndex: number): string {
  return categoryCardTargets[cardIndex] ?? HOMEPAGE_ROUTE_TARGETS.advisory;
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

export function getMobileCategoryCardHref(cardIndex: number): string {
  return getCategoryCardHref(cardIndex);
}

export function getMobileFooterLinkHref(columnIndex: number, linkIndex: number): string {
  return getFooterLinkHref(columnIndex, linkIndex, "#mobile-footer");
}

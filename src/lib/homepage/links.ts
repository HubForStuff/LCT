export const HOMEPAGE_ROUTE_TARGETS = {
  home: "/",
  competitions: "/competitions/",
  preRegistration: "/pre-registration/",
  news: "/news/",
} as const;

export function getNewsListingHref(): string {
  return HOMEPAGE_ROUTE_TARGETS.news;
}

export function getNewsArticleHref(slug: string): string {
  return `${HOMEPAGE_ROUTE_TARGETS.news}${slug}/`;
}

export function getDesktopMenuSectionHref(sectionIndex: number): string {
  if (sectionIndex === 1) {
    return HOMEPAGE_ROUTE_TARGETS.competitions;
  }

  return "#";
}

export function getDesktopMenuLinkHref(sectionIndex: number, linkIndex: number): string {
  if (sectionIndex === 1) {
    if (linkIndex === 0) {
      return HOMEPAGE_ROUTE_TARGETS.preRegistration;
    }

    return HOMEPAGE_ROUTE_TARGETS.competitions;
  }

  return "#";
}

export function getDesktopMenuCardHref(sectionIndex: number): string {
  if (sectionIndex === 1) {
    return HOMEPAGE_ROUTE_TARGETS.competitions;
  }

  return "#";
}

export function getCompetitionSectionHref(cardIndex: number): string {
  if (cardIndex === 0) {
    return `${HOMEPAGE_ROUTE_TARGETS.competitions}?tab=startup`;
  }

  return `${HOMEPAGE_ROUTE_TARGETS.competitions}?tab=corporate`;
}

function getCompetitionFooterHref(linkIndex: number): string {
  if (linkIndex === 0) {
    return HOMEPAGE_ROUTE_TARGETS.preRegistration;
  }

  return HOMEPAGE_ROUTE_TARGETS.competitions;
}

export function getFooterLinkHref(
  columnIndex: number,
  linkIndex: number,
  fallbackHref = "#desktop-footer",
): string {
  if (columnIndex === 1) {
    return getCompetitionFooterHref(linkIndex);
  }

  return fallbackHref;
}

export function getMobileMenuCardHref(sectionIndex: number, cardIndex: number): string {
  if (sectionIndex === 1) {
    if (cardIndex === 0) {
      return HOMEPAGE_ROUTE_TARGETS.competitions;
    }

    return HOMEPAGE_ROUTE_TARGETS.preRegistration;
  }

  return "#mobile-footer";
}

export function getMobileFooterLinkHref(columnIndex: number, linkIndex: number): string {
  return getFooterLinkHref(columnIndex, linkIndex, "#mobile-footer");
}

// Inlined Lucide-style stroke SVGs shared by the competitions and events listings.
// Moved verbatim out of CompetitionsPage.astro so both listings render identical chrome.

export const STATUS_FILTER_ICONS: Record<string, string> = {
  open:
    '<svg width="9" height="9" viewBox="0 0 9 9" aria-hidden="true"><circle cx="4.5" cy="4.5" r="3.5" fill="#22c55e"></circle></svg>',
  future:
    '<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true"><circle cx="4.5" cy="4.5" r="3.5" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2 1.5"></circle></svg>',
  closed:
    '<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true"><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="#94a3b8" stroke-width="1.5"></rect><line x1="3" y1="4.5" x2="6" y2="4.5" stroke="#94a3b8" stroke-width="1.5"></line></svg>',
  // Events use `upcoming`/`past` where competitions use `future`/`closed` — same icon markup,
  // added under the events vocabulary so both sets of keys resolve without renaming either.
  upcoming:
    '<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true"><circle cx="4.5" cy="4.5" r="3.5" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="2 1.5"></circle></svg>',
  past:
    '<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true"><rect x="1" y="1" width="7" height="7" rx="1.5" stroke="#94a3b8" stroke-width="1.5"></rect><line x1="3" y1="4.5" x2="6" y2="4.5" stroke="#94a3b8" stroke-width="1.5"></line></svg>',
};

export const FOCUS_FILTER_ICONS: Record<string, string> = {
  "deep-tech":
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><polygon points="6.5,1.5 11.5,11 1.5,11" stroke="#6366f1" stroke-width="1.6" fill="none"></polygon></svg>',
  sustainability:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 1.5C6.5 1.5 3 5 3 7.5a3.5 3.5 0 007 0c0-2.5-3.5-6-3.5-6z" stroke="#22c55e" stroke-width="1.6" fill="none"></path></svg>',
  fintech:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="2" y="4" width="9" height="7" rx="1.5" stroke="#3b82f6" stroke-width="1.5" fill="none"></rect><path d="M4.5 4V3a2 2 0 014 0v1" stroke="#3b82f6" stroke-width="1.5"></path></svg>',
  agritech:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 11.5V5M6.5 5C6.5 5 4 3 2 4c1.5 1.8 3 3.5 4.5 1zM6.5 5c0 0 2.5-2 4.5-1-1.5 1.8-3 3.5-4.5 1z" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"></path></svg>',
  ai:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="2.2" stroke="#8b5cf6" stroke-width="1.5"></circle><path d="M6.5 1.5V3M6.5 10V11.5M1.5 6.5H3M10 6.5H11.5" stroke="#8b5cf6" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  healthtech:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 11.5C6.5 11.5 2 8.5 2 5.5a2.8 2.8 0 015.5 0 2.8 2.8 0 015.5 0c0 3-6.5 6-6.5 6z" stroke="#f43f5e" stroke-width="1.5" fill="none"></path></svg>',
  logistics:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="1" y="5" width="7.5" height="5" rx="1" stroke="#f59e0b" stroke-width="1.4" fill="none"></rect><path d="M8.5 6.5h1.8l2 2.5v1H8.5V6.5z" stroke="#f59e0b" stroke-width="1.3" stroke-linejoin="round" fill="none"></path><circle cx="3.5" cy="11" r="1.1" stroke="#f59e0b" stroke-width="1.3"></circle><circle cx="10.2" cy="11" r="1.1" stroke="#f59e0b" stroke-width="1.3"></circle></svg>',
  biotech:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><ellipse cx="5.5" cy="6.5" rx="2.2" ry="4.5" stroke="#14b8a6" stroke-width="1.4" fill="none"></ellipse><ellipse cx="7.5" cy="6.5" rx="2.2" ry="4.5" stroke="#14b8a6" stroke-width="1.4" fill="none"></ellipse></svg>',
  manufacturing:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1.5 11L4.5 6.5l3 3L11 4l2 7H1.5z" stroke="#64748b" stroke-width="1.4" stroke-linejoin="round" fill="none"></path></svg>',
  education:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M1.5 5L6.5 2.5 11.5 5 6.5 7.5 1.5 5z" stroke="#ea580c" stroke-width="1.4" stroke-linejoin="round" fill="none"></path><path d="M9.5 6.5V9c0 1-1.5 1.5-3 1.5S3.5 10 3.5 9V6.5" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round" fill="none"></path></svg>',
  "energy-and-climate":
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M7 1.5 2.5 7h3.2L5 11.5 10.5 5H7.3L7 1.5z" stroke="#0891b2" stroke-width="1.4" stroke-linejoin="round" fill="none"></path></svg>',
  entertainment:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="2" y="3" width="9" height="7" rx="1.5" stroke="#db2777" stroke-width="1.4" fill="none"></rect><path d="M4 3v7M9 3v7M2 5h9M2 8h9" stroke="#db2777" stroke-width="1.1"></path></svg>',
  "food-and-agritech":
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 11.5V5M6.5 5C6.5 5 4 3 2 4c1.5 1.8 3 3.5 4.5 1zM6.5 5c0 0 2.5-2 4.5-1-1.5 1.8-3 3.5-4.5 1z" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"></path></svg>',
  marketplaces:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 5.5h9l-1 5H3L2 5.5z" stroke="#4f46e5" stroke-width="1.4" fill="none"></path><path d="M4 5.5V4a2.5 2.5 0 015 0v1.5" stroke="#4f46e5" stroke-width="1.4"></path></svg>',
  "media-and-community":
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><circle cx="4" cy="5" r="2" stroke="#7c3aed" stroke-width="1.4"></circle><circle cx="9" cy="5" r="2" stroke="#7c3aed" stroke-width="1.4"></circle><path d="M1.5 11c.5-1.8 1.8-2.8 3.5-2.8s3 1 3.5 2.8M5 11c.5-1.8 1.8-2.8 3.5-2.8s3 1 3.5 2.8" stroke="#7c3aed" stroke-width="1.2" stroke-linecap="round"></path></svg>',
  mobility:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="1" y="5" width="7.5" height="5" rx="1" stroke="#f59e0b" stroke-width="1.4" fill="none"></rect><path d="M8.5 6.5h1.8l2 2.5v1H8.5V6.5z" stroke="#f59e0b" stroke-width="1.3" stroke-linejoin="round" fill="none"></path><circle cx="3.5" cy="11" r="1.1" stroke="#f59e0b" stroke-width="1.3"></circle><circle cx="10.2" cy="11" r="1.1" stroke="#f59e0b" stroke-width="1.3"></circle></svg>',
  proptech:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 11V5.5L6.5 2l4.5 3.5V11H8V7H5v4H2z" stroke="#0f766e" stroke-width="1.4" stroke-linejoin="round" fill="none"></path></svg>',
  robotics:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="2.5" y="4" width="8" height="6.5" rx="1.5" stroke="#475569" stroke-width="1.4" fill="none"></rect><path d="M6.5 4V1.8M4.5 7h0M8.5 7h0M5 9h3" stroke="#475569" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  security:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 1.5 10.5 3v3.2c0 2.4-1.6 4.1-4 5.3-2.4-1.2-4-2.9-4-5.3V3l4-1.5z" stroke="#1d4ed8" stroke-width="1.4" stroke-linejoin="round" fill="none"></path></svg>',
  other:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><circle cx="6.5" cy="6.5" r="4.5" stroke="#64748b" stroke-width="1.4"></circle><path d="M4.5 6.5h4M6.5 4.5v4" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  cleantech:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M6.5 1C6.5 1 2.5 4.5 2.5 8a4 4 0 008 0c0-3.5-4-7-4-7z" stroke="#0891b2" stroke-width="1.5" fill="none"></path></svg>',
  corporate:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><rect x="2" y="3.5" width="9" height="7.5" rx="1" stroke="#4f46e5" stroke-width="1.4" fill="none"></rect><path d="M5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1" stroke="#4f46e5" stroke-width="1.3"></path></svg>',
  sme:
    '<svg width="11" height="11" viewBox="0 0 13 13" fill="none" aria-hidden="true"><path d="M2 10V5.5L6.5 2l4.5 3.5V10H8.5V7.5h-4V10H2z" stroke="#4f46e5" stroke-width="1.4" fill="none" stroke-linejoin="round"></path></svg>',
};

export const CARD_FOCUS_ICONS: Record<string, string> = {
  "deep-tech":
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><polygon points="6,1.5 10.5,10 1.5,10" stroke="#6366f1" stroke-width="1.5" fill="none"></polygon></svg>',
  sustainability:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 1C6 1 2 4 2 7a4 4 0 008 0c0-3-4-6-4-6z" stroke="#22c55e" stroke-width="1.5" fill="none"></path></svg>',
  fintech:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1.5" y="3" width="9" height="7" rx="1.5" stroke="#2563EB" stroke-width="1.5" fill="none"></rect><path d="M4 3V2a2 2 0 014 0v1" stroke="#2563EB" stroke-width="1.5"></path></svg>',
  agritech:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 10V4M6 4C6 4 3 2 1 3c1.5 1.5 3 3 5 1zM6 4c0 0 3-2 5-1-1.5 1.5-3 3-5 1z" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"></path></svg>',
  ai:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="2" stroke="#7c3aed" stroke-width="1.4"></circle><path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11M2.9 2.9l1.05 1.05M8.05 8.05l1.05 1.05M9.1 2.9L8.05 3.95M3.95 8.05L2.9 9.1" stroke="#7c3aed" stroke-width="1.3" stroke-linecap="round"></path></svg>',
  healthtech:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 10.5C6 10.5 1.5 7.5 1.5 4.5a2.5 2.5 0 015-0c.28-.8 1-1 1.5-1a2.5 2.5 0 012.5 2.5c0 3-4.5 6-4.5 6z" stroke="#dc2626" stroke-width="1.4" fill="none"></path></svg>',
  logistics:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1" y="3.5" width="7" height="5" rx="1" stroke="#d97706" stroke-width="1.4" fill="none"></rect><path d="M8 5.5h1.5l1.5 2v1H8V5.5z" stroke="#d97706" stroke-width="1.2" stroke-linejoin="round" fill="none"></path><circle cx="3.5" cy="9.5" r="1" stroke="#d97706" stroke-width="1.2"></circle><circle cx="9" cy="9.5" r="1" stroke="#d97706" stroke-width="1.2"></circle></svg>',
  biotech:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><ellipse cx="4.5" cy="6" rx="2" ry="4" stroke="#0d9488" stroke-width="1.4" fill="none"></ellipse><ellipse cx="7.5" cy="6" rx="2" ry="4" stroke="#0d9488" stroke-width="1.4" fill="none"></ellipse></svg>',
  manufacturing:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 9l3-4 2.5 2.5L9 4l2 5H1z" stroke="#475569" stroke-width="1.3" stroke-linejoin="round" fill="none"></path></svg>',
  cleantech:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 1C6 1 2 4 2 7a4 4 0 008 0c0-3-4-6-4-6z" stroke="#0891b2" stroke-width="1.5" fill="none"></path></svg>',
  "energy-and-climate":
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7 1 2 7h4l-1 4 5-6H6L7 1z" stroke="#0891b2" stroke-width="1.4" stroke-linejoin="round" fill="none"></path></svg>',
  "food-and-agritech":
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 10V4M6 4C6 4 3 2 1 3c1.5 1.5 3 3 5 1zM6 4c0 0 3-2 5-1-1.5 1.5-3 3-5 1z" stroke="#16a34a" stroke-width="1.5" stroke-linecap="round"></path></svg>',
  mobility:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1" y="3.5" width="7" height="5" rx="1" stroke="#d97706" stroke-width="1.4" fill="none"></rect><path d="M8 5.5h1.5l1.5 2v1H8V5.5z" stroke="#d97706" stroke-width="1.2" stroke-linejoin="round" fill="none"></path><circle cx="3.5" cy="9.5" r="1" stroke="#d97706" stroke-width="1.2"></circle><circle cx="9" cy="9.5" r="1" stroke="#d97706" stroke-width="1.2"></circle></svg>',
  corporate:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1.5" y="3" width="9" height="7" rx="1.5" stroke="#4f46e5" stroke-width="1.4" fill="none"></rect><line x1="3.5" y1="6.5" x2="5.5" y2="6.5" stroke="#4f46e5" stroke-width="1.3" stroke-linecap="round"></line><line x1="3.5" y1="8" x2="7.5" y2="8" stroke="#4f46e5" stroke-width="1.3" stroke-linecap="round"></line></svg>',
  marketplaces:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1.5 4.5h9l-1 5.5h-7l-1-5.5z" stroke="#4f46e5" stroke-width="1.4" stroke-linejoin="round" fill="none"></path><path d="M3.5 4.5V3a2.5 2.5 0 015 0v1.5" stroke="#4f46e5" stroke-width="1.4"></path></svg>',
  education:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 4.5L6 2l5 2.5-5 2.5-5-2.5z" stroke="#ea580c" stroke-width="1.4" stroke-linejoin="round" fill="none"></path><path d="M9 6v3c0 1-1.5 1.5-3 1.5S3 10 3 9V6" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round" fill="none"></path></svg>',
  edtech:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1 4.5L6 2l5 2.5-5 2.5-5-2.5z" stroke="#ea580c" stroke-width="1.4" stroke-linejoin="round" fill="none"></path><path d="M9 6v3c0 1-1.5 1.5-3 1.5S3 10 3 9V6" stroke="#ea580c" stroke-width="1.4" stroke-linecap="round" fill="none"></path></svg>',
  retail:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M1.5 2h9l-1 5.5H2.5L1.5 2z" stroke="#db2777" stroke-width="1.4" fill="none" stroke-linejoin="round"></path><circle cx="4" cy="10" r="1" stroke="#db2777" stroke-width="1.2"></circle><circle cx="8" cy="10" r="1" stroke="#db2777" stroke-width="1.2"></circle></svg>',
  energy:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M7 1L2 7h4l-1 4 5-6H6L7 1z" stroke="#059669" stroke-width="1.4" stroke-linejoin="round" fill="none"></path></svg>',
  entertainment:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1.5" y="3" width="9" height="7" rx="1.5" stroke="#db2777" stroke-width="1.4" fill="none"></rect><path d="M3.5 3v7M8.5 3v7M1.5 5.2h9M1.5 7.8h9" stroke="#db2777" stroke-width="1.1"></path></svg>',
  "media-and-community":
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="4" cy="4.8" r="1.8" stroke="#7c3aed" stroke-width="1.4"></circle><circle cx="8" cy="4.8" r="1.8" stroke="#7c3aed" stroke-width="1.4"></circle><path d="M1.5 10.5c.5-1.7 1.7-2.5 3.2-2.5s2.7.8 3.2 2.5M4.5 10.5C5 8.8 6.2 8 7.7 8s2.7.8 3.2 2.5" stroke="#7c3aed" stroke-width="1.2" stroke-linecap="round"></path></svg>',
  proptech:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10.5V5.5L6 2l4 3.5v5H7.5v-3h-3v3H2z" stroke="#0f766e" stroke-width="1.4" stroke-linejoin="round" fill="none"></path></svg>',
  robotics:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="2" y="4" width="8" height="6" rx="1.5" stroke="#475569" stroke-width="1.4" fill="none"></rect><path d="M6 4V1.5M4.2 6.8h0M7.8 6.8h0M4.8 8.8h2.4" stroke="#475569" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  security:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M6 1.5 10 3v3c0 2.3-1.6 4-4 5-2.4-1-4-2.7-4-5V3l4-1.5z" stroke="#1d4ed8" stroke-width="1.4" stroke-linejoin="round" fill="none"></path></svg>',
  other:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4.5" stroke="#64748b" stroke-width="1.4"></circle><path d="M4 6h4M6 4v4" stroke="#64748b" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  "financial-services":
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><rect x="1.5" y="3" width="9" height="7" rx="1.5" stroke="#1d4ed8" stroke-width="1.4" fill="none"></rect><line x1="3.5" y1="6.5" x2="5.5" y2="6.5" stroke="#1d4ed8" stroke-width="1.3" stroke-linecap="round"></line><line x1="3.5" y1="8" x2="7.5" y2="8" stroke="#1d4ed8" stroke-width="1.3" stroke-linecap="round"></line></svg>',
  sme:
    '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M2 10V5.5L6 2l4 3.5V10H8V7H4v3H2z" stroke="#4f46e5" stroke-width="1.4" fill="none" stroke-linejoin="round"></path></svg>',
};

export function getFilterIconMarkup(kind: "status" | "focus", value?: string): string {
  if (!value) {
    return "";
  }

  return kind === "status"
    ? STATUS_FILTER_ICONS[value] ?? ""
    : FOCUS_FILTER_ICONS[value] ?? "";
}

export function getCardFocusIcon(focusKeys: string[]): string {
  for (const key of focusKeys) {
    if (CARD_FOCUS_ICONS[key]) {
      return CARD_FOCUS_ICONS[key];
    }
  }
  return "";
}

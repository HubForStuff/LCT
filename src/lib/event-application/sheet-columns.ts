// src/lib/event-application/sheet-columns.ts
// Canonical column order for the event application Google Sheet tab.
// scripts/apps-script/Code.gs MUST declare the same EVENT_APPLICATION_SHEET_COLUMNS array,
// in the same order — the build test in tests/event-application.test.mjs asserts they match.

export const EVENT_APPLICATION_SHEET_COLUMNS = [
  "Submitted At",
  "Submission ID",
  "Language",
  "Event Slug",
  "Event Name",
  "Name",
  "Email",
  "Company",
  "Message",
] as const;

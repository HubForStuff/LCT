// src/lib/eligibility/sheet-columns.ts
// Canonical column order for the eligibility Google Sheet tab.
// scripts/apps-script/Code.gs MUST declare the same ELIGIBILITY_SHEET_COLUMNS array,
// in the same order — the build test in tests/eligibility-form.test.mjs asserts they match.

export const ELIGIBILITY_SHEET_COLUMNS = [
  "Submitted At",
  "Submission ID",
  "Language",
  "Program Slug",
  "Program Name",
  "Name",
  "Email",
  "Company",
  "Message",
] as const;

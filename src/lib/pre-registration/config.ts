// src/lib/pre-registration/config.ts
// Public, build-time config for the pre-registration form.
// The Apps Script /exec URL is public-safe; commit a placeholder and set
// PUBLIC_PREREG_SCRIPT_URL in the build env for real submissions.

export const PREREG_ENDPOINT =
  import.meta.env.PUBLIC_PREREG_SCRIPT_URL ?? "REPLACE_WITH_APPS_SCRIPT_URL";

// AI assistance panel stays hidden unless explicitly enabled (no AI backend yet).
export const AI_ASSISTANCE_ENABLED =
  import.meta.env.PUBLIC_ENABLE_AI_ASSISTANCE === "true";

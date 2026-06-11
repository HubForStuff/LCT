// Public, build-time configuration for the contact form provider (Web3Forms).
// The access key is public-safe (tied to a destination inbox); committing a
// placeholder is fine — set PUBLIC_WEB3FORMS_ACCESS_KEY in the build env for real submissions.

export const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";

export const CONTACT_ACCESS_KEY =
  import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY ?? "REPLACE_WITH_WEB3FORMS_ACCESS_KEY";

export const CONTACT_SUBJECT = "New contact request — LATAM China Tech";

// Empty string disables hCaptcha entirely (honeypot remains the default bot protection).
export const HCAPTCHA_SITE_KEY = import.meta.env.PUBLIC_HCAPTCHA_SITE_KEY ?? "";

// src/lib/event-application/submit.mjs
/**
 * Pure, framework-agnostic submit adapter for the event application form.
 * Sends multipart FormData (a CORS-safe-listed content type → no preflight), so the
 * Apps Script Web App's 302→googleusercontent redirect is followed and the JSON
 * response is readable. Do NOT set Content-Type: the browser must add the multipart boundary.
 * The FormData must carry formType=event-application so Code.gs routes it to the
 * Event Applications sheet.
 *
 * @param {string} endpoint  Apps Script /exec URL
 * @param {FormData} formData
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function submitEventApplication(endpoint, formData, fetchImpl = globalThis.fetch) {
  try {
    const response = await fetchImpl(endpoint, { method: "POST", body: formData });
    const data = await response.json().catch(() => ({}));
    if (response.ok && data && data.ok) return { ok: true };
    return { ok: false, error: (data && data.error) || `Request failed (${response.status})` };
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : "Network error" };
  }
}

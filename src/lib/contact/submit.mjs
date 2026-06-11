/**
 * Pure, framework-agnostic submit adapter for the contact form.
 * No DOM and no import.meta.env so it is unit-testable under node --test.
 *
 * @param {string} endpoint
 * @param {Record<string, unknown>} payload
 * @param {typeof fetch} [fetchImpl]
 * @returns {Promise<{ ok: boolean, error?: string }>}
 */
export async function submitContact(endpoint, payload, fetchImpl = globalThis.fetch) {
  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (response.ok && data && data.success) {
      return { ok: true };
    }

    return {
      ok: false,
      error: (data && data.message) || `Request failed (${response.status})`,
    };
  } catch (error) {
    return { ok: false, error: error && error.message ? error.message : "Network error" };
  }
}

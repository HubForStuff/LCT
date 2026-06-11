# Contact Form Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A site-wide accessible contact modal whose form submits client-side to Web3Forms (emails the team), triggered by any `#contact` link, localized EN/BR/CN, with honeypot bot protection.

**Architecture:** A pure, framework-agnostic submit adapter (`submit.mjs`, unit-testable by mocking `fetch`), an Astro config module + i18n copy, and one `ContactModal.astro` (markup + inline i18n island + client `<script>`) injected globally via `Layout.astro`. Web3Forms access key is a build-time public env var with a safe placeholder default.

**Tech Stack:** Astro 5 (static), vanilla TS/JS client script, Web3Forms JSON API, `node --test` (adapter unit test + build-and-assert HTML).

---

## File Structure

**Create:**
- `src/lib/contact/submit.mjs` — pure `submitContact(endpoint, payload, fetchImpl?)` adapter (no DOM, no `import.meta.env`; node-testable).
- `src/lib/contact/config.ts` — Astro-only config: endpoint, public access key, optional hCaptcha site key.
- `src/lib/contact/i18n.ts` — `CONTACT_COPY` (EN/BR/CN) + `ContactCopy` type.
- `src/components/contact/ContactModal.astro` — modal markup + i18n island + client behavior script.
- `src/styles/contact.css` — self-contained modal styling (brand colors hard-coded; no cross-file CSS-var dependency).
- `tests/contact-form.test.mjs` — adapter unit test (mock fetch) + build-and-assert DOM test.
- `.env.example` — documents `PUBLIC_WEB3FORMS_ACCESS_KEY` + `PUBLIC_HCAPTCHA_SITE_KEY`.

**Modify:**
- `src/layouts/Layout.astro` — import `contact.css`, render `<ContactModal />` before `</body>`.

---

## Task 1: Submit adapter + config + i18n (TDD)

**Files:**
- Create: `src/lib/contact/submit.mjs`, `src/lib/contact/config.ts`, `src/lib/contact/i18n.ts`
- Test: `tests/contact-form.test.mjs`

- [ ] **Step 1: Write the failing adapter unit test** — create `tests/contact-form.test.mjs`:

```js
import test from "node:test";
import assert from "node:assert/strict";

import { submitContact } from "../src/lib/contact/submit.mjs";

const ENDPOINT = "https://api.web3forms.com/submit";

test("submitContact posts JSON and returns ok on success:true", async () => {
  let captured = null;
  const fakeFetch = async (url, opts) => {
    captured = { url, opts };
    return { ok: true, status: 200, json: async () => ({ success: true, message: "ok" }) };
  };

  const result = await submitContact(ENDPOINT, { access_key: "k", name: "Ada", email: "a@b.co", message: "hi" }, fakeFetch);

  assert.equal(result.ok, true);
  assert.equal(captured.url, ENDPOINT);
  assert.equal(captured.opts.method, "POST");
  assert.match(captured.opts.headers["Content-Type"], /application\/json/);
  const body = JSON.parse(captured.opts.body);
  assert.equal(body.access_key, "k");
  assert.equal(body.name, "Ada");
});

test("submitContact returns not-ok on success:false", async () => {
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ success: false, message: "bad key" }) });
  const result = await submitContact(ENDPOINT, {}, fakeFetch);
  assert.equal(result.ok, false);
  assert.equal(result.error, "bad key");
});

test("submitContact returns not-ok on network error", async () => {
  const fakeFetch = async () => { throw new Error("offline"); };
  const result = await submitContact(ENDPOINT, {}, fakeFetch);
  assert.equal(result.ok, false);
  assert.match(result.error, /offline/);
});
```

- [ ] **Step 2: Run it, verify it FAILS**

Run: `node --test --test-concurrency=1 tests/contact-form.test.mjs 2>&1 | tail -20`
Expected: FAIL — cannot find module `../src/lib/contact/submit.mjs`.

- [ ] **Step 3: Create `src/lib/contact/submit.mjs`**

```js
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
```

- [ ] **Step 4: Run the test, verify it PASSES**

Run: `node --test --test-concurrency=1 tests/contact-form.test.mjs 2>&1 | tail -20`
Expected: PASS (3 tests).

- [ ] **Step 5: Create `src/lib/contact/config.ts`**

```ts
// Public, build-time configuration for the contact form provider (Web3Forms).
// The access key is public-safe (tied to a destination inbox); committing a
// placeholder is fine — set PUBLIC_WEB3FORMS_ACCESS_KEY in the build env for real submissions.

export const CONTACT_ENDPOINT = "https://api.web3forms.com/submit";

export const CONTACT_ACCESS_KEY =
  import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY ?? "REPLACE_WITH_WEB3FORMS_ACCESS_KEY";

export const CONTACT_SUBJECT = "New contact request — LATAM China Tech";

// Empty string disables hCaptcha entirely (honeypot remains the default bot protection).
export const HCAPTCHA_SITE_KEY = import.meta.env.PUBLIC_HCAPTCHA_SITE_KEY ?? "";
```

- [ ] **Step 6: Create `src/lib/contact/i18n.ts`**

```ts
export type ContactCopy = {
  title: string;
  intro: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  submitLabel: string;
  sendingLabel: string;
  successTitle: string;
  successBody: string;
  errorBody: string;
  closeLabel: string;
  privacyNote: string;
  requiredError: string;
  emailError: string;
};

export const CONTACT_COPY: Record<"EN" | "BR" | "CN", ContactCopy> = {
  EN: {
    title: "Get in touch",
    intro: "Tell us about your goals and we'll route your request to the right advisor.",
    nameLabel: "Name",
    namePlaceholder: "Your full name",
    emailLabel: "Email",
    emailPlaceholder: "you@company.com",
    companyLabel: "Company (optional)",
    companyPlaceholder: "Company or organization",
    messageLabel: "Message",
    messagePlaceholder: "How can we help?",
    submitLabel: "Send message",
    sendingLabel: "Sending…",
    successTitle: "Thank you",
    successBody: "Your message is on its way. We'll be in touch shortly.",
    errorBody: "Something went wrong. Please try again or email us directly.",
    closeLabel: "Close",
    privacyNote: "We'll only use your details to respond to your request.",
    requiredError: "Please fill in your name, email, and message.",
    emailError: "Please enter a valid email address.",
  },
  BR: {
    title: "Fale com a gente",
    intro: "Conte seus objetivos e encaminharemos sua solicitação ao advisor certo.",
    nameLabel: "Nome",
    namePlaceholder: "Seu nome completo",
    emailLabel: "E-mail",
    emailPlaceholder: "voce@empresa.com",
    companyLabel: "Empresa (opcional)",
    companyPlaceholder: "Empresa ou organização",
    messageLabel: "Mensagem",
    messagePlaceholder: "Como podemos ajudar?",
    submitLabel: "Enviar mensagem",
    sendingLabel: "Enviando…",
    successTitle: "Obrigado",
    successBody: "Sua mensagem está a caminho. Entraremos em contato em breve.",
    errorBody: "Algo deu errado. Tente novamente ou envie um e-mail diretamente.",
    closeLabel: "Fechar",
    privacyNote: "Usaremos seus dados apenas para responder à sua solicitação.",
    requiredError: "Preencha nome, e-mail e mensagem.",
    emailError: "Informe um e-mail válido.",
  },
  CN: {
    title: "联系我们",
    intro: "告诉我们您的目标，我们会将您的请求转交给合适的顾问。",
    nameLabel: "姓名",
    namePlaceholder: "您的全名",
    emailLabel: "邮箱",
    emailPlaceholder: "you@company.com",
    companyLabel: "公司（选填）",
    companyPlaceholder: "公司或机构",
    messageLabel: "留言",
    messagePlaceholder: "我们能帮您什么？",
    submitLabel: "发送",
    sendingLabel: "发送中…",
    successTitle: "谢谢",
    successBody: "您的消息已发送，我们会尽快与您联系。",
    errorBody: "出了点问题，请重试或直接发邮件给我们。",
    closeLabel: "关闭",
    privacyNote: "我们仅会使用您的信息来回复您的请求。",
    requiredError: "请填写姓名、邮箱和留言。",
    emailError: "请输入有效的邮箱地址。",
  },
};
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/contact tests/contact-form.test.mjs
git commit -m "feat(contact): add submit adapter, config, and i18n copy"
```

---

## Task 2: ContactModal component + styles + global injection (TDD)

**Files:**
- Test: `tests/contact-form.test.mjs` (append a build-and-assert test)
- Create: `src/components/contact/ContactModal.astro`, `src/styles/contact.css`
- Modify: `src/layouts/Layout.astro`

- [ ] **Step 1: Append the failing build-and-assert test** to `tests/contact-form.test.mjs`

Add these imports at the TOP of the file (below the existing imports):

```js
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const testDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(testDir, "..");

const buildSite = () => {
  const outDir = mkdtempSync(resolve(tmpdir(), "inovacao-hub-contact-"));
  const build = spawnSync("npm", ["run", "build", "--", "--outDir", outDir], {
    cwd: projectRoot,
    encoding: "utf8",
  });
  assert.equal(build.status, 0, `Astro build failed.\nSTDOUT:\n${build.stdout}\nSTDERR:\n${build.stderr}`);
  return { outDir, cleanup() { rmSync(outDir, { force: true, recursive: true }); } };
};

const readAstroBundles = (outDir) => {
  const astroDir = resolve(outDir, "_astro");
  return readdirSync(astroDir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => readFileSync(resolve(astroDir, name), "utf8"))
    .join("\n");
};
```

Then append this test:

```js
test("Contact modal ships globally with a localized form and a #contact trigger", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const homeHtml = readFileSync(resolve(build.outDir, "index.html"), "utf8");
    const advisoryHtml = readFileSync(resolve(build.outDir, "advisory", "index.html"), "utf8");

    for (const [label, html] of [["homepage", homeHtml], ["interior", advisoryHtml]]) {
      assert.match(html, /id="contact-modal"[^>]*role="dialog"/, `expected the contact dialog on the ${label}`);
      assert.match(html, /name="name"/, `expected a name field on the ${label}`);
      assert.match(html, /type="email"[^>]*name="email"|name="email"[^>]*type="email"/, `expected an email field on the ${label}`);
      assert.match(html, /name="message"/, `expected a message field on the ${label}`);
      assert.match(html, /name="botcheck"/, `expected the honeypot field on the ${label}`);
      assert.match(html, /name="access_key"/, `expected the hidden access_key on the ${label}`);
      assert.match(html, /id="contact-i18n"/, `expected the i18n island on the ${label}`);
    }

    // i18n island carries all three locales
    const islandMatch = homeHtml.match(/<script type="application\/json" id="contact-i18n">([\s\S]*?)<\/script>/);
    assert.ok(islandMatch, "expected to find the contact i18n island JSON");
    const copy = JSON.parse(islandMatch[1]);
    assert.ok(copy.EN && copy.BR && copy.CN, "expected EN, BR, and CN copy in the island");
    assert.equal(typeof copy.EN.submitLabel, "string");

    // the trigger behavior ships in a bundled module script
    const bundles = readAstroBundles(build.outDir);
    assert.match(bundles, /a\[href\$="#contact"\]/, "expected the bundled script to wire the #contact trigger");
  } finally {
    build.cleanup();
  }
});
```

- [ ] **Step 2: Run it, verify it FAILS**

Run: `node --test --test-concurrency=1 --test-name-pattern="Contact modal ships globally" 2>&1 | tail -20`
Expected: FAIL (no `id="contact-modal"` in the built HTML yet).

- [ ] **Step 3: Create `src/styles/contact.css`**

```css
.contact-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(7, 11, 23, 0.62);
  backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.contact-overlay.is-open {
  opacity: 1;
  pointer-events: auto;
}

.contact-overlay[hidden] {
  display: none;
}

body.contact-modal-open {
  overflow: hidden;
}

.contact-dialog {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 40px 90px rgba(7, 11, 23, 0.4);
  padding: 32px;
  transform: translateY(8px);
  transition: transform 180ms ease;
}

.contact-overlay.is-open .contact-dialog {
  transform: translateY(0);
}

.contact-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.06);
  color: #0f172a;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: background 150ms ease;
}

.contact-close:hover {
  background: rgba(15, 23, 42, 0.12);
}

.contact-title {
  margin: 0 0 6px;
  font-family: "Outfit", "DM Sans", sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.contact-intro {
  margin: 0 0 20px;
  color: #475569;
  font-size: 0.95rem;
  line-height: 1.5;
}

.contact-field {
  display: block;
  margin-bottom: 14px;
}

.contact-field > span {
  display: block;
  margin-bottom: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
}

.contact-field input,
.contact-field textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid rgba(15, 23, 42, 0.14);
  border-radius: 12px;
  font: inherit;
  color: #0f172a;
  background: #f8fafc;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.contact-field input:focus,
.contact-field textarea:focus {
  outline: none;
  border-color: #ff3b00;
  box-shadow: 0 0 0 3px rgba(255, 59, 0, 0.16);
  background: #ffffff;
}

.contact-field textarea {
  min-height: 110px;
  resize: vertical;
}

.contact-honeypot {
  position: absolute !important;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.contact-status {
  min-height: 20px;
  margin: 4px 0 12px;
  font-size: 0.88rem;
}

.contact-status--error {
  color: #b42318;
}

.contact-btn {
  width: 100%;
  padding: 13px 20px;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  background: linear-gradient(135deg, #ff3b00 0%, #1d4ed8 100%);
  color: #ffffff;
  transition: transform 150ms ease, box-shadow 150ms ease, opacity 150ms ease;
}

.contact-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 30px rgba(29, 78, 216, 0.28);
}

.contact-btn:disabled {
  opacity: 0.7;
  cursor: progress;
  transform: none;
}

.contact-privacy {
  margin: 14px 0 0;
  font-size: 0.78rem;
  color: #94a3b8;
  text-align: center;
}

.contact-success {
  display: none;
  text-align: center;
  padding: 12px 0;
}

.contact-overlay.is-success .contact-form {
  display: none;
}

.contact-overlay.is-success .contact-success {
  display: block;
}

.contact-success h2 {
  margin: 0 0 8px;
  font-family: "Outfit", "DM Sans", sans-serif;
  font-size: 1.4rem;
  color: #0f172a;
}

.contact-success p {
  margin: 0 0 20px;
  color: #475569;
}

@media (max-width: 520px) {
  .contact-dialog {
    padding: 24px 20px;
    border-radius: 20px;
  }
}
```

- [ ] **Step 4: Create `src/components/contact/ContactModal.astro`**

```astro
---
import { CONTACT_ENDPOINT, CONTACT_ACCESS_KEY, CONTACT_SUBJECT, HCAPTCHA_SITE_KEY } from "../../lib/contact/config";
import { CONTACT_COPY } from "../../lib/contact/i18n";

const copy = CONTACT_COPY;
const hcaptchaEnabled = HCAPTCHA_SITE_KEY.length > 0;
---

<div class="contact-overlay" id="contact-modal" role="dialog" aria-modal="true" aria-labelledby="contact-title" hidden>
  <div class="contact-dialog">
    <button type="button" class="contact-close" data-contact-close data-contact-i18n-aria="closeLabel" aria-label={copy.EN.closeLabel}>
      <span aria-hidden="true">&times;</span>
    </button>

    <div class="contact-success" data-contact-success>
      <h2 data-contact-i18n="successTitle">{copy.EN.successTitle}</h2>
      <p data-contact-i18n="successBody">{copy.EN.successBody}</p>
      <button type="button" class="contact-btn" data-contact-close data-contact-i18n="closeLabel">{copy.EN.closeLabel}</button>
    </div>

    <form class="contact-form" id="contact-form" data-endpoint={CONTACT_ENDPOINT} novalidate>
      <h2 class="contact-title" id="contact-title" data-contact-i18n="title">{copy.EN.title}</h2>
      <p class="contact-intro" data-contact-i18n="intro">{copy.EN.intro}</p>

      <input type="checkbox" class="contact-honeypot" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true" />
      <input type="hidden" name="access_key" value={CONTACT_ACCESS_KEY} />
      <input type="hidden" name="subject" value={CONTACT_SUBJECT} />
      <input type="hidden" name="from_name" value="" />
      <input type="hidden" name="context" value="" />

      <label class="contact-field">
        <span data-contact-i18n="nameLabel">{copy.EN.nameLabel}</span>
        <input type="text" name="name" required data-contact-i18n-placeholder="namePlaceholder" placeholder={copy.EN.namePlaceholder} />
      </label>

      <label class="contact-field">
        <span data-contact-i18n="emailLabel">{copy.EN.emailLabel}</span>
        <input type="email" name="email" required data-contact-i18n-placeholder="emailPlaceholder" placeholder={copy.EN.emailPlaceholder} />
      </label>

      <label class="contact-field">
        <span data-contact-i18n="companyLabel">{copy.EN.companyLabel}</span>
        <input type="text" name="company" data-contact-i18n-placeholder="companyPlaceholder" placeholder={copy.EN.companyPlaceholder} />
      </label>

      <label class="contact-field">
        <span data-contact-i18n="messageLabel">{copy.EN.messageLabel}</span>
        <textarea name="message" required data-contact-i18n-placeholder="messagePlaceholder" placeholder={copy.EN.messagePlaceholder}></textarea>
      </label>

      <div class="contact-status" data-contact-status role="alert" aria-live="polite"></div>

      {hcaptchaEnabled && (
        <div class="h-captcha" data-captcha data-sitekey={HCAPTCHA_SITE_KEY}></div>
      )}

      <button type="submit" class="contact-btn" data-contact-submit data-contact-i18n="submitLabel">{copy.EN.submitLabel}</button>
      <p class="contact-privacy" data-contact-i18n="privacyNote">{copy.EN.privacyNote}</p>
    </form>
  </div>
</div>

{hcaptchaEnabled && <script is:inline src="https://js.hcaptcha.com/1/api.js" async defer></script>}

<script type="application/json" id="contact-i18n" set:html={JSON.stringify(copy)}></script>

<script>
  import { submitContact } from "../../lib/contact/submit.mjs";

  const modal = document.getElementById("contact-modal");
  if (modal) {
    const dialog = modal.querySelector(".contact-dialog");
    const form = modal.querySelector("#contact-form");
    const endpoint = form.dataset.endpoint;
    const statusEl = modal.querySelector("[data-contact-status]");
    const submitBtn = form.querySelector("[data-contact-submit]");
    const contextField = form.querySelector('input[name="context"]');
    const fromNameField = form.querySelector('input[name="from_name"]');
    let lastTrigger = null;

    const island = document.getElementById("contact-i18n");
    const copy = island ? JSON.parse(island.textContent || "{}") : {};
    const validLang = (code) => (copy[code] ? code : "EN");
    const currentLang = () => validLang(window.localStorage.getItem("preferredLanguage") || "EN");
    const langCopy = () => copy[currentLang()] || copy.EN || {};

    const applyLang = (code) => {
      const c = copy[validLang(code)];
      if (!c) return;
      modal.querySelectorAll("[data-contact-i18n]").forEach((el) => {
        const key = el.getAttribute("data-contact-i18n");
        if (key && typeof c[key] === "string") el.textContent = c[key];
      });
      modal.querySelectorAll("[data-contact-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-contact-i18n-placeholder");
        if (key && typeof c[key] === "string") el.setAttribute("placeholder", c[key]);
      });
      modal.querySelectorAll("[data-contact-i18n-aria]").forEach((el) => {
        const key = el.getAttribute("data-contact-i18n-aria");
        if (key && typeof c[key] === "string") el.setAttribute("aria-label", c[key]);
      });
    };

    applyLang(currentLang());
    document.querySelectorAll("[data-lang-option]").forEach((opt) => {
      opt.addEventListener("click", () => {
        window.setTimeout(() => applyLang(opt.getAttribute("data-lang-option") || currentLang()), 0);
      });
    });

    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const resetStatus = () => {
      modal.classList.remove("is-success");
      if (statusEl) { statusEl.textContent = ""; statusEl.className = "contact-status"; }
    };

    const open = (trigger, context) => {
      lastTrigger = trigger || null;
      if (contextField) contextField.value = context || window.location.pathname;
      resetStatus();
      modal.removeAttribute("hidden");
      modal.classList.add("is-open");
      document.body.classList.add("contact-modal-open");
      const firstField = form.querySelector('input[name="name"]');
      if (firstField) firstField.focus();
    };

    const close = () => {
      modal.classList.remove("is-open");
      modal.setAttribute("hidden", "");
      document.body.classList.remove("contact-modal-open");
      if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    };

    const setStatus = (type, message) => {
      if (!statusEl) return;
      statusEl.textContent = message || "";
      statusEl.className = `contact-status contact-status--${type}`;
    };

    const showSuccess = () => {
      const c = langCopy();
      modal.classList.add("is-success");
      setStatus("success", c.successBody || "");
    };

    document.addEventListener("click", (event) => {
      const target = event.target;
      const link = target instanceof Element ? target.closest('a[href$="#contact"]') : null;
      if (!link) return;
      event.preventDefault();
      const label = (link.textContent || "").trim().replace(/\s+/g, " ");
      open(link, `${window.location.pathname} — ${label}`);
    });

    modal.querySelectorAll("[data-contact-close]").forEach((btn) => btn.addEventListener("click", close));
    modal.addEventListener("click", (event) => { if (event.target === modal) close(); });
    document.addEventListener("keydown", (event) => {
      if (!modal.classList.contains("is-open")) return;
      if (event.key === "Escape") { close(); return; }
      if (event.key === "Tab") {
        const items = Array.from(dialog.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (items.length === 0) return;
        const firstItem = items[0];
        const lastItem = items[items.length - 1];
        if (event.shiftKey && document.activeElement === firstItem) { event.preventDefault(); lastItem.focus(); }
        else if (!event.shiftKey && document.activeElement === lastItem) { event.preventDefault(); firstItem.focus(); }
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const c = langCopy();
      const data = Object.fromEntries(new FormData(form).entries());

      if (data.botcheck) { showSuccess(); form.reset(); return; }

      const name = String(data.name || "").trim();
      const email = String(data.email || "").trim();
      const message = String(data.message || "").trim();
      if (!name || !email || !message) { setStatus("error", c.requiredError); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setStatus("error", c.emailError); return; }

      if (fromNameField) fromNameField.value = name;
      const payload = { ...data, from_name: name };

      const originalLabel = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = c.sendingLabel;
      setStatus("pending", "");

      const result = await submitContact(endpoint, payload);

      submitBtn.disabled = false;
      submitBtn.textContent = originalLabel;

      if (result.ok) { showSuccess(); form.reset(); }
      else { setStatus("error", c.errorBody); }
    });
  }
</script>
```

- [ ] **Step 5: Inject the modal globally in `src/layouts/Layout.astro`**

Add to the frontmatter (after the `const { ... } = Astro.props;` block):

```ts
import ContactModal from "../components/contact/ContactModal.astro";
import "../styles/contact.css";
```

In the body, change:

```astro
  <body class={`antialiased ${bodyClass}`.trim()}>
    <slot />
  </body>
```

to:

```astro
  <body class={`antialiased ${bodyClass}`.trim()}>
    <slot />
    <ContactModal />
  </body>
```

- [ ] **Step 6: Run the build-and-assert test, verify it PASSES**

Run: `node --test --test-concurrency=1 --test-name-pattern="Contact modal ships globally" 2>&1 | tail -25`
Expected: PASS.

- [ ] **Step 7: Run the FULL suite (modal is now on every page — confirm nothing broke)**

Run: `npm test 2>&1 | tail -15`
Expected: all pass, 0 fail (existing 33 + 4 new = 37). If the only failure is a browser test timing out on a server port, re-run once.

- [ ] **Step 8: Commit**

```bash
git add src/components/contact src/styles/contact.css src/layouts/Layout.astro tests/contact-form.test.mjs
git commit -m "feat(contact): global contact modal with localized form and #contact trigger"
```

---

## Task 3: Env example, setup docs, final verification

**Files:**
- Create: `.env.example`
- Modify: `README.md` (or create `docs/contact-form-setup.md` if no README section fits)

- [ ] **Step 1: Create `.env.example`**

```bash
# Web3Forms access key for the contact form (public-safe; tied to the destination inbox).
# Create one at https://web3forms.com (enter the inbox email, confirm via the email link).
PUBLIC_WEB3FORMS_ACCESS_KEY=REPLACE_WITH_WEB3FORMS_ACCESS_KEY

# Optional: enable hCaptcha bot protection by setting an hCaptcha site key.
# Leave empty to rely on the built-in honeypot only.
PUBLIC_HCAPTCHA_SITE_KEY=
```

- [ ] **Step 2: Add a setup section to `README.md`**

Read `README.md` first. Append this section (if there is no `README.md`, create `docs/contact-form-setup.md` with the same content):

```markdown
## Contact form

The site-wide contact modal (opened by any "Contact us" / "Book a strategy call"
link) submits to [Web3Forms](https://web3forms.com), which emails the team.

To wire it up:

1. Create a Web3Forms access key for your destination inbox (free; confirm via the
   emailed link).
2. Set `PUBLIC_WEB3FORMS_ACCESS_KEY` in the build environment (see `.env.example`).
   The key is public-safe to ship in a static build.
3. (Optional) Set `PUBLIC_HCAPTCHA_SITE_KEY` to enable hCaptcha on top of the
   always-on honeypot.

Without a real key the modal still renders and validates, but live submissions
will return an error.
```

- [ ] **Step 3: Verify the build embeds env values (sanity check, no real key needed)**

Run: `npm run build 2>&1 | tail -4`
Expected: build passes (placeholder access key embedded).

- [ ] **Step 4: Full suite**

Run: `npm test 2>&1 | tail -8`
Expected: `pass 37`, `fail 0` (re-run once if a browser test hits a port timeout).

- [ ] **Step 5: Commit**

```bash
git add .env.example README.md
git commit -m "docs(contact): document Web3Forms setup and env vars"
```

---

## Notes for the implementer

- `submit.mjs` is intentionally a plain `.mjs` (no TS, no `import.meta.env`) so `node --test` can import it directly; the Astro client `<script>` imports it too (Vite resolves `.mjs`).
- `config.ts` is the only place that touches `import.meta.env`; it is imported in the `.astro` frontmatter, never in the unit test.
- Astro keeps `<script type="application/json">` islands inline in the HTML (like the existing `#localized-content`), so the i18n island is assertable; the behavior `<script>` is bundled into `/_astro/*.js`, so the trigger assertion scans those bundles.
- Known baseline LSP diagnostics out of scope: `import.meta.env` typing in `config.ts` may warn if Astro env types aren't picked up by the editor — ignore (it compiles under Astro/Vite). Do not add `@types/node`-style fixes.
- The modal lives in `Layout.astro`, which both `index.astro` (homepage) and every interior page use, so it is global with a single injection point.
- Honeypot (`botcheck`) is the default bot protection; hCaptcha markup/script render only when `PUBLIC_HCAPTCHA_SITE_KEY` is set and are otherwise fully absent.

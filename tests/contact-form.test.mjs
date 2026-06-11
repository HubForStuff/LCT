import test from "node:test";
import assert from "node:assert/strict";

import { submitContact } from "../src/lib/contact/submit.mjs";
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
  // Include extracted _astro/*.js bundles
  const astroDir = resolve(outDir, "_astro");
  const bundleJs = readdirSync(astroDir)
    .filter((name) => name.endsWith(".js"))
    .map((name) => readFileSync(resolve(astroDir, name), "utf8"))
    .join("\n");
  // Also include inline <script type="module"> blocks from the home page,
  // because Astro inlines layout scripts rather than extracting them to _astro/
  const homeHtml = readFileSync(resolve(outDir, "index.html"), "utf8");
  const inlineScripts = [...homeHtml.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
    .map((m) => m[1])
    .join("\n");
  return bundleJs + "\n" + inlineScripts;
};

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

test("Contact modal ships globally with a localized form and a #contact trigger", { concurrency: false }, () => {
  const build = buildSite();

  try {
    const homeHtml = readFileSync(resolve(build.outDir, "index.html"), "utf8");
    // advisory only has [slug].astro routes; use pre-registration as the interior-page check
    const advisoryHtml = readFileSync(resolve(build.outDir, "pre-registration", "index.html"), "utf8");

    for (const [label, html] of [["homepage", homeHtml], ["interior", advisoryHtml]]) {
      assert.match(html, /id="contact-modal"[^>]*role="dialog"/, `expected the contact dialog on the ${label}`);
      assert.match(html, /name="name"/, `expected a name field on the ${label}`);
      assert.match(html, /type="email"[^>]*name="email"|name="email"[^>]*type="email"/, `expected an email field on the ${label}`);
      assert.match(html, /name="message"/, `expected a message field on the ${label}`);
      assert.match(html, /name="botcheck"/, `expected the honeypot field on the ${label}`);
      assert.match(html, /name="access_key"/, `expected the hidden access_key on the ${label}`);
      assert.match(html, /id="contact-i18n"/, `expected the i18n island on the ${label}`);
    }

    const islandMatch = homeHtml.match(/<script type="application\/json" id="contact-i18n">([\s\S]*?)<\/script>/);
    assert.ok(islandMatch, "expected to find the contact i18n island JSON");
    const copy = JSON.parse(islandMatch[1]);
    assert.ok(copy.EN && copy.BR && copy.CN, "expected EN, BR, and CN copy in the island");
    assert.equal(typeof copy.EN.submitLabel, "string");

    const bundles = readAstroBundles(build.outDir);
    assert.match(bundles, /a\[href\$="#contact"\]/, "expected the bundled script to wire the #contact trigger");
  } finally {
    build.cleanup();
  }
});

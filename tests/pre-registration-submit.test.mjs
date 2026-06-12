// tests/pre-registration-submit.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { submitPreRegistration } from "../src/lib/pre-registration/submit.mjs";

function fakeFetch(response, capture) {
  return async (url, init) => {
    if (capture) { capture.url = url; capture.init = init; }
    return response;
  };
}
const jsonResponse = (ok, body) => ({ ok, status: ok ? 200 : 500, json: async () => body });

test("returns ok when Apps Script replies { ok: true }", async () => {
  const capture = {};
  const fd = new FormData();
  fd.append("projectName", "Acme");
  const result = await submitPreRegistration("https://script/exec", fd, fakeFetch(jsonResponse(true, { ok: true }), capture));
  assert.equal(result.ok, true);
  assert.equal(capture.url, "https://script/exec");
  assert.equal(capture.init.method, "POST");
  assert.ok(capture.init.body instanceof FormData, "sends FormData (no JSON Content-Type → no preflight)");
  assert.equal(capture.init.headers, undefined, "must not set Content-Type so the browser sets multipart boundary");
});

test("returns error when Apps Script replies { ok: false }", async () => {
  const result = await submitPreRegistration("https://script/exec", new FormData(), fakeFetch(jsonResponse(true, { ok: false, error: "bad" })));
  assert.equal(result.ok, false);
  assert.equal(result.error, "bad");
});

test("returns error on non-OK HTTP status", async () => {
  const result = await submitPreRegistration("https://script/exec", new FormData(), fakeFetch(jsonResponse(false, {})));
  assert.equal(result.ok, false);
  assert.match(result.error, /500/);
});

test("returns error on network throw", async () => {
  const throwing = async () => { throw new Error("Network down"); };
  const result = await submitPreRegistration("https://script/exec", new FormData(), throwing);
  assert.equal(result.ok, false);
  assert.equal(result.error, "Network down");
});

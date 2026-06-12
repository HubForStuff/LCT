// tests/pre-registration-files.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateFileSizes, fileToBase64, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from "../src/lib/pre-registration/files.mjs";

test("accepts files within caps", () => {
  const result = validateFileSizes([{ name: "deck.pdf", size: 5_000_000 }, { name: "extra.pdf", size: 1_000_000 }]);
  assert.equal(result.ok, true);
});

test("rejects a single file over the per-file cap and names it", () => {
  const result = validateFileSizes([{ name: "huge.pptx", size: MAX_FILE_BYTES + 1 }]);
  assert.equal(result.ok, false);
  assert.match(result.error, /huge\.pptx/);
});

test("rejects when total exceeds the total cap", () => {
  const half = Math.ceil(MAX_TOTAL_BYTES / 2) + 1;
  const result = validateFileSizes([{ name: "a.pdf", size: half }, { name: "b.pdf", size: half }]);
  assert.equal(result.ok, false);
  assert.match(result.error, /total/i);
});

test("ignores empty/absent file slots", () => {
  assert.equal(validateFileSizes([{ name: "", size: 0 }]).ok, true);
  assert.equal(validateFileSizes([]).ok, true);
});

test("fileToBase64 encodes bytes via an injected reader", async () => {
  // Fake File + FileReader producing a data URL for the bytes "hi"
  const fakeFile = { name: "x.txt", size: 2 };
  class FakeReader {
    readAsDataURL() { this.result = "data:text/plain;base64,aGk="; queueMicrotask(() => this.onload()); }
  }
  const b64 = await fileToBase64(fakeFile, () => new FakeReader());
  assert.equal(b64, "aGk=");
});

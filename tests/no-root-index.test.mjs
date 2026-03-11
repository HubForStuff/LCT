import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const rootIndexPath = resolve(testDir, "..", "index.html");

test("repository root does not contain a standalone index.html", () => {
  assert.equal(
    existsSync(rootIndexPath),
    false,
    `Unexpected root index.html at ${rootIndexPath}; it shadows the Astro build when the project root is served.`,
  );
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

async function allHtml(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await allHtml(p)));
    else if (entry.name.endsWith(".html")) out.push(p);
  }
  return out;
}

test("network routes are not emitted", async () => {
  const files = await allHtml("dist");
  const network = files.filter((f) => f.includes("/network/"));
  assert.deepEqual(network, [], "no /network/ routes should be built");
});

test("nothing links to network", async () => {
  for (const file of await allHtml("dist")) {
    const html = await readFile(file, "utf8");
    assert.doesNotMatch(html, /href="\/network\//, `${file} still links to /network/`);
  }
});

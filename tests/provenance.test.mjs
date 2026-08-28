import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

// @claim:artwork-provenance
const [design, prompt] = await Promise.all([
  readFile(".factory/design.md", "utf8"),
  readFile("assets/src/kitchen-table-hero.json", "utf8"),
]);
await stat("assets/src/kitchen-table-hero.png");
assert.match(design, /Generated with the factory image deployment/);
assert.match(design, /Original for this product/);
assert.match(prompt, /watermark/i);
console.log("Artwork provenance claim passed");

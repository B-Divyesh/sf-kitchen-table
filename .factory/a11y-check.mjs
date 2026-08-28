import { chromium } from "/usr/lib/node_modules/playwright/index.mjs";
import { readFile, writeFile, mkdir } from "node:fs/promises";

const origin = process.argv[2] || "http://127.0.0.1:8080";
const axeSource = await readFile("node_modules/axe-core/axe.min.js", "utf8");
await mkdir(".factory/evidence", { recursive: true });
const browser = await chromium.launch();
const context = await browser.newContext({
  bypassCSP: true,
  viewport: { width: 390, height: 844 },
});
const results = [];

async function audit(page, name) {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () =>
    globalThis.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    }),
  );
  const serious = result.violations.filter((v) =>
    ["serious", "critical"].includes(v.impact),
  );
  results.push({ name, violations: result.violations, serious });
  if (serious.length) throw new Error(`${name}: ${serious.map((v) => v.id).join(", ")}`);
}

async function room(game) {
  const created = await fetch(`${origin}/api/rooms`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ game, nickname: "Alex" }),
  }).then((r) => r.json());
  await fetch(`${origin}/api/rooms/${created.room.code}/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ nickname: "Sam" }),
  });
  await fetch(`${origin}/api/rooms/${created.room.code}/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ token: created.player_token }),
  });
  return { code: created.room.code, token: created.player_token };
}

const home = await context.newPage();
await home.goto(origin, { waitUntil: "networkidle" });
await audit(home, "home-mobile");

for (const [name, path] of [["demo-dots-mobile", "/demo"], ["demo-race-mobile", "/demo?game=race"], ["demo-dice-mobile", "/demo?game=dice"]]) {
  const page = await context.newPage();
  await page.goto(`${origin}${path}`, { waitUntil: "networkidle" });
  await audit(page, name);
  await page.close();
}

for (const game of ["race", "dots", "dice"]) {
  const seat = await room(game);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(origin);
  await page.evaluate(
    ([code, token]) => localStorage.setItem(`kt:${code}:seat`, token),
    [seat.code, seat.token],
  );
  await page.goto(`${origin}/room/${seat.code}`, { waitUntil: "networkidle" });
  await audit(page, `${game}-mobile`);
  const primary = page.locator('[data-action="roll"], [data-action="line"]:not([disabled])').first();
  await primary.click();
  await page.waitForTimeout(300);
  if (errors.length) throw new Error(`${game}: ${errors.join("; ")}`);
  await page.screenshot({ path: `.factory/evidence/${game}-mobile.png`, fullPage: true });
  await page.close();
}

await writeFile(".factory/evidence/axe.json", JSON.stringify(results, null, 2));
console.log(`axe: ${results.length} screens, 0 serious/critical violations`);
await context.close();
await browser.close();

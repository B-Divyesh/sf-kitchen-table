import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  // Each fresh-browser claim gets a distinct ingress client identity. This
  // keeps the production rate-limit check from turning unrelated claim flows
  // into one simulated abusive client.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": testInfo.testId });
});

test("@claim:demo-isolated opens a seeded game without room API writes", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.method() + " " + new URL(request.url()).pathname));
  await page.goto("/demo");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Make a Square" })).toBeVisible();
  await expect(page.getByText("Alex’s turn")).toBeVisible();
  expect(requests.filter(item => item.includes("/api/rooms"))).toEqual([]);
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys.some(key => key.startsWith("demo:"))).toBeTruthy();
  expect(keys.some(key => key.startsWith("kt:"))).toBeFalsy();
  await page.goto("/?demo=1");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith("demo:")))).toBeFalsy();
});

test("@claim:demo-in-progress opens two named players with claimed squares and an open move", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(new URL(request.url()).pathname));
  await page.goto("/?demo=1");
  await expect(page.getByText("Alex", { exact: true })).toBeVisible();
  await expect(page.getByText("Ravi", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Squares claimed" })).toBeVisible();
  await expect(page.locator(".demo-line")).toHaveCount(6);
  await expect(page.locator("[data-demo-line]")).toHaveCount(3);
  expect(requests.some(path => path.startsWith("/api/rooms"))).toBeFalsy();
  expect(await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith("kt:")))).toBeFalsy();
});

test("@claim:demo-reset clears changed sample state", async ({ page }) => {
  await page.goto("/demo");
  const initial = await page.locator("[data-demo-line]").count();
  await page.locator("[data-demo-line]").first().click();
  await expect(page.locator("[data-demo-line]")).toHaveCount(initial - 1);
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator("[data-demo-line]")).toHaveCount(initial);
});

test("@claim:demo-offline keeps the open sample board usable offline", async ({ page, context }) => {
  await page.goto("/demo");
  await context.setOffline(true);
  await page.locator("[data-demo-line]").first().click();
  await expect(page.getByRole("heading", { name: "Make a Square" })).toBeVisible();
  await expect(page.getByText("Ravi’s turn")).toBeVisible();
});

test("@claim:no-account enters the sample without identity setup", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await expect(page.locator('input[type="email"], input[type="password"], [name*="account" i], [name*="login" i]')).toHaveCount(0);
});

test("@claim:no-ads makes only same-origin requests and shows no ad surface", async ({ page, context }) => {
  const origins = new Set<string>();
  page.on("request", request => origins.add(new URL(request.url()).origin));
  await page.goto("/demo");
  await expect(page.locator('[class*="advert" i], iframe, [data-ad]')).toHaveCount(0);
  expect([...origins]).toEqual([new URL(page.url()).origin]);
  expect(await context.pages()).toHaveLength(1);
});

test("@claim:three-games lists the three playable game choices", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("link", { name: "Games" }).click();
  await expect(page.getByRole("heading", { name: "Choose from three family games" })).toBeVisible();
  for (const game of ["Lantern Race", "Make a Square", "High Five"]) {
    await expect(page.getByRole("button", { name: "Choose " + game })).toBeVisible();
  }
});

test("@claim:room-link-resume shares an isolated sample board between phones and restores it", async ({ browser }) => {
  const hostContext = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": "room-host" } });
  const guestContext = await browser.newContext({ extraHTTPHeaders: { "x-forwarded-for": "room-guest" } });
  const host = await hostContext.newPage();
  const productionRequests: string[] = [];
  host.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/rooms")) productionRequests.push(request.url()); });
  await host.goto("/demo");
  await host.getByRole("button", { name: "Create sample room link" }).click();
  await host.waitForURL("**/demo/*");
  const guestUrl = await host.getByRole("link", { name: "Open Ravi’s sample seat" }).getAttribute("href");
  expect(guestUrl).toBeTruthy();

  const guest = await guestContext.newPage();
  guest.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/rooms")) productionRequests.push(request.url()); });
  await guest.goto(guestUrl!);
  await expect(guest.getByText("Alex", { exact: true })).toBeVisible();
  await expect(guest.getByText("Ravi", { exact: true })).toBeVisible();
  const before = await guest.locator(".demo-line").count();
  await host.locator("[data-demo-line]:not([disabled])").first().click();
  await guest.reload();
  await expect(guest.locator(".demo-line")).toHaveCount(before + 1);
  expect(productionRequests).toEqual([]);
  for (const context of [hostContext, guestContext]) {
    expect(await context.pages()[0].evaluate(() => Object.keys(localStorage).some(key => key.startsWith("kt:")))).toBeFalsy();
  }
  await hostContext.close();
  await guestContext.close();
});

test("@claim:no-strangers-or-payments has no external traffic or prohibited surfaces", async ({ page }) => {
  const origins = new Set<string>();
  page.on("request", request => origins.add(new URL(request.url()).origin));
  await page.goto("/demo");
  expect([...origins]).toEqual([new URL(page.url()).origin]);
  await expect(page.locator('[name*="chat" i], [class*="chat" i], [class*="payment" i], [class*="checkout" i], [class*="match" i], [class*="analytics" i], [data-payment], [data-prize], [data-gambling]')).toHaveCount(0);
});

test("@claim:storage-disclosure labels the stored room fields before room creation", async ({ page }) => {
  await page.goto("/demo");
  await expect(page.getByText("Demo moves and random demo seat tokens stay in isolated demo storage.", { exact: false })).toBeVisible();
  await expect(page.getByText("In real rooms, we store your nickname, game moves, room code, and a random seat token.")).toBeVisible();
  await expect(page.getByText("Your browser stores the token so you can return to your seat.")).toBeVisible();
});

test("@claim:seat-token-private keeps the return token out of a public room response", async ({ page }) => {
  const productionRequests: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/rooms")) productionRequests.push(request.url()); });
  await page.goto("/demo");
  await page.getByRole("button", { name: "Create sample room link" }).click();
  await page.waitForURL("**/demo/*");
  const code = new URL(page.url()).pathname.split("/").pop()!;
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toContain(`demo:kitchen-table:seat:${code}`);
  expect(keys.some(key => key.startsWith("kt:"))).toBeFalsy();
  const publicRoom = await page.request.get(`/api/demo/rooms/${code}`);
  expect(publicRoom.ok()).toBeTruthy();
  const body = await publicRoom.text();
  expect(body).not.toContain("token");
  expect(productionRequests).toEqual([]);
});

test("@claim:deletion-contact shows a direct deletion contact", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("link", { name: "Privacy" }).first().click();
  await expect(page.getByRole("link", { name: "privacy@sociobot.in" })).toHaveAttribute("href", "mailto:privacy@sociobot.in");
});

test("@claim:server-health-and-limits returns a build identity and rejects a burst", async ({ page }) => {
  await page.goto("/demo");
  const health = await page.request.get("/health");
  expect(health.ok()).toBeTruthy();
  const status = await health.json();
  expect(status.status).toBe("ok");
  expect(typeof status.build_sha).toBe("string");
  const responses = await page.evaluate(async () => Promise.all(
    Array.from({ length: 41 }, () => fetch("/privacy", { headers: { "x-forwarded-for": "198.51.100.77" } }).then(async response => ({ status: response.status, retryAfter: response.headers.get("retry-after") }))),
  ));
  const limited = responses.find(response => response.status === 429);
  expect(limited?.status).toBe(429);
  expect(limited?.retryAfter).toBe("1");
});

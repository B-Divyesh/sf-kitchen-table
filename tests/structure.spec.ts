import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `structure-${testInfo.workerIndex}-${testInfo.retry}-${testInfo.title}` });
});

test("desktop first screen contains the full sample action and trust facts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const items = [
    page.getByRole("link", { name: "Try it with sample data" }),
    page.getByText("Opens a two-player game already in progress."),
    page.getByText("No ads", { exact: true }),
    page.getByText("No account", { exact: true }),
    page.getByText("Return to the same room later", { exact: true }),
  ];
  for (const item of items) {
    const box = await item.boundingBox();
    expect(box, "first-screen item has a box").not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(900);
  }
});

test("phone first screen contains the sample action and all three trust facts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const item of [
    page.getByRole("link", { name: "Try it with sample data" }),
    page.getByText("Opens a two-player game already in progress."),
    page.getByText("No ads", { exact: true }),
    page.getByText("No account", { exact: true }),
    page.getByText("Return to the same room later", { exact: true }),
  ]) {
    const box = await item.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  }
});

test("mobile header and footer links meet the 44px touch-target baseline", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  for (const link of await page.locator(".site-header a, footer a").all()) {
    const box = await link.boundingBox();
    expect(box, await link.innerText()).not.toBeNull();
    expect(box!.width, await link.innerText()).toBeGreaterThanOrEqual(44);
    expect(box!.height, await link.innerText()).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("browser Back restores route title, announcement, scroll, and h1 focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Privacy" }).first().click();
  await expect(page).toHaveTitle("Privacy — Kitchen Table");
  await expect(page.locator("h1")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle("Kitchen Table — family games on phones");
  await expect(page.locator("h1")).toBeFocused();
  await expect(page.locator("#route-status")).toContainText("Play family games on separate phones");
  expect(await page.evaluate(() => scrollY)).toBe(0);
});

test("shared demo settles with focus and an announcement on both board and recovery routes", async ({ page }) => {
  await page.goto("/demo");
  await page.getByRole("button", { name: "Create sample room link" }).click();
  await page.waitForURL("**/demo/*");
  await expect(page.getByRole("heading", { name: "Make a Square" })).toBeFocused();
  await expect(page.locator("#route-status")).toContainText("Demo — Kitchen Table");

  await page.evaluate(() => {
    history.pushState({}, "", "/demo/ZZZZZZ");
    dispatchEvent(new PopStateEvent("popstate"));
  });
  await expect(page.getByRole("heading", { name: "Make a new sample room" })).toBeFocused();
  await expect(page.locator("#route-status")).toContainText("Make a new sample room");
});

test("routes expose unique metadata and a useful HTTP 404", async ({ page, request }) => {
  for (const [path, title] of [["/", "Kitchen Table — family games on phones"], ["/demo", "Demo — Kitchen Table"], ["/privacy", "Privacy — Kitchen Table"], ["/terms", "Terms — Kitchen Table"]]) {
    await page.goto(path);
    await expect(page).toHaveTitle(title);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /kitchen-table\.sociobot\.in/);
  }
  const response = await request.get("/not-a-real-route");
  expect(response.status()).toBe(404);
  await page.goto("/not-a-real-route");
  await expect(page).toHaveTitle("Page not found — Kitchen Table");
  await expect(page.getByRole("heading", { name: "This table is not here" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Choose a game" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Join a room" })).toBeVisible();
});

test("room routes keep Kitchen Table first in their document title", async ({ page }) => {
  await page.goto("/room/ABC123");
  await expect(page).toHaveTitle("Kitchen Table — shared room ABC123");
  await expect(page.getByRole("heading", { name: "We couldn’t find that room" })).toBeVisible();
});

test("skip link moves keyboard focus to main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to the game" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

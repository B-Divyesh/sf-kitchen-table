import { expect, test } from "@playwright/test";

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
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Choose from three family games" })).toBeVisible();
  for (const game of ["Lantern Race", "Make a Square", "High Five"]) {
    await expect(page.getByRole("button", { name: "Choose " + game })).toBeVisible();
  }
});

test("@claim:storage-disclosure labels the stored room fields before room creation", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Choose Make a Square" }).click();
  await expect(page.getByText("We store your nickname, game moves, room code, and a random seat token.")).toBeVisible();
  await expect(page.getByText("Your browser stores the token so you can return to your seat.")).toBeVisible();
});

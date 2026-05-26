import { test, expect } from "@playwright/test";

test.describe("パンくずリスト", () => {
  test("サブページで表示され、正しいリンクを持つ", async ({ page }) => {
    await page.goto("/player-directory/2026");

    const nav = page.locator('nav[aria-label="パンくずリスト"]');
    await expect(nav).toBeVisible();

    const topLink = nav.getByRole("link", { name: "トップ" });
    await expect(topLink).toBeVisible();
    await expect(topLink).toHaveAttribute("href", "/");

    await expect(nav.getByText("選手名鑑")).toBeVisible();
    await expect(nav.getByText("2026年")).toBeVisible();
  });

  test("トップリンクからトップページに戻れる", async ({ page }) => {
    await page.goto("/number-drill/2026");

    const nav = page.locator('nav[aria-label="パンくずリスト"]');
    await nav.getByRole("link", { name: "トップ" }).click();
    await page.waitForURL("**/");

    await expect(page.getByRole("heading", { name: "Baystars Drill" })).toBeVisible();
  });

  test("トップページではパンくずリストが表示されない", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator('nav[aria-label="パンくずリスト"]')).not.toBeAttached();
  });
});

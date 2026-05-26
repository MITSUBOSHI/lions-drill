import { test, expect } from "@playwright/test";

test.describe("選手名鑑", () => {
  test("選手一覧テーブルが表示される", async ({ page }) => {
    await page.goto("/player-directory/2026");

    await expect(page.getByRole("heading", { name: "選手名鑑" })).toBeVisible();

    // テーブルヘッダー
    await expect(page.getByRole("columnheader", { name: /背番号/ })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /名前/ })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: /生年月日/ })).toBeVisible();

    // 選手データが表示されている
    await expect(page.getByText("東 克樹")).toBeVisible();
  });

  test("背番号でソートできる", async ({ page }) => {
    await page.goto("/player-directory/2026");

    const sortButton = page.getByRole("button", { name: "背番号でソート" });
    await sortButton.click();

    const header = page.getByRole("columnheader", { name: /背番号/ });
    await expect(header).toHaveAttribute("aria-sort", "ascending");

    await sortButton.click();
    await expect(header).toHaveAttribute("aria-sort", "descending");
  });

  test("ソートカラムを切り替えるとソート順がリセットされる", async ({ page }) => {
    await page.goto("/player-directory/2026");

    // 背番号で昇順ソート
    await page.getByRole("button", { name: "背番号でソート" }).click();
    await expect(page.getByRole("columnheader", { name: /背番号/ })).toHaveAttribute("aria-sort", "ascending");

    // 生年月日に切り替え → 昇順で始まる
    await page.getByRole("button", { name: "生年月日でソート" }).click();
    await expect(page.getByRole("columnheader", { name: /生年月日/ })).toHaveAttribute("aria-sort", "ascending");
    await expect(page.getByRole("columnheader", { name: /背番号/ })).toHaveAttribute("aria-sort", "none");
  });

  test("2020年の選手名鑑も表示できる", async ({ page }) => {
    await page.goto("/player-directory/2020");

    await expect(page.getByRole("heading", { name: "選手名鑑" })).toBeVisible();
    // テーブルに行がある（空ではない）
    const rows = page.getByRole("row");
    await expect(rows).not.toHaveCount(0);
  });
});

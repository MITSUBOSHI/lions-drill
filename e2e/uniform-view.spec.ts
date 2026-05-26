import { test, expect } from "@playwright/test";

test.describe("ユニフォームビュー", () => {
  test("ページが表示される", async ({ page }) => {
    await page.goto("/uniform-view/2026");

    await expect(page.getByRole("heading", { name: "ユニフォームビュー" })).toBeVisible();
    await expect(page.getByRole("img", { name: /ユニフォーム背面/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "前の選手" })).toBeVisible();
    await expect(page.getByRole("button", { name: "次の選手" })).toBeVisible();
    await expect(page.getByText("支配下のみ")).toBeVisible();
  });

  test("次の選手・前の選手で切替できる", async ({ page }) => {
    await page.goto("/uniform-view/2026");

    // 最初の選手の aria-label を取得
    const uniform = page.getByRole("img", { name: /ユニフォーム背面/ });
    const firstLabel = await uniform.getAttribute("aria-label");

    // 次の選手
    await page.getByRole("button", { name: "次の選手" }).click();
    const secondLabel = await uniform.getAttribute("aria-label");
    expect(firstLabel).not.toEqual(secondLabel);

    // 前の選手で戻る
    await page.getByRole("button", { name: "前の選手" }).click();
    const backLabel = await uniform.getAttribute("aria-label");
    expect(backLabel).toEqual(firstLabel);
  });

  test("URLパラメータ ?number=11 で背番号11の選手が表示される", async ({ page }) => {
    await page.goto("/uniform-view/2026?number=11");

    await expect(page.getByText("東 克樹")).toBeVisible();
  });

  test("URLコピーボタンが存在する", async ({ page }) => {
    await page.goto("/uniform-view/2026");

    await expect(page.getByRole("button", { name: "URLをコピー" })).toBeVisible();
  });
});

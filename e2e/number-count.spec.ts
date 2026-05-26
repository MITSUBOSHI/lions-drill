import { test, expect } from "@playwright/test";

test.describe("背番号タイマー", () => {
  test("ページが表示される", async ({ page }) => {
    await page.goto("/number-count/2026");

    await expect(page.getByRole("heading", { name: "背番号タイマー" })).toBeVisible();
    await expect(page.getByRole("img", { name: "ユニフォーム背面" })).toBeVisible();
    await expect(page.getByRole("button", { name: "再生" })).toBeEnabled();
    await expect(page.getByRole("button", { name: "リセット" })).toBeDisabled();
    await expect(page.getByText("1 / 30")).toBeVisible();
  });

  test("設定パネルの項目が表示される", async ({ page }) => {
    await page.goto("/number-count/2026");

    // 設定パネルを開く
    await page.getByText("設定").click();

    await expect(page.getByText("カウント数")).toBeVisible();
    await expect(page.getByText("方向")).toBeVisible();
    await expect(page.getByText("カウントアップ")).toBeVisible();
    await expect(page.getByText("カウントダウン")).toBeVisible();
    await expect(page.getByText("速度")).toBeVisible();
    await expect(page.getByText("ゆっくり (2秒)")).toBeVisible();
    await expect(page.getByText("ふつう (1秒)")).toBeVisible();
    await expect(page.getByText("はやい (0.5秒)")).toBeVisible();
    await expect(page.getByText("音声")).toBeVisible();
  });

  test("再生・停止・リセットの操作", async ({ page }) => {
    await page.goto("/number-count/2026");

    // 設定を開いて速度を「はやい」にする（テストの安定性のため）
    await page.getByText("設定").click();
    await page.getByText("はやい (0.5秒)").click();

    // 再生
    await page.getByRole("button", { name: "再生" }).click();

    // カウントが進むのを待つ
    await expect(page.getByText("1 / 30")).not.toBeVisible({ timeout: 5000 });

    // 停止
    await page.getByRole("button", { name: "停止" }).click();

    // 再生ボタンが再び表示される
    await expect(page.getByRole("button", { name: "再生" })).toBeVisible();

    // リセットが有効
    await expect(page.getByRole("button", { name: "リセット" })).toBeEnabled();

    // リセット
    await page.getByRole("button", { name: "リセット" }).click();

    // 初期値に戻る
    await expect(page.getByText("1 / 30")).toBeVisible();
    await expect(page.getByRole("button", { name: "リセット" })).toBeDisabled();
  });
});

import { test, expect } from "@playwright/test";

test.describe("背番号計算ドリル", () => {
  test("ページが表示され問題が出題される", async ({ page }) => {
    await page.goto("/number-drill/2026");

    await expect(page.getByRole("heading", { name: "背番号計算ドリル" })).toBeVisible();
    await expect(page.getByText("問題", { exact: false })).toBeVisible();

    // 入力フィールドと解答ボタン
    const input = page.getByTestId("number-input");
    await expect(input).toBeVisible();
    await expect(page.getByRole("button", { name: "解答する" })).toBeVisible();
    await expect(page.getByRole("button", { name: "再挑戦" })).toBeVisible();
  });

  test("未入力状態では解答ボタンが無効", async ({ page }) => {
    await page.goto("/number-drill/2026");

    await expect(page.getByRole("button", { name: "解答する" })).toBeDisabled();
  });

  test("解答を入力して結果が表示される", async ({ page }) => {
    await page.goto("/number-drill/2026");

    const input = page.getByTestId("number-input");
    await input.click();
    await input.pressSequentially("999");
    const answerBtn = page.getByRole("button", { name: "解答する" });
    await expect(answerBtn).toBeEnabled();
    await answerBtn.click();

    // 結果が表示される（Next.js route announcer も alert ロールを持つため filter で絞る）
    const result = page.getByRole("alert").filter({ hasText: /正解/ });
    await expect(result).toBeVisible();

    // 入力・解答ボタンが無効化
    await expect(input).toBeDisabled();
    await expect(page.getByRole("button", { name: "解答する" })).toBeDisabled();
  });

  test("再挑戦で新しい問題に切り替わる", async ({ page }) => {
    await page.goto("/number-drill/2026");

    // 解答する
    const input = page.getByTestId("number-input");
    await input.click();
    await input.pressSequentially("1");
    const answerBtn = page.getByRole("button", { name: "解答する" });
    await expect(answerBtn).toBeEnabled();
    await answerBtn.click();
    const result = page.getByRole("alert").filter({ hasText: /正解/ });
    await expect(result).toBeVisible();

    // 再挑戦
    await page.getByRole("button", { name: "再挑戦" }).click();

    // 結果がリセットされる
    await expect(result).not.toBeAttached();
    await expect(page.getByTestId("number-input")).not.toBeDisabled();
  });

  test("設定パネルに設定項目が表示される", async ({ page }) => {
    await page.goto("/number-drill/2026");

    // 設定パネルを開く
    await page.getByText("設定").click();

    await expect(page.getByText("対象選手")).toBeVisible();
    await expect(page.getByText("難易度")).toBeVisible();
    await expect(page.getByText(/使用する演算子/)).toBeVisible();
  });
});

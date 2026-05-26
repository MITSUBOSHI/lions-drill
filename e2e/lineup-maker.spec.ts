import { test, expect } from "@playwright/test";

test.describe("スタメン作成", () => {
  test("ページが表示される", async ({ page }) => {
    await page.goto("/lineup-maker/2026");

    await expect(page.getByRole("heading", { name: "スタメン作成" })).toBeVisible();
    await expect(page.getByText("スターティングメンバー")).toBeVisible();
    await expect(page.getByText("打順が設定されていません")).toBeVisible();
    await expect(page.getByText("投手選択")).toBeVisible();
    await expect(page.getByText("ポジション別選手設定")).toBeVisible();
  });

  test("ポジションに選手を割り当てて打順に追加できる", async ({ page }) => {
    await page.goto("/lineup-maker/2026");

    // 捕手の選手選択ボタンをクリック
    const catcherButton = page.getByRole("button", { name: "捕手の選手を選択" });
    await catcherButton.click();

    // ドロップダウンから選手を選択（最初の選手をクリック）
    const option = page.getByRole("option").first();
    await option.click();

    // 打順に追加
    await page.getByRole("button", { name: "打順に追加" }).click();

    // 打順が設定された
    await expect(page.getByText("打順が設定されていません")).not.toBeAttached();
    await expect(page.getByRole("button", { name: "打順を解除" })).toBeVisible();
  });

  test("リセットで全てクリアされる", async ({ page }) => {
    await page.goto("/lineup-maker/2026");

    // 捕手に選手を割り当て
    await page.getByRole("button", { name: "捕手の選手を選択" }).click();
    await page.getByRole("option").first().click();
    await page.getByRole("button", { name: "打順に追加" }).click();

    // リセット
    await page.getByRole("button", { name: "リセット" }).click();

    await expect(page.getByText("打順が設定されていません")).toBeVisible();
  });

  test("設定パネルの DH 切替", async ({ page }) => {
    await page.goto("/lineup-maker/2026");

    // 設定パネルを開く
    await page.getByRole("button", { name: "設定" }).click();

    // DH制をONにする
    await page.getByText("DHあり").click();

    // DHポジションが表示される
    await expect(page.getByRole("button", { name: /DHの選手を選択/ })).toBeVisible();
  });

  test("URLパラメータからラインナップが復元される", async ({ page }) => {
    // 背番号2=捕手・1番, 先発投手=背番号11
    await page.goto("/lineup-maker/2026?lineup=1c2&sp=11");

    // スターティングメンバーに行がある
    await expect(page.getByText("打順が設定されていません")).not.toBeAttached();

    // 先発投手が設定されている
    await expect(page.getByText("東 克樹").first()).toBeVisible();
  });
});

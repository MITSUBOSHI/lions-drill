import { test, expect } from "@playwright/test";
import team from "../src/config/team.config.json";

test.describe("応援歌", () => {
  test.skip(!team.features.cheerSongs, "cheer songs feature is disabled");
  test("ページが表示される", async ({ page }) => {
    await page.goto("/cheer-songs/2026");

    await expect(page.getByRole("heading", { name: "応援歌", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /年を選択/ })).toBeVisible();
    await expect(page.getByText(/ふりがな(ON|OFF)/)).toBeVisible();
  });

  test("カテゴリタブで絞り込みができる", async ({ page }) => {
    await page.goto("/cheer-songs/2026");

    // 投手共通タブ（デフォルト）
    await expect(page.getByText("右投手共通応援歌")).toBeVisible();

    // 野手個人タブ
    await page.getByRole("tab", { name: "野手個人" }).click();
    await expect(page.getByText("牧 秀悟")).toBeVisible();

    // その他共通タブ
    await page.getByRole("tab", { name: "その他共通" }).click();
    await expect(page.getByText("代打のテーマ")).toBeVisible();

    // 監督タブ
    await page.getByRole("tab", { name: "監督" }).click();
    await expect(page.getByText("相川 亮二 監督（ホーム）")).toBeVisible();
  });

  test("応援歌カードをクリックすると歌詞が表示される", async ({ page }) => {
    await page.goto("/cheer-songs/2026");

    // 野手個人タブへ
    await page.getByRole("tab", { name: "野手個人" }).click();

    // 牧のカードをクリック
    await page.getByText("牧 秀悟").click();

    // 歌詞が表示される
    await expect(page.getByText("オオオオーオオ　マキシュウゴ！")).toBeVisible();
  });

  test("リダイレクトページが最新年に遷移する", async ({ page }) => {
    await page.goto("/cheer-songs");

    await page.waitForURL("**/cheer-songs/2026");
    await expect(page.getByRole("heading", { name: "応援歌", exact: true })).toBeVisible();
  });
});

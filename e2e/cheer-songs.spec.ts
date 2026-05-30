import { test, expect } from "@playwright/test";
import team from "../src/config/team.config.json";
import indBatter from "../src/data/cheer-songs/individual-batter.json";

test.describe("応援歌", () => {
  test.skip(!team.features.cheerSongs, "cheer songs feature is disabled");

  test("ページが表示される", async ({ page }) => {
    await page.goto("/cheer-songs/2026");

    await expect(
      page.getByRole("heading", { name: "応援歌", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /年を選択/ })).toBeVisible();
    await expect(page.getByText(/ふりがな(ON|OFF)/)).toBeVisible();
  });

  test("野手個人タブで最初の選手が表示される", async ({ page }) => {
    test.skip(indBatter.length === 0, "no individual batter cheer songs");
    await page.goto("/cheer-songs/2026");

    await page.getByRole("tab", { name: "野手個人" }).click();
    const firstPlayer = (indBatter as { playerName?: string }[])[0].playerName;
    if (firstPlayer) {
      await expect(page.getByText(firstPlayer).first()).toBeVisible();
    }
  });

  test("リダイレクトページが最新年に遷移する", async ({ page }) => {
    await page.goto("/cheer-songs");

    await page.waitForURL(/\/cheer-songs\/\d{4}/);
    await expect(
      page.getByRole("heading", { name: "応援歌", exact: true }),
    ).toBeVisible();
  });
});

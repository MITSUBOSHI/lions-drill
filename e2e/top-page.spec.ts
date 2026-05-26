import { test, expect } from "@playwright/test";
import team from "../src/config/team.config.json";
import { registeredYears } from "../src/constants/player";
import { draftYears } from "../src/constants/draft";

const maxYear = Math.max(...registeredYears);
const maxDraftYear = Math.max(...draftYears);

const allFeatures: { name: string; href: string }[] = [
  { name: "選手名鑑", href: `/player-directory/${maxYear}` },
  { name: "背番号計算ドリル", href: `/number-drill/${maxYear}` },
  { name: "スタメン作成", href: `/lineup-maker/${maxYear}` },
  { name: "ユニフォームビュー", href: `/uniform-view/${maxYear}` },
  { name: "背番号タイマー", href: `/number-count/${maxYear}` },
  { name: "応援歌", href: `/cheer-songs/${maxYear}` },
  { name: "ドラフト一覧", href: `/draft/${maxDraftYear}` },
];

const features = allFeatures.filter((f) => {
  if (f.name === "応援歌" && !team.features.cheerSongs) return false;
  return true;
});

test.describe("トップページ", () => {
  test("基本要素が表示される", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: team.name })).toBeVisible();
    await expect(page.getByText(team.siteSubtitle)).toBeVisible();
    await expect(page.getByAltText(team.logo.alt)).toBeVisible();
    await expect(
      page.getByText("個人が運営するファンサイト", { exact: false }),
    ).toBeVisible();
  });

  test("各機能ページへのリンクが存在する", async ({ page }) => {
    await page.goto("/");

    for (const feature of features) {
      const link = page.getByRole("link", { name: new RegExp(feature.name) });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", feature.href);
    }
  });

  test("トップページから選手名鑑に遷移できる", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /選手名鑑/ }).click();
    await page.waitForURL(`**/player-directory/${maxYear}`);

    await expect(
      page.getByRole("heading", { name: "選手名鑑" }),
    ).toBeVisible();
  });
});

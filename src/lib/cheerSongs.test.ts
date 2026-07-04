/*
 * データ非依存のテスト。特定選手名を仮定しないため、
 * どのチームのリポジトリでもそのまま共有できる。
 */
import { cheerSongsByYear, cheerSongYears } from "./cheerSongs";
import { registeredYears } from "@/constants/player";
import { playersByYear } from "@/lib/players";
import { Year } from "@/types/Player";

describe("cheerSongYears", () => {
  it("選手名簿と同じ年範囲を昇順で返す", () => {
    expect(cheerSongYears).toEqual([...registeredYears].sort((a, b) => a - b));
  });
});

describe("cheerSongsByYear", () => {
  it("選手個人に紐づかない共通曲は全年で表示される", () => {
    // 年別バリアント（id 末尾の -YYYY）は同一曲とみなして比較する
    const baseId = (id: string) => id.replace(/-\d{4}$/, "");
    const commonIds = cheerSongsByYear(
      cheerSongYears[cheerSongYears.length - 1],
    )
      .filter((s) => !s.playerName)
      .map((s) => baseId(s.id));
    for (const year of cheerSongYears) {
      const ids = cheerSongsByYear(year).map((s) => baseId(s.id));
      for (const id of commonIds) {
        expect(ids).toContain(id);
      }
    }
  });

  it("全ての個人応援歌は少なくとも1つの年に表示される（名簿との照合漏れ検知）", () => {
    const shownIds = new Set(
      cheerSongYears.flatMap((year) =>
        cheerSongsByYear(year)
          .filter((s) => s.playerName)
          .map((s) => s.id),
      ),
    );
    // 全年の名簿に存在しない選手の曲は表示されないため、
    // 個人曲の総数と表示された個人曲の数を比較して照合漏れを検知する
    const latestYear = cheerSongYears[cheerSongYears.length - 1];
    const latestIndividual = cheerSongsByYear(latestYear).filter(
      (s) => s.playerName,
    );
    for (const song of latestIndividual) {
      expect(shownIds).toContain(song.id);
    }
    expect(shownIds.size).toBeGreaterThan(0);
  });

  it("同じ年のページに同一曲（タイトル×選手）が重複しない", () => {
    for (const year of cheerSongYears) {
      const seen = new Set<string>();
      for (const song of cheerSongsByYear(year)) {
        const key = `${song.title}|${song.playerName ?? ""}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    }
  });

  it("個人応援歌の背番号とふりがなはその年の名簿に揃う", () => {
    for (const year of cheerSongYears) {
      const roster = playersByYear(year as Year) ?? [];
      for (const song of cheerSongsByYear(year)) {
        if (!song.playerName) continue;
        const player = roster.find((p) => p.number_disp === song.playerNumber);
        expect(player).toBeDefined();
        expect(song.playerNameKana).toBeTruthy();
      }
    }
  });
});

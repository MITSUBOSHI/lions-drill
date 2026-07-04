import pitcherSongs from "@/data/cheer-songs/pitcher.json";
import individualBatterSongs from "@/data/cheer-songs/individual-batter.json";
import commonBatterSongs from "@/data/cheer-songs/common-batter.json";
import managerSongs from "@/data/cheer-songs/manager.json";
import anthemSongs from "@/data/cheer-songs/anthem.json";
import chanceSongs from "@/data/cheer-songs/chance.json";
import { CheerSongType } from "@/types/CheerSong";
import { registeredYears } from "@/constants/player";
import { Year } from "@/types/Player";
import { playersByYear } from "@/lib/players";

const allSongs: CheerSongType[] = [
  ...(pitcherSongs as CheerSongType[]),
  ...(individualBatterSongs as CheerSongType[]),
  ...(commonBatterSongs as CheerSongType[]),
  ...(managerSongs as CheerSongType[]),
  ...(chanceSongs as CheerSongType[]),
  ...(anthemSongs as CheerSongType[]),
];

// 応援歌ページを生成する年の一覧。選手名簿と同じ年範囲を対象にし、
// 各年で「その年に在籍する選手の応援歌」だけを表示する。
export const cheerSongYears: number[] = [...registeredYears].sort(
  (a, b) => a - b,
);

// 同一曲の年別バリアントは id の `-YYYY` サフィックスで表す規約
// （例: individual-kyoda と individual-kyoda-2024）。まとめるキーを返す。
function variantKey(song: CheerSongType): string {
  return song.id.replace(/-\d{4}$/, "");
}

// 年別バリアントの中から表示する1曲を選ぶ。
// その年のバリアント → 年指定なし → 最も新しい年、の優先順。
function pickVariant(variants: CheerSongType[], year: number): CheerSongType {
  return (
    variants.find((s) => s.year === year) ??
    variants.find((s) => s.year == null) ??
    [...variants].sort((a, b) => (b.year ?? 0) - (a.year ?? 0))[0]
  );
}

export function cheerSongsByYear(year: number): CheerSongType[] {
  const roster = playersByYear(year as Year) ?? [];

  const groups = new Map<string, CheerSongType[]>();
  for (const song of allSongs) {
    const key = variantKey(song);
    const list = groups.get(key);
    if (list) {
      list.push(song);
    } else {
      groups.set(key, [song]);
    }
  }

  return [...groups.values()].flatMap((variants) => {
    const song = pickVariant(variants, year);
    // 選手個人に紐づかない曲（投手/打者共通・チャンステーマ・球団歌）は全年で表示する
    if (!song.playerName) return [song];
    // 選手個人の応援歌は、その選手がその年の名簿に在籍する場合のみ表示する。
    // 氏名で照合し、外国人選手など表記揺れがある場合はふりがなでも照合する。
    const player = roster.find(
      (p) =>
        p.name === song.playerName ||
        (song.playerNameKana != null && p.name_kana === song.playerNameKana),
    );
    if (!player) return [];
    // 背番号は年によって異なるため、その年の名簿の背番号に合わせて表示する。
    // ふりがなが曲データに無い場合は名簿から補完する（タイトルのルビ表示用）。
    return [
      {
        ...song,
        playerNumber: player.number_disp,
        // 空文字の場合も名簿から補完する
        playerNameKana: song.playerNameKana || player.name_kana,
      },
    ];
  });
}

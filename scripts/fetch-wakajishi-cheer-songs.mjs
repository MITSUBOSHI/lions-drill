#!/usr/bin/env node
// 若獅子（埼玉西武ライオンズ応援団）の応援歌一覧ページから
// 応援歌タイトル・選手・音源 URL を抽出して cheer-songs データを生成する。
// 歌詞テキストはサイトの注意事項に抵触するため転載せず、音源(audioUrl)と
// 出典(sourceUrl)のみを保存し、フロントで <audio> 再生 + 出典リンクを表示する。
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchHtml } from "./lib/npb-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE_URL = "https://wakajishi-seibulions.com/ouenka2024";
const DATA = join(__dirname, "..", "src", "data");
const CHEER_DIR = join(DATA, "cheer-songs");
const YEAR = 2026;

// 選手名鑑から name → { number_disp, name_kana } のマップを構築。
const rosterByName = new Map();
try {
  const players = JSON.parse(
    readFileSync(join(DATA, `${YEAR}-players.jsonl.json`), "utf8"),
  );
  for (const p of players) {
    if (p.name) {
      rosterByName.set(p.name.replace(/\s+/g, ""), {
        number_disp: p.number_disp,
        name_kana: p.name_kana,
      });
    }
  }
} catch {
  // 名鑑が無くても続行
}

// 名鑑に居ない OB 選手や、wakajishi の括弧表記が姓のみのケース向けに
// Wikipedia 等で調査したフルふりがなを手動オーバーライドとして保持する。
let kanaOverrides = {};
try {
  kanaOverrides = JSON.parse(
    readFileSync(join(__dirname, "cheer-songs-kana-overrides.json"), "utf8"),
  );
} catch {
  // overrides 無ければスキップ
}

function stripTags(s) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(s) {
  return s
    .replace(/[​-‍﻿]/g, "") // ZWSP / ZWJ / ZWNJ / BOM を除去
    .replace(/[（(].*$/g, "")
    .replace(/　/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 共通テーマのタイトルに含まれる文字でカテゴリを推定する。
function categoryFor(title) {
  if (title.includes("チャンス")) return "chance";
  if (title.includes("地平を駈ける獅子")) return "anthem";
  if (title.includes("外国人") && title.includes("投手")) return "foreign_pitcher";
  if (title.includes("投手") || title.includes("投手のテーマ"))
    return "right_pitcher";
  if (title.includes("汎用") || title.includes("テーマ") || title.includes("獅子") || title.includes("ライオンズ") || title.includes("シナリオ") || title.includes("サンバ") || title.includes("フラッグ"))
    return "anthem";
  return "anthem";
}


const html = await fetchHtml(SOURCE_URL);

// 各セクションは <h4>選手名 (よみ)</h4> + <h5>応援歌タイトル</h5> + 音源
// 共通応援歌は h3 などのまま音源が並ぶことが多いため両方を拾う。
const individual = [];
const common = [];

const h4Re = /<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<h4[^>]*>|$)/g;
let m;
while ((m = h4Re.exec(html)) !== null) {
  const heading = stripTags(m[1]);
  const body = m[2];
  const name = normalizeName(heading);
  if (!name) continue;
  const kanaMatch = heading.match(/[（(]([^）)]+)[）)]/);
  const kana = kanaMatch ? kanaMatch[1].trim() : "";
  const mp3 = body.match(/(https?:\/\/[^"'\s<>]+?\.mp3)/);
  if (!mp3) continue;
  // 見出しの括弧内にひらがな（姓のかな）がある時だけ個人応援歌とみなす。
  // 「汎用テーマ（A）」「チャンステーマ1」などは個人と紛らわしいので除外。
  const isIndividual = /[（(][ぁ-ん][ぁ-んー・\s]*[）)]/.test(heading);
  if (!isIndividual) {
    common.push({
      id: `common-${common.length + 1}`,
      title: heading,
      category: categoryFor(heading),
      year: YEAR,
      lyrics: [],
      audioUrl: mp3[1],
      sourceUrl: SOURCE_URL,
      isCommon: true,
    });
    continue;
  }
  // 歌詞テキストはサイトの注意事項に抵触するため取得しない。
  // 表示用タイトルは選手名のみとする。選手名鑑から背番号とフルふりがな（姓 名）を補完。
  const rosterKey = name.replace(/\s+/g, "");
  const roster = rosterByName.get(rosterKey);
  const playerNumber = roster?.number_disp;
  // 優先度: 手動 override > 名鑑由来（フルかな）> wakajishi の括弧（姓のみ）
  const playerNameKana = kanaOverrides[name] || roster?.name_kana || kana;
  individual.push({
    id: `ind-batter-${individual.length + 1}`,
    title: name,
    category: "individual_batter",
    year: YEAR,
    lyrics: [],
    playerName: name,
    ...(playerNameKana ? { playerNameKana } : {}),
    ...(playerNumber ? { playerNumber } : {}),
    audioUrl: mp3[1],
    sourceUrl: SOURCE_URL,
    isCommon: false,
  });
}

// h4 で囲われない共通応援歌（チャンステーマ・球団歌など）は h3 で拾う。
const h3Re = /<h3[^>]*>([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3[^>]*>|<h4[^>]*>|$)/g;
while ((m = h3Re.exec(html)) !== null) {
  const heading = stripTags(m[1]);
  const body = m[2];
  if (!heading) continue;
  const mp3 = body.match(/(https?:\/\/[^"'\s<>]+?\.mp3)/);
  if (!mp3) continue;
  common.push({
    id: `common-${common.length + 1}`,
    title: heading,
    category: categoryFor(heading),
    year: YEAR,
    lyrics: [],
    audioUrl: mp3[1],
    sourceUrl: SOURCE_URL,
    isCommon: true,
  });
}

console.log(`individual: ${individual.length}, common: ${common.length}`);

// 分類ファイルへ書き込み（lions では選手別を individual-batter、共通を
// anthem/chance/pitcher などに振り分ける）。
const byCategory = { anthem: [], chance: [], pitcher: [], otherCommon: [] };
for (const s of common) {
  if (s.category === "chance") byCategory.chance.push(s);
  else if (s.category === "right_pitcher" || s.category === "foreign_pitcher")
    byCategory.pitcher.push({ ...s, category: s.category });
  else byCategory.anthem.push(s);
}

writeFileSync(join(CHEER_DIR, "individual-batter.json"), JSON.stringify(individual, null, 2) + "\n");
writeFileSync(join(CHEER_DIR, "anthem.json"), JSON.stringify(byCategory.anthem, null, 2) + "\n");
writeFileSync(join(CHEER_DIR, "chance.json"), JSON.stringify(byCategory.chance, null, 2) + "\n");
writeFileSync(join(CHEER_DIR, "pitcher.json"), JSON.stringify(byCategory.pitcher, null, 2) + "\n");
writeFileSync(join(CHEER_DIR, "common-batter.json"), JSON.stringify([], null, 2) + "\n");
writeFileSync(join(CHEER_DIR, "manager.json"), JSON.stringify([], null, 2) + "\n");

console.log("done.");

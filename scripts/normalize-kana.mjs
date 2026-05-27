#!/usr/bin/env node
// 選手・ドラフトの name_kana / team_kana をひらがなに統一する。
// 特に外国人選手は NPB のふりがながカタカナ（例「アラン ワイナンス」）なので
// ひらがな（「あらん わいなんす」）へ寄せる。長音「ー」と中黒「・」はそのまま。
// データ再生成時（fetch → fill 系のあと）に最後に実行する。
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { toJsonlJson } from "./lib/npb-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

function toHiragana(s) {
  // カタカナ(U+30A1-U+30F6)をひらがな(-0x60)へ。ー(U+30FC)や・はそのまま。
  return (s ?? "").replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  );
}

let players = 0;
for (const file of readdirSync(DATA_DIR)) {
  if (!/^\d{4}-players\.jsonl\.json$/.test(file)) continue;
  const path = join(DATA_DIR, file);
  const arr = JSON.parse(readFileSync(path, "utf8"));
  for (const p of arr) {
    const k = toHiragana(p.name_kana);
    if (k !== p.name_kana) players++;
    p.name_kana = k;
  }
  writeFileSync(path, toJsonlJson(arr));
}

let drafts = 0;
const draftDir = join(DATA_DIR, "draft");
for (const file of readdirSync(draftDir)) {
  if (!/^\d{4}\.jsonl\.json$/.test(file)) continue;
  const path = join(draftDir, file);
  const arr = JSON.parse(readFileSync(path, "utf8"));
  for (const d of arr) {
    const k = toHiragana(d.name_kana);
    if (k !== d.name_kana) drafts++;
    d.name_kana = k;
    d.team_kana = toHiragana(d.team_kana);
  }
  writeFileSync(path, toJsonlJson(arr));
}

// 手動オーバーライドもひらがなへ揃える（再 fill 時にひらがなを保つ）。
const overridePath = join(__dirname, "draft-kana-overrides.json");
try {
  const ov = JSON.parse(readFileSync(overridePath, "utf8"));
  for (const key of Object.keys(ov)) ov[key] = toHiragana(ov[key]);
  writeFileSync(overridePath, JSON.stringify(ov, null, 2) + "\n");
} catch {
  // overrides ファイルが無ければスキップ
}

console.log(`hiragana-ized: players ${players}, drafts ${drafts}`);

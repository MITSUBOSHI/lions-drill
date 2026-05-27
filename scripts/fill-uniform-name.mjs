#!/usr/bin/env node
// name_kana から姓のローマ字を生成し、空の uniform_name を埋める。
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { familyNameRomaji } from "./lib/romaji.mjs";
import { toJsonlJson } from "./lib/npb-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

// 姓ローマ字では正しく出せない選手（登録名表記など）の手動上書き。
// 例: ボー・タカハシ → "BO"（ユニフォーム表記はファーストネーム）。
let overrides = {};
try {
  overrides = JSON.parse(
    readFileSync(join(__dirname, "uniform-name-overrides.json"), "utf8"),
  );
} catch {
  // overrides ファイルが無ければスキップ
}

let totalFilled = 0;
for (const file of readdirSync(DATA_DIR)) {
  if (!/^\d{4}-players\.jsonl\.json$/.test(file)) continue;
  const path = join(DATA_DIR, file);
  const players = JSON.parse(readFileSync(path, "utf8"));
  let filled = 0;
  for (const p of players) {
    if (overrides[p.name]) {
      p.uniform_name = overrides[p.name];
    } else if (!p.uniform_name && p.name_kana) {
      p.uniform_name = familyNameRomaji(p.name_kana);
      if (p.uniform_name) filled++;
    }
  }
  writeFileSync(path, toJsonlJson(players));
  totalFilled += filled;
  console.log(`${file}: filled ${filled}`);
}
console.log(`done. total filled: ${totalFilled}`);

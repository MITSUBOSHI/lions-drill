#!/usr/bin/env node
// 選手名鑑(players)の name->name_kana を使い、ドラフトデータの空の name_kana を補完する。
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { toJsonlJson } from "./lib/npb-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

const kanaByName = new Map();
for (const file of readdirSync(DATA_DIR)) {
  if (!/^\d{4}-players\.jsonl\.json$/.test(file)) continue;
  for (const p of JSON.parse(readFileSync(join(DATA_DIR, file), "utf8"))) {
    if (p.name && p.name_kana) kanaByName.set(p.name, p.name_kana);
  }
}

// 名鑑に存在しない過去のドラフト選手向けの手動オーバーライド（外部ソース調査）。
// リポジトリにファイルが無ければ空扱い。
let overrides = {};
try {
  overrides = JSON.parse(
    readFileSync(join(__dirname, "draft-kana-overrides.json"), "utf8"),
  );
} catch {
  // overrides ファイルが無ければスキップ
}

const draftDir = join(DATA_DIR, "draft");
let filled = 0;
let total = 0;
let unmatched = 0;
for (const file of readdirSync(draftDir)) {
  if (!/^\d{4}\.jsonl\.json$/.test(file)) continue;
  const path = join(draftDir, file);
  const picks = JSON.parse(readFileSync(path, "utf8"));
  for (const d of picks) {
    total++;
    if (!d.name_kana) {
      const k = kanaByName.get(d.name) ?? overrides[d.name];
      if (k) {
        d.name_kana = k;
        filled++;
      } else {
        unmatched++;
      }
    }
  }
  writeFileSync(path, toJsonlJson(picks));
}
console.log(`draft kana filled ${filled}/${total} (unmatched: ${unmatched})`);

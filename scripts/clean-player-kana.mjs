#!/usr/bin/env node
// 既存の players データの name_kana を整形（外国人の括弧英字表記を除去）。
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { cleanKana, toJsonlJson } from "./lib/npb-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

let changed = 0;
for (const file of readdirSync(DATA_DIR)) {
  if (!/^\d{4}-players\.jsonl\.json$/.test(file)) continue;
  const path = join(DATA_DIR, file);
  const players = JSON.parse(readFileSync(path, "utf8"));
  for (const p of players) {
    const cleaned = cleanKana(p.name_kana);
    if (cleaned !== p.name_kana) {
      p.name_kana = cleaned;
      changed++;
    }
  }
  writeFileSync(path, toJsonlJson(players));
}
console.log(`cleaned ${changed} name_kana`);

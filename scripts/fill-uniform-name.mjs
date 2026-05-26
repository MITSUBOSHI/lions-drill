#!/usr/bin/env node
// name_kana から姓のローマ字を生成し、空の uniform_name を埋める。
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { familyNameRomaji } from "./lib/romaji.mjs";
import { toJsonlJson } from "./lib/npb-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");

let totalFilled = 0;
for (const file of readdirSync(DATA_DIR)) {
  if (!/^\d{4}-players\.jsonl\.json$/.test(file)) continue;
  const path = join(DATA_DIR, file);
  const players = JSON.parse(readFileSync(path, "utf8"));
  let filled = 0;
  for (const p of players) {
    if (!p.uniform_name && p.name_kana) {
      p.uniform_name = familyNameRomaji(p.name_kana);
      if (p.uniform_name) filled++;
    }
  }
  writeFileSync(path, toJsonlJson(players));
  totalFilled += filled;
  console.log(`${file}: filled ${filled}`);
}
console.log(`done. total filled: ${totalFilled}`);

#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fetchHtml,
  parseRosterHtml,
  toJsonlJson,
  enrichWithKana,
} from "./lib/npb-fetch.mjs";
import team from "../src/config/team.config.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, "..");

function parseArgs(argv) {
  const args = { years: null, withKana: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--year") {
      args.years = [Number(argv[++i])];
    } else if (a === "--years") {
      args.years = argv[++i].split(",").map((s) => Number(s.trim()));
    } else if (a === "--no-kana") {
      args.withKana = false;
    }
  }
  return args;
}

async function processYear(year, url, withKana) {
  console.log(`[${year}] fetching ${url}`);
  const html = await fetchHtml(url);
  let players = parseRosterHtml(html, { year, sourceUrl: url });
  console.log(`[${year}] parsed ${players.length} players`);

  if (withKana) {
    console.log(`[${year}] enriching with name_kana (this may take a minute)…`);
    players = await enrichWithKana(players);
  }

  const out = join(REPO_ROOT, "src", "data", `${year}-players.jsonl.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, toJsonlJson(players));
  console.log(`[${year}] wrote ${out}`);
}

async function main() {
  const { years: explicitYears, withKana } = parseArgs(process.argv);
  const rosterUrls = team.npb.rosterUrls;
  const years = explicitYears ?? Object.keys(rosterUrls).map(Number).sort();

  for (const year of years) {
    const url = rosterUrls[String(year)];
    if (!url) {
      console.warn(`[${year}] no URL in team.config.json npb.rosterUrls, skip`);
      continue;
    }
    await processYear(year, url, withKana);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

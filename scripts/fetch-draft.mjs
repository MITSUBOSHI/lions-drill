#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchDraftYear } from "./lib/draft-fetch.mjs";
import { toJsonlJson } from "./lib/npb-fetch.mjs";
import team from "../src/config/team.config.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, "..");

function parseArgs(argv) {
  const args = { from: null, to: null, years: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--year") args.years = [Number(argv[++i])];
    else if (a === "--from") args.from = Number(argv[++i]);
    else if (a === "--to") args.to = Number(argv[++i]);
    else if (a === "--years") args.years = argv[++i].split(",").map((s) => Number(s.trim()));
  }
  return args;
}

async function processYear(year, urlTemplate) {
  const picks = await fetchDraftYear(year, urlTemplate);
  const out = join(REPO_ROOT, "src", "data", "draft", `${year}.jsonl.json`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, toJsonlJson(picks));
  console.log(`[${year}] wrote ${out}`);
}

// 球団名変更などで年代によりページ URL が異なる場合は
// npb.draftUrlTemplateOverrides: [{ from, to, template }] で上書きできる
// （例: 横浜ベイスターズ時代の 2001-2011 は draftlist_yb.html）。
function resolveUrlTemplate(year) {
  for (const o of team.npb.draftUrlTemplateOverrides ?? []) {
    if (year >= o.from && year <= o.to) return o.template;
  }
  return team.npb.draftUrlTemplate;
}

async function main() {
  const args = parseArgs(process.argv);
  if (!team.npb.draftUrlTemplate) {
    throw new Error("team.config.json npb.draftUrlTemplate not set");
  }

  let years = [];
  if (args.years) years = args.years;
  else if (args.from && args.to) {
    for (let y = args.from; y <= args.to; y++) years.push(y);
  } else {
    throw new Error("Specify --year YYYY or --from YYYY --to YYYY");
  }

  for (const year of years) {
    try {
      await processYear(year, resolveUrlTemplate(year));
    } catch (e) {
      console.error(`[${year}] FAILED: ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

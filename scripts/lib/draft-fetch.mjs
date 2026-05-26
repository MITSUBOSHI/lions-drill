import { parse } from "node-html-parser";
import { fetchHtml } from "./npb-fetch.mjs";

const POSITION_KANA_MAP = {
  投手: "とうしゅ",
  捕手: "ほしゅ",
  内野手: "ないやしゅ",
  外野手: "がいやしゅ",
};

function normalize(raw) {
  return (raw ?? "")
    .replace(/\s+/g, " ")
    .replace(/　/g, " ")
    .trim();
}

function rankToRound(rankText) {
  const m = rankText.match(/(\d+)/);
  if (!m) return 0;
  return Number(m[1]);
}

function parseSection(table, year, category) {
  const picks = [];
  if (!table) return picks;
  for (const tr of table.querySelectorAll("tr")) {
    const th = tr.querySelector("th");
    if (!th) continue;
    const tds = tr.querySelectorAll("td");
    if (tds.length < 3) continue;
    const rank = normalize(th.text);
    const name = normalize(tds[0]?.text);
    const position = normalize(tds[1]?.text);
    const team = normalize(tds[2]?.text);
    if (!name) continue;
    picks.push({
      year,
      category,
      round: rankToRound(rank),
      name,
      name_kana: "",
      position,
      team,
      team_kana: "",
      isLotteryLoss: false,
    });
  }
  return picks;
}

function nextTable(node) {
  let n = node.nextElementSibling;
  while (n) {
    const table = n.tagName === "TABLE" ? n : n.querySelector?.("table");
    if (table) return table;
    n = n.nextElementSibling;
  }
  return null;
}

export function parseDraftHtml(html, { year }) {
  const root = parse(html);

  const regular = [];
  const development = [];

  for (const h of root.querySelectorAll("h4")) {
    const headingText = h.text ?? "";
    const table = nextTable(h);
    if (!table) continue;
    const category = headingText.includes("育成") ? "development" : "regular";
    const picks = parseSection(table, year, category);
    if (category === "development") development.push(...picks);
    else regular.push(...picks);
  }

  // 「（選択権なし）」など名前として無効なものを除外
  const isInvalidName = (n) => !n || n.includes("選択権なし") || n.includes("なし");

  return [...regular, ...development].filter((p) => !isInvalidName(p.name));
}

export async function fetchDraftYear(year, urlTemplate) {
  const url = urlTemplate.replace("{year}", String(year));
  console.log(`[${year}] fetching ${url}`);
  const html = await fetchHtml(url);
  const picks = parseDraftHtml(html, { year });
  console.log(`[${year}] parsed ${picks.length} picks`);
  return picks;
}

export { POSITION_KANA_MAP };

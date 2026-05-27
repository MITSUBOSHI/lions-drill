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
  // 全角数字(２巡目 等)を半角へ正規化してから巡目を抽出
  const normalized = (rankText ?? "").replace(/[０-９]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0xfee0),
  );
  const m = normalized.match(/(\d+)/);
  if (!m) return 0;
  return Number(m[1]);
}

function cleanPosition(s) {
  return normalize(s).replace(/\s/g, "");
}

// 巡目が付かない特別枠の見出し → 表示ラベル
function specialSlotNote(headingText) {
  if (headingText.includes("自由獲得")) return "自由獲得枠";
  if (headingText.includes("希望")) return "希望入団枠";
  if (headingText.includes("逆指名")) return "逆指名";
  return undefined;
}

function parseSection(table, year, category, headingText = "") {
  const picks = [];
  if (!table) return picks;
  const note = specialSlotNote(headingText);
  for (const tr of table.querySelectorAll("tr")) {
    const th = tr.querySelector("th");
    if (!th) continue;
    const tds = tr.querySelectorAll("td");
    if (tds.length < 3) continue;
    const rank = normalize(th.text);
    const name = normalize(tds[0]?.text);
    // 旧フォーマット(2006以前)は 名前/年齢/ポジション/所属 の4列、
    // 新フォーマットは 名前/ポジション/所属 の3列。
    const hasAgeColumn = tds.length >= 4;
    const position = cleanPosition(tds[hasAgeColumn ? 2 : 1]?.text);
    const team = normalize(tds[hasAgeColumn ? 3 : 2]?.text);
    if (!name) continue;
    const round = rankToRound(rank);
    const pick = {
      year,
      category,
      round,
      name,
      name_kana: "",
      position,
      team,
      team_kana: "",
      isLotteryLoss: false,
    };
    if (round === 0 && note) pick.note = note;
    picks.push(pick);
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
    const picks = parseSection(table, year, category, headingText);
    if (category === "development") development.push(...picks);
    else regular.push(...picks);
  }

  // 「（選択権なし）」「（辞退）」など括弧で囲まれた非選手行を除外
  const isInvalidName = (n) => !n || /^[（(]/.test(n.trim());

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

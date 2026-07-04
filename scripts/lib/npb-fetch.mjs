import { parse } from "node-html-parser";

const NPB_ORIGIN = "https://npb.jp";

export async function fetchHtml(url, { retries = 3, retryDelayMs = 2000 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        },
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} fetching ${url}`);
      }
      return await res.text();
    } catch (e) {
      lastErr = e;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, retryDelayMs * (attempt + 1)));
      }
    }
  }
  throw lastErr;
}

function originOf(url) {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return NPB_ORIGIN;
  }
}

function normalizeName(raw) {
  return raw
    .replace(/\s+/g, " ")
    .replace(/　/g, " ")
    .trim();
}

function toISODate(dateStr) {
  const m = dateStr.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  if (!m) return null;
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function resolveUrl(href, baseOrigin = NPB_ORIGIN) {
  if (!href) return "";
  if (href.startsWith("http")) return href;
  if (href.startsWith("/")) return `${baseOrigin}${href}`;
  return `${baseOrigin}/${href}`;
}

function toInt(s) {
  const n = parseInt(s, 10);
  return Number.isNaN(n) ? null : n;
}

export function parseRosterHtml(html, { year, sourceUrl }) {
  const root = parse(html);
  const main = root.querySelector("#tedivmain");
  if (!main) throw new Error("No #tedivmain found");
  const baseOrigin = sourceUrl ? originOf(sourceUrl) : NPB_ORIGIN;

  const players = [];

  let isDevelopment = false;
  let currentSectionRole = "roster";

  for (const node of main.querySelectorAll("h3, tr.rosterMainHead, tr.rosterPlayer")) {
    if (node.tagName === "H3") {
      const text = node.text || "";
      if (text.includes("育成")) {
        isDevelopment = true;
      } else if (text.includes("支配下")) {
        isDevelopment = false;
      }
      continue;
    }
    if (node.classList.contains("rosterMainHead")) {
      const posText = node.querySelector(".rosterPos")?.text ?? "";
      if (posText.includes("監督") || posText.includes("コーチ")) {
        currentSectionRole = "coach";
      } else if (isDevelopment) {
        currentSectionRole = "training";
      } else {
        currentSectionRole = "roster";
      }
      continue;
    }

    const tds = node.querySelectorAll("td");
    if (tds.length === 0) continue;

    const numberDisp = tds[0]?.text.trim();
    const registerCell = node.querySelector(".rosterRegister");
    const nameRaw = registerCell?.text ?? tds[1]?.text ?? "";
    const name = normalizeName(nameRaw);
    const link = registerCell?.querySelector("a");
    const url = link ? resolveUrl(link.getAttribute("href"), baseOrigin) : "";
    const dobRaw = tds[2]?.text.trim() ?? "";
    const dob = toISODate(dobRaw);
    const heightCm = tds.length >= 5 ? toInt(tds[3]?.text.trim()) : null;
    const weightKg = tds.length >= 5 ? toInt(tds[4]?.text.trim()) : null;

    if (!numberDisp || !name) continue;

    players.push({
      year,
      name,
      name_kana: "",
      uniform_name: "",
      number_calc: toInt(numberDisp) ?? 0,
      number_disp: numberDisp,
      date_of_birth: dob ?? "",
      height_cm: heightCm,
      weight_kg: weightKg,
      role: currentSectionRole,
      url,
    });
  }

  return players;
}

export function toJsonlJson(records) {
  const lines = records.map((r) => "  " + JSON.stringify(r));
  return "[\n" + lines.join(",\n") + "\n]\n";
}

// NPB の pc_v_kana を表示用ふりがなに整形する。
// 日本人: "うえだ・たいが" → "うえだ たいが"
// 外国人: "アラン・ワイナンス　(ALLAN WINANS)" → "アラン ワイナンス"
export function cleanKana(raw) {
  if (!raw) return "";
  return raw
    .replace(/[（(].*$/s, "") // 括弧以降の英字表記を除去
    .replace(/・/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// 外国人選手の英字表記からイニシャルを取り出す。
// "ヘラル・エンカーナシオン　(JERAR ENCARNACION)" → "J"
// 日本人 "いのうえ・ともや" → null
export function foreignInitialFromKana(raw) {
  if (!raw) return null;
  const m = raw.match(/[（(]\s*([A-Za-z])/);
  return m ? m[1].toUpperCase() : null;
}

// 外国人選手名にイニシャル接頭辞を付与する。
// ("エンカーナシオン", "J") → "J.エンカーナシオン"
// 日本人 (initial=null) や既に接頭辞付きの名前はそのまま返す。
export function applyForeignPrefix(name, initial) {
  if (!initial) return name;
  if (/^[A-Za-z]\./.test(name)) return name; // 二重付与を防ぐ
  return `${initial}.${name}`;
}

export async function fetchPlayerNameInfo(playerUrl) {
  if (!playerUrl) return { kana: "", initial: null };
  try {
    const html = await fetchHtml(playerUrl);
    const root = parse(html);
    const kanaEl = root.querySelector("#pc_v_kana");
    const raw = (kanaEl?.text ?? "").trim();
    return { kana: cleanKana(raw), initial: foreignInitialFromKana(raw) };
  } catch (e) {
    console.warn(`failed to fetch name info for ${playerUrl}: ${e.message}`);
    return { kana: "", initial: null };
  }
}

export async function fetchPlayerKana(playerUrl) {
  return (await fetchPlayerNameInfo(playerUrl)).kana;
}

export async function enrichWithKana(records, { concurrency = 3 } = {}) {
  const tasks = records.map((r) => r);
  const result = new Array(tasks.length);

  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      const rec = tasks[i];
      const { kana, initial } = await fetchPlayerNameInfo(rec.url);
      result[i] = {
        ...rec,
        name: applyForeignPrefix(rec.name, initial),
        name_kana: kana,
      };
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()),
  );

  return result;
}

// 簡易ヘボン式ローマ字変換（選手姓表示用）。
// ひらがな/カタカナを受け取り大文字ローマ字を返す。

const TWO = {
  きゃ: "kya", きゅ: "kyu", きょ: "kyo",
  しゃ: "sha", しゅ: "shu", しょ: "sho", しぇ: "she",
  ちゃ: "cha", ちゅ: "chu", ちょ: "cho", ちぇ: "che",
  にゃ: "nya", にゅ: "nyu", にょ: "nyo",
  ひゃ: "hya", ひゅ: "hyu", ひょ: "hyo",
  みゃ: "mya", みゅ: "myu", みょ: "myo",
  りゃ: "rya", りゅ: "ryu", りょ: "ryo",
  ぎゃ: "gya", ぎゅ: "gyu", ぎょ: "gyo",
  じゃ: "ja", じゅ: "ju", じょ: "jo", じぇ: "je",
  びゃ: "bya", びゅ: "byu", びょ: "byo",
  ぴゃ: "pya", ぴゅ: "pyu", ぴょ: "pyo",
  ふぁ: "fa", ふぃ: "fi", ふぇ: "fe", ふぉ: "fo",
  うぃ: "wi", うぇ: "we", うぉ: "wo",
  ゔぁ: "va", ゔぃ: "vi", ゔ: "vu", ゔぇ: "ve", ゔぉ: "vo",
  てぃ: "ti", でぃ: "di", とぅ: "tu", どぅ: "du",
  ちゅ: "chu",
};

const ONE = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", ゐ: "i", ゑ: "e", を: "o", ん: "n",
  ぁ: "a", ぃ: "i", ぅ: "u", ぇ: "e", ぉ: "o",
  ゃ: "ya", ゅ: "yu", ょ: "yo",
};

function kataToHira(s) {
  return s.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  );
}

export function toRomaji(input) {
  if (!input) return "";
  // カタカナ→ひらがな、長音記号と中黒/空白を除去
  let s = kataToHira(input).replace(/[ー・\s]/g, "");
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i];
    // 促音: 次の音の頭子音を重ねる
    if (ch === "っ") {
      const two = s.slice(i + 1, i + 3);
      const one = s[i + 1];
      const next = TWO[two] ?? ONE[one] ?? "";
      if (next) out += next[0] === "c" ? "t" : next[0]; // っち→tchi
      i += 1;
      continue;
    }
    const two = s.slice(i, i + 2);
    if (TWO[two]) {
      out += TWO[two];
      i += 2;
      continue;
    }
    if (ONE[ch]) {
      out += ONE[ch];
      i += 1;
      continue;
    }
    // 変換できない文字はそのまま（英字など）
    out += ch;
    i += 1;
  }
  return out.toUpperCase();
}

export function familyNameRomaji(nameKana) {
  if (!nameKana) return "";
  // 外国人選手は "アラン ワイナンス　(ALLAN WINANS)" のように
  // 括弧内へ英字フルネームが入る。閉じ括弧があれば姓（最後の語）を採用。
  const paren = nameKana.match(/[（(]\s*([A-Za-z][A-Za-z.\s]*?)\s*[)）]/);
  if (paren) {
    const parts = paren[1].trim().split(/\s+/);
    return parts[parts.length - 1].toUpperCase().replace(/\./g, "");
  }
  // 括弧前のカナ部分だけ採用（閉じ括弧欠落の英字を混ぜない）
  const beforeParen = nameKana.split(/[（(]/)[0].trim();
  const words = beforeParen.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  // カタカナのみ＝外国人表記は「名 姓」順なので最後の語が姓。
  const isKatakana = /^[ァ-ヶー・]+$/.test(beforeParen.replace(/\s/g, ""));
  const family = isKatakana ? words[words.length - 1] : words[0];
  return toRomaji(family);
}

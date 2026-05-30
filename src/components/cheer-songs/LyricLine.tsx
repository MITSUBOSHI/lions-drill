import { parseLyricLine } from "@/lib/rubyParser";

type LyricLineProps = {
  line: string;
  showRuby: boolean;
};

// カタカナ U+30A1-U+30F6 をひらがなへ。長音「ー」「・」はそのまま。
function kataToHira(s: string): string {
  return s.replace(/[ァ-ヶ]/g, (c) =>
    String.fromCharCode(c.charCodeAt(0) - 0x60),
  );
}

// カタカナ連続部分には自動でひらがな ruby を振る。
// 「リセット」→ ⟨ruby⟩リセット⟨rt⟩りせっと⟨/rt⟩⟨/ruby⟩
function renderTextWithKatakanaRuby(
  text: string,
  showRuby: boolean,
): React.ReactNode {
  if (!showRuby) return text;
  const parts: React.ReactNode[] = [];
  // 長音記号と中黒もカタカナ語の一部として連続扱いにする。
  const re = /([ァ-ヶ][ァ-ヶー・]*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <ruby key={key++}>
        {m[0]}
        <rt style={{ fontSize: "0.6em", lineHeight: 1 }}>{kataToHira(m[0])}</rt>
      </ruby>,
    );
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export default function LyricLine({ line, showRuby }: LyricLineProps) {
  const segments = parseLyricLine(line);

  return (
    <p className="text-lg" style={{ lineHeight: showRuby ? "1.9" : "1.6" }}>
      {segments.map((segment, i) => {
        if (segment.type === "text") {
          return (
            <span key={i}>
              {renderTextWithKatakanaRuby(segment.content, showRuby)}
            </span>
          );
        }
        if (showRuby) {
          return (
            <ruby key={i}>
              {segment.base}
              <rt style={{ fontSize: "0.6em", lineHeight: 1 }}>
                {segment.reading}
              </rt>
            </ruby>
          );
        }
        return <span key={i}>{segment.base}</span>;
      })}
    </p>
  );
}

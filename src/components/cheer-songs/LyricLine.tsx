import { parseLyricLine } from "@/lib/rubyParser";

type LyricLineProps = {
  line: string;
  showRuby: boolean;
};

export default function LyricLine({ line, showRuby }: LyricLineProps) {
  const segments = parseLyricLine(line);

  return (
    <p className="text-lg" style={{ lineHeight: showRuby ? "1.9" : "1.6" }}>
      {segments.map((segment, i) => {
        if (segment.type === "text") {
          return <span key={i}>{segment.content}</span>;
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

export type LyricSegment =
  | { type: "text"; content: string }
  | { type: "ruby"; base: string; reading: string };

export function parseLyricLine(line: string): LyricSegment[] {
  const regex = /\{([^|]+)\|([^}]+)\}/g;
  const segments: LyricSegment[] = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: line.slice(lastIndex, match.index),
      });
    }
    segments.push({ type: "ruby", base: match[1], reading: match[2] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    segments.push({ type: "text", content: line.slice(lastIndex) });
  }

  return segments;
}

export function replaceNamePlaceholder(
  line: string,
  playerName: string,
): string {
  return line.replace(/\{\{name\}\}/g, playerName);
}

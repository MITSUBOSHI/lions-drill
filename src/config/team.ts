import config from "./team.config.json";

export type DescriptionKey = keyof typeof config.descriptionTemplate;

export type SubtitleSegment = {
  text: string;
  reading?: string;
};

export type TeamConfig = typeof config & {
  subtitleSegments: SubtitleSegment[];
};

export const TEAM = config as TeamConfig;

export function describe(
  key: DescriptionKey,
  vars: Record<string, string | number> = {},
): string {
  return TEAM.descriptionTemplate[key].replace(/\{(\w+)\}/g, (_, k) =>
    String(vars[k] ?? ""),
  );
}

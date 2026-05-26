export const draftYears = [
  2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
  2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
] as const;

export const categoryLabels = {
  regular: "新人選手選択会議",
  development: "育成選手選択会議",
} as const;

export const positionKanaMap: Record<string, string> = {
  投手: "とうしゅ",
  捕手: "ほしゅ",
  内野手: "ないやしゅ",
  外野手: "がいやしゅ",
};

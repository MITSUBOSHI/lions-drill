/*
 * ドラフトデータのマニフェスト。チーム所有（同期対象外）。
 * 年の範囲はチームごとに異なるため、共有ロジック（src/lib/draft.ts）は
 * この map だけに依存する。
 */
import Draft2001 from "@/data/draft/2001.jsonl.json";
import Draft2002 from "@/data/draft/2002.jsonl.json";
import Draft2003 from "@/data/draft/2003.jsonl.json";
import Draft2004 from "@/data/draft/2004.jsonl.json";
import Draft2005 from "@/data/draft/2005.jsonl.json";
import Draft2006 from "@/data/draft/2006.jsonl.json";
import Draft2007 from "@/data/draft/2007.jsonl.json";
import Draft2008 from "@/data/draft/2008.jsonl.json";
import Draft2009 from "@/data/draft/2009.jsonl.json";
import Draft2010 from "@/data/draft/2010.jsonl.json";
import Draft2011 from "@/data/draft/2011.jsonl.json";
import Draft2012 from "@/data/draft/2012.jsonl.json";
import Draft2013 from "@/data/draft/2013.jsonl.json";
import Draft2014 from "@/data/draft/2014.jsonl.json";
import Draft2015 from "@/data/draft/2015.jsonl.json";
import Draft2016 from "@/data/draft/2016.jsonl.json";
import Draft2017 from "@/data/draft/2017.jsonl.json";
import Draft2018 from "@/data/draft/2018.jsonl.json";
import Draft2019 from "@/data/draft/2019.jsonl.json";
import Draft2020 from "@/data/draft/2020.jsonl.json";
import Draft2021 from "@/data/draft/2021.jsonl.json";
import Draft2022 from "@/data/draft/2022.jsonl.json";
import Draft2023 from "@/data/draft/2023.jsonl.json";
import Draft2024 from "@/data/draft/2024.jsonl.json";
import Draft2025 from "@/data/draft/2025.jsonl.json";
import { DraftPick, DraftYear } from "@/types/DraftPick";

export const draftByYearMap: Record<DraftYear, DraftPick[]> = {
  2001: Draft2001 as DraftPick[],
  2002: Draft2002 as DraftPick[],
  2003: Draft2003 as DraftPick[],
  2004: Draft2004 as DraftPick[],
  2005: Draft2005 as DraftPick[],
  2006: Draft2006 as DraftPick[],
  2007: Draft2007 as DraftPick[],
  2008: Draft2008 as DraftPick[],
  2009: Draft2009 as DraftPick[],
  2010: Draft2010 as DraftPick[],
  2011: Draft2011 as DraftPick[],
  2012: Draft2012 as DraftPick[],
  2013: Draft2013 as DraftPick[],
  2014: Draft2014 as DraftPick[],
  2015: Draft2015 as DraftPick[],
  2016: Draft2016 as DraftPick[],
  2017: Draft2017 as DraftPick[],
  2018: Draft2018 as DraftPick[],
  2019: Draft2019 as DraftPick[],
  2020: Draft2020 as DraftPick[],
  2021: Draft2021 as DraftPick[],
  2022: Draft2022 as DraftPick[],
  2023: Draft2023 as DraftPick[],
  2024: Draft2024 as DraftPick[],
  2025: Draft2025 as DraftPick[],
};

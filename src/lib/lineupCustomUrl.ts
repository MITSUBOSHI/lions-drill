export const CUSTOM_NAME_MAX_LENGTH = 30;
export const CUSTOM_MEMO_MAX_LENGTH = 100;
export const CUSTOM_TITLE_MAX_LENGTH = 30;
export const CUSTOM_ITEM_LABEL_MAX_LENGTH = 10;
export const CUSTOM_LINEUP_SIZE = 9;
export const DEFAULT_ITEM_LABEL = "選手名";

export type CustomLineupSpot = {
  order: number;
  name: string;
  memo: string;
};

export type CustomLineupUrlState = {
  lineup: CustomLineupSpot[];
  customTitle: string;
  itemLabel: string;
};

export function createDefaultCustomLineup(): CustomLineupSpot[] {
  return Array.from({ length: CUSTOM_LINEUP_SIZE }, (_, i) => ({
    order: i + 1,
    name: "",
    memo: "",
  }));
}

export function encodeCustomLineupParams(
  state: CustomLineupUrlState,
): URLSearchParams {
  const params = new URLSearchParams();

  for (const spot of state.lineup) {
    if (spot.name) params.set(`n${spot.order}`, spot.name);
    if (spot.memo) params.set(`m${spot.order}`, spot.memo);
  }

  if (state.customTitle) params.set("title", state.customTitle);
  if (state.itemLabel) params.set("label", state.itemLabel);

  return params;
}

export function decodeCustomLineupParams(
  params: URLSearchParams,
): CustomLineupUrlState | null {
  const customTitle = (params.get("title") || "").slice(
    0,
    CUSTOM_TITLE_MAX_LENGTH,
  );
  const itemLabel = (params.get("label") || "").slice(
    0,
    CUSTOM_ITEM_LABEL_MAX_LENGTH,
  );

  const lineup = createDefaultCustomLineup();
  let hasAny = false;

  for (const spot of lineup) {
    const name = params.get(`n${spot.order}`);
    const memo = params.get(`m${spot.order}`);
    if (name !== null) {
      spot.name = name.slice(0, CUSTOM_NAME_MAX_LENGTH);
      hasAny = true;
    }
    if (memo !== null) {
      spot.memo = memo.slice(0, CUSTOM_MEMO_MAX_LENGTH);
      hasAny = true;
    }
  }

  if (!hasAny && !customTitle && !itemLabel) return null;

  return { lineup, customTitle, itemLabel };
}

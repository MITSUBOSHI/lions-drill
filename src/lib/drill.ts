import { PlayerType, Role } from "@/types/Player";

export const DEFAULT_PLAYER_SELECTION_NUMBER = 2;
export type ModeRoleType = "roster" | "all";
export type Operator = "+" | "-" | "*" | "/";
export const OPERATORS: Record<Operator, string> = {
  "+": "＋",
  "-": "－",
  "*": "×",
  "/": "÷",
};
export type Mode = {
  role: ModeRoleType;
  playerNum: 2 | 3 | 4;
  operators: Operator[];
};
export type Action =
  | {
      type: "init";
      allPlayers: PlayerType[];
    }
  | {
      type: "retry";
      allPlayers: PlayerType[];
    }
  | {
      type: "settings";
      mode: Mode;
    }
  | {
      type: "answering";
      value: string;
      valueAsNumber: number;
    }
  | {
      type: "answered";
    };
export type DrillStateType = {
  currentDrillPlayers: PlayerType[];
  answeredNumber: number | null;
  showResult: boolean;
  mode: Mode;
  inputValue: string;
  currentOperatorSequence: Operator[];
};
export const initDrillState: DrillStateType = {
  currentDrillPlayers: [],
  answeredNumber: null,
  showResult: false,
  inputValue: "",
  mode: {
    role: "roster",
    playerNum: DEFAULT_PLAYER_SELECTION_NUMBER,
    operators: ["+"],
  },
  currentOperatorSequence: [],
};
export const reducer = (
  prev: DrillStateType,
  action: Action,
): DrillStateType => {
  switch (action.type) {
    case "init":
    case "retry": {
      const { selectedPlayers, operatorSequence } = generateDrillQuestion(
        action.allPlayers,
        prev.mode,
      );
      return {
        ...initDrillState,
        mode: prev.mode,
        currentDrillPlayers: selectedPlayers,
        currentOperatorSequence: operatorSequence,
      };
    }
    case "settings":
      return {
        ...prev,
        mode: action.mode,
      };
    case "answering":
      return {
        ...prev,
        answeredNumber: action.valueAsNumber,
        showResult: false,
        inputValue: action.value,
      };
    case "answered":
      return { ...prev, showResult: true };
    default:
      throw new Error("unsupported action type is given");
  }
};

const RolesByModeRole: Record<ModeRoleType, Role[]> = {
  roster: [Role.Roster],
  all: [Role.Coach, Role.Roster, Role.Training],
};
function shufflePlayers(players: PlayerType[]): PlayerType[] {
  const arr = [...players];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
export function selectRandomizedPlayers(
  players: PlayerType[],
  mode: Mode,
): PlayerType[] {
  const usingRoles = RolesByModeRole[mode.role];
  const filteredPlayers = players.filter((p) => usingRoles.includes(p.role));
  const shuffledPlayers = shufflePlayers(filteredPlayers);
  const count = mode.playerNum;

  return shuffledPlayers.slice(0, count);
}
export type QuestionPlayer = {
  name: string;
  nameKana: string;
  numberDisp: string;
};

export type QuestionType = {
  questionSentence: string;
  correctNumber: number;
  explanationSentence: string;
  players: QuestionPlayer[];
  operatorSymbols: string[];
};

function calculateResult(
  a: number,
  b: number,
  operator: Operator,
): number | null {
  switch (operator) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      // 割り切れる場合のみ除算を許可
      return b !== 0 && Number.isInteger(a / b) ? a / b : null;
  }
}

const OPERATOR_PRECEDENCE: Record<Operator, number> = {
  "*": 2,
  "/": 2,
  "+": 1,
  "-": 1,
};

// 四則演算の優先順位（×÷が先）で式を評価する。割り切れない除算を含む場合はnull。
// 表示される式と答えが数学的に一致するよう、左からの逐次計算ではなく優先順位で評価する。
export function evaluateExpression(
  numbers: number[],
  operators: Operator[],
): number | null {
  const nums = [...numbers];
  const ops = [...operators];

  let i = 0;
  while (i < ops.length) {
    if (OPERATOR_PRECEDENCE[ops[i]] === 2) {
      const result = calculateResult(nums[i], nums[i + 1], ops[i]);
      if (result === null) return null;
      nums.splice(i, 2, result);
      ops.splice(i, 1);
    } else {
      i++;
    }
  }

  let result = nums[0];
  for (let j = 0; j < ops.length; j++) {
    const next = calculateResult(result, nums[j + 1], ops[j]);
    if (next === null) return null;
    result = next;
  }
  return result;
}

function calculateExpression(
  players: PlayerType[],
  operators: Operator[],
): {
  result: number;
  expression: string;
  explanationExpression: string;
  effectiveOperatorSymbols: string[];
} {
  if (players.length === 1) {
    return {
      result: players[0].number_calc,
      expression: players[0].name,
      explanationExpression: `${players[0].number_disp}（${players[0].name}）`,
      effectiveOperatorSymbols: [],
    };
  }

  const numbers = players.map((p) => p.number_calc);

  // 優先順位で評価できない場合（割り切れない除算など）は、
  // 表示と答えの整合性を保つため式全体を加算にフォールバックする
  let effectiveOperators = operators;
  let result = evaluateExpression(numbers, operators);
  if (result === null) {
    effectiveOperators = Array<Operator>(operators.length).fill("+");
    result = numbers.reduce((a, b) => a + b, 0);
  }

  let expression = players[0].name;
  let explanationExpression = `${players[0].number_disp}（${players[0].name}）`;
  const effectiveOperatorSymbols: string[] = [];

  for (let i = 0; i < effectiveOperators.length; i++) {
    const operatorSymbol = OPERATORS[effectiveOperators[i]];
    effectiveOperatorSymbols.push(operatorSymbol);
    expression += ` ${operatorSymbol} ${players[i + 1].name}`;
    explanationExpression += ` ${operatorSymbol} ${players[i + 1].number_disp}（${players[i + 1].name}）`;
  }

  return {
    result,
    expression,
    explanationExpression,
    effectiveOperatorSymbols,
  };
}

export function generateQuestionWithOperators(
  players: PlayerType[],
  operators: Operator[],
  fixedOperatorSequence?: Operator[],
): QuestionType & { operatorSequence: Operator[] } {
  if (
    fixedOperatorSequence &&
    fixedOperatorSequence.length === players.length - 1
  ) {
    const {
      result,
      expression,
      explanationExpression,
      effectiveOperatorSymbols,
    } = calculateExpression(players, fixedOperatorSequence);

    return {
      questionSentence: expression,
      correctNumber: result,
      explanationSentence: explanationExpression,
      players: players.map((p) => ({
        name: p.name,
        nameKana: p.name_kana,
        numberDisp: p.number_disp,
      })),
      operatorSymbols: effectiveOperatorSymbols,
      operatorSequence: fixedOperatorSequence,
    };
  }

  // 新しい演算子シーケンスを生成
  // 優先順位で評価した答えが0以上の整数になる組み合わせを探す。
  // 見つからない場合はすべて加算にフォールバックする。
  const sequenceLength = Math.max(players.length - 1, 0);
  const numbers = players.map((p) => p.number_calc);
  const maxSequenceAttempts = 100;
  let operatorSequence: Operator[] | null = null;

  for (let attempt = 0; attempt < maxSequenceAttempts; attempt++) {
    const candidate = Array.from(
      { length: sequenceLength },
      () => operators[Math.floor(Math.random() * operators.length)],
    );
    const result = evaluateExpression(numbers, candidate);
    if (result !== null && result >= 0 && Number.isInteger(result)) {
      operatorSequence = candidate;
      break;
    }
  }

  if (operatorSequence === null) {
    operatorSequence = Array<Operator>(sequenceLength).fill("+");
  }

  const {
    result,
    expression,
    explanationExpression,
    effectiveOperatorSymbols,
  } = calculateExpression(players, operatorSequence);

  return {
    questionSentence: expression,
    correctNumber: result,
    explanationSentence: explanationExpression,
    players: players.map((p) => ({
      name: p.name,
      nameKana: p.name_kana,
      numberDisp: p.number_disp,
    })),
    operatorSymbols: effectiveOperatorSymbols,
    operatorSequence,
  };
}

export function generateDrillQuestion(
  allPlayers: PlayerType[],
  mode: Mode,
): { selectedPlayers: PlayerType[]; operatorSequence: Operator[] } {
  const maxAttempts = 10;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const selectedPlayers = selectRandomizedPlayers(allPlayers, mode);
    const { operatorSequence } = generateQuestionWithOperators(
      selectedPlayers,
      mode.operators,
    );
    // 生成された演算子がすべてユーザー選択の演算子に含まれているか確認
    if (operatorSequence.every((op) => mode.operators.includes(op))) {
      return { selectedPlayers, operatorSequence };
    }
  }
  // 最大試行回数に達した場合、最後の結果をそのまま使う
  const selectedPlayers = selectRandomizedPlayers(allPlayers, mode);
  const { operatorSequence } = generateQuestionWithOperators(
    selectedPlayers,
    mode.operators,
  );
  return { selectedPlayers, operatorSequence };
}

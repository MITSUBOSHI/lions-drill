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

  // 左から右へ順番に計算
  let result = players[0].number_calc;
  let expression = players[0].name;
  let explanationExpression = `${players[0].number_disp}（${players[0].name}）`;
  const effectiveOperatorSymbols: string[] = [];

  for (let i = 0; i < operators.length; i++) {
    const nextNumber = players[i + 1].number_calc;
    const calculatedResult = calculateResult(result, nextNumber, operators[i]);

    // 割り切れない場合は加算にフォールバックし、表示も加算にする
    const effectiveOperator = calculatedResult !== null ? operators[i] : "+";
    result = calculatedResult !== null ? calculatedResult : result + nextNumber;
    effectiveOperatorSymbols.push(OPERATORS[effectiveOperator]);

    expression += ` ${OPERATORS[effectiveOperator]} ${players[i + 1].name}`;
    explanationExpression += ` ${OPERATORS[effectiveOperator]} ${players[i + 1].number_disp}（${players[i + 1].name}）`;
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
  const shuffledOperators = [...operators].sort(() => Math.random() - 0.5);
  const operatorSequence: Operator[] = [];

  let currentResult = players[0].number_calc;
  for (let i = 1; i < players.length; i++) {
    const nextNumber = players[i].number_calc;
    let validOperatorFound = false;

    for (const op of shuffledOperators) {
      const tempResult = calculateResult(currentResult, nextNumber, op);
      if (
        tempResult !== null &&
        tempResult >= 0 &&
        Number.isInteger(tempResult)
      ) {
        currentResult = tempResult;
        operatorSequence.push(op);
        validOperatorFound = true;
        break;
      }
    }

    if (!validOperatorFound) {
      currentResult += nextNumber;
      operatorSequence.push("+");
    }
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

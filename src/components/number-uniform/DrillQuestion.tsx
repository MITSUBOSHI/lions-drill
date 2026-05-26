import {
  NumberInputField,
  NumberInputRoot,
} from "@/components/ui/number-input";
import Ruby from "@/components/common/Ruby";
import { useFurigana } from "@/contexts/FuriganaContext";
import type { QuestionType } from "@/lib/drill";

type Props = {
  question: QuestionType;
  inputValue: string;
  showResult: boolean;
  onAnswer: () => void;
  onInputChange: (value: string, valueAsNumber: number) => void;
  onRetry: () => void;
};

export default function DrillQuestion({
  question,
  inputValue,
  showResult,
  onAnswer,
  onInputChange,
  onRetry,
}: Props) {
  const { furigana } = useFurigana();

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: "var(--surface-card)",
        borderColor: "var(--border-card)",
      }}
    >
      <h3 className="text-lg font-semibold mb-4">
        <Ruby reading="もんだい">問題</Ruby>
      </h3>
      <div className="flex flex-col gap-4 items-stretch">
        <div
          className="p-3 rounded-md border"
          style={{
            backgroundColor: "var(--surface-card-subtle)",
            borderColor: "var(--border-card)",
          }}
          aria-live="polite"
        >
          <p className="text-base font-bold">
            {furigana
              ? question.players.map((p, i) => (
                  <span key={i}>
                    {i > 0 && ` ${question.operatorSymbols[i - 1]} `}
                    <Ruby reading={p.nameKana}>{p.name}</Ruby>
                  </span>
                ))
              : question.questionSentence}
          </p>
        </div>
        <div>
          <p className="mb-2 font-bold">
            <Ruby reading="こた">答</Ruby>えを
            <Ruby reading="にゅうりょく">入力</Ruby>してください：
          </p>
          <NumberInputRoot
            size="lg"
            width="100%"
            min={-2000}
            max={2000}
            value={inputValue}
            onValueChange={(details: {
              value: string;
              valueAsNumber: number;
            }) => {
              onInputChange(details.value, details.valueAsNumber);
            }}
          >
            <NumberInputField
              disabled={!!showResult}
              placeholder="背番号の合計を入力..."
              aria-label="答えの入力欄"
              data-testid="number-input"
            />
          </NumberInputRoot>
        </div>
      </div>
      <div className="flex gap-4 mt-6">
        <button
          className="flex-1 font-bold text-white py-2 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border-none"
          style={{
            backgroundColor: "var(--interactive-primary)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--interactive-primary-hover)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--interactive-primary)")
          }
          onClick={onAnswer}
          disabled={showResult || inputValue === ""}
        >
          <Ruby reading="かいとう">解答</Ruby>する
        </button>
        <button
          className="flex-1 font-bold text-white py-2 px-4 rounded-md transition-colors cursor-pointer border-none"
          style={{
            backgroundColor: "var(--interactive-primary)",
          }}
          onMouseOver={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--interactive-primary-hover)")
          }
          onMouseOut={(e) =>
            (e.currentTarget.style.backgroundColor =
              "var(--interactive-primary)")
          }
          onClick={onRetry}
        >
          <Ruby reading="さいちょうせん">再挑戦</Ruby>
        </button>
      </div>
    </div>
  );
}

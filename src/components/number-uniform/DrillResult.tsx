import Ruby from "@/components/common/Ruby";
import { useFurigana } from "@/contexts/FuriganaContext";
import type { QuestionType } from "@/lib/drill";

type Props = {
  isCorrected: boolean;
  question: QuestionType;
};

export default function DrillResult({ isCorrected, question }: Props) {
  const { furigana } = useFurigana();

  return (
    <div
      className="p-6 rounded-lg border"
      style={{
        backgroundColor: isCorrected
          ? "var(--surface-success)"
          : "var(--surface-error)",
        borderColor: isCorrected
          ? "var(--border-success)"
          : "var(--border-error)",
      }}
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col gap-4 items-stretch">
        <div className="flex items-center">
          <span className="text-xl font-bold">
            {isCorrected ? (
              <>
                🎉 <Ruby reading="せいかい">正解</Ruby>！
              </>
            ) : (
              <>
                😢 <Ruby reading="ふせいかい">不正解</Ruby>...
              </>
            )}
          </span>
          <div className="flex-1" />
          <span
            className={`text-base px-3 py-1 rounded-md font-semibold ${
              isCorrected
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {isCorrected ? (
              <Ruby reading="せいかい">正解</Ruby>
            ) : (
              <Ruby reading="ふせいかい">不正解</Ruby>
            )}
          </span>
        </div>
        <div
          className="border-t pt-4"
          style={{
            borderColor: isCorrected
              ? "var(--border-success)"
              : "var(--border-error)",
          }}
        >
          <p className="font-bold mb-2">
            <Ruby reading="かいせつ">解説</Ruby>：
          </p>
          <p className="text-lg">
            {question.correctNumber} ={" "}
            {furigana
              ? question.players.map((p, i) => (
                  <span key={i}>
                    {i > 0 && ` ${question.operatorSymbols[i - 1]} `}
                    {p.numberDisp}（<Ruby reading={p.nameKana}>{p.name}</Ruby>）
                  </span>
                ))
              : question.explanationSentence}
          </p>
        </div>
      </div>
    </div>
  );
}

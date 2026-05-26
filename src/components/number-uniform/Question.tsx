"use client";

import { useReducer, useState, useEffect, useCallback } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { PlayerType } from "@/types/Player";
import {
  initDrillState,
  reducer,
  generateQuestionWithOperators,
  generateDrillQuestion,
} from "@/lib/drill";
import {
  loadDrillScore,
  saveDrillScore,
  resetDrillScore,
  type DrillScoreRecord,
} from "@/lib/drillScore";
import Ruby from "@/components/common/Ruby";
import DrillSettings from "./DrillSettings";
import DrillQuestion from "./DrillQuestion";
import DrillResult from "./DrillResult";

type Props = {
  players: PlayerType[];
};

const Question: React.FC<Props> = ({ players }) => {
  const [drillState, dispatch] = useReducer(
    reducer,
    (() => {
      const { selectedPlayers, operatorSequence } = generateDrillQuestion(
        players,
        initDrillState.mode,
      );
      return {
        ...initDrillState,
        currentDrillPlayers: selectedPlayers,
        currentOperatorSequence: operatorSequence,
      };
    })(),
  );

  const [score, setScore] = useState<DrillScoreRecord>({
    total: 0,
    correct: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setScore(loadDrillScore());
    setMounted(true);
  }, []);

  const question = generateQuestionWithOperators(
    drillState.currentDrillPlayers,
    drillState.mode.operators,
    drillState.currentOperatorSequence,
  );
  const isCorrected = question.correctNumber === drillState.answeredNumber;

  const handleAnswer = useCallback(() => {
    dispatch({ type: "answered" });
    const isCorrect = question.correctNumber === drillState.answeredNumber;
    const newScore = {
      total: score.total + 1,
      correct: score.correct + (isCorrect ? 1 : 0),
    };
    setScore(newScore);
    saveDrillScore(newScore);
    sendGAEvent("event", "drill_answer", {
      is_correct: isCorrect,
      operators: drillState.mode.operators.join(","),
      player_num: drillState.mode.playerNum,
    });
  }, [
    question.correctNumber,
    drillState.answeredNumber,
    drillState.mode,
    score,
  ]);

  const handleReset = useCallback(() => {
    resetDrillScore();
    setScore({ total: 0, correct: 0 });
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex flex-col gap-6 items-stretch">
        {mounted && score.total > 0 && (
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: "var(--surface-card)",
              borderColor: "var(--border-card)",
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-base">
                  <Ruby reading="せいせき">成績</Ruby>：{score.correct} /{" "}
                  {score.total}
                  <span
                    className="ml-2 text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    （<Ruby reading="せいかいりつ">正解率</Ruby>{" "}
                    {Math.round((score.correct / score.total) * 100)}%）
                  </span>
                </p>
              </div>
              <button
                className="text-xs px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                onClick={handleReset}
              >
                <Ruby reading="り">リ</Ruby>セット
              </button>
            </div>
          </div>
        )}

        <DrillSettings
          mode={drillState.mode}
          onModeChange={(mode) => dispatch({ type: "settings", mode })}
        />

        <DrillQuestion
          question={question}
          inputValue={drillState.inputValue}
          showResult={drillState.showResult}
          onAnswer={handleAnswer}
          onInputChange={(value, valueAsNumber) => {
            dispatch({ type: "answering", value, valueAsNumber });
          }}
          onRetry={() => {
            dispatch({ type: "retry", allPlayers: players });
          }}
        />

        {drillState.showResult && (
          <DrillResult isCorrected={isCorrected} question={question} />
        )}
      </div>
    </div>
  );
};

export default Question;

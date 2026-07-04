"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { FiArrowUp, FiArrowDown } from "react-icons/fi";
import { LineupSpot, Position } from "./LineupCreator";
import { PlayerType } from "@/types/Player";
import { POSITION_READINGS } from "@/types/common";
import Ruby from "@/components/common/Ruby";

type DraggableLineupProps = {
  orderedPlayers: LineupSpot[];
  onDragEnd: (result: DropResult) => void;
  onMove: (index: number, delta: number) => void;
  removePlayerFromOrder: (position: Position) => void;
  getDisplayName: (player: PlayerType | null) => string;
};

export default function DraggableLineup({
  orderedPlayers,
  onDragEnd,
  onMove,
  removePlayerFromOrder,
  getDisplayName,
}: DraggableLineupProps) {
  // マウント状態を追跡する
  const [mounted, setMounted] = useState(false);

  // クライアントサイドでのみ実行されるようにする
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // マウントされるまでは空のコンテンツを返す
  if (!mounted) {
    return (
      <div
        className="border rounded-md p-4 min-h-[100px]"
        style={{
          borderColor: "var(--border-card)",
          backgroundColor: "var(--surface-card)",
        }}
      >
        <p className="text-center" style={{ color: "var(--text-secondary)" }}>
          ドラッグ＆ドロップ領域を読み込み中...
        </p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-batting-order">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="border rounded-md p-3 min-h-[50px]"
            style={{
              borderColor: "var(--border-card)",
              backgroundColor: snapshot.isDraggingOver
                ? "var(--surface-brand)"
                : "var(--surface-card-subtle)",
            }}
          >
            {orderedPlayers.length === 0 ? (
              <p
                className="text-center py-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <Ruby reading="だじゅん">打順</Ruby>が
                <Ruby reading="せってい">設定</Ruby>されていません
              </p>
            ) : (
              orderedPlayers.map((spot, index) => (
                <Draggable
                  key={spot.position}
                  draggableId={spot.position}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      aria-roledescription="ドラッグ可能"
                      aria-label={`${spot.order}番 ${spot.position} ${spot.player ? getDisplayName(spot.player) : ""}`}
                      className="mb-2 p-3 border rounded-md"
                      style={{
                        borderColor: snapshot.isDragging
                          ? "var(--border-brand)"
                          : "var(--border-card)",
                        backgroundColor: snapshot.isDragging
                          ? "var(--surface-brand)"
                          : "var(--surface-card-subtle)",
                        boxShadow: snapshot.isDragging
                          ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                          : "none",
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center flex-wrap">
                          <span
                            className="font-bold mr-3 text-lg"
                            style={{ color: "var(--interactive-primary)" }}
                          >
                            {spot.order}
                            <Ruby reading="ばん">番</Ruby>
                          </span>
                          <span className="mr-2 px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-sm">
                            <Ruby reading={POSITION_READINGS[spot.position]}>
                              {spot.position}
                            </Ruby>
                          </span>
                          <span className="font-bold">
                            {spot.player && (
                              <span className="flex items-center">
                                <span className="px-2 py-0.5 rounded mr-2 bg-blue-100 text-blue-800 text-sm font-semibold">
                                  {spot.player.number_disp}
                                </span>
                                {getDisplayName(spot.player)}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            className="flex items-center justify-center min-w-11 min-h-11 rounded border border-[var(--border-card)] bg-[var(--surface-card)] hover:bg-[var(--surface-brand)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            onClick={() => onMove(index, -1)}
                            disabled={index === 0}
                            aria-label={`${spot.order}番を1つ上へ移動`}
                          >
                            <FiArrowUp aria-hidden="true" />
                          </button>
                          <button
                            className="flex items-center justify-center min-w-11 min-h-11 rounded border border-[var(--border-card)] bg-[var(--surface-card)] hover:bg-[var(--surface-brand)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            onClick={() => onMove(index, 1)}
                            disabled={index === orderedPlayers.length - 1}
                            aria-label={`${spot.order}番を1つ下へ移動`}
                          >
                            <FiArrowDown aria-hidden="true" />
                          </button>
                          <button
                            className="text-sm px-3 min-h-11 text-red-600 border border-red-300 rounded hover:bg-red-50 cursor-pointer"
                            onClick={() => removePlayerFromOrder(spot.position)}
                          >
                            <Ruby reading="かいじょ">解除</Ruby>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

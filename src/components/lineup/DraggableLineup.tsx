"use client";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";
import { useState, useEffect } from "react";
import { LineupSpot, Position } from "./LineupCreator";
import { PlayerType } from "@/types/Player";

type DraggableLineupProps = {
  orderedPlayers: LineupSpot[];
  onDragEnd: (result: DropResult) => void;
  removePlayerFromOrder: (position: Position) => void;
  getDisplayName: (player: PlayerType | null) => string;
};

export default function DraggableLineup({
  orderedPlayers,
  onDragEnd,
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
                打順が設定されていません
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
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span
                            className="font-bold mr-3 text-lg"
                            style={{ color: "var(--interactive-primary)" }}
                          >
                            {spot.order}番
                          </span>
                          <span className="mr-2 px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-sm">
                            {spot.position}
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
                        <button
                          className="text-xs px-2 py-1 text-red-600 border border-red-300 rounded hover:bg-red-50"
                          onClick={() => removePlayerFromOrder(spot.position)}
                        >
                          打順を解除
                        </button>
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

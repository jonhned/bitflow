"use client";

import { useState } from "react";

interface DragDropGameProps {
  items: { id: string; content: string }[];
  targets: { id: string; label: string; acceptIds: string[] }[];
  onComplete: (correct: boolean) => void;
}

export function DragDropGame({ items, targets, onComplete }: DragDropGameProps) {
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleDragStart = (itemId: string) => {
    setDraggedItem(itemId);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedItem) return;
    setMatches((prev) => ({ ...prev, [targetId]: draggedItem }));
    setDraggedItem(null);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = targets.every(
      (t) => matches[t.id] && t.acceptIds.includes(matches[t.id])
    );
    onComplete(allCorrect);
  };

  const getUnmatchedItems = () => {
    const matched = new Set(Object.values(matches));
    return items.filter((item) => !matched.has(item.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-surface-alt rounded-lg border border-border">
        {getUnmatchedItems().length === 0 ? (
          <span className="text-xs text-zinc-500">Todos los elementos asignados</span>
        ) : (
          getUnmatchedItems().map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              className="px-3 py-1.5 bg-surface border border-border rounded-lg text-xs cursor-grab active:cursor-grabbing hover:border-neon/50 transition-colors"
            >
              {item.content}
            </div>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {targets.map((target) => {
          const matchedItem = matches[target.id]
            ? items.find((i) => i.id === matches[target.id])
            : null;
          const isCorrect = submitted && matchedItem && target.acceptIds.includes(matchedItem.id);

          return (
            <div
              key={target.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(target.id)}
              className={`p-3 rounded-lg border-2 border-dashed transition-all min-h-[80px] ${
                submitted
                  ? isCorrect
                    ? "border-neon bg-neon/5"
                    : "border-error bg-error/5"
                  : matchedItem
                  ? "border-neon/40 bg-surface"
                  : "border-border bg-surface-alt hover:border-neon/20"
              }`}
            >
              <p className="text-xs text-zinc-400 mb-2">{target.label}</p>
              {matchedItem ? (
                <div className="px-2 py-1 bg-surface rounded text-xs">
                  {matchedItem.content}
                </div>
              ) : (
                <p className="text-xs text-zinc-600 italic">
                  Arrastra aquí
                </p>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(matches).length === targets.length && !submitted && (
        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors"
        >
          Verificar Respuestas
        </button>
      )}
    </div>
  );
}
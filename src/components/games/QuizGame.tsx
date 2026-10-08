"use client";

import { useState } from "react";

interface QuizGameProps {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  onCorrect: () => void;
  onWrong: () => void;
}

export function QuizGame({
  question,
  options,
  correctAnswer,
  explanation,
  onCorrect,
  onWrong,
}: QuizGameProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const isCorrect = selected === correctAnswer;

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    setShowResult(true);
    if (index === correctAnswer) {
      onCorrect();
    } else {
      onWrong();
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-surface-alt rounded-lg border border-border">
        <p className="text-sm font-medium leading-relaxed">{question}</p>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => {
          let style = "bg-surface border-border hover:border-neon/50 hover:bg-surface-alt";
          if (showResult) {
            if (index === correctAnswer) {
              style = "bg-neon/10 border-neon text-neon";
            } else if (index === selected && !isCorrect) {
              style = "bg-error/10 border-error text-error";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={selected !== null}
              className={`w-full text-left p-3 rounded-lg border text-sm transition-all ${style}`}
            >
              <span className="font-mono text-xs mr-2 opacity-50">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {showResult && (
        <div
          className={`p-3 rounded-lg border text-sm ${
            isCorrect
              ? "bg-neon/5 border-neon/20 text-neon"
              : "bg-error/5 border-error/20 text-error"
          }`}
        >
          <p className="font-bold mb-1">
            {isCorrect ? "¡Correcto!" : "Incorrecto"}
          </p>
          <p className="text-xs text-zinc-300">{explanation}</p>
        </div>
      )}
    </div>
  );
}
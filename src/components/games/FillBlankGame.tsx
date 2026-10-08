"use client";

import { useState } from "react";

interface FillBlankGameProps {
  code: string;
  blanks: { id: string; answer: string; hint: string }[];
  onComplete: (correct: boolean) => void;
}

export function FillBlankGame({ code, blanks, onComplete }: FillBlankGameProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const codeParts = code.split(/(\{\{[^}]+\}\})/g);

  const handleAnswerChange = (blankId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = blanks.every((b) => {
      const userAnswer = (answers[b.id] || "").trim().toLowerCase();
      const correctAnswer = b.answer.trim().toLowerCase();
      return userAnswer === correctAnswer;
    });
    onComplete(allCorrect);
  };

  const allFilled = blanks.every((b) => (answers[b.id] || "").trim() !== "");

  return (
    <div className="space-y-4">
      <div className="p-4 bg-surface rounded-lg border border-border">
        <p className="text-xs text-zinc-400 mb-3">
          Completa los espacios en blanco para que el código funcione:
        </p>

        <div className="font-mono text-sm leading-7">
          {codeParts.map((part, i) => {
            const blankMatch = part.match(/\{\{([^}]+)\}\}/);
            if (blankMatch) {
              const blankId = blankMatch[1];
              const blank = blanks.find((b) => b.id === blankId);
              const userAnswer = answers[blankId] || "";
              const isCorrect =
                submitted && blank && userAnswer.trim().toLowerCase() === blank.answer.trim().toLowerCase();

              return (
                <span key={i} className="inline-flex items-center">
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => handleAnswerChange(blankId, e.target.value)}
                    disabled={submitted}
                    className={`w-32 px-2 py-0.5 mx-1 rounded border text-center font-mono text-sm transition-colors ${
                      submitted
                        ? isCorrect
                          ? "bg-neon/10 border-neon text-neon"
                          : "bg-error/10 border-error text-error"
                        : "bg-surface-alt border-border focus:border-neon focus:outline-none"
                    }`}
                    placeholder="..."
                  />
                  {submitted && !isCorrect && blank && (
                    <span className="text-xs text-error ml-1">
                      ({blank.answer})
                    </span>
                  )}
                </span>
              );
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>

      {submitted && (
        <div className="space-y-2">
          {blanks.map((blank) => {
            const userAnswer = (answers[blank.id] || "").trim().toLowerCase();
            const isCorrect = userAnswer === blank.answer.trim().toLowerCase();

            return (
              <div
                key={blank.id}
                className={`p-2 rounded-lg text-xs ${
                  isCorrect
                    ? "bg-neon/5 border border-neon/20 text-neon"
                    : "bg-error/5 border border-error/20 text-error"
                }`}
              >
                {isCorrect ? "✓" : "✗"} {blank.hint}
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allFilled || submitted}
        className="w-full py-2 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitted ? "Respuestas Enviadas" : "Verificar Respuestas"}
      </button>
    </div>
  );
}
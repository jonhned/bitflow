"use client";

import { useState } from "react";

interface CodeMatchGameProps {
  pairs: { code: string; output: string }[];
  onComplete: (correct: boolean) => void;
}

export function CodeMatchGame({ pairs, onComplete }: CodeMatchGameProps) {
  const [selectedCode, setSelectedCode] = useState<number | null>(null);
  const [selectedOutput, setSelectedOutput] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const shuffledOutputs = pairs.map((p, i) => ({ ...p, originalIndex: i }));

  const handleCodeClick = (index: number) => {
    if (submitted || matches[index] !== undefined) return;
    setSelectedCode(index);
    if (selectedOutput !== null) {
      setMatches((prev) => ({ ...prev, [index]: selectedOutput }));
      setSelectedCode(null);
      setSelectedOutput(null);
    }
  };

  const handleOutputClick = (index: number) => {
    if (submitted) return;
    const isMatched = Object.values(matches).includes(index);
    if (isMatched) return;
    setSelectedOutput(index);
    if (selectedCode !== null) {
      setMatches((prev) => ({ ...prev, [selectedCode]: index }));
      setSelectedCode(null);
      setSelectedOutput(null);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const allCorrect = Object.entries(matches).every(
      ([codeIdx, outputIdx]) => pairs[Number(codeIdx)]?.output === shuffledOutputs[outputIdx]?.output
    );
    onComplete(allCorrect);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-zinc-400">
        Haz clic en un código y luego en su resultado para emparejarlos.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="text-xs font-bold text-zinc-300 mb-2">Código</p>
          {pairs.map((pair, i) => {
            const isMatched = matches[i] !== undefined;
            return (
              <button
                key={`code-${i}`}
                onClick={() => handleCodeClick(i)}
                disabled={isMatched}
                className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                  selectedCode === i
                    ? "border-neon bg-neon/10"
                    : isMatched
                    ? "border-neon/30 bg-neon/5 opacity-60"
                    : "border-border bg-surface hover:border-neon/30"
                }`}
              >
                {pair.code}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-zinc-300 mb-2">Resultado</p>
          {shuffledOutputs.map((pair, i) => {
            const isMatched = Object.values(matches).includes(i);
            return (
              <button
                key={`output-${i}`}
                onClick={() => handleOutputClick(i)}
                disabled={isMatched}
                className={`w-full text-left p-2 rounded-lg border text-xs font-mono transition-all ${
                  selectedOutput === i
                    ? "border-neon bg-neon/10"
                    : isMatched
                    ? "border-neon/30 bg-neon/5 opacity-60"
                    : "border-border bg-surface hover:border-neon/30"
                }`}
              >
                {pair.output}
              </button>
            );
          })}
        </div>
      </div>

      {Object.keys(matches).length === pairs.length && !submitted && (
        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors"
        >
          Verificar
        </button>
      )}

      {submitted && (
        <div className="p-3 bg-surface rounded-lg border border-border">
          <p className="text-xs text-zinc-400">
            {Object.entries(matches).every(
              ([codeIdx, outputIdx]) => pairs[Number(codeIdx)]?.output === shuffledOutputs[outputIdx]?.output
            )
              ? "¡Todos los emparejamientos son correctos!"
              : "Algunos emparejamientos son incorrectos. ¡Revisa!"}
          </p>
        </div>
      )}
    </div>
  );
}
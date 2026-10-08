"use client";

import { useEffect, useRef, useState } from "react";

interface CelebrationProps {
  show: boolean;
  xpEarned: number;
  onClose: () => void;
}

const COLORS = ["#00ff88", "#a855f7", "#00b4d8", "#ffd700", "#ff6b35"];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
}

export function Celebration({ show, xpEarned, onClose }: CelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const hasGenerated = useRef(false);

  useEffect(() => {
    if (!show) {
      hasGenerated.current = false;
      return;
    }

    if (!hasGenerated.current) {
      hasGenerated.current = true;
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: ((i * 37 + 13) % 100),
        color: COLORS[i % COLORS.length],
        delay: ((i * 7 + 3) % 50) / 100,
      }));
      setParticles(newParticles);
    }

    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-2 h-2 rounded-full animate-confetti"
            style={{
              left: `${p.x}%`,
              backgroundColor: p.color,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative bg-surface border border-neon rounded-xl p-6 text-center glow-neon pointer-events-auto">
        <div className="text-4xl mb-2">&#127881;</div>
        <h2 className="text-xl font-bold text-neon mb-1">¡Reto Completado!</h2>
        <p className="text-3xl font-bold font-mono text-neon">+{xpEarned} XP</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-neon/20 text-neon rounded-lg text-sm hover:bg-neon/30 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
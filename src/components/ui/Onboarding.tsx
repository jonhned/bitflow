"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";

const STEPS = [
  {
    icon: "👋",
    title: "¡Bienvenido a BitFlow!",
    description:
      "La plataforma donde aprenderás a programar con retos interactivos, proyectos reales y un sistema de gamificación que te mantendrá motivado.",
  },
  {
    icon: "⚡",
    title: "Gana XP y Sube de Nivel",
    description:
      "Cada reto que completas te da puntos de experiencia. A más XP, mayor será tu nivel y más skins podrás desbloquear.",
  },
  {
    icon: "🔥",
    title: "Mantén tu Racha",
    description:
      "Practica todos los días para mantener tu racha activa. ¡No la pierdas! La constancia es la clave del aprendizaje.",
  },
  {
    icon: "🎯",
    title: "Elige tu Curso",
    description:
      "Tenemos 4 cursos: HTML, CSS, JavaScript y PHP+MySQL. Cada uno tiene retos, quizzes y un proyecto final 100% práctico.",
  },
  {
    icon: "🏆",
    title: "Completa Proyectos Finales",
    description:
      "Al final de cada curso aplicarás todo lo aprendido en un proyecto real: portafolio, landing page, app de tareas o sistema CRUD.",
  },
];

export function Onboarding() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("bitflow-onboarding-seen");
    if (!seen) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      setShowNameInput(true);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("bitflow-onboarding-seen", "true");
    setIsVisible(false);
  };

  const handleComplete = () => {
    localStorage.setItem("bitflow-onboarding-seen", "true");
    if (user && userName.trim()) {
      setUser({ ...user, name: userName.trim() });
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-border overflow-hidden">
        {!showNameInput ? (
          <>
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center text-4xl mx-auto mb-4">
                {step.icon}
              </div>
              <h2 className="text-xl font-bold mb-2">{step.title}</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                {step.description}
              </p>
            </div>

            <div className="px-6 pb-2">
              <div className="flex items-center justify-center gap-2">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === currentStep
                        ? "w-6 bg-neon"
                        : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="p-6 pt-4 flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-2.5 border border-border rounded-lg text-sm text-zinc-400 hover:border-neon/50 transition-colors"
              >
                Saltar
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-2.5 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors"
              >
                {isLastStep ? "Comenzar" : "Siguiente"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-6 text-center">
              <div className="w-20 h-20 rounded-full bg-neon/10 border border-neon/20 flex items-center justify-center text-4xl mx-auto mb-4">
                ✨
              </div>
              <h2 className="text-xl font-bold mb-2">¿Cómo te llamas?</h2>
              <p className="text-sm text-zinc-400 mb-4">
                Este nombre se mostrará en tu perfil y en el ranking.
              </p>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Tu nombre"
                maxLength={20}
                className="w-full px-4 py-3 bg-surface-alt border border-border rounded-lg text-center text-lg focus:border-neon focus:outline-none"
                autoFocus
              />
            </div>

            <div className="p-6 pt-2">
              <button
                onClick={handleComplete}
                disabled={!userName.trim()}
                className="w-full py-3 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ¡Comenzar a Aprender!
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
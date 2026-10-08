"use client";

import { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { LivePreview } from "@/components/editor/LivePreview";
import { ChallengeTabs } from "@/components/editor/ChallengeTabs";
import { Celebration } from "@/components/game/Celebration";
import { QuizGame } from "@/components/games/QuizGame";
import { FillBlankGame } from "@/components/games/FillBlankGame";
import { useAppStore, getDefaultUser } from "@/lib/store";
import { getChallengeById, getNextChallengeId } from "@/lib/modules";
import type { CodeChallenge, QuizChallenge, FillBlankChallenge } from "@/types";

export default function ChallengePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-neon animate-pulse">Cargando reto...</div>
        </div>
      }
    >
      <ChallengePage />
    </Suspense>
  );
}

function ChallengePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const addXP = useAppStore((s) => s.addXP);
  const completeChallenge = useAppStore((s) => s.completeChallenge);

  const challengeData = getChallengeById(id);

  const [code, setCode] = useState(
    challengeData && (challengeData.challenge.type === "code" || challengeData.challenge.type === "bug-fix")
      ? (challengeData.challenge as CodeChallenge).initialCode
      : ""
  );
  const [activeTab, setActiveTab] = useState<"instructions" | "editor" | "result">("instructions");
  const [showCelebration, setShowCelebration] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [attempts, setAttempts] = useState(0);

  if (!user) {
    setUser(getDefaultUser());
    return null;
  }

  if (!challengeData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Reto no encontrado</h1>
            <button
              onClick={() => router.push("/courses")}
              className="text-neon hover:underline"
            >
              Volver a Cursos
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { challenge, course, module: courseModule } = challengeData;
  const isCodeChallenge = challenge.type === "code" || challenge.type === "bug-fix";
  const isQuizChallenge = challenge.type === "quiz";
  const isFillBlank = challenge.type === "fill-blank";
  const isCompleted = user.completedChallenges.includes(challenge.id);
  const nextChallengeId = getNextChallengeId(id);

  const handleChallengeComplete = (xpToAward: number) => {
    const alreadyCompleted = user.completedChallenges.includes(challenge.id);
    const finalXP = alreadyCompleted ? 0 : xpToAward;

    setEarnedXP(finalXP);
    setValidationResult({
      success: true,
      message: alreadyCompleted
        ? "Ya habias completado este reto!"
        : `Correcto! +${finalXP} XP`,
    });

    if (!alreadyCompleted) {
      addXP(xpToAward);
      completeChallenge(challenge.id, {
        id: crypto.randomUUID(),
        userId: user.id,
        challengeId: challenge.id,
        courseId: course.id,
        moduleId: courseModule.id,
        attempts: attempts + 1,
        timeSpent: 0,
        completed: true,
        completedAt: new Date().toISOString(),
        hintsUsed: hintIndex,
        errorCount: attempts,
      });
    }

    setShowCelebration(true);
  };

  const handleCodeValidate = () => {
    if (!isCodeChallenge) return;

    setAttempts((a) => a + 1);
    const codeCh = challenge as CodeChallenge;

    let success = false;

    if (codeCh.validationType === "regex") {
      const regex = new RegExp(codeCh.validation, "i");
      success = regex.test(code);
    } else if (codeCh.validationType === "contains") {
      success = code.includes(codeCh.validation);
    }

    if (success) {
      handleChallengeComplete(challenge.rewardXP);
    } else {
      setValidationResult({
        success: false,
        message: "El codigo no cumple con los requisitos. Revisa las instrucciones!",
      });
    }
  };

  const handleQuizComplete = (correct: boolean) => {
    if (!isQuizChallenge) return;
    setAttempts((a) => a + 1);
    if (correct) {
      handleChallengeComplete(challenge.rewardXP);
    }
  };

  const handleFillBlankComplete = (correct: boolean) => {
    if (!isFillBlank) return;
    setAttempts((a) => a + 1);
    if (correct) {
      handleChallengeComplete(challenge.rewardXP);
    } else {
      setValidationResult({
        success: false,
        message: "Algunas respuestas son incorrectas. Revisa las pistas!",
      });
    }
  };

  const handleShowHint = () => {
    if (hintIndex < challenge.hints.length - 1) {
      setHintIndex((i) => i + 1);
    }
    setShowHint(true);
  };

  const getTypeLabel = () => {
    if (isCodeChallenge) return "Codigo";
    if (isQuizChallenge) return "Quiz";
    if (isFillBlank) return "Completar";
    return "Reto";
  };

  const instructionsPanel = (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-xs px-2 py-0.5 rounded-full border"
          style={{
            borderColor: `${course.color}40`,
            color: course.color,
            backgroundColor: `${course.color}10`,
          }}
        >
          {course.technology.toUpperCase()}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-zinc-400 border border-border">
          {getTypeLabel()}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-alt text-zinc-400 border border-border">
          {challenge.difficulty}
        </span>
        {isCompleted && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-neon/10 text-neon border border-neon/20">
            Completado
          </span>
        )}
      </div>

      <h2 className="text-lg font-bold">{challenge.title}</h2>

      <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
        {challenge.instructions}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <span className="text-xs text-zinc-500 font-mono">
          Recompensa: {challenge.rewardXP} XP
        </span>
      </div>

      {showHint && challenge.hints.length > 0 && (
        <div className="p-3 bg-neon/5 border border-neon/20 rounded-lg">
          <p className="text-xs text-neon font-bold mb-1">Pista {hintIndex + 1}:</p>
          <p className="text-sm text-zinc-300">
            {challenge.hints[Math.min(hintIndex, challenge.hints.length - 1)]}
          </p>
        </div>
      )}

      {challenge.hints.length > 0 && (
        <button
          onClick={handleShowHint}
          className="text-xs text-zinc-400 hover:text-neon transition-colors"
        >
          {showHint ? "Siguiente pista" : "Necesito una pista"}
        </button>
      )}
    </div>
  );

  const editorPanel = isCodeChallenge ? (
    <div className="h-full flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex-1" style={{ minHeight: 0, position: "relative" }}>
        <CodeEditor
          initialCode={(challenge as CodeChallenge).initialCode}
          language={course.technology}
          onChange={setCode}
        />
      </div>
      <div className="p-3 border-t border-border bg-surface flex items-center gap-3">
        <button
          onClick={handleCodeValidate}
          className="px-6 py-2.5 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors"
        >
          Validar Codigo
        </button>
        {validationResult && (
          <span
            className={`text-sm font-medium ${
              validationResult.success ? "text-neon" : "text-error"
            }`}
          >
            {validationResult.message}
          </span>
        )}
      </div>
    </div>
  ) : isQuizChallenge ? (
    <div className="h-full overflow-y-auto p-6">
      <QuizGame
        question={(challenge as QuizChallenge).instructions}
        options={(challenge as QuizChallenge).options}
        correctAnswer={(challenge as QuizChallenge).correctAnswer}
        explanation={(challenge as QuizChallenge).explanation}
        onCorrect={() => handleQuizComplete(true)}
        onWrong={() => handleQuizComplete(false)}
      />
      {validationResult && (
        <div
          className="mt-4 p-3 rounded-lg text-sm text-center font-medium"
          style={{
            color: validationResult.success ? "#00ff88" : "#ff4444",
            backgroundColor: validationResult.success
              ? "rgba(0,255,136,0.1)"
              : "rgba(255,68,68,0.1)",
          }}
        >
          {validationResult.message}
        </div>
      )}
    </div>
  ) : isFillBlank ? (
    <div className="h-full overflow-y-auto p-6">
      <FillBlankGame
        code={(challenge as FillBlankChallenge).code}
        blanks={(challenge as FillBlankChallenge).blanks}
        onComplete={handleFillBlankComplete}
      />
      {validationResult && (
        <div
          className="mt-4 p-3 rounded-lg text-sm text-center font-medium"
          style={{
            color: validationResult.success ? "#00ff88" : "#ff4444",
            backgroundColor: validationResult.success
              ? "rgba(0,255,136,0.1)"
              : "rgba(255,68,68,0.1)",
          }}
        >
          {validationResult.message}
        </div>
      )}
    </div>
  ) : null;

  const resultPanel = isCodeChallenge ? <LivePreview code={code} /> : null;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        <div className="hidden lg:block lg:w-[35%] xl:w-[30%] border-r border-border overflow-y-auto bg-surface">
          <div className="p-6">{instructionsPanel}</div>
        </div>

        <div className="flex-1 lg:hidden h-full">
          <ChallengeTabs
            instructions={instructionsPanel}
            editor={editorPanel}
            result={resultPanel}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <div className="hidden lg:flex flex-col flex-1 border-r border-border" style={{ minWidth: 0, minHeight: 0 }}>
          {editorPanel}
        </div>

        {resultPanel && (
          <div className="hidden lg:flex flex-col w-[35%] xl:w-[30%]" style={{ minWidth: 0, minHeight: 0 }}>
            {resultPanel}
          </div>
        )}
      </div>

      <Celebration
        show={showCelebration}
        xpEarned={earnedXP}
        onClose={() => {
          setShowCelebration(false);
          if (nextChallengeId) {
            router.push(`/challenge/${nextChallengeId}`);
          } else {
            router.push(`/courses/${course.id}`);
          }
        }}
      />
    </div>
  );
}
"use client";

import { useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { LivePreview } from "@/components/editor/LivePreview";
import { ChallengeTabs } from "@/components/editor/ChallengeTabs";
import { Celebration } from "@/components/game/Celebration";
import { useAppStore, getDefaultUser } from "@/lib/store";
import type { FinalProject, Course, ProjectRequirement } from "@/types";

interface ProjectWorkspaceProps {
  project: FinalProject;
  course: Course;
}

export function ProjectWorkspace({ project, course }: ProjectWorkspaceProps) {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const addXP = useAppStore((s) => s.addXP);
  const completeChallenge = useAppStore((s) => s.completeChallenge);

  const [code, setCode] = useState(project.starterCode);
  const [activeTab, setActiveTab] = useState<"instructions" | "editor" | "result">("instructions");
  const [checkedReqs, setCheckedReqs] = useState<Set<string>>(new Set());
  const [validatedReqs, setValidatedReqs] = useState<Map<string, boolean>>(new Map());
  const [showCelebration, setShowCelebration] = useState(false);

  if (!user) {
    setUser(getDefaultUser());
    return null;
  }

  const isProjectCompleted = user.completedChallenges.includes(project.id);
  const completedCount = validatedReqs.size;
  const totalCount = project.requirements.length;
  const allValidated = completedCount === totalCount;

  const toggleReq = (reqId: string) => {
    setCheckedReqs((prev) => {
      const next = new Set(prev);
      if (next.has(reqId)) next.delete(reqId);
      else next.add(reqId);
      return next;
    });
  };

  const validateRequirements = () => {
    const results = new Map<string, boolean>();
    for (const req of project.requirements) {
      if (req.validationRegex) {
        const regex = new RegExp(req.validationRegex, "i");
        results.set(req.id, regex.test(code));
      } else {
        results.set(req.id, checkedReqs.has(req.id));
      }
    }
    setValidatedReqs(results);

    const allPassed = Array.from(results.values()).every(Boolean);
    if (allPassed && !isProjectCompleted) {
      addXP(project.xpReward);
      completeChallenge(project.id, {
        id: crypto.randomUUID(),
        userId: user.id,
        challengeId: project.id,
        courseId: course.id,
        moduleId: "final-project",
        attempts: 1,
        timeSpent: 0,
        completed: true,
        completedAt: new Date().toISOString(),
        hintsUsed: 0,
        errorCount: 0,
      });
      setShowCelebration(true);
    }
  };

  const resetValidation = () => {
    setValidatedReqs(new Map());
    setCheckedReqs(new Set());
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
          PROYECTO FINAL
        </span>
        {isProjectCompleted && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-neon/10 text-neon border border-neon/20">
            ✓ Completado
          </span>
        )}
      </div>

      <h2 className="text-lg font-bold">{project.title}</h2>
      <p className="text-sm text-zinc-300 leading-relaxed">{project.description}</p>

      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500 font-mono">
          Recompensa: {project.xpReward} XP
        </span>
      </div>

      <div className="pt-2">
        <h3 className="text-sm font-bold mb-3">
          Requisitos ({completedCount}/{totalCount})
        </h3>

        <div className="space-y-2">
          {project.requirements.map((req: ProjectRequirement) => {
            const isValidated = validatedReqs.get(req.id);
            const isChecked = checkedReqs.has(req.id);

            return (
              <div
                key={req.id}
                className={`p-3 rounded-lg border text-sm ${
                  isValidated === true
                    ? "border-neon/30 bg-neon/5"
                    : isValidated === false
                    ? "border-error/30 bg-error/5"
                    : isChecked
                    ? "border-border bg-surface-alt"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleReq(req.id)}
                    className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center text-xs mt-0.5 ${
                      isChecked || isValidated === true
                        ? "bg-neon border-neon text-background"
                        : "border-border"
                    }`}
                  >
                    {(isChecked || isValidated === true) && "✓"}
                  </button>
                  <div className="flex-1">
                    <p className={isValidated === true ? "text-neon" : ""}>{req.text}</p>
                    {isValidated === false && req.hint && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Pista: {req.hint}
                      </p>
                    )}
                  </div>
                  {isValidated === true && (
                    <span className="text-xs text-neon">✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={validateRequirements}
          className="flex-1 py-2 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors"
        >
          Validar Requisitos
        </button>
        <button
          onClick={resetValidation}
          className="px-4 py-2 border border-border rounded-lg text-sm text-zinc-400 hover:border-neon transition-colors"
        >
          Reiniciar
        </button>
      </div>

      {allValidated && (
        <div className="p-3 bg-neon/5 border border-neon/20 rounded-lg">
          <p className="text-sm text-neon font-bold">
            ¡Proyecto completado! +{project.xpReward} XP
          </p>
        </div>
      )}
    </div>
  );

  const editorPanel = (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <CodeEditor
          initialCode={project.starterCode}
          language={course.technology}
          onChange={setCode}
        />
      </div>
    </div>
  );

  const resultPanel = <LivePreview code={code} />;

  return (
    <div className="h-full">
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden h-[calc(100vh-56px)]">
        <div className="hidden lg:block lg:w-2/5 xl:w-1/3 border-r border-border overflow-y-auto p-6">
          {instructionsPanel}
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

        <div className="hidden lg:flex lg:w-1/2 xl:w-2/5 flex-col border-r border-border">
          <div className="flex-1 min-h-0">{editorPanel}</div>
        </div>

        <div className="hidden lg:block lg:w-1/3 xl:w-1/5">
          <div className="h-full">{resultPanel}</div>
        </div>
      </div>

      <Celebration
        show={showCelebration}
        xpEarned={project.xpReward}
        onClose={() => setShowCelebration(false)}
      />
    </div>
  );
}
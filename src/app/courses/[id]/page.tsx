"use client";

import { useParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { useAppStore, getDefaultUser } from "@/lib/store";
import { getCourseById, getCourseProgress } from "@/lib/modules";
import Link from "next/link";
import { Suspense } from "react";

export default function CoursePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-neon animate-pulse">Cargando curso...</div>
        </div>
      }
    >
      <CoursePage />
    </Suspense>
  );
}

function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;

  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  if (!user) {
    setUser(getDefaultUser());
    return null;
  }

  const course = getCourseById(courseId);

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Curso no encontrado</h1>
            <Link href="/courses" className="text-neon hover:underline">
              Ver cursos disponibles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const progress = getCourseProgress(course, user.completedChallenges);
  const isProjectCompleted = user.completedChallenges.includes(course.finalProject.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/courses"
          className="text-xs text-zinc-400 hover:text-neon transition-colors mb-4 inline-block"
        >
          &larr; Volver a cursos
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
              style={{
                backgroundColor: `${course.color}15`,
                border: `1px solid ${course.color}30`,
              }}
            >
              {course.icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <p className="text-sm text-zinc-400">{course.description}</p>
            </div>
          </div>

          <div className="p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Progreso del curso</span>
              <span className="text-xs font-mono" style={{ color: course.color }}>
                {progress.completed}/{progress.total} retos
              </span>
            </div>
            <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${progress.percentage}%`,
                  backgroundColor: course.color,
                }}
              />
            </div>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">Modulos del Curso</h2>

          <div className="space-y-4">
            {course.modules.map((mod, index) => {
              const completedInModule = mod.challenges.filter((c) =>
                user.completedChallenges.includes(c.id)
              ).length;
              const isModuleComplete = completedInModule === mod.challenges.length;

              return (
                <div
                  key={mod.id}
                  className="p-4 bg-surface rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: isModuleComplete
                          ? `${course.color}20`
                          : "var(--surface-alt)",
                        color: isModuleComplete ? course.color : "var(--foreground)",
                      }}
                    >
                      {isModuleComplete ? "✓" : index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm">{mod.title}</h3>
                      <p className="text-xs text-zinc-400">{mod.description}</p>
                    </div>
                    <span className="text-xs font-mono" style={{ color: course.color }}>
                      {completedInModule}/{mod.challenges.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {mod.challenges.map((challenge) => {
                      const isCompleted = user.completedChallenges.includes(challenge.id);

                      return (
                        <Link
                          key={challenge.id}
                          href={`/challenge/${challenge.id}`}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                            isCompleted
                              ? "bg-neon/5 hover:bg-neon/10"
                              : "hover:bg-surface-alt"
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            style={{
                              backgroundColor: isCompleted
                                ? `${course.color}20`
                                : "var(--surface-alt)",
                              color: isCompleted ? course.color : "var(--foreground)",
                            }}
                          >
                            {isCompleted ? "✓" : challenge.type === "quiz" ? "?" : "</>"}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm truncate">{challenge.title}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-zinc-500">
                                {challenge.type === "code"
                                  ? "Codigo"
                                  : challenge.type === "quiz"
                                  ? "Quiz"
                                  : challenge.type === "bug-fix"
                                  ? "Debug"
                                  : "Reto"}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {challenge.difficulty}
                              </span>
                            </div>
                          </div>

                          <span className="text-xs font-mono text-zinc-400">
                            +{challenge.rewardXP} XP
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="p-5 bg-surface rounded-xl border border-border">
          <h2 className="text-lg font-bold mb-2 flex items-center gap-2">
            <span style={{ color: course.color }}>&#9733;</span> Proyecto Final
          </h2>
          <h3 className="font-bold text-neon mb-1">{course.finalProject.title}</h3>
          <p className="text-sm text-zinc-400 mb-3">
            {course.finalProject.description}
          </p>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-mono px-2 py-1 rounded bg-neon/10 text-neon">
              +{course.finalProject.xpReward} XP
            </span>
            {isProjectCompleted && (
              <span className="text-xs px-2 py-1 rounded bg-neon/10 text-neon border border-neon/20">
                ✓ Completado
              </span>
            )}
          </div>

          <Link
            href={`/projects/${course.finalProject.id}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors"
          >
            {isProjectCompleted ? "Ver Proyecto" : "Comenzar Proyecto"} &rarr;
          </Link>
        </section>
      </main>
    </div>
  );
}
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useAppStore, getDefaultUser } from "@/lib/store";
import { getAllCourses } from "@/lib/modules";
import { formatTime } from "@/lib/utils";
import { useMemo } from "react";

function StatBox({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="p-4 bg-surface rounded-lg border border-border">
      <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </p>
      {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
    </div>
  );
}

function BarChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3">
      {data.map((item) => (
        <div key={item.label}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-zinc-300">{item.label}</span>
            <span className="text-xs font-mono" style={{ color: item.color }}>
              {item.value}
            </span>
          </div>
          <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsTable({
  data,
}: {
  data: {
    challengeId: string;
    attempts: number;
    timeSpent: number;
    completed: boolean;
  }[];
}) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-zinc-500 text-sm">
        No hay datos de analíticas aún. Los datos aparecerán cuando los
        estudiantes completen retos.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">
              RETO
            </th>
            <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">
              INTENTOS
            </th>
            <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">
              TIEMPO
            </th>
            <th className="text-left py-2 px-3 text-zinc-400 font-medium text-xs">
              ESTADO
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-2 px-3 font-mono text-xs">{entry.challengeId}</td>
              <td className="py-2 px-3">{entry.attempts}</td>
              <td className="py-2 px-3">{formatTime(entry.timeSpent)}</td>
              <td className="py-2 px-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    entry.completed
                      ? "bg-neon/10 text-neon border border-neon/20"
                      : "bg-error/10 text-error border border-error/20"
                  }`}
                >
                  {entry.completed ? "Completado" : "Incompleto"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminPage() {
  const user = useAppStore((s) => s.user);
  const analytics = useAppStore((s) => s.analytics);
  const setUser = useAppStore((s) => s.setUser);

  const courses = getAllCourses();

  const moduleStats = useMemo(() => {
    return courses.map((course) => {
      const allIds = course.modules.flatMap((m) => m.challenges.map((c) => c.id));
      const completed = user?.completedChallenges.filter((id) =>
        allIds.includes(id)
      ).length || 0;
      return {
        label: course.title,
        value: completed,
        total: allIds.length,
        color: course.color,
      };
    });
  }, [courses, user]);

  const completionRate = useMemo(() => {
    const totalChallenges = courses.reduce(
      (sum, c) => sum + c.modules.reduce((s, m) => s + m.challenges.length, 0),
      0
    );
    const completed = user?.completedChallenges.length || 0;
    return totalChallenges > 0
      ? Math.round((completed / totalChallenges) * 100)
      : 0;
  }, [courses, user]);

  const avgTime = useMemo(() => {
    if (analytics.length === 0) return 0;
    return Math.round(
      analytics.reduce((sum, a) => sum + a.timeSpent, 0) / analytics.length
    );
  }, [analytics]);

  const avgAttempts = useMemo(() => {
    if (analytics.length === 0) return 0;
    return (
      analytics.reduce((sum, a) => sum + a.attempts, 0) / analytics.length
    ).toFixed(1);
  }, [analytics]);

  if (!user) {
    setUser(getDefaultUser());
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Panel Docente</h1>
          <p className="text-sm text-zinc-400">
            Evidencias de aprendizaje y métricas de progreso estudiantil
          </p>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatBox
            label="Estudiantes Activos"
            value="1"
            sub="Sesión local"
            color="#00ff88"
          />
          <StatBox
            label="Tasa Finalización"
            value={`${completionRate}%`}
            sub="Del total de retos"
            color="#a855f7"
          />
          <StatBox
            label="Tiempo Promedio"
            value={formatTime(avgTime)}
            sub="Por reto"
            color="#00b4d8"
          />
          <StatBox
            label="Intentos Promedio"
            value={avgAttempts}
            sub="Por reto"
            color="#ff6b35"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="p-5 bg-surface rounded-lg border border-border">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="text-neon">&#9670;</span> Progreso por Módulo
            </h2>
            <BarChart data={moduleStats} />
          </div>

          <div className="p-5 bg-surface rounded-lg border border-border">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
              <span className="text-neon">&#9670;</span> Objetivo Pedagógico
            </h2>
            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="p-3 bg-surface-alt rounded-lg border border-border"
                >
                  <h3 className="text-xs font-bold mb-1" style={{ color: course.color }}>
                    {course.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {course.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="p-5 bg-surface rounded-lg border border-border">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span className="text-neon">&#9670;</span> Registro de Analíticas
            (LearningAnalytics)
          </h2>
          <AnalyticsTable data={analytics} />
        </section>

        <section className="mt-6 p-5 bg-surface rounded-lg border border-border">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <span className="text-neon">&#9670;</span> Exportar Datos
          </h2>
          <p className="text-xs text-zinc-400 mb-3">
            Exporta los datos de analíticas en formato JSON para generar reportes
            de impacto educativo.
          </p>
          <button
            onClick={() => {
              const dataStr = JSON.stringify(
                { user, analytics, exportedAt: new Date().toISOString() },
                null,
                2
              );
              const blob = new Blob([dataStr], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `bitflow-analytics-${
                new Date().toISOString().split("T")[0]
              }.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors"
          >
            Descargar Reporte JSON
          </button>
        </section>
      </main>
    </div>
  );
}
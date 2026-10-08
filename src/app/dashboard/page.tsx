"use client";

import { Navbar } from "@/components/layout/Navbar";
import { SkillTree } from "@/components/game/SkillTree";
import { useAppStore, getDefaultUser } from "@/lib/store";
import { getLevelTitle, formatXP, getXPProgress } from "@/lib/utils";
import Link from "next/link";

function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="p-4 bg-surface rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-1">
        <span style={{ color }}>{icon}</span>
        <span className="text-xs text-zinc-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);

  if (!user) {
    setUser(getDefaultUser());
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-neon animate-pulse">Cargando...</div>
      </div>
    );
  }

  const progress = getXPProgress(user.xp);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <section className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            Hola, <span className="text-neon">{user.name}</span>
          </h1>
          <p className="text-sm text-zinc-400">
            {getLevelTitle(user.level)} - Nivel {user.level}
          </p>

          <div className="mt-4 p-4 bg-surface rounded-lg border border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-400">Progreso de Nivel</span>
              <span className="text-xs font-mono text-neon">
                {progress}/100 XP
              </span>
            </div>
            <div className="h-3 bg-surface-alt rounded-full overflow-hidden">
              <div
                className="h-full bg-neon rounded-full transition-all duration-700 glow-neon"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatsCard
            label="XP Total"
            value={formatXP(user.xp)}
            icon="Zap"
            color="#00ff88"
          />
          <StatsCard
            label="Nivel"
            value={user.level}
            icon="Target"
            color="#a855f7"
          />
          <StatsCard
            label="Racha"
            value={`${user.streakDays}d`}
            icon="Flame"
            color="#ff6b35"
          />
          <StatsCard
            label="Retos"
            value={user.completedChallenges.length}
            icon="Check"
            color="#00b4d8"
          />
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span className="text-neon">+</span> Acciones Rapidas
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/courses"
              className="p-4 bg-surface rounded-lg border border-border hover:border-neon/30 transition-colors"
            >
              <div className="text-sm font-bold mb-1">Ver Cursos</div>
              <div className="text-xs text-zinc-400">
                Continua tu aprendizaje
              </div>
            </Link>
            <Link
              href="/badges"
              className="p-4 bg-surface rounded-lg border border-border hover:border-neon/30 transition-colors"
            >
              <div className="text-sm font-bold mb-1">Mis Logros</div>
              <div className="text-xs text-zinc-400">
                Revisa tus badges
              </div>
            </Link>
            <Link
              href="/skins"
              className="p-4 bg-surface rounded-lg border border-border hover:border-neon/30 transition-colors"
            >
              <div className="text-sm font-bold mb-1">Personalizar</div>
              <div className="text-xs text-zinc-400">
                Cambia tu skin
              </div>
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="text-neon">+</span> Arbol de Habilidades
          </h2>
          <SkillTree />
        </section>
      </main>
    </div>
  );
}
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useAppStore, getDefaultUser } from "@/lib/store";
import { BADGES, getUnlockedBadges, getLockedBadges, type BadgeStats } from "@/lib/badges";
import Link from "next/link";
import { useMemo } from "react";

function BadgeCard({
  badge,
  isUnlocked,
}: {
  badge: (typeof BADGES)[number];
  isUnlocked: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isUnlocked
          ? "border-border bg-surface"
          : "border-border/50 bg-surface/50 opacity-60"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            backgroundColor: isUnlocked ? `${badge.color}15` : "var(--surface-alt)",
            border: `1px solid ${isUnlocked ? badge.color + "30" : "var(--border-color)"}`,
          }}
        >
          {isUnlocked ? badge.icon : "🔒"}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-sm ${isUnlocked ? "" : "text-zinc-500"}`}>
            {badge.name}
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">{badge.description}</p>
          <div className="mt-2">
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isUnlocked ? `${badge.color}10` : "var(--surface-alt)",
                color: isUnlocked ? badge.color : "var(--zinc-500)",
                border: `1px solid ${isUnlocked ? badge.color + "20" : "var(--border-color)"}`,
              }}
            >
              {isUnlocked ? "Desbloqueado" : badge.requirement}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BadgesPage() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const analytics = useAppStore((s) => s.analytics);

  const stats = useMemo((): BadgeStats => {
    if (!user) {
      return {
        totalXP: 0,
        level: 1,
        streakDays: 0,
        completedChallenges: 0,
        completedCourses: 0,
        completedProjects: 0,
        quizzesAnswered: 0,
        perfectChallenges: 0,
      };
    }

    const quizzes = analytics.filter((a) => a.challengeId.includes("quiz") && a.completed).length;
    const perfect = analytics.filter((a) => a.completed && a.errorCount === 0).length;

    return {
      totalXP: user.xp,
      level: user.level,
      streakDays: user.streakDays,
      completedChallenges: user.completedChallenges.length,
      completedCourses: 0,
      completedProjects: user.completedChallenges.filter((id) => id.includes("final")).length,
      quizzesAnswered: quizzes,
      perfectChallenges: perfect,
    };
  }, [user, analytics]);

  if (!user) {
    setUser(getDefaultUser());
    return null;
  }

  const unlocked = getUnlockedBadges(stats);
  const locked = getLockedBadges(stats);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="text-xs text-zinc-400 hover:text-neon transition-colors mb-4 inline-block"
        >
          &larr; Volver al Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Logros y Badges</h1>
          <p className="text-sm text-zinc-400">
            Desbloquea badges completando retos, manteniendo rachas y subiendo de nivel.
          </p>
        </div>

        <div className="mb-6 p-4 bg-surface rounded-lg border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Progreso de Badges</span>
            <span className="text-sm font-mono text-neon">
              {unlocked.length}/{BADGES.length}
            </span>
          </div>
          <div className="h-2 bg-surface-alt rounded-full overflow-hidden">
            <div
              className="h-full bg-neon rounded-full transition-all duration-700"
              style={{
                width: `${(unlocked.length / BADGES.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {unlocked.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-neon">✓</span> Desbloqueados ({unlocked.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {unlocked.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isUnlocked={true} />
              ))}
            </div>
          </section>
        )}

        {locked.length > 0 && (
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="text-zinc-500">🔒</span> Por Desbloquear ({locked.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locked.map((badge) => (
                <BadgeCard key={badge.id} badge={badge} isUnlocked={false} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
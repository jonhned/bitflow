"use client";

import { useAppStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatXP, getXPProgress, getLevelTitle } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function XPBar() {
  const user = useAppStore((s) => s.user);
  if (!user) return null;
  const progress = getXPProgress(user.xp);

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-zinc-400 hidden sm:inline">
        Nivel {user.level}
      </span>
      <div className="w-20 sm:w-28 h-2 bg-surface-alt rounded-full overflow-hidden">
        <div
          className="h-full bg-neon rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-mono text-neon">{formatXP(user.xp)} XP</span>
    </div>
  );
}

function StreakCounter() {
  const user = useAppStore((s) => s.user);
  if (!user) return null;

  return (
    <div className="flex items-center gap-1">
      <span className="text-fire text-sm" aria-label="Racha">
        &#128293;
      </span>
      <span className="text-sm font-mono text-fire">
        {user.streakDays}
      </span>
    </div>
  );
}

export function Navbar() {
  const user = useAppStore((s) => s.user);
  const { user: authUser, signOut, isConfigured } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    setMenuOpen(false);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-1">
          <span className="text-xl font-bold font-mono">
            <span className="text-neon">Bit</span>
            <span className="text-foreground">Flow</span>
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-6">
          <Link
            href="/courses"
            className="text-sm text-zinc-400 hover:text-neon transition-colors"
          >
            Cursos
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-zinc-400 hover:text-neon transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/skins"
            className="text-sm text-zinc-400 hover:text-neon transition-colors"
          >
            Skins
          </Link>
          <Link
            href="/badges"
            className="text-sm text-zinc-400 hover:text-neon transition-colors"
          >
            Badges
          </Link>
          <Link
            href="/admin"
            className="text-sm text-zinc-400 hover:text-neon transition-colors"
          >
            Docentes
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <StreakCounter />
          <XPBar />

          {isConfigured && !authUser ? (
            <Link
              href="/login"
              className="px-3 py-1.5 bg-neon text-background text-xs font-bold rounded-lg hover:bg-neon-dim transition-colors"
            >
              Iniciar Sesión
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full bg-neon/20 border border-neon/40 flex items-center justify-center text-neon text-xs font-bold"
              >
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-10 w-52 bg-surface border border-border rounded-lg shadow-xl py-2 z-50">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-bold">{user?.name || "Aprendiz"}</p>
                    <p className="text-xs text-zinc-400">
                      {getLevelTitle(user?.level || 1)}
                      {isConfigured && authUser && (
                        <span className="ml-2 text-neon">● Online</span>
                      )}
                    </p>
                  </div>
                  <Link
                    href="/courses"
                    className="block px-3 py-2 text-sm text-zinc-300 hover:bg-surface-alt"
                    onClick={() => setMenuOpen(false)}
                  >
                    Cursos
                  </Link>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-sm text-zinc-300 hover:bg-surface-alt"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/skins"
                    className="block px-3 py-2 text-sm text-zinc-300 hover:bg-surface-alt"
                    onClick={() => setMenuOpen(false)}
                  >
                    Skins
                  </Link>
                  <Link
                    href="/admin"
                    className="block px-3 py-2 text-sm text-zinc-300 hover:bg-surface-alt"
                    onClick={() => setMenuOpen(false)}
                  >
                    Panel Docente
                  </Link>
                  <div className="border-t border-border mt-1 pt-1">
                    {isConfigured && authUser ? (
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-surface-alt"
                      >
                        Cerrar Sesión
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        className="block px-3 py-2 text-sm text-neon hover:bg-surface-alt"
                        onClick={() => setMenuOpen(false)}
                      >
                        Iniciar Sesión
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        useAppStore.getState().resetProgress();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-zinc-500 hover:bg-surface-alt"
                    >
                      Reiniciar Progreso
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
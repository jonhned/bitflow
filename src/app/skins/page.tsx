"use client";

import { Navbar } from "@/components/layout/Navbar";
import { useAppStore, getDefaultUser } from "@/lib/store";
import { getSkins } from "@/lib/modules";
import Link from "next/link";
import type { Skin } from "@/types";

function SkinCard({
  skin,
  isUnlocked,
  isSelected,
  onSelect,
  userLevel,
}: {
  skin: Skin;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: () => void;
  userLevel: number;
}) {
  return (
    <div
      className={`p-5 rounded-xl border transition-all ${
        isSelected
          ? "border-neon bg-neon/5 glow-neon"
          : isUnlocked
          ? "border-border bg-surface hover:border-neon/30"
          : "border-border/50 bg-surface/50"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{
            backgroundColor: `${skin.accentColor}15`,
            border: `1px solid ${skin.accentColor}30`,
          }}
        >
          {skin.id === "default" && "🎨"}
          {skin.id === "neon_hacker" && "💜"}
          {skin.id === "pixel_master" && "🔷"}
          {skin.id === "code_ninja" && "🧡"}
        </div>

        {isSelected && (
          <span className="text-xs px-2 py-1 rounded-full bg-neon/10 text-neon border border-neon/20">
            Activo
          </span>
        )}
      </div>

      <h3 className="font-bold text-sm mb-1">{skin.name}</h3>
      <p className="text-xs text-zinc-400 mb-3">{skin.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: skin.accentColor }}
          />
          <span className="text-xs text-zinc-500">
            {skin.requiredLevel > 1
              ? `Nivel ${skin.requiredLevel}`
              : "Disponible"}
          </span>
        </div>

        {!isUnlocked ? (
          <span className="text-xs text-zinc-500">
            Necesitas nivel {skin.requiredLevel}
          </span>
        ) : (
          <button
            onClick={onSelect}
            disabled={isSelected}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isSelected
                ? "bg-neon/10 text-neon cursor-default"
                : "bg-neon text-background hover:bg-neon-dim"
            }`}
          >
            {isSelected ? "Seleccionado" : "Seleccionar"}
          </button>
        )}
      </div>

      {!isUnlocked && (
        <div className="mt-3 h-1.5 bg-surface-alt rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((userLevel / skin.requiredLevel) * 100, 100)}%`,
              backgroundColor: skin.accentColor,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function SkinsPage() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const skins = getSkins();

  if (!user) {
    setUser(getDefaultUser());
    return null;
  }

  const isSkinUnlocked = (skin: Skin) => user.level >= skin.requiredLevel;

  const handleSelectSkin = (skinId: string) => {
    if (!user.unlockedSkins.includes(skinId)) {
      setUser({
        ...user,
        unlockedSkins: [...user.unlockedSkins, skinId],
      });
    }
  };

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
          <h1 className="text-2xl font-bold mb-1">Skins y Personalización</h1>
          <p className="text-sm text-zinc-400">
            Desbloquea skins subiendo de nivel. Tu nivel actual:{" "}
            <span className="text-neon font-mono">{user.level}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {skins.map((skin) => (
            <SkinCard
              key={skin.id}
              skin={skin}
              isUnlocked={isSkinUnlocked(skin)}
              isSelected={user.unlockedSkins.includes(skin.id)}
              onSelect={() => handleSelectSkin(skin.id)}
              userLevel={user.level}
            />
          ))}
        </div>

        <section className="mt-8 p-5 bg-surface rounded-xl border border-border">
          <h2 className="text-lg font-bold mb-2">Próximamente</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg opacity-60">
              <span className="text-xl">🏆</span>
              <div>
                <p className="text-sm font-medium">Skins Legendarias</p>
                <p className="text-xs text-zinc-500">
                  Desbloqueables con logros especiales
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-lg opacity-60">
              <span className="text-xl">🎨</span>
              <div>
                <p className="text-sm font-medium">Editor de Paleta de Colores</p>
                <p className="text-xs text-zinc-500">
                  Crea tu propia combinación de colores
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
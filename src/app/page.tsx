import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold font-mono tracking-tight">
            <span className="text-neon glow-text">Bit</span>
            <span className="text-foreground">Flow</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-zinc-400 max-w-md mx-auto">
            Aprende a programar con retos interactivos. Gana XP, sube de nivel
            y construye proyectos reales.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link
            href="/courses"
            className="px-8 py-3 bg-neon text-background font-bold rounded-lg glow-neon hover:bg-neon-dim transition-colors text-center"
          >
            Ver Cursos
          </Link>
          <Link
            href="/dashboard"
            className="px-8 py-3 border border-border text-foreground rounded-lg hover:border-neon transition-colors text-center"
          >
            Mi Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl w-full">
          <div className="p-4 bg-surface rounded-lg border border-border">
            <div className="text-2xl mb-2">&#128640;</div>
            <h3 className="font-bold text-sm">Sistema de XP</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Gana puntos por cada reto completado
            </p>
          </div>
          <div className="p-4 bg-surface rounded-lg border border-border">
            <div className="text-2xl mb-2">&#128293;</div>
            <h3 className="font-bold text-sm">Rachas Diarias</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Mantén tu racha aprendiendo cada día
            </p>
          </div>
          <div className="p-4 bg-surface rounded-lg border border-border">
            <div className="text-2xl mb-2">&#127919;</div>
            <h3 className="font-bold text-sm">Retos Prácticos</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Editor de código con previsualización en vivo
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
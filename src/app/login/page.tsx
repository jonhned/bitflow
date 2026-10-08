"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isConfigured } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const { error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError);
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold font-mono">
              <span className="text-neon glow-text">Bit</span>
              <span className="text-foreground">Flow</span>
            </h1>
          </Link>
          <p className="text-sm text-zinc-400 mt-2">
            Inicia sesión para continuar aprendiendo
          </p>
        </div>

        <div className="bg-surface rounded-xl border border-border p-6">
          {!isConfigured && (
            <div className="mb-4 p-3 bg-neon/5 border border-neon/20 rounded-lg">
              <p className="text-xs text-neon">
                Modo local: Supabase no está configurado. Tus datos se guardan
                en el navegador.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-lg text-sm focus:border-neon focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-lg text-sm focus:border-neon focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-2 bg-error/5 border border-error/20 rounded-lg">
                <p className="text-xs text-error">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-neon text-background font-bold rounded-lg text-sm hover:bg-neon-dim transition-colors disabled:opacity-50"
            >
              {isLoading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-zinc-400">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="text-neon hover:underline">
                Regístrate
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-xs text-zinc-500 hover:text-neon transition-colors"
          >
            Continuar sin cuenta →
          </Link>
        </div>
      </div>
    </div>
  );
}
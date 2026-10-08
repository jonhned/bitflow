export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatXP(xp: number): string {
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}k`;
  return xp.toString();
}

export function getLevelTitle(level: number): string {
  if (level >= 20) return "Leyenda";
  if (level >= 15) return "Experto";
  if (level >= 10) return "Avanzado";
  if (level >= 5) return "Intermedio";
  return "Principiante";
}

export function getXPForNextLevel(currentXP: number): number {
  const currentLevel = Math.floor(currentXP / 100) + 1;
  return currentLevel * 100;
}

export function getXPProgress(currentXP: number): number {
  return currentXP % 100;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}
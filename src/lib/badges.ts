export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  check: (stats: BadgeStats) => boolean;
}

export interface BadgeStats {
  totalXP: number;
  level: number;
  streakDays: number;
  completedChallenges: number;
  completedCourses: number;
  completedProjects: number;
  quizzesAnswered: number;
  perfectChallenges: number;
}

export const BADGES: Badge[] = [
  {
    id: "first-steps",
    name: "Primeros Pasos",
    description: "Completa tu primer reto",
    icon: "🌱",
    color: "#00ff88",
    requirement: "1 reto completado",
    check: (s) => s.completedChallenges >= 1,
  },
  {
    id: "getting-started",
    name: "Comenzando",
    description: "Completa 5 retos",
    icon: "🚀",
    color: "#00b4d8",
    requirement: "5 retos completados",
    check: (s) => s.completedChallenges >= 5,
  },
  {
    id: "dedicated",
    name: "Dedicado",
    description: "Completa 10 retos",
    icon: "💪",
    color: "#a855f7",
    requirement: "10 retos completados",
    check: (s) => s.completedChallenges >= 10,
  },
  {
    id: "unstoppable",
    name: "Imparable",
    description: "Completa 25 retos",
    icon: "🔥",
    color: "#ff6b35",
    requirement: "25 retos completados",
    check: (s) => s.completedChallenges >= 25,
  },
  {
    id: "legend",
    name: "Leyenda",
    description: "Completa 50 retos",
    icon: "⭐",
    color: "#ffd700",
    requirement: "50 retos completados",
    check: (s) => s.completedChallenges >= 50,
  },
  {
    id: "streak-3",
    name: "Constante",
    description: "Mantén una racha de 3 días",
    icon: "📅",
    color: "#00ff88",
    requirement: "Racha de 3 días",
    check: (s) => s.streakDays >= 3,
  },
  {
    id: "streak-7",
    name: "Semana Perfecta",
    description: "Mantén una racha de 7 días",
    icon: "🗓️",
    color: "#00b4d8",
    requirement: "Racha de 7 días",
    check: (s) => s.streakDays >= 7,
  },
  {
    id: "streak-30",
    name: "Imparable",
    description: "Mantén una racha de 30 días",
    icon: "🏆",
    color: "#ffd700",
    requirement: "Racha de 30 días",
    check: (s) => s.streakDays >= 30,
  },
  {
    id: "level-5",
    name: "Subiendo",
    description: "Alcanza el nivel 5",
    icon: "📈",
    color: "#a855f7",
    requirement: "Nivel 5",
    check: (s) => s.level >= 5,
  },
  {
    id: "level-10",
    name: "Experto",
    description: "Alcanza el nivel 10",
    icon: "🎯",
    color: "#ff6b35",
    requirement: "Nivel 10",
    check: (s) => s.level >= 10,
  },
  {
    id: "level-20",
    name: "Maestro",
    description: "Alcanza el nivel 20",
    icon: "👑",
    color: "#ffd700",
    requirement: "Nivel 20",
    check: (s) => s.level >= 20,
  },
  {
    id: "xp-500",
    name: "Cazador de XP",
    description: "Acumula 500 XP",
    icon: "⚡",
    color: "#00ff88",
    requirement: "500 XP",
    check: (s) => s.totalXP >= 500,
  },
  {
    id: "xp-1000",
    name: "Millonario XP",
    description: "Acumula 1000 XP",
    icon: "💰",
    color: "#ffd700",
    requirement: "1000 XP",
    check: (s) => s.totalXP >= 1000,
  },
  {
    id: "project-master",
    name: "Proyectista",
    description: "Completa tu primer proyecto final",
    icon: "🏗️",
    color: "#00b4d8",
    requirement: "1 proyecto completado",
    check: (s) => s.completedProjects >= 1,
  },
  {
    id: "quiz-master",
    name: "Quiz Master",
    description: "Responde 10 quizzes correctamente",
    icon: "🧠",
    color: "#a855f7",
    requirement: "10 quizzes correctos",
    check: (s) => s.quizzesAnswered >= 10,
  },
  {
    id: "perfectionist",
    name: "Perfeccionista",
    description: "Completa 5 retos sin errores",
    icon: "✨",
    color: "#ffd700",
    requirement: "5 retos perfectos",
    check: (s) => s.perfectChallenges >= 5,
  },
];

export function getUnlockedBadges(stats: BadgeStats): Badge[] {
  return BADGES.filter((b) => b.check(stats));
}

export function getLockedBadges(stats: BadgeStats): Badge[] {
  return BADGES.filter((b) => !b.check(stats));
}
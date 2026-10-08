import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppState, LearningAnalytics, User } from "@/types";

function getDefaultUser(): User {
  return {
    id: "user-local-1",
    name: "Aprendiz",
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: "2025-01-01",
    unlockedSkins: ["default"],
    currentCourseId: "html-course",
    completedChallenges: [],
  };
}

function calculateLevel(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      analytics: [],
      isLoading: false,

      setUser: (user) => set({ user }),

      addXP: (amount) =>
        set((state) => {
          if (!state.user) return state;
          const newXP = state.user.xp + amount;
          return {
            user: {
              ...state.user,
              xp: newXP,
              level: calculateLevel(newXP),
            },
          };
        }),

      incrementStreak: () =>
        set((state) => {
          if (!state.user) return state;
          const today = new Date().toISOString().split("T")[0];
          const lastDate = state.user.lastActiveDate;
          const diffDays = Math.floor(
            (new Date(today).getTime() - new Date(lastDate).getTime()) / 86400000
          );

          let newStreak = state.user.streakDays;
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }

          return {
            user: {
              ...state.user,
              streakDays: newStreak,
              lastActiveDate: today,
            },
          };
        }),

      completeChallenge: (challengeId, analyticsEntry) =>
        set((state) => {
          if (!state.user) return state;
          const alreadyCompleted = state.user.completedChallenges.includes(challengeId);
          const entry: LearningAnalytics = {
            ...analyticsEntry,
            userId: state.user.id,
            completed: true,
            completedAt: analyticsEntry.completedAt ?? new Date().toISOString(),
          };
          return {
            user: {
              ...state.user,
              completedChallenges: alreadyCompleted
                ? state.user.completedChallenges
                : [...state.user.completedChallenges, challengeId],
            },
            analytics: [...state.analytics, entry],
          };
        }),

      updateAnalytics: (entry) =>
        set((state) => ({
          analytics: [...state.analytics, entry],
        })),

      setAnalytics: (entries) => set({ analytics: entries }),

      resetProgress: () =>
        set((state) => {
          const base = getDefaultUser();
          const current = state.user;
          if (current && current.id !== "user-local-1") {
            return {
              user: { ...base, id: current.id, name: current.name },
              analytics: [],
            };
          }
          return { user: base, analytics: [] };
        }),
    }),
    {
      name: "bitflow-storage",
      partialize: (state) => ({
        user: state.user,
        analytics: state.analytics,
      }),
    }
  )
);

export { getDefaultUser };
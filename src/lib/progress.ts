import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";
import type { LearningAnalytics, User } from "@/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isCloudUserId(id: string | null | undefined): boolean {
  return Boolean(id && id !== "user-local-1" && UUID_RE.test(id));
}

interface ProfileRow {
  id: string;
  name: string;
  xp: number;
  level: number;
  streak_days: number;
  last_active_date: string;
  unlocked_skins: string[] | null;
  current_course_id: string;
  completed_challenges: string[] | null;
}

interface AnalyticsRow {
  id: string;
  user_id: string;
  challenge_id: string;
  course_id: string;
  module_id: string;
  attempts: number;
  time_spent: number;
  completed: boolean;
  completed_at: string | null;
  hints_used: number;
  error_count: number;
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export function createDefaultProfile(id: string, name: string): User {
  return {
    id,
    name: name.trim() || "Aprendiz",
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: today(),
    unlockedSkins: ["default"],
    currentCourseId: "html-course",
    completedChallenges: [],
  };
}

function rowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name || "Aprendiz",
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    streakDays: row.streak_days ?? 0,
    lastActiveDate: row.last_active_date ?? today(),
    unlockedSkins: row.unlocked_skins?.length ? row.unlocked_skins : ["default"],
    currentCourseId: row.current_course_id || "html-course",
    completedChallenges: row.completed_challenges ?? [],
  };
}

function userToRow(user: User) {
  return {
    id: user.id,
    name: user.name,
    xp: user.xp,
    level: user.level,
    streak_days: user.streakDays,
    last_active_date: user.lastActiveDate,
    unlocked_skins: user.unlockedSkins,
    current_course_id: user.currentCourseId,
    completed_challenges: user.completedChallenges,
    updated_at: new Date().toISOString(),
  };
}

function rowToAnalytics(row: AnalyticsRow): LearningAnalytics {
  return {
    id: row.id,
    userId: row.user_id,
    challengeId: row.challenge_id,
    courseId: row.course_id,
    moduleId: row.module_id,
    attempts: row.attempts ?? 0,
    timeSpent: row.time_spent ?? 0,
    completed: row.completed ?? false,
    completedAt: row.completed_at,
    hintsUsed: row.hints_used ?? 0,
    errorCount: row.error_count ?? 0,
  };
}

function analyticsToRow(entry: LearningAnalytics) {
  return {
    id: entry.id,
    user_id: entry.userId,
    challenge_id: entry.challengeId,
    course_id: entry.courseId,
    module_id: entry.moduleId,
    attempts: entry.attempts,
    time_spent: entry.timeSpent,
    completed: entry.completed,
    completed_at: entry.completedAt,
    hints_used: entry.hintsUsed,
    error_count: entry.errorCount,
    updated_at: new Date().toISOString(),
  };
}

export async function loadOrCreateProfile(
  userId: string,
  name: string
): Promise<User> {
  const fallback = createDefaultProfile(userId, name);
  if (!isSupabaseConfigured || !isCloudUserId(userId)) return fallback;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("loadOrCreateProfile select:", error.message);
    return fallback;
  }

  if (data) return rowToUser(data as ProfileRow);

  const { data: created, error: insertError } = await supabase
    .from("profiles")
    .insert(userToRow(fallback))
    .select()
    .single();

  if (!insertError && created) return rowToUser(created as ProfileRow);

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (existing) return rowToUser(existing as ProfileRow);

  if (insertError) {
    console.error("loadOrCreateProfile insert:", insertError.message);
  }
  return fallback;
}

export async function saveProfile(user: User | null): Promise<void> {
  if (!user || !isSupabaseConfigured || !isCloudUserId(user.id)) return;

  const { error } = await supabase.from("profiles").upsert(userToRow(user));
  if (error) {
    console.error("saveProfile:", error.message);
  }
}

export async function loadAnalytics(
  userId: string
): Promise<LearningAnalytics[]> {
  if (!isSupabaseConfigured || !isCloudUserId(userId)) return [];

  const { data, error } = await supabase
    .from("learning_analytics")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("loadAnalytics:", error.message);
    return [];
  }

  return ((data ?? []) as AnalyticsRow[]).map(rowToAnalytics);
}

export async function saveAnalytics(
  entries: LearningAnalytics[]
): Promise<void> {
  if (!isSupabaseConfigured || entries.length === 0) return;

  const rows = entries
    .filter((e) => isCloudUserId(e.userId) && UUID_RE.test(e.id))
    .map(analyticsToRow);

  if (rows.length === 0) return;

  const { error } = await supabase.from("learning_analytics").upsert(rows);
  if (error) {
    console.error("saveAnalytics:", error.message);
  }
}

export async function deleteAnalytics(userId: string): Promise<void> {
  if (!isSupabaseConfigured || !isCloudUserId(userId)) return;

  const { error } = await supabase
    .from("learning_analytics")
    .delete()
    .eq("user_id", userId);

  if (error) {
    console.error("deleteAnalytics:", error.message);
  }
}

export function startProgressSync(
  userId: string,
  alreadySynced: LearningAnalytics[] = []
): () => void {
  if (!isSupabaseConfigured || !isCloudUserId(userId)) {
    return () => {};
  }

  let userTimeout: ReturnType<typeof setTimeout> | null = null;
  let analyticsTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastUserJson = "";
  let stopped = false;
  const syncedIds = new Set<string>();

  for (const e of alreadySynced) {
    if (UUID_RE.test(e.id)) syncedIds.add(e.id);
  }

  const unsubscribe = useAppStore.subscribe((state, prev) => {
    if (stopped) return;

    const current = state.user;
    if (current && current.id === userId) {
      const json = JSON.stringify(current);
      if (json !== lastUserJson) {
        if (userTimeout) clearTimeout(userTimeout);
        userTimeout = setTimeout(() => {
          userTimeout = null;
          lastUserJson = json;
          void saveProfile(current);
        }, 1000);
      }
    }

    const analytics = state.analytics;
    const prevAnalytics = prev.analytics;

    if (analytics !== prevAnalytics) {
      const wasEmpty = prevAnalytics.length === 0;
      const isEmpty = analytics.length === 0;

      if (isEmpty && !wasEmpty) {
        const ownedPrev = prevAnalytics.filter((e) => e.userId === userId);
        if (ownedPrev.length > 0) {
          syncedIds.clear();
          void deleteAnalytics(userId);
        }
        return;
      }

      const pending = analytics.filter(
        (e) => !syncedIds.has(e.id) && e.userId === userId && UUID_RE.test(e.id)
      );

      if (pending.length > 0) {
        if (analyticsTimeout) clearTimeout(analyticsTimeout);
        analyticsTimeout = setTimeout(() => {
          analyticsTimeout = null;
          for (const e of pending) syncedIds.add(e.id);
          void saveAnalytics(pending);
        }, 1000);
      }
    }
  });

  return () => {
    stopped = true;
    if (userTimeout) {
      clearTimeout(userTimeout);
      userTimeout = null;
    }
    if (analyticsTimeout) {
      clearTimeout(analyticsTimeout);
      analyticsTimeout = null;
    }
    unsubscribe();
  };
}

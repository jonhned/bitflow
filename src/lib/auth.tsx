"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAppStore, getDefaultUser } from "@/lib/store";
import {
  createDefaultProfile,
  isCloudUserId,
  loadAnalytics,
  loadOrCreateProfile,
  saveAnalytics,
  saveProfile,
  startProgressSync,
} from "@/lib/progress";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface AuthContextType {
  user: SupabaseUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const setUserInStore = useAppStore((s) => s.setUser);
  const setAnalyticsInStore = useAppStore((s) => s.setAnalytics);
  const stopSyncRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      queueMicrotask(() => {
        setIsLoading(false);
        if (!useAppStore.getState().user) {
          setUserInStore(getDefaultUser());
        }
      });
      return;
    }

    let cancelled = false;

    const applySessionUser = async (sbUser: SupabaseUser | null) => {
      if (cancelled) return;

      if (!sbUser) {
        stopSyncRef.current?.();
        stopSyncRef.current = null;
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser(sbUser);
      const name = (sbUser.user_metadata?.name as string) || "Aprendiz";
      const profile = await loadOrCreateProfile(sbUser.id, name);
      const analytics = await loadAnalytics(sbUser.id);
      if (cancelled) return;

      stopSyncRef.current?.();
      stopSyncRef.current = startProgressSync(sbUser.id, analytics);
      setUserInStore(profile);
      setAnalyticsInStore(analytics);
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      void applySessionUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        void applySessionUser(null);
        return;
      }
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "USER_UPDATED"
      ) {
        void applySessionUser(session?.user ?? null);
      }
    });

    return () => {
      cancelled = true;
      stopSyncRef.current?.();
      stopSyncRef.current = null;
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      const newUser = getDefaultUser();
      newUser.name = name;
      setUserInStore(newUser);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: "No se pudo crear la cuenta." };

    if (data.session) {
      const profile = await loadOrCreateProfile(data.user.id, name);
      setUserInStore(profile);
      setAnalyticsInStore([]);
    } else {
      setUserInStore(createDefaultProfile(data.user.id, name));
      setAnalyticsInStore([]);
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Supabase no esta configurado. Usa el modo local." };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: error.message };
    if (!data.user) return { error: "No se pudo iniciar sesion." };

    const name = (data.user.user_metadata?.name as string) || "Aprendiz";
    const profile = await loadOrCreateProfile(data.user.id, name);
    const analytics = await loadAnalytics(data.user.id);
    setUserInStore(profile);
    setAnalyticsInStore(analytics);

    return { error: null };
  };

  const signOut = async () => {
    const state = useAppStore.getState();
    stopSyncRef.current?.();
    stopSyncRef.current = null;
    if (isSupabaseConfigured) {
      if (state.user && isCloudUserId(state.user.id)) {
        await saveProfile(state.user);
        await saveAnalytics(state.analytics);
      }
      await supabase.auth.signOut();
    }
    setUser(null);
    setAnalyticsInStore([]);
    setUserInStore(getDefaultUser());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

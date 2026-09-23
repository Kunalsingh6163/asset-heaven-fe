"use client";

import { create } from "zustand";
import type { User } from "@/src/types/api";

type AuthState = {
  user: User | null;
  status: "unknown" | "authenticated" | "anonymous";
  revision: number;
  setSession: (user: User) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
};

// JWTs live exclusively in server-set HttpOnly cookies. Reloads validate /auth/me.
export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  status: "unknown",
  revision: 0,
  setSession: (user) => set((state) => ({ user, status: "authenticated", revision: state.revision + 1 })),
  setUser: (user) => set({ user }),
  logout: () => set((state) => ({ user: null, status: "anonymous", revision: state.revision + 1 })),
}));

export function clearLegacySession() {
  if (typeof window === "undefined") return;
  document.cookie = "asset-heaven-auth=; Path=/; Max-Age=0; SameSite=Lax";
  try {
    localStorage.removeItem("asset-heaven-auth");
    sessionStorage.removeItem("asset-heaven-auth");
  } catch { /* Storage can be disabled by the browser. */ }
}

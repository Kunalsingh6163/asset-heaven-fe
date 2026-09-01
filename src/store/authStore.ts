"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { cookieStateStorage, deleteCookie } from "@/src/lib/cookieStorage";
import type { AuthTokens, User } from "@/src/types/api";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresIn: string | null;
  hasHydrated: boolean;
  setSession: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      hasHydrated: false,
      setSession: (user, tokens) =>
        set({
          user,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn ?? null,
        }),
      setTokens: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn ?? null,
        }),
      setUser: (user) => set({ user }),
      logout: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
        });
        window.setTimeout(() => deleteCookie("asset-heaven-auth"), 0);
      },
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "asset-heaven-auth",
      storage: createJSONStorage(() => cookieStateStorage),
      partialize: ({ user, accessToken, refreshToken, expiresIn }) => ({
        user,
        accessToken,
        refreshToken,
        expiresIn,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

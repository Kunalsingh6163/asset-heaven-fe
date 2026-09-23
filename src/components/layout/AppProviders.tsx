"use client";

import { useEffect } from "react";
import { clearLegacySession, useAuthStore } from "@/src/store/authStore";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { appTheme } from "@/src/theme/theme";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    clearLegacySession();
    if (typeof BroadcastChannel === "undefined") return;
    const channel = new BroadcastChannel("asset-heaven-session");
    channel.onmessage = (event) => { if (event.data === "signed-out") useAuthStore.getState().logout(); };
    return () => channel.close();
  }, []);
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

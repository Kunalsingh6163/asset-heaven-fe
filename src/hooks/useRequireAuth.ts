"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";

export function useRequireAuth() {
  const router = useRouter();
  const { accessToken, hasHydrated, user } = useAuthStore();

  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace("/login");
    }
  }, [accessToken, hasHydrated, router]);

  return {
    ready: hasHydrated && Boolean(accessToken),
    user,
  };
}

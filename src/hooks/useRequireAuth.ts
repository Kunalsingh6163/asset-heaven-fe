"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/authStore";
import { checkSession } from "@/src/api/auth";

export function useRequireAuth() {
  const router = useRouter();
  const { status, user } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void checkSession().catch((failure: unknown) => {
      if (active) setError(failure instanceof Error ? failure.message : "Unable to verify your session.");
    });
    return () => { active = false; };
  }, [attempt]);
  useEffect(() => {
    if (status === "anonymous") router.replace("/login");
  }, [status, router]);
  return {
    ready: status === "authenticated", user, error,
    retry: () => { setError(null); setAttempt((value) => value + 1); },
  };
}

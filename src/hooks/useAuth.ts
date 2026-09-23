"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi, checkSession } from "@/src/api/auth";
import type { LoginPayload, SignupPayload, VerifyOtpPayload } from "@/src/types/api";

export function useAuth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const perform = useCallback(async <T,>(operation: () => Promise<T>, destination: string | ((response: T) => string)) => {
    setLoading(true);
    setError(null);
    try {
      const response = await operation();
      router.replace(typeof destination === "function" ? destination(response) : destination);
      return response;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to complete your request.");
      return null;
    } finally { setLoading(false); }
  }, [router]);

  const signup = useCallback((payload: SignupPayload) => perform(
    () => authApi.signup(payload),
    (response) => `/verify-otp?email=${encodeURIComponent(response.data?.email || payload.email.trim().toLowerCase())}`,
  ), [perform]);
  const verifyOtp = useCallback((payload: VerifyOtpPayload) => perform(() => authApi.verifySignup(payload), "/login?verified=1"), [perform]);
  const login = useCallback((payload: LoginPayload) => perform(() => authApi.login(payload), "/dashboard"), [perform]);
  const googleLogin = useCallback((idToken: string) => perform(() => authApi.googleLogin(idToken), "/dashboard"), [perform]);
  const signOut = useCallback(async (all = false) => {
    try { await authApi.logout(all); }
    catch { /* Gateway clears browser cookies even when revocation is unavailable. */ }
    finally { router.replace("/login"); }
  }, [router]);

  return { signup, verifyOtp, login, googleLogin, signOut, loadMe: checkSession, loading, error };
}

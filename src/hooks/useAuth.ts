"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, postJson } from "@/src/lib/apiClient";
import { useAuthStore } from "@/src/store/authStore";
import type {
  AuthPayload,
  LoginPayload,
  SignupPayload,
  User,
  VerifyOtpPayload,
} from "@/src/types/api";

export function useAuth() {
  const router = useRouter();
  const { setSession, logout, refreshToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signup = useCallback(
    async (payload: SignupPayload) => {
      setLoading(true);
      setError(null);
      try {
        const response = await postJson<{ email: string; userId: string }>(
          "/create-user",
          payload,
          true,
        );
        const email = response.data?.email ?? payload.email;
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Signup failed";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload) => {
      setLoading(true);
      setError(null);
      try {
        const response = await postJson<unknown>(
          "/verify-email-otp",
          payload,
          true,
        );
        router.push("/login");
        return response;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "OTP verification failed";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      setLoading(true);
      setError(null);
      try {
        const response = await postJson<AuthPayload>(
          "/login-user",
          payload,
          true,
        );

        if (!response.data?.user || !response.data.accessToken) {
          throw new Error("Login response did not include JWT session data");
        }

        setSession(response.data.user, response.data);
        router.push("/dashboard");
        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router, setSession],
  );

  const signOut = useCallback(async () => {
    const token = refreshToken;

    try {
      if (token) {
        await apiRequest<unknown>("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken: token }),
          retry: false,
        });
      }
    } catch {
      // Always clear the local session, even when the server session has already expired.
    } finally {
      logout();
      router.replace("/login");
    }
  }, [logout, refreshToken, router]);

  const loadMe = useCallback(async () => {
    const response = await apiRequest<User>("/auth/me");
    return response.data;
  }, []);

  return { signup, verifyOtp, login, signOut, loadMe, loading, error };
}

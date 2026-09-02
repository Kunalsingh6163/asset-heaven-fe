"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/src/lib/apiClient";
import type {
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyPasswordOtpPayload,
} from "@/src/types/api";

export function usePasswordRecovery() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestOtp = useCallback(
    async ({ email }: ForgotPasswordPayload) => {
      setLoading(true);
      setError(null);
      try {
        const response = await postJson<unknown>("/forgot-password", { email }, true);
        router.push(`/verify-password-otp?email=${encodeURIComponent(email)}`);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to send OTP");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const verifyOtp = useCallback(
    async ({ email, otp }: VerifyPasswordOtpPayload) => {
      setLoading(true);
      setError(null);
      try {
        const response = await postJson<unknown>("/verify-otp", { email, otp }, true);
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : "OTP verification failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  const resetPassword = useCallback(
    async ({ email, newPassword }: ResetPasswordPayload) => {
      setLoading(true);
      setError(null);
      try {
        const response = await postJson<unknown>(
          "/reset-password",
          { email, newPassword },
          true,
        );
        router.replace("/login?passwordReset=1");
        return response;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to reset password");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  return { requestOtp, verifyOtp, resetPassword, loading, error };
}

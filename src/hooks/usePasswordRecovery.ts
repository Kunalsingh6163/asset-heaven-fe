"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/src/api/auth";
import { useRecoveryStore } from "@/src/store/recoveryStore";
import type { ForgotPasswordPayload, ResetPasswordPayload, VerifyPasswordOtpPayload } from "@/src/types/api";

export function usePasswordRecovery() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestOtp = useCallback(async ({ email }: ForgotPasswordPayload) => {
    setLoading(true); setError(null);
    try {
      useRecoveryStore.getState().clear();
      const normalized = email.trim().toLowerCase();
      const response = await authApi.forgotPassword(normalized);
      router.replace(`/verify-password-otp?email=${encodeURIComponent(normalized)}`);
      return response;
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to send OTP"); return null; }
    finally { setLoading(false); }
  }, [router]);
  const verifyOtp = useCallback(async ({ email, otp }: VerifyPasswordOtpPayload) => {
    setLoading(true); setError(null);
    try {
      const normalized = email.trim().toLowerCase();
      const response = await authApi.verifyPasswordOtp(normalized, otp);
      useRecoveryStore.getState().setChallenge(normalized, otp);
      router.replace(`/reset-password?email=${encodeURIComponent(normalized)}`);
      return response;
    } catch (failure) { setError(failure instanceof Error ? failure.message : "OTP verification failed"); return null; }
    finally { setLoading(false); }
  }, [router]);
  const resetPassword = useCallback(async (payload: ResetPasswordPayload) => {
    setLoading(true); setError(null);
    try {
      const response = await authApi.resetPassword(payload);
      useRecoveryStore.getState().clear();
      router.replace("/login?passwordReset=1");
      return response;
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to reset password"); return null; }
    finally { setLoading(false); }
  }, [router]);
  return { requestOtp, verifyOtp, resetPassword, loading, error };
}

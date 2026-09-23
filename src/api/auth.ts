import { apiRequest, postJson, serializeSession } from "./client";
import { clearLegacySession, useAuthStore } from "@/src/store/authStore";
import type { User, LoginPayload, SignupPayload, VerifyOtpPayload, ResetPasswordPayload } from "@/src/types/api";

const emailValue = (email: string) => email.trim().toLowerCase();
function announceLogout() {
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("asset-heaven-session");
    channel.postMessage("signed-out");
    channel.close();
  }
}
export const authApi = {
  signup: (payload: SignupPayload) => postJson<{ email: string; userId: string }>("/create-user", { ...payload, name: payload.name.trim(), email: emailValue(payload.email) }, true),
  verifySignup: (payload: VerifyOtpPayload) => postJson("/verify-email-otp", { ...payload, email: emailValue(payload.email) }, true),
  login: (payload: LoginPayload) => startSession("/login-user", { ...payload, email: emailValue(payload.email) }),
  googleLogin: (idToken: string) => startSession("/login-google", { idToken }),
  forgotPassword: (email: string) => postJson("/forgot-password", { email: emailValue(email) }, true),
  verifyPasswordOtp: (email: string, otp: string) => postJson("/verify-otp", { email: emailValue(email), otp }, true),
  resetPassword: (payload: ResetPasswordPayload) => serializeSession(async () => {
    const response = await postJson("/reset-password", { ...payload, email: emailValue(payload.email) }, true);
    useAuthStore.getState().logout();
    announceLogout();
    return response;
  }),
  logout: (all = false) => {
    // Hide private data immediately; the queued request also clears HttpOnly cookies.
    useAuthStore.getState().logout();
    announceLogout();
    clearLegacySession();
    return serializeSession(async () => {
      try { return await postJson(all ? "/auth/logout-all" : "/auth/logout", {}, true); }
      finally { useAuthStore.getState().logout(); announceLogout(); }
    });
  },
};

async function startSession(path: string, payload: unknown) {
  return serializeSession(async () => {
    const response = await postJson<{ user: User }>(path, payload, true);
    if (!response.data?.user?.email) throw new Error("The server did not return your account.");
    clearLegacySession();
    useAuthStore.getState().setSession(response.data.user);
    return response;
  });
}

let checking: Promise<User | undefined> | null = null;
export function checkSession() {
  if (!checking) {
    clearLegacySession();
    const revision = useAuthStore.getState().revision;
    checking = apiRequest<User>("/auth/me").then((response) => {
      if (!response.data?.email) throw new Error("Unable to verify your account.");
      if (useAuthStore.getState().revision === revision) {
        useAuthStore.setState({ user: response.data, status: "authenticated" });
      }
      return response.data;
    }).finally(() => { checking = null; });
  }
  return checking;
}

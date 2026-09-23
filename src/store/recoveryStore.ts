"use client";
import { create } from "zustand";

// The verified OTP is held only in memory: never in a URL, cookie or disk storage.
// After a page reload the reset form asks for the code again.
export const useRecoveryStore = create<{
  email: string; otp: string;
  setChallenge: (email: string, otp: string) => void;
  clear: () => void;
}>()((set) => ({
  email: "", otp: "",
  setChallenge: (email, otp) => set({ email, otp }),
  clear: () => set({ email: "", otp: "" }),
}));

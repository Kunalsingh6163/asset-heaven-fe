"use client";

import type { StateStorage } from "zustand/middleware";

const sevenDays = 60 * 60 * 24 * 7;

const isBrowser = () => typeof document !== "undefined";

const cookieOptions = () => {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  return `path=/; max-age=${sevenDays}; samesite=lax${secure ? "; secure" : ""}`;
};

export const setCookie = (name: string, value: string) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions()}`;
};

export const getCookie = (name: string) => {
  if (!isBrowser()) return null;

  const match = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
};

export const deleteCookie = (name: string) => {
  if (!isBrowser()) return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax${secure ? "; secure" : ""}`;
};

export const cookieStateStorage: StateStorage = {
  getItem: (name) => getCookie(name),
  setItem: (name, value) => setCookie(name, value),
  removeItem: (name) => deleteCookie(name),
};

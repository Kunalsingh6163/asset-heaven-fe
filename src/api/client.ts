import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/src/store/authStore";
import type { ApiEnvelope } from "@/src/types/api";

export const API_BASE_URL = "/api/backend";
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json", "X-Requested-With": "AssetHeaven" },
  timeout: 30_000,
  withCredentials: true,
});

export type RequestOptions = Omit<AxiosRequestConfig, "baseURL" | "data" | "url"> & {
  body?: BodyInit | null;
  skipAuth?: boolean;
  retry?: boolean;
};

export class ApiError extends Error {
  constructor(message: string, public status?: number) { super(message); this.name = "ApiError"; }
}
function asError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    const data = error.response?.data;
    const details = Array.isArray(data?.details) ? data.details.join(". ") : "";
    return new ApiError(details || data?.message || data?.error || "Unable to reach the server. Please try again.", error.response?.status);
  }
  return new ApiError(error instanceof Error ? error.message : "Request failed");
}
let refresh: Promise<void> | null = null;
let refreshGeneration = 0;
let sessionWork: Promise<unknown> = Promise.resolve();

// Serialize refresh and logout/login within this tab so an old refresh response
// cannot set cookies after logout or replace a newer login.
export function serializeSession<T>(operation: () => Promise<T>): Promise<T> {
  const next = sessionWork.then(operation, operation);
  sessionWork = next.catch(() => undefined);
  return next;
}
async function refreshSession() {
  if (!refresh) {
    const revision = useAuthStore.getState().revision;
    refresh = serializeSession(async () => {
      if (useAuthStore.getState().revision !== revision) throw new ApiError("Session changed", 401);
      try {
        const response = await apiClient.post<ApiEnvelope<unknown>>("/auth/refresh-token", {});
        if (!response.data.success) throw new ApiError(response.data.message || "Please sign in again", 401);
        refreshGeneration++;
      } catch (error) {
        const failure = asError(error);
        if ([400, 401, 403].includes(failure.status ?? 0) && useAuthStore.getState().revision === revision) useAuthStore.getState().logout();
        throw failure;
      }
    }).finally(() => { refresh = null; });
  }
  return refresh;
}
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const generation = refreshGeneration;
  const { body, skipAuth, retry, ...config } = options;
  const revision = useAuthStore.getState().revision;
  if (!path.startsWith("/") || path.startsWith("//")) throw new ApiError("Invalid API path");
  try {
    const response = await apiClient.request<ApiEnvelope<T>>({
      ...config, url: path, data: typeof body === "string" ? JSON.parse(body) : body,
    });
    if (response.data.success === false) throw new ApiError(response.data.message || "Request failed", response.status);
    if (!skipAuth && useAuthStore.getState().revision !== revision) throw new ApiError("Session changed", 401);
    return response.data;
  } catch (error) {
    const failure = asError(error);
    if (failure.status === 401 && !skipAuth && useAuthStore.getState().revision === revision) {
      if (retry !== false) {
        if (generation === refreshGeneration) await refreshSession();
        if (useAuthStore.getState().revision !== revision) throw new ApiError("Please sign in again", 401);
        return apiRequest<T>(path, { ...options, retry: false });
      }
      useAuthStore.getState().logout();
    }
    throw failure;
  }
}
export const postJson = <T>(path: string, body: unknown, skipAuth = false) =>
  apiRequest<T>(path, { method: "POST", body: JSON.stringify(body), skipAuth });

import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/src/store/authStore";
import type { ApiEnvelope, AuthTokens } from "@/src/types/api";

const DEFAULT_API_URL = "http://localhost:4500/api";

const normalizeApiBaseUrl = (url?: string) => {
  const baseUrl = url?.trim().replace(/\/$/, "");

  if (!baseUrl) return DEFAULT_API_URL;

  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL,
);

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export type RequestOptions = Omit<
  AxiosRequestConfig,
  "baseURL" | "data" | "url"
> & {
  body?: BodyInit | null;
  skipAuth?: boolean;
  retry?: boolean;
};

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiEnvelope<unknown>>(error)) {
    const data = error.response?.data;
    return data?.message || data?.error || error.message || "Request failed";
  }

  return error instanceof Error ? error.message : "Request failed";
};

const parseBody = (body?: BodyInit | null) => {
  if (typeof body !== "string") return body;

  try {
    return JSON.parse(body) as unknown;
  } catch {
    return body;
  }
};

const refreshAccessToken = async () => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    return null;
  }

  try {
    const response = await apiClient.post<ApiEnvelope<AuthTokens>>(
      "/auth/refresh-token",
      { refreshToken },
    );
    const tokens = response.data.data;

    if (!tokens?.accessToken) {
      logout();
      return null;
    }

    setTokens(tokens);
    return tokens.accessToken;
  } catch {
    logout();
    return null;
  }
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const { body, headers, skipAuth, retry, ...config } = options;
  const { accessToken } = useAuthStore.getState();

  try {
    const response = await apiClient.request<ApiEnvelope<T>>({
      ...config,
      url: path,
      headers: {
        ...headers,
        ...(!skipAuth && accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {}),
      },
      data: parseBody(body),
    });
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      retry !== false &&
      !skipAuth
    ) {
      const freshToken = await refreshAccessToken();
      if (freshToken) return apiRequest<T>(path, { ...options, retry: false });
    }

    throw new Error(errorMessage(error));
  }
}

export const postJson = <T>(path: string, body: unknown, skipAuth = false) =>
  apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth,
  });

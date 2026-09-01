import { useAuthStore } from "@/src/store/authStore";
import type { ApiEnvelope, AuthTokens } from "@/src/types/api";

const DEFAULT_API_URL = "http://localhost:4500/api";

const normalizeApiBaseUrl = (url?: string) => {
  const baseUrl = url?.trim().replace(/\/$/, "");

  if (!baseUrl) {
    return DEFAULT_API_URL;
  }

  return baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`;
};

export const API_BASE_URL = normalizeApiBaseUrl(
  process.env.NEXT_PUBLIC_API_BASE_URL,
);

type RequestOptions = RequestInit & {
  skipAuth?: boolean;
  retry?: boolean;
};

const readMessage = async (response: Response) => {
  try {
    const body = (await response.json()) as ApiEnvelope<unknown>;
    return body.message || body.error || "Request failed";
  } catch {
    return response.statusText || "Request failed";
  }
};

const refreshAccessToken = async () => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    logout();
    return null;
  }

  const body = (await response.json()) as ApiEnvelope<AuthTokens>;

  if (!body.data?.accessToken) {
    logout();
    return null;
  }

  setTokens(body.data);
  return body.data.accessToken;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (!options.skipAuth && accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && options.retry !== false && !options.skipAuth) {
    const freshToken = await refreshAccessToken();

    if (freshToken) {
      return apiRequest<T>(path, { ...options, retry: false });
    }
  }

  if (!response.ok) {
    throw new Error(await readMessage(response));
  }

  return (await response.json()) as ApiEnvelope<T>;
}

export const postJson = <T>(path: string, body: unknown, skipAuth = false) =>
  apiRequest<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth,
  });

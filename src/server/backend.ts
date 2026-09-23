import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const publicPosts = new Set(["create-user", "verify-email-otp", "login-user", "login-google", "forgot-password", "verify-otp", "reset-password"]);
const publicGets = new Set(["indices", "market-home", "market-data", "market-news"]);
const authPaths = new Set(["auth/me", "auth/refresh-token", "auth/logout", "auth/logout-all", "auth/change-password"]);
const resourceRoots = new Set(["users", "stocks", "portfolio", "expenses", "mutual-funds", "mutual-fund-data", "mutual-fund-holdings", "market-news", "market-data", "market-home", "indices", "indian-market", "assets"]);

function backendUrl() {
  const raw = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://mobulous-tech.vercel.app/api";
  const url = new URL(raw.trim().replace(/\/+$/, ""));
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("Invalid API_BASE_URL");
  url.pathname = url.pathname.replace(/\/+$/, "");
  if (!url.pathname.endsWith("/api")) url.pathname += "/api";
  return url.toString().replace(/\/+$/, "");
}

function cookieNames(base: string) {
  const scope = createHash("sha256").update(base).digest("hex").slice(0, 12);
  const prefix = process.env.NODE_ENV === "production" ? "__Host-" : "";
  return { access: `${prefix}ah-access-${scope}`, refresh: `${prefix}ah-refresh-${scope}` };
}
const options = () => ({ httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" });
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", "Vary": "Cookie" } });
const failure = (message: string, status: number) => json({ success: false, message }, status);
type Tokens = { accessToken: string; refreshToken: string };

// Only tokens obtained directly from the configured backend are accepted here.
// JWT decoding determines cookie lifetime only; the backend verifies signatures.
function tokenLifetime(token: string) {
  if (typeof token !== "string" || token.length > 3800 || token.split(".").length !== 3) throw new Error("Invalid session response");
  const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  if (!Number.isFinite(payload.exp)) throw new Error("Missing token expiry");
  const ttl = Math.floor(payload.exp - Date.now() / 1000);
  if (ttl <= 0) throw new Error("Expired session response");
  return ttl;
}
function setTokens(response: NextResponse, names: ReturnType<typeof cookieNames>, tokens: Tokens) {
  const accessAge = tokenLifetime(tokens.accessToken);
  const refreshAge = tokenLifetime(tokens.refreshToken);
  response.cookies.set(names.access, tokens.accessToken, { ...options(), maxAge: accessAge });
  response.cookies.set(names.refresh, tokens.refreshToken, { ...options(), maxAge: refreshAge });
}
function clearTokens(response: NextResponse, names: ReturnType<typeof cookieNames>) {
  response.cookies.set(names.access, "", { ...options(), maxAge: 0 });
  response.cookies.set(names.refresh, "", { ...options(), maxAge: 0 });
  response.cookies.set("asset-heaven-auth", "", { ...options(), maxAge: 0 });
}

export async function handleBackend(request: NextRequest, segments: string[]) {
  // Reject cross-site forms and fetches, including login CSRF. No CORS access is
  // granted by this same-origin gateway.
  if (request.headers.get("x-requested-with") !== "AssetHeaven" ||
      request.headers.get("sec-fetch-site") === "cross-site") return failure("Request origin is not allowed", 403);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return failure("Request origin is not allowed", 403);
  if (!segments.length || segments.some((p) => !/^[a-zA-Z0-9_.~:@+\-]+$/.test(p) || p === "." || p === "..")) return failure("Invalid API path", 400);
  const path = segments.join("/");
  const isPublic = publicPosts.has(path);
  if (!isPublic && !authPaths.has(path) && !resourceRoots.has(segments[0])) return failure("API route is not available", 404);
  if ((isPublic && request.method !== "POST") || (path.startsWith("auth/") && request.method !== (path === "auth/me" ? "GET" : "POST"))) return failure("Method not allowed", 405);

  let base: string;
  try { base = backendUrl(); } catch { return failure("The server API URL is not configured correctly.", 503); }
  const names = cookieNames(base);
  const access = request.cookies.get(names.access)?.value;
  const refresh = request.cookies.get(names.refresh)?.value;
  const isRefresh = path === "auth/refresh-token";
  const isLogout = path === "auth/logout" || path === "auth/logout-all";
  let body: Record<string, unknown> | undefined;

  if (!["GET", "HEAD"].includes(request.method)) {
    if (!request.headers.get("content-type")?.includes("application/json")) return failure("Use a JSON request body", 415);
    const text = await request.text();
    if (Buffer.byteLength(text) > 64 * 1024) return failure("Request is too large", 413);
    try {
      body = text ? JSON.parse(text) : {};
      if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error("Invalid body");
    } catch { return failure("Invalid JSON request body", 400); }
  }

  const call = async (endpoint: string, method: string, data?: unknown, token?: string) => {
    const response = await fetch(`${base}/${endpoint}`, {
      method, headers: { "Content-Type": "application/json", "Accept": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: data === undefined ? undefined : JSON.stringify(data),
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(25_000),
    });
    const payload = await response.json();
    return { status: response.status, ok: response.ok, payload };
  };

  try {
    if (isRefresh && !refresh) return failure("Please sign in again", 401);
    if (!isPublic && !isRefresh && !access && !isLogout && !(request.method === "GET" && publicGets.has(segments[0]))) return failure("Please sign in again", 401);
    if (isLogout && !refresh && !access) {
      const response = json({ success: true, message: "Signed out" });
      clearTokens(response, names);
      return response;
    }

    let bearer = access;
    // Logout may need an access token renewed before it can revoke the refresh
    // token. Do not write the renewed tokens to the browser on logout.
    if (isLogout && refresh) {
      const renewed = await call("auth/refresh-token", "POST", { refreshToken: refresh });
      if (renewed.ok) bearer = renewed.payload.data?.accessToken;
      else if (renewed.status >= 500) throw new Error("Logout unavailable");
    }
    const requestBody = isRefresh || path === "auth/logout" ? { refreshToken: refresh } : body;
    const upstream = await call(path + new URL(request.url).search, request.method, requestBody, isPublic || isRefresh ? undefined : bearer);
    const payload = upstream.payload;
    const tokens = payload?.data;
    const sessionResponse = (path === "login-user" || path === "login-google" || isRefresh) && upstream.ok && payload.success === true;
    if (sessionResponse) {
      if (typeof tokens?.accessToken !== "string" || typeof tokens?.refreshToken !== "string" ||
          (!isRefresh && !tokens.user?.email)) throw new Error("Invalid session response");
      const response = json({ ...payload, data: isRefresh ? {} : { user: tokens.user } }, upstream.status);
      setTokens(response, names, tokens);
      response.cookies.set("asset-heaven-auth", "", { ...options(), maxAge: 0 });
      return response;
    }
    // Never relay backend tokens or Set-Cookie headers to client JavaScript.
    if (tokens && typeof tokens === "object") {
      delete tokens.accessToken;
      delete tokens.refreshToken;
    }
    const response = json(payload, upstream.status);
    if (isLogout || (isRefresh && [400, 401, 403].includes(upstream.status)) ||
        (upstream.ok && ["reset-password", "auth/change-password"].includes(path))) clearTokens(response, names);
    return response;
  } catch {
    const response = failure("Unable to reach the authentication server. Please try again.", 502);
    if (isLogout) clearTokens(response, names);
    return response;
  }
}

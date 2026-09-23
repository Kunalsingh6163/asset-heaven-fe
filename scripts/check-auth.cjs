/* eslint-disable @typescript-eslint/no-require-imports */
const assert = require("node:assert/strict");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { once } = require("node:events");
const { NextRequest } = require("next/server");
const { AxiosError } = require("axios");
const root = path.resolve(__dirname, "..");
const cache = new Map();
function load(file) {
  if (!file.endsWith(".ts")) file += ".ts";
  if (cache.has(file)) return cache.get(file).exports;
  const loaded = { exports: {} };
  cache.set(file, loaded);
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const resolve = (id) => id.startsWith(".") ? load(path.resolve(path.dirname(file), id)) :
    id.startsWith("@/") ? load(path.join(root, id.slice(2))) : require(id);
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, { filename: file })(resolve, loaded, loaded.exports);
  return loaded.exports;
}
function token(kind, extra = {}) {
  return ["header", Buffer.from(JSON.stringify({ type: kind, exp: Math.floor(Date.now() / 1000) + 600, ...extra })).toString("base64url"), "signature"].join(".");
}
function createGateway(base) {
  process.env.API_BASE_URL = base;
  const { handleBackend } = load(path.join(root, "src/server/backend.ts"));
  const jar = new Map();
  let lastResponse;
  async function request(route, method = "GET", body, overrides = {}) {
    const request = new NextRequest("https://app.example.com/api/backend/" + route, {
      method, headers: { "Content-Type": "application/json", "X-Requested-With": "AssetHeaven", Origin: "https://app.example.com",
        Cookie: [...jar].map(([k, v]) => k + "=" + v).join("; "), ...overrides },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const response = await handleBackend(request, route.split("?")[0].split("/"));
    for (const cookie of response.cookies.getAll()) {
      if (cookie.maxAge === 0) jar.delete(cookie.name); else jar.set(cookie.name, cookie.value);
    }
    lastResponse = response;
    return { status: response.status, body: await response.json(), response };
  }
  return { jar, request, lastResponse: () => lastResponse };
}
module.exports = { load, createGateway };

async function main() {
  let refreshStatus = 200;
  let refreshCount = 0;
  let forceProtectedStatus = 200;
  let signalRefresh;
  const seen = [];
  const access = token("access");
  const refresh = token("refresh");
  const user = { _id: "000000000000000000000001", email: "user@example.com", name: "Test" };
  const server = http.createServer(async (req, res) => {
    let text = "";
    for await (const chunk of req) text += chunk;
    const body = text ? JSON.parse(text) : {};
    seen.push({ path: req.url, method: req.method, authorization: req.headers.authorization, body });
    const send = (status, data, message = "Test response") => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: status < 300, data, message }));
    };
    if (["/api/login-user", "/api/login-google"].includes(req.url)) {
      if (body.password === "wrong") return send(400, null, "Invalid Password");
      return send(200, { user, accessToken: access, refreshToken: refresh });
    }
    if (req.url === "/api/auth/refresh-token") {
      refreshCount++;
      if (signalRefresh) signalRefresh();
      await new Promise((r) => setTimeout(r, 20));
      return send(refreshStatus, { accessToken: access, refreshToken: refresh });
    }
    if (["/api/create-user", "/api/verify-email-otp", "/api/forgot-password", "/api/verify-otp"].includes(req.url)) return send(200, user);
    if (req.url === "/api/reset-password") return send(body.otp === "123456" ? 200 : 400, null);
    if (req.url === "/api/stocks" && forceProtectedStatus !== 200) return send(forceProtectedStatus, null);
    if (req.headers.authorization !== "Bearer " + access) return send(401, null);
    if (req.url === "/api/auth/me") return send(200, user);
    if (["/api/auth/logout", "/api/auth/logout-all", "/api/auth/change-password"].includes(req.url)) return send(200, {});
    return send(200, [{ _id: "holding-1" }]);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const gateway = createGateway(`http://127.0.0.1:${server.address().port}/api`);
  const { authApi, checkSession } = load(path.join(root, "src/api/auth.ts"));
  const { apiClient, apiRequest } = load(path.join(root, "src/api/client.ts"));
  const { useAuthStore } = load(path.join(root, "src/store/authStore.ts"));
  apiClient.defaults.adapter = async (config) => {
    const route = config.url.replace(/^\//, "");
    const result = await gateway.request(route, config.method.toUpperCase(), config.data ? JSON.parse(config.data) : undefined);
    const response = { status: result.status, statusText: "", data: result.body, headers: {}, config };
    if (result.status >= 400) throw new AxiosError("HTTP failure", "ERR_BAD_REQUEST", config, null, response);
    return response;
  };
  try {
    const before = seen.length;
    assert.equal((await gateway.request("login-user", "POST", {}, { Origin: "https://evil.example" })).status, 403);
    assert.equal((await gateway.request("login-user", "POST", {}, { "X-Requested-With": "" })).status, 403);
    assert.equal((await gateway.request("admin/users")).status, 404);
    assert.equal((await gateway.request("../admin")).status, 400);
    assert.equal(seen.length, before, "Blocked requests must not reach backend");
    await assert.rejects(authApi.login({ email: user.email, password: "wrong" }), /Invalid Password/);
    await authApi.signup({ name: " Test ", email: " USER@EXAMPLE.COM ", password: "Password123" });
    await authApi.verifySignup({ email: user.email, otp: "123456" });
    const loggedIn = await authApi.login({ email: " USER@EXAMPLE.COM ", password: "secret with spaces " });
    assert.equal(loggedIn.data.accessToken, undefined);
    assert.equal(loggedIn.data.refreshToken, undefined);
    assert.equal(seen.at(-1).body.password, "secret with spaces ");
    assert.equal(seen.at(-1).body.email, user.email);
    assert.equal(seen.at(-1).authorization, undefined);
    assert.equal(useAuthStore.getState().status, "authenticated");
    for (const cookie of gateway.lastResponse().cookies.getAll().filter((c) => c.maxAge > 0)) {
      assert.equal(cookie.httpOnly, true);
      assert.equal(cookie.sameSite, "lax");
    }
    useAuthStore.setState({ user: null, status: "unknown" });
    await checkSession();
    assert.equal(useAuthStore.getState().status, "authenticated", "Page reload restores identity from the backend");
    assert.equal((await apiRequest("/auth/me")).data.email, user.email);
    await apiRequest("/stocks");
    assert.equal(seen.at(-1).authorization, "Bearer " + access);
    const accessKey = [...gateway.jar.keys()].find((k) => k.includes("ah-access"));
    gateway.jar.delete(accessKey);
    const count = refreshCount;
    await Promise.all([apiRequest("/stocks"), apiRequest("/expenses")]);
    assert.equal(refreshCount - count, 1, "Concurrent requests share one refresh");
    assert.equal(seen.find((r) => r.path === "/api/auth/refresh-token").authorization, undefined);
    forceProtectedStatus = 403;
    const beforeForbidden = refreshCount;
    await assert.rejects(apiRequest("/stocks"), (error) => error.status === 403);
    assert.equal(refreshCount, beforeForbidden);
    forceProtectedStatus = 401;
    await assert.rejects(apiRequest("/stocks"));
    assert.equal(refreshCount, beforeForbidden + 1, "A persistent 401 is retried only once");
    assert.equal(useAuthStore.getState().status, "anonymous");
    forceProtectedStatus = 200;
    await authApi.login({ email: user.email, password: "Password123" });
    gateway.jar.delete(accessKey);
    refreshStatus = 503;
    await assert.rejects(apiRequest("/stocks"));
    assert.equal(useAuthStore.getState().status, "authenticated", "Temporary errors do not erase the session");
    assert.ok(gateway.jar.size);
    refreshStatus = 401;
    await assert.rejects(apiRequest("/stocks"));
    assert.equal(useAuthStore.getState().status, "anonymous");
    assert.equal(gateway.jar.size, 0);
    refreshStatus = 200;
    await authApi.googleLogin("google-id-token");
    assert.equal(seen.at(-1).body.idToken, "google-id-token");
    await authApi.forgotPassword(user.email);
    await authApi.verifyPasswordOtp(user.email, "123456");
    await authApi.resetPassword({ email: user.email, otp: "123456", newPassword: "NewPassword123" });
    assert.equal(seen.at(-1).body.otp, "123456");
    assert.equal(gateway.jar.size, 0);
    await authApi.login({ email: user.email, password: "Password123" });
    gateway.jar.delete(accessKey);
    await authApi.logout();
    assert.equal(seen.at(-1).path, "/api/auth/logout");
    assert.equal(seen.at(-1).body.refreshToken, refresh);
    assert.equal(gateway.jar.size, 0);
    assert.equal(useAuthStore.getState().status, "anonymous");
    await authApi.login({ email: user.email, password: "Password123" });
    gateway.jar.delete(accessKey);
    const refreshStarted = new Promise((resolve) => { signalRefresh = resolve; });
    const pendingRequest = apiRequest("/stocks").catch((error) => error);
    await refreshStarted;
    const pendingLogout = authApi.logout();
    await Promise.all([pendingRequest, pendingLogout]);
    signalRefresh = undefined;
    assert.equal(gateway.jar.size, 0, "Logout runs after pending refresh cookie writes");
    assert.equal(useAuthStore.getState().status, "anonymous");
    const loginInFlight = authApi.login({ email: user.email, password: "Password123" });
    const logoutDuringLogin = authApi.logout();
    await Promise.all([loginInFlight, logoutDuringLogin]);
    assert.equal(gateway.jar.size, 0, "A pending login cannot restore a logged-out session");
    assert.equal(useAuthStore.getState().status, "anonymous");
    process.env.NODE_ENV = "production";
    await gateway.request("login-user", "POST", { email: user.email, password: "Password123" });
    assert.ok(gateway.lastResponse().cookies.getAll().filter((c) => c.maxAge > 0).every((c) => c.secure && c.httpOnly && c.name.startsWith("__Host-")));
    console.log("Frontend auth checks passed: CSRF/path checks, signup, login, Google exchange, HttpOnly cookies, Bearer requests, concurrent refresh, transient failure, revocation, OTP reset and logout.");
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
if (require.main === module) main().catch((error) => { console.error(error); process.exitCode = 1; });

# Asset Heaven user frontend

Next.js 16 user portal connected to the Mobulous Tech backend.

## Run locally

```sh
npm install
npm run dev
```

Set `API_BASE_URL=http://localhost:4500/api` in `.env.local` to use the local backend, or `API_BASE_URL=https://mobulous-tech.vercel.app/api` to use the deployed backend. Run the frontend on port 3000. The older `NEXT_PUBLIC_API_BASE_URL` variable remains a fallback, so existing deployments keep their configured backend until migrated.

## Authentication

| User action | Backend API |
| --- | --- |
| Signup | POST /api/create-user |
| Verify signup email | POST /api/verify-email-otp |
| Email/password login | POST /api/login-user |
| Google login | POST /api/login-google with a Google ID token |
| Request reset code | POST /api/forgot-password |
| Check reset code | POST /api/verify-otp |
| Reset password | POST /api/reset-password with email, otp, newPassword |
| Restore session | GET /api/auth/me |
| Refresh session | POST /api/auth/refresh-token |
| Change password | POST /api/auth/change-password |
| Sign out | POST /api/auth/logout |
| Sign out everywhere | POST /api/auth/logout-all |

Browser requests use the same-origin `/api/backend` gateway. It stores access and refresh JWTs in separate HttpOnly, SameSite=Lax cookies, uses Secure cookies in production, and attaches `Authorization: Bearer <accessToken>` to backend requests. Tokens are never returned to browser JavaScript or persisted in Zustand. Cookie names are scoped to the backend URL. Old JavaScript cookie sessions require a new login.

The gateway rejects foreign origins, cross-site requests, and requests without the custom application header. It only forwards to the configured backend, blocks admin paths, does not follow upstream redirects, and disables response caching.

A 401 triggers one shared refresh request and one retry. Invalid/revoked refresh sessions return to login; network/5xx failures remain retryable. Login, refresh, and logout are serialized within a tab. Logout broadcasts to other tabs and clears local state immediately. If the backend cannot be reached, browser cookies are still cleared; backend revocation cannot be guaranteed until connectivity returns.

Dashboard content mounts only after a successful session check. Signup verification does not create a session: users then sign in. Reset codes stay in memory between steps, never in URLs or persistent storage. Reloading the reset page asks for the emailed code again. Password changes/reset clear browser sessions and require a new login; backend token versions invalidate older access and refresh tokens.

## Deployment

Deploy the updated backend and this Next.js app. A Node/serverless Next.js runtime is required; static export cannot serve the gateway. Set `API_BASE_URL` in the frontend hosting environment. The default is the deployed HTTPS API, never localhost. Cookies require HTTPS for production builds.

Configure the backend MongoDB, stable independent JWT signing secrets, SMTP email delivery, and `SKIP_JWT_AUTH_FOR_TESTING=false`. The gateway calls the backend server-to-server, so browser CORS is no longer needed for this frontend's API requests. Keep backend CORS restrictions for other browser clients.

For Google login, set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` before building, configure the same web client in backend `GOOGLE_CLIENT_IDS`, and register the actual local/deployed frontend origins as authorized JavaScript origins. The button is shown only when a client ID is configured. See [Google Identity Services setup](https://developers.google.com/identity/gsi/web/reference/js-reference).

Use hosting/WAF rate limits on authentication endpoints in addition to backend OTP attempt and resend limits.

## Checks

```sh
npm run test:auth
npm run lint
npm run build
```

The auth tests use isolated local HTTP responses and verify HttpOnly cookies, CSRF checks, token stripping, refresh, failure handling, and logout. The backend `npm run test:user-auth` covers the real HTTP routes, JWTs, password hashing, OTP lifecycle, and session revocation using an isolated temporary MongoDB database and captured email delivery.

---
name: Auth API boundary
description: The non-obvious contract between the agriculture frontend and its separate API artifact.
---

The agriculture frontend sends batched tRPC-shaped requests to `/api/trpc`; the separate API artifact must expose matching auth routes and return `{ result: { data: { json: ... } } }` envelopes rather than HTML or plain 404 responses.

**Why:** A Vite-only frontend falls back to its index HTML for missing API routes, which makes the client report misleading JSON parse errors such as Unexpected end of JSON input.

**How to apply:** Keep auth routes mounted under the API artifact's `/api` router, preserve credential cookies for the browser session, disable ETags/cache revalidation on `/api/trpc`, return numeric tRPC error codes alongside readable messages, and verify the proxied `auth.me`, `auth.login`, and `auth.register` endpoints after workflow changes.

The Vercel credentials handler also needs a production Postgres/Neon URL at request time; its users table is bootstrapped on the first auth request so a fresh Neon database does not turn signup/login into a generic function crash.

**Why:** Vercel serverless functions may load the module before database configuration is available, and imported deployments do not automatically run the workspace's local Drizzle schema push.

**How to apply:** Set `DATABASE_URL` (or a supported Neon/Postgres URL variable) in Vercel Production, then redeploy; set `SESSION_SECRET` as well so browser cookies remain signed by a stable secret.

For the Vercel deployment, `/api/trpc/*` is rewritten directly to the root `api/index.ts` function; adding a route only to `artifacts/api-server` fixes local API-server workflows but not production.

**Why:** The workspace contains both a local API artifact and a separate Vercel serverless entrypoint, and the frontend path can otherwise reach a handler that does not know the requested operation.

**How to apply:** Keep production operations implemented in `api/index.ts` (or imported by it), and mirror them in `artifacts/api-server` only when local API-server preview support is also needed.
---
name: Auth API boundary
description: The non-obvious contract between the agriculture frontend and its separate API artifact.
---

The agriculture frontend sends batched tRPC-shaped requests to `/api/trpc`; the separate API artifact must expose matching auth routes and return `{ result: { data: { json: ... } } }` envelopes rather than HTML or plain 404 responses.

**Why:** A Vite-only frontend falls back to its index HTML for missing API routes, which makes the client report misleading JSON parse errors such as Unexpected end of JSON input.

**How to apply:** Keep auth routes mounted under the API artifact's `/api` router, preserve credential cookies for the browser session, disable ETags/cache revalidation on `/api/trpc`, return numeric tRPC error codes alongside readable messages, and verify the proxied `auth.me`, `auth.login`, and `auth.register` endpoints after workflow changes.
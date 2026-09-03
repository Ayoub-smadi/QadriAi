---
name: Admin account persistence
description: Durable rule for keeping the agriculture app's credential admin account in PostgreSQL.
---

The credential admin account must be represented in the shared PostgreSQL `users` table, with only a password hash stored there. Its username and admin role are ensured from the `ADMIN_PASSWORD` secret when the credential server starts.

**Why:** A browser-local admin session or a hardcoded password is not a durable account and cannot support reliable access after restarts or from another device.

**How to apply:** Keep the admin username normalized for lookup, never print or commit the password, and run the database schema push before starting the credential server so the `users` table exists.
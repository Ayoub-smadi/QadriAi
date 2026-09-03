---
name: Quote persistence boundary
description: Why the quote workflow currently uses browser-local persistence and what the follow-up must replace.
---

The quote workflow is intentionally browser-local for now because the active agricultural preview is a Vite-only imported artifact without a registered shared API workflow.

**Why:** This keeps the customer selection, admin pricing editor, saved records, and PDF export functional immediately without pretending that a backend endpoint exists.

**How to apply:** When shared persistence is implemented, replace the quote store's local read/write boundary with authenticated API/database operations while keeping the existing record shape, admin pricing editor, and PDF document presentation.
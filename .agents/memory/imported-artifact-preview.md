---
name: Imported artifact preview
description: How to distinguish a running imported web app from a registered artifact preview.
---

An imported web app can have a valid `.replit-artifact/artifact.toml` and a working Vite workflow while still not appearing in `listArtifacts()`. In that state, the direct app URL and workflow logs are usable for verification, but artifact-based screenshots/presentation may report that the artifact is missing.

**Why:** The project was imported with its files and legacy `Start application` workflow intact, but without a registered artifact record.

**How to apply:** Check `listArtifacts()` before using artifact presentation or screenshots. If it is empty, do not create a duplicate artifact just to obtain a preview; verify the active workflow and HTTP response instead unless registration is explicitly requested.
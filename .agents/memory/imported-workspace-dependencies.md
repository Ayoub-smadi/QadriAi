---
name: Imported workspace dependencies
description: Dependency setup behavior for imported pnpm workspaces and managed workflows.
---

Imported pnpm workspaces can arrive with a lockfile but without `node_modules`, causing managed workflows to report missing executables even when package manifests are complete.

**Why:** The import preserves source and lock state, but the runtime dependency tree may not be materialized in the new environment.

**How to apply:** Run the existing lockfile install before diagnosing workflow or build failures as application-code defects; do not add package-manager tools as project dependencies just to bootstrap the workspace.
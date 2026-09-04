---
name: Duplicate agriculture previews
description: The project contains two agriculture web artifacts that can render through the same root preview path.
---

When changing authentication or other shared user-facing behavior, keep both agriculture web artifacts synchronized or explicitly retire one before assuming the preview reflects the change.

**Why:** The duplicate root preview can make a corrected artifact appear broken when the user is actually viewing the other artifact.

**How to apply:** Check both agriculture artifact folders and their workflows whenever a preview-only regression persists after the API and primary frontend look correct.
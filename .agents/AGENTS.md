# Workspace Rules for Apex Intel

## Favicon and Brand Identity
- **DO NOT** overwrite, regenerate, replace, or modify the favicon in any future implementation, refactor, build optimization, or SEO task unless the user explicitly asks.
- The current favicon is part of the official product identity.
- When modifying `manifest.ts`, `metadata`, `layout.tsx`, `next.config.*`, or PWA assets, **preserve** the current favicon and ensure all references continue pointing to it.
- Ensure the favicon appears correctly on browser tabs, bookmarks, PWA manifests, and mobile home-screen icons.
- If a missing or broken favicon reference is detected, fix the reference but **do not** replace the actual favicon asset.

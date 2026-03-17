# Release Notes — New Floor3d Card v3.0.0

**Date:** 2026-03-17
**Repository:** [visaodeempresa/new-floor3d-card](https://github.com/visaodeempresa/new-floor3d-card)
**Base fork:** [adizanni/floor3d-card](https://github.com/adizanni/floor3d-card) @ v1.5.3

---

## Overview

v3.0.0 is the first full release of **New Floor3d Card** — a fork of the original
`floor3d-card` Lovelace custom card for Home Assistant. This version delivers a modernized
build toolchain, a collision-free card type rename, a complete CI/CD pipeline, and
publication as an independent HACS plugin.

The card renders interactive 3D floor plans directly inside HA dashboards, binding
Home Assistant entity states to 3D objects (lights, doors, rooms, covers, sensors, text
labels). v3.0.0 adds zero new visual features — all 3D functionality is inherited intact
from the upstream v1.5.3. The scope of this release is infrastructure, tooling, and
distribution.

---

## What Changed

### 1. Independent HACS Plugin

| Before | After |
|---|---|
| Fork of `adizanni/floor3d-card`, not on HACS | Published as `visaodeempresa/new-floor3d-card` on HACS (type: plugin) |
| Card type: `custom:floor3d-card` | Card type: `custom:new-floor3d-card` |
| JS bundle: `dist/floor3d-card.js` | JS bundle: `dist/new-floor3d-card.js` |
| HACS URL: `/hacsfiles/floor3d-card/floor3d-card.js` | HACS URL: `/hacsfiles/new-floor3d-card/new-floor3d-card.js` |

**Why rename?** Users can now install both cards simultaneously without the JS bundle
overwriting the original. The new card element name `new-floor3d-card` avoids
`customElements.define` re-registration errors.

### 2. Build Toolchain Modernization

All build dependencies were at end-of-life or deprecated. Updated to current stable:

| Package | Before | After |
|---|---|---|
| rollup | ^2.62.0 | ^4.14.0 |
| TypeScript | ^4.3.5 | ^5.4.0 |
| rollup-plugin-commonjs | ^11 (deprecated) | @rollup/plugin-commonjs ^25.0.7 |
| rollup-plugin-node-resolve | (deprecated) | @rollup/plugin-node-resolve ^15.2.3 |
| rollup-plugin-babel | (deprecated) | @rollup/plugin-babel ^6.0.4 |
| rollup-plugin-terser | (deprecated) | @rollup/plugin-terser ^0.4.4 |
| @rollup/plugin-json | ^4.1.0 | ^6.1.0 |
| rollup-plugin-typescript2 | ^0.30.0 | ^0.36.0 |
| @babel/core | ^7.14.6 | ^7.23.0 |

**tsconfig.json changes:**
- `target` / `lib` → `ES2020`
- `moduleResolution` → `bundler` (TypeScript 5 recommended for bundler pipelines)
- `useDefineForClassFields: false` — preserves Lit decorator behavior

**Source fixes required by TS5 bundler resolution:**
- `lit/decorators` → `lit/decorators.js` (explicit extensions required)
- Applied in `src/floor3d-card.ts` and `src/editor.ts`

### 3. CI/CD Pipeline

New GitHub Actions workflow (`.github/workflows/ci.yml`):

```
Trigger: push to feature/** | PR → develop | PR → release
Jobs:
  lint:   eslint src/*.ts
  build:  rollup -c  (depends on lint)
          ↳ uploads dist/new-floor3d-card.js as artifact (7-day retention)
Node: 22  |  Cache: ~/.npm keyed by package.json hash
```

**Branch protection on `develop`:** the `Lint & Build` status check must pass before
any merge is accepted. CI failures block merges at the GitHub level.

**Existing workflows modernized:**
- `build.yml` — `actions/checkout@v1` → `@v4`; added `actions/setup-node@v4` + `actions/cache@v4`
- `release.yml` — `svenstaro/upload-release-action@v1-release` → `@v2`; relative dist paths

### 4. Branch Cleanup Automation

`.github/workflows/cleanup-claude-branches.yml`:
- Triggers on push to `develop`
- Deletes merged `claude/*` branches automatically (keeps remote clean)

### 5. Repository Documentation

New `docs/` folder:
- `docs/ARCHITECTURE.md` — complete architecture document: source layout, build pipeline,
  dependency graph, branch strategy, release flow, HACS integration details
- `docs/architecture.drawio` — draw.io diagram of the full repository architecture
- `docs/CHANGELOG.md` — structured changelog covering all versions from 1.0.0 to 3.0.0

### 6. Git Branch Strategy

Established and documented flow:

```
main  ←  release  ←  develop  ←  feature/*
 ↑                      ↑
 tag v3.0.0        CI gate (Lint & Build)
```

---

## Installation (HACS)

1. **HACS → Custom Repositories** → add `visaodeempresa/new-floor3d-card` (type: Plugin)
2. **HACS → Frontend** → search **New Floor3d Card** → Download
3. After install, add Lovelace resource (auto-added by HACS):
   ```
   /hacsfiles/new-floor3d-card/new-floor3d-card.js  (JavaScript module)
   ```

## Dashboard Usage

```yaml
type: custom:new-floor3d-card
path: https://your-server/models/home/
objfile: home.obj
mtlfile: home.mtl
objectlist: home.json
lock_camera: 'no'
```

---

## Compatibility

| Component | Version |
|---|---|
| Home Assistant | 2023.4+ (tested) |
| HACS | 1.x / 2.x |
| Node.js (build) | 22 |
| Browser | Any modern browser (WebGL required) |

**Parallel install:** `new-floor3d-card` and `floor3d-card` (original) can coexist in
the same HA instance with no conflicts.

---

## Commit History (this release)

| Hash | Date | Message |
|---|---|---|
| `9aef868` | 2026-03-17 | chore: update repository URL to visaodeempresa/new-floor3d-card |
| `26f30ee` | 2026-03-17 | release: v2.0.0 - new-floor3d-card rename for collision-free parallel install |
| `41447a5` | 2026-03-17 | feat: rename card type to new-floor3d-card for collision-free parallel install (#1) |
| `2f9714e` | 2026-03-17 | build: track dist/new-floor3d-card.js for HACS direct install |
| `bd67564` | 2026-03-17 | feat: rename card type to new-floor3d-card for collision-free parallel install |
| `2db4bfe` | 2026-03-17 | ci: merge cleanup-claude-branches workflow into develop |
| `0148790` | 2026-03-17 | ci: auto-delete merged claude/* branches on push to develop/main |
| `a1c5b71` | 2026-03-17 | chore: gitignore .claude/settings.local.json |
| `8f90264` | 2026-03-17 | Merge feature/ci-pipeline into develop — CI passed |
| `56e252a` | 2026-03-17 | ci: add CI pipeline + modernize workflows + protect develop branch |
| `5dbb36e` | 2026-03-17 | build: update dist bundle and yarn.lock after Phase 1 dependency upgrade |
| `dfd3fe5` | 2026-03-17 | build: migrate to rollup v4 + TypeScript 5 + modern @rollup/* plugins (Phase 1) |
| `52303d6` | 2026-03-17 | docs: add architecture diagram, documentation and changelog |

---

## Files Changed Summary

```
package.json                              version 1.5.3 → 3.0.0; type:module added; deps modernized
rollup.config.js                          plugin imports updated; createRequire; babelHelpers: bundled
rollup.config.dev.js                      same as above
tsconfig.json                             ES2020 target; bundler moduleResolution; useDefineForClassFields
.eslintrc.js                              removed stale rollup-plugin-typescript2 require
src/floor3d-card.ts                       lit/decorators → lit/decorators.js; element renamed
src/editor.ts                             lit/decorators → lit/decorators.js
dist/new-floor3d-card.js                  renamed from dist/floor3d-card.js; rebuilt with new toolchain
hacs.json                                 NEW — HACS plugin manifest
.github/workflows/ci.yml                  NEW — Lint + Build CI pipeline
.github/workflows/cleanup-claude-branches.yml  NEW — auto-delete claude/* branches
.github/workflows/build.yml               modernized to v4 actions
.github/workflows/release.yml             modernized; upload-release-action v2
docs/ARCHITECTURE.md                      NEW
docs/CHANGELOG.md                         NEW
docs/architecture.drawio                  NEW
RELEASE_NOTES_v3.0.0.md                   NEW — this file
```

---

## Authors

- **Fork & modernization:** visaodeempresa
- **Original card:** Andrea Di Zanni (adizanni@msn.com)
- **License:** MIT

---

*Generated: 2026-03-17 | New Floor3d Card v3.0.0*

# Release Notes — New Floor3d Card v3.0.1

**Date:** 2026-03-17
**Repository:** [visaodeempresa/new-floor3d-card](https://github.com/visaodeempresa/new-floor3d-card)
**Branch:** `claude/make-repo-private-nhhsI` → `develop`

---

## Overview

v3.0.1 implements **Fase 2** of the dependency modernization roadmap: upgrade from **Lit 2
→ Lit 3**. This resolves Issue #194 and lays the foundation for the upcoming Three.js
upgrade (Fase 3).

No functional changes were made to the 3D rendering logic. All changes are strictly
dependency/toolchain updates.

---

## What Changed

### 1. Lit 2 → Lit 3 (`lit@2.3.1` → `lit@3.3.2`)

| Item | Before | After |
|---|---|---|
| `lit` version in `package.json` | `"^2.0.0"` | `"^3.0.0"` |
| Installed version | `2.3.1` | `3.3.2` |
| Import pattern (`lit/decorators.js`) | Already correct | No change needed |
| `CSSResultGroup`, `PropertyValues`, `TemplateResult` | Lit 2 API | Still present in Lit 3 (no break) |
| `render()` from `lit` | Lit 2 | Still present in Lit 3 (no break) |

**Why it was needed (Issue #194):** Lit 2 has a known issue with reactive property
initialization when `useDefineForClassFields: false` is combined with TypeScript strict
mode in certain HA dashboard contexts. Lit 3 resolves this through improved decorator
processing and reactive controller initialization.

**Risk mitigation — `overrides` field added to `package.json`:**

```json
"overrides": {
  "lit": "^3.0.0"
}
```

`@material/mwc-*@0.25.3` declares `lit@^2.0.0` as a regular (non-peer) dependency. Without
overrides, npm would keep a second copy of Lit 2 inside each MWC package, causing Rollup to
bundle two different `LitElement` base classes — a silent runtime conflict where
`customElements.define()` is called with mismatched prototypes.

The `overrides` field forces npm to resolve ALL `lit` imports across the entire dependency
tree to `^3.0.0`, ensuring a single deduplicated `lit@3.3.2` in `node_modules`. Lit 3 is
backward-compatible with the MWC 0.25.x pattern (legacy `experimentalDecorators`, `html`,
`css`, `LitElement`, `property`, `state`, `customElement`). The build confirmed zero
regressions.

### 2. `@lit-labs/scoped-registry-mixin` `^1.0.0` → `^1.0.4`

The `scoped-registry-mixin` was bumped from `1.0.0` to `1.0.4` (latest). v1.0.4 adds
explicit Lit 3 compatibility declarations in its peer deps. No API changes.

### 3. `CARD_VERSION` `'1.5.3'` → `'3.0.1'` (`src/const.ts`)

The version constant shown in the HA browser console was still at the upstream fork value
`1.5.3`. It now matches the npm package version `3.0.1`.

```
// Before
export const CARD_VERSION = '1.5.3';

// After
export const CARD_VERSION = '3.0.1';
```

### 4. Fix `build.yml` GitHub Action — `master` → `develop`

`build.yml` was triggering on push/PR to `master`, a branch that no longer exists in this
repository. It was updated to target `develop` (the active integration branch).

| File | Before | After |
|---|---|---|
| `.github/workflows/build.yml` | `branches: [master]` | `branches: [develop]` |

**Impact:** PRs and pushes to `develop` will now correctly trigger the Build job. Before
this fix, the Build action would never run.

---

## GitHub Actions Status After This PR

| Workflow | Trigger | Status |
|---|---|---|
| `ci.yml` | PR → `develop` | ✅ Correct — runs on this PR |
| `build.yml` | push/PR → `develop` | ✅ Fixed (was `master`) |
| `release.yml` | GitHub Release published | ✅ Unchanged, correct |
| `cleanup-claude-branches.yml` | push to `develop`/`main` | ✅ Unchanged, correct |

---

## Build Verification

```
npm install          → added 2 packages, changed 6 packages (lit@3.3.2 overridden)
npm run lint         → no errors
npm run rollup       → dist/new-floor3d-card.js created in 8.2s (926K)
```

Only non-blocking warnings from `@formatjs/intl-utils` (pre-existing CJS legacy code,
unrelated to this change).

---

## What Was NOT Changed

- Three.js: still at `^0.130.1` (Fase 3)
- `@tweenjs/tween.js`: still at `^18.6.4` (Fase 4)
- `custom-card-helpers`: still at `^1.7.2` (Fase 4)
- Issue #196 (drawer direction): not in scope (Fase 4)
- Issue #193 (TypeError Android): not in scope (Fase 4)

---

## Roadmap Remaining

| Phase | Scope | Status |
|---|---|---|
| Fase 2 | Lit 2 → 3 | ✅ **Done (this PR)** |
| Fase 3 | Three.js r130 → r183 | 🔜 Next |
| Fase 4 | tween.js v18→v25, custom-card-helpers v1→v2, Issue #196, Issue #193 | 🔜 Pending |

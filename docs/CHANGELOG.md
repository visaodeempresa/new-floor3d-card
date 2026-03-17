# Changelog

All notable changes to `floor3d-card` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) — Versioning: [SemVer](https://semver.org/).

---

## [Unreleased]

### Planned
- Upgrade Lit from v2 to v3 (fixes HA 2025.11+ compatibility — Issue #194)
- Upgrade Three.js from r130 to r183
- Upgrade tween.js from v18 to v25
- Fix door slide direction bug (Issue #196)
- Fix TypeError on Android Chrome (Issue #193)

---

## [1.5.3-phase2-devops] — 2026-03-17 — CI/CD Pipeline Setup

### Added
- `.github/workflows/ci.yml` — CI pipeline triggered on every push to `feature/**` and on PRs targeting `develop` or `release`
  - Jobs: **Lint** (`npm run lint`) + **Build** (`npm run rollup`)
  - Node.js 22, npm cache (`~/.npm` keyed by `package.json` hash)
  - Uploads `dist/floor3d-card.js` as artifact (retention: 7 days)
- **Branch protection** on `develop`: status check `Lint & Build` must pass before any merge is accepted

### Changed
- `.github/workflows/build.yml` — modernized from `actions/checkout@v1` → `@v4`; added `actions/setup-node@v4` (Node 22) and `actions/cache@v4` for npm store
- `.github/workflows/release.yml` — same modernization; bumped `svenstaro/upload-release-action@v1-release` → `@v2`; replaced hardcoded absolute paths with relative `dist/floor3d-card.js`

### Process (enforced from this point forward)
1. All feature work happens on `feature/**` branches
2. Every push triggers the CI pipeline automatically
3. A feature branch is merged into `develop` **only after** the `Lint & Build` check passes
4. GitHub branch protection on `develop` enforces this gate — merges that bypass a green CI are rejected

---

## [1.5.3-phase1] — 2026-03-17 — Build Pipeline Modernization

### Added
- `docs/` folder with project documentation
- `docs/architecture.drawio` — full repository architecture diagram (draw.io format)
- `docs/ARCHITECTURE.md` — detailed architecture documentation with dependency analysis
- `docs/CHANGELOG.md` — this changelog file
- Git branch strategy: `master → release → develop → feature/*`
- `"type": "module"` to `package.json` — explicit ES module declaration required by rollup v4

### Changed
- **rollup** upgraded from `^2.62.0` to `^4.14.0`
- **TypeScript** upgraded from `^4.3.5` to `^5.4.0`
- **`rollup-plugin-commonjs`** (deprecated) replaced by `@rollup/plugin-commonjs@^25.0.7`
- **`rollup-plugin-node-resolve`** (deprecated) replaced by `@rollup/plugin-node-resolve@^15.2.3`
- **`rollup-plugin-babel`** (deprecated) replaced by `@rollup/plugin-babel@^6.0.4`
- **`rollup-plugin-terser`** (deprecated) replaced by `@rollup/plugin-terser@^0.4.4`
- **`@rollup/plugin-json`** upgraded from `^4.1.0` to `^6.1.0`
- **`rollup-plugin-typescript2`** upgraded from `^0.30.0` to `^0.36.0`
- **`@babel/core`** upgraded from `^7.14.6` to `^7.23.0`
- `rollup.config.js` — updated plugin imports; added `createRequire` for CJS `require.resolve()`; added `babelHelpers: 'bundled'` (required by `@rollup/plugin-babel`)
- `rollup.config.dev.js` — same plugin import updates and `babelHelpers: 'bundled'`
- `.eslintrc.js` — removed stale unused `require("rollup-plugin-typescript2")`
- `tsconfig.json` — upgraded target/lib to `ES2020`; `moduleResolution` changed from `node` to `bundler` (TypeScript 5 recommended for bundler pipelines); added `useDefineForClassFields: false` (preserves Lit decorator behavior)
- `src/floor3d-card.ts` and `src/editor.ts` — fixed `lit/decorators` → `lit/decorators.js` (required by TypeScript 5 `bundler` module resolution)

---

## [1.5.3] — 2023-04-10

### Fixed
- Fixed `editMode` compatibility with Home Assistant 2023.4

---

## [1.5.2] — 2023-04-09

### Fixed
- Additional fixes for HA 2023.4 compatibility

---

## [1.5.1] — 2023-01-02

### Added
- Documentation for all parameters introduced in v1.5.0
- Visual editor support for all new parameters
- Changed default values for improved out-of-box experience

---

## [1.5.0] — 2022 (estimated)

### Added
- `show_axes` parameter for 3D axis visualization
- `lock_camera` option
- `overlay` support with configurable colors, font, size, alignment
- `zoom_areas` configuration
- `object_groups` for logical grouping of 3D objects
- `gesture` support (long press, double tap)
- `rotate` animation type
- `sky` dome support via Three.js `Sky` object
- `shadow` casting configuration
- `selectionMode` for interactive object selection
- `editModeNotifications` for HA edit mode awareness
- GLB/GLTF model format support (faster loading than OBJ/MTL)
- Multi-floor `levels` navigation menu
- `text` type3d for entity-linked 3D text labels

### Changed
- Refactored swing/slide door animation code (PR #131)
- Improved `OrbitControls` camera management

---

## [1.4.x] — 2022

### Added
- Tween.js animations for sliding doors (PR #131)
- `long_press` mouse event support (PR #131)
- Click/selection mode improvements

---

## [1.3.x] — 2022

### Added
- Visual card editor (`editor.ts`) introduced (PR #132)
- `colorcondition` — conditional color mapping per entity state
- `transparency` control per room/object
- `brightness` for light entities

---

## [1.2.x] — 2021-2022

### Added
- `door` type3d with `swing` and `slide` door types
- `room` type3d for area coloring
- `light` type3d for 3D light point entities
- `cover` type3d for cover/blind entities
- Multi-language support (`en`, `nb`)
- HACS default repository acceptance

---

## [1.1.x] — 2021

### Added
- Initial `label` / text overlay support
- `tap_action`, `double_tap_action`, `hold_action` support
- `@tweenjs/tween.js` integration for smooth animations

---

## [1.0.0] — 2021

### Added
- Initial release
- Three.js-based 3D model rendering (OBJ/MTL format)
- Home Assistant entity state binding to 3D objects
- OrbitControls camera navigation
- `on/off` entity type for object visibility toggling
- `color` entity type for material color changes
- Basic HACS installation support

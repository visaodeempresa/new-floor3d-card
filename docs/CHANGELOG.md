# Changelog

All notable changes to `floor3d-card` are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) — Versioning: [SemVer](https://semver.org/).

---

## [Unreleased]

### Added
- `docs/` folder with project documentation
- `docs/architecture.drawio` — full repository architecture diagram (draw.io format)
- `docs/ARCHITECTURE.md` — detailed architecture documentation with dependency analysis
- `docs/CHANGELOG.md` — this changelog file
- Git branch strategy: `master → release → develop → feature/*`

### Planned
- Migrate build pipeline from rollup v2 + deprecated plugins to rollup v4 + `@rollup/*` plugins
- Upgrade Lit from v2 to v3 (fixes HA 2025.11+ compatibility — Issue #194)
- Upgrade Three.js from r130 to r183
- Upgrade tween.js from v18 to v25
- Fix door slide direction bug (Issue #196)
- Fix TypeError on Android Chrome (Issue #193)

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

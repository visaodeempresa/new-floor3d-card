# floor3d-card — Architecture Documentation

> Version: **1.5.3** | Last updated: 2026-03-17

The diagram `architecture.drawio` (open with [draw.io](https://app.diagrams.net/)) illustrates the full structure of this repository.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Source Files (`src/`)](#2-source-files-src)
3. [Custom Elements (`elements/`)](#3-custom-elements-elements)
4. [Localization (`src/localize/`)](#4-localization-srclocalize)
5. [Build Pipeline](#5-build-pipeline)
6. [Distribution Output (`dist/`)](#6-distribution-output-dist)
7. [External Dependencies](#7-external-dependencies)
8. [Home Assistant Runtime Integration](#8-home-assistant-runtime-integration)
9. [Git Branch Strategy](#9-git-branch-strategy)
10. [Known Technical Debt](#10-known-technical-debt)

---

## 1. Overview

`floor3d-card` is a [Home Assistant](https://www.home-assistant.io/) Lovelace custom card that renders an interactive 3D model of a building and binds entity states to 3D objects in real time.

```
src/ (TypeScript)
  └──► rollup + TypeScript + Babel
          └──► dist/floor3d-card.js  (single ES module)
                  └──► loaded by Home Assistant Lovelace
                          └──► interacts with hass object + WebGL
```

---

## 2. Source Files (`src/`)

### `floor3d-card.ts` — Main Card (3285 lines)

The core of the card. Registers the custom element `<floor3d-card>` and extends `LitElement`.

**Responsibilities:**

| Domain | Description |
|--------|-------------|
| 3D Scene lifecycle | Initializes Three.js `Scene`, `PerspectiveCamera`, `WebGLRenderer` |
| Model loading | Loads `.obj`/`.mtl` (OBJLoader + MTLLoader) and `.glb`/`.gltf` (GLTFLoader) |
| Entity binding | Maps Home Assistant entity states to 3D objects |
| Doors | `swing`, `slide`, and `pivot` animations via Tween.js |
| Rooms | Color and transparency changes per entity state |
| Lights | On/off and brightness (HemisphereLight, PointLight) |
| Labels & Text | 3D text overlays via `three-spritetext` |
| Raycasting | Click/hover detection on 3D objects |
| Camera | `OrbitControls` with configurable lock, zoom areas |
| Level selector | Multi-floor visibility management |
| Sky dome | `Three.Sky` object integration |
| Shadow | Configurable shadow casting |
| Gestures | Gesture and rotation animations |

**Key imports:**

```typescript
import { LitElement, html, TemplateResult, css, PropertyValues, CSSResultGroup, render } from 'lit';
import { property, customElement, state } from 'lit/decorators';
import { HomeAssistant, ActionHandlerEvent, handleAction, LovelaceCardEditor, fireEvent } from 'custom-card-helpers';
import { HassEntity } from 'home-assistant-js-websocket';
import * as TWEEN from '@tweenjs/tween.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { Sky } from 'three/examples/jsm/objects/Sky';
```

---

### `editor.ts` — Visual Editor (2956 lines)

Registers `<floor3d-card-editor>` and implements the `LovelaceCardEditor` interface, enabling the drag-and-drop visual configuration panel in HA.

**Responsibilities:**

| Domain | Description |
|--------|-------------|
| Entity config forms | Adds/removes/edits entity bindings |
| Object group editor | Groups 3D objects into logical units |
| Zoom area editor | Configures named camera zoom positions |
| MWC form fields | Uses `floor3d-textfield`, `floor3d-select`, `floor3d-formfield` |
| Config serialization | Converts UI state → `Floor3dCardConfig` object via `fireEvent` |

---

### `helpers.ts` — Utility Functions (219 lines)

Pure utility functions shared between `floor3d-card.ts` and `editor.ts`.

| Function | Description |
|----------|-------------|
| `mergeDeep(...objects)` | Immutable deep merge of config objects |
| `createConfigArray(config)` | Flattens entity config into array form |
| `createObjectGroupConfigArray(config)` | Flattens object group config |
| `createEditorConfigArray(config)` | Editor-specific entity array builder |
| `createEditorObjectGroupConfigArray(config)` | Editor-specific object group array builder |
| `createEditorZoomConfigArray(config)` | Editor-specific zoom area array builder |
| `arrayMove(arr, from, to)` | Reorders array elements |
| `getLovelace()` | Retrieves the active Lovelace config from HA |

---

### `types.ts` — Type Definitions

Declares the `Floor3dCardConfig` interface (40+ properties) and extends the global `HTMLElementTagNameMap` for TypeScript awareness of custom elements.

Key config properties include: `path`, `objfile`, `mtlfile`, `objectlist`, `entities`, `object_groups`, `zoom_areas`, `globalLightPower`, `shadow`, `show_axes`, `lock_camera`, `backgroundColor`, and entity-level properties like `type3d`, `object_id`, `door`, `light`, `room`, `text`, `rotate`, `gesture`.

---

### `const.ts` — Constants

```typescript
export const CARD_VERSION = '1.5.3';
```

---

### `ensureComponents.ts` — HA Component Loader

Lazy-loads Home Assistant internal custom elements required by the editor:
- `hui-action-editor`
- `ha-icon-picker`
- `ha-entity-picker`

Triggers via `(customElements.get("hui-button-card") as any)?.getConfigElement()`.

---

## 3. Custom Elements (`elements/`)

Wrappers that re-register Material Web Components (MWC) under `floor3d-*` names to avoid conflicts with HA's global MWC registrations.

| File | Custom Element | Extends |
|------|---------------|---------|
| `button.ts` | `<floor3d-button>` | `@material/mwc-button/mwc-button-base.js` |
| `formfield.ts` | `<floor3d-formfield>` | `@material/mwc-formfield/mwc-formfield-base.js` |
| `select.ts` | `<floor3d-select>` | `@material/mwc-select/mwc-select-base.js` |
| `textfield.ts` | `<floor3d-textfield>` | `@material/mwc-textfield/mwc-textfield-base.js` |

---

## 4. Localization (`src/localize/`)

| File | Description |
|------|-------------|
| `localize.ts` | `localize(string, search?, replace?)` — reads `localStorage.selectedLanguage` |
| `languages/en.json` | English translations |
| `languages/nb.json` | Norwegian (Bokmål) translations |

---

## 5. Build Pipeline

Entry point: `src/floor3d-card.ts`
Output: `dist/floor3d-card.js` (single ES module, minified)

```
rollup.config.js
├── rollup-plugin-node-resolve   → resolves node_modules
├── rollup-plugin-commonjs       → CJS → ESM conversion
├── rollup-plugin-typescript2    → TypeScript compilation
├── @rollup/plugin-json          → imports .json files
├── rollup-plugin-babel          → ES transpilation
├── rollup-plugin-terser         → minification (production only)
├── rollup-plugin-serve          → dev server on :5000 (watch mode only)
└── rollup-ignore-plugin.js      → excludes MWC files already in HA
```

**Scripts:**

| Command | Action |
|---------|--------|
| `npm run build` | Lint + rollup (production) |
| `npm run start` | rollup watch + dev server |
| `npm run lint` | ESLint on `src/*.ts` |
| `npm run rollup` | Bundle only |

> ⚠️ **Technical Debt**: All rollup plugins used (`rollup-plugin-commonjs`, `rollup-plugin-node-resolve`, `rollup-plugin-babel`) are **deprecated**. Modern equivalents: `@rollup/plugin-commonjs`, `@rollup/plugin-node-resolve`, `@rollup/plugin-babel`.

---

## 6. Distribution Output (`dist/`)

| File | Description |
|------|-------------|
| `floor3d-card.js` | Fully bundled, minified ES module (~2300+ lines minified) |

All dependencies (including Lit, Three.js, Tween.js, etc.) are **bundled inline** — no external CDN calls at runtime. Served to Home Assistant via HACS at `/hacsfiles/floor3d-card/floor3d-card.js`.

---

## 7. External Dependencies

### Runtime (bundled into dist)

| Package | Current | Latest | Status |
|---------|---------|--------|--------|
| `lit` | ^2.0.0 | 3.3.2 | 🔴 Major version behind |
| `three` | ^0.130.1 | 0.183.2 | 🔴 53 minor versions behind |
| `custom-card-helpers` | ^1.7.2 | 2.0.0 | 🟠 Major version behind |
| `@tweenjs/tween.js` | ^18.6.4 | 25.0.0 | 🟠 7 major versions behind |
| `home-assistant-js-websocket` | ^5.11.1 | 9.6.0 | 🟠 4 major versions behind |
| `@lit-labs/scoped-registry-mixin` | ^1.0.0 | 1.0.4 | 🟢 Minor update |
| `@material/mwc-*` | ^0.25.3 | — | 🟡 Check compatibility |
| `@mdi/font` | ^6.5.95 | 7.4.47 | 🟡 Major version behind |
| `three-spritetext` | ^1.6.4 | latest | 🟡 Check |

### Dev (build only)

| Package | Current | Latest | Status |
|---------|---------|--------|--------|
| `rollup` | ^2.62.0 | 4.59.0 | 🔴 2 major versions |
| `typescript` | ^4.3.5 | 5.9.3 | 🟠 Major version |
| `rollup-plugin-commonjs` | ^10 | — | 🔴 Deprecated |
| `rollup-plugin-node-resolve` | ^5 | — | 🔴 Deprecated |
| `rollup-plugin-babel` | ^4 | — | 🔴 Deprecated |
| `rollup-plugin-terser` | ^7 | — | 🔴 Deprecated |

---

## 8. Home Assistant Runtime Integration

The card integrates with HA via these standard interfaces:

```
window.customCards.push(...)  → HA card picker registration
@customElement('floor3d-card') → Web Components API
setConfig(config)              → HA calls this on config change
set hass(hass)                 → HA calls this on every state update
getCardSize()                  → HA layout engine
getStubConfig()                → HA editor default config
static getConfigElement()      → HA editor instantiation
```

Entity state changes flow:
```
HA WebSocket → hass object → set hass(value) → _process_entities() → Three.js object mutations → requestUpdate()
```

---

## 9. Git Branch Strategy

```
master          ← production-stable, tagged releases
  └── release   ← release candidates, integration testing
        └── develop  ← integration branch for merged features
              └── feature/*  ← individual feature development
```

**Tag convention:** `vMAJOR.MINOR.PATCH` — created on every push to `release` and `master`.

**Merge flow:**
```
feature/* → develop → release → master
```

---

## 10. Known Technical Debt

| Priority | Issue | Description |
|----------|-------|-------------|
| 🔴 Critical | Lit 2 → 3 migration | HA 2025.11+ uses Lit 3; bundling Lit 2 causes custom element registration conflicts (Issue #194) |
| 🔴 Critical | Build toolchain obsolete | All rollup plugins are deprecated; prevents using modern rollup v4 features |
| 🔴 High | Three.js r130 → r183 | 53 minor versions of breaking geometry/material/loader API changes |
| 🟠 Medium | tween.js v18 → v25 | 7 major versions of API changes in animation library |
| 🟠 Medium | custom-card-helpers v1 → v2 | API changes in HA helper library |
| 🟠 Medium | home-assistant-js-websocket v5 → v9 | 4 major versions of WebSocket API |
| 🟡 Low | TypeScript 4 → 5 | Stricter types, newer decorators API |
| 🟡 Low | No automated tests | No unit/integration test suite |
| 🟡 Low | Single language support | Only English and Norwegian available |

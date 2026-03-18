# Fase 3 — Upgrade Three.js r130 → r183

**Repositorio:** [visaodeempresa/new-floor3d-card](https://github.com/visaodeempresa/new-floor3d-card)
**Branch:** `claude/make-repo-private-nhhsI` → `develop`
**Fase anterior:** [v3.0.1 — Lit 2→3](./RELEASE_NOTES_v3.0.1.md)

---

## Sumario Executivo

O upgrade de Three.js de `r130` (Jul/2021) para `r183` (Mar/2025) abrange **53 versoes**
e **~3.5 anos** de desenvolvimento. Durante esse periodo, o Three.js passou por uma das
maiores refatoracoes de sua historia: remocao de APIs legadas, novo sistema de cor,
transicao para ES modules puros, e deprecacao de WebGL 1.

Este documento cataloga **todas as 53 versoes**, com descricao das alteracoes, e classifica
o **risco de impacto** no floor3d-card em 5 niveis.

---

## APIs Utilizadas no floor3d-card (Superficie de Impacto)

Antes de avaliar o risco de cada versao, e essencial saber quais APIs do Three.js sao
usadas no projeto. A lista completa foi extraida de `src/floor3d-card.ts`:

| Categoria | APIs |
|---|---|
| **Core** | `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `Object3D`, `Group` |
| **Geometrias** | `PlaneGeometry`, **`BoxBufferGeometry`** ⚠️, `BufferGeometry` |
| **Materiais** | `MeshBasicMaterial`, `MeshPhongMaterial`, `MeshStandardMaterial`, `MeshLambertMaterial`, `SpriteMaterial` |
| **Meshes** | `Mesh`, `Sprite` |
| **Luzes** | `DirectionalLight`, `HemisphereLight`, `AmbientLight`, `SpotLight`, `PointLight` |
| **Helpers** | `AxesHelper`, `DirectionalLightHelper` |
| **Controles** | `OrbitControls` (from `three/examples/jsm/controls/OrbitControls`) |
| **Loaders** | `OBJLoader`, `MTLLoader`, `GLTFLoader` (from `three/examples/jsm/loaders/*`) |
| **Objetos especiais** | `Sky` (from `three/examples/jsm/objects/Sky`) |
| **Matematica** | `Vector2`, `Vector3`, `Box3`, `Matrix4`, `Plane`, `Spherical`, `Color`, `Raycaster` |
| **Texturas** | `CanvasTexture` |
| **Constantes** | **`sRGBEncoding`** ⚠️, `LinearToneMapping`, **`PCFSoftShadowMap`** ⚠️ |
| **Renderer props** | **`outputEncoding`** ⚠️, **`physicallyCorrectLights`** ⚠️, `toneMapping`, `toneMappingExposure`, `shadowMap.*`, `localClippingEnabled` |
| **Animacao** | `Clock`, `@tweenjs/tween.js` (externo) |
| **Dependencias** | `three-spritetext` (externo, precisa compatibilidade com r183) |

**APIs marcadas com ⚠️ tem breaking changes confirmados no range r130→r183.**

---

## Niveis de Risco

| Nivel | Icone | Cor | Descricao |
|---|---|---|---|
| 1 | ✅ | 🟢 Verde | **Nenhum** — Sem alteracoes que afetem o projeto |
| 2 | 💚 | 🟢 Verde-claro | **Minimo** — Alteracoes internas, sem impacto na API publica usada |
| 3 | ⚠️ | 🟡 Amarelo | **Baixo** — Deprecacoes ou mudancas menores, facil correcao |
| 4 | 🟠 | 🟠 Laranja | **Medio** — Breaking changes que requerem migracao |
| 5 | 🔴 | 🔴 Vermelho | **Alto/Critico** — Remocao de APIs usadas, refatoracao obrigatoria |

---

## Tabela Completa: 53 Versoes (r131 → r183)

| # | Versao | Data | Alteracoes Relevantes | Risco |
|---|---|---|---|---|
| 1 | **r131** | Jul 2021 | Removido `morphTargets`/`morphNormals` properties (nao usados). Renomeado `attenuationColor` → `attenuationTint` (nao usado). Melhorias em WebXR. | ✅ Nenhum |
| 2 | **r132** | Aug 2021 | **Removido fator PI dos shaders — cenas podem parecer mais escuras.** Removido `BufferGeometry.computeFaceNormals()`. `MeshPhysicalMaterial.sheen` → `sheenTint`. Alpha map/test suporte adicionado a shadow maps. | ⚠️ Baixo |
| 3 | **r133** | Sep 2021 | **`Raycaster.intersectObject()` — parametro `recursive` agora `true` por default.** `TextGeometry`, `FontLoader`, `Font` movidos para examples/jsm. `ParametricGeometry` movido para examples. `BufferGeometryUtils` agora usa `import *`. | ⚠️ Baixo |
| 4 | **r134** | Oct 2021 | **`FileLoader` agora usa `fetch` ao inves de `XMLHttpRequest`** — pode afetar loaders (OBJ/MTL/GLTF) em contextos sem rede. Removido `DeviceOrientationControls`, `ImmediateRenderObject`. `OrbitControls` nao permite zoom durante rotacao. | ⚠️ Baixo |
| 5 | **r135** | Dec 2021 | **Textura: dimensoes, formato e tipo imutaveis apos primeiro uso.** `MeshStandardMaterial` pode parecer visualmente diferente (menos brilhante). `GLTFExporter.parse()` signature alterada. Removido `LogLuvEncoding`. | 💚 Minimo |
| 6 | **r136** | Jan 2022 | **Removidos:** `RGBEEncoding`, `RGBDEncoding`, `RGBM7Encoding`, `RGBM16Encoding`, `GammaEncoding`, `gammaFactor` (nenhum usado no projeto). Half-float render targets. `FramebufferTexture` substitui `copyFramebufferToTexture`. `EXRLoader` nao suporta mais `UnsignedByteType`. | 💚 Minimo |
| 7 | **r137** | Feb 2022 | **CRITICO: Removidos `RGBFormat`, `RGBIntegerFormat`, `UnsignedShort565Type`.** WebGL context agora criado com `alpha: true` por default. **Decodificacao sRGB inline removida do GLSL** — pode mudar aparencia de texturas. `VideoTexture` default agora `RGBAFormat`. | 🟠 Medio |
| 8 | **r138** | Mar 2022 | Removido `WebGLMultisampleRenderTarget` (use `samples`). Renomeado `DataTexture3D` → `Data3DTexture`. **Removido `Euler.toVector3()`**. Loaders/Exporters agora convertem cores entre linear/sRGB. Transparencia com canvas/render targets alterada. | ⚠️ Baixo |
| 9 | **r139** | May 2022 | `DepthTexture` default type agora `UnsignedIntType`. `PCDLoader.parse()` removeu parametro `url`. `SelectionHelper` constructor alterado. | ✅ Nenhum |
| 10 | **r140** | Jun 2022 | **`fog` movido de `Material` base para materiais especificos** (nao usado diretamente). `SkinnedMesh` requer floating point vertex textures. Removido `CubeUVRefractionMapping`, `MeshStandardMaterial.refractionRatio`. `Euler`/`Quaternion`/`Color` agora iteraveis. | 💚 Minimo |
| 11 | **r141** | Jul 2022 | Politica de remocao: max 10 releases apos deprecacao. Removido `embedImages` do `GLTFExporter`. Ultima limpeza de `Geometry` legado. | ✅ Nenhum |
| 12 | **r142** | Aug 2022 | `DataUtils` agora usa `import *` pattern. Melhorias internas de performance. | ✅ Nenhum |
| 13 | **r143** | Sep 2022 | `AnimationUtils` agora usa `import *` pattern. `PCDLoader` default material color agora branco. | ✅ Nenhum |
| 14 | **r144** | Oct 2022 | **`MeshLambertMaterial` agora usa per-fragment shading** (antes per-vertex) — visual pode mudar. **`Scene.autoUpdate` → `Object3D.matrixWorldAutoUpdate`**. Removido `BufferGeometry.merge()`. `ShapePath.toShapes()` removeu `noHoles`. | 🟠 Medio |
| 15 | **r145** | Nov 2022 | **`BoxBufferGeometry`, `PlaneBufferGeometry`, etc. — aliases DEPRECATED.** Deve-se usar `BoxGeometry`, `PlaneGeometry`. `BufferGeometry.merge()` removido (use `BufferGeometryUtils.mergeBufferGeometries()`). `FlyControls`/`FirstPersonControls` agora Pointer Events. | 🟠 Medio |
| 16 | **r146** | Dec 2022 | `BloomPass` removeu parametro `resolution`. `BokehPass` removeu `width`/`height`. `ShaderLib` cube uniforms alterados. | ✅ Nenhum |
| 17 | **r147** | Jan 2023 | **`PointLight`/`SpotLight` decay default agora `2`** (fisicamente correto). Luzes do projeto podem mudar de intensidade/alcance. Removido `KHR_materials_pbrSpecularGlossiness` do `GLTFLoader`. | 🔴 Alto |
| 18 | **r148** | Feb 2023 | **`examples/js` removido completamente** — apenas `examples/jsm` (ES modules). O projeto ja usa `jsm`, sem impacto. Defaults de geometrias alterados (circles, cylinders, cones). `GLTFLoader` garante ordem de nodes conforme glTF. | 💚 Minimo |
| 19 | **r149** | Mar 2023 | **Renomeados:** `Euler.DefaultOrder` → `Euler.DEFAULT_ORDER`, `Object3D.DefaultUp` → `Object3D.DEFAULT_UP`, `Object3D.DefaultMatrixAutoUpdate` → `Object3D.DEFAULT_MATRIX_AUTO_UPDATE`. Removido `THREE.TwoPassDoubleSide`. | ⚠️ Baixo |
| 20 | **r150** | Apr 2023 | **`physicallyCorrectLights = true` → `useLegacyLights = false`**. Projeto usa `physicallyCorrectLights = false` na linha 1322 — precisa migrar para `useLegacyLights = true`. `ColorManagement.legacyMode=false` → `ColorManagement.enabled=true`. **`MeshStandardMaterial.roughness` default `0.5` → `1`** — materiais standard sem roughness explicito ficam mais foscos. Removido `BasisTextureLoader`. | 🔴 Alto |
| 21 | **r151** | May 2023 | Renomeados: `mergeBufferAttributes()` → `mergeAttributes()`, `mergeBufferGeometries()` → `mergeGeometries()`, `GroundProjectedEnv` → `GroundProjectedSkybox`. **`aoMap`/`lightMap` nao usam mais `uv2`** (use `material.lightMap.channel`). `MapControls` agora em modulo separado. | ⚠️ Baixo |
| 22 | **r152** | Jun 2023 | **CRITICO:** **`Texture.encoding` → `Texture.colorSpace`**. **`WebGLRenderer.outputEncoding` → `outputColorSpace`**. **`THREE.sRGBEncoding` → `THREE.SRGBColorSpace`**. **`THREE.LinearEncoding` → `THREE.LinearSRGBColorSpace`**. `ColorManagement.enabled` agora `true` por default. UV renaming: `uv2`/`uv3` → `uv1`/`uv2`. | 🔴 Alto |
| 23 | **r153** | Jul 2023 | **WebGL 1 DEPRECATED** (removido em r163). Default render target texture type → `HalfFloatType`. `CubeTextureLoader` carrega em sRGB por default. Removidos `AdaptiveToneMappingPass`, `ColladaExporter`. | ⚠️ Baixo |
| 24 | **r154** | Aug 2023 | Shader chunks renomeados: `encodings_fragment` → `colorspace_fragment`, `output_fragment` → `opaque_fragment`. Nao afeta diretamente (sem custom shaders). | ✅ Nenhum |
| 25 | **r155** | Sep 2023 | **`useLegacyLights` agora `false` por default (DEPRECATED).** Tone mapping so funciona renderizando para tela (nao post-processing). O projeto usa `toneMapping` diretamente — OK. `OutputPass` constructor sem parametros. | 🟠 Medio |
| 26 | **r156** | Oct 2023 | `FilmPass`, `SAOPass`, `SSAOPass` constructors alterados (nao usados). Melhorias internas de rendering. | ✅ Nenhum |
| 27 | **r157** | Nov 2023 | Removidos `AmbientLightProbe`, `HemisphereLightProbe` (nao usados). Removido `GeometricContext` GLSL struct — pode afetar custom shaders (nao ha custom shaders no projeto). | ✅ Nenhum |
| 28 | **r158** | Dec 2023 | `Quaternion`s agora devem ser normalizados. `bumpScale` agora invariante a escala de coordenadas de textura. | ✅ Nenhum |
| 29 | **r159** | Jan 2024 | `BatchedMesh.applyGeometry()` → `addGeometry()`. `BufferAttribute.updateRange` → `updateRanges` (suporta multiplos ranges). Removido suporte WebGL 1 de `SkinnedMesh`. | ✅ Nenhum |
| 30 | **r160** | Feb 2024 | **Removidos build files `build/three.js` e `build/three.min.js`** — projeto usa bundler (Rollup), sem impacto. `HBAOPass` → `GTAOPass`. `Triangle.getBarycoord()` retorna `null` para triangulos degenerados. | 💚 Minimo |
| 31 | **r161** | Mar 2024 | Removido `WebGLMultipleRenderTargets`. `GroundProjectedSkybox` substitui `GroundProjectedEnv`. Equirect environment maps auto-convertidos para cube. | ✅ Nenhum |
| 32 | **r162** | Apr 2024 | **CRITICO: constantes `sRGBEncoding`/`LinearEncoding` e propriedade `outputEncoding` REMOVIDAS** (deprecated em r152). Usar `SRGBColorSpace`/`LinearSRGBColorSpace` e `outputColorSpace`. `HTMLImageElement` textures usam `naturalWidth`/`naturalHeight`. Removido `WebGLMultipleRenderTargets`. | 🔴 Alto |
| 33 | **r163** | May 2024 | **WebGL 1 REMOVIDO** — `WebGLRenderer` agora requer WebGL 2. `stencil` default agora `false`. `TextGeometry` `height` → `depth`. **`Scene.environmentIntensity`** nova propriedade. `envMapIntensity` agora per-material. | ⚠️ Baixo |
| 34 | **r164** | Jun 2024 | `LWOLoader` conversao de coordenadas. Shader chunk `lightmap_fragment` removido. `WebGLNodeBuilder` removido. | ✅ Nenhum |
| 35 | **r165** | Jul 2024 | **`useLegacyLights` REMOVIDO** — luzes fisicamente corretas sao o unico modo. `copyTextureToTexture()` e `copyFramebufferToTexture()` signatures alteradas (nao usados). | 🔴 Alto |
| 36 | **r166** | Aug 2024 | `BatchedMesh` requer `addInstance()`. Melhorias internas. | ✅ Nenhum |
| 37 | **r167** | Sep 2024 | WebGPU/TSL imports reestruturados. Removido `HDRJPGLoader`. | ✅ Nenhum |
| 38 | **r168** | Oct 2024 | TSL chaining removido. `DragControls` API alterada. Removidos `PointerLockControls.getObject()`, `LogLuvLoader`. Renomeado `viewportTopLeft` → `viewportUV`. | ✅ Nenhum |
| 39 | **r169** | Nov 2024 | `TransformControls` agora derivado de `Controls`. Removidos `PackedPhongMaterial`, `SDFGeometryGenerator`, `TiltLoader`. `GeometryCompressionUtils` aceita geometrias ao inves de meshes. | ✅ Nenhum |
| 40 | **r170** | Dec 2024 | **`Material.type` agora static, nao modificavel.** Mipmaps sempre gerados quando `generateMipmaps: true`. Removido `CinematicCamera`. Removido `WebGLRenderer.copyTextureToTexture3D()`. Modulos MMD deprecated. | ⚠️ Baixo |
| 41 | **r171** | Jan 2025 | Novos import paths: `three/webgpu`, `three/tsl`. TSL blend functions renomeadas (`burn` → `blendBurn`, etc.). | ✅ Nenhum |
| 42 | **r172** | Jan 2025 | `TextureNode.uv()` → `sample()` (TSL). `PostProcessingUtils` → `RendererUtils`. `rangeFog()`/`densityFog()` deprecated. | ✅ Nenhum |
| 43 | **r173** | Feb 2025 | **`MeshGouraudMaterial` DEPRECATED** (use `MeshLambertMaterial` — projeto ja usa Lambert). Removido `InstancedPointsNodeMaterial`. TSL varying/vertexStage renomeados. | ✅ Nenhum |
| 44 | **r174** | Feb 2025 | `Timer` nao usa mais Page Visibility API automaticamente. | ✅ Nenhum |
| 45 | **r175** | Feb 2025 | `AnimationClip.parseAnimation()` deprecated. `Controls.connect()` requer DOM element. `SMAAPass`/`HalftonePass` constructors simplificados. | ✅ Nenhum |
| 46 | **r176** | Mar 2025 | `CapsuleGeometry` `length` → `height`. Removido `LottieLoader`. WebP/AVIF detection removido de `GLTFLoader`. | ✅ Nenhum |
| 47 | **r177** | Mar 2025 | **`ColorManagement.fromWorkingColorSpace()` → `workingToColorSpace()`**. **`ColorManagement.toWorkingColorSpace()` → `colorSpaceToWorking()`** (se usado indiretamente). JSON format 4.6 → 4.7. Removido `PeppersGhostEffect`. | ⚠️ Baixo |
| 48 | **r178** | Mar 2025 | `MultiplyBlending`/`SubtractiveBlending` requerem `premultipliedAlpha: true`. | ✅ Nenhum |
| 49 | **r179** | Mar 2025 | `Timer` movido para core. `GaussianBlurNode` blur melhorado. `USDZLoader` deprecated. TSL renames (`label` → `setName`, `reverseDepthBuffer` → `reversedDepthBuffer`). | ✅ Nenhum |
| 50 | **r180** | Mar 2025 | **`RGBELoader` renomeado para `HDRLoader`** (nao usado). `DepthOfFieldNode` nova API. Removido `RGBMLoader`. | ✅ Nenhum |
| 51 | **r181** | Mar 2025 | PBR materiais conservam energia melhor (rough materials ficam mais brilhantes). Metodos async do `WebGPURenderer` deprecated. | 💚 Minimo |
| 52 | **r182** | Mar 2025 | **`PCFSoftShadowMap` DEPRECATED com `WebGLRenderer`** — usar `PCFShadowMap`. Renomeado `colorBufferType` → `outputBufferType`. `VOXLoader.load()` retorna cena com meshes. | 🟠 Medio |
| 53 | **r183** | Mar 2025 | **`Clock` DEPRECATED** → `Timer`. `PostProcessing` → `RenderPipeline`. **`Sky`/`SkyMesh`: correcao gamma legada removida** — visual do Sky pode mudar. Removido `MeshPostProcessingMaterial`. | 🔴 Alto |

---

## Resumo de Risco por Nivel

| Nivel | Qtd | Versoes |
|---|---|---|
| 🔴 Alto | **6** | r147, r150, r152, r162, r165, r183 |
| 🟠 Medio | **5** | r137, r144, r145, r155, r182 |
| ⚠️ Baixo | **10** | r132, r133, r134, r138, r149, r151, r153, r163, r170, r177 |
| 💚 Minimo | **6** | r135, r136, r140, r148, r160, r181 |
| ✅ Nenhum | **26** | r131, r139, r141, r142, r143, r146, r154, r156-r159, r161, r164, r166-r169, r171-r176, r178-r180 |

---

## Breaking Changes Obrigatorias para o floor3d-card

Estas sao as alteracoes que **devem** ser feitas no codigo para migrar de r130 para r183:

### 1. `BoxBufferGeometry` → `BoxGeometry` (r145 deprecated, removido depois)

```typescript
// ANTES (src/floor3d-card.ts:2556)
const newRoomGeometry: THREE.BoxBufferGeometry = new THREE.BoxBufferGeometry(...)

// DEPOIS
const newRoomGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(...)
```

### 2. `outputEncoding` → `outputColorSpace` (r152)

```typescript
// ANTES (src/floor3d-card.ts:1316)
this._renderer.outputEncoding = THREE.sRGBEncoding;

// DEPOIS
this._renderer.outputColorSpace = THREE.SRGBColorSpace;
```

### 3. `sRGBEncoding` → `SRGBColorSpace` (r152)

```typescript
// ANTES
THREE.sRGBEncoding

// DEPOIS
THREE.SRGBColorSpace
```

### 4. `physicallyCorrectLights` → `useLegacyLights` → removido (r150/r155/r165)

```typescript
// ANTES (src/floor3d-card.ts:1314, 1322)
//this._renderer.physicallyCorrectLights = true;  // comentado
this._renderer.physicallyCorrectLights = false;

// CAMINHO DE MIGRACAO:
//   r150: physicallyCorrectLights=true → useLegacyLights=false (logica invertida)
//   r155: useLegacyLights default mudou para false (deprecated)
//   r165: useLegacyLights REMOVIDO — luzes fisicamente corretas sao o unico modo
//
// DEPOIS (r183 — propriedade nao existe mais)
// Simplesmente remover ambas as linhas (1314 e 1322).
// O comportamento fisicamente correto e agora o unico disponivel.
// IMPORTANTE: luzes podem parecer mais fracas — ajustar intensidade se necessario.
```

### 5. `PCFSoftShadowMap` → `PCFShadowMap` (r182 deprecated)

```typescript
// ANTES (src/floor3d-card.ts:1430)
this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// DEPOIS
this._renderer.shadowMap.type = THREE.PCFShadowMap;
```

### 6. `Clock` → `Timer` (r183 deprecated)

```typescript
// ANTES
const clock = new THREE.Clock();
const delta = clock.getDelta();

// DEPOIS
import { Timer } from 'three/addons/misc/Timer.js';
const timer = new Timer();
timer.update();
const delta = timer.getDelta();
```

### 7. `PointLight`/`SpotLight` decay default `2` (r147)

```typescript
// A partir de r147, decay padrao e 2 (antes era 1)
// Verificar todas as luzes pontuais/spot e ajustar intensidade se necessario
light.decay = 2;  // agora default — luzes podem parecer mais fracas
// Pode ser necessario aumentar light.intensity para compensar
```

### 8. Fator PI removido dos shaders (r132)

A partir de r132, o Three.js removeu o fator PI "artist-friendly" dos calculos de
iluminacao. Cenas podem parecer **mais escuras**. Pode ser necessario aumentar a
intensidade das luzes (DirectionalLight, HemisphereLight, AmbientLight) para compensar.

### 9. `MeshStandardMaterial.roughness` default `0.5` → `1` (r150)

Materiais `MeshStandardMaterial` sem `roughness` explicito ficam mais foscos (opacos).
Se o modelo 3D depende do default, definir `roughness = 0.5` explicitamente.

### 10. `MeshLambertMaterial` — per-fragment shading (r144)

Nao requer mudanca de codigo, mas o visual dos materiais Lambert muda.
Antes: Gouraud shading (per-vertex). Depois: Phong-like (per-fragment).
Testar visualmente.

### 11. `Sky` — correcao gamma removida (r183)

O `Sky` shader nao aplica mais correcao gamma legada. A aparencia do
ceu pode mudar. Testar visualmente e ajustar `turbidity`, `rayleigh`,
`mieCoefficient` se necessario.

---

## Dependencias Externas que Precisam Upgrade

| Pacote | Atual | Necessario | Motivo |
|---|---|---|---|
| `three` | `^0.130.1` | `^0.183.0` | Alvo deste upgrade |
| `@types/three` | `^0.130.0` | `^0.183.0` | Tipos TypeScript |
| `three-spritetext` | `^1.6.4` | `^1.9.0+` | Compatibilidade com Three r183 |

### Nota sobre `three-spritetext`

O pacote `three-spritetext` declara `three` como peerDependency. A versao `1.6.4`
suporta Three.js ate ~r140. Versoes mais recentes (`1.9.x`) suportam r183.
Verificar compatibilidade antes do upgrade.

---

## Estrategia de Migracao Recomendada

### Opcao A: Upgrade Direto (r130 → r183) ⚡

**Pros:** Uma unica iteracao de testes.
**Contras:** Se algo quebrar, dificil isolar a causa.

### Opcao B: Upgrade em Etapas (Recomendada) 🎯

| Etapa | Range | Foco |
|---|---|---|
| 3a | r130 → r145 | `BoxBufferGeometry` → `BoxGeometry`, alpha context, Lambert shading |
| 3b | r145 → r152 | `outputEncoding` → `outputColorSpace`, `sRGBEncoding` → `SRGBColorSpace`, `physicallyCorrectLights` → `useLegacyLights` |
| 3c | r152 → r163 | WebGL 1 removido, color management estavel |
| 3d | r163 → r183 | `Clock` → `Timer`, `PCFSoftShadowMap` deprecated, Sky gamma fix |

### Checklist de Migracao

- [ ] Atualizar `package.json`: `"three": "^0.183.0"`, `"@types/three": "^0.183.0"`
- [ ] Atualizar `three-spritetext` para versao compativel
- [ ] Substituir `BoxBufferGeometry` → `BoxGeometry`
- [ ] Substituir `outputEncoding` → `outputColorSpace`
- [ ] Substituir `THREE.sRGBEncoding` → `THREE.SRGBColorSpace`
- [ ] Remover `physicallyCorrectLights` (nao existe mais em r183)
- [ ] Substituir `PCFSoftShadowMap` → `PCFShadowMap`
- [ ] Substituir `Clock` → `Timer`
- [ ] Verificar `PointLight`/`SpotLight` — ajustar intensidade para `decay=2`
- [ ] Testar visual do `Sky` shader
- [ ] Testar visual do `MeshLambertMaterial` (per-fragment shading)
- [ ] Testar carregamento de modelos OBJ/MTL
- [ ] Testar carregamento de modelos GLTF/GLB
- [ ] Testar `OrbitControls` (zoom durante rotacao desabilitado desde r134)
- [ ] Testar `Raycaster.intersectObjects()` (recursive=true default desde r133)
- [ ] `npm run lint` — sem erros
- [ ] `npm run rollup` — bundle gerado sem erros
- [ ] Testar no Home Assistant 2025.11+

---

## Riscos Adicionais

### `three-spritetext` Compatibilidade

O pacote `three-spritetext` usa internamente `Sprite`, `SpriteMaterial`, e
`CanvasTexture` do Three.js. Se a versao `1.6.4` nao for compativel com r183,
sera necessario atualizar ou forkar o pacote.

### Tamanho do Bundle

O Three.js r183 e significativamente maior que r130. O bundle final pode
aumentar. Considerar tree-shaking mais agressivo no Rollup config.

### Performance

Algumas mudancas internas (per-fragment Lambert, novo color management)
podem afetar performance em dispositivos moveis.

---

## Fontes

- [Three.js Migration Guide](https://github.com/mrdoob/three.js/wiki/Migration-Guide)
- [Three.js Releases](https://github.com/mrdoob/three.js/releases)
- [Three.js r183 Release](https://github.com/mrdoob/three.js/releases/tag/r183)
- [Updates to Color Management in three.js r152](https://discourse.threejs.org/t/updates-to-color-management-in-three-js-r152/50791)

---

*Documento gerado: 2026-03-17 | New Floor3d Card — Fase 3 Planning*

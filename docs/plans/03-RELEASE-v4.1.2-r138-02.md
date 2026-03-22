# Plano de Entrega: v4.1.2-r138-02

**Data:** 2026-03-22
**Branch de trabalho:** `claude/make-repo-private-nhhsI`
**Base:** Código atual (v4.1.2-r138-01) + auditoria completa dos Migration Guides Three.js r130→r136

---

## 1. Objetivo

Aplicar todos os fixes identificados nos Migration Guides Three.js r130→r131, r131→r132, r132→r133, r133→r134, r134→r135 e r135→r136 ao código atual que está em Three.js r138.

---

## 2. Auditoria Completa: Migration Guide r130 → r136

### r130 → r131

| Breaking Change | Impacto no código | Status |
|-----------------|-------------------|--------|
| `SkinnedMesh.boneTransform()` → `applyBoneTransform()` | Não usado | ✅ N/A |
| `InstancedMesh.frustumCulled` default → `true` (requer `computeBoundingSphere()`) | Não usado | ✅ N/A |
| `MapControls` movido para módulo separado | Não usado | ✅ N/A |
| `Triangle.getUV()` → `Triangle.getInterpolation()` | Não usado | ✅ N/A |
| `BufferGeometryUtils.mergeBufferAttributes()` → `mergeAttributes()` | Não usado | ✅ N/A |
| `BufferGeometryUtils.mergeBufferGeometries()` → `mergeGeometries()` | Não usado | ✅ N/A |
| `ShaderMaterial.forceSinglePass` default → `true` | Não usado | ✅ N/A |
| `aoMap`/`lightMap` não usam mais `uv2` → `material.lightMap.channel` | Não usado diretamente (GLTFLoader trata) | ✅ N/A |

### r131 → r132

| Breaking Change | Impacto no código | Status |
|-----------------|-------------------|--------|
| `MeshPhysicalMaterial.sheen` → `sheenTint` | Não usado | ✅ N/A |
| `BufferGeometry.computeFaceNormals()` removido | Não usado | ✅ N/A |
| `BufferGeometryUtils` agora `import * as` | Não usado | ✅ N/A |
| `KTX2Loader` requer transcoder atualizado | Não usado | ✅ N/A |
| Shaders MeshStandardMaterial mais fisicamente corretos (rough menos brilhante) | Já em efeito no r138 | ✅ N/A |

### r132 → r133

| Breaking Change | Impacto no código | Status |
|-----------------|-------------------|--------|
| `Raycaster.intersectObjects()` recursive default → `true` | **Código usa `false` explícito** — sem mudança comportamental | ✅ OK |
| `SphereGeometry` widthSegments default → 32, heightSegments → 16 | Não criamos SphereGeometry | ✅ N/A |
| `RGBELoader/HDRCubeTextureLoader/EXRLoader` default type → `HalfFloatType` | Não usados | ✅ N/A |
| `ExtrudeGeometry` parameter defaults alterados | Não usado | ✅ N/A |
| `ParametricGeometry/TextGeometry/FontLoader` movidos para examples/jsm | Não usados | ✅ N/A |
| `envMap` para MeshStandard/Physical internamente convertido para PMREM | Gerenciado internamente pelo Three.js | ✅ N/A |

### r133 → r134

| Breaking Change | Impacto no código | Status |
|-----------------|-------------------|--------|
| `DeviceOrientationControls` removido | Não usado | ✅ N/A |
| `ImmediateRenderObject` removido | Não usado | ✅ N/A |
| `OrbitControls` sem zoom via wheel durante rotação | `OrbitControls` usados, mas zoom separado | ✅ OK |
| `FileLoader` usa `fetch` em vez de `XMLHttpRequest` | Interno do Three.js | ✅ N/A |

### r134 → r135

| Breaking Change | Impacto no código | Status |
|-----------------|-------------------|--------|
| `dat.gui` → `lil-gui` | Não usado (sem GUI de debug) | ✅ N/A |
| Texture dimensions/format/type imutáveis após uso inicial | Não alteramos após uso | ✅ OK |
| `GLTFExporter.parse()` assinatura alterada | Não usado (só carregamos, não exportamos) | ✅ N/A |
| `LogLuvEncoding` removido | Não usado | ✅ N/A |

### r135 → r136

| Breaking Change | Impacto no código | Status |
|-----------------|-------------------|--------|
| `RGBM7Encoding`, `RGBM16Encoding` removidos | Não usados | ✅ N/A |
| `RGBEEncoding`, `RGBEFormat` removidos | Não usados | ✅ N/A |
| `RGBDEncoding` removido | Não usado | ✅ N/A |
| `WebGLRenderer.gammaFactor` e `GammaEncoding` removidos | Não usados | ✅ N/A |
| `DataTexture*` requerem `needsUpdate = true` quando dados prontos | Não criamos DataTextures | ✅ N/A |
| `WebGLRenderer.copyFramebufferToTexture()` → `FramebufferTexture` | Não usado | ✅ N/A |
| `EXRLoader` sem suporte `UnsignedByteType` | Não usado | ✅ N/A |
| `ArcballControls.setTarget()` removido | Não usado | ✅ N/A |
| ETC1 agora só WebGL 1 | Não usado | ✅ N/A |
| HDR workflows com WebGL 1 requerem extensão half float | Não usado | ✅ N/A |

---

## 3. Fix Identificado

### F6 — CanvasTexture encoding = sRGBEncoding

**Causa:** A remoção do inline sRGB decode no r137 afeta TODOS os tipos de textura, incluindo
`CanvasTexture`. O canvas 2D sempre produz dados em espaço sRGB. Sem `encoding = sRGBEncoding`,
o renderer trata os dados como lineares, resultando em overlays de texto/imagem mais claros
e saturação incorreta nos objetos que usam `display_picture` ou `display_room_label`.

**Arquivo:** `src/floor3d-card.ts`

**Localização 1:** `_applyTextCanvas()` — linha ~2752
```typescript
// ANTES:
const texture = new THREE.CanvasTexture(canvas);

// DEPOIS:
const texture = new THREE.CanvasTexture(canvas);
// FIX r138-02: CanvasTexture contém dados sRGB (canvas2D é sempre sRGB).
// Sem este encoding, os valores são tratados como linear após a remoção
// do inline sRGB decode no r137, causando overlays mais claros que o esperado.
texture.encoding = THREE.sRGBEncoding;
```

**Localização 2:** `_applyTextCanvasSprite()` — linha ~2775
```typescript
// ANTES:
const texture = new THREE.CanvasTexture(canvas);

// DEPOIS:
const texture = new THREE.CanvasTexture(canvas);
// FIX r138-02: mesma correção de encoding para Sprite overlays.
texture.encoding = THREE.sRGBEncoding;
```

**Impacto visual:** Overlays de texto/imagem em objetos 3D (`display_picture`, `display_room_label`)
renderizam com cores corretas em vez de lavadas/superexpostas.

---

## 4. Resultado da Auditoria

**APIs removidas/renomeadas de r130→r136 usadas no código:** NENHUMA

O código está limpo em relação a todos os breaking changes dos Migration Guides r130→r136.
O único ajuste necessário é o encoding da CanvasTexture, que é consequência da mudança
do r137 (remoção inline sRGB decode) que afeta todos os tipos de textura.

---

## 5. Procedimento de Entrega

```bash
# 1. Aplicar F6 nos dois locais em src/floor3d-card.ts
# 2. npm run build (lint + rollup)
# 3. Bump version: 4.1.2-r138-01 → 4.1.2-r138-02
# 4. Commit com mensagem descritiva
# 5. git push origin claude/make-repo-private-nhhsI
# 6. gh pr create + gh pr merge para master
# 7. gh api para criar tag v4.1.2-r138-02
# 8. gh release create v4.1.2-r138-02
```

---

## 6. Referências

- Migration Guide r130→r131: https://github.com/mrdoob/three.js/wiki/Migration-Guide#130--131
- Migration Guide r131→r132: https://github.com/mrdoob/three.js/wiki/Migration-Guide#131--132
- Migration Guide r132→r133: https://github.com/mrdoob/three.js/wiki/Migration-Guide#132--133
- Migration Guide r133→r134: https://github.com/mrdoob/three.js/wiki/Migration-Guide#133--134
- Migration Guide r134→r135: https://github.com/mrdoob/three.js/wiki/Migration-Guide#134--135
- Migration Guide r135→r136: https://github.com/mrdoob/three.js/wiki/Migration-Guide#135--136
- Three.js r137 (remoção inline sRGB decode): https://github.com/mrdoob/three.js/releases/tag/r137

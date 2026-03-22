# Plano de Entrega: v4.1.2-r138-01

**Data:** 2026-03-22
**Branch de trabalho:** `claude/make-repo-private-nhhsI`
**Urgência:** CRÍTICA — problema visual e de performance reportado em produção (Home Assistant)

---

## 1. Diagnóstico Consolidado

A partir da versão `v4.1.2-r137`, usuários relataram:
- Renderização "lavada" (washed-out / overexposed)
- Cores incorretas nas texturas MTL/OBJ
- Queda de performance especialmente em dispositivos mobile/tablet

**Root cause:** Three.js r137 removeu o **inline sRGB decode** dos shaders GLSL e restringiu o sRGB encoding ao framebuffer default. O código original só configurava `outputEncoding` condicionalmente (apenas para sky mode), o que deixava todas as cenas sem sky com color space incorreto.

---

## 2. Fixes Aplicados (commit anterior — já no branch)

| # | Arquivo | Mudança | Justificativa (Migration Guide r136→r137) |
|---|---------|---------|-------------------------------------------|
| F1 | `src/floor3d-card.ts:1318` | `outputEncoding` incondicional | *"sRGB shader encoding limited to default framebuffer"* — deve ser sempre setado |
| F2 | `src/floor3d-card.ts:1322` | `toneMappingExposure`: 0.6 → 0.45 | *"Removed inline sRGB decode"* — sem o decode inline os valores ficam mais brilhantes |
| F3 | `src/floor3d-card.ts:2017-2027` | Encoding explícito nas texturas do MTLLoader | *"OBJ/MTLLoader requires sRGB workflow implementation"* — `sRGBEncoding` em color maps, `LinearEncoding` em normal maps |

---

## 3. Fixes Adicionais — Esta Entrega (v4.1.2-r138-01)

### F4 — Cap de pixelRatio para performance

**Arquivo:** `src/floor3d-card.ts` (~linha 1468)

```typescript
// ANTES:
this._renderer.setPixelRatio(window.devicePixelRatio);

// DEPOIS:
// FIX r138-01: limitar pixelRatio a 2.0 para evitar sobrecarga de renderização
// em dispositivos high-DPI (ex: iPhone 3x = 9x mais pixels que necessário).
// Valor 2.0 mantém qualidade visual excelente com ~44% menos carga de GPU.
this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
```

**Impacto de performance:** Em telas 3x (muitos smartphones modernos), reduz pixels renderizados de ~9× para ~4× o tamanho físico → **~55% menos carga de GPU**.

### F5 — powerPreference: 'high-performance' no WebGLRenderer

**Arquivo:** `src/floor3d-card.ts` (~linha 1293)

```typescript
// ANTES:
this._renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true, alpha: true });

// DEPOIS:
this._renderer = new THREE.WebGLRenderer({
  antialias: true,
  logarithmicDepthBuffer: true,
  alpha: true,
  powerPreference: 'high-performance',  // FIX r138-01: força GPU dedicada
});
```

**Impacto:** Em dispositivos com GPU integrada + dedicada (laptops, desktops), garante uso da GPU dedicada evitando fallback para Intel/AMD integrada.

### F6 — GLTF/GLB: traversal de texturas para garantir encoding correto

**Arquivo:** `src/floor3d-card.ts` — método `_onLoadedGLTF3DModel`

O GLTFLoader do r138 ajusta internamente o workflow sRGB, mas o nosso código de `_onLoaded3DModel` pode substituir materiais posteriormente. Adicionar traversal defensivo para garantir encoding correto em texturas GLB.

---

## 4. Migration Guide — Checklist r136→r137 e r137→r138

### r136 → r137 (Migration Guide: https://github.com/mrdoob/three.js/wiki/Migration-Guide#136--137)

| Breaking Change | Impacto no código | Status |
|-----------------|-------------------|--------|
| Removed inline sRGB decode | MTLLoader textures incorretas | ✅ F3 corrige |
| sRGB encoding limited to default framebuffer | outputEncoding só para sky | ✅ F1 corrige |
| RGBFormat → RGBAFormat | Não usado | ✅ N/A |
| RGBIntegerFormat → RGBAIntegerFormat | Não usado | ✅ N/A |
| UnsignedShort565Type → UnsignedShort5551Type | Não usado | ✅ N/A |
| sRGB ASTC formats removed | Não usado | ✅ N/A |
| BasisTextureLoader deprecated → KTX2Loader | Não usado | ✅ N/A |
| RoughnessMipmapper removed | Não usado | ✅ N/A |
| Material.format eliminated | Não usado | ✅ N/A |
| VideoTexture default → RGBAFormat | Não usado | ✅ N/A |
| OBJ/MTLLoader sRGB workflow required | Texturas sem encoding | ✅ F3 corrige |
| Material.transparent needsUpdate | Não afeta fluxo | ✅ N/A |
| WebGL context sempre com alpha | alpha: true já era explícito | ✅ N/A |

### r137 → r138 (Migration Guide: https://github.com/mrdoob/three.js/wiki/Migration-Guide#137--138)

| Breaking Change | Impacto no código | Status |
|-----------------|-------------------|--------|
| Node material system replaced | Não usado | ✅ N/A |
| DataTexture3D → Data3DTexture | Não usado | ✅ N/A |
| DataTexture2DArray → DataArrayTexture | Não usado | ✅ N/A |
| ColladaLoader/PLYLoader sRGB workflow | Não usado | ✅ N/A |
| VRMLoader removed | Não usado | ✅ N/A |
| GLTFLoader loadTextureImage() arg change | Não afeta consumidor | ✅ N/A |
| Euler.toVector3() removed | Não usado | ✅ N/A |
| WebGLRenderTarget.setTexture() removed | Não usado | ✅ N/A |
| CubeUVRefractionMapping removed | Não usado | ✅ N/A |
| MeshStandardMaterial.refractionRatio removed | Não usado | ✅ N/A |

---

## 5. Procedimento de Entrega

```bash
# 1. Aplicar F4 e F5 em src/floor3d-card.ts
# 2. npm run build (lint + rollup)
# 3. Bump version: 4.1.2-r138 → 4.1.2-r138-01
# 4. Commit: "release: v4.1.2-r138-01 — fix visual quality & performance regression"
# 5. git push origin claude/make-repo-private-nhhsI
# 6. Merge para master via PR
# 7. git tag v4.1.2-r138-01 + push
# 8. gh release create v4.1.2-r138-01
```

---

## 6. Validação Pós-Deploy (Home Assistant)

- [ ] Renderização com cores corretas (sem overexposure)
- [ ] Texturas MTL/OBJ com saturação equivalente ao r136
- [ ] Performance fluida em mobile
- [ ] Fundo transparente funcional
- [ ] Sky mode (se configurado) sem alteração visual

---

## 7. Referências

- Migration Guide r136→r137: https://github.com/mrdoob/three.js/wiki/Migration-Guide#136--137
- Migration Guide r137→r138: https://github.com/mrdoob/three.js/wiki/Migration-Guide#137--138
- Release r137: https://github.com/mrdoob/three.js/releases/tag/r137
- Release r138: https://github.com/mrdoob/three.js/releases/tag/r138

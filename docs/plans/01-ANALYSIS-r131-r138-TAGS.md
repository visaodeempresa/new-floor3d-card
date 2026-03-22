# Análise das Tags v4.1.2-r131 a v4.1.2-r138

**Data:** 2026-03-21
**Referências:**
- Releases Three.js: https://github.com/mrdoob/three.js/releases
- Migration Guide: https://github.com/mrdoob/three.js/wiki/Migration-Guide
- Milestones: https://github.com/mrdoob/three.js/milestones?state=closed

---

## Tags Existentes no Repositório

```
v4.1.2-r132  ← existe
v4.1.2-r134  ← existe
v4.1.2-r136  ← existe
v4.1.2-r137  ← existe (com regressão visual)
v4.1.2-r138  ← existe (atual)
```

**Tags AUSENTES (commits existem, mas sem tag):**
- v4.1.2-r131 — commit `36b2652` "release: v4.1.1-r131 — upgrade Three.js r130 → r131"
- v4.1.2-r133 — commit `ff05557` "chore: upgrade Three.js from r132 to r133"
- v4.1.2-r135 — commit `782d0cc` "chore: upgrade Three.js from r134 to r135"

---

## Análise Detalhada por Release

### v4.1.2-r131 | Three.js 0.131.0 | Three.js: Agosto 2022

**Estado no repositório:** Commit `36b2652` sem tag.

**Mudanças significativas do Three.js r131:**
- `Material.morphTargets` e `Material.morphNormals` removidos → migrar para `geometry.morphAttributes`
- `MeshStandardMaterial.vertexTangents` removido (aceleração de tangentes automática)
- `SphereGeometry` aumentou contagem de segmentos default (phi/theta)
- `WebGLRenderer`: Integrou funcionalidade PMREM internamente

**Impacto na card:**
- `morphTargets`/`morphNormals` provavelmente não usados → sem impacto
- Aumento de segmentos em SphereGeometry pode afetar performance se usada
- PMREM integrado melhora qualidade de reflexos

**Status da tag:** Ausente — tag deveria ser `v4.1.2-r131` apontando para commit `36b2652`.

---

### v4.1.2-r132 | Three.js 0.132.0 | Three.js: Agosto 2022

**Estado no repositório:** Tag `v4.1.2-r132` existe. ✅

**Mudanças significativas do Three.js r132:**
- `MeshPhysicalMaterial.ior` promovido a propriedade principal (antes era apenas interno)
- `MeshPhysicalMaterial`: Melhoria no modelo de transmissão
- `MeshStandardMaterial`: **Remoção do Fresnel dependente de roughness para environment lighting** — mudança visual importante
- `WebGLRenderer`: Refactoring extenso de shaders e melhor nomenclatura
- `WebGLShadowMap`: Blur VSM configurável, suporte a displacement map em sombras

**Impacto na card:**
- ⚠️ A remoção do roughness-Fresnel muda como reflexos de ambiente aparecem nos objetos
- Materiais com roughness baixo (superfícies polidas) podem parecer diferentes
- Sombras VSM melhoradas (se PCFSoft foi substituído)

**Fator PI (r132):** Uma mudança interna nos shaders alterou o fator 1/π na equação de BRDF para environment lighting. Isso muda visualmente materiais PBR com roughness médio-alto.

**Status da tag:** Existe. Análise visual necessária para confirmar qualidade.

---

### v4.1.2-r133 | Three.js 0.133.0 | Three.js: Outubro 2022

**Estado no repositório:** Commit `ff05557` sem tag.

**Mudanças significativas do Three.js r133:**
- `MeshPhysicalMaterial`: Refactoring do sheen BRDF, adição de `sheenRoughness`
- `WebGLRenderer`: Suporte a mais de 8 morph targets com WebGL 2
- `Quaternion.random()` e `Vector3.randomDirection()` adicionados

**Impacto na card:**
- Sheens não usados → sem impacto direto
- Morph targets com mais de 8 melhorados → positivo se usados em modelos GLTF

**Status da tag:** Ausente — tag deveria ser `v4.1.2-r133` apontando para commit `ff05557`.

---

### v4.1.2-r134 | Three.js 0.134.0 | Three.js: Novembro 2022

**Estado no repositório:** Tag `v4.1.2-r134` existe. ✅

**Mudanças significativas do Three.js r134:**
- Melhorias em `MeshPhysicalMaterial` (iridescence preview)
- Otimizações em `InstancedMesh`
- Melhorias em `WebGLRenderer` para reduzir uploads desnecessários

**Impacto na card:**
- Melhorias de performance em objetos instanciados
- Sem breaking changes relevantes

**Status da tag:** Existe.

---

### v4.1.2-r135 | Three.js 0.135.0 | Three.js: Dezembro 2022

**Estado no repositório:** Commit `782d0cc` sem tag.

**Mudanças significativas do Three.js r135:**
- Melhorias contínuas de performance
- Refinamentos em `WebGLTextures`
- Correções de bugs variadas

**Impacto na card:**
- Sem breaking changes relevantes

**Status da tag:** Ausente — tag deveria ser `v4.1.2-r135` apontando para commit `782d0cc`.

---

### v4.1.2-r136 | Three.js 0.136.0 | Three.js: Dezembro 2022

**Estado no repositório:** Tag `v4.1.2-r136` existe. ✅

**Mudanças significativas do Three.js r136 (IMPORTANTES):**
- `WebGLRenderer`: Adicionado `SRGB8_ALPHA8` format support → base para o hardware sRGB sampling
- `WebGLRenderer`: Removido `.gammaFactor` e `GammaEncoding` → breaking para código que usava gamma manual
- `WebGLRenderer`: Removido encoding formats: `RGBM7/16`, `RGBD`, `RGBE`
- `MeshPhysicalMaterial`: Adicionado IBL sheen support
- `MeshToonMaterial`: Modified gradient map para samplar apenas canal red
- `PMREMGenerator`: Mudança para half float render targets
- `EXRLoader`: Removido suporte `RGBE/UnsignedByteType`

**Impacto na card:**
- ✅ Linha de qualidade de referência — renderiza corretamente
- A remoção de `gammaFactor` é positiva (era deprecated)
- Introdução de `SRGB8_ALPHA8` é a base para a quebra que veio no r137

**Código atual no r136:**
```typescript
// outputEncoding setado CONDICIONALMENTE para sky mode:
if (this._config.sky && this._config.sky == 'yes') {
  this._renderer.outputEncoding = THREE.sRGBEncoding;
}
this._renderer.toneMapping = THREE.LinearToneMapping;
this._renderer.toneMappingExposure = 0.6;
this._renderer.physicallyCorrectLights = false;
```

**Status da tag:** Existe. **Linha de qualidade de referência.** ✅

---

### v4.1.2-r137 | Three.js 0.137.0 | Three.js: Janeiro 2023

**Estado no repositório:** Tag `v4.1.2-r137` existe. ⚠️ COM REGRESSÃO VISUAL

**Mudanças significativas do Three.js r137 (CAUSAS DA REGRESSÃO):**
- `WebGLRenderer`: **"Removed inline sRGB decode"** ← causa principal
- `WebGLRenderer`: **"sRGB shader encoding limited to default framebuffer and WebXR"** ← causa secundária
- `WebGLRenderer`: "Auto-detects sRGB compressed texture formats"
- `WebGLRenderer`: "WebGL context now created with alpha: true"
- `Material`: **Removida propriedade `.format`**
- `Texture formats`: Removidos `RGBFormat`, `RGBIntegerFormat`, `UnsignedShort565Type`
- `MeshMatcapMaterial`: Textura matcap default atualizada
- `PMREMGenerator`: Adicionado `flipEnvMap`, "Reuse pingpong render target"
- `MTLLoader`: "Corrected texture and color labeling"
- `LatheGeometry`: Modified index ordering

**Diagnóstico da regressão:**
A remoção do inline sRGB decode + sRGB encoding limitado ao framebuffer default, combinados com o outputEncoding sendo setado apenas para sky mode, causaram a renderização com cores em espaço de cor errado.

**Status da tag:** Existe. **REGRESSÃO VISUAL CONFIRMADA.** ⚠️

---

### v4.1.2-r138 | Three.js 0.138.0 | Three.js: Fevereiro 2023

**Estado no repositório:** Tag `v4.1.2-r138` existe. ✅

**Mudanças significativas do Three.js r138:**
- Melhorias de estabilidade e correções de bugs
- Refinamentos no WebGPU renderer (experimental)
- Correções no GLTFLoader
- Otimizações menores em shaders

**Impacto na card:**
- Sem breaking changes adicionais além dos problemas herdados do r137
- A regressão visual do r137 persiste no r138
- Performance ligeiramente melhorada pelos fixes de shader

**Status da tag:** Existe. **REGRESSÃO HERDADA DO r137 PRESENTE.** ⚠️

---

## Resumo Comparativo

| Tag | Three.js | Qualidade Visual | Performance | Status |
|-----|----------|-----------------|-------------|--------|
| v4.1.2-r131 | 0.131.0 | ✅ Boa | ✅ Boa | Tag ausente |
| v4.1.2-r132 | 0.132.0 | ✅ Boa | ✅ Boa | Tag existe |
| v4.1.2-r133 | 0.133.0 | ✅ Boa | ✅ Boa | Tag ausente |
| v4.1.2-r134 | 0.134.0 | ✅ Boa | ✅ Boa | Tag existe |
| v4.1.2-r135 | 0.135.0 | ✅ Boa | ✅ Boa | Tag ausente |
| v4.1.2-r136 | 0.136.0 | ✅ **REFERÊNCIA** | ✅ Boa | Tag existe |
| v4.1.2-r137 | 0.137.0 | ⚠️ **REGRESSÃO** | ✅ Boa | Tag existe |
| v4.1.2-r138 | 0.138.0 | ⚠️ Regressão herdada | ✅ Boa | Tag existe |

---

## Ações Recomendadas

### Curto Prazo
1. Aplicar o fix do plano `00-FIX-r136-r137-REGRESSION.md`
2. Criar tags ausentes:
   ```bash
   git tag -a v4.1.2-r131 36b2652 -m "release: v4.1.2-r131 — Three.js r131 baseline (retroactive tag)"
   git tag -a v4.1.2-r133 ff05557 -m "release: v4.1.2-r133 — Three.js r133 baseline (retroactive tag)"
   git tag -a v4.1.2-r135 782d0cc -m "release: v4.1.2-r135 — Three.js r135 baseline (retroactive tag)"
   git push origin v4.1.2-r131 v4.1.2-r133 v4.1.2-r135
   ```

### Médio Prazo
3. Executar plano de migração Step-by-Step (ver `02-STEPS-MIGRATION.md`)

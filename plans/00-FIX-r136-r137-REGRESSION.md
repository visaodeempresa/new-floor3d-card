# Plano de Correção: Regressão Visual v4.1.2-r136 → v4.1.2-r137

**Data de análise:** 2026-03-21
**Branch de trabalho:** `claude/make-repo-private-nhhsI`
**Repositórios de referência:**
- Official: https://github.com/mrdoob/three.js
- Fork: https://github.com/visaodeempresa/three.js
- Releases: https://github.com/mrdoob/three.js/releases/tag/r137
- Migration Guide: https://github.com/mrdoob/three.js/wiki/Migration-Guide#136--137

---

## 1. Diagnóstico Visual

Comparando as imagens capturadas:

| Versão | Iluminação | Qualidade | Sombras | Saturação |
|--------|-----------|-----------|---------|-----------|
| v4.1.2-r136 | Quente, natural | Alta | Visíveis, corretas | Natural |
| v4.1.2-r137 | Fria, lavada (washed out) | Degradada | Difusas, excessivas | Sobreexposição |

**Sintoma:** r137 apresenta iluminação mais brilhante, saturação incorreta e perda de contraste. Aparência "superexposta".

---

## 2. Root Cause: Mudanças no Three.js r137

### 2.1 — Remoção do Inline sRGB Decode

**Mudança:** `WebGLRenderer`: *"Removed inline sRGB decode"*

- **Antes (r136):** O renderer decodificava texturas sRGB→linear INLINE dentro do shader de fragmento (multiplicação de cada amostra de textura).
- **Depois (r137):** O decode inline foi removido em favor do sampling por hardware via formato `SRGB8_ALPHA8` (que o r136 havia introduzido com `"Enabled SRGB8_ALPHA8 format support"`).
- **Efeito:** Se a textura não acionar o hardware sRGB decode (porque `texture.encoding` não está setado como `sRGBEncoding`), ela é tratada como LINEAR. Texturas em gamma que são lidas como linear aparecem **mais brilhantes** (os valores já-comprimidos em gamma são interpretados como se fossem lineares).

### 2.2 — sRGB Encoding Limitado ao Framebuffer Default

**Mudança:** `WebGLRenderer`: *"sRGB shader encoding limited to default framebuffer and WebXR"*

- O código atual só seta `renderer.outputEncoding = THREE.sRGBEncoding` quando `sky == 'yes'` (linha 1315-1316).
- Para cenas SEM sky, o `outputEncoding` fica com o valor default do r137 (que agora tem comportamento diferente).
- **Efeito:** Cenas sem sky ficam com conversão de espaço de cor incorreta.

### 2.3 — MTLLoader: "Corrected Texture and Color Labeling"

**Mudança:** MTLLoader teve correção nas labels de textura e cor.

- O MTLLoader pode agora criar materiais com propriedades de textura de forma diferente.
- Texturas de cor difusa (`.map`) que deveriam estar marcadas como sRGB podem não estar sendo marcadas corretamente.

### 2.4 — PMREMGenerator: flipEnvMap + ReusePingpong

**Mudança:** PMREMGenerator teve alterações internas.

- Afeta cenas com sky (`Sky` object usa PMREM internamente para env maps).
- A adição de `flipEnvMap` pode inverter iluminação de ambiente.

---

## 3. Análise do Código Atual (src/floor3d-card.ts)

```typescript
// Linha 1314 — physicallyCorrectLights comentada:
//this._renderer.physicallyCorrectLights = true;

// Linha 1315-1316 — outputEncoding CONDICIONAL (bug!):
if (this._config.sky && this._config.sky == 'yes') {
  this._renderer.outputEncoding = THREE.sRGBEncoding;  // ← só para sky!
}

// Linha 1318-1320 — Tone mapping:
this._renderer.toneMapping = THREE.LinearToneMapping;
this._renderer.toneMappingExposure = 0.6;

// Linha 1322:
this._renderer.physicallyCorrectLights = false;

// Linhas 1159, 1229, 1268, 1272:
this._sun = new THREE.DirectionalLight(0xffffff, 2.0);     // sun (sky mode)
this._torch = new THREE.DirectionalLight(0xffffff, 0.2);   // torch (seguidor de câmera)
new THREE.HemisphereLight(0xffffff, 0x000000, 0.2);       // ambient (sky mode)
new THREE.AmbientLight(0xffffff, 0.2);                    // ambient (normal mode)
```

**Problemas identificados:**
1. `outputEncoding` condicional — deveria ser sempre setado.
2. Texturas do MTLLoader não têm `encoding` explicitamente definido.
3. `toneMappingExposure = 0.6` pode estar sub-compensando para r137.

---

## 4. Plano de Correção Específico para r137

### Passo 1 — Corrigir `outputEncoding` incondicional

**Arquivo:** `src/floor3d-card.ts`
**Localização:** ~linha 1314 (método `display3dmodel`)

```typescript
// ANTES (r136 - código atual):
if (this._config.sky && this._config.sky == 'yes') {
  this._renderer.outputEncoding = THREE.sRGBEncoding;
}

// DEPOIS (r137 fix):
// Sempre setar outputEncoding independente de sky
this._renderer.outputEncoding = THREE.sRGBEncoding;
```

**Justificativa:** Em r137, o sRGB encoding do output é limitado ao framebuffer default. Deve ser setado explicitamente sempre, não apenas para sky.

---

### Passo 2 — Setar encoding explícito nas texturas do MTLLoader

**Arquivo:** `src/floor3d-card.ts`
**Localização:** Método `_onLoaded3DMaterials` (~linha 2014) e após `materials.preload()`

```typescript
private _onLoaded3DMaterials(materials: MTLLoader.MaterialCreator): void {
  console.log('Material loaded start');
  materials.preload();

  // FIX r137: Setar encoding explícito em todas as texturas
  // O inline sRGB decode foi removido no r137; agora é necessário
  // que o encoding seja declarado para ativar hardware sRGB sampling
  const materialsArray = materials.getAsArray();
  materialsArray.forEach((mat: THREE.Material) => {
    const meshMat = mat as THREE.MeshPhongMaterial;
    if (meshMat.map) {
      meshMat.map.encoding = THREE.sRGBEncoding;
    }
    if (meshMat.emissiveMap) {
      meshMat.emissiveMap.encoding = THREE.sRGBEncoding;
    }
    if (meshMat.specularMap) {
      meshMat.specularMap.encoding = THREE.sRGBEncoding;
    }
    if (meshMat.normalMap) {
      // Normal maps ficam em LinearEncoding (já são dados de normal, não cor)
      meshMat.normalMap.encoding = THREE.LinearEncoding;
    }
  });

  // ... resto do método original
```

---

### Passo 3 — Ajustar `toneMappingExposure` para compensar

**Arquivo:** `src/floor3d-card.ts`
**Localização:** ~linha 1320

```typescript
// ANTES:
this._renderer.toneMappingExposure = 0.6;

// DEPOIS (r137 fix):
this._renderer.toneMappingExposure = 0.45;
// Reduzido de 0.6 para 0.45 para compensar o brilho extra
// causado pela remoção do inline sRGB decode no r137.
// O hardware sRGB sampling agora produz valores ligeiramente
// diferentes do decode por shader.
```

**Nota:** Este valor (0.45) é um ponto de partida. Calibrar visualmente com a cena real.

---

### Passo 4 — (Opcional, para melhor qualidade) Substituir LinearToneMapping

```typescript
// ANTES:
this._renderer.toneMapping = THREE.LinearToneMapping;

// OPÇÃO A — manter Linear com exposure menor:
this._renderer.toneMapping = THREE.LinearToneMapping;
this._renderer.toneMappingExposure = 0.45;

// OPÇÃO B — ACESFilmic para melhor HDR e evitar washed-out:
this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
this._renderer.toneMappingExposure = 0.8;
// ACESFilmic comprime highlights naturalmente, evitando overexposure

// OPÇÃO C — ReinhardToneMapping (mais simples):
this._renderer.toneMapping = THREE.ReinhardToneMapping;
this._renderer.toneMappingExposure = 1.0;
```

**Recomendação:** Opção B (ACESFilmic) oferece melhor qualidade visual pós-r137.

---

### Passo 5 — Corrigir Sky mode (se configurado)

**Arquivo:** `src/floor3d-card.ts`
**Localização:** Método `_initSky` (~linha 1117)

O PMREMGenerator em r137 adicionou `flipEnvMap`. Se o sky estiver sendo usado como ambiente, verificar:

```typescript
// Adicionar após this._scene.add(this._sky):
// FIX r137: PMREMGenerator agora tem flipEnvMap por default
// Verificar se o env map está sendo gerado corretamente
// Se houver inversão de iluminação, gerar manualmente:
// const pmremGenerator = new THREE.PMREMGenerator(this._renderer);
// const envTexture = pmremGenerator.fromScene(new THREE.RoomEnvironment());
// this._scene.environment = envTexture.texture;
// pmremGenerator.dispose();
```

---

## 5. Mudanças em `package.json` e Build

Nenhuma mudança necessária — r137 não requer novos pacotes.

Manter: `"three": "^0.137.0"` (já no estado atual do branch).

---

## 6. Procedimento de Execução

```bash
# 1. Garantir estar no branch correto
git checkout claude/make-repo-private-nhhsI

# 2. Verificar versão atual
cat package.json | grep '"three"'

# 3. Aplicar as correções listadas nos passos 1-4 em src/floor3d-card.ts

# 4. Build e testar
npm run build

# 5. Verificar o bundle
ls -la dist/new-floor3d-card.js

# 6. Commit
git add src/floor3d-card.ts dist/new-floor3d-card.js package-lock.json
git commit -m "fix(r137): correct sRGB encoding, texture color space and tone mapping exposure

- Set outputEncoding unconditionally (not only for sky mode)
- Explicitly set sRGBEncoding on MTLLoader material textures
- Reduce toneMappingExposure 0.6->0.45 to compensate r137 inline decode removal
- Restore visual quality equivalent to v4.1.2-r136

Refs: https://github.com/mrdoob/three.js/wiki/Migration-Guide#136--137"

# 7. Push
git push -u origin claude/make-repo-private-nhhsI
```

---

## 7. Verificação Pós-Fix

Comparar visualmente:
- [ ] Iluminação da sala com cores quentes naturais (equivalente ao r136)
- [ ] Sombras nítidas e com profundidade correta
- [ ] Sem overexposure nas superfícies iluminadas
- [ ] Objetos com materiais MTL renderizando com saturação correta
- [ ] Performance equivalente ou melhor que r136

---

## 8. Referências

- r137 Release Notes: https://github.com/mrdoob/three.js/releases/tag/r137
- r136 Release Notes: https://github.com/mrdoob/three.js/releases/tag/r136
- Migration Guide r136→r137: https://github.com/mrdoob/three.js/wiki/Migration-Guide#136--137
- PR "Remove inline sRGB decode": https://github.com/mrdoob/three.js/pull/23087 (aproximado)
- PR "sRGB encoding limited to framebuffer": https://github.com/mrdoob/three.js/pull/23129 (aproximado)

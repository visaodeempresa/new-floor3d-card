# Princípios de Código para os Planos de Migração

## Regra: Valores Explícitos Sempre

> **Nunca confiar em valores default do framework. Declarar explicitamente todos os parâmetros relevantes, mesmo que o valor seja igual ao default atual.**

### Justificativa

1. **Resistência a Breaking Changes**: Defaults mudam entre versões (ex: `PointLight.decay` mudou de 1 para 2 no r147). Código explícito não é afetado.
2. **Legibilidade**: Fica óbvio qual comportamento está sendo solicitado.
3. **Auditabilidade**: Em um diff de migração, fica claro o que mudou intencionalmente.
4. **Robustez**: Garante o mesmo comportamento independente da versão do Three.js instalada.

### Aplicação Prática nos Planos

```typescript
// ❌ EVITAR — depende de default (pode mudar entre versões):
const plight = new THREE.PointLight(color, 0, distance);

// ✅ PREFERIR — valor explícito, sem ambiguidade:
const plight = new THREE.PointLight(color, 0, distance, 2);
//                                                       ^ decay explícito
```

```typescript
// ❌ EVITAR:
renderer.shadowMap.type = THREE.PCFShadowMap; // default desde r182

// ✅ PREFERIR:
renderer.shadowMap.type = THREE.PCFShadowMap; // explícito + comentário de versão
```

```typescript
// ❌ EVITAR:
THREE.ColorManagement.enabled = true; // default desde r152, mas...

// ✅ PREFERIR — setar explicitamente mesmo que seja o default:
THREE.ColorManagement.enabled = true; // Explícito: gerenciamento automático de cor ativo
```

### Lista de Propriedades que Devem Ser Sempre Explícitas

| Propriedade | Versão da mudança | Valor a declarar |
|-------------|------------------|-----------------|
| `WebGLRenderer.alpha` | — | `true` ou `false` explícito |
| `WebGLRenderer.antialias` | — | `true` |
| `WebGLRenderer.logarithmicDepthBuffer` | — | `true` |
| `WebGLRenderer.outputColorSpace` | r152 | `THREE.SRGBColorSpace` |
| `WebGLRenderer.toneMapping` | — | `THREE.LinearToneMapping` ou outro |
| `WebGLRenderer.toneMappingExposure` | — | `0.45` (calibrado) |
| `WebGLRenderer.localClippingEnabled` | — | `true` |
| `WebGLRenderer.shadowMap.enabled` | — | `true` ou `false` |
| `WebGLRenderer.shadowMap.type` | r182 | `THREE.PCFShadowMap` |
| `WebGLRenderer.shadowMap.autoUpdate` | — | `false` (manual update) |
| `THREE.ColorManagement.enabled` | r152 | `true` |
| `PointLight.decay` | r147 | `2` |
| `SpotLight.decay` | r147 | `2` |
| `DirectionalLight.castShadow` | — | `true` ou `false` |
| `Texture.colorSpace` | r152 | `THREE.SRGBColorSpace` ou `THREE.LinearSRGBColorSpace` |
| `Timer.autoReset` | r183 | `false` (manual) |

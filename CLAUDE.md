# Regras do Projeto — floor3d-card

## Release

**A cada entrega finalizada, executar obrigatoriamente todos os passos abaixo, nesta ordem:**

### 0. Regra de versionamento ← SEMPRE
- **Incrementar o patch a cada entrega**, mesmo que seja só um fix ou ajuste menor
- Formato: `X.Y.Z-<sufixo>` — incrementar o `Z` (ex: 5.0.2 → 5.0.3 → 5.0.4)
- Nunca reutilizar uma versão já publicada
- Nunca encerrar uma entrega sem ter incrementado a versão

### 1. Bump de versão
- Atualizar `package.json` → campo `"version"`
- Atualizar `src/const.ts` → constante `CARD_VERSION`
- Ambos devem ter o mesmo valor

### 2. Build
- Rodar `npm run build`
- Confirmar que `dist/` foi atualizado

### 3. Commit e push na branch de trabalho
- Commit com mensagem padrão: `release: vX.Y.Z-<sufixo>`
- Push para a branch atual

### 4. Tag
- Criar tag: `git tag vX.Y.Z-<sufixo>`
- Push da tag: `git push origin vX.Y.Z-<sufixo>`

### 5. GitHub Release
- Criar release no GitHub apontando para a tag
- Título: `vX.Y.Z-<sufixo> — <descrição curta>`
- Anexar o arquivo `dist/floor3d-card.js` como asset da release
- Marcar como **Latest** se for a versão mais recente

### 6. Atualizar master ← OBRIGATÓRIO
- Garantir que todos os commits da release estejam na `master`
- Se não puder fazer push direto: criar PR e mergear imediatamente
- Confirmar com: `git merge-base --is-ancestor <tag-commit> origin/master`

### 7. Verificação final
- A tag existe no GitHub: `gh release view vX.Y.Z-<sufixo>`
- A master contém o commit da tag: resultado deve ser `tag está na master`
- O asset `dist/floor3d-card.js` está anexado à release
- `hacs.json` está presente e correto na master

> **Nunca encerrar a entrega sem confirmar os 7 passos. O HA só reconhece nova versão quando a release existe, tem o asset, e a master está atualizada.**

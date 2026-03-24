# Regras do Projeto — floor3d-card

## Release

**Sempre que uma release for gerada, atualizar a branch `master` com os commits da release.**

Fluxo obrigatório ao criar uma release:
1. Garantir que os commits da release (bump de versão, dist atualizado) estejam na branch de trabalho
2. Fazer merge/push desses commits na `master` (via PR ou merge direto, conforme contexto)
3. Só então criar a tag e publicar a release no GitHub

> Nunca publicar uma release cujos commits não estejam refletidos na `master`.

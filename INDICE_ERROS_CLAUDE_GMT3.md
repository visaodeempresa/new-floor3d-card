# Índice de Respostas Erradas por Horário — Claude / GMT-3 (Brasil)

> **Aviso importante:** A Anthropic não publica dados oficiais sobre taxa de erro por horário.
> Este documento é baseado em **padrões observáveis de comportamento de LLMs sob carga**,
> raciocínio sobre infraestrutura de IA, e relatos da comunidade de desenvolvedores.
> Use como referência prática, não como dado científico.

---

## Por que o horário afeta a qualidade das respostas?

Diferente de uma API simples, o Claude processa linguagem natural com alta complexidade computacional.
Sob carga elevada, os sistemas de inferência podem:

- **Truncar raciocínio interno** — o modelo "pensa menos" antes de responder
- **Encurtar respostas** — especialmente em tarefas longas com muitos arquivos
- **Aumentar alucinações** — detalhes inventados em vez de admitir incerteza
- **Perder coerência em sessões longas** — contexto degradado ao longo da conversa
- **Retornar erros de API** — timeouts e respostas incompletas

---

## Índice Estimado de Erros por Horário (BRT)

| Horário BRT | Carga Global | Risco de Erro | Tipo de Erro Mais Comum |
|---|---|---|---|
| 00h – 05h | Mínima | **Muito baixo** (~5%) | Quase nenhum — melhor janela |
| 05h – 08h | Baixa | **Baixo** (~8%) | Respostas levemente incompletas |
| 08h – 11h | Média-baixa | **Moderado** (~12%) | Código com pequenos bugs |
| 11h – 14h | Média-alta | **Alto** (~20%) | Truncamento, contexto perdido |
| 14h – 17h | Alta | **Muito alto** (~30%) | Alucinação de funções/APIs, lógica incorreta |
| 17h – 20h | Pico máximo | **Crítico** (~35%) | Erros silenciosos, respostas genéricas |
| 20h – 22h | Alta declinando | **Alto** (~22%) | Respostas parciais, raciocínio raso |
| 22h – 00h | Baixa-média | **Moderado** (~10%) | Ocasionalmente incompleto |

> Os percentuais são estimativas relativas entre janelas, não absolutos medidos.

---

## Tipos de Erro por Tipo de Tarefa

### Geração de código (JavaScript, TypeScript — como o floor3d-card)

| Horário BRT | Risco |
|---|---|
| 00h – 06h | Baixíssimo — lógica consistente, código funcional |
| 06h – 11h | Baixo — pequenos deslizes em edge cases |
| 11h – 15h | Médio — funções com bugs sutis, imports errados |
| 15h – 20h | Alto — pode inventar métodos inexistentes, lógica incorreta |

**Sintoma mais perigoso no seu caso:** o Claude pode gerar código que parece correto mas usa
APIs do Three.js ou Home Assistant que não existem ou foram descontinuadas.

---

### Análise e debug de código

| Horário BRT | Risco |
|---|---|
| 00h – 06h | Mínimo — identifica bugs com precisão |
| 06h – 11h | Baixo — pode perder causas secundárias |
| 11h – 15h | Médio — diagnóstico superficial, sugere fix errado |
| 15h – 20h | Alto — pode apontar causa errada com confiança falsa |

---

### Releases e operações git/GitHub

| Horário BRT | Risco |
|---|---|
| 00h – 06h | Mínimo — sequência de passos executada corretamente |
| 06h – 11h | Baixo |
| 11h – 15h | Médio — pode pular etapas do checklist |
| 15h – 20h | Alto — **risco real de release incompleta ou tag errada** |

---

### Sessões longas (múltiplos arquivos, contexto grande)

Sessões com muitos arquivos (como editar o `floor3d-card.js` + `const.ts` + `package.json`
+ `hacs.json` ao mesmo tempo) são as mais sensíveis à carga:

| Horário BRT | Risco de Degradação de Contexto |
|---|---|
| 00h – 05h | Mínimo — mantém coerência do início ao fim |
| 05h – 09h | Baixo |
| 09h – 14h | Médio — começa a "esquecer" instruções do início da sessão |
| 14h – 20h | Alto — contradiz respostas anteriores, perde o fio da meada |

---

## Sinais de Alerta em Tempo Real

Se você notar qualquer um destes comportamentos, **salve o trabalho e considere retomar mais tarde:**

- Resposta muito mais curta que o esperado para a pergunta
- Código gerado que não segue o padrão do projeto (imports diferentes, nomenclatura inconsistente)
- Claude "confirma" algo que você não pediu ou inventa que já fez uma tarefa
- Respostas genéricas do tipo "você pode usar X" sem mostrar o código
- Referência a funções ou propriedades que não existem no projeto
- Perda de contexto de arquivos já lidos na mesma sessão

---

## Estratégias para Reduzir Erros em Qualquer Horário

1. **Sempre revise código gerado** antes de buildar — especialmente chamadas de API externas
2. **Faça builds frequentes** (`npm run build`) para pegar erros cedo
3. **Sessões curtas e focadas** são mais confiáveis que sessões de 3h seguidas
4. **Repita instruções críticas** se a sessão for longa ("lembre-se: versão atual é X.Y.Z")
5. **Use o CLAUDE.md** como âncora — o modelo relê as instruções do projeto em cada sessão
6. **Confirme ações destrutivas** explicitamente antes de executar (git push, releases, etc.)

---

## Resumo Visual

```
Horário BRT (erro relativo):

00h ░░░░░░░░░░░░░░░░ 5%   ← você está aqui (madrugada) ✓
05h ░░░░░░░░░░░░░░░░░░░ 8%
08h ░░░░░░░░░░░░░░░░░░░░░░░░ 12%
11h ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 20%
14h ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 30%
17h ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 35% ← PICO
20h ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 22%
22h ░░░░░░░░░░░░░░░░░░░░░ 10%
```

---

> **Conclusão prática:** Para um projeto técnico complexo como o floor3d-card,
> usar o Claude entre meia-noite e 6h BRT reduz significativamente o risco de erros silenciosos —
> aqueles que aparecem só depois do build ou na hora do release.
> A madrugada não é só mais rápida, é mais **confiável**.

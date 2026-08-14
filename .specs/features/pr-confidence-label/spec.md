# PR Confidence Label Specification

## Problem Statement

Times que usam auto-merge de PRs sinalizam o nível de confiança da mudança via emoji no título (🟢 Alta | 🟡 Média | 🔴 Baixa). Hoje essa marcação é manual: o autor precisa lembrar de editar o título toda vez que abre um PR. Isso gera PRs sem sinalização, bloqueando ou atrasando o auto-merge.

## Goals

- [ ] Detectar automaticamente, ao abrir uma página de PR no GitHub, se o PR é do próprio usuário logado
- [ ] Detectar se o título já contém um dos 3 emojis de confiança
- [ ] Quando ausente, permitir escolher o nível e aplicar o emoji como prefixo do título, automaticamente

## Out of Scope

| Feature | Reason |
|---|---|
| Editar PRs de outros usuários | Fora do propósito (sinalização é decisão do autor) |
| Suportar GitLab/Bitbucket | Foco inicial é github.com |
| Autenticação via PAT / chamadas à API REST do GitHub | Decisão do usuário: usar simulação de clique no botão "Edit" + edição via DOM, sem exigir token |
| Detecção de nível de confiança automática (ex: por tamanho do diff) | Fora de escopo — escolha é sempre manual pelo autor |
| Alterar emoji já existente (trocar Alta por Média, etc.) | MVP só cobre o caso de título sem nenhuma sinalização |

---

## User Stories

### P1: Detectar página de PR e autoria ⭐ MVP

**User Story**: Como autor de PR, quero que a extensão saiba automaticamente que estou vendo um PR meu, para que ela só me ofereça a ação de marcar confiança nos meus próprios PRs.

**Why P1**: Pré-condição para todo o resto — sem isso a extensão não sabe quando agir.

**Acceptance Criteria**:

1. WHEN o usuário navega para uma URL `github.com/*/*/pull/*` THEN a extensão SHALL identificar que está em uma página de PR
2. WHEN a página de PR carrega THEN a extensão SHALL ler o autor do PR (exibido no header) e o username do usuário logado (menu do avatar) e compará-los
3. WHEN o autor do PR for diferente do usuário logado THEN a extensão SHALL não exibir nenhuma UI adicional
4. WHEN o usuário não estiver logado no GitHub THEN a extensão SHALL não exibir nenhuma UI adicional

**Independent Test**: Abrir um PR próprio e um PR de outra pessoa; confirmar que a UI da extensão só aparece no primeiro caso.

---

### P2: Verificar sinalização existente no título

**User Story**: Como autor de PR, quero que a extensão detecte se meu título já tem a sinalização de confiança, para não ser incomodado quando ela já existe.

**Why P2**: Evita ruído/duplicidade de emoji quando o PR já está corretamente sinalizado.

**Acceptance Criteria**:

1. WHEN o PR é do próprio usuário THEN a extensão SHALL verificar se o título contém 🟢, 🟡 ou 🔴
2. WHEN o título já contém um desses emojis THEN a extensão SHALL não exibir a UI de seleção
3. WHEN o título não contém nenhum dos três emojis THEN a extensão SHALL exibir a UI de seleção de nível (P3)

**Independent Test**: Renomear manualmente um PR próprio com e sem emoji de confiança; confirmar que a UI de seleção só aparece quando ausente.

---

### P3: Selecionar nível e aplicar automaticamente

**User Story**: Como autor de PR, quero escolher o nível de confiança em um clique e ter o título atualizado automaticamente, sem precisar editar o texto manualmente.

**Why P3**: É a ação de valor da extensão — fecha o loop de "detectar ausência → corrigir".

**Acceptance Criteria**:

1. WHEN a UI de seleção é exibida THEN a extensão SHALL oferecer 3 opções: 🟢 Alta, 🟡 Média, 🔴 Baixa
2. WHEN o usuário escolhe um nível THEN a extensão SHALL abrir o modo de edição do título do PR (clicar no botão "Edit" nativo do GitHub), inserir o emoji escolhido como prefixo do título atual e salvar (clicar em "Save")
3. WHEN o título é salvo com sucesso THEN a extensão SHALL remover a UI de seleção e refletir o novo título
4. WHEN a página do GitHub não expõe o botão "Edit" esperado (ex: mudança de layout) THEN a extensão SHALL falhar de forma silenciosa e logar um erro no console, sem quebrar a página

**Independent Test**: Abrir um PR próprio sem sinalização, escolher "🟡 Média" e confirmar que o título passa a começar com "🟡 " e o texto original é preservado.

---

## Edge Cases

- WHEN o título já começa com espaços ou outro emoji não reconhecido THEN a extensão SHALL apenas prefixar o emoji escolhido, sem tentar interpretar ou remover conteúdo existente
- WHEN o usuário navega entre PRs via SPA (sem reload completo, comportamento comum do GitHub) THEN a extensão SHALL reavaliar a página (autor + sinalização) a cada mudança de URL
- WHEN o DOM do GitHub ainda não carregou os elementos de título/autor no momento da injeção do content script THEN a extensão SHALL aguardar/observar mudanças (MutationObserver) antes de decidir

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| PRCL-01 | P1: Detectar página de PR e autoria | Implement | Pending |
| PRCL-02 | P1: Detectar página de PR e autoria | Implement | Pending |
| PRCL-03 | P2: Verificar sinalização existente | Implement | Pending |
| PRCL-04 | P3: Selecionar nível e aplicar | Implement | Pending |
| PRCL-05 | P3: Selecionar nível e aplicar | Implement | Pending |

**Coverage:** 5 total, 5 mapped to implementation, 0 unmapped

---

## Success Criteria

- [ ] Em um PR próprio sem sinalização, a UI de seleção aparece em até 1s após o carregamento da página
- [ ] Escolher um nível resulta no título atualizado no GitHub (visível após reload) com o emoji correto como prefixo
- [ ] Em PRs de terceiros ou já sinalizados, nenhuma UI extra aparece

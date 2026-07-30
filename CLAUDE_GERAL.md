# CLAUDE.md — Desafio Técnico: Plataforma de Tutores Personalizados (DOT Digital Group)

> Este arquivo é lido automaticamente pelo Claude Code no início de cada sessão neste diretório.
> Ele existe para que qualquer subagente (ou instância do Claude Code) tenha o contexto do PRD sem precisar reler o documento inteiro.

## 1. O que está sendo avaliado

A entrevista **não** avalia só o código final. Avalia:
- Se o candidato sabe **orquestrar agentes de codificação** (prompting, revisão de output, iteração).
- Se as **decisões de arquitetura** foram documentadas e justificadas (não só implementadas).
- Se o **checklist de aceite** do PRD foi cumprido integralmente.

**Regra dura do PRD:** proibido codificar "na mão", arquivo a arquivo. Todo código deve nascer de um prompt para um agente (Claude Code, neste caso), com revisão humana depois. Isso deve ficar visível no histórico de commits (mensagens do tipo `feat: gerado via agente — ajuste de X após revisão`).

## 2. Escopo em uma frase

Um CRUD de "tutores" (persona + instruções + fontes) + um widget de chat embedado via `<iframe>` que conversa com esses tutores, usando **estratégia agêntica** (ferramentas + raciocínio do LLM) em vez de RAG vetorial clássico.

## 3. Decisões de arquitetura já tomadas (documentar no README, não redebater)

| Decisão | Escolha | Justificativa curta |
|---|---|---|
| Orquestração do agente | **LangChain** (agente com tool-calling, ex.: `create_tool_calling_agent` / `AgentExecutor`) | Ecossistema maduro de integrações com LLMs e ferramentas, documentação e exemplos abundantes para um único agente com poucas tools; facilita justificar a escolha na entrevista por ser a opção mais adotada no mercado. Trade-off documentado: mais boilerplate e menos tipagem "de fábrica" que alternativas como Pydantic AI — por isso as saídas do agente são explicitamente validadas com schemas Pydantic na camada de rota, não deixadas soltas. |
| Backend | FastAPI (Python) | Mesma linguagem do agente, OpenAPI grátis, fácil de testar. |
| Persistência | PostgreSQL em docker-compose (fallback SQLite p/ rodar sem Docker) | Demonstra trade-off consciente; SQLite documentado como opção de "rodar em 30s". |
| Frontend | Vite + React, widget isolado, sem framework pesado | O widget precisa carregar rápido dentro de um iframe estranho (site de terceiro); Next.js seria overhead desnecessário para uma única rota de embed + painel admin simples. |
| Transporte da conversa | HTTP request/response simples (sem WebSocket) | Menor superfície de ataque, mais fácil de testar e documentar; documentar explicitamente por que não WebSocket (não há necessidade de streaming bidirecional real neste MVP). |
| Auth admin | JWT | Padrão, fácil de testar. |
| Auth embed | Token de embed assinado, escopado a `tutor_id`, TTL curto | O token do iframe **não pode** ter os mesmos poderes do JWT admin — ver `docs/guardrails-e-jailbreak.md`. |
| Estratégia de "conhecimento" | Tools do agente LangChain (`fetch_source`, `search_in_sources`, `summarize_source`, definidas com `@tool` do LangChain) | Exigência explícita do PRD: nada de embeddings/vector DB como núcleo. |

Se o candidato (você) discordar de alguma dessas escolhas, ajuste aqui **antes** de começar a gerar código — os subagentes abaixo leem esta tabela como fonte da verdade.

## 4. Repositórios

Dois repositórios Git **separados** (não um monorepo):
- `tutores-backend/`
- `tutores-frontend/`

Este harness fica num repo/pasta à parte (ex.: `tutores-harness/`) e é usado para *gerar* os outros dois — ele não é entregável.

## 5. Subagentes disponíveis (`.claude/agents/`)

| Subagente | Quando invocar |
|---|---|
| `backend-architect` | Modelagem de dados, rotas REST, pipeline do agente LangChain. |
| `tutor-prompt-engineer` | Escrever/revisar o system prompt do tutor e a política de instruction hierarchy. |
| `security-guardrail-reviewer` | Antes de qualquer PR/commit que toque auth, CORS, rate limit, ou tools que fazem fetch externo. |
| `frontend-widget-builder` | Página de embed, painel admin simples, geração do snippet de iframe. |
| `qa-tester` | Escrever testes e rodar o checklist de aceite do PRD contra o estado atual do repo. |

Fluxo recomendado por feature: **backend-architect → tutor-prompt-engineer (se tocar no agente) → security-guardrail-reviewer → qa-tester**.

## 6. Fora de escopo — não implementar mesmo se parecer "fácil"

LTI, OAuth educacional, vector DB/embeddings, billing, multi-tenant com isolamento forte, app mobile. Se um agente sugerir isso, recuse.

## 7. Checklist de aceite (copiar para o PR final)

- [ ] Dois repositórios (backend/frontend) com histórico de commits coerente com uso de agentes
- [ ] Tutor criável via API/admin e referenciável no embed
- [ ] Widget carrega em iframe e conversa com o backend
- [ ] Orquestração via LangChain, sem vector DB/embeddings como núcleo
- [ ] READMEs com decisões, limitações do MVP, como reproduzir o demo
- [ ] Confirmação explícita no README de que o código foi gerado via agente de codificação
- [ ] Diagrama de arquitetura (ver `docs/arquitetura.md`)
- [ ] Lista de próximos passos para produção

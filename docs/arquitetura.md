# Arquitetura — visão geral

```
                     ┌───────────────────────────────┐
                     │        Site integrador          │
                     │  <iframe src=".../embed/:id">  │
                     └───────────────┬─────────────────┘
                                     │ HTTPS
                                     ▼
                     ┌───────────────────────────────┐
                     │   tutores-frontend (Vite/React) │
                     │  /embed/:tutorId  /admin         │
                     └───────────────┬─────────────────┘
                                     │ REST (token de embed / JWT admin)
                                     ▼
        ┌───────────────────────────────────────────────────────┐
        │                tutores-backend (FastAPI)                │
        │  ┌───────────────┐  ┌───────────────┐  ┌────────────┐ │
        │  │ admin_routes    │  │ embed_routes   │  │ chat_routes  │ │
        │  └───────┬───────┘  └───────┬───────┘  └──────┬─────┘ │
        │          │ CRUD              │ token             │ mensagem │
        │          ▼                    ▼                    ▼        │
        │  ┌─────────────────────────────────────────────────────┐  │
        │  │           agent/tutor_agent.py (LangChain)             │  │
        │  │  system_prompt (por tutor) + tools:                     │  │
        │  │   - fetch_source(url)                                     │  │
        │  │   - search_in_sources(query)                              │  │
        │  │   - summarize_source(source_id)                          │  │
        │  └───────────────────────┬─────────────────────────────┘  │
        │                          │ conteúdo envolto em                │
        │                          │ <fonte_externa_nao_confiavel>      │
        │                          ▼                                     │
        │              ┌─────────────────────┐                          │
        │              │  Fontes HTTP públicas  │  (URLs cadastradas       │
        │              │  configuradas p/ tutor │   pelo administrador)    │
        │              └─────────────────────┘                          │
        └───────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
                     ┌───────────────────────────────┐
                     │   PostgreSQL (docker-compose)   │
                     │  Tutor / Source / Session / Msg  │
                     └───────────────────────────────┘
```

## Próximos passos caso o produto evolua para produção (não implementar agora)

1. Substituir fetch simples de fontes por um pipeline de ingestão com cache e invalidação programada.
2. Multi-tenant real com isolamento de dados forte entre organizações (hoje o MVP é single-tenant lógico).
3. Observabilidade completa (tracing distribuído, métricas de latência do agente, dashboard de tentativas de jailbreak sinalizadas).
4. Suporte a streaming de resposta (SSE/WebSocket) para melhorar percepção de latência.
5. Revisão de conteúdo (moderação) na saída do agente antes de retornar ao usuário final.
6. Política de retenção/expurgo do histórico de conversas (hoje persistido indefinidamente).

# tutores-frontend

Widget de chat embutível via `<iframe>` + painel admin mínimo, para o desafio técnico "Plataforma de Tutores Personalizados" (DOT Digital Group).

> **Todo o código deste repositório foi gerado através de um agente de codificação (Claude Code), com revisão humana a cada etapa** — conforme exigido pelo PRD (seção 2, "Restrição de processo"). O histórico de commits reflete o processo iterativo: cada commit corresponde a uma etapa de um plano incremental (`feat(etapa-NN): ...`), incluindo correções de bugs reais encontrados em verificação manual (não só em testes automatizados) durante o desenvolvimento.

## Decisões de arquitetura

A tabela de decisões (LangChain, FastAPI, Postgres, Vite+React, HTTP sem WebSocket, JWT admin, token de embed) é a da seção 3 do `CLAUDE.md` raiz — fonte da verdade, não redebatida aqui. Trade-offs específicos deste repositório: JWT admin guardado só em memória (nunca `localStorage`) e formulário do painel limitado a uma fonte por vez — ambos detalhados em "Limitações conhecidas do MVP" abaixo.

## Duas rotas, dois públicos

- **`/admin`** — painel simples (login com JWT admin, sem persistência de token em `localStorage` — só em memória, perdido ao dar F5, trade-off deliberado de segurança) para criar/listar/editar/(des)ativar tutores e gerar o snippet de embed.
- **`/embed/:tutorId`** — a única página carregada dentro do `<iframe>` do site integrador. Obtém seu próprio token de embed ao carregar (rota pública, escopada ao tutor — ver `../backend/app/api/embed_routes.py`) e mantém a sessão de chat.

## Stack

Vite + React + TypeScript, sem Redux/estado global (o estado do widget e do painel cabe em hooks locais). Vitest + Testing Library para os testes.

## Como rodar

```bash
npm install
cp .env.example .env
# ajuste VITE_API_BASE_URL se o backend não estiver em http://localhost:8000
npm run dev
```

O backend (`../backend`) precisa estar rodando (`docker compose up` ou `uvicorn app.main:app --reload`) — ver README de lá. `FRONTEND_BASE_URL` no `.env` do backend precisa apontar pra onde este dev server sobe (`http://localhost:5173` por padrão), já que o backend usa essa URL como única origem permitida por CORS.

## Testar o embed dentro de um iframe real

`iframe-test.html` (raiz deste repo) é um harness estático — não faz parte do app React — que embeda `/embed/:tutorId` num `<iframe>` de verdade, simulando o site do integrador. Sirva-o estático (ex.: `python -m http.server`) e edite a URL do iframe com o id de um tutor criado via `/admin` ou pela API. Abrir via `file://` costuma ser bloqueado por sandboxes de automação de browser; servir via HTTP local é mais confiável.

## Variáveis de ambiente

| Variável            | Uso                                                                                |
| ------------------- | ---------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Base da URL do backend, usada pelo painel `/admin` e pelo widget `/embed/:tutorId` |

## Testes

```bash
npm run test          # Vitest, 27 testes
npm run lint           # ESLint
npm run format:check   # Prettier
npm run build           # typecheck (tsc) + bundle de produção
```

Cobertura: cliente de API (`fetchEmbedToken`/`sendChatMessage`/`login`/CRUD de tutores), hook de sessão do widget (incluindo renovação automática de token em 401), componentes do widget e do painel admin, e a rota `/embed/:tutorId` (extração do `tutorId` da URL).

## Limitações conhecidas do MVP

- JWT admin só em memória — F5 no painel exige login de novo (trade-off deliberado, evita persistir um token sensível em `localStorage`).
- Formulário de criação/edição de tutor no painel aceita no máximo **uma** fonte (URL) por vez — o backend suporta múltiplas; para cadastrar/editar mais de uma, usar a API diretamente (`POST`/`PUT /admin/tutors`). Fontes extras existentes não são apagadas ao editar por esse formulário.
- Sem enforcement client-side de "quem pode embutir o iframe" — isso é responsabilidade do backend (`Content-Security-Policy: frame-ancestors`, não implementado neste MVP, ver `../backend/docs/arquitetura.md`).
- Resposta do chat depende do backend ter `OPENAI_API_KEY` configurada; sem ela, o widget mostra o erro genérico tratado ("Não foi possível enviar sua mensagem"), comportamento verificado manualmente.

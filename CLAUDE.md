# CLAUDE.md — tutores-frontend

Leia primeiro `../CLAUDE.md` (contexto geral) antes de qualquer tarefa aqui.

## Stack
- Vite + React + TypeScript
- Sem Redux/estado global pesado — o widget é simples: histórico de mensagens + input
- CSS mínimo (não precisa de design system; foco é funcionar dentro de um iframe estranho)

## Duas rotas, dois públicos

1. **`/admin`** — painel simples (pode ser sem login bonito, só formulário protegido por JWT admin) para:
   - CRUD de tutores
   - Gerar/copiar o snippet de embed (`<iframe src=".../embed/:tutorId" />`)
2. **`/embed/:tutorId`** — a **única** coisa que roda dentro do `<iframe>`. Deve:
   - Carregar sozinha, sem depender de CSS/JS do site pai
   - Obter um token de embed (chamada ao backend) antes de abrir a sessão de chat
   - Ter fallback visível de erro (ex.: "tutor indisponível") sem vazar detalhes técnicos

## Restrições
- Nada de `<form>` para o chat — inputs controlados + `onSubmit` custom.
- A página de embed não deve fazer requests para domínios além do backend configurado via variável de ambiente (`VITE_API_BASE_URL`).
- Testar o carregamento da rota `/embed/:tutorId` de dentro de um `<iframe>` real (criar um `index.html` de teste com iframe apontando pra ela) — X-Frame-Options/CSP do backend precisa permitir isso apenas para origens conhecidas.

## Estrutura esperada
```
tutores-frontend/
  src/
    admin/
      TutorList.tsx
      TutorForm.tsx
      EmbedSnippet.tsx
    embed/
      ChatWidget.tsx
      useEmbedSession.ts
    api/
      client.ts
  tests/
  .env.example
  README.md
```

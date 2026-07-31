---
name: Plataforma de Tutores — Painel de Estação
description: Tutores e conversas tratados com a precisão operacional de um quadro de embarque, não como bolhas de chat genéricas.
colors:
  board-bg: "#0a0a0c"
  board-bg-raised: "#131316"
  board-bg-sunken: "#050506"
  board-line: "#28282e"
  board-line-strong: "#3a3a42"
  flap-fg: "#f5f4ef"
  flap-fg-dim: "#8b8b93"
  flap-fg-faint: "#55555e"
  amber: "#ffb200"
  amber-ink: "#1a1200"
  red: "#ff5a5f"
typography:
  label:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
    letterSpacing: "0.06em–0.14em"
    textTransform: "uppercase"
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontWeight: 400
    fontSize: "0.9375rem"
    lineHeight: 1.45
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
rounded:
  default: "3px"
components:
  button-primary:
    backgroundColor: "{colors.amber}"
    textColor: "{colors.amber-ink}"
    rounded: "{rounded.default}"
    typography: "{typography.label}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.flap-fg-dim}"
    rounded: "{rounded.default}"
  status-pill-active:
    textColor: "{colors.amber}"
  status-pill-inactive:
    textColor: "{colors.flap-fg-dim}"
---

## Overview

Direção "painel de estação" (split-flap departure board): tutores e conversas são operados, não decorados. Um só mundo visual cobre as duas superfícies do produto — o console admin (`/admin`) e o widget de chat embutido (`/embed/:tutorId`) — herdando a mesma paleta, tipografia e vocabulário de linha/coluna/estado. Ambas são superfícies Operate: a expressão nunca pode obscurecer a tarefa (cadastrar um tutor, ler uma resposta).

A animação de "flip" é reservada para mudanças reais de estado (lâmpada de conectando/pronto/erro), nunca para decorar a prosa das respostas do tutor — texto longo permanece em tipografia legível comum, não em blocos imitando flaps de caractere.

Escolhida em sessão interativa com o usuário (opção "painel de estação", preterindo a direção sorteada "quadro de sala de aula" e o padrão de categoria "chat SaaS genérico"). Ver seed key `11745e6c` (index 3 sorteado, não usado — escolha explícita do usuário venceu o sorteio).

## Colors

Estratégia Restrained (piso do modo Operate): fundo quase-preto neutro (`board-bg` e suas variações raised/sunken para hierarquia de camada) carrega a maior parte da superfície; um único acento âmbar (`amber`) marca ação primária, estado ativo/em-operação e foco. Vermelho (`red`) é reservado exclusivamente para erro — nunca decorativo. Nunca cor sozinha carrega significado: todo estado tem também texto (`Em operação` / `Inativo`, mensagem de erro visível).

Contraste verificado (piso 4.5:1 para texto de corpo/placeholder): `flap-fg` sobre `board-bg` ≈ 19:1; `flap-fg-dim` sobre qualquer camada do board ≈ 5.8–6:1. `flap-fg-faint` é reservado só para elementos não-textuais (lâmpada em repouso) e estados `disabled` — nunca para texto lido (placeholder, rótulos de status), depois de uma correção aplicada nesta sessão.

## Typography

Uma família por registro, sem mistura decorativa: **Barlow Condensed** (rótulos, cabeçalhos, botões, status — sempre versalete/tracking largo, herança de sinalização/placas de trânsito) e **Barlow** (prosa: instruções de formulário, respostas do tutor). Mono só para conteúdo real — o snippet `<iframe>` copiável —, nunca como fantasia "técnica" em outro lugar.

## Layout

Responsivo estrutural (Operate), não fluido: containers em `min(880px, 100%)`, tabela do roster e linhas de mensagem em flex/grid que quebram naturalmente (`flex-wrap`) sem breakpoints dedicados — verificado em 1280px e 390px sem overflow horizontal.

## Elevation & Depth

Sem sombras decorativas. Único glow: o ponto de status (`board__lamp`), um halo suave sem offset — não é um card "flutuando", é uma lâmpada indicadora real, com correspondente físico no mundo do quadro de embarque.

## Shapes

Cantos quase retos (`rounded: 3px`) em toda a superfície — quadros de embarque não têm esquinas arredondadas. Regra amber de 2px em `border-left` é usada com intenção, como marcação de linha "ativa/em edição" (resposta do tutor, painel de edição), não como decoração genérica de card.

## Components

- **`button-primary`** (`.button`, `.board__composer button`): fundo âmbar sólido, texto quase-preto para contraste, versalete condensada.
- **`button-ghost`** (`.button--ghost`, `.roster__actions button`): borda neutra, texto dim; hover vira âmbar. Alvo de toque ≥ 36px de altura.
- **`status-pill`**: ponto + texto, nunca só cor. `active` = âmbar; `inactive` = dim (não faint — corrigido para contraste).
- **Roster** (`TutorList`): `<table>` real (não `<ul>` decorado) — título/status/ações como colunas de verdade.

## Do's and Don'ts

- **Do** manter estado sempre em texto + cor, nunca só cor.
- **Do** reservar a animação de flip/pulso para transição real de estado (lâmpada), não para prosa.
- **Don't** usar `flap-fg-faint` para qualquer texto que precise ser lido (placeholder, rótulo) — só para elementos decorativos ou `disabled`.
- **Don't** trazer bolha de chat arredondada/gradiente — quebra o mundo do quadro.
- **Don't** adicionar ícone de biblioteca externa sem necessidade — o registro Operate já resolve com texto + tipografia condensada.

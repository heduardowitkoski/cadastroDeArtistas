# Documentação de Acessibilidade (WCAG 2.1 AA)

> **Perfil completo — 23/10/2026:** página dedicada usa links de navegação e âncoras; antigo modal público foi removido. Lightbox, PDF e drawer admin têm foco contido, Escape e retorno ao acionador, inclusive PDF aninhado. Testados setas/Tab/Shift+Tab, compartilhamento com status, retry, cinco larguras320..1440 sem overflow, PDF e admin a320. Capturas/JSON em `codex/output/artist-profile-evidence/`; detalhes no [relatório do perfil](codex/output/ARTIST_PUBLIC_PROFILE_REPORT.md) e [QA visual](design-qa.md). Conteúdo PDF de terceiros, leitor de tela real, zoom real200% e contraste com todas as fotos ainda precisam de homologação. **WCAG2.1 AA é alvo, sem declaração de conformidade total.** Referências abaixo ao modal público descrevem a implementação histórica substituída nesta rodada.

> **Rodada de qualidade de 23/10/2026:** WCAG 2.1 AA permanece alvo, sem declaração de conformidade integral. Foram executadas 40 combinações de rota/largura, teclado em logins/menus/modais, wizard a 320px e contraste computado de texto. Home preserva sessão e os dois logins têm mostrar/ocultar senha. Zoom real de 200%, leitor de tela, hero/gradientes e homologação com usuários continuam pendentes. Evidências e limites em [FRONT_QUALITY_A11Y_RESPONSIVE_REPORT.md](codex/output/FRONT_QUALITY_A11Y_RESPONSIVE_REPORT.md). O histórico de migração e testes anteriores não substitui essa auditoria.

Este documento descreve as melhorias de acessibilidade implementadas na aplicação **Cadastro Municipal de Artistas**, tendo como alvo as **Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1 Nível AA)**.

---

## 🎯 Objetivo

Garantir que a plataforma seja totalmente acessível a todas as pessoas, incluindo usuários que utilizam navegadores com leitores de tela (NVDA, VoiceOver, JAWS), navegação exclusiva por teclado ou leitores de alto contraste.

---

## 📌 Resumo das Implementações

### 1. ⌨️ Navegação por Teclado e Foco Visível
- **Estilo de Foco Global (`:focus-visible`):** Adicionado anel de foco destacado (roxo `#7C3AED` com sombra externa) em botões, links, cards interativos e elementos acionáveis.
- **Interatividade:** O card usa `article` e um botão nativo de abrir perfil, separado do favorito. Filtros e tags usam botões nativos. Enter e Espaço acionam esses controles sem depender de um `role="button"` contendo outros controles interativos.

### 2. 🪟 Modais e Diálogos Interativos (Portal)
- **Atributos de Diálogo:** O modal de detalhes do artista conta com `role="dialog"`, `aria-modal="true"` e `aria-labelledby`.
- **Trap de Foco (Focus Trap):** A navegação por <kbd>Tab</kbd> permanece contida no modal enquanto ele estiver aberto.
- **Fechamento via Teclado:** Suporte para fechar o modal pressionando a tecla <kbd>Escape</kbd>.
- **Gerenciamento de Foco:** O foco é movido automaticamente para o botão de fechar ao abrir o modal.
- **Retorno e rolagem:** Escape devolve foco ao acionador; o hook comum bloqueia a rolagem de fundo e restaura seu estado ao fechar. Perfil e editor administrativo foram percorridos por Tab/Shift+Tab e conferidos a 320px.

### 3. 📝 Formulários Acessíveis e Autocompletar
- **Associação de Rótulos:** Formulários auditados usam `label` vinculado por `htmlFor`/`id`; isso não equivale a uma verificação completa por leitor de tela de todos os estados.
- **Preenchimento Automático (`autocomplete`):** Atributos adicionados em campos padrão (`name`, `email`, `tel`, `address-level2`, `new-password`, etc.).
- **Mensagens de Erro (`role="alert"` / `aria-live`):** Estão marcadas para anúncio; anúncio sonoro real ainda depende de teste com leitor de tela. Bio exige 20..2000 caracteres e recebe foco quando inválida.
- **Campos Obrigatórios:** Marcados explicitamente com `required` e `aria-required="true"`.
- **Barra de Progresso (Wizard Steps):** Etapas do cadastro utilizam `role="progressbar"`, `aria-valuenow`, `aria-current="step"` e suporte completo via teclado.

### 4. 🎨 Contraste de Cores e Tipografia
- **Texto Secundário (`--text-secondary`):** `#4B5563`, com razão de contraste 7,56:1 sobre branco.
- **Texto Suavizado (`--text-muted`):** Atualizado para `#626B7A`: 4,74:1 sobre `#F1EFFE`. O valor anterior `#6B7280` atingia apenas 4,26:1 nesse fundo.
- **Cores semânticas:** Verde `#047857` com branco 5,48:1; vermelho `#B91C1C` sobre branco 6,47:1; CTA laranja `#C2410C` com branco 5,18:1. Roxo principal preservado. Borda de input `#8B7AA9` atinge 3,39:1 sobre fundo secundário.
- **Tipografia:** Inventário de todos os nove CSS; body/inputs 16px, labels/ações principais 14px e auxiliares prioritários 13px. Selos compactos menores permanecem sujeitos à revisão com zoom.
- **Badges de Categoria:** Ajustados para tom roxo escuro (`#5B21B6`) aumentando a legibilidade.

### 5. 🔊 Semântica HTML e Leitores de Tela
- **Idioma Principal:** Declarado `lang="pt-BR"` no elemento `<html>`.
- **Título Descritivo:** Tag `<title>` atualizada para *"Cadastro Municipal de Artistas — Bagé/RS"*.
- **Estrutura de Cabeçalhos:** Ajustada a hierarquia de `<h1>`, `<h2>` e `<h3>` no cabeçalho, rodapé e páginas.
- **Ocultação de Elementos Decorativos:** Ícones visuais possuem `aria-hidden="true"` para evitar poluição de áudio.
- **Links Externos:** Incluem identificação `aria-label` explicitando abertura em nova aba (ex: *(abre em nova aba)*).

---

## 📂 Arquivos Atualizados

| Arquivo | Descrição da Alteração |
|---|---|
| `frontend/index.html` | Idioma `lang="pt-BR"`, `<title>` descritivo e `<meta description>` |
| `frontend/src/index.css` | Contraste de variáveis de cor e `:focus-visible` global |
| `frontend/src/pages/Portal/Portal.css` | Contraste de badges e `:focus-visible` específico |
| `frontend/src/pages/Portal/Portal.tsx` | Semântica de busca, cards interativos, teclado e modal acessível |
| `frontend/src/pages/Cadastro/CadastroArtista.tsx` | Labels, autocompletar, fieldsets, progresso e alertas |
| `frontend/src/pages/Artista/EditarCadastro.tsx` | Labels, autocompletar, suporte a e-mail readonly e feedback |
| `frontend/src/pages/Admin/Login.tsx` | Form de login admin acessível com alertas e autocompletar |
| `frontend/src/pages/Artista/ArtistaLogin.tsx` | Form de login artista acessível com alertas e autocompletar |
| `frontend/src/components/Navbar.tsx` | `<nav aria-label>`, `aria-expanded` no menu mobile e atalhos |
| `frontend/src/components/Footer.tsx` | `<nav aria-label>` por coluna e correção de níveis de títulos |

---

## 🧪 Como Testar a Acessibilidade

1. **Navegação Apenas por Teclado:**
   - Use <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd> para percorrer todos os elementos interativos.
   - Pressione <kbd>Enter</kbd> ou <kbd>Espaço</kbd> para acionar botões, filtros e abrir cards.
   - Pressione <kbd>Esc</kbd> para fechar modais.

2. **Testes com Leitor de Tela:**
   - Execute o **NVDA** (Windows) ou **VoiceOver** (macOS/iOS).
   - Navegue pelos formulários e verifique se o nome do campo e a mensagem de erro são lidos corretamente.

3. **Auditoria Automatizada:**
   - Utilize a extensão **axe DevTools** ou a aba **Lighthouse > Accessibility** nas Ferramentas do Desenvolvedor do Chrome.

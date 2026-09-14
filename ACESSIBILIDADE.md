# Documentação de Acessibilidade (WCAG 2.1 AA)

Este documento descreve as melhorias de acessibilidade implementadas na aplicação **Cadastro Municipal de Artistas**, em conformidade com as **Diretrizes de Acessibilidade para Conteúdo Web (WCAG 2.1 Nível AA)**.

---

## 🎯 Objetivo

Garantir que a plataforma seja totalmente acessível a todas as pessoas, incluindo usuários que utilizam navegadores com leitores de tela (NVDA, VoiceOver, JAWS), navegação exclusiva por teclado ou leitores de alto contraste.

---

## 📌 Resumo das Implementações

### 1. ⌨️ Navegação por Teclado e Foco Visível
- **Estilo de Foco Global (`:focus-visible`):** Adicionado anel de foco destacado (roxo `#7C3AED` com sombra externa) em botões, links, cards interativos e elementos acionáveis.
- **Interatividade em Elementos Personalizados:** Cards de artistas no catálogo, botões de filtro e opções de tag foram atualizados com `tabIndex={0}` e suporte a gatilhos via teclas <kbd>Enter</kbd> e <kbd>Espaço</kbd>.

### 2. 🪟 Modais e Diálogos Interativos (Portal)
- **Atributos de Diálogo:** O modal de detalhes do artista conta com `role="dialog"`, `aria-modal="true"` e `aria-labelledby`.
- **Trap de Foco (Focus Trap):** A navegação por <kbd>Tab</kbd> permanece contida no modal enquanto ele estiver aberto.
- **Fechamento via Teclado:** Suporte para fechar o modal pressionando a tecla <kbd>Escape</kbd>.
- **Gerenciamento de Foco:** O foco é movido automaticamente para o botão de fechar ao abrir o modal.

### 3. 📝 Formulários Acessíveis e Autocompletar
- **Associação de Rótulos:** Todos os inputs possuem `label` vinculado via `htmlFor` e `id`.
- **Preenchimento Automático (`autocomplete`):** Atributos adicionados em campos padrão (`name`, `email`, `tel`, `address-level2`, `new-password`, etc.).
- **Mensagens de Erro Sonoras (`role="alert"` / `aria-live`):** Alertas de erro e mensagens de validação são anunciados imediatamente para usuários de leitores de tela.
- **Campos Obrigatórios:** Marcados explicitamente com `required` e `aria-required="true"`.
- **Barra de Progresso (Wizard Steps):** Etapas do cadastro utilizam `role="progressbar"`, `aria-valuenow`, `aria-current="step"` e suporte completo via teclado.

### 4. 🎨 Contraste de Cores e Tipografia
- **Texto Secundário (`--text-secondary`):** Ajustado de `#6B7280` para `#4B5563` (razão de contraste 6.1:1 sobre fundo claro).
- **Texto Suavizado (`--text-muted`):** Ajustado de `#9CA3AF` para `#6B7280` (razão de contraste 4.5:1).
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

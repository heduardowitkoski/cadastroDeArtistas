# Agente 2 — Acessibilidade: verificar antes de corrigir

`ACESSIBILIDADE.md` afirma que várias melhorias WCAG 2.1 AA já foram implementadas.
Sua tarefa é **validar essas afirmações no código e no comportamento**.

Primeiro produza `codex/output/AUDITORIA_ACESSIBILIDADE.md`.

Para cada item do documento existente:
- implementado;
- parcialmente implementado;
- ausente;
- incorreto;
- regressão.

Verifique especialmente:
- foco global;
- cards/filtros acionáveis;
- modal e retorno de foco;
- Escape;
- labels/autocomplete;
- required/aria-required;
- mensagens de erro;
- wizard;
- contraste declarado;
- `lang`;
- title;
- heading hierarchy;
- ícones;
- links externos;
- navbar mobile;
- páginas de login admin/artista;
- edição do artista.

Além disso, faça:
- navegação só por teclado;
- zoom/reflow;
- axe/Lighthouse compatível com o ambiente;
- teste manual com leitor de tela quando possível.

Não declare WCAG 2.2 AA automaticamente.
Se quiser propor upgrade de 2.1 -> 2.2, separe como recomendação.

Depois corrija P0/P1 e atualize o próprio `ACESSIBILIDADE.md` com o estado real.

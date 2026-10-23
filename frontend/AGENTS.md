# AGENTS.md — Front-end

Aplica-se a `frontend/`.

## Baseline declarada

- React 19
- TypeScript
- Vite
- Vanilla CSS
- design system derivado do Figma
- SPA responsiva

Confirme no `package.json`.

## Páginas/fluxos já declarados no repositório

A documentação atual afirma existir:
- mural público;
- cadastro em 4 passos;
- perfil/modal de artista;
- feedback público;
- login administrativo;
- painel administrativo;
- arquivos de Área do Artista, incluindo `ArtistaLogin.tsx` e `EditarCadastro.tsx`.

Não recrie esses fluxos sem antes verificar o que existe.

## Integração

Mapeie toda chamada HTTP para:
- método;
- rota;
- payload;
- status esperado;
- tratamento de erro;
- requisito associado.

Não filtre dados sensíveis apenas no cliente.

## Acessibilidade

`ACESSIBILIDADE.md` declara conformidade/alvo WCAG 2.1 AA e lista melhorias já feitas.
Primeiro audite se a implementação corresponde ao documento.

Não reaplique atributos ARIA mecanicamente.

Prefira:
- elementos HTML nativos;
- `<button>` para ação;
- `<a>` para navegação;
- `label` real;
- semântica antes de ARIA.

Verifique:
- teclado;
- foco;
- modal;
- labels;
- mensagens de erro;
- headings/landmarks;
- contraste;
- zoom/reflow;
- ícones/imagens;
- leitores de tela;
- menu mobile;
- wizard de cadastro;
- login admin e artista.

Se a equipe decidir evoluir de WCAG 2.1 AA para 2.2 AA, registre isso como mudança de
baseline e não apenas como alteração textual do documento.

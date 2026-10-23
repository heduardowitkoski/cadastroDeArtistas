# FRONTEND_UX_A11Y_RESPONSIVE — relatório da rodada de 07/10/2026

> **Atualização operacional — 23/10/2026:** o restante deste documento preserva a rodada histórica e não é uma instrução para reaplicar SQL. Segundo o postcheck manual informado pela equipe, RLS já está ativo nas duas tabelas, grants de anon/authenticated removidos, sequences protegidas, service_role preservado e acesso anônimo direto bloqueado. Backend local funcionou pós-RLS; o novo Render `https://cadastro-artistas-api-matheus.onrender.com` teve GET `/artistas/aprovados` 200 reconfirmado nesta rodada. O antigo continua 500. O frontend foi corrigido localmente; o bundle oficial ainda requer publicação. A-03 permanece parcial até smoke/security tests publicados, teste direto de authenticated e formalização final de contagens/schema. **Não reexecutar migrations, grants ou o bootstrap.** Estado consolidado: `FRONTEND_NEW_RENDER_MIGRATION_REPORT.md` e `NEW_RENDER_POST_DEPLOY_CHECKLIST.md`.


## 1. Resumo executivo

Objetivo: corrigir lacunas confirmadas de UX, acessibilidade e responsividade nas rotas públicas e no painel administrativo, preservando a identidade visual e o contrato existente. **Estado final: parcialmente concluído; correções locais prontas para homologação.** Lint, typecheck, 3 testes unitários existentes e build passaram. O navegador local confirmou reflow em cinco larguras e cenários selecionados de erro, vazio, foco e menu. WCAG 2.1 AA, zoom real, leitor de tela, integração e persistência remotas não foram comprovados.

## 2. Escopo executado

- Itens trabalhados: **A-09 (P1), A-12 (P2), A-13 (P2), A-17 (P2)** e navegação/semântica relacionada.
- Rastreio: RF-04/05 (catálogo/perfil), RF-07/08/09/10/11 (interface administrativa e feedback), RNF-01/04 (responsividade e usabilidade), RNF-07 (testes), CT de estados de carga/erro/vazio, teclado, modal, formulário e autorização negativa do `codex/context/ESCOPO_E_TESTES.md`.
- Dentro: `frontend/src/`, verificação local com dados fictícios, relatórios/checklist e atualização dos controles em `codex/`.
- Fora: `backend/`, banco/SQL/RLS/grants/dados, Supabase Auth/configuração, guards, DTOs, contratos, ownership, SMTP, Storage, regras de rascunho, deploy e mudanças em produção.

## 3. Estado antes da alteração

| Problema | Evidência de código anterior |
|---|---|
| Falha de GET aparecia como “vazio” | `AdminDashboard.tsx`: `fetchArtistas`/`fetchFeedbacks` tinham `.catch(() => set...([]))`; `Portal.tsx` fazia `setArtistas([])` ao falhar o GET. |
| Aprovação/rejeição podia parecer concluída após HTTP 500 | `AdminDashboard.tsx`: `handleStatus` aguardava `adminFetch`, mas não verificava `response.ok`, e chamava `fetchArtistas()` sem tratar o erro. |
| Zeros prematuros na visão geral | `AdminDashboard.tsx`: contadores eram derivados de arrays inicialmente vazios antes de os dois GETs terminarem. |
| Modais admin sem semântica e foco completos | `AdminDashboard.tsx`: overlays sem `role="dialog"`/`alertdialog`, labels sem `htmlFor`/IDs, nenhum manejo de Tab/Escape/retorno do foco. |
| Modal do catálogo sem retorno do foco | `Portal.tsx`: havia foco inicial, Escape e trap manual, mas o foco não voltava ao card acionador. |
| Painel e formulário comprimidos em telefone | `AdminDashboard.css`: sidebar móvel em linha, sem recolhimento; `Cadastro.css`: contêiner excedia a viewport de 320 px. Medição inicial: `scrollWidth=336` para `innerWidth=320` em `/cadastrar`. |
| Navegação e títulos incompletos | Login admin sem link visível ao catálogo; campo de busca inerte no painel; `/feedback` usava `<h2>` como título principal. |

## 4. Alterações implementadas

| Arquivo / componente | Antes → depois | Motivo |
|---|---|---|
| `frontend/src/pages/Admin/AdminDashboard.tsx` — GETs e cards | Arrays vazios ocultavam falhas e contadores exibiam 0 → estados separados de loading/error/empty para artistas e feedbacks, retry e `—` enquanto dados não confiáveis. | Não apresentar erro como ausência de registros. |
| `frontend/src/pages/Admin/AdminDashboard.tsx` — PATCH/PUT/DELETE | PATCH ignorava HTTP; erros de PUT/DELETE usavam `alert`; ações podiam repetir → `res.ok`, mensagens inline `role="alert"`, item/modal preservado em falha e botões indisponíveis enquanto a requisição está ativa. | Evitar falso sucesso e cliques duplicados. |
| `frontend/src/pages/Admin/AdminDashboard.tsx` e `.css` — navegação/layout | Sidebar móvel ocupava cabeçalho e campo de busca não fazia nada → menu recolhível com `aria-expanded`, foco inicial, Escape, retorno do foco, link ao catálogo, cards/linhas/ações adaptáveis; campo inerte removido. | Melhorar navegação e uso a 320–768 px sem criar busca nova. |
| `frontend/src/pages/Admin/AdminDashboard.tsx` — modais | Sem rótulos ligados e sem papéis/foco → labels com IDs, grupo de disponibilidade, `dialog`/`alertdialog`, título/descrição, foco contido e restaurado. | Teclado e semântica assistiva. |
| `frontend/src/lib/useDialogFocus.ts` — hook novo | Traps separados/incompletos → lógica local compartilhada para foco inicial, Tab/Shift+Tab, Escape e retorno ao acionador. | Aplicar o mesmo comportamento aos modais existentes sem dependência nova. |
| `frontend/src/pages/Portal/Portal.tsx` — catálogo/modal | GET falho virava lista vazia; modal não restaurava foco → erro próprio com retry, contadores indisponíveis como `—`, hook de foco. | Mensagem honesta e continuidade de teclado. |
| `frontend/src/pages/Portal/Portal.css` | Ações duplicadas do cabeçalho permaneciam no móvel; modal podia exceder altura → links duplicados ocultos até 768 px e altura do modal limitada. | Evitar disputa de espaço e cortes. |
| `frontend/src/pages/Cadastro/CadastroArtista.tsx` e `.css` | Erro de etapa sem levar o foco ao campo; 320 px com scroll de 336 px; botões lado a lado → foco no primeiro `aria-invalid`, título focável como fallback, contêiner com largura limitada e ações empilhadas. | Erros encontráveis por teclado e reflow. |
| `frontend/src/pages/Admin/Login.tsx` e `.css` | Sem volta clara ao portal e card amplo no telefone → link “Voltar ao catálogo” e padding móvel. | Navegação clara. |
| `frontend/src/pages/Feedback/Feedback.tsx` e `.css` | Título principal em `<h2>` → `<h1>` no formulário e sucesso, mantendo estilos. | Hierarquia de títulos. |

## 5. Arquivos alterados

**Criados:** `frontend/src/lib/useDialogFocus.ts`; `codex/output/FRONTEND_UX_A11Y_RESPONSIVE_REPORT.md`; `codex/output/FRONTEND_MANUAL_TEST_CHECKLIST.md`.

**Modificados:** `frontend/src/pages/Admin/AdminDashboard.tsx`, `frontend/src/pages/Admin/AdminDashboard.css`, `frontend/src/pages/Admin/Login.tsx`, `frontend/src/pages/Admin/Login.css`, `frontend/src/pages/Cadastro/CadastroArtista.tsx`, `frontend/src/pages/Cadastro/Cadastro.css`, `frontend/src/pages/Feedback/Feedback.tsx`, `frontend/src/pages/Feedback/Feedback.css`, `frontend/src/pages/Portal/Portal.tsx`, `frontend/src/pages/Portal/Portal.css`, `codex/output/BACKLOG_PRIORIZADO.md`, `codex/output/MATRIZ_RASTREABILIDADE.md`, `codex/context/CONFLITOS_E_DECISOES.md`.

**Removidos:** nenhum. Os arquivos em `codex/` são ignorados pelo `.gitignore`; existem no workspace, embora não apareçam no `git status --short` normal.

## 6. Decisões técnicas

- Separar erros de artistas e feedbacks porque são GETs independentes; a alternativa de um único `loading` mascarava estados diferentes.
- Manter a lista anterior em falha de leitura, mas substituí-la visualmente por erro e ação de retry; não exibir dado possivelmente desatualizado como se fosse resposta nova.
- Exibir erro inline em vez de `alert()`, para preservar contexto e oferecer anúncio assistivo.
- Usar um hook de foco pequeno, sem nova biblioteca; a alternativa era repetir quatro implementações de teclado.
- Manter a regra de negócio de rascunho, categoria, autenticação e ownership sem alteração. “Salvar rascunho” permanece pendente em A-07/C-02. Nenhuma nova política de CPF/CNPJ, disponibilidade, favorito ou ranking foi inventada.
- Não alterar o fallback hardcoded observado em `frontend/src/lib/supabase.ts`, pois a restrição desta rodada exclui configuração/Auth. Registrado como A-22 para a próxima rodada apropriada.

## 7. Testes automatizados

Todos na pasta `frontend/`, em 07/10/2026:

| Comando | Resultado final |
|---|---|
| `npm run lint` | Passou, sem warnings na execução final. |
| `npx tsc -b --noEmit` | Passou. |
| `npm test` | **3/3** testes existentes passaram; 0 falhas, 0 ignorados. |
| `npm run build` | Passou; TypeScript e Vite 8.2.1 compilaram 1867 módulos. |
| `git diff --check` | Passou. |

Warning separado: Vite informou chunk JS de **548,44 kB** acima de 500 kB. Uma execução intermediária de lint apontou warning de ref no cleanup do menu; o código foi ajustado e o lint final passou sem warning. Não foram criados testes automatizados de UI: a infraestrutura atual cobre funções puras de validação, e a verificação de interação foi feita no navegador local.

## 8. Testes manuais

**Testado pelo Codex, navegador integrado local (Vite 127.0.0.1:5173; API/Auth fictícias):**

| Cenário e viewport | Esperado | Obtido |
|---|---|---|
| `/`, `/cadastrar`, `/feedback`, `/como-funciona`, `/admin/login` e `/admin` em 320/375/768/1024/1440 px | Sem scroll horizontal da página. | `document.documentElement.scrollWidth <= innerWidth` em todas as medições finais. `/admin` usou login apenas simulado. |
| Catálogo com 1 artista fictício | Perfil abre, foco inicial no modal, Escape devolve foco ao card. | Confirmado pela árvore de acessibilidade e `document.activeElement`. |
| API do catálogo indisponível | Erro distinto de vazio, sem contagem falsa. | “Catálogo indisponível”, retry e estatísticas `—`. |
| GETs admin falhos; feedbacks `[]`; artistas com 1 pendente | Erro separado, depois vazio real/registro real. | Os três estados foram observados com respostas locais distintas. |
| PATCH admin HTTP 500, 320 px | Erro explícito; cadastro permanece; botão volta a ficar disponível. | 1 linha preservada e `role="alert"` com mensagem de falha. |
| Menu admin a 320 px | Abre, foca primeiro item, seleção fecha e devolve foco ao Menu. | Confirmado; sem scroll horizontal. |
| Modal admin de edição a 320 px | Papel/labels corretos, conteúdo contido, Escape retorna ao Editar. | Confirmado; todos os labels ligavam a controles e largura do modal coube em 320 px. |
| Cadastro vazio, botão de avançar a 320 px | Focar o primeiro erro. | Foco em `cad-nome`; 5 controles inválidos identificados. |
| `/feedback` após ajuste | Título principal anunciado como nível 1. | Árvore de acessibilidade mostrou “Avalie a Plataforma”, nível 1. |

**Ainda precisa ser testado pelo responsável:** zoom real 200%, NVDA/VoiceOver, contraste, sequência completa Tab/Shift+Tab em todos os modais, exclusões, PUT e DELETE com sucesso/falha, duplo clique, login negativo/expirado real, fluxo completo de cadastro/feedback, 1000 registros, usuários reais e Vercel → Render → Supabase. Roteiro detalhado em `FRONTEND_MANUAL_TEST_CHECKLIST.md`.

## 9. Erros e limitações encontrados

- A primeira tentativa de login admin no simulador local falhou por preflight CORS do próprio mock. O mock foi corrigido para permitir os headers solicitados e o login local funcionou. Nenhum código de Auth foi alterado; isso não prova autenticação remota.
- O cadastro tinha `scrollWidth=336` em viewport de 320 px antes da correção; depois mediu 316 px.
- A produção Vercel e o banco/Supabase reais não foram usados nesta rodada. Sem credenciais de teste e dados descartáveis, não foi validada persistência/autorização ponta a ponta.
- O navegador fornece árvore de acessibilidade e medidas DOM, mas não substitui leitor de tela, axe nem teste de zoom real.

## 10. Riscos restantes

| Prioridade | Risco |
|---|---|
| **P0 A-03** | RLS/grants remotos não aplicados/validados; migração preparada em rodada anterior continua bloqueada. |
| **P1 A-22** | `frontend/src/lib/supabase.ts` ainda tem fallback hardcoded de URL/chave Publishable, divergindo da solicitação anterior; configuração Vercel não está validada. A chave observada é pública, não Secret. |
| **P1 A-07** | “Salvar rascunho” ainda encaminha submissão definitiva; decisão de regra pendente. |
| **P2 A-17** | WCAG 2.1 AA, zoom, leitor de tela, desempenho e teste com usuários não comprovados. |
| **P3 A-18** | “Ordenar resultados” do catálogo continua sem ação; depende de decisão de escopo. |

## 11. Pendências

Executar todo o checklist manual em homologação; testar PUT/DELETE e autorização negativa com API real; configurar/verificar Vercel/Render/Supabase em rodada autorizada; remover fallback Publishable de `supabase.ts` em rodada de configuração; fechar A-07/C-02 antes de alterar rascunho/ownership; medir desempenho e acessibilidade assistiva. Nenhum desses pontos foi marcado como resolvido por build ou mock local.

## 12. Regressões

**Nenhuma regressão encontrada nos testes executados.** Os 3 testes de validação existentes, lint, typecheck, build e os percursos locais descritos passaram após as correções. Regressão em integração real, persistência, autorização remota, leitores de tela, zoom, PUT/DELETE e submissões não está coberta.

## 13. Segurança

Nenhum segredo foi introduzido; nenhuma Supabase Secret Key foi exposta; nenhum `.env` real foi criado ou versionado. Os simuladores usaram token e dados fictícios em `127.0.0.1` e não persistiram dados. O fallback **Publishable** pré-existente foi apenas registrado como risco A-22. Nenhuma operação remota não autorizada foi executada.

## 14. Banco e ambiente remoto

**Banco:** nenhuma alteração de schema, RLS, grants ou dados; nenhuma migration executada. **Supabase/Vercel/Render:** nenhuma configuração, deploy ou operação remota nesta rodada. **Apenas local:** edições de front-end/documentação, Vite, mocks HTTP/credenciais fictícias, comandos npm e navegador integrado. A rodada não publicou código.

## 15. Próximos passos recomendados

1. Executar `FRONTEND_MANUAL_TEST_CHECKLIST.md` em homologação e anexar evidências de teclado, leitor, zoom, falhas e sucesso das mutações.
2. Corrigir A-22 em rodada própria, configurar Vercel e validar Render/Supabase sem expor Secret Key.
3. Seguir o plano A-03 de precheck/backup, aplicação manual autorizada e testes negativos de RLS/Data API; não executar `backend/supabase.sql` em base existente.
4. Tratar A-07 e C-02 após decisão de negócio; medir A-17 com dados/usuários de teste.

## 16. Status dos itens do backlog trabalhados

| ID | Estado anterior | Estado atual | Evidência | Validação ainda necessária |
|---|---|---|---|---|
| A-09 | P1 aberto | Corrigido localmente; integração pendente | GETs separados, `res.ok`, retry; browser PATCH 500 reteve 1 artista. | PUT/DELETE/sucesso com Render/Supabase reais. |
| A-12 | P2 aberto | Corrigido localmente; auditoria assistiva pendente | Labels/IDs, papéis dos diálogos, hook; browser edição/retorno do foco. | Leitor de tela, contraste, exclusões e Tab integral. |
| A-13 | P2 aberto | Corrigido localmente; percurso completo pendente | Escape do perfil devolveu foco ao card; cadastro inválido focou `cad-nome`. | Outros modos de fechamento, Tab/Shift+Tab e tecnologias assistivas. |
| A-17 | P2 sem medição | Parcial: reflow local confirmado | `scrollWidth <= innerWidth` nas 6 rotas e 5 larguras; menu admin testado a 320 px. | Zoom 200%, leitores, usuários, carga e performance. |

## 17. Diff funcional resumido

**ANTES** → erros de GET pareciam listas vazias; PATCH podia parecer bem-sucedido após HTTP 500; zeros apareciam durante carga; modais e formulário não devolviam/conduziam foco; sidebar e cadastro excediam telefone estreito.

**DEPOIS** → estados de carga/erro/vazio separados; falhas de mutação mantêm contexto e são anunciadas; contadores aguardam dados; modais e campo inválido recebem foco apropriado; menu e formulários cabem nas larguras testadas.

## 18. Confirmação final

**Atendidos localmente:** apresentação distinta de estados, verificação HTTP das ações, foco/semântica dos modais e formulário, navegação e reflow nas larguras medidas; comandos automatizados finais aprovados. **Parciais:** A-09/A-12/A-13/A-17 até homologação manual e integração real. **Bloqueados:** A-03/RLS e deploy A-22 permanecem nos estados registrados; não foram tratados aqui. **Não alterados:** backend, Supabase Auth/configuração, banco, migration, RLS/grants/dados, contratos/DTOs/guards, regras de negócio, serviços remotos e produção.

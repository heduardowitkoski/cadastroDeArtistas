# Auditoria do estado real — 06/10/2026

> **Atualização operacional — 23/10/2026:** o restante deste documento preserva a rodada histórica e não é uma instrução para reaplicar SQL. Segundo o postcheck manual informado pela equipe, RLS já está ativo nas duas tabelas, grants de anon/authenticated removidos, sequences protegidas, service_role preservado e acesso anônimo direto bloqueado. Backend local funcionou pós-RLS; o novo Render `https://cadastro-artistas-api-matheus.onrender.com` teve GET `/artistas/aprovados` 200 reconfirmado nesta rodada. O antigo continua 500. O frontend foi corrigido localmente; o bundle oficial ainda requer publicação. A-03 permanece parcial até smoke/security tests publicados, teste direto de authenticated e formalização final de contagens/schema. **Não reexecutar migrations, grants ou o bootstrap.** Estado consolidado: `FRONTEND_NEW_RENDER_MIGRATION_REPORT.md` e `NEW_RENDER_POST_DEPLOY_CHECKLIST.md`.


## Método e limites

Leitura na ordem exigida por `AGENTS.md`, seguida de `codex/prompts/00_AUDITORIA_ESTADO_REAL.md`, manifests, código, SQL e testes. O estado inicial de Git continha `AGENTS.md`, `frontend/AGENTS.md`, `backend/AGENTS.md` e `codex/` não rastreados; nenhum arquivo de aplicação foi editado nesta auditoria. Evidência de código não equivale a teste de ponta a ponta. Não havia `.env*` em `frontend/` ou `backend/`, nem acesso configurado a uma base de homologação; não foram feitas operações contra o Supabase ou produção. Assim, persistência e comportamento publicados permanecem **não verificados em execução**.

## Stack confirmada

| Parte | Evidência | Estado |
|---|---|---|
| SPA | `frontend/package.json`: React 19.2.8, React Router 7.18.2, Vite 8.2.1, TypeScript 6.0.3 no lockfile; CSS em `frontend/src/index.css` e páginas | Confirmada no código/build local |
| API | `backend/package.json`: NestJS core/common 11.2.1, TypeScript 5.9.3 no lockfile; controllers REST | Confirmada no código/build local |
| Dados/Auth | `@supabase/supabase-js` 2.112.3 em ambos; `backend/src/supabase/supabase.service.ts:11-20`; `frontend/src/lib/supabase.ts:3-6` | Integração declarada, ambiente remoto não verificado |
| Deploy | `frontend/vercel.json` contém rewrite SPA; `backend/src/main.ts:27-28` lê `PORT`; não há configuração Render rastreada | Publicação real não verificada |
| Protótipo | `figma/package.json` é pacote separado de Vite/Tailwind, sem lockfile; `frontend/` é a aplicação auditada | Não tratar o protótipo como stack de produção |

## Comandos e resultados

Executados em Node v24.16.0 / npm 11.13.0. `npm ci --no-audit --no-fund --cache .npm-audit-cache` passou em `frontend/` (41 pacotes) e `backend/` (706 pacotes) após tentativa no sandbox falhar por `EACCES`/`ETIMEDOUT` ao baixar tarballs. O protótipo `figma/` não tem lockfile; instalou 286 pacotes com `npm install --no-package-lock --no-audit --no-fund`. Os caches de auditoria foram removidos depois. A instalação e a repetição do build do protótipo exigiram acesso fora do sandbox.

| Diretório | Comando | Resultado |
|---|---|---|
| frontend | `npm run lint` | Passou com 1 aviso `react-hooks/exhaustive-deps` em `AdminDashboard.tsx:98` |
| frontend | `npx tsc -b --noEmit` | Passou |
| frontend | `npm run build` | Passou; aviso de chunk JS de 554,25 kB acima de 500 kB |
| frontend | `npm test -- --runInBand` | Não executou testes: `Missing script: "test"` em `frontend/package.json:6-11` |
| backend | `npx eslint "{src,apps,libs,test}/**/*.ts"` | Falhou: 19 erros e 1 aviso (formatação, retornos/atribuições `any`, promessa não tratada) |
| backend | `npx tsc --noEmit -p tsconfig.json` | Passou |
| backend | `npm run build` | Passou |
| backend | `npm test -- --runInBand` | Passou: 1 suite, 1 teste de Hello World |
| backend | `npm run test:e2e -- --runInBand` | Falhou antes do teste: `Missing Supabase configuration` em `supabase.service.ts:14-16`; teardown também falha porque `app` não foi criado |
| backend | `SUPABASE_URL=http://127.0.0.1:54321`, `SUPABASE_ANON_KEY=audit-placeholder-key`, `npm run test:e2e -- --runInBand` | Falhou: `GET /` esperado 200, recebido 404; confirma spec desatualizada sem consultar banco remoto |
| backend | Smoke in-memory com `@nestjs/testing` + `supertest`, `SupabaseService` substituído por resposta fictícia, sem cabeçalho Authorization | GET `/artistas` → 200 com chaves `id`, `cpf_cnpj`, `status`; PATCH `/artistas/1/status` → 200 com `status:Aprovado`. **Teste negativo de autorização falhou**: servidor aceitou cliente anônimo. Nenhum banco real foi acessado. |
| figma | `npm install --no-package-lock --no-audit --no-fund`, `npm run build` | Instalação passou; build inicial no sandbox falhou com `Access is denied` ao ler config; repetido fora dele, passou com aviso de chunk JS 581,89 kB. Sem scripts de lint/typecheck/teste no `figma/package.json`. |

O script `backend/package.json:17` inclui `eslint ... --fix`; por isso foi usado ESLint diretamente, sem correção automática. Não há teste E2E de fluxo de cadastro/aprovação/feedback nem teste de autorização negativa **versionado** no repositório (`backend/test/app.e2e-spec.ts` só espera `GET /` com “Hello World!”); o smoke acima foi pontual e não deixou arquivo. Testes de navegador, teclado, leitor de tela, axe, contraste, desempenho e implantação exigem ambiente executável/dados de teste e não foram aprovados por inspeção estática.

## Rotas do front-end

Fonte: `frontend/src/App.tsx:15-32`. `/` catálogo; `/cadastrar` cadastro; `/como-funciona` orientação; `/feedback` formulário; `/artista/login` login; `/artista/editar` edição sob `PrivateRoute`; `/admin/login` login; `/admin` painel sob `PrivateRoute`. `PrivateRoute.tsx:16-34` exige qualquer sessão Supabase, sem papel admin/artista. Não há rota de erro/404 explícita. `frontend/vercel.json` permite fallback de SPA.

## Inventário da API

Fontes: `backend/src/artistas/artistas.controller.ts:4-43`, `backend/src/feedback/feedback.controller.ts:4-23`, services correspondentes. **Nenhum endpoint tem guard, verificação de papel/ownership ou DTO/ValidationPipe.** As respostas de criação/atualização são registros completos retornados pelo Supabase; erros de serviço são `Error` genérico. `backend/src/app.controller.ts` declara `GET /`, mas `backend/src/app.module.ts:5-14` não registra `AppController`, portanto não é endpoint efetivo do módulo.

| Método / path | Auth/papel no servidor | Corpo / resposta real | RF/CT |
|---|---|---|---|
| GET `/artistas` | Nenhum | `select('*')` de todos os status, inclusive `cpf_cnpj`/email | RF-07, RF-09; CT acesso negativo |
| GET `/artistas/aprovados` | Nenhum | `select('*')` com `status=Aprovado`; inclui `cpf_cnpj`/email | RF-04/05; CT privacidade |
| POST `/artistas` | Nenhum | Corpo arbitrário; força `Pendente`, retorna registro; senha removida, possível criação de usuário Auth | RF-01/02; CT cadastro |
| PATCH `/artistas/:id/status` | Nenhum | `{status}` sem validação de entrada; retorna registro | RF-08/10; CT autorização negativa |
| PUT `/artistas/:id` | Nenhum | Corpo arbitrário; `forceStatus:true` controla manutenção de status; retorna registro | RF-09; CT ownership |
| DELETE `/artistas/:id` | Nenhum | Apaga definitivamente; `{message}` | RF-10; CT autorização negativa |
| GET `/feedbacks` | Nenhum | `select('*')` com nome/email/mensagem | RF-11; CT privacidade |
| POST `/feedbacks` | Nenhum | Corpo arbitrário, retorna registro | RF-11/02; CT feedback inválido |
| DELETE `/feedbacks/:id` | Nenhum | Apaga definitivamente; `{message}` | RF-11; CT autorização negativa |

## Integração HTTP do front

| Origem | Método / rota | Payload e tratamento | Lacuna |
|---|---|---|---|
| `Portal.tsx:74-91` | GET `/artistas/aprovados` | array de artistas; erro vira lista vazia | Não distingue erro de catálogo vazio; consome registro completo |
| `CadastroArtista.tsx:217-265` | POST `/artistas` | campos do formulário + `senha`; verifica `res.ok`, exibe erro | Auth `signUp` anterior pode falhar e o cadastro continua; nenhum token é enviado |
| `Feedback.tsx:28-55` | POST `/feedbacks` | form `{nome,email,tipo,nota,mensagem}`; verifica `res.ok` | Back não revalida; nota 0 pode ser enviada se mensagem válida |
| `AdminDashboard.tsx:75-117` | GET `/artistas`, GET `/feedbacks`, PATCH status | listas; GET falho vira vazio; PATCH não verifica `res.ok` | Nenhum Authorization header |
| `AdminDashboard.tsx:125-198` | PUT `/artistas/:id`, DELETE artista/feedback | PUT com `forceStatus:true`; DELETE verifica `res.ok` | Nenhum Authorization header |
| `EditarCadastro.tsx:80-120,221-249` | GET `/artistas`, PUT `/artistas/:id` | baixa todos e encontra e-mail no cliente; PUT sem token | Sem ownership no servidor; exposição de cadastros |

## Fluxos declarados como “Concluído”

| Fluxo em `DOCUMENTACAO_PROJETO.md` | Implementação localizada | Julgamento da auditoria |
|---|---|---|
| Cadastro em 4 etapas, pendente | `CadastroArtista.tsx:45,178-215,217-265,369-385`; `artistas.service.ts:30-61` força Pendente; SQL `artistas.status` | **Parcial**. UI e caminho de inserção existem, mas validação só parcial, Auth e cadastro não são transacionais; “Salvar rascunho” chama `handleSubmit` (`CadastroArtista.tsx:851-853`). Persistência remota não testada. |
| Catálogo/mural e perfil | `Portal.tsx:76-91,133-159,253-300,381-473`; `artistas.service.ts:18-27` filtra Aprovado | **Parcial**. UI existe, mas API pública devolve todos os campos, inclusive CPF/CNPJ; “Disponível” é fixo (`Portal.tsx:278-279`). Execução com dados não testada. |
| Busca/filtro | `Portal.tsx:133-141` filtra nome, área e tags no cliente; categorias em `Portal.tsx:12-28` | **Parcial**. Combinação funciona pela lógica local, mas busca não inclui `nome_artistico`; sem teste de desempenho/1000 registros; botão “Buscar” não tem ação específica (`Portal.tsx:191`). |
| Painel e CRUD | `AdminDashboard.tsx:75-198,205-222,357-487`; controllers/services | **Não confirmado como gestão segura**. CRUD de interface/API existe; qualquer cliente pode chamar endpoints e qualquer sessão pode abrir `/admin`. PATCH não confere status HTTP. |
| Feedback | `Feedback.tsx:24-55`; `AdminDashboard.tsx:89-94,164-180,400-415`; API e SQL | **Parcial/inseguro**. POST/consulta/exclusão existem, mas GET/DELETE são públicos no servidor e não há validação back-end. Persistência remota não testada. |

## Banco e Supabase

`backend/supabase.sql:4,26` começa com `DROP TABLE ... CASCADE` de `artistas` e `feedbacks`: **não executar em banco existente**, pois destrói registros. Recria tabelas, insere três artistas e três feedbacks de exemplo (`:43-52`), e desativa RLS (`:39-40`). O script não é migração incremental/versionada e não define policies, chaves de ownership, unicidade de e-mail, vínculo com `auth.users`, tipos/limites de mídia ou proteção por coluna. `backend/seed_artistas.sql` é seed adicional, não migration. Não há diretório Supabase/migrations/config TOML. `SupabaseService` usa `SUPABASE_ANON_KEY` no servidor (`supabase.service.ts:11-20`); o front embute uma chave **anon/publishable**, não `service_role`, em `frontend/src/lib/supabase.ts:3-6`. O risco resulta da combinação de acesso público e RLS desativado caso esse SQL tenha sido aplicado; o estado de RLS em produção não foi consultado. `artistas.service.ts:36-52` usa `service_role` opcional para criar usuário, sem rollback se a inserção posterior falhar. Não foi detectada chave `service_role` no front.

## Acessibilidade e diagramas

`ACESSIBILIDADE.md` encontra correspondência parcial: `index.html:2,7-8` tem idioma/título; `index.css:26-28,159-167` tem cores/foco; `Portal.tsx:93-131,389-403` implementa foco inicial, Escape e trap do modal; `CadastroArtista.tsx:354-385` tem progresso/etapas; logins têm labels e alertas; Navbar/Footer têm navegação rotulada. A afirmação “todos os inputs possuem label vinculado” não se sustenta em `Feedback.tsx:92-148` e `AdminDashboard.tsx:510-581`, que usam `<label>` sem `htmlFor`/`id`. Os modais administrativos em `AdminDashboard.tsx:500-621` não têm `role="dialog"`, `aria-modal`, trap ou foco inicial. O modal do catálogo não restaura o foco ao card após fechar (`Portal.tsx:93-131`). Não houve auditoria automatizada/manual WCAG; **conformidade 2.1 AA não comprovada**. `EditarCadastro.tsx`, `ArtistaLogin.tsx` existem, como dito no documento, mas seu controle de acesso é insuficiente.

`DIAGRAMAS_UML.md` e `DIAGRAMAS_MERMAID.md` descrevem o fluxo principal cadastro → análise → catálogo e feedback, que têm caminhos de código, mas omitem área/login/edição do artista, CPF/CNPJ, tags, disponibilidade e categoria múltipla serializada em `area_atuacao` texto (`CadastroArtista.tsx:87-93,200-215`). Mermaid diz que a ficha só aparece no mural depois da aprovação; o filtro existe em `artistas.service.ts:18-27`, porém consulta pública completa existe em `/artistas`. Os diagramas mostram “portaria” para equipe, mas a API não implementa autorização. Esquemas conceituais simplificados não representam o SQL atual. `CONFLITOS_E_DECISOES.md` foi atualizado com esses achados, sem alterar a baseline WCAG nem decidir regras de CPF/CNPJ ou escopo de autenticação do artista.

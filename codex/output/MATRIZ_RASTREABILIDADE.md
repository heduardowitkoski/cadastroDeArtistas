# Matriz de rastreabilidade — auditoria e contenção P0 de 06/10/2026

## Estado atual — 23/10/2026

A evidência atual prevalece sobre as tabelas históricas abaixo. Estado completo A-01–A-25 em BACKLOG_PRIORIZADO.md; inventário documental em DOCUMENTATION_RECONCILIATION_REPORT.md.

| RF/RNF/CT; achado | Código/evidência atual | Resultado e pendência |
|---|---|---|
| RF-04/05; A-03/A-23; CT catálogo pós-RLS | GET novo Render /artistas/aprovados; allowlist/mapper backend | 200, array, campos privados ausentes; nenhuma linha impressa. Novo Render operacional para leitura |
| RNF-02; A-03; CT Data API/RLS | Postcheck manual informado: RLS true nas duas tabelas, zero policies, grants browser/sequences removidos, service_role preservado | SQL não repetido; authenticated direto e contagens/schema finais ainda precisam evidência formal |
| RF-01/04/05/07/08/09/10/11; A-22/A-24; CT destino API | apiConfig.ts exporta localhost em DEV e novo Render em PROD; cinco consumidores diretos importam configuração; AdminDashboard usa adminFetch | Fonte e bundle sem URL antiga; build com VITE_API_URL antiga não a reintroduz. Publicação oficial pendente |
| RNF-05/07; A-10/A-11; CT gates | Front: lint, tsc, 3 testes, build; back: 48 E2E/8 unit, tsc, build, lint sem fix | Todos passam; aviso de chunk JS grande. Mocks não comprovam escritas reais |
| RF-07/08/09/10/11; A-01/A-04 | Guards admin e JWT só para auth; cliente DB separado | Código backend não alterado; homologar usuário comum/admin reais; autoedição continua bloqueada |
| RNF-02; A-25; CT secrets/Git/bundle | .env removidos somente do índice, arquivos preservados; scanner sem literal secreto no índice ou bundle | HEAD local anterior contém Secret, origin/main local sem backend/.env; rotação e histórico seguro pendentes |
| RNF-06; A-16; CT reconciliação | Inventário de 40 MD/0 MDX; banners datados em relatórios, guias e controles atualizados | Histórico preservado; não declarar WCAG, upload ou rascunho concluídos por documentação |

API pública mantém allowlist, POST artista mantém Pendente e endpoints administrativos mantêm Bearer/admin. Nenhum contrato, RLS, grants, schema ou regra CPF/CNPJ foi alterado. Escrever dados de teste e alterar status em produção não fez parte desta rodada.

## Histórico preservado das rodadas anteriores


## Rodada backend pós-RLS / Render — 07/10/2026 (estado mais recente)

O RLS e os testes negativos da Data API foram **informados como realizados pelo demandante**; esta rodada não os repetiu. Linhas posteriores deste arquivo registram estados históricos. Relatório: `BACKEND_POST_RLS_RENDER_REPORT.md`.

| RF/RNF/CT; achado | Código e teste desta rodada | Estado / prova pendente |
|---|---|---|
| RNF-02; A-03; CT acesso Data API direto | Postcheck manual informado: RLS ligado nas duas tabelas, zero policies públicas, `anon`/`authenticated` sem CRUD/sequences, Publishable Data API negada. Nenhuma migration nesta rodada. | **Banco protegido segundo evidência manual; API Render P0 ainda 500 relatado.** GET positivo pelo backend Secret e POST feedback reais pendentes. |
| RF-04/05/11; A-03/A-23; CT catálogo/feedback pós-RLS | `ArtistasService` e `FeedbackService`: 10/10 `.from(...)` via `getDatabaseClient()` Secret; `SupabaseAuthGuard` usa só `getAuthClient().auth.getUser(token)` Publishable. E2E de erros devolvem 503 genérico/log restrito. | 48 E2E simulados passam; GET real local foi 503, `code=unknown, status=0`, falha antes de resposta HTTP. Render/Secret/RLS positivo não comprovados. |
| RF-07/08/09/10; A-01/A-02; CT admin/sem JWT no banco | `AdminGuard` continua exigindo `app_metadata.role=admin`; busca em `backend/src` não encontrou sessão/JWT/Bearer anexado ao cliente de banco. | Autorização local simulada passa; Auth/admin real e deploy Render pendentes. |
| RNF-02/07; A-23/A-10; CT fail-closed/deploy | Unitários: dois clientes distintos, ordem Publishable/Secret, `persistSession:false`, ausência das três variáveis falha sem fallback legado. `git check-ignore` confirma `.env`; build/typecheck/lint passam. | 8 unitários + 48 E2E; verificar env/Environment Group/commit efetivo no Render sem expor chaves. |

## Rodada front-end UX/acessibilidade/responsividade — 07/10/2026 (estado mais recente)

Esta seção prevalece sobre a rodada A-03 e os registros históricos abaixo. Teste em navegador usou API/Auth local simulados; backend, Supabase Auth/configuração, banco e RLS não foram alterados. Detalhes: `FRONTEND_UX_A11Y_RESPONSIVE_REPORT.md` e `FRONTEND_MANUAL_TEST_CHECKLIST.md`.

| RF/RNF/CT; achado | Código e teste desta rodada | Estado / prova pendente |
|---|---|---|
| RF-04/05/06; CT catálogo loading/erro/vazio; A-09 | `Portal.tsx` verifica HTTP e formato do GET aprovado; erro aparece separado de vazio, com tentar novamente; contadores usam `—` enquanto pendentes. Browser local: 1 artista fictício, perfil aberto; API indisponível exibiu erro próprio. | **Confirmado localmente** para esses estados; GET real Render/Supabase e desempenho de busca pendentes. |
| RF-08/09/10; CT falha de aprovação/edição/exclusão; A-09 | `AdminDashboard.tsx` verifica `res.ok`, anuncia erro e impede ações repetidas enquanto aguarda. Browser local: PATCH 500 conservou 1 pendente e mostrou erro. | **Parcial**: PUT/DELETE, sucesso real e atualização persistida precisam de homologação. |
| RF-07/08/11; CT loading/erro/vazio admin; A-09 | `AdminDashboard.tsx` separa GET de artistas/feedbacks; contadores não exibem zeros prematuros; há botão de tentar novamente. Browser local: erro dos dois GETs e feedback vazio foram distintos. | **Confirmado localmente** com respostas simuladas; integração remota pendente. |
| RNF-01/04; CT larguras/menu; A-17 | `AdminDashboard.css`, `Portal.css`, `Cadastro.css`: menu móvel admin, ações flexíveis e modais contidos. Browser local mediu `scrollWidth <= innerWidth` em 320/375/768/1024/1440 px para `/`, `/cadastrar`, `/feedback`, `/como-funciona`, `/admin/login`, `/admin`. | **Parcial**: inspeção visual completa, zoom real 200% e usuários pendentes. |
| RNF-04; CT foco/modal/form; A-12/A-13 | `useDialogFocus.ts`, `Portal.tsx`, `AdminDashboard.tsx`, `CadastroArtista.tsx`: foco inicial/retorno, Escape/Tab, labels e primeiro inválido. Browser local: foco voltou ao card e ao botão Editar; avanço inválido focou `cad-nome`. | **Parcial**: leitor de tela, contraste, exclusões e percurso integral de teclado pendentes; WCAG 2.1 AA não declarada como comprovada. |
| RNF-02/06; A-03/A-22; CT config/deploy | Ao inspecionar `frontend/src/lib/supabase.ts` nesta rodada, foram encontrados fallbacks hardcoded de URL e chave publishable. A linha histórica abaixo que afirma “lê só” variáveis está desatualizada. | **P1 A-22 aberto**; remover fallback/configurar Vercel em rodada própria. **P0 A-03 permanece bloqueado**. Nenhuma chave Secret foi posta no front nesta rodada. |


## Rodada A-03 — preparação final, sem aplicação (07/10/2026)

Esta seção é o estado mais recente. O navegador integrado confirmou página de produção Vercel em branco e log com erro de configuração Supabase; nenhuma configuração do painel ou do banco foi alterada.

| ID / CT | Evidência atual | Estado / prova pendente |
|---|---|---|
| RNF-02; A-03; CT Data API direta | `RLS_MIGRATION_FINAL.sql` prepara RLS nas duas tabelas e REVOKE para `anon`/`authenticated` em tabelas e sequences, com precheck/postcheck e assertivas transacionais. `RLS_ACCESS_MATRIX.md` registra o acesso pretendido. | **P0 bloqueado, não resolvido.** Falta aplicação manual, RLS/grants reais pós-migration, sete testes negativos pela Publishable key, contagem/estrutura preservadas e teste positivo do cliente Secret key. |
| RF-04/05/07/08/09/10/11; CT rotas públicas/admin | `ArtistasController` mantém GET aprovados e POST públicos, cinco rotas admin; `FeedbackController` mantém POST público e GET/DELETE admin. `SupabaseAuthGuard` usa Publishable para `auth.getUser`, `AdminGuard` exige `app_metadata.role=admin`, services usam cliente Secret key. | 46 E2E locais com Supabase simulado passaram em 07/10/2026; integração remota antes/depois da migration pendente. |
| RNF-02/RNF-06; A-22; CT deploy Vercel | `frontend/src/lib/supabase.ts` lê só `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`; `.env.example` vazio e `frontend/vercel.json` rewrite SPA. Produção abriu em branco; log do browser confirmou erro dessas variáveis. | **Bloqueia aplicação do RLS.** Configurar Production no painel, conferir `VITE_API_URL`/Root Directory, fazer novo deploy e validar páginas publicadas. Build local com valores fictícios passou, sem provar produção. |
| RF-01/02/11; A-05/A-06; CT cadastro/feedback | Frontend não usa `.from()`/`.rpc()` para artistas/feedbacks; `CadastroArtista` envia POST NestJS. DTOs/ValidationPipe e fluxo Auth+ficha são internos ao backend. | 46 E2E backend, 6 unit backend, 3 testes front passaram; cadastro/feedback reais via NestJS após RLS ainda pendentes. |

Comandos, bloqueadores e limites: `A03_RLS_FINAL_REPORT.md`; execução manual futura: `A03_RLS_MANUAL_TEST_CHECKLIST.md`.

## Rodada A-05/A-06 — validação e consistência local (06/10/2026)

Esta seção prevalece sobre os registros históricos abaixo. Os testes usam Supabase simulado; não houve alteração nem teste no banco remoto.

| ID / CT | Implementação e evidência | Resultado / limite |
|---|---|---|
| RF-01/RF-02; CT cadastro válido, inválido, Pendente | `backend/src/validation/configure-validation.ts` ativa `ValidationPipe` global; `CreateArtistaDto` valida nome, e-mail, contato, CPF/CNPJ, campos opcionais e senha; `ArtistasService.create` força Pendente. `frontend/src/lib/cadastroValidation.ts` e `CadastroArtista.tsx` aplicam máscaras, mensagens e bloqueio por etapa. | 46 E2E locais e 3 testes front passaram. CPF/CNPJ obrigatório continua só no formulário, conforme regra atual; C-04 permanece pendente. |
| RF-01/RF-07; CT Auth + ficha, falha parcial, duplicidade | `CadastroArtista.tsx` envia somente POST; `ArtistasService.create` cria Auth no servidor, depois ficha; remove apenas UID recém-criado quando o banco retorna erro explícito. Resposta ambígua exige suporte sem remoção automática. | E2E cobrem sucesso, Auth falho/duplicado, banco falho, compensação falha e resposta ambígua. Integração real não testada; confirmação de e-mail e vínculo UID–artista seguem em C-02. |
| RF-02/RF-08; CT status válido/inválido | `UpdateStatusDto` limita `Pendente`, `Aprovado`, `Rejeitado`; `UpdateArtistaDto` separa atualização administrativa. | E2E retornam 400 para valor arbitrário e 200 para valor válido com admin simulado. |
| RF-11/RF-02; CT feedback válido/inválido | `CreateFeedbackDto` valida tipo, nota 1–5, mensagem 10–2000 e contato opcional; `Feedback.tsx` exige nota antes do envio. | E2E cobrem limites, extras e payload válido; persistência real não verificada. |
| RNF-02/RNF-07; CT entradas extras e privacidade | `forbidNonWhitelisted` rejeita `status`, `id`, `forceStatus` no POST público e extras no feedback; backend mantém guard admin e cliente privilegiado. | E2E 400/401/403 passaram; A-03/RLS direto continua P0 aberto. |
| CPF/CNPJ; C-04 | `documento.ts` e validação front verificam CPF, CNPJ numérico e alfanumérico (12 posições + 2 DVs) segundo [manual da Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf). | Unit, front e E2E aprovam o exemplo oficial `12.ABC.345/01DE-35` e rejeitam DVs inválidos. Sem mudança de schema. |

Comandos e contagens da rodada: `codex/output/A05_A06_VALIDATION_REPORT.md`.

## Registro histórico: acesso Supabase server-side e RLS candidata (antes de A-05/A-06)

| ID / CT | Evidência atual | Verificação / status |
|---|---|---|
| RF-07; CT 401/403/admin; RNF-02 | `supabase-auth.guard.ts` usa `getAuthClient()` anon para `auth.getUser(token)`; `artistas.service.ts` e `feedback.service.ts` usam `getDatabaseClient()` service role; seis rotas mantêm `@AdminOnly()` | 24 E2E locais passaram com mocks distintos; integração real e configuração servidor pendentes. |
| RF-01/04/05/11; CT públicos e privacidade | `public-artista.ts` allowlist, status Pendente forçado, POST feedback anônimo; banco lido/escrito apenas via cliente servidor | E2E local passou; `service_role` não aparece no retorno público simulado; persistência e isolamento real não comprovados. |
| RNF-02; CT Supabase direto/RLS | Informação manual do demandante: 11 artistas, 3 feedbacks, RLS false em ambos, zero policies, 56 grants, `anon` amplo em artistas. `RLS_MIGRATION_CANDIDATE.sql` preparada e **não executada** | **A-03 P0 aberto**. Faltam inventário de dependências/grants, backup, aplicar em ambiente controlado e testes negativos diretos à Data API. |
| C-02/RF-09; CT ownership | PUT permanece administrativo e `/artista/editar` indisponível | Autoedição pendente de decisão e vínculo UID–artista. |


Fonte de IDs: `codex/context/ESCOPO_E_TESTES.md`. **Parcial** = caminho de código presente com lacuna demonstrada; **não comprovado** = requisito depende de teste/decisão/ambiente; **ausente** = não localizado no código/SQL; **confirmado localmente** = execução local suficiente para o aspecto indicado. Nenhum RF que dependa de banco remoto foi confirmado de ponta a ponta.

## Registro histórico após a contenção P0 (antes de A-05/A-06)

Esta tabela prevalece sobre as linhas históricas da auditoria inicial abaixo. Os testes usam Supabase simulado, sem conexão a banco remoto.

| ID / CT | Código e contrato atualizado | Teste executado | Status atual |
|---|---|---|---|
| RF-01; CT cadastro público/Pendente | `artistas.service.ts` força Pendente e devolve `{id,status}` | Baseline P0: extras eram ignorados e retornavam 201/Pendente; após A-06 retornam 400 por `forbidNonWhitelisted`. | Contenção P0 histórica; veja seção A-05/A-06 acima para o contrato atual. |
| RF-04/05; CT aprovado público/privacidade | `public-artista.ts` e `artistas.service.ts` selecionam e mapeiam somente campos de mural/perfil | GET `/artistas/aprovados` anônimo → 200; CPF/CNPJ, e-mail, status e data ausentes | Contenção da API confirmada localmente; exposição direta no Supabase depende de A-03/RLS |
| RF-07; CT sem sessão/sem papel/admin | `auth/` valida Bearer com `auth.getUser(token)` e exige `app_metadata.role=admin`; `adminApi.ts` envia token | Seis endpoints admin → 401 sem token, 403 com usuário comum, 200 com admin simulado; token inválido → 401 | Autorização da API confirmada localmente; provisionamento de admin e integração remota pendentes |
| RF-09; CT autoedição/ownership | PUT artista só admin; `/artista/editar` mostra indisponibilidade e não chama API; `EditarCadastro.tsx` preservado | PUT → 401 sem token, 403 com artista sem papel admin, 200 com admin simulado | Acesso indevido contido; autoedição **bloqueada** até C-02/ownership |
| RF-11; CT feedback público/privado | POST feedback permanece público; GET/DELETE usam `@AdminOnly()` | POST anônimo → 201; GET/DELETE → 401 anônimo, 403 usuário comum, 200 admin simulado | Contenção da API confirmada localmente; privacidade direta no banco depende de A-03/RLS |
| RNF-02; CT banco/policies | `DOCUMENTACAO_PROJETO.md` e cabeçalho de `backend/supabase.sql` alertam que bootstrap apaga tabelas e desativa RLS | SQL não executado; banco remoto não consultado | A-03 permanece P0; não há comprovação de proteção no Supabase real |

## Baseline da auditoria inicial (antes da contenção)

| ID | Código / contrato / persistência | Teste existente e CT prioritário | Status e evidência |
|---|---|---|---|
| RF-01 Cadastro autônomo | `CadastroArtista.tsx:45,200-265`; POST `/artistas` em `artistas.controller.ts:18-21`; `artistas.service.ts:30-61` força Pendente; `supabase.sql:6-23` | Nenhum teste de cadastro; CT válido/Pendente | Parcial. Auth `signUp` pode falhar e POST prossegue (`CadastroArtista.tsx:226-239`); persistência remota não verificada. |
| RF-02 Validação | Front: `CadastroArtista.tsx:176-185`, `Feedback.tsx:24`; back recebe `Record<string,unknown>` (`artistas.controller.ts:19-20`, `feedback.controller.ts:13-15`) | Nenhum CT inválido | Falha. Sem DTO, `ValidationPipe` ou validação server-side; SQL só exige alguns `NOT NULL`/CHECK (`supabase.sql:6-35`). |
| RF-03 Mídias/portfólio | Foto convertida em data URL (`CadastroArtista.tsx:113-165`); demais arquivos viram apenas `file.name` (`:167-174`), fora de `buildPayload` (`:200-215`); sem tabela/bucket | Nenhum CT formato/10 MB/vídeo 30 s | Parcial/decisão de escopo. UI sugere upload, mas arquivo de galeria/vídeo/áudio/documento não persiste; limites não implementados. |
| RF-04 Catálogo | GET `/artistas/aprovados` (`artistas.controller.ts:13-16`); `.eq('status','Aprovado')` (`artistas.service.ts:18-27`); `Portal.tsx:76-91` | Nenhum CT aprovado/pendente/rejeitado | Parcial. Filtro no código, sem teste executável com banco. Resposta ainda contém campos privados por `select('*')`. |
| RF-05 Detalhes | Modal `Portal.tsx:381-473`; resposta pública de `artistas.service.ts:20-26` | Nenhum CT dados públicos | Falha de privacidade. UI apresenta só alguns campos, API entrega todos (`cpf_cnpj` incluído em `supabase.sql:10`). |
| RF-06 Busca | `Portal.tsx:133-141` busca nome/área/tags e combina categoria; `:12-28` categorias | Nenhum CT nome/categoria/tag/combinação/negativo | Parcial. Não busca `nome_artistico`; filtro é client-side e depende de carregar catálogo inteiro. |
| RF-07 Auth/acesso | `Login.tsx:14-24`, `PrivateRoute.tsx:16-34`; controllers sem guards; `AdminDashboard.tsx:75-98` sem bearer | Nenhum CT usuário sem papel/sem sessão no servidor | Falha crítica. Qualquer sessão passa no front e endpoints administrativos não checam identidade/papel. |
| RF-08 Aprovação | `AdminDashboard.tsx:105-117`; PATCH `/artistas/:id/status`; `artistas.service.ts:65-76` | Nenhum CT aprovação/persistência | Parcial/inseguro. Estado pode ser escrito sem auth; front não confere `res.ok`; persistência não verificada. |
| RF-09 Edição | Admin PUT com `forceStatus` (`AdminDashboard.tsx:125-148`); artista PUT (`EditarCadastro.tsx:221-249`); `artistas.service.ts:79-94` | Nenhum CT admin/ownership/reanálise | Falha crítica. GET de todos os registros e seleção por e-mail no cliente (`EditarCadastro.tsx:82-93`); qualquer cliente pode PUT, inclusive `forceStatus:true`. Edição de aprovado força Pendente apenas se cliente não usar essa flag. |
| RF-10 Exclusão/desaprovação | DELETE em `artistas.controller.ts:39-42`; status Rejeitado em `AdminDashboard.tsx:472-475`; SQL CHECK de status | Nenhum CT distinção/desaparecimento do catálogo | Parcial/inseguro. Desaprovação usa Rejeitado, exclusão apaga; ambos sem autorização no servidor. |
| RF-11 Feedback | `Feedback.tsx:24-55`; GET/POST/DELETE `/feedbacks` (`feedback.controller.ts:4-22`); tabela `supabase.sql:26-36` | Nenhum CT anônimo/identificado/privado/exclusão | Parcial/inseguro. GET e DELETE públicos; back não valida nota/mensagem. Front aceita `nota:0` se mensagem tiver 10 caracteres, apesar do texto 1–5. |

| ID | Evidência | Teste necessário | Status |
|---|---|---|---|
| RNF-01 Responsividade | Media queries em `Portal.css:552-585`, `Cadastro.css:499-503`, `AdminDashboard.css:325-329` | Navegador em larguras/zoom e reflow | Não comprovado |
| RNF-02 Segurança/LGPD | `artistas.service.ts:12,23`; `feedback.service.ts:12`; `supabase.sql:39-40`; `main.ts:10-25` | Auth negativa, RLS real, inspeção de respostas, consentimento | Falha demonstrada no código; ambiente remoto não verificado |
| RNF-03 ≤5 s | Busca client-side `Portal.tsx:133-141` e GET completo | ~1000 registros fictícios, medir catálogo/busca | Não comprovado |
| RNF-04 Usabilidade | Telas presentes | Tarefas com artistas/servidores/público | Não comprovado |
| RNF-05 Manutenibilidade | Services/controllers; lint back com 19 erros | Lint e revisão | Parcial; `npx eslint ...` falhou |
| RNF-06 Documentação | `DOCUMENTACAO_PROJETO.md`, acessibilidade, diagramas; READMEs são templates | Conferência de manuais e implantação | Parcial; documentação diverge do código |
| RNF-07 Testabilidade/rastreabilidade | Um teste unitário de Hello World; E2E também Hello World | Integração e E2E por RF | Falha; `npm run test:e2e -- --runInBand` falhou sem config |
| RNF-08 Escalabilidade | API usa `select('*')`; front filtra array completo | Carga/paginação/latência | Não comprovado |
| RNF-09 Exportação admin | Nenhuma rota/ação identificada em `artistas.controller.ts`, `AdminDashboard.tsx` | Decisão de escopo e CT se mantido | Ausente, condicionado a decisão |

## Casos de teste prioritários: cobertura real

| Grupo CT de `ESCOPO_E_TESTES.md` | Cobertura no repositório | Execução nesta auditoria |
|---|---|---|
| Cadastro válido, Pendente, campos vazios, e-mail/telefone/link, senha, bio | Nenhuma spec de domínio em `frontend/` ou `backend/` | Não executável como fluxo sem banco de teste |
| Catálogo aprovado/pendente/rejeitado/desaprovado e acesso anônimo | Nenhuma spec | Não executável como fluxo sem banco de teste |
| Busca exata/parcial/categoria/combinação/tag e exclusão de não aprovados | Nenhuma spec | Não executável como fluxo sem banco de teste |
| Login válido/inválido, acesso direto, usuário sem papel, aprovação/exclusão | Nenhuma spec versionada | Smoke com SupabaseService fictício e cliente sem Authorization: GET `/artistas` e PATCH `/artistas/1/status` retornaram 200; demais cenários não executados |
| Feedback anônimo/identificado/validação/privacidade/exclusão | Nenhuma spec | Não executável como fluxo sem banco de teste |
| Integração Vercel → Render → Supabase; segurança/RLS | Nenhuma spec/config de homologação | Não executada em ambiente remoto |
| Performance com ~1000 registros e usuários reais | Nenhum fixture/roteiro executável | Não executada |
| Unit/E2E existentes | `backend/src/app.controller.spec.ts` e `backend/test/app.e2e-spec.ts` testam somente Hello World | Unit: 1/1 passou. E2E: falhou sem configuração; repetição com URL/chave locais fictícias recebeu 404 em `/`, confirmando spec desatualizada |

## Gates locais da auditoria inicial

Front: `npm ci`, `npm run lint`, `npx tsc -b --noEmit`, `npm run build` passaram; lint com aviso e build com aviso de tamanho. `npm test` não existe. Back: `npm ci`, `npx tsc --noEmit -p tsconfig.json`, `npm run build` e `npm test -- --runInBand` passaram; lint sem fix falhou com 19 erros/1 aviso; E2E falhou sem variáveis Supabase e também com configuração fictícia por rota ausente. Protótipo `figma/`: instalação sem lockfile e build passaram fora do sandbox; não há scripts de lint/typecheck/teste. Consulte `ESTADO_ATUAL.md` e `BACKLOG_PRIORIZADO.md` para limites e prioridade.

Os gates após a contenção e os 24 testes de integração estão registrados em `P0_SECURITY_FIX_REPORT.md`.

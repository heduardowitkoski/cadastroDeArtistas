# Backlog priorizado — auditoria e contenção P0 de 06/10/2026

## Rodada backend pós-RLS / Render — 07/10/2026 (estado mais recente)

Esta seção atualiza o estado operacional após o **postcheck de RLS informado pelo demandante**; as seções anteriores são evidência histórica e não devem ser interpretadas como estado remoto atual. Detalhes e limites: `BACKEND_POST_RLS_RENDER_REPORT.md`.

| ID | Prioridade / estado atual | Evidência e próximo passo |
|---|---|---|
| A-03 | **P0: RLS aplicado/validado manualmente; API publicada ainda bloqueada** | Demandante confirmou `rowsecurity=true`, zero policies públicas, grants/sequences restritos e tentativas Publishable Data API negadas. Render responde 500 em GET aprovados/POST feedbacks segundo relato. GET pelo backend local respondeu 503 com Supabase `code=unknown, status=0` (sem resposta HTTP externa). Conferir env/commit/redeploy Render e obter GET 200; não alterar RLS nem executar migration. |
| A-23 | **P2: configuração de código comprovada; deploy pendente** | `SupabaseService` usa Publishable só para Auth e Secret só para banco, sem fallback; 8 unitários passam. `backend/.env.example` tem três nomes vazios e `.env` é ignorado. Operador precisa verificar as três variáveis no Render e eventual Environment Group, sem divulgar valores. |
| A-10 | **P2: cobertura local ampliada; integração real pendente** | 48/48 E2E e 8/8 unitários passaram, além de typecheck/build/lint dos arquivos alterados. E2E usam Supabase simulado; GET real local falhou por transporte, sem prova de escrita/credencial. |
| A-01/A-02 | **P0 da exposição direta contido segundo postcheck; homologação API pendente** | Data API Publishable negada segundo demandante. Guards e 10/10 chamadas `.from(...)` seguem no cliente correto. Confirmar fluxos publicados após restauração do backend. |

**Nota de precedência:** referências abaixo a RLS "não aplicado", 46 E2E/6 unit e frontend com fallback são registros de rodadas anteriores; não substituem este estado nem relatórios específicos posteriores de frontend.

## Rodada front-end UX/acessibilidade/responsividade — 07/10/2026 (estado mais recente)

Relatório e evidência: `FRONTEND_UX_A11Y_RESPONSIVE_REPORT.md`; roteiro pendente: `FRONTEND_MANUAL_TEST_CHECKLIST.md`. Esta seção prevalece sobre as linhas históricas abaixo. Backend, SQL, RLS, dados e Supabase Auth não foram alterados nesta rodada.

| ID | Prioridade / estado | Evidência e próximo passo |
|---|---|---|
| A-03 | **P0 bloqueado, sem mudança** | RLS/grants remotos e deploy continuam pendentes. Ver seção A-03 abaixo. |
| A-09 | **P1 corrigido localmente; integração pendente** | `AdminDashboard.tsx` verifica `res.ok` no PATCH, separa loading/error/empty de artistas e feedbacks, evita ação duplicada e mantém item/modal em falha. `Portal.tsx` separa erro e vazio. Browser local: PATCH 500 mostrou erro e reteve 1 cadastro; GET indisponível exibiu erro. Repetir com Render/Supabase de homologação e cenários de sucesso/falha de PUT/DELETE. |
| A-12 | **P2 corrigido localmente; auditoria assistiva pendente** | `AdminDashboard.tsx` liga labels a IDs e adiciona `dialog`/`alertdialog`; `useDialogFocus.ts` cuida de foco, Tab e Escape. Browser local confirmou labels, foco inicial e retorno ao Editar. Executar leitor de tela, contraste e todos os modais no checklist. |
| A-13 | **P2 corrigido localmente; percurso completo pendente** | `Portal.tsx` devolve foco ao card do artista ao fechar por Escape; `CadastroArtista.tsx` foca primeiro inválido. Browser local confirmou ambos. Testar Tab/Shift+Tab e outros modos de fechamento. |
| A-17 | **P2 parcial** | CSS móvel e menu admin ajustados; navegador mediu ausência de scroll horizontal em 320/375/768/1024/1440 px nas rotas públicas e no admin simulado. Zoom real 200%, leitor de tela, usuários e ~1000 registros seguem sem medição. |
| A-22 | **P1 aberto** | Ao ler `frontend/src/lib/supabase.ts`, ainda há fallback hardcoded de URL e chave publishable, divergente da solicitação anterior. Não foi alterado nesta rodada por exclusão explícita de Supabase Auth/configuração. Corrigir em rodada própria junto da configuração Vercel, sem incluir segredo no front. |


## Rodada A-03 — 07/10/2026 (estado mais recente)

| ID | Prioridade / estado | Evidência e próximo passo |
|---|---|---|
| A-03 | **P0 bloqueado; não resolvido** | `RLS_MIGRATION_FINAL.sql` e `A03_RLS_MANUAL_TEST_CHECKLIST.md` preparados localmente, **não executados**. No browser integrado, produção Vercel abriu em branco e o log confirmou ausência de `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`. Corrigir variáveis no painel, redeployar, validar frontend e Render, revisar precheck/backup e só então aplicar manualmente/testar Data API e API NestJS. |
| A-22 | **P1 bloqueador de deploy** | `frontend/src/lib/supabase.ts` lê os dois nomes corretos sem fallback; `frontend/vercel.json` contém rewrite SPA e `vite.config.ts` não impede `VITE_*`. Configuração Production efetiva não é versionada; no painel Vercel, definir URL e Publishable key, conferir `VITE_API_URL` para Render e Root Directory `frontend`, fazer novo deploy. Preview/Development se utilizados. Nenhum valor de chave no código. |
| A-23 | **P2 validação operacional** | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` são os únicos nomes em `backend/.env.example`. Confirmar presença e operação no Render sem exibir valores; verificar Site URL do Supabase Auth e testes negativos diretos. |

Estado de encerramento permitido desta rodada: **bloqueado pelo deploy Vercel e por validação remota ainda não realizada**. A-03 só será resolvido após critérios completos do checklist.

## Estado após A-05/A-06 (06/10/2026)

Esta seção é o estado mais recente; as tabelas seguintes preservam evidências históricas de antes desta rodada.

| ID | Prioridade / estado | Evidência e próximo passo |
|---|---|---|
| A-03 | **P0 histórico; ver bloqueio acima** | RLS/grants remotos permanecem como informados pelo demandante na auditoria; a migration final foi preparada em 07/10/2026 e ainda não aplicada. |
| A-05 | **P1 mitigado localmente; integração real pendente** | `CadastroArtista.tsx` deixou de criar Auth; `ArtistasService.create` cria Auth e ficha Pendente, compensa erro explícito de inserção apagando só o UID novo; 46 E2E locais cobrem sucesso/falhas. Resposta ambígua, falha de compensação, confirmação de e-mail e ausência de vínculo UID–artista exigem fluxo operacional/decisão C-02 e teste de integração em homologação. |
| A-06 | **P1 implementado localmente; homologação pendente** | `ValidationPipe`, quatro DTOs, validação CPF/CNPJ inclusive alfanumérico, máscaras e feedback/status cobertos por E2E/unit/front. Rodar fluxos reais com dados fictícios e verificar registros legados no editor admin; regras de negócio C-04 continuam pendentes. |
| A-10 | **P2 parcial** | Cobertura local agora inclui 46 E2E backend, 6 unit backend e 3 testes de funções puras front. Ainda faltam navegador/teclado, Supabase real e E2E de fluxo completo em homologação. |
| A-20 | **P1 aberto** | Conta Auth é criada sem confirmar endereço (`email_confirm:false`) e não existe, nesta rodada, entrega de confirmação; a Área do Artista continua indisponível. Definir e testar verificação de e-mail e acesso antes de habilitar login/ownership. Não confirmar endereço sem prova de posse. |
| A-21 | **P2 aberto** | DTO admin valida o estado recebido e pode rejeitar registros legados com contato/documento inválido quando editados sem corrigir tais campos. Avaliar dados reais e UX administrativa em homologação, sem relaxar validação pública. |

Relatório detalhado: `codex/output/A05_A06_VALIDATION_REPORT.md`.

## Atualização da rodada de acesso Supabase (06/10/2026)

| ID | Pri/estado | Evidência e próximo passo |
|---|---|---|
| A-03 | **P0 aberto; migração preparada, aplicação pendente** | Demandante confirmou 11 artistas/3 feedbacks, RLS false nas duas tabelas, 0 policies, 56 grants e privilégios amplos de `anon` em artistas. `RLS_MIGRATION_CANDIDATE.sql` e plano locais foram criados; nada remoto executado. Inventariar grants/dependências/Data API, revisar candidata, fazer backup, configurar chave servidor, aplicar em ambiente controlado e testar caminhos positivos pela API e negativos diretamente no Supabase. |
| A-01/A-02 | **P0 contido na API; exposição direta persiste até A-03** | Auth e DB agora são clientes separados em `SupabaseService`; banco usa service role apenas no back. 24 E2E locais preservados. Validar integração real e que nenhum caminho direto ao Supabase expõe tabela/RPC/view. |
| A-05/A-06 | **P1 tratado localmente; integração real pendente** | Fluxo Auth + ficha e DTOs/ValidationPipe foram implementados nesta rodada. Ver seção A-05/A-06 acima e relatório; confirmação por e-mail, resposta ambígua e testes com Supabase real continuam pendentes. |
| A-15 | **P2 parcial** | `backend/.env.example` criado com três variáveis vazias. Documentar/configurar variáveis seguras no Render em etapa de implantação; `codex/` segue ignorado por `.gitignore:186`. |


Prioridades conforme `codex/prompts/00_AUDITORIA_ESTADO_REAL.md`: P0 segurança/perda de dados/auth/build inviável; P1 requisito principal; P2 qualidade/acessibilidade/inconsistência; P3 melhoria/decisão de escopo. A tabela registra o estado após a contenção da API. Nenhuma operação foi feita no banco remoto. `backend/supabase.sql` não deve ser executado em base existente.

| ID | Pri | Achado e evidência concreta | RF/RNF/CT | Próximo passo proposto |
|---|---|---|---|---|
| A-01 | **P0 contido na API; validar integração** | Antes, GET `/artistas` e PATCH status anônimos retornavam 200. Agora `@AdminOnly()` exige Bearer validado com Supabase Auth e `app_metadata.role=admin`; `adminApi.ts` envia token. `backend/test/app.e2e-spec.ts`: seis rotas 401 sem token, 403 usuário comum, 200 admin simulado. | RF-07/08/09/10/11, RNF-02; CT acesso negativo/admin | Provisionar admins por canal confiável; validar com Supabase Auth real em ambiente controlado. CORS/PrivateRoute não substituem a autorização. |
| A-02 | **P0 parcialmente contido; RLS pendente** | GET público de aprovados usa `PUBLIC_ARTISTA_COLUMNS` e mapper (`public-artista.ts`, `artistas.service.ts`); teste garante ausência de CPF/CNPJ, e-mail, status e data. GET completo e feedbacks exigem admin. Demandante confirmou RLS desligado e grants amplos de `anon`, portanto a proteção da API ainda pode ser contornada via Data API. | RF-04/05/11, RNF-02; CT privacidade | Aplicar e validar a migração candidata de A-03 em ambiente controlado, inclusive testes negativos diretos. |
| A-03 | **P0 aberto; candidata preparada** | Demandante confirmou RLS false em `artistas`/`feedbacks`, 0 policies, 56 grants e 11/3 registros. `RLS_MIGRATION_CANDIDATE.sql` foi preparada e não executada; `backend/supabase.sql` ainda é bootstrap destrutivo. | RNF-02/05; CT dados e policies | Revisar inventário de grants, sequences/funções/triggers/dependências, fazer backup e configurar servidor; aplicar em ambiente controlado e testar API/Data API. |
| A-04 | **P0 contido para anônimo; autoedição bloqueada** | PUT `/artistas/:id` exige admin (401/403 nos testes). `/artista/editar` mostra indisponibilidade e não faz a antiga busca geral. `EditarCadastro.tsx` foi preservado, mas não está roteado nesta etapa. | RF-07/09, RNF-02; CT ownership negativo | Decidir C-02 e implementar vínculo UID–artista/ownership no servidor antes de reabrir autoedição. **Não resolvido.** |
| A-05 | **P1 histórico; mitigado localmente acima** | Antes desta rodada, `CadastroArtista.tsx` fazia `signUp` e POST separadamente; falhas podiam deixar conta/ficha órfãs. | RF-01/07/09; CT cadastro/login | Ver estado mais recente acima; testar integração real e resolver confirmação/ownership. |
| A-06 | **P1 histórico; implementado localmente acima** | Antes desta rodada, controllers aceitavam payload genérico sem DTO/ValidationPipe e feedback podia enviar nota 0. | RF-02/11; CT inválidos | Ver estado mais recente acima; homologar regras e dados legados. |
| A-07 | **P1** | Botão “Salvar rascunho” chama o envio definitivo (`CadastroArtista.tsx:851-853` → `handleSubmit` `:217-265`); service força `Pendente` (`artistas.service.ts:97`). | RF-01; CT rascunho/cadastro | Decidir se rascunho é requisito; corrigir rótulo ou implementar fluxo aprovado, com teste. |
| A-08 | **P1** | Uploads de galeria/documento/vídeo/áudio guardam só `file.name` no estado (`CadastroArtista.tsx:167-174`, `EditarCadastro.tsx:205-212`); `buildPayload` não envia esses campos (`CadastroArtista.tsx:200-215`), não há bucket/tabela/endpoint de mídia. Foto é data URL sem limite explícito (`:113-165`), body permite 50 MB (`main.ts:7-8`). | RF-03; CT 10 MB/vídeo 30 s | Confirmar escopo de upload com equipe; se vigente, projetar armazenamento/limites/validação antes de prometer conclusão. |
| A-09 | **P1** | Aprovação/rejeição no painel ignora status HTTP (`AdminDashboard.tsx:104-116`): recarrega lista mesmo se PATCH falhou. GET de catálogo/painel transforma erro em array vazio (`Portal.tsx:76-90`, `AdminDashboard.tsx:74-93`). | RF-04/08, DoD loading/empty/error; CT falhas | Mostrar erro real e preservar estado consistente; testar falhas de API. |
| A-10 | **P1 parcial** | `backend/test/app.e2e-spec.ts` agora tem 24 testes locais de autorização/contrato público com Supabase simulado, todos passando. Front continua sem script de teste; cadastros, persistência real, validação e fluxo completo não estão cobertos. | RNF-07; CT prioritários | Ampliar testes em etapa própria com ambiente controlado, sem usar produção. |
| A-11 | **P2** | Lint back ainda falha: `npx eslint "{src,apps,libs,test}/**/*.ts"` → 6 erros e 1 aviso legados em `feedback.service.ts`, `main.ts` e `supabase.service.ts`; arquivos tocados nesta rodada passaram em lint direcionado. O script `npm run lint` contém `--fix` e foi evitado. Front lint passou sem aviso nesta rodada. | RNF-05/07 | Resolver os erros remanescentes em rodada de manutenção e usar lint sem `--fix` em CI. |
| A-12 | **P2** | Alegação de labels vinculados em `ACESSIBILIDADE.md` diverge de `Feedback.tsx:92-148` e modal admin `AdminDashboard.tsx:510-581`: labels sem `htmlFor`/inputs sem `id`. Modais admin `:500-621` não têm semântica/foco/teclado equivalentes ao modal do catálogo. | RNF-01/04; WCAG 2.1 AA documentada | Auditar teclado/leitor/axe; corrigir associações e comportamento dos modais sem alegar conformidade até teste. |
| A-13 | **P2** | Modal do catálogo abre foco e faz trap (`Portal.tsx:93-131`), mas não restaura foco ao card ao fechar; `Feedback.tsx:154` mostra erro sem `role="alert"`. | Acessibilidade; CT teclado/leitor | Testar foco e anúncios com navegador/leitor e ajustar. |
| A-14 | **P2** | Busca não cobre nome artístico (`Portal.tsx:133-141`); categorias são string com vírgulas (`CadastroArtista.tsx:87-93,207`) e catálogo filtra `includes`, podendo ter correspondências imprecisas. Admin oferece conjunto diferente de categorias (`AdminDashboard.tsx:39,531-534`). | RF-06, C-03; CT exato/parcial/categoria | Confirmar cardinalidade e vocabulário oficial, testar termos reais e só então harmonizar representação. |
| A-15 | **P2 parcial** | `backend/.env.example` foi criado com nomes vazios, mas `backend/README.md` e `frontend/README.md` são templates e não há config Render. `main.ts:10-25` libera qualquer origem até no ramo de negação; a proteção verdadeira deve estar no servidor. | RNF-02/06/07 | Documentar implantação segura em ambiente controlado e restringir CORS após estabelecer origens reais, sem depender de CORS para auth. |
| A-16 | **P2** | `DIAGRAMAS_UML.md`/`DIAGRAMAS_MERMAID.md` mostram “portaria”/autorização e schema reduzido, omitem login/edição artista e campos recentes; `ACESSIBILIDADE.md` generaliza melhorias para todos os formulários. | RNF-06, C-02/C-09 | Após decisões e correções, sincronizar documentos existentes e regenerar imagens históricas se usadas. |
| A-17 | **P2** | Busca/performance de 1000 registros, responsividade/zoom/reflow, teclado e WCAG 2.1 AA não medidos. `Portal.tsx:76-91,133-141` carrega tudo e filtra no cliente; build front avisa chunk JS 554,25 kB. | RNF-01/03/04/08; CT performance/usabilidade | Medir em homologação com dados fictícios e usuários; não declarar metas cumpridas antes disso. |
| A-18 | **P3** | Botões visuais sem ação: “Ordenar resultados” (`Portal.tsx:238`), busca do painel (`AdminDashboard.tsx:291`), Termos/Privacidade (`ComoFunciona.tsx:143-145`). Favoritos/disponibilidade do mural são demonstrativos conforme `DOCUMENTACAO_PROJETO.md:61` e `Portal.tsx:147-150,278-279`. | C-05/C-06; usabilidade | Resolver texto/estados enganosos quando o escopo for decidido; não criar backend de favoritos sem aceite. |
| A-19 | **P3** | Exportação administrativa RNF-09, treinamento/homologação e manuais constam como condicionados/pendentes (`ESCOPO_E_TESTES.md:40`, `DOCUMENTACAO_PROJETO.md:49-57`), sem implementação/evidência. | RNF-06/09 | Confirmar escopo atual com demandante e planejar etapa de entrega separada. |

## Ordem recomendada para a próxima rodada

1. Validar A-01/A-02 com Supabase Auth real em ambiente controlado e auditar A-03 (RLS/grants) na rodada de banco; não aplicar o SQL de bootstrap.
2. Fechar C-02/ownership antes de reabrir A-04; provisionar apenas administradores aprovados em `app_metadata` por operador confiável.
3. Homologar A-05/A-06 com Supabase real e decidir confirmação de e-mail/C-04; tratar A-07 a A-09 em suas rodadas, ampliar A-10 e revisar A-11 a A-17.
4. Reavaliar P3 apenas após decisão explícita de escopo.

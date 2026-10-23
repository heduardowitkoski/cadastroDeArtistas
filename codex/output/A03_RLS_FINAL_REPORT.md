# A-03 — revisão final de RLS/grants, sem aplicação remota

Data: 07/10/2026. **Estado: P0 bloqueado pelo frontend de produção e por validação remota pendente; A-03 não está resolvido.** Nenhuma migration, SQL, mudança de Vercel/Render/Supabase ou operação remota de escrita foi executada nesta rodada.

## Resumo executivo

`RLS_MIGRATION_FINAL.sql` foi preparado como alteração incremental: habilita RLS em `public.artistas` e `public.feedbacks` e revoga privilégios de `anon`/`authenticated` nas tabelas e sequences. Contém precheck, transação com assertivas de acesso efetivo e postcheck. Não modifica dados, colunas, `auth.users`, `postgres` nem `service_role`. A aplicação deve ser **manual e supervisionada**, em blocos separados, conforme `A03_RLS_MANUAL_TEST_CHECKLIST.md`.

O frontend publicado em [cadastro-de-artistas.vercel.app](https://cadastro-de-artistas.vercel.app/) abriu em branco no navegador integrado em 07/10/2026; o log capturado continha o erro `Configuração do Supabase ausente` para `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`. O painel Vercel não foi acessado: a causa operacional exata precisa ser confirmada ali. Pelo código e pelo erro, a ausência dessas variáveis **no build de produção** é a hipótese principal. O bloqueio deve ser corrigido e validado antes de aplicar RLS.

## Estado encontrado no código

| Verificação | Evidência |
|---|---|
| Frontend sem Data API direta para as tabelas | Busca em `frontend/src` por `supabase.from`, `supabase.rpc`, `.from(` e `.rpc(` encontrou somente `Array.from`; `Portal.tsx` faz GET `/artistas/aprovados`, `CadastroArtista.tsx` POST `/artistas`, `Feedback.tsx` POST `/feedbacks`, e `AdminDashboard.tsx` usa `adminFetch` para rotas administrativas. Todas as operações de artistas/feedbacks passam pelo NestJS. |
| Cliente Auth público separado | `backend/src/supabase/supabase.service.ts` cria `authClient` com `SUPABASE_PUBLISHABLE_KEY`; `SupabaseAuthGuard` chama somente `getAuthClient().auth.getUser(token)`. |
| Cliente DB privilegiado | O mesmo service cria `databaseClient` distinto com `SUPABASE_SECRET_KEY`; `ArtistasService` e `FeedbackService` usam `getDatabaseClient().from(...)`. O cliente DB não recebe JWT de usuário. A [documentação Supabase de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) esclarece que Secret key usa `service_role`/BYPASSRLS **somente sem token de usuário anexado**. |
| Admin no servidor | `ArtistasController` exige `@AdminOnly()` em GET geral, PATCH status, PUT e DELETE; `FeedbackController` em GET e DELETE. `AdminGuard` exige `app_metadata.role === 'admin'`. GET `/artistas/aprovados`, POST `/artistas` e POST `/feedbacks` são públicos. |
| A-05/A-06 preservados | Cadastro usa POST NestJS, sem `signUp` paralelo no browser; DTOs/ValidationPipe continuam ativos. `EditarCadastro.tsx` legado ainda contém fetch à API sem Bearer, mas **não está roteado**: `/artista/editar` renderiza `EdicaoIndisponivel`. Não reabrir sem C-02/ownership. |

### Inventário das rotas relevantes

| METHOD | PATH | AUTH | PAPEL | DTO | RESPOSTA/controle | RF/CT |
|---|---|---|---|---|---|---|
| GET | `/artistas/aprovados` | pública | — | — | allowlist pública, só Aprovado | RF-04/05; CT catálogo/privacidade |
| POST | `/artistas` | pública | — | `CreateArtistaDto` | ficha Pendente, Auth no backend | RF-01/02; CT cadastro |
| GET | `/artistas` | Bearer | admin | — | lista completa só admin | RF-07/09; CT 401/403 |
| PATCH | `/artistas/:id/status` | Bearer | admin | `UpdateStatusDto` | três estados válidos | RF-08; CT aprovação |
| PUT | `/artistas/:id` | Bearer | admin | `UpdateArtistaDto` | edição administrativa | RF-09; CT edição |
| DELETE | `/artistas/:id` | Bearer | admin | id inteiro | exclusão definitiva | RF-10; CT exclusão |
| POST | `/feedbacks` | pública | — | `CreateFeedbackDto` | gravação privada | RF-11; CT feedback |
| GET | `/feedbacks` | Bearer | admin | — | lista privada | RF-11; CT 401/403 |
| DELETE | `/feedbacks/:id` | Bearer | admin | id inteiro | exclusão privada | RF-11; CT exclusão |

## Dependências e bloqueadores

1. **Vercel Production — bloqueador P1 do P0 A-03.** `frontend/src/lib/supabase.ts` lê exatamente `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` e falha claramente sem elas; não há fallback hardcoded. `frontend/.env.example` contém somente esses nomes vazios. `frontend/vite.config.ts` não altera `envPrefix`; `frontend/vercel.json` contém rewrite SPA. `frontend/package.json` usa `tsc -b && vite build`, que gera `dist`. A configuração efetiva Root Directory/Environment Variables é externa ao Git. Conferir Root Directory `frontend`, Build Command `npm run build`, Output Directory `dist` e as duas variáveis no ambiente **Production**. `VITE_API_URL` também deve apontar para Render; se ausente, os fetches caem em `http://localhost:3001` e o catálogo não funcionará mesmo após corrigir Supabase.
2. **Novo deploy obrigatório.** [Vite substitui `import.meta.env` no build](https://vite.dev/guide/env-and-mode) e a [Vercel aplica mudanças de variáveis apenas a novos deploys](https://vercel.com/docs/environment-variables). Portanto, corrigir o painel sem redeploy não recupera o bundle atual. Configurar Preview/Development se esses ambientes forem usados. Nunca colocar `SUPABASE_SECRET_KEY` no Vercel ou prefixá-la com `VITE_`.
3. **Render e Supabase real não inspecionados nesta rodada.** `backend/.env.example` contém apenas `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` vazios. Confirmar presença e funcionamento no painel Render sem mostrar valores. O usuário informou auditoria anterior com RLS desabilitado, zero policies, grants amplos, duas sequences e ausência de triggers/RPC/views relevantes; esses dados **não foram reconfirmados remotamente**. Precheck e backup são gates obrigatórios.
4. **Auth URL.** Conferir no painel Supabase Authentication → URL Configuration a Site URL `https://cadastro-de-artistas.vercel.app`. O fluxo atual de senha não define callback; Redirect URLs só devem ser adicionadas para fluxo real que as utilize. Não foi alterado nesta rodada.

## Por que não há policies públicas

O browser usa Supabase para Auth e chama a API NestJS para artistas/feedbacks. O NestJS aplica validação, filtro público e guard administrativo antes de usar o cliente Secret key. Policies públicas reabririam uma segunda rota direta para as tabelas e enfraqueceriam essa arquitetura. Grants e RLS são camadas distintas: a [documentação oficial de RLS](https://supabase.com/docs/guides/database/postgres/row-level-security) recomenda revogar grants de `anon`/`authenticated` em projetos antigos quando não são necessários e alerta que views podem contornar RLS. A migration inclui revisão de grants efetivos, views, funções e sequences antes de qualquer aplicação.

## Revisão do SQL final e recuperação

- O precheck usa `information_schema.role_usage_grants.object_name AS sequence_name`; a coluna `sequence_name` não é lida dessa view. Inclui RLS, policies, grants diretos/efetivos, contagens, triggers, dependências, funções/RPC e colunas.
- O bloco de mudança usa `BEGIN`/`COMMIT`, `ENABLE ROW LEVEL SECURITY` e `REVOKE ALL` somente para `anon`/`authenticated`. Assertivas dentro da transação abortam se o estado básico divergir, se acesso efetivo do browser continuar ou se `service_role` perder CRUD/BYPASSRLS. Não há criação de policy pública.
- O postcheck repete RLS, policies, grants, privilégios efetivos, contagens, existência das tabelas e estrutura de colunas. A comparação de contagens/colunas depende das saídas salvas antes; não foi executada.
- **Contingência sem reabrir o browser:** se a API falhar por configuração, corrigir Render/Secret key primeiro. Se a única causa demonstrada for ausência de grants do papel servidor, o operador pode revisar e aplicar somente os privilégios necessários ao `service_role`:

```sql
BEGIN;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON TABLE public.artistas, public.feedbacks TO service_role;
GRANT USAGE, SELECT
  ON SEQUENCE public.artistas_id_seq, public.feedbacks_id_seq TO service_role;
COMMIT;
```

Esse bloco **não foi executado** e só deve ser usado após comparar ACLs e provar a causa. Não desabilitar RLS nem restaurar grants amplos do browser automaticamente: isso recriaria o P0. Uma falha da transação principal deve ser investigada antes de tentar novamente. Rollback é contingência temporária, não configuração permanente.

## Testes locais executados em 07/10/2026

| Comando | Resultado |
|---|---|
| `backend: npm run test:e2e -- --runInBand` | 46/46 passaram; Supabase substituído por fake, sem produção. Logs genéricos esperados em dois cenários de falha simulada. |
| `backend: npm test -- --runInBand` | 6/6 passaram. |
| `backend: npx tsc --noEmit -p tsconfig.json` | passou. |
| `backend: npm run build` | passou. |
| `frontend: npm run lint` | passou. |
| `frontend: npx tsc -b --noEmit` | passou. |
| `frontend: npm run build` | passou com URL, Publishable key e URL de API **fictícias**; aviso de chunk JS 542,47 kB. Build local não comprova Vercel Production. |
| `frontend: npm test` | 3/3 passaram. |
| Inspeção estática de `RLS_MIGRATION_FINAL.sql` | 7/7 cláusulas essenciais presentes; nenhum comando proibido de remoção de tabela/coluna/schema, truncamento ou desativação de RLS detectado. Não substitui parser/Postgres real. |

Nenhum arquivo TypeScript/TSX foi alterado nesta rodada; lint direcionado de código alterado não se aplica. O SQL não foi executado contra Postgres local ou remoto (não há `psql` no ambiente), portanto sintaxe e comportamento efetivo ainda dependem da revisão/precheck e aplicação supervisionada. A busca de padrões de Secret key nos arquivos versionados atuais não encontrou valores; o histórico de `backend/` e `frontend/` também não indicou padrão literal pela busca sem textconv. Arquivos `.env` locais existem e estão ignorados pelo Git; seus valores não foram abertos nem impressos. Essa verificação não prova ausência em binários ou em sistemas externos.

## Arquivos alterados

- Criados: `codex/output/RLS_MIGRATION_FINAL.sql`, `codex/output/A03_RLS_MANUAL_TEST_CHECKLIST.md`, este `A03_RLS_FINAL_REPORT.md`.
- Atualizados: `codex/output/BACKLOG_PRIORIZADO.md`, `codex/output/MATRIZ_RASTREABILIDADE.md`, `codex/output/RLS_ACCESS_MATRIX.md`, `codex/output/SUPABASE_MIGRATION_PLAN.md`, `codex/output/SUPABASE_RLS_AUDIT.md`.

`codex/` está ignorado pelo `.gitignore` atual; esses artefatos existem no workspace, mas não entram automaticamente no Git. Nenhuma alteração de código, schema funcional ou dado remoto foi feita.

## Próximo passo e critério de encerramento

Responsável pelo projeto: corrigir variáveis/Root Directory no painel Vercel, fazer novo deploy e validar o site publicado; confirmar Render e Supabase Auth; executar somente o PRECHECK SQL, revisar/backup; aplicar manualmente o bloco transacional; executar POSTCHECK, sete testes diretos negativos com Publishable key e testes positivos via NestJS. Ver sequência detalhada no checklist. A-03 só será marcado **resolvido** após esses resultados reais, preservação de dados e ausência de segredo exposto.

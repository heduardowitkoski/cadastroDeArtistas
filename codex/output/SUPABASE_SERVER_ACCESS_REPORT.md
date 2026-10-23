# Acesso Supabase pelo servidor — 06/10/2026

## Escopo e decisão

Escolhida **B: NestJS usa Secret key somente no servidor para o banco, após os guards e regras da API**. A Secret key autoriza pelo papel Postgres `service_role`. Frontend usa Publishable key para Supabase Auth e API REST para artistas/feedbacks. `SupabaseAuthGuard` verifica o Bearer com cliente Publishable separado; `AdminGuard` exige `app_metadata.role=admin`. O cliente de banco nunca recebe a sessão do usuário. A chave privilegiada não pode ser enviada ao browser, logada ou commitada. Seu poder de contornar RLS torna o servidor o ponto crítico de autorização. Referências: [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [chaves](https://supabase.com/docs/guides/getting-started/api-keys), [migração das chaves](https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys), [Data API](https://supabase.com/docs/guides/api/securing-your-api).

| Opção | Segurança e manutenção | Impacto nos fluxos atuais | Área do Artista futura |
|---|---|---|---|
| A. JWT do usuário + RLS | Defesa no banco por usuário; exige policies para públicos, admins e ownership; maior superfície de policy e grants. | Catálogo/cadastro/feedback públicos precisam policies; painel precisa claims confiáveis; reescrita maior. | Exige vínculo UID–registro; ainda sem decisão C-02. |
| **B. Secret key após API (escolhida)** | RLS/grants bloqueiam acesso direto; API deve guardar toda autorização/validação. Menor mudança no desenho presente. | GET aprovados/POST artista/POST feedback permanecem públicos via NestJS. Seis rotas admin seguem com Bearer+admin; mesmo cliente DB só é usado após o controller/guard. | Não abre autoedição; precisará ownership server-side aprovado. |
| C. Híbrida | Pode combinar defesa por linha para usuário e operações privilegiadas; dois modelos de acesso para manter/testar. | Mudança maior sem necessidade atual; risco de caminhos inconsistentes. | Reavaliar após decisão formal de identidade/ownership. |

## Inventário de chaves e clientes

Nenhum valor de chave é reproduzido aqui. `backend/.env.example` e `frontend/.env.example` contêm **nomes vazios**. `.gitignore:43-50` ignora `.env` e libera `.env.example`; `:186` ignora `/codex/` (relatórios locais não entram no Git por padrão).

| Arquivo | Chave utilizada | Finalidade | Lado | Seguro? / ação |
|---|---|---|---|---|
| `frontend/src/lib/supabase.ts` | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`; sem fallback | `createClient` para Auth no browser | Front | Lança erro claro se faltar configuração. A chave anon antiga foi removida do código atual, mas permanece no histórico Git; mitigar A-03 no banco. Nenhuma Secret key localizada no front. |
| `frontend/src/lib/adminApi.ts`, `PrivateRoute.tsx`, `Admin/Login.tsx`, `Admin/AdminDashboard.tsx`, `Artista/ArtistaLogin.tsx`, `Artista/EditarCadastro.tsx`, `Cadastro/CadastroArtista.tsx` | Cliente anon importado; token de sessão para API admin | Auth/signUp/signOut/getUser/getSession | Front | Sem `.from()`/`.rpc()` direto encontrado em `frontend/src`; `EditarCadastro.tsx` antigo não está roteado e C-02 segue pendente. |
| `backend/src/supabase/supabase.service.ts` | `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` via `ConfigService` | Dois `createClient`: Auth público e DB privilegiado; sessão persistente/refresh desativados | Back | Separado; ausência de qualquer variável falha na inicialização sem imprimir valores. Configurar Secret key somente no servidor. |
| `backend/src/auth/supabase-auth.guard.ts` | `getAuthClient()` | `auth.getUser(token)` para Bearer | Back | Mantém 401/403; não usa cliente privilegiado. |
| `backend/src/artistas/artistas.service.ts` | `getDatabaseClient()` | Todas as consultas/mutações; `auth.admin.createUser` legado quando senha enviada | Back | Não depende mais de grants `anon` nas tabelas. Criação de conta ainda não é atômica (A-05). |
| `backend/src/feedback/feedback.service.ts` | `getDatabaseClient()` | CRUD de feedback | Back | Não depende de grants `anon` na tabela. |
| `backend/test/app.e2e-spec.ts`, `backend/src/supabase/supabase.service.spec.ts` | Chaves fictícias/mocks | Verificação local | Back/teste | Nenhuma conexão real. |

**Git:** `git rev-list --count --all` retornou 35 commits na rodada anterior. `git log -G` em `backend/`/`frontend/` identificou o commit de criação do antigo fallback anon em `frontend/src/lib/supabase.ts` e referência histórica à variável `SUPABASE_SERVICE_ROLE_KEY` em `backend/src/artistas/artistas.service.ts`; a inspeção local das revisões/arquivos de configuração e Supabase não encontrou literal privilegiado (`sb_secret_` ou JWT atribuído à variável service role). `git ls-files` não mostrou `.env` versionado. Isso não prova ausência de qualquer segredo em binários/histórico fora desse escopo; se algum segredo privilegiado for encontrado, classificar P0 e rotacionar. Nenhum segredo foi impresso nos relatórios.

## Código e testes

`SupabaseService` tem `getAuthClient()` e `getDatabaseClient()` sem fallback de chave. O registro público mantém status `Pendente` e retorno `{id,status}`. O catálogo mantém select/mapper de `public-artista.ts`. Os seis endpoints admin mantêm `@AdminOnly()` nos controllers. O antigo `createClient()` ad hoc no cadastro foi centralizado no cliente DB; seu erro ainda é engolido, como antes, e A-05 permanece. Os dois `.env.example` têm apenas as variáveis exigidas, sem valores.

| Comando local | Resultado |
|---|---|
| `npm run test:e2e -- --runInBand` | 24/24 passaram com Auth e DB mocks distintos; 401/403, admin, catálogo privado, cadastro/feedback públicos. |
| `npm test -- --runInBand` | 4/4 passaram, incluindo ausência de Secret key ou Publishable key e separação dos clientes. |
| `npx tsc --noEmit -p tsconfig.json` | Passou. |
| `npm run build` | Passou. |
| `npx eslint` nos dois arquivos TypeScript alterados nesta atualização | Passou sem erros/avisos; `npm run lint` não foi usado porque seu script usa `--fix`. |
| `frontend: npm run lint`, `npx tsc -b --noEmit`, `npm run build` com valores fictícios Publishable/URL | Passaram; build avisou sobre chunk acima de 500 kB. O frontend não foi executado em navegador sem configuração. |

Não houve teste com Supabase real, Render/Vercel nem produção. A-03 segue aberto até a sequência de revisão, backup, configuração e validação descrita no plano. A-06 (validação server-side completa) também permanece pendente e é crítica antes de confiar na API privilegiada.

# Matriz de acesso pretendido após migration final A-03

> **Atualização operacional em 07/10/2026:** o demandante informou aplicação e postcheck do RLS nas duas tabelas, grants/sequences restritos e Data API Publishable negada. A descrição abaixo de "estado pretendido/não aplicado" é o plano histórico anterior à aplicação. A API Render ainda responde 500 segundo relato; o GET pelo backend local retornou 503 com `status=0` antes de resposta HTTP do Supabase. O acesso positivo via cliente Secret **não está validado**. Ver `BACKEND_POST_RLS_RENDER_REPORT.md`.

**Condição:** frontend Vercel Production corrigido e redeployado, backend Render implantado com `SUPABASE_SECRET_KEY` secreta e `SUPABASE_PUBLISHABLE_KEY` para Auth, dependências/grants revisados e sem outros consumidores diretos da Data API para estas tabelas. Estado pretendido; **não aplicado nem validado no Supabase real**. Em 07/10/2026, A-03 está **bloqueado pelo frontend publicado em branco** e pela falta dos testes remotos supervisionados. `anon` Postgres não é sinônimo de usuário anônimo do Auth.

| Origem/papel | `artistas` direto Data API | `feedbacks` direto Data API | Via NestJS | Controle obrigatório |
|---|---|---|---|---|
| Browser sem sessão / `anon` | Negado para SELECT/INSERT/UPDATE/DELETE | Negado para SELECT/INSERT/DELETE (e demais privilégios) | GET `/artistas/aprovados`, POST `/artistas`, POST `/feedbacks` | Allowlist pública; Pendente forçado; DTOs/ValidationPipe A-06 testados localmente |
| Browser com sessão comum / `authenticated` | Negado | Negado | Mesmas rotas públicas; rotas admin → 403 | Supabase Auth identifica; nenhum ownership de artista aprovado |
| Browser admin autenticado | Negado diretamente | Negado diretamente | GET `/artistas`, PATCH status, PUT/DELETE artista, GET/DELETE feedback | Bearer → `SupabaseAuthGuard` → `AdminGuard` (`app_metadata.role=admin`) |
| NestJS Auth client / Publishable key | Somente `auth.getUser(token)` | Nenhum acesso | Não atende consultas DB | Chave pública, sem `from(...)` |
| NestJS DB client / Secret key (papel `service_role`) | CRUD para serviços NestJS | CRUD para serviços NestJS | Operações depois das regras da API; A-05 cria Auth e ficha Pendente no servidor | Chave apenas no servidor; sem sessão/JWT do usuário no cliente privilegiado; testar após a migration |

Sem policies públicas previstas para essas tabelas. A mudança proposta em `RLS_MIGRATION_FINAL.sql` habilita RLS e revoga privilégios de `anon`/`authenticated` em tabelas e sequences. Para uma futura Área do Artista, C-02 exige decisão e vínculo seguro `auth.users.id` → `artistas.auth_user_id` (ou alternativa aprovada) antes de acesso próprio. O `PUT /artistas/:id` permanece administrativo. A-05 mantém os riscos de confirmação de e-mail e resposta ambígua do banco.

**Prova exigida após aplicação:** precheck/postcheck SQL, sete operações diretas com Publishable key negadas para `anon` e `authenticated`, e fluxos públicos/admin funcionando via NestJS. Checklist: `A03_RLS_MANUAL_TEST_CHECKLIST.md`.

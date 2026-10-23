# Contenção P0 da API — 06/10/2026

Escopo desta rodada: A-01, A-02 e a contenção segura de A-04. Referências: RF-01, RF-04, RF-05, RF-07, RF-09, RF-11; RNF-02 e CT de acesso anônimo, usuário sem papel, admin, catálogo público e criação pública. Nenhum banco remoto foi acessado. `backend/supabase.sql` não foi executado nem teve comandos SQL alterados; recebeu apenas aviso em comentário.

## Antes e depois

| Achado | Antes (auditoria) | Depois desta rodada | Limite |
|---|---|---|---|
| **A-01** | GET `/artistas`, PATCH status, PUT/DELETE artista e GET/DELETE feedback aceitavam chamadas sem token; smoke local anônimo retornou 200. | `@AdminOnly()` aplica verificação Bearer com Supabase Auth e exige `user.app_metadata.role === 'admin'` no servidor. Sem token → 401; usuário autenticado sem papel → 403; admin simulado → acesso nos seis endpoints. O front envia `Authorization: Bearer <access_token>`. | Ainda é necessário provisionar `app_metadata.role=admin` por operador confiável e validar em ambiente integrado. Sem isso, a administração fica fechada por padrão. |
| **A-02** | GET `/artistas/aprovados` fazia `select('*')`, expondo CPF/CNPJ/e-mail mesmo que a UI não os exibisse. GET `/artistas` e `/feedbacks` também eram públicos. | Catálogo usa lista explícita de colunas e mapper de saída; testes garantem ausência de `cpf_cnpj`, `email`, `status` e `created_at`. Listas completas de artistas e feedbacks exigem admin. POST de artista devolve só `{id,status}` e ignora campos administrativos do corpo. | **Contenção da API, não garantia do banco remoto.** Se o SQL antigo tiver sido aplicado, RLS pode estar desativado e a chave anon pública pode permitir acesso direto ao Supabase. A-03 permanece P0 até auditoria/correção de RLS em etapa de banco. |
| **A-04** | A Área do Artista baixava todos os cadastros, procurava por e-mail no navegador e fazia PUT por ID sem ownership. | PUT `/artistas/:id` agora é exclusivamente administrativo; cliente anônimo recebe 401 e artista sem papel admin recebe 403. A rota `/artista/editar` mostra indisponibilidade temporária, sem executar a busca/edição insegura. O arquivo `EditarCadastro.tsx` foi preservado. | **Não resolvido.** Autoedição depende da decisão C-02 e de vínculo confiável entre UID Supabase e registro, com verificação de ownership no servidor. |

## Estratégia de autenticação/autorização

`SupabaseAuthGuard` extrai um único token do cabeçalho Bearer e chama `supabase.auth.getUser(token)` no servidor. O usuário vem da verificação do Supabase Auth, não do corpo da requisição nem de `getSession()` do navegador. Token ausente/inválido causa 401; indisponibilidade na verificação causa 503, sempre fechando acesso. `AdminGuard` consulta somente `app_metadata.role` do usuário verificado; qualquer outro valor causa 403. `@AdminOnly()` compõe os guards para as rotas administrativas. `user_metadata`, e-mail, lista de front-end e o simples fato de haver sessão não dão privilégio.

**Provisionamento mínimo pendente:** um operador com acesso administrativo ao projeto Supabase deve atribuir `app_metadata.role = "admin"` apenas a UIDs explicitamente aprovados pela equipe, pelo painel administrativo do Supabase ou Admin API em ambiente confiável com `service_role` mantida no servidor. O repositório não contém lista validada de administradores nem executou provisionamento. Uma conta comum criada por cadastro público não recebe esse papel. Após provisionar, a pessoa deve iniciar nova sessão para receber metadados atualizados no front.

## Contratos HTTP após a contenção

| Método e path | Acesso | Resposta/observação |
|---|---|---|
| GET `/artistas/aprovados` | Público | Somente aprovados. Campos: `id`, `nome`, `nome_artistico`, `area_atuacao`, `bio`, `foto_url`, `instagram`, `site`, `contato`, `cidade`, `tags`, `disponibilidade`. Sem CPF/CNPJ/e-mail/status/metadados administrativos. |
| POST `/artistas` | Público | Lista de campos de cadastro permitidos; `status` sempre `Pendente`; resposta `{id,status}`. `id`, `status`, `forceStatus`, `created_at`, `app_metadata` do cliente são ignorados. Validação completa de entradas permanece em A-06. |
| POST `/feedbacks` | Público | Mantém o envio atual; validação completa permanece em A-06. |
| GET `/artistas` | Bearer + admin | Lista administrativa completa. |
| PATCH `/artistas/:id/status` | Bearer + admin | Atualiza status; regras detalhadas de transição permanecem fora desta rodada. |
| PUT `/artistas/:id` | Bearer + admin | Edição administrativa; autoedição bloqueada. |
| DELETE `/artistas/:id` | Bearer + admin | Exclusão administrativa. |
| GET `/feedbacks` | Bearer + admin | Consulta privada. |
| DELETE `/feedbacks/:id` | Bearer + admin | Exclusão administrativa. |

## Testes versionados e comandos

`backend/test/app.e2e-spec.ts` substitui a spec antiga de “Hello World” por testes Nest + Supertest com `SupabaseService` simulado e dados fictícios. O teste não abre conexão com produção/homologação. Cobre as seis rotas administrativas sem token (401), com usuário não admin (403), com admin (200), token inválido (401), tentativa de papel admin em `user_metadata` (403), catálogo público (200 e campos privados ausentes), feedback público (201), cadastro público (201, status Pendente e campos administrativos ignorados).

| Comando | Resultado |
|---|---|
| `backend: npm run test:e2e -- --runInBand` | 24/24 testes passaram |
| `backend: npx tsc --noEmit -p tsconfig.json` | Passou |
| `backend: npm run build` | Passou |
| `backend: npm test -- --runInBand` | 1/1 teste unitário passou; ainda é o teste legado de Hello World |
| `backend: npx eslint "{src,apps,libs,test}/**/*.ts"` | Falhou com 6 erros e 1 aviso legados, todos fora dos arquivos tocados: `feedback.service.ts` (3), `main.ts` (1 erro/1 aviso), `supabase.service.ts` (2). Nenhum erro nos arquivos desta rodada. |
| `backend: npx eslint` restrito aos arquivos tocados | Passou, sem erros/avisos |
| `frontend: npm run lint` | Passou |
| `frontend: npx tsc -b --noEmit` | Passou |
| `frontend: npm run build` | Passou; aviso de chunk maior que 500 kB |

O script `npm run lint` do back contém `--fix` e não foi usado para evitar reformatar arquivos não relacionados. Não foram executados testes de integração com Supabase real nem E2E de navegador.

## Arquivos alterados

- Back: `backend/src/auth/{auth.module.ts,authenticated-request.ts,supabase-auth.guard.ts,admin.guard.ts,admin-only.decorator.ts}`, `backend/src/artistas/{artistas.controller.ts,artistas.module.ts,artistas.service.ts,public-artista.ts}`, `backend/src/feedback/{feedback.controller.ts,feedback.module.ts}`, `backend/test/app.e2e-spec.ts`.
- Front: `frontend/src/lib/adminApi.ts`, `frontend/src/pages/Admin/{AdminDashboard.tsx,Login.tsx}`, `frontend/src/components/PrivateRoute.tsx`, `frontend/src/App.tsx`, `frontend/src/pages/Artista/EdicaoIndisponivel.tsx`.
- Documentação: `DOCUMENTACAO_PROJETO.md`, comentário de aviso em `backend/supabase.sql`, este relatório, `MATRIZ_RASTREABILIDADE.md`, `BACKLOG_PRIORIZADO.md`.

## Riscos e decisões restantes

- **A-03/P0:** RLS e grants reais não foram consultados. O script de bootstrap continua destrutivo e desativa RLS; sua instrução antiga de execução foi substituída por aviso explícito. Acesso direto ao Supabase pode contornar o back se o banco estiver exposto. Etapa separada de banco é necessária.
- **C-02/A-04:** definir se autoedição integra o escopo oficial e, se sim, como UID Auth se vincula ao artista. Até lá, PUT é administrativo e a tela de autoedição permanece indisponível.
- **Admin:** aprovar responsáveis e provisionar papel em `app_metadata` por canal confiável; nenhum admin foi criado nesta rodada.
- **A-05/A-06:** cadastro/Auth ainda não são transacionais e validação completa do back continua pendente. Nenhuma regra nova de CPF/CNPJ foi assumida.
- **Implantação:** build/testes locais não provam configuração Render/Vercel, policies Supabase ou comportamento com dados reais. Validar em ambiente controlado após decisão/etapa de banco.
- **Rastreio no Git:** `.gitignore:186` ignora `/codex/` por política do repositório. Este relatório, a matriz e o backlog foram atualizados no workspace, mas não aparecerão no diff/commit padrão sem uma decisão explícita de versioná-los.

## Revisão de segurança do diff

Verificados: rotas administrativas decoradas, ausência de token em logs, ausência de `service_role` no front, resposta pública por allowlist, payload público sem campos administrativos e nenhuma mudança SQL executável. A revisão final de `git diff`/busca por dados pessoais e secrets está registrada nos comandos da entrega.

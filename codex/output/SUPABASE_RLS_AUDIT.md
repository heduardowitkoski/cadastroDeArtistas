# Auditoria Supabase real — 06/10/2026

> **Atualização de escopo informada pelo demandante em 07/10/2026:** foram identificadas `public.artistas_id_seq` e `public.feedbacks_id_seq`; não foram identificados triggers públicos nem funções/RPC/views dependentes relevantes na auditoria anterior. Esses fatos foram **informados**, não reconfirmados por consulta remota nesta rodada. `RLS_MIGRATION_FINAL.sql` inclui precheck para verificá-los antes da aplicação. A-03 permanece P0 bloqueado pelo frontend Vercel e pelos testes reais pendentes; ver `A03_RLS_FINAL_REPORT.md`.

## Evidência recebida

O demandante confirmou manualmente no projeto Supabase atual: `public.artistas` tem **11** registros e `public.feedbacks` tem **3**; `relrowsecurity=false` em ambas; `pg_policies` no schema `public` retornou **0** policies; `information_schema.role_table_grants` retornou **56** grants; `anon` tem ao menos SELECT, INSERT, UPDATE, DELETE, REFERENCES, TRIGGER e TRUNCATE em `public.artistas`. São fatos **informados pelo demandante**, não consultas feitas por esta auditoria. Não recebemos a lista completa dos 56 grants, schema real, inventário de sequências, funções, triggers, views, dependências, privileges efetivos nem configuração da Data API.

## Achados

| ID | Pri | Evidência | Consequência |
|---|---|---|---|
| A-03 | **P0 aberto** | RLS false nas duas tabelas, zero policies e grants amplos para `anon`, segundo consulta manual informada. A antiga chave anon pública de fallback foi removida do código atual, mas consta no histórico Git. | Acesso direto pela Data API pode contornar filtros, allowlist e guards da API enquanto as chaves legadas permanecerem ativas. Bloqueio não foi testado diretamente contra Supabase. |
| A-03a | **P0 operacional** | `backend/supabase.sql:6,28` contém `DROP TABLE IF EXISTS ... CASCADE`; linhas finais desativam RLS. | Script de bootstrap não serve para migração: destruiria dados existentes e deixaria acesso amplo. Não foi executado. |
| A-03b | **P1 de implantação** | Antes desta rodada, `SupabaseService` criava um cliente anon para todas as operações `from(...)`; após esta rodada, os serviços usam `getDatabaseClient()` com chave privilegiada. | Render precisa receber a chave no ambiente **servidor** antes de habilitar RLS/revogar grants. Sem variável, o backend falha ao iniciar de forma fechada. |

## Limites e decisão

RLS deve ser habilitado nas duas tabelas e os grants diretos de `anon`/`authenticated` devem ser revistos. Como o browser usa Supabase apenas para Auth e as operações das tabelas passam pelo NestJS, a candidata não cria policies públicas. O cliente com Secret key separado usa sua própria autorização, sem encaminhar JWT de usuário; a chave mapeia para o papel `service_role`, que normalmente ignora RLS. Por isso os guards e validação da API seguem críticos. Isso depende de grants efetivos para `service_role` e da Data API, que precisam ser verificados no ambiente controlado. Nenhuma alteração remota foi feita. Fonte técnica: [RLS do Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [segurança da Data API](https://supabase.com/docs/guides/api/securing-your-api).

## O que ainda falta observar no banco

Executar **somente consultas de inventário**, sob operador autorizado, conforme `RLS_MIGRATION_CANDIDATE.sql`: grants por objeto e papel (inclusive PUBLIC e herança), identidade/sequences, funções/RPC e SECURITY DEFINER, triggers, views/dependências, schema exposto da Data API, role/service_role e contagem/backup. Verificar se há consumidor externo legítimo antes de revogar. Teste negativo direto com chave anon e autenticada deve confirmar ausência de leitura, inserção, edição e exclusão; testar também RPC/views que possam expor essas tabelas.

**Status A-03:** aberto; migração candidata preparada, aplicação pendente.

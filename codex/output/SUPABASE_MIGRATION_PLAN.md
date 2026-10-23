# Plano para a candidata de segurança RLS — não executado

> **Atualização operacional — 23/10/2026:** o restante deste documento preserva a rodada histórica e não é uma instrução para reaplicar SQL. Segundo o postcheck manual informado pela equipe, RLS já está ativo nas duas tabelas, grants de anon/authenticated removidos, sequences protegidas, service_role preservado e acesso anônimo direto bloqueado. Backend local funcionou pós-RLS; o novo Render `https://cadastro-artistas-api-matheus.onrender.com` teve GET `/artistas/aprovados` 200 reconfirmado nesta rodada. O antigo continua 500. O frontend foi corrigido localmente; o bundle oficial ainda requer publicação. A-03 permanece parcial até smoke/security tests publicados, teste direto de authenticated e formalização final de contagens/schema. **Não reexecutar migrations, grants ou o bootstrap.** Estado consolidado: `FRONTEND_NEW_RENDER_MIGRATION_REPORT.md` e `NEW_RENDER_POST_DEPLOY_CHECKLIST.md`.


> **Registro de 07/10/2026:** este plano descreve a candidata histórica. A revisão A-03 preparou `RLS_MIGRATION_FINAL.sql`, que também revoga grants das duas sequences identificadas, e `A03_RLS_MANUAL_TEST_CHECKLIST.md`. A aplicação está **bloqueada pelo frontend Vercel Production em branco** e por gates remotos pendentes. Nenhum SQL foi executado. Para os passos atuais, use `A03_RLS_FINAL_REPORT.md` e o checklist; não aplicar a candidata antiga.

Arquivo local: `RLS_MIGRATION_CANDIDATE.sql`. **Não** usar `backend/supabase.sql`: contém `DROP TABLE ... CASCADE`, recria tabelas, insere dados de exemplo e desativa RLS. Preservar os 11 artistas e 3 feedbacks reportados. Esta candidata altera apenas RLS e grants de tabela, sem `DROP`, `TRUNCATE` ou recriação.

## Gates antes de aplicar

1. Revisar SQL com responsável pelo banco e obter backup recuperável do estado atual; confirmar contagens, esquema, chaves, triggers e dependências no banco real. Comparar com as 11/3 linhas reportadas, sem presumir que os números ainda serão iguais.
2. Inventariar resultados das consultas de preflight do SQL: grants diretos e efetivos (incluindo PUBLIC/herança), sequência/identity de `id`, funções e RPC (especialmente SECURITY DEFINER e EXECUTE público), triggers, views/materialized views, outras integrações e schemas expostos na Data API. A consulta de grants à tabela não cobre todos esses caminhos.
3. Confirmar que Browser/Vercel usa Supabase apenas para Auth e que outros consumidores não precisam de acesso direto a `artistas`/`feedbacks`. Se houver dependências, rever a matriz e ajustar a candidata antes da aplicação.
4. Configurar `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e **`SUPABASE_SECRET_KEY` apenas no ambiente servidor** do NestJS. Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no frontend. Confirmar que o serviço inicia, o cliente DB alcança ambas as tabelas via Data API, não herda JWT do usuário e que guards/validação protegem operações privilegiadas. O código falha fechado se a chave faltar.
5. Validar contrato e autorização da API em ambiente controlado, inclusive ausência de token (401), usuário sem papel (403) e admin com papel confiável; cadastro/feedback públicos, catálogo aprovado/privado e administração. Os 24 E2E locais usam Supabase simulado; não substituem esse gate.

## Aplicação controlada

Após gates, revisar de novo a candidata e aplicar a transação RLS + REVOKE em ambiente controlado. `REVOKE ALL` dos dois papéis foi escolhido porque **nenhuma operação direta nas tabelas é parte do fluxo atual**; a autorização pública e administrativa passa pelo NestJS. Não revogar `service_role`. Não alterar sequences/funções/PUBLIC por presunção: se o inventário mostrar acesso indireto, ajustar migração específica. Não criar policy pública automaticamente, pois abriria caminho que a arquitetura não usa. Manter Data API habilitada enquanto `supabase-js` do servidor usar `.from(...)`; desabilitá-la quebraria esse cliente. Fonte: [Supabase Data API](https://supabase.com/docs/guides/api/securing-your-api).

## Verificação e recuperação

Repetir contagens, RLS e grants; confirmar que 11/3 registros originais permanecem (considerar eventuais novos registros legítimos). Executar fluxos reais via NestJS: catálogo com apenas aprovados e allowlist, cadastro Pendente, feedback sem login, leitura/edição/admin com Bearer. Fazer teste **direto** à Data API com anon e sessão authenticated para SELECT/INSERT/UPDATE/DELETE; testar views/RPC e ausência de dados privados. Se a API falhar, conter tráfego e restaurar configuração/banco com plano aprovado e backup; não usar `backend/supabase.sql` como rollback.

**A-03 permanece P0 aberto** até revisão, backup, configuração da chave no servidor, aplicação e testes positivos/negativos no Supabase real. Nenhuma destas operações remotas foi feita nesta rodada.

-- A-03: migration incremental de RLS/grants. PREPARADA, NÃO EXECUTADA.
-- Data: 07/10/2026.
-- Execute em TRÊS etapas separadas no Supabase SQL Editor:
--   1) somente o bloco PRECHECK, salvar resultados e revisá-los;
--   2) somente o bloco MIGRATION, após os gates do checklist manual;
--   3) somente o bloco POSTCHECK, comparar com o PRECHECK.
-- NÃO executar o arquivo inteiro de uma vez: SQL Editor não pausa para revisão.
-- NÃO usar backend/supabase.sql em banco existente.
-- Esta migration não altera dados, colunas, auth.users, policies públicas,
-- nem privilégios de postgres/service_role.

-- ============================================================================
-- PRECHECK — SOMENTE LEITURA. Rodar e revisar ANTES da transação.
-- ============================================================================

-- A. Estado de RLS das tabelas alvo.
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('artistas', 'feedbacks')
ORDER BY tablename;

-- B. Policies existentes. Cenário informado: nenhuma.
SELECT *
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('artistas', 'feedbacks')
ORDER BY tablename, policyname;

-- C. Grants diretos de tabela. Preservar resultado para comparação.
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('artistas', 'feedbacks')
ORDER BY table_name, grantee, privilege_type;

-- D. Grants das sequences: a coluna correta é object_name.
SELECT grantee, object_schema, object_name AS sequence_name, privilege_type
FROM information_schema.role_usage_grants
WHERE object_schema = 'public'
  AND object_name IN ('artistas_id_seq', 'feedbacks_id_seq')
ORDER BY object_name, grantee, privilege_type;

-- Grants efetivos podem vir de PUBLIC/herança e não só de linhas diretas.
SELECT c.relname AS tabela, r.rolname AS papel,
       has_table_privilege(r.oid, c.oid, 'SELECT') AS pode_select,
       has_table_privilege(r.oid, c.oid, 'INSERT') AS pode_insert,
       has_table_privilege(r.oid, c.oid, 'UPDATE') AS pode_update,
       has_table_privilege(r.oid, c.oid, 'DELETE') AS pode_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
  AND c.relname IN ('artistas', 'feedbacks')
  AND r.rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY c.relname, r.rolname;

SELECT c.relname AS sequence_name, r.rolname AS papel,
       has_sequence_privilege(r.oid, c.oid, 'USAGE') AS pode_usage,
       has_sequence_privilege(r.oid, c.oid, 'SELECT') AS pode_select,
       has_sequence_privilege(r.oid, c.oid, 'UPDATE') AS pode_update
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
  AND c.relkind = 'S'
  AND c.relname IN ('artistas_id_seq', 'feedbacks_id_seq')
  AND r.rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY c.relname, r.rolname;

SELECT rolname, rolbypassrls
FROM pg_roles
WHERE rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY rolname;

-- E. Contagens; guardar os números, sem presumir que ainda sejam 11 e 3.
SELECT COUNT(*) AS artistas_antes FROM public.artistas;
SELECT COUNT(*) AS feedbacks_antes FROM public.feedbacks;

-- F. Triggers não internos ligados às duas tabelas.
SELECT t.tgrelid::regclass AS tabela, t.tgname,
       pg_get_triggerdef(t.oid) AS definicao,
       t.tgfoid::regprocedure AS funcao,
       p.prosecdef AS security_definer
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE NOT t.tgisinternal
  AND t.tgrelid IN ('public.artistas'::regclass,
                    'public.feedbacks'::regclass)
ORDER BY t.tgrelid::regclass::text, t.tgname;

-- G. Views e materialized views com dependência catalogada.
SELECT DISTINCT v.oid::regclass AS objeto_dependente, v.relkind
FROM pg_depend d
JOIN pg_rewrite rw ON rw.oid = d.objid
JOIN pg_class v ON v.oid = rw.ev_class
WHERE d.refobjid IN ('public.artistas'::regclass,
                     'public.feedbacks'::regclass)
  AND v.relkind IN ('v', 'm')
ORDER BY objeto_dependente;

-- H. Funções/RPC do schema public. A marca de referência é só triagem:
-- SQL dinâmico pode não ser detectado; revisar funções expostas manualmente.
SELECT p.oid::regprocedure AS funcao,
       p.prosecdef AS security_definer,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
       (p.prosrc ILIKE '%artistas%' OR p.prosrc ILIKE '%feedbacks%')
         AS corpo_menciona_tabelas
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY p.oid::regprocedure::text;

-- Estrutura/colunas para comparação após a mudança.
SELECT table_name, ordinal_position, column_name, data_type, udt_name,
       is_nullable, column_default, is_identity, identity_generation
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('artistas', 'feedbacks')
ORDER BY table_name, ordinal_position;

-- ============================================================================
-- MIGRATION — executar SÓ APÓS revisão humana dos resultados acima, backup,
-- Vercel e Render validados e testes positivos da API antes da mudança.
-- Se qualquer premissa divergir, NÃO executar; revisar este SQL.
-- ============================================================================

BEGIN;

-- Não presumir que o estado informado ontem ainda é o estado atual.
DO $preconditions$
BEGIN
  IF (SELECT COUNT(*) FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename IN ('artistas', 'feedbacks')) <> 2 THEN
    RAISE EXCEPTION 'A-03: tabelas alvo ausentes; revisão obrigatória';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_tables
             WHERE schemaname = 'public'
               AND tablename IN ('artistas', 'feedbacks')
               AND rowsecurity) THEN
    RAISE EXCEPTION 'A-03: RLS já ativo em tabela alvo; revisão obrigatória';
  END IF;

  IF (SELECT COUNT(*) FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind = 'S'
        AND c.relname IN ('artistas_id_seq', 'feedbacks_id_seq')) <> 2 THEN
    RAISE EXCEPTION 'A-03: sequences esperadas ausentes; revisão obrigatória';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policies
             WHERE schemaname = 'public'
               AND tablename IN ('artistas', 'feedbacks')) THEN
    RAISE EXCEPTION 'A-03: policies presentes; revisão obrigatória';
  END IF;
END
$preconditions$;

ALTER TABLE public.artistas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

REVOKE ALL PRIVILEGES ON TABLE public.artistas FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON TABLE public.feedbacks FROM anon, authenticated;

REVOKE ALL PRIVILEGES ON SEQUENCE public.artistas_id_seq
  FROM anon, authenticated;
REVOKE ALL PRIVILEGES ON SEQUENCE public.feedbacks_id_seq
  FROM anon, authenticated;

-- Abortar a transação se PUBLIC/herança mantiver acesso direto ou se o papel
-- privilegiado perder acesso de tabela. A aplicação real ainda exige testes.
DO $assertions$
DECLARE
  target_table text;
  target_sequence text;
  browser_role text;
BEGIN
  FOREACH target_table IN ARRAY ARRAY['public.artistas', 'public.feedbacks'] LOOP
    FOREACH browser_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF has_table_privilege(browser_role, target_table, 'SELECT')
         OR has_table_privilege(browser_role, target_table, 'INSERT')
         OR has_table_privilege(browser_role, target_table, 'UPDATE')
         OR has_table_privilege(browser_role, target_table, 'DELETE') THEN
        RAISE EXCEPTION 'A-03: acesso efetivo de browser permanece; rollback da transação';
      END IF;
    END LOOP;

    IF NOT (has_table_privilege('service_role', target_table, 'SELECT')
            AND has_table_privilege('service_role', target_table, 'INSERT')
            AND has_table_privilege('service_role', target_table, 'UPDATE')
            AND has_table_privilege('service_role', target_table, 'DELETE')) THEN
      RAISE EXCEPTION 'A-03: service_role sem CRUD efetivo; rollback da transação';
    END IF;
  END LOOP;

  FOREACH target_sequence IN ARRAY ARRAY[
    'public.artistas_id_seq', 'public.feedbacks_id_seq'] LOOP
    FOREACH browser_role IN ARRAY ARRAY['anon', 'authenticated'] LOOP
      IF has_sequence_privilege(browser_role, target_sequence, 'USAGE')
         OR has_sequence_privilege(browser_role, target_sequence, 'SELECT')
         OR has_sequence_privilege(browser_role, target_sequence, 'UPDATE') THEN
        RAISE EXCEPTION 'A-03: acesso efetivo de browser à sequence permanece; rollback da transação';
      END IF;
    END LOOP;
  END LOOP;

  IF (SELECT rolbypassrls FROM pg_roles WHERE rolname = 'service_role')
     IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'A-03: service_role sem BYPASSRLS; revisão obrigatória';
  END IF;
END
$assertions$;

COMMIT;

-- ============================================================================
-- POSTCHECK — SOMENTE LEITURA. Rodar APÓS a transação e comparar com PRECHECK.
-- ============================================================================

-- RLS deve estar ativo nas duas tabelas; ambas devem continuar existindo.
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('artistas', 'feedbacks')
ORDER BY tablename;

SELECT to_regclass('public.artistas') IS NOT NULL AS artistas_existe,
       to_regclass('public.feedbacks') IS NOT NULL AS feedbacks_existe;

-- Nenhuma policy pública foi criada; listar todas para detectar divergência.
SELECT *
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('artistas', 'feedbacks')
ORDER BY tablename, policyname;

-- As duas consultas seguintes devem retornar zero linhas para browser roles.
SELECT grantee, table_schema, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('artistas', 'feedbacks')
  AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;

SELECT grantee, object_schema, object_name AS sequence_name, privilege_type
FROM information_schema.role_usage_grants
WHERE object_schema = 'public'
  AND object_name IN ('artistas_id_seq', 'feedbacks_id_seq')
  AND grantee IN ('anon', 'authenticated')
ORDER BY object_name, grantee, privilege_type;

-- Privilégio efetivo de anon/authenticated deve ser false em todas as colunas;
-- service_role deve preservar acesso às tabelas.
SELECT c.relname AS tabela, r.rolname AS papel,
       has_table_privilege(r.oid, c.oid, 'SELECT') AS pode_select,
       has_table_privilege(r.oid, c.oid, 'INSERT') AS pode_insert,
       has_table_privilege(r.oid, c.oid, 'UPDATE') AS pode_update,
       has_table_privilege(r.oid, c.oid, 'DELETE') AS pode_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
  AND c.relname IN ('artistas', 'feedbacks')
  AND r.rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY c.relname, r.rolname;

SELECT c.relname AS sequence_name, r.rolname AS papel,
       has_sequence_privilege(r.oid, c.oid, 'USAGE') AS pode_usage,
       has_sequence_privilege(r.oid, c.oid, 'SELECT') AS pode_select,
       has_sequence_privilege(r.oid, c.oid, 'UPDATE') AS pode_update
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN pg_roles r
WHERE n.nspname = 'public'
  AND c.relkind = 'S'
  AND c.relname IN ('artistas_id_seq', 'feedbacks_id_seq')
  AND r.rolname IN ('anon', 'authenticated', 'service_role')
ORDER BY c.relname, r.rolname;

-- Comparar com as contagens registradas antes, considerando escritas legítimas
-- entre as medições. A migration em si não escreve linhas.
SELECT COUNT(*) AS artistas_depois FROM public.artistas;
SELECT COUNT(*) AS feedbacks_depois FROM public.feedbacks;

-- Comparar lista e propriedades de colunas com o PRECHECK; deve ser idêntica.
SELECT table_name, ordinal_position, column_name, data_type, udt_name,
       is_nullable, column_default, is_identity, identity_generation
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('artistas', 'feedbacks')
ORDER BY table_name, ordinal_position;

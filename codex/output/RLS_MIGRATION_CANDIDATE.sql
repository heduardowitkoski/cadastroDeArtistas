-- ============================================================================
-- MIGRAÇÃO CANDIDATA DE SEGURANÇA — NÃO EXECUTADA
-- ============================================================================

-- Preserva tabelas e estrutura.
-- Os dados atuais são fictícios, mas esta migration continua sendo incremental
-- para validar o procedimento que será utilizado futuramente com dados reais.
--
-- NÃO usar backend/supabase.sql em banco existente:
-- o script antigo contém DROP TABLE, recriação de tabelas e desativação de RLS.
--
-- PRÉ-CONDIÇÕES:
-- 1. API NestJS configurada com SUPABASE_SECRET_KEY somente no servidor.
-- 2. SUPABASE_PUBLISHABLE_KEY usada separadamente para autenticação.
-- 3. Secret key nunca exposta ao frontend.
-- 4. Guards negativos da API testados.
-- 5. Browser não realiza leitura/escrita direta em public.artistas/public.feedbacks.
-- 6. Triggers, funções/RPC e views dependentes revisados.
--
-- Arquitetura esperada:
--
-- Browser
--    -> Supabase Auth (Publishable key)
--    -> NestJS API
--          -> AuthGuard / AdminGuard
--          -> Supabase Secret key
--          -> PostgreSQL
--
-- O browser NÃO acessa diretamente artistas/feedbacks pela Data API.


-- ============================================================================
-- 1. PRÉ-FLIGHT: RLS E QUANTIDADE DE REGISTROS
-- ============================================================================

SELECT
    c.relname,
    c.relrowsecurity,
    c.relforcerowsecurity
FROM pg_class c
JOIN pg_namespace n
    ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('artistas', 'feedbacks');


SELECT
    'artistas' AS tabela,
    COUNT(*) AS quantidade
FROM public.artistas

UNION ALL

SELECT
    'feedbacks' AS tabela,
    COUNT(*) AS quantidade
FROM public.feedbacks;


-- ============================================================================
-- 2. GRANTS DIRETOS DAS TABELAS
-- ============================================================================

SELECT
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name IN ('artistas', 'feedbacks')
ORDER BY
    table_name,
    grantee,
    privilege_type;


-- ============================================================================
-- 3. PRIVILÉGIOS EFETIVOS
-- ============================================================================

SELECT
    c.relname,
    r.rolname,

    has_table_privilege(
        r.oid,
        c.oid,
        'SELECT'
    ) AS can_select,

    has_table_privilege(
        r.oid,
        c.oid,
        'INSERT'
    ) AS can_insert,

    has_table_privilege(
        r.oid,
        c.oid,
        'UPDATE'
    ) AS can_update,

    has_table_privilege(
        r.oid,
        c.oid,
        'DELETE'
    ) AS can_delete

FROM pg_class c

JOIN pg_namespace n
    ON n.oid = c.relnamespace

CROSS JOIN pg_roles r

WHERE n.nspname = 'public'
  AND c.relname IN ('artistas', 'feedbacks')
  AND r.rolname IN (
      'anon',
      'authenticated',
      'service_role'
  )

ORDER BY
    c.relname,
    r.rolname;


-- ============================================================================
-- 4. IDENTITY / SERIAL / SEQUENCES
-- ============================================================================

SELECT
    table_name,
    column_name,
    is_identity,
    identity_generation,

    pg_get_serial_sequence(
        format('%I.%I', table_schema, table_name),
        column_name
    ) AS sequence_name

FROM information_schema.columns

WHERE table_schema = 'public'
  AND table_name IN ('artistas', 'feedbacks')

ORDER BY
    table_name,
    ordinal_position;


-- Grants atuais das sequences.
-- Corrigido: role_usage_grants usa object_name, e não sequence_name.

SELECT
    object_name AS sequence_name,
    grantee,
    privilege_type
FROM information_schema.role_usage_grants
WHERE object_schema = 'public'
  AND object_type = 'SEQUENCE'
ORDER BY
    object_name,
    grantee,
    privilege_type;


-- ============================================================================
-- 5. TRIGGERS
-- ============================================================================

SELECT
    t.tgrelid::regclass AS tabela,
    t.tgname,
    pg_get_triggerdef(t.oid) AS definicao,
    t.tgfoid::regprocedure AS funcao,
    p.prosecdef AS security_definer

FROM pg_trigger t

JOIN pg_proc p
    ON p.oid = t.tgfoid

WHERE NOT t.tgisinternal
  AND t.tgrelid IN (
      'public.artistas'::regclass,
      'public.feedbacks'::regclass
  );


-- ============================================================================
-- 6. FUNÇÕES / RPC NO SCHEMA PUBLIC
-- ============================================================================

SELECT
    p.oid::regprocedure AS funcao,
    p.prosecdef AS security_definer,

    has_function_privilege(
        'anon',
        p.oid,
        'EXECUTE'
    ) AS anon_execute,

    has_function_privilege(
        'authenticated',
        p.oid,
        'EXECUTE'
    ) AS authenticated_execute

FROM pg_proc p

JOIN pg_namespace n
    ON n.oid = p.pronamespace

WHERE n.nspname = 'public';


-- ============================================================================
-- 7. VIEWS / MATERIALIZED VIEWS DEPENDENTES
-- ============================================================================

SELECT DISTINCT
    v.oid::regclass AS objeto_dependente,
    v.relkind

FROM pg_depend d

JOIN pg_rewrite rw
    ON rw.oid = d.objid

JOIN pg_class v
    ON v.oid = rw.ev_class

WHERE d.refobjid IN (
    'public.artistas'::regclass,
    'public.feedbacks'::regclass
)

AND v.oid NOT IN (
    'public.artistas'::regclass,
    'public.feedbacks'::regclass
);


-- ============================================================================
-- 8. BLOCO DE ALTERAÇÃO
--
-- NÃO EXECUTAR antes de:
-- - backend estar configurado com SUPABASE_SECRET_KEY;
-- - API real ter sido validada contra este Supabase;
-- - resultados do pré-flight terem sido revisados.
-- ============================================================================

BEGIN;


-- --------------------------------------------------------------------------
-- Ativar Row Level Security
-- --------------------------------------------------------------------------

ALTER TABLE public.artistas
    ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.feedbacks
    ENABLE ROW LEVEL SECURITY;


-- --------------------------------------------------------------------------
-- Bloquear acesso direto às tabelas pelos papéis usados no browser
-- --------------------------------------------------------------------------

REVOKE ALL PRIVILEGES
ON TABLE public.artistas
FROM anon, authenticated;

REVOKE ALL PRIVILEGES
ON TABLE public.feedbacks
FROM anon, authenticated;


-- --------------------------------------------------------------------------
-- Bloquear também uso direto das sequences pelo browser
--
-- Inventário realizado:
-- public.artistas_id_seq
-- public.feedbacks_id_seq
--
-- service_role/postgres NÃO são afetados.
-- --------------------------------------------------------------------------

REVOKE ALL PRIVILEGES
ON SEQUENCE public.artistas_id_seq
FROM anon, authenticated;

REVOKE ALL PRIVILEGES
ON SEQUENCE public.feedbacks_id_seq
FROM anon, authenticated;


COMMIT;


-- ============================================================================
-- 9. PÓS-APLICAÇÃO
-- ============================================================================

-- Depois da aplicação controlada:
--
-- 1. Repetir as consultas de RLS.
-- 2. Repetir os grants das tabelas.
-- 3. Repetir os grants das sequences.
-- 4. Confirmar que service_role continua com acesso.
-- 5. Testar diretamente com Publishable key:
--
--    SELECT artistas       -> deve falhar
--    INSERT artista        -> deve falhar
--    UPDATE artista        -> deve falhar
--    DELETE artista        -> deve falhar
--    SELECT feedbacks      -> deve falhar
--
-- 6. Testar pela API NestJS:
--
--    GET  /artistas/aprovados  -> deve funcionar
--    POST /artistas            -> deve funcionar e criar Pendente
--    POST /feedbacks           -> deve funcionar
--
-- 7. Com admin autenticado:
--
--    GET    /artistas
--    PATCH  /artistas/:id/status
--    PUT    /artistas/:id
--    DELETE /artistas/:id
--    GET    /feedbacks
--    DELETE /feedbacks/:id
--
--    Todos devem continuar funcionando.
--
-- 8. Usuário sem token:
--    rotas administrativas -> 401
--
-- 9. Usuário autenticado sem papel admin:
--    rotas administrativas -> 403
--
-- Não criar policies públicas enquanto toda leitura/escrita dessas tabelas
-- continuar passando pela API NestJS.
-- Ticket #42: read-only inventory queries for the live PM_App project.
-- Run each query on its own in the Supabase SQL Editor (each one shows one
-- result table). None of them writes anything. Copy each result with
-- "Export > Copy as markdown" (or CSV) and paste it back.

-- Q1. Views and materialized views in public, with options and owner.
SELECT c.relname,
       c.relkind,
       c.reloptions,
       pg_get_userbyid(c.relowner) AS owner
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('v', 'm')
ORDER BY 1;

-- Q2. Effective privileges of app roles on every public view.
-- ("PUBLIC" is checked as the role name 'public'.)
SELECT c.relname,
       r.role_name,
       has_table_privilege(r.role_name, c.oid, 'SELECT')   AS sel,
       has_table_privilege(r.role_name, c.oid, 'INSERT')   AS ins,
       has_table_privilege(r.role_name, c.oid, 'UPDATE')   AS upd,
       has_table_privilege(r.role_name, c.oid, 'DELETE')   AS del,
       has_table_privilege(r.role_name, c.oid, 'TRUNCATE') AS trunc,
       has_table_privilege(r.role_name, c.oid, 'REFERENCES') AS refs,
       has_table_privilege(r.role_name, c.oid, 'TRIGGER')  AS trig
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
CROSS JOIN (VALUES ('public'), ('anon'), ('authenticated')) AS r(role_name)
WHERE n.nspname = 'public'
  AND c.relkind IN ('v', 'm')
ORDER BY 1, 2;

-- Q3. Rules and INSTEAD OF triggers on public views (these would make a view
-- writable even though it has a join).
SELECT c.relname, 'rule' AS kind, r.rulename AS name, r.ev_type::text AS event
FROM pg_rewrite r
JOIN pg_class c ON c.oid = r.ev_class
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('v', 'm') AND r.rulename <> '_RETURN'
UNION ALL
SELECT c.relname, 'trigger', t.tgname, t.tgtype::text
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind IN ('v', 'm') AND NOT t.tgisinternal
ORDER BY 1, 3;

-- Q4. Write privileges of anon / authenticated on public tables, with RLS
-- status (a view can stay writable through its base tables).
SELECT c.relname,
       c.relrowsecurity      AS rls,
       c.relforcerowsecurity AS force_rls,
       concat_ws(',',
         CASE WHEN has_table_privilege('anon', c.oid, 'SELECT')   THEN 'S' END,
         CASE WHEN has_table_privilege('anon', c.oid, 'INSERT')   THEN 'I' END,
         CASE WHEN has_table_privilege('anon', c.oid, 'UPDATE')   THEN 'U' END,
         CASE WHEN has_table_privilege('anon', c.oid, 'DELETE')   THEN 'D' END,
         CASE WHEN has_table_privilege('anon', c.oid, 'TRUNCATE') THEN 'T' END) AS anon_privs,
       concat_ws(',',
         CASE WHEN has_table_privilege('authenticated', c.oid, 'SELECT')   THEN 'S' END,
         CASE WHEN has_table_privilege('authenticated', c.oid, 'INSERT')   THEN 'I' END,
         CASE WHEN has_table_privilege('authenticated', c.oid, 'UPDATE')   THEN 'U' END,
         CASE WHEN has_table_privilege('authenticated', c.oid, 'DELETE')   THEN 'D' END,
         CASE WHEN has_table_privilege('authenticated', c.oid, 'TRUNCATE') THEN 'T' END) AS auth_privs,
       (SELECT string_agg(DISTINCT a.attname || ':' || p.privilege_type, ' ')
          FROM information_schema.column_privileges p
          JOIN pg_attribute a ON a.attrelid = c.oid AND a.attname = p.column_name
         WHERE p.table_schema = 'public' AND p.table_name = c.relname
           AND p.grantee = 'authenticated'
           AND p.privilege_type IN ('INSERT', 'UPDATE')
           AND NOT has_table_privilege('authenticated', c.oid, p.privilege_type)
       ) AS auth_column_writes
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind IN ('r', 'p')
ORDER BY 1;

-- Q5. Every function and procedure in public: security mode, fixed
-- search_path (proconfig), owner, who can EXECUTE, and whether it belongs to
-- an extension.
SELECT p.proname,
       pg_get_function_identity_arguments(p.oid) AS args,
       CASE p.prokind WHEN 'f' THEN 'function' WHEN 'p' THEN 'procedure'
                      WHEN 'a' THEN 'aggregate' WHEN 'w' THEN 'window' END AS kind,
       CASE WHEN p.prosecdef THEN 'SECURITY DEFINER' ELSE 'SECURITY INVOKER' END AS security,
       p.proconfig,
       pg_get_userbyid(p.proowner) AS owner,
       pg_get_function_result(p.oid) AS returns,
       has_function_privilege('anon', p.oid, 'EXECUTE')          AS anon_exec,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS auth_exec,
       has_function_privilege('service_role', p.oid, 'EXECUTE')  AS service_exec,
       (SELECT e.extname FROM pg_depend d JOIN pg_extension e ON e.oid = d.refobjid
         WHERE d.classid = 'pg_proc'::regclass AND d.objid = p.oid AND d.deptype = 'e'
         LIMIT 1) AS extension,
       p.proacl::text AS acl
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
ORDER BY 1, 2;

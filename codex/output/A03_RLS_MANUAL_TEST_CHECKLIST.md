# A-03 — checklist manual supervisionado

Preparado em 07/10/2026. **Nenhuma etapa remota foi executada nesta rodada.** Operador responsável deve registrar data, ambiente, resultados e evidências sem copiar chaves, tokens, CPF/CNPJ ou feedback privado. Não usar `backend/supabase.sql`.

## 0. Bloqueadores antes de considerar aplicação

- [ ] Vercel **Production**: em Project Settings → Environment Variables, configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Confirmar também `VITE_API_URL` apontando para a API Render correta; o código usa `http://localhost:3001` se essa terceira variável faltar. Usar somente a chave **Publishable** no Vercel. Para Preview e Development, configurar as mesmas variáveis com valores do ambiente correspondente quando esses ambientes forem usados.
- [ ] Vercel Project Settings → Build and Deployment: confirmar **Root Directory = `frontend`**, Framework Preset = Vite (ou comando equivalente), Build Command = `npm run build`, Output Directory = `dist`. `frontend/vercel.json` contém a rewrite SPA para `/index.html`. Nenhum impedimento a `VITE_*` foi encontrado no repositório; as configurações efetivas do painel não foram acessadas nesta rodada.
- [ ] Criar **novo deploy/redeploy** após salvar as variáveis. Vite incorpora `VITE_*` durante o build; o deploy existente não muda retroativamente. Abrir [produção](https://cadastro-de-artistas.vercel.app/) e confirmar bundle sem erro, catálogo, `/cadastrar`, `/feedback` e `/admin/login`. Verificar no DevTools que nenhum padrão `sb_secret_` aparece no bundle, Network ou Local Storage. Não usar uma Secret key para testar o browser.
- [ ] Render: confirmar **nomes e presença**, sem exibir valores, de `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`; a última existe somente no backend. Confirmar deploy e API de saúde/rotas públicas funcionando com o Supabase de destino. Não encaminhar sessão/JWT do usuário ao cliente DB privilegiado.
- [ ] Supabase Authentication → URL Configuration: conferir Site URL `https://cadastro-de-artistas.vercel.app`. O login atual usa senha, sem callback explícito; adicionar Redirect URLs somente quando um fluxo real de redirecionamento for definido/testado. Não mudar configuração nesta rodada.
- [ ] Confirmar backup recuperável e procedimento de restauração. Registrar contagens atuais de artistas/feedbacks, schema/colunas, ACLs, RLS, policies, sequences, funções, triggers, views e consumidores externos legítimos. Não presumir que ainda existam 11/3 registros.

**Gate:** se qualquer caixa acima falhar, **não aplicar a migration**. O site de produção estava em branco em 07/10/2026; o navegador registrou o erro de configuração `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`. O projeto Vercel deve ser corrigido, redeployado e validado antes da mudança no banco.

## 1. PRECHECK SQL e revisão

- [ ] No SQL Editor do projeto/ambiente correto, executar **somente o bloco PRECHECK** de `RLS_MIGRATION_FINAL.sql`. Salvar as saídas, sem dados pessoais no relatório compartilhado.
- [ ] Verificar `pg_tables.rowsecurity=false` para ambas as tabelas, `pg_policies` vazio e existência das duas sequences nomeadas. Conferir grants de tabela e sequences (`role_usage_grants.object_name`), privilégios efetivos de `anon`, `authenticated` e `service_role`, inclusive efeitos de PUBLIC/herança.
- [ ] Conferir contagens e colunas; comparar com backup. Revisar triggers, views/materialized views e todas as funções públicas com EXECUTE por browser, inclusive SQL dinâmico que não apareça na triagem textual.
- [ ] Confirmar que outro cliente não usa Data API direta para `artistas`/`feedbacks` e que `service_role` tem CRUD e `BYPASSRLS`. Se o inventário divergir da premissa, parar e revisar o SQL antes de aplicar.
- [ ] Antes da mudança, executar os testes positivos e negativos da API NestJS abaixo com dados fictícios. O backend deve funcionar com Secret key sem depender dos grants do browser.

## 2. Aplicação controlada

- [ ] Selecionar e executar **somente o bloco MIGRATION** de `RLS_MIGRATION_FINAL.sql` após revisão humana. O bloco usa transação e aborta se tabelas/sequences/policies diferirem do esperado, se acesso efetivo do browser persistir ou se `service_role` perder CRUD/BYPASSRLS. Registrar sucesso/erro sem valores de chave.
- [ ] Não adicionar policies públicas para manter comportamento antigo. O caminho aprovado é Browser → NestJS → banco; a Secret key do NestJS usa `service_role` sem sessão de usuário.

## 3. POSTCHECK SQL

- [ ] Executar **somente o bloco POSTCHECK** do mesmo arquivo. Exigir duas tabelas existentes, RLS `true`, zero grants diretos de `anon`/`authenticated` nas duas tabelas/sequences e `has_*_privilege=false` para esses papéis. `service_role` deve manter CRUD e BYPASSRLS.
- [ ] Comparar contagens e lista completa de colunas com o PRECHECK/backup. Nenhuma linha ou coluna deve ser perdida pela migration. Listar policies (esperado: nenhuma).
- [ ] Se qualquer pós-condição falhar, parar e tratar como incidente; não declarar A-03 concluído.

## 4. Testes positivos via NestJS, com registros fictícios

| Ação | Resultado obrigatório |
|---|---|
| `GET /artistas/aprovados` sem login | 200, apenas aprovados, sem `cpf_cnpj`, `email`, `status`, `created_at` em qualquer item. |
| `POST /artistas` válido | 201 `{id,status:'Pendente'}`; conta Auth e ficha criadas pelo backend; verificar ambas no ambiente controlado. Guardar ID de teste para limpeza supervisionada. |
| `POST /feedbacks` válido | 201 e persistência privada; guardar ID de teste. |
| Admin com Bearer válido | `GET /artistas`, `GET /feedbacks`, `PATCH /artistas/:id/status`, `PUT /artistas/:id` funcionam. `DELETE` só para registro fictício expressamente separado para isso. |
| API sem token | `GET /artistas` e `GET /feedbacks` retornam 401; repetir PATCH/PUT/DELETE administrativos quando apropriado. |
| Usuário Auth comum sem papel admin | `GET /artistas` e `GET /feedbacks` retornam 403; testar mutações administrativas. |

Esses testes provam que o cliente privilegiado do NestJS continua operando depois de RLS/grants. Se falhar, **parar e não recomendar produção**. Ao limpar fixtures, conferir ficha, feedback e conta Auth de teste para não deixar órfãos; nunca excluir registros reais como teste.

## 5. Testes negativos diretos à Data API

Executar de cliente externo isolado com `SUPABASE_URL` e **somente** `SUPABASE_PUBLISHABLE_KEY` no header `apikey`. A Publishable key **não é JWT**: não enviá-la como `Authorization: Bearer`. Para testar o papel `authenticated`, acrescentar um JWT de **usuário de teste sem papel admin** no header `Authorization`, mantendo `apikey` Publishable. Não incluir chaves/tokens em relatório, captura de tela, histórico de comandos compartilhado ou logs. Referência: [API keys do Supabase](https://supabase.com/docs/guides/getting-started/api-keys).

Usar IDs e e-mails de fixtures fictícias, criadas para esta verificação em ambiente controlado. Para INSERT, o payload deve ser estruturalmente válido; erro de validação não comprova bloqueio por grants/RLS. Conferir estado pelo SQL Editor ou API admin antes/depois de cada tentativa. Se uma tentativa inesperadamente funcionar, interromper o teste, preservar evidência sem dados privados e limpar **somente** a fixture sob supervisão.

| Operação direta `/rest/v1/` | Corpo/alvo de teste | Resultado obrigatório |
|---|---|---|
| `GET artistas?select=id,email,cpf_cnpj&limit=1` | nenhum | Negada; nenhum dado privado retornado. |
| `GET feedbacks?select=id,email,mensagem&limit=1` | nenhum | Negada; nenhum feedback retornado. |
| `POST artistas` | nome, e-mail fictício único, área e demais campos válidos | Negada; contagem e busca admin não mostram nova ficha. |
| `PATCH artistas?id=eq.<ID_FICTICIO>` | mudança controlada de nome/status de fixture | Negada; fixture permanece igual. |
| `DELETE artistas?id=eq.<ID_FICTICIO>` | fixture descartável | Negada; fixture permanece. |
| `POST feedbacks` | tipo, nota e mensagem fictícios válidos | Negada; contagem e busca admin não mostram novo feedback. |
| `DELETE feedbacks?id=eq.<ID_FICTICIO>` | fixture descartável | Negada; fixture permanece. |

Repetir com Publishable key sem sessão (`anon`) e com JWT do usuário de teste (`authenticated`). Não depender de um status HTTP específico: exigir operação negada, resposta sem dados privados e ausência de mudança persistida. Revisar também qualquer view/RPC exposta identificada no PRECHECK.

## 6. Recuperação controlada

- Se o bloco transacional abortar, confirmar que RLS/grants permaneceram no estado anterior e **não** repetir às cegas. Revisar o inventário que causou a exceção.
- Se a API falhar por configuração Render/chave, corrigir/redeployar o backend primeiro, mantendo RLS/grants restritivos. Confirmar que o cliente DB usa Secret key sem JWT de usuário.
- Se o único problema comprovado for perda de privilégio do papel servidor, após revisão do operador usar **somente** grants de CRUD ao `service_role` nas duas tabelas e `USAGE, SELECT` nas duas sequences, conforme a necessidade real; registrar ACL antes/depois. Isso não reabre acesso a `anon`/`authenticated`.
- Não desabilitar RLS como rollback automático. Não restaurar grants amplos do browser para fazer o site funcionar: isso reabriria o P0. Uma exceção operacional exige decisão humana específica e plano temporário de contenção. O rollback é contingência, nunca configuração permanente.

## 7. Critério de encerramento

A-03 só pode passar de **P0 aberto** para resolvido após: SQL aplicado, RLS ativo, grants browser removidos, sete operações diretas negadas, fluxos públicos/admin positivos via NestJS, contagens/estrutura preservadas e nenhum segredo exposto. Guardar resultados sem dados privados.

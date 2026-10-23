# Diagnóstico backend pós-RLS / Render / Secret Key — 07/10/2026

## 1. RESUMO EXECUTIVO

Objetivo: explicar os HTTP 500 observados no Render em `GET /artistas/aprovados` e `POST /feedbacks` depois da aplicação do RLS, sem mudar o banco. **Estado final: parcialmente concluído; homologação e diagnóstico do Render bloqueados pelo ambiente remoto.** O código local já separava Auth (Publishable) e banco (Secret). Corrigi a falha de inicialização pouco informativa e o tratamento/log de erro do banco. Os 48 E2E, 8 unitários, typecheck, build e lint direcionado passam. O GET real via backend local retornou **503**, com `code=unknown, status=0`: a biblioteca Supabase/PostgREST não recebeu resposta HTTP. Isso não demonstra falha de autorização do banco, tampouco valida a Secret Key. A causa específica dos 500 no Render não foi comprovada sem acesso ao runtime/logs e um GET funcional.

O demandante informou a aplicação e o postcheck do RLS: `rowsecurity=true` em `public.artistas` e `public.feedbacks`, zero policies públicas, `anon`/`authenticated` sem CRUD/sequences, `service_role` com CRUD/BYPASSRLS/sequences, Data API com Publishable negada, estrutura preservada e contagem anterior de 13 artistas/5 feedbacks. Estes são resultados **manuais informados pelo demandante**, não repetidos nesta rodada.

## 2. ESCOPO EXECUTADO

Itens: A-03 (integração depois do RLS), A-23 (configuração backend), A-10 (cobertura local) e verificação de contenções A-01/A-02. Relação: RF-01/04/05/07/08/09/10/11; RNF-02/07; CT acesso negativo, catálogo público, feedback e configuração segura. Auditei configuração, duas instâncias Supabase, acessos a tabelas, guards, rotas, ambiente exemplar, Git/deploy versionado, erros e testes. Fora do escopo: frontend, Auth real de administrador, POST real, Render/Vercel/Supabase remoto, SQL, schema, RLS, grants, policies, dados e migrations.

## 3. ESTADO ANTES DA ALTERAÇÃO

- `backend/src/supabase/supabase.service.ts` já criava `authClient` com `SUPABASE_PUBLISHABLE_KEY` e `databaseClient` com `SUPABASE_SECRET_KEY`, mas ausência de qualquer variável produzia apenas `Missing Supabase configuration`, sem nomear a variável.
- `backend/src/artistas/artistas.service.ts` e `backend/src/feedback/feedback.service.ts` faziam `throw new Error(error.message)` em leituras/alterações. O Nest respondia 500 genérico e o servidor não registrava, de modo controlado, tabela/operação/código. Outros caminhos de `create` já devolviam erros genéricos, mas sem código técnico no log.
- `backend/src/auth/supabase-auth.guard.ts` usa `getAuthClient().auth.getUser(token)`; `AdminGuard` exige `app_metadata.role === 'admin'`. Nenhum `.from(...)` usa `getAuthClient()` e nenhum Bearer/sessão de usuário é anexado ao `databaseClient`.
- A evidência do Render é o relato do demandante: GET aprovados e POST feedbacks passaram a 500. Não havia log do Render disponível aqui para determinar qual chave, commit ou erro a instância publicada usa.

## 4. ALTERAÇÕES IMPLEMENTADAS

| Arquivo / componente | Antes → depois | Motivo |
|---|---|---|
| `backend/src/supabase/supabase.service.ts` / construtor | Checagem genérica → faz `trim`, enumera apenas **nomes** de variáveis ausentes e falha antes de criar clientes | Fail-closed diagnóstico, sem revelar valores e sem fallback de chave |
| `backend/src/supabase/database-error.ts` / novo helper | Erros sem contexto seguro → registra tabela, operação, código em formato restrito e status numérico quando disponível; responde 503 genérico | Distinguir falha do banco sem expor mensagem, payload ou credenciais |
| `backend/src/artistas/artistas.service.ts` / leituras, inserção e mutações | Exceção crua/sem código → helper seguro nos erros retornados; GET aprovados também registra status HTTP/transport da resposta Supabase | Diagnóstico de rota afetada e resposta estável ao cliente |
| `backend/src/feedback/feedback.service.ts` / CRUD | Exceção crua → helper seguro, logger por service e resposta 503 | Diagnóstico de POST feedback e demais acessos |
| `backend/src/supabase/supabase.service.spec.ts` | Checagens parciais → cobre URL, Publishable e Secret ausentes, chaves legadas sem fallback, ordem/valores fictícios dos clientes, opções sem persistência, instâncias distintas | Provar separação e fail-closed |
| `backend/test/app.e2e-spec.ts` | Sem cenários de falha de leitura | Dois E2E verificam HTTP 503, resposta sem marcador privado, log com código restrito e `status=0` seguro | Evitar vazamento e mostrar falha de transporte |

### Inventário de rotas (contrato atual)

| Método e caminho | Auth/papel | DTO | Resposta esperada / referência |
|---|---|---|---|
| GET `/artistas` | Bearer/admin | — | Lista completa; RF-07/08/09 |
| GET `/artistas/aprovados` | Público | — | Lista de colunas públicas; RF-04/05 |
| POST `/artistas` | Público | `CreateArtistaDto` | Cadastro Pendente; RF-01/02 |
| PATCH `/artistas/:id/status` | Bearer/admin | `UpdateStatusDto` | Artista atualizado; RF-08/10 |
| PUT `/artistas/:id` | Bearer/admin | `UpdateArtistaDto` | Artista atualizado; RF-09 |
| DELETE `/artistas/:id` | Bearer/admin | — | Mensagem de exclusão; RF-10 |
| GET `/feedbacks` | Bearer/admin | — | Lista privada; RF-11 |
| POST `/feedbacks` | Público | `CreateFeedbackDto` | Feedback criado; RF-11 |
| DELETE `/feedbacks/:id` | Bearer/admin | — | Mensagem de exclusão; RF-11 |

### Inventário de `.from(...)`

`backend/src/artistas/artistas.service.ts`: linhas 39 `select` completo, 52 `select` aprovado, 68 `select` por e-mail, 86 `insert`, 187 e 205 `update`, 218 `delete`. `backend/src/feedback/feedback.service.ts`: linhas 20 `select`, 33 `insert`, 45 `delete`. **10/10** usam `getDatabaseClient()` diretamente ou a variável local `databaseClient` obtida dele. Há chamadas Auth administrativas no service de artistas, também no cliente servidor; não são `.from(...)`. `backend/src/auth/supabase-auth.guard.ts:25-26` faz somente `getAuthClient().auth.getUser(token)`. Não foram encontrados `setSession`, `access_token` ou injeção de `Authorization` no cliente privilegiado em `backend/src`.

## 5. ARQUIVOS ALTERADOS

**Criados:** `backend/src/supabase/database-error.ts`; `codex/output/BACKEND_POST_RLS_RENDER_REPORT.md`.

**Modificados:** `backend/src/supabase/supabase.service.ts`, `backend/src/supabase/supabase.service.spec.ts`, `backend/src/artistas/artistas.service.ts`, `backend/src/feedback/feedback.service.ts`, `backend/test/app.e2e-spec.ts`, `codex/output/BACKLOG_PRIORIZADO.md`, `codex/output/MATRIZ_RASTREABILIDADE.md`, `codex/output/RLS_ACCESS_MATRIX.md`.

**Removidos:** nenhum. Arquivos em `codex/` podem estar ignorados pelo Git; foram escritos localmente como artefatos de controle.

## 6. DECISÕES TÉCNICAS

- Mantida a separação já correta entre Auth/Publishable e Database/Secret. Sem fallback Publishable ou chaves legadas.
- O log permite apenas tabela/operação definidas no código, código de formato SQLSTATE/PostgREST ou `unknown`, e status numérico. `error.message`, `details`, `hint`, corpo HTTP e variáveis de ambiente não são registrados.
- Erro de acesso/transport do serviço de dados recebe HTTP 503 genérico. `23505` em cadastro continua 409, e a compensação de Auth já existente continua preservada.
- `status=0` é tratado como **falha antes de resposta HTTP**, conforme `backend/node_modules/@supabase/postgrest-js/dist/index.cjs` no tratamento de rejeição de `fetch` (retorno `status: 0`). Não inferi DNS, TLS, URL, firewall ou credencial específica sem evidência.
- Não foi inventada regra de negócio de artista, feedback, RLS ou autorização.

## 7. TESTES AUTOMATIZADOS

| Comando | Resultado exato |
|---|---|
| `npm run test:e2e -- --runInBand` (backend, execução final) | **Passou: 48/48**, 1 suíte; Supabase simulado |
| `npm test -- --runInBand` (backend, execução final) | **Passou: 8/8**, 3 suítes |
| `npx tsc --noEmit -p tsconfig.json` (backend) | Passou, exit 0 |
| `npm run build` (backend) | Passou, exit 0 |
| `npx eslint src/supabase/supabase.service.ts src/supabase/database-error.ts src/supabase/supabase.service.spec.ts src/artistas/artistas.service.ts src/feedback/feedback.service.ts test/app.e2e-spec.ts` | Passou, exit 0 |
| `git diff --check` | Passou, exit 0 |
| `git check-ignore -v backend/.env` | `.gitignore:45:**/.env backend/.env` |
| `git grep -l -I -P 'sb_secret_|SUPABASE_SECRET_KEY=\S+' -- . ':!backend/.env.example'` | Nenhum arquivo versionado correspondente, exit 1; busca mostrou somente nomes de arquivos |

Primeiras tentativas de Jest dentro do sandbox falharam **antes de executar testes**, por `EPERM realpath` no diretório temporário; definir `TEMP/TMP` para `node_modules` também resultou em `EPERM`. As execuções finais, autorizadas fora do sandbox, passaram. Warnings: E2E emite logs esperados de casos simulados de falha/compensação; `git diff --check` avisa futura conversão LF→CRLF no Windows, sem erro. `npm run lint` completo não foi usado porque o script inclui `--fix`; o lint exigido foi direcionado. Não houve teste automatizado contra Supabase real.

## 8. TESTES MANUAIS

**Testado pelo Codex:** backend compilado iniciado localmente na porta 3002 com a configuração carregada de `backend/.env` (arquivo/valor não exibido). Duas chamadas **somente GET** a `http://127.0.0.1:3002/artistas/aprovados` retornaram HTTP **503**, esperado 200. Primeira leitura: log `Supabase artistas.select failed (code=unknown)`; após incluir status seguro: `Supabase artistas.select failed (code=unknown, status=0)`. O corpo de artistas e o erro bruto não foram impressos. Processo local encerrado. Não houve POST real.

**Ainda precisa ser testado pelo responsável:** no Render, startup do novo deploy; GET aprovados 200; depois POST `/feedbacks` com dado fictício, apenas se GET funcionar; cenários admin com conta autorizada; verificação de frontend Vercel e Auth real. Navegador/viewport não se aplicam ao GET local via PowerShell.

## 9. ERROS / LIMITAÇÕES ENCONTRADAS

- O GET real local falhou `503`; a resposta de PostgREST indica `status=0`, portanto **não houve resposta HTTP do Supabase** nesse teste. Impede concluir que a Secret Key local funciona, que o RLS bloqueia o cliente Secret, ou que o Render tem somente variável errada.
- Sem acesso ao painel/logs/deploy do Render, seus valores, branch, Root Directory, Environment Group, commit e mensagem de erro não foram conferidos. O 500 publicado é relato do demandante, não uma chamada repetida nesta rodada.
- Nenhum arquivo versionado de deploy Render (`render.yaml`, `Dockerfile`, `Procfile`) foi encontrado. `main.ts` aceita `PORT`; `AppModule` carrega ConfigModule global. A configuração real do serviço permanece no painel.
- O POST real de feedback e rotas admin não foram executados por restrição expressa. Os E2E usam Supabase simulado.

## 10. RISCOS RESTANTES

| Prioridade | Risco |
|---|---|
| **P0** | Backend Render segue com GET/POST 500 conforme relato; disponibilidade dos fluxos públicos continua comprometida até configuração/redeploy/GET positivo. A-03 não encerrado. |
| **P1** | Falha de transporte no ambiente local (`status=0`) impede prova da Secret Key e da integração RLS; origem (rede, URL, TLS, proxy etc.) não determinada. |
| **P1** | Deploy Render pode usar commit/configuração/env antigos; ausência de acesso impede confirmar. |
| **P2** | Cadastro e feedback com Supabase real, Auth admin e percurso frontend publicado não foram homologados. |

## 11. PENDÊNCIAS

1. Operador do Render: confirmar `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` no serviço **backend** e em eventual Environment Group. Colocar a nova chave no campo `SUPABASE_SECRET_KEY`; não transcrevê-la em ticket/log/repositório/chat.
2. Salvar Environment Variables, fazer novo deploy/redeploy de um commit que contenha esta correção e a separação de clientes; comparar o SHA do deploy com Git. O checkout auditado estava em `main`, `1c0d2077aca05cdc7b92c71a1f5e4919afcf2e21` **antes de versionar as mudanças desta rodada**. O commit histórico que introduziu `databaseClient` Secret é `12bfd96`. Checar Root Directory `backend`, Build Command, Start Command e branch selecionada no painel. Não há endpoint público de diagnóstico.
3. Verificar logs de startup: se variável faltar, a aplicação deve falhar nomeando apenas a variável; se iniciar, testar GET `/artistas/aprovados`. Se falhar, registrar somente status/código seguro e verificar conectividade/URL/Secret no painel. `status=0` aponta para transporte antes do HTTP; `42501` indicaria permissão, mas não foi observado localmente.
4. Depois de GET 200, testar POST `/feedbacks` com dados fictícios e administrador com papel correto, em ambiente autorizado; inspecionar os registros sem publicar conteúdo privado.
5. Confirmar que frontend/Vercel tem somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`, nunca Secret. Resolver pendência A-22/Vercel registrada nos relatórios anteriores.

## 12. REGRESSÕES

Nenhuma regressão foi encontrada nos 48 E2E e 8 unitários executados, typecheck, build e lint direcionado. A resposta a erro de leitura/mutação do banco mudou intencionalmente de 500 para 503 genérico. Fluxos reais de gravação, Auth real, Render e Vercel não foram cobertos; o GET real local continua falhando, logo não há comprovação de restauração operacional.

## 13. SEGURANÇA

Nenhum segredo foi introduzido no código/testes/docs. `backend/.env` existe e está ignorado (`git check-ignore` acima); seu conteúdo não foi aberto, impresso, copiado ou versionado. `backend/.env.example` contém somente os três nomes vazios esperados. Busca por arquivos versionados não encontrou valor com `sb_secret_` ou atribuição não vazia de `SUPABASE_SECRET_KEY`. Nenhuma Secret Key foi exposta ao frontend ou log. Nenhum token/JWT de usuário é anexado ao cliente de banco. A proteção administrativa da API não foi alterada.

## 14. BANCO / AMBIENTE REMOTO

**Nenhuma alteração de banco, dados, schema, RLS, grants, policies ou sequences. Nenhuma migration.** `backend/supabase.sql` não foi executado. Supabase/Vercel/Render não foram configurados nem modificados pelo Codex. A única interação autorizada com dados remotos foi a tentativa de leitura GET via backend local; sem resposta HTTP do Supabase (`status=0`). Demais ações foram locais: código, testes, build e documentação.

## 15. PRÓXIMOS PASSOS RECOMENDADOS

1. Revisar as três variáveis backend no Render/Environment Group, branch, Root Directory e SHA; implantar commit que inclua esta rodada.
2. Checar log de startup e executar GET `/artistas/aprovados` no Render. Tratar o código/status técnico; confirmar 200 antes de qualquer POST.
3. Caso o GET ainda falhe, diagnosticar transporte ou HTTP no **runtime Render**, sem divulgar credenciais; repetir prova positiva do cliente Secret.
4. Somente então testar feedback fictício, rotas admin e frontend publicado; atualizar checklist A-03 com evidências reais.

## 16. STATUS DOS ITENS DO BACKLOG

| ID | Estado anterior → atual | Evidência | Validação ainda necessária |
|---|---|---|---|
| A-03 | P0 migration preparada/bloqueada → **RLS aplicado segundo postcheck do demandante; API Render ainda P0 bloqueada** | Relato manual de RLS/Data API; GET local 503 `status=0`; Render 500 relatado | GET 200 via Render, POST feedback e admin reais; não reexecutar migration |
| A-23 | P2 configuração operacional pendente → **fail-closed e separação provados localmente; Render pendente** | Unitários de dois `createClient`/faltas, `backend/.env.example`, `git check-ignore` | Variáveis/commit/Environment Group reais do Render |
| A-10 | P2 cobertura local parcial (46 E2E/6 unit) → **48 E2E/8 unit aprovados; integração parcial** | Comandos na seção 7 | Banco/Auth reais e fluxos completos |
| A-01/A-02 | Contenção da API, acesso direto pendente → **contenção de código preservada; acesso direto negado segundo demandante** | Guards/allowlist/services; 48 E2E simulados; postcheck informado | Homologação publicada com Supabase real |

## 17. DIFF FUNCIONAL RESUMIDO

**ANTES** → backend já tinha clientes separados, mas configuração ausente gerava erro genérico; falha Supabase em CRUD virava 500 sem contexto técnico controlado.

**DEPOIS** → inicialização aponta somente nomes de variáveis ausentes; falhas retornam 503 genérico e logam tabela/operação/código/status permitidos. A separação dos clientes e as regras de acesso permanecem as mesmas. GET real local ainda é 503 por falha antes de resposta HTTP.

## 18. CONFIRMAÇÃO FINAL

**Atendidos localmente:** auditoria de clientes/rotas/`.from`, fail-closed, log seguro, testes unitários/E2E/typecheck/build/lint, checagem de `.env` e relatório. **Parciais:** diagnóstico pós-RLS, pois a causa do 500 no Render e validade operacional da Secret Key não foram comprovadas; GET local foi 503 `status=0`. **Bloqueados:** homologação de GET/POST/admin no Render e encerramento de A-03 até o operador configurar/deployar e validar. **Não alterados:** frontend, autenticação/autorização de negócio, banco remoto, RLS, grants, schema, dados, migrations, Supabase/Vercel/Render e `backend/supabase.sql`.

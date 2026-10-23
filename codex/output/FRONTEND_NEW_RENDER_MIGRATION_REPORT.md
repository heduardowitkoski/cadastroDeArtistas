# Migração do frontend para o novo Render — 23/10/2026

## 1. RESUMO EXECUTIVO

O novo backend `https://cadastro-artistas-api-matheus.onrender.com` respondeu **200** em GET `/artistas/aprovados`; o antigo `https://cadastro-artistas-api.onrender.com` respondeu **500**. O bundle oficial da Vercel ainda contém o destino antigo. Código e bundle locais foram corrigidos para usar o novo Render em produção mesmo com VITE_API_URL antiga; DEV usa localhost:3001. **Correção local pronta; publicação oficial pendente. A-03 não encerrado.**

Analisados os **40 documentos existentes: 40 MD, zero MDX**, excluindo gerados. A reconciliação registra RLS já aplicado e leituras positivas locais/remotas, preservando o histórico. Os três novos documentos desta rodada elevam o inventário final a 43.

## 2. ESCOPO EXECUTADO

Auditoria documental, revisão individual A-01–A-23 e C-01–C-09, registro A-24/A-25 e C-10 operacional, inventário HTTP, configuração central DEV/PROD, TODOs nos fallbacks públicos, testes, leituras remotas e controle Git. Referências: RF-01/04/05/07/08/09/10/11, RNF-02/05/06/07 e CT integração/catálogo/privacidade/configuração.

Nenhuma implementação de negócio, redesign, alteração de fonte backend, SQL, RLS, grants, schema, Auth, SMTP ou Storage. Os prompts históricos foram lidos como documentação, sem executar suas rodadas. Nenhum POST/PATCH/DELETE remoto.

## 3. ESTADO ANTES

- Cinco definições independentes de API_URL, todas priorizando VITE_API_URL e usando localhost como fallback.
- Site oficial apontando ao backend antigo; trocar apenas o fallback não substituiria a variável antiga da Vercel.
- Documentos ainda diziam migração pendente, frontend branco ou backend local 503, apesar da evidência mais recente.
- Fallbacks públicos Supabase já existentes e autorizados; nenhum cliente de tabela/RPC no frontend ativo.
- `.gitignore` já estava modificado no início para ignorar `.env`, mas os dois arquivos ainda eram rastreados. HEAD local anterior continha Secret Key.

## 4. ALTERAÇÕES IMPLEMENTADAS

`frontend/src/lib/apiConfig.ts` concentra a única definição:

```ts
export const API_URL = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://cadastro-artistas-api-matheus.onrender.com'
```

Cinco consumidores diretos importam o módulo; AdminDashboard continua usando adminFetch. Removidas as definições locais e dependências de useEffect sobre a constante importada. Paths, payloads e Bearer preservados. EditarCadastro recebeu somente import/configuração; continua não roteado e não foi habilitado.

Os fallbacks públicos de supabase.ts foram preservados, sem mudar seus valores, e marcados com TODO **REMOVER ANTES DO DEPLOY PRD FINAL**. O mesmo compromisso está na configuração da API. Durante o workaround, VITE_API_URL fica ignorada; previews compilados também usam o novo Render.

Os dois `.env` foram removidos **somente do índice**, preservando seus arquivos locais sem ler, imprimir ou modificar seu conteúdo. Controles e documentos receberam reconciliação datada; decisões de negócio permanecem abertas.

## 5. ARQUIVOS ALTERADOS

Código: novo `frontend/src/lib/apiConfig.ts`; `frontend/src/lib/adminApi.ts`, `frontend/src/lib/supabase.ts`, `frontend/src/pages/Portal/Portal.tsx`, `frontend/src/pages/Cadastro/CadastroArtista.tsx`, `frontend/src/pages/Feedback/Feedback.tsx` e `frontend/src/pages/Artista/EditarCadastro.tsx`. `frontend/.env.example` inclui VITE_API_URL vazia e comentário sobre sua restauração futura.

Documentos atuais: READMEs da raiz/front/back, DOCUMENTACAO_PROJETO, ACESSIBILIDADE, diagramas MD, FONTES_E_PRECEDENCIA, CONFLITOS_E_DECISOES, BACKLOG_PRIORIZADO e MATRIZ_RASTREABILIDADE. Onze relatórios receberam aviso datado de histórico; lista completa em DOCUMENTATION_RECONCILIATION_REPORT.

Criados: este relatório, `DOCUMENTATION_RECONCILIATION_REPORT.md`, `NEW_RENDER_POST_DEPLOY_CHECKLIST.md`. Removidos do índice: backend/.env e frontend/.env, mantendo cópias locais. A mudança inicial de `.gitignore` foi preservada. Nenhum fonte backend, manifest, lockfile ou SQL alterado.

## 6. DECISÕES TÉCNICAS

DEV/PROD explícitos impedem interferência da env antiga da Vercel; recuperar a configuração externa é dívida A-24. Nenhuma dependência, proxy ou endpoint novo. Não foi necessário criar render.yaml ou health endpoint: o novo serviço já existe e esta rodada muda seu consumidor. O backend atual não registra `/health`.

Precedência solicitada: código atual, evidência manual recente, testes atuais, relatório mais recente, documentação histórica. Isso não transforma código em decisão de negócio C-02/C-03/C-04.

| Consumidor | Método/path | Entrada/status/tratamento | RF/CT |
|---|---|---|---|
| lib/apiConfig.ts | Configuração única | DEV local; PROD novo Render | A-22/A-24 |
| lib/adminApi.ts | fetch administrativo genérico | Obtém sessão, adiciona Bearer; erro sem sessão | RF-07 |
| Portal.tsx | GET /artistas/aprovados | 200 array; HTTP/formato, loading/erro/vazio | RF-04/05/06 |
| CadastroArtista.tsx | POST /artistas | Cadastro/senha; 201 Pendente ou 400/409/503 | RF-01/02 |
| Feedback.tsx | POST /feedbacks | Contato opcional/tipo/nota/mensagem; 201/erro | RF-11 |
| AdminDashboard.tsx | GET /artistas e /feedbacks | 200; estados separados via adminFetch | RF-07/11 |
| Mesmo arquivo | PATCH /artistas/:id/status | Status; 200; verifica HTTP e preserva estado em falha | RF-08/10 |
| Mesmo arquivo | PUT /artistas/:id | Allowlist admin/forceStatus; 200; erro mantém modal | RF-09 |
| Mesmo arquivo | DELETE /artistas/:id e /feedbacks/:id | Confirmação, 200/erro | RF-10/11 |
| EditarCadastro.tsx | GET /artistas e PUT /artistas/:id | Legado sem Bearer, não roteado | C-02/A-04 |

Busca no frontend inteiro não encontrou axios ou outro consumidor HTTP de tabelas. Utilitários backend de seed/fotos com localhost não são frontend e não foram executados. Auth público usa Publishable; Auth backend usa getAuthClient; artistas/feedbacks usam getDatabaseClient Secret, sem sessão/JWT do usuário. Nenhum acesso `.rpc()` localizado no código da aplicação.

## 7. TESTES AUTOMATIZADOS

| Comando/verificação | Resultado |
|---|---|
| Frontend: npm run lint | Passou, sem avisos |
| Frontend: npx tsc -b --noEmit | Passou |
| Frontend: npm test | 3/3 passaram |
| Frontend: npm run build, com VITE_API_URL antiga forçada | Passou; host novo presente, antigo e localhost ausentes |
| Backend: npm run test:e2e -- --runInBand | 48/48, Supabase simulado |
| Backend: npm test -- --runInBand | 8/8 |
| Backend: npx tsc --noEmit -p tsconfig.json | Passou |
| Backend: npm run build | Passou |
| Backend: npx eslint "{src,apps,libs,test}/**/*.ts" | Passou, sem --fix |
| git diff --check | Passou |
| Scanner rastreado/índice e bundle | Nenhum literal real de Secret Key/JWT service_role encontrado |

Aviso não bloqueante: chunk JS aproximadamente 548,33 kB acima de 500 kB. Nenhuma dependência atualizada. Gates backend repetidos para reconciliar a baseline documental, sem mudar fontes.

## 8. TESTES MANUAIS

| Leitura/verificação | Resultado |
|---|---|
| GET novo Render /artistas/aprovados, Origin oficial | 200, array sem email/CPF/status/created_at; CORS permite o site |
| GET antigo Render /artistas/aprovados | 500 |
| HTML/bundle oficial Vercel | Página 200; bundle contém host antigo, não o novo |
| Vite DEV real em http://localhost:5173 | HTML/módulo 200; exportação avaliada = localhost:3001, mesmo com env antiga forçada |
| Build de produção | Somente novo host da API; env antiga não interfere |

Backend local 200 pós-RLS foi informado pela equipe e observado na investigação anterior desta conversa; não foi repetido como leitura nova nesta rodada. DEV validou servidor/módulo, não percurso completo de navegador. Não houve login real, escrita remota ou teste direto authenticated.

## 9. ERROS / LIMITAÇÕES

Site oficial ainda precisa receber o novo build; nenhum push/deploy/painel alterado. Sem acesso às variáveis Vercel. SHA e valores do novo Render não foram inspecionados; configuração foi informada pela equipe, resposta 200 reconfirmada independentemente.

Existe **uma ocorrência textual de `sb_secret_` no bundle**, em `startsWith` do SDK Supabase para reconhecer tipos de chave. **Não é valor de credencial**: busca de Secret completa e JWT privilegiado negativa. O critério estrito de zero ocorrências textuais não passa por causa da dependência; o SDK não foi alterado para ocultar o marcador. A variável `SUPABASE_SECRET_KEY` não aparece no bundle.

## 10. RISCOS RESTANTES

P0: segredo preexistente no histórico local; retirar arquivo do índice não o limpa nem revoga a chave. P1: site oficial ainda usa destino antigo. P1: hardcodes precisam sair antes da PRD final. Escritas/admin/Auth real, authenticated direto, contagens/schema finais, acessibilidade e desempenho exigem validação. Previews compilados apontam ao backend real; fixtures dependem de ambiente e autorização próprios.

## 11. PENDÊNCIAS

Rotacionar chave que entrou no Git e preparar histórico seguro antes de push; publicar frontend; concluir NEW_RENDER_POST_DEPLOY_CHECKLIST; recuperar Vercel e quitar A-24; formalizar contagens/schema e teste authenticated. Não reaplicar migrations já realizadas.

## 12. REGRESSÕES

Nenhuma encontrada nos gates executados. Destinos centralizados, contratos/payloads/rotas preservados. DEV continua local; VITE_API_URL customizada fica temporariamente ignorada. Autoedição segue indisponível. Escritas e experiência assistiva não foram homologadas nesta rodada.

## 13. SEGURANÇA

`git ls-files backend/.env frontend/.env` ficou vazio e `git check-ignore -v` aponta **/.env; cópias locais preservadas sem ler/alterar conteúdo. Scanner e busca rastreada não encontraram valor real de Secret; nomes em código/docs são referências, não valores. O `git grep -l` retornou BACKEND_POST_RLS_RENDER_REPORT por uma expressão de busca histórica escrita naquele documento; a ocorrência foi distinguida de credencial real, sem imprimir valores.

O commit local anterior **c1c17d7** contém Secret em backend/.env, com valor completamente omitido. A referência local origin/main em **5be186b** não contém backend/.env; sem fetch, isso não constitui auditoria integral do remoto atual. Não houve reescrita de histórico, bypass, commit ou push. Nenhum segredo novo foi adicionado/imprimido. A-25 exige rotação e saneamento.

## 14. BANCO / AMBIENTE REMOTO

Postcheck manual informado: RLS true nas duas tabelas, zero policies, anon/authenticated sem CRUD/sequences; service_role com CRUD/BYPASSRLS/sequences; schema preservado, anon direto bloqueado. Metadados não reconsultados nesta rodada. O novo backend opera leitura pós-RLS.

Configuração do novo serviço informada pela equipe: nome `cadastro-artistas-api-matheus`; Root Directory `backend/`; build `npm install && npm run build`; start `npm run start:prod`; variáveis **externas** SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY, FRONTEND_URL. Nenhum valor registrado. Nenhuma configuração remota, dado, RLS, policy, grant, schema ou migration alterada.

## 15. PRÓXIMOS PASSOS

Após rotação/histórico seguro, publicar frontend e confirmar novo host e GET 200 em Network. Executar smoke/security tests e só então considerar encerramento A-03. Na PRD final: VITE_API_URL/VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY externas na Vercel, hardcodes/fallbacks removidos; quatro variáveis backend externas, .env ignorado, exemplos vazios, redeploy e novos testes.

## 16. STATUS DO BACKLOG

Todos A-01–A-23 revisados individualmente em BACKLOG_PRIORIZADO; nenhum encerrado por existir UI. A-03: banco aplicado e leituras positivas, frontend oficial/smoke/security pendentes. A-22/A-23: parcialmente validados. A-24: retirar workarounds. A-25: histórico/credencial P0. C-01–C-09 revisados sem inventar decisões; C-10 registra somente exceção operacional autorizada.

## 17. DIFF FUNCIONAL ANTES / DEPOIS

Antes: Vercel com env antiga → Render antigo → 500; cinco configurações duplicadas.

Depois, no código/build local: PROD → novo Render → Supabase → GET 200; DEV → localhost:3001. Env antiga não interfere. **O site oficial ainda não recebeu esta alteração.**

## 18. CONFIRMAÇÃO FINAL

Concluídos localmente: leitura/reconciliação dos 40 documentos, controles, configuração central, prova DEV/PROD sob env antiga, leitura 200 novo backend, gates e análise de segredo real no bundle/índice. Pendentes: publicação, smoke/security finais, rotação/histórico seguro e remoção de workarounds na PRD final. **Nenhuma alteração de fonte backend/banco/RLS/grants/schema/regra de negócio, nenhuma escrita remota e nenhum valor secreto novo impresso/adicionado.**

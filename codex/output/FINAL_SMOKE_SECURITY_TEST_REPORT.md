# Smoke final de deploy e segurança — 23/10/2026

## 1. RESUMO EXECUTIVO

**7 grupos PASSOU, 0 FALHOU, 10 BLOQUEADO**, de 17 grupos obrigatórios. O site oficial já usa o novo Render e o catálogo carregou 11 cards. GET público 200 sem campos privados, GETs administrativos anônimos 401, Data API anon 401/42501, CORS oficial funcional. Foi criado somente um feedback fictício: **ID 6**, POST 201. Cadastro, admin real e usuário comum ficaram bloqueados por falta de contas autorizadas; a limpeza do feedback também está bloqueada.

**A-03 permanece parcial, não resolvido.** Metadados RLS atuais, authenticated direto, escritas de artista/admin, conferência final de contagens/schema e inspeção completa de storage/Network ainda precisam evidência. Não houve alteração funcional, SQL, configuração remota ou modificação de registro preexistente.

## 2. ESCOPO EXECUTADO

Lidos o prompt integral, AGENTS raiz/front/back, relatórios de migração/reconciliação, checklists A-03/pós-deploy, backlog, matriz e decisões. Testes limitados ao frontend oficial, novo Render, SELECT anônimo da Data API com Publishable, POST de uma fixture de feedback e gates locais. RF-01/04/05/07/08/10/11; RNF-02/05/06/07; CT catálogo, autorização, integração, privacidade e configuração.

Sem migrations, bootstrap, RLS, policies, grants, schema, variáveis remotas, criação de contas improvisadas, ownership, SMTP, Storage, upload, rascunho, favoritos ou ranking. Não foram executados commit, push, merge ou limpeza de histórico.

## 3. ESTADO ANTES

A equipe informou novo deploy Vercel e GET ao novo Render 200. Os controles ainda registravam publicação pendente. Checkout inicial limpo em `5e305d9`. Não havia credenciais de teste admin/comum nos nomes de variáveis locais/processo; o usuário confirmou não haver conta/endereço controlado para criar artista de teste. Nenhuma senha foi procurada em commits.

## 4. ALTERAÇÕES IMPLEMENTADAS

**Nenhuma alteração funcional.** Somente relatório, evidências sanitizadas, checklist e controles locais foram atualizados. A única escrita remota foi a fixture de feedback explicitamente autorizada no prompt. Nenhum artista criado, nenhum status alterado e nenhum DELETE executado.

## 5. ARQUIVOS ALTERADOS

- Criados: `codex/output/FINAL_SMOKE_SECURITY_TEST_REPORT.md` e `codex/output/FINAL_SMOKE_SECURITY_EVIDENCE.json`.
- Atualizados: `codex/output/NEW_RENDER_POST_DEPLOY_CHECKLIST.md`, `codex/output/BACKLOG_PRIORIZADO.md` e `codex/output/MATRIZ_RASTREABILIDADE.md`.
- Fonte/configuração da aplicação, dependências, `.env`, SQL e decisões C-02/C-03/C-04 não foram alterados. Builds são artefatos locais ignorados.

## 6. DECISÕES TÉCNICAS

Contagem por **grupo de smoke**, conforme a matriz obrigatória; não é contagem de requisições HTTP. Grupos com requisito obrigatório sem evidência ficam BLOQUEADO, mesmo quando parte passou. Ausência de credenciais não conta como falha do produto. E2E com Supabase simulado não substitui autenticação real.

Não se inventou endereço de e-mail. Não se criou usuário comum ou alterou papel. A Secret Key não foi usada como atalho para consultas/admin/limpeza. SELECTs anônimos pediram `select=id&limit=0`, sem baixar registros. Respostas reais ficaram em memória; só status, contagens e indicadores sanitizados foram gravados.

## 7. TESTES AUTOMATIZADOS

| Comando | Resultado real |
|---|---|
| frontend: npm run lint | Passou, sem avisos |
| frontend: npx tsc -b --noEmit | Passou |
| frontend: npm test | 3/3 passaram |
| frontend: npm run build | Passou |
| backend: npm run test:e2e -- --runInBand | 48/48 passaram, Supabase simulado |
| backend: npm test -- --runInBand | 8/8 passaram |
| backend: npx tsc --noEmit -p tsconfig.json | Passou |
| backend: npm run build | Passou |
| git diff --check | Passou |

Total: **59 testes automatizados aprovados**. Warning não bloqueante: chunk frontend 548,33 kB acima de 500 kB. Logs dos E2E de falha são esperados e genéricos. Não foram adicionados testes ou ferramentas/dependências.

## 8. TESTES MANUAIS / SMOKE

Execução em 23/10/2026, início aproximadamente **01:17, São Paulo**; timestamps UTC completos no JSON sanitizado. Frontend: `https://cadastro-de-artistas.vercel.app`. Backend: `https://cadastro-artistas-api-matheus.onrender.com`.

| Teste | Esperado | Obtido | Estado | Evidência |
|---|---|---|---|---|
| Frontend publicado | Página 200, novo backend, catálogo visível | HTML 200; bundle novo, sem host antigo; DOM com 11 cards, sem erro/carregamento | PASSOU | published + browser no JSON; DevTools recente também informado pelo usuário |
| Novo backend | GET aprovados 200 | 200, array | PASSOU | catalogue.http=200 |
| Catálogo público | Sem email/CPF/status/data/senha/hash/UID | Nenhum campo proibido encontrado recursivamente; 11 itens | PASSOU | catalogue.privateFields=[]; sem dados pessoais impressos |
| Cadastro público | 201, Pendente e sem segredo | Nenhuma chamada feita: falta e-mail controlado autorizado | BLOQUEADO | Confirmação expressa do usuário e ausência local de conta de teste |
| Feedback público | Um POST fictício 201 com ID | 201, ID 6 e marcador esperado; sem senha/segredo | PASSOU | feedbackPost; leitura admin independente da persistência bloqueada no grupo próprio |
| Login admin | Sessão real de conta de teste admin | Sem credencial de teste autorizada | BLOQUEADO | credentials.adminTestCredentialsAvailable=false |
| GET admin artistas | 200 e fixture de artista encontrada | Sem token admin e sem artista criado | BLOQUEADO | Nenhum bypass da autenticação |
| GET admin feedbacks | 200 e fixture ID 6 encontrada | Sem token admin | BLOQUEADO | Conferência independente de persistência pendente |
| PATCH status | Aprovar/rejeitar somente fixture da rodada | Sem artista fixture nem admin | BLOQUEADO | Nenhum PATCH realizado |
| Anônimo rota admin | GET artistas/feedbacks 401 | Ambos 401 sem Authorization | PASSOU | anonymous /artistas e anonymous /feedbacks |
| Usuário comum rota admin | 403 com JWT comum real | Conta comum autorizada indisponível | BLOQUEADO | Nenhum usuário/papel improvisado |
| Data API anon | SELECT artistas/feedbacks negado | Ambos 401, código PostgreSQL 42501 | PASSOU | Data API anon artistas/feedbacks; apenas Publishable |
| Data API authenticated | SELECT com JWT comum negado | Conta/JWT de teste indisponível | BLOQUEADO | Não usar Publishable como Bearer nem token fabricado |
| RLS | Metadados atuais confirmam RLS/grants/policies/sequences | Postcheck manual anterior informado; sem nova consulta de metadados autorizada nesta rodada | BLOQUEADO | Negativas anon sustentam bloqueio, mas não provam isoladamente relrowsecurity=true |
| CORS | Origem oficial aceita | GET com ACAO exato; preflight POST 204 com content-type permitido | PASSOU | catalogue.allowOrigin e cors |
| Secrets frontend | Bundle, Network, Local/Session Storage sem credencial | Bundle publicado/local e respostas examinadas sem segredo; storage e captura Network integral indisponíveis | BLOQUEADO | published/localBundle; browser APIs não expõem esses recursos |
| Limpeza fixtures | Conferir ID/marcador e remover via admin | Feedback ID 6 pendente; sem token admin; nenhuma exclusão tentada | BLOQUEADO | fixture.cleanup; proprietário/origem desta fixture registrados |

Nenhum grupo ficou NÃO EXECUTADO sem motivo: os dez dependentes de acesso/inspeção estão explicitamente BLOQUEADOS. Os métodos administrativos mutáveis anônimos não foram chamados contra registros reais; o grupo 401 cobre somente os dois GETs requeridos.

### Fixture única criada

- Tipo: feedback, ID **6**; nome fictício `SMOKE_TEST_FEEDBACK`.
- Marcador: `SMOKE_TEST_FEEDBACK_20261023T041808670_4450d874`.
- POST confirmado aproximadamente às 01:18, São Paulo; ID/marcador retornados pela API.
- Sem e-mail real, telefone, CPF/CNPJ ou conta Auth associados.
- **Nenhuma fixture removida.** Operador admin deve conferir novamente ID **e** marcador exato antes de DELETE `/feedbacks/6` pela API oficial; depois confirmar ausência. Havendo divergência, não excluir.

### Observações adicionais

Bundle publicado: `/assets/index-DIaE6b-I.js`, com novo host presente e antigo ausente. Navegador integrado: 11 cards e zero erros de console observados. A API do browser permite ler DOM, mas não expõe performance/Network integral, Local Storage ou Session Storage; nenhuma aprovação foi inferida para esses itens.

Preflight adicional de leitura com origem fictícia `https://smoke-test.invalid` retornou 204 e refletiu essa origem. Confirma CORS amplo já visível em main.ts; registrar em A-15, sem alteração nesta rodada. Isso não substitui nem contornou os guards: os GETs privados continuaram 401.

## 9. ERROS / LIMITAÇÕES

Sem e-mail de artista controlado, conta admin de teste ou usuário comum autorizado. Não houve tentativa de adivinhar credenciais, buscar senhas em Git, usar sessão alheia ou elevar papel. O acesso disponível ao navegador não oferece storage/Network completo; esses aspectos exigem inspeção do responsável no browser. Sem painel/consulta atual de metadados, RLS/policies/sequences e contagens/schema finais não foram reconfirmados.

Uma ocorrência textual de `sb_secret_` no SDK é um detector de formato, não credencial. Busca de Secret real e JWT com role service_role foi negativa no bundle publicado; o nome SUPABASE_SECRET_KEY não apareceu. O check literal de zero prefixos seria inadequado sem essa distinção.

## 10. RISCOS RESTANTES

Fixture de feedback ID 6 continua no banco até limpeza autorizada. Admin real, cadastro e 403 comum/authenticated não homologados. CORS excessivamente amplo em A-15. Hardcodes temporários em A-24. Rotação da chave exposta no passado não confirmada em A-25; o histórico alcançável atual já não mostra commits de backend/.env, mas isso não prova revogação da credencial nem remoção de todas as cópias externas.

## 11. PENDÊNCIAS

Disponibilizar contas de teste e e-mail controlado por canal seguro; executar cadastro/Pendente, login admin, GETs e transições só em nova fixture. Executar 403 comum e Data API authenticated; conferir storage/Network e metadados/contagens finais. Conferir e remover feedback ID 6 via admin. Confirmar rotação A-25 e retirada de workarounds na PRD final. Não enviar senhas/JWTs no relatório.

## 12. REGRESSÕES

Nenhuma regressão observada no catálogo ou nos gates locais. A migração publicada passou do backend antigo 500 para o novo 200. Nenhum código funcional foi modificado nesta rodada. A ausência de contas impede afirmar o mesmo para todo o fluxo de escrita/admin; esses blocos não foram marcados como aprovados.

## 13. SEGURANÇA

Nenhuma senha, JWT completo, Secret Key, CPF/CNPJ real ou e-mail pessoal foi impresso/gravado. Somente nomes de variáveis locais foram listados para verificar disponibilidade de contas; a Secret Key não foi utilizada. Tokens/credenciais não foram criados ou versionados. GET público, retornos anônimos e bundle foram inspecionados sem reproduzir registros reais.

`.env` continuam ignorados e não rastreados; histórico alcançável de backend/.env não retornou commits. Nenhuma operação Git de publicação ou limpeza executada. Fixture é própria da rodada, com ID registrado no momento do POST; nenhum registro preexistente recebeu PATCH/PUT/DELETE.

## 14. BANCO / AMBIENTE REMOTO

Estado informado previamente pela equipe: RLS true em artistas/feedbacks, zero policies públicas, grants/sequences browser removidos, service_role preservado. Nesta rodada reconfirmado somente o bloqueio SELECT anon e a operação da API privilegiada via GET/POST oficiais. Metadados RLS não reconsultados; não confundir permission denied com prova direta de RLS.

Única mudança de dados: feedback fictício ID 6. Nenhuma migration, schema, policy, grant, sequência, role, variável Render/Vercel ou configuração Supabase alterada. Nenhuma criação Auth/artista ou exclusão.

## 15. PRÓXIMOS PASSOS

Operador autorizado: conferir ID/marcador e limpar o feedback; fornecer contas de teste seguras; concluir os blocos bloqueados. Registrar resultados e decidir encerramento A-03 apenas após todos os gates obrigatórios, incluindo contagens/schema quando aplicável. Tratar CORS e workarounds em suas rodadas próprias, sem mudar C-02/C-03/C-04.

## 16. STATUS DO BACKLOG

A-03 avançou: frontend oficial e catálogo novo confirmados, 401 anon/Data API anon/POST feedback positivos; **permanece parcial** pelos dez grupos bloqueados. A-01/A-02: contenção pública/401 real confirmada, admin/comum ainda pendentes. A-05/A-23: POST feedback provado, cadastro/admin real pendentes. A-10: 59 testes locais e smoke parciais. A-15: CORS amplo confirmado, não corrigido. A-24: workaround segue ativo. A-25: histórico conhecido não alcançável na revisão atual, rotação ainda sem evidência.

## 17. DIFF FUNCIONAL ANTES / DEPOIS

Nenhum diff funcional da aplicação. Antes desta rodada, controles aguardavam prova do novo frontend publicado; depois, página/catálogo/novo host e negativas anônimas têm evidência real. Fixture de feedback adicionada exclusivamente para o teste e registrada para limpeza. Gaps de autorização positiva/comum não foram escondidos por testes simulados.

## 18. CONFIRMAÇÃO FINAL

**7 PASSOU, 0 FALHOU, 10 BLOQUEADO; A-03 parcial.** Uma fixture criada (feedback ID 6), zero removidas e nenhum registro real preexistente alterado. 59 testes automatizados aprovados; lint/typecheck/build/diff passaram. Somente documentos/evidências locais modificados; nenhum segredo impresso, nenhuma alteração funcional/banco estrutural, nenhum commit/push/merge. Revisão humana e os acessos de teste ainda são necessários para fechar os gates restantes.

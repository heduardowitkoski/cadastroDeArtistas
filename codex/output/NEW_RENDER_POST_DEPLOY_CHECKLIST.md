# Checklist pós-deploy no novo Render — 23/10/2026

## Atualização: smoke publicado em 23/10/2026

Resultado: **7 grupos PASSOU, 0 FALHOU, 10 BLOQUEADO**, de 17 grupos da matriz obrigatória. Frontend oficial confirmado no novo Render, catálogo com 11 cards, GETs admin anônimos 401, Data API anon 401/42501 e feedback fictício POST 201, ID **6**. Sem e-mail controlado para artista (confirmado pelo usuário) e sem credenciais de teste admin/comum. Storage e captura Network completa não são expostos pela automação disponível; bundle publicado sem credencial real. Metadados RLS não reconsultados. A-03 continua parcial.

Relatório: `FINAL_SMOKE_SECURITY_TEST_REPORT.md`. Evidências sanitizadas: `FINAL_SMOKE_SECURITY_EVIDENCE.json`. Nenhum código funcional, RLS, schema ou grant alterado; nenhum registro preexistente modificado. Os itens DEV/build abaixo são da rodada anterior, preservados como histórico; gates locais foram repetidos com sucesso nesta rodada.

## Evidências desta rodada

- [x] GET novo Render `/artistas/aprovados` = 200, array sem campos privados.
- [x] CORS permite `https://cadastro-de-artistas.vercel.app`.
- [x] DEV em localhost:5173 exporta API localhost:3001.
- [x] Build com VITE_API_URL antiga contém apenas o novo destino da API.
- [x] Nenhum valor real de Secret Key/JWT privilegiado no bundle examinado.
- [x] .env removidos somente do índice, preservados localmente e ignorados.

O site oficial foi publicado pela equipe e agora usa o novo backend. Nesta rodada houve apenas uma escrita remota autorizada: feedback fictício ID 6, ainda pendente de limpeza administrativa. Nenhum artista foi criado.

## Antes de enviar/publicar

- [ ] Rotacionar a chave do commit local c1c17d7; atualizar somente os ambientes backend autorizados.
- [ ] Preparar histórico seguro, revisar referências remotas e retirar o commit comprometido sob responsabilidade da equipe. Não contornar Push Protection nem executar limpeza automática de histórico.
- [x] Confirmar `git ls-files backend/.env frontend/.env` vazio e `git check-ignore -v` reconhecendo os dois; exemplos sem valores.
- [ ] Revisar e publicar somente mudanças/histórico seguros; fazer novo deploy frontend.

## Site oficial

- [x] Frontend publicado atualizado: HTML 200, bundle `index-DIaE6b-I.js` e catálogo observado no navegador.
- [x] Destino `https://cadastro-artistas-api-matheus.onrender.com`: DevTools informado pelo usuário e novo host confirmado no bundle oficial; captura Network integral indisponível nesta automação.
- [x] Bundle publicado não contém `https://cadastro-artistas-api.onrender.com`; configuração funcional aponta somente ao novo backend.
- [x] GET `/artistas/aprovados` = 200; catálogo oficial observado com 11 cards.
- [x] Catálogo carrega sem “Catálogo indisponível” e sem erros no console observado.
- [ ] Busca/filtro/perfil e estados de erro/vazio completos homologados nesta rodada.
- [ ] Nenhum secret aparece no Network.
- [ ] Nenhum secret aparece no Local Storage.
- [x] Nenhum `sb_secret_` aparece no bundle publicado **como valor real**. Uma ocorrência isolada `startsWith` do SDK foi distinguida de chave; nenhum JWT service_role ou nome SUPABASE_SECRET_KEY no bundle examinado.
- [ ] Session Storage inspecionado para ausência de Secret Key; API de inspeção indisponível no navegador integrado.

## Smoke positivos — responsável e fixtures autorizadas

Usar homologação ou registros fictícios expressamente autorizados. Não modificar/excluir cadastros reais como teste. Nesta rodada foi criado somente o feedback fictício abaixo; cadastro/admin/comum ficaram bloqueados por falta de contas autorizadas. Não usar a chave privilegiada como substituto de login admin.

- [x] Feedback POST `/feedbacks` retornou 201, ID 6 e marcador esperado, sem senha/segredo na resposta.
- [ ] Confirmar persistência do feedback ID 6 por leitura admin autorizada; sem credenciais nesta rodada.
- [ ] Cadastro POST `/artistas` funciona: 201.
- [ ] Cadastro nasce Pendente e senha não aparece na ficha/resposta.
- [ ] Login admin funciona com conta autorizada.
- [ ] GET admin `/artistas` funciona: 200.
- [ ] GET admin `/feedbacks` funciona: 200.
- [ ] PATCH status funciona: 200, somente fixture autorizada.
- [ ] Artista aprovado aparece no catálogo.
- [ ] Artista rejeitado/desaprovado deixa de aparecer.
- [x] GET `/artistas` e GET `/feedbacks` sem token retornaram 401. Métodos mutáveis não foram testados contra registros existentes.
- [ ] Usuário comum sem papel admin recebe 403 nas rotas administrativas.

## Banco e segurança — conferir sem reaplicar SQL

- [x] Data API anon: SELECT artistas e feedbacks com Publishable apenas retornaram 401, código 42501; consultas pediram zero registros.
- [ ] Data API authenticated comum continua bloqueada; JWT de teste não aparece em relatório ou comando compartilhado.
- [ ] RLS continua ativo nas duas tabelas.
- [ ] Nenhuma policy pública criada.
- [ ] Grants/sequences browser continuam restritos e service_role preservado.
- [ ] Contagens/schema finais documentados e comparados com evidência anterior, considerando mudanças legítimas.

Não executar bootstrap, migration, GRANT/REVOKE ou mudanças de RLS nesta validação. As etapas antigas de migração são histórico de execução já realizada.

## Fixture criada nesta rodada — remoção pendente

- Tipo: feedback; ID **6**.
- Nome fictício: `SMOKE_TEST_FEEDBACK`.
- Marcador exato na mensagem: `SMOKE_TEST_FEEDBACK_20261023T041808670_4450d874`.
- Criação confirmada por resposta 201 em 23/10/2026, aproximadamente 01:18, São Paulo.
- [ ] Operador admin autorizado: conferir novamente ID 6 e o marcador exato via API/painel administrativo. Se não coincidirem ou houver dúvida, não excluir.
- [ ] Após a conferência, excluir somente `/feedbacks/6` pela API administrativa oficial com Bearer admin; registrar HTTP esperado.
- [ ] Confirmar ausência pela leitura admin. Não usar busca textual ampla seguida de exclusão.

Nenhum DELETE foi executado nesta rodada. A falta de credenciais bloqueia a limpeza automática; não usar Secret Key para contornar os guards.

## PRD final — retirar a solução transitória (A-24)

- [ ] Recuperar acesso ao projeto Vercel.
- [ ] Configurar VITE_API_URL para o novo Render no painel.
- [ ] Configurar VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY externamente.
- [ ] Remover hardcode de apiConfig.ts e restaurar leitura normal de VITE_API_URL.
- [ ] Remover fallbacks públicos temporários de supabase.ts.
- [ ] Manter SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY e FRONTEND_URL externos no Render; nenhuma variável VITE_ privilegiada.
- [ ] Git sem .env real/Secret Key; somente exemplos vazios.
- [ ] Rotação e saneamento seguro do histórico concluídos (A-25).
- [ ] Redeploy backend/frontend e repetição de smoke/security tests.
- [ ] Atualizar A-03/A-22/A-23/A-24/A-25 conforme evidências finais, sem fechar itens ainda pendentes.

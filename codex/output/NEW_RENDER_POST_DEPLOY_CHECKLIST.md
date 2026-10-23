# Checklist pós-deploy no novo Render — 23/10/2026

## Evidências desta rodada

- [x] GET novo Render `/artistas/aprovados` = 200, array sem campos privados.
- [x] CORS permite `https://cadastro-de-artistas.vercel.app`.
- [x] DEV em localhost:5173 exporta API localhost:3001.
- [x] Build com VITE_API_URL antiga contém apenas o novo destino da API.
- [x] Nenhum valor real de Secret Key/JWT privilegiado no bundle examinado.
- [x] .env removidos somente do índice, preservados localmente e ignorados.

O site oficial inspecionado ainda usa o backend antigo. Não marcar caixas de publicação com base apenas no build local. Nenhuma escrita de dados foi realizada nesta rodada.

## Antes de enviar/publicar

- [ ] Rotacionar a chave do commit local c1c17d7; atualizar somente os ambientes backend autorizados.
- [ ] Preparar histórico seguro, revisar referências remotas e retirar o commit comprometido sob responsabilidade da equipe. Não contornar Push Protection nem executar limpeza automática de histórico.
- [ ] Confirmar `git ls-files backend/.env frontend/.env` vazio e `git check-ignore -v` reconhecendo os dois; exemplos sem valores.
- [ ] Revisar e publicar somente mudanças/histórico seguros; fazer novo deploy frontend.

## Site oficial

- [ ] Frontend publicado atualizado; conferir novo build e recarregar sem cache.
- [ ] Network usa `https://cadastro-artistas-api-matheus.onrender.com`.
- [ ] Não há chamadas para `https://cadastro-artistas-api.onrender.com`.
- [ ] GET `/artistas/aprovados` = 200 no percurso do site.
- [ ] Catálogo carrega; busca/filtro/perfil funcionam e erro/vazio continuam distintos.
- [ ] Nenhum secret aparece no Network.
- [ ] Nenhum secret aparece no Local Storage.
- [ ] Nenhum `sb_secret_` aparece no bundle **como valor real**. Registrar a ocorrência isolada `startsWith` do SDK: uma no build local, sem credencial. Se o gate exigir zero ocorrências textuais, explicitar a exceção em vez de declarar zero ou ocultar o SDK.

## Smoke positivos — responsável e fixtures autorizadas

Usar homologação ou registros fictícios expressamente autorizados. Não modificar/excluir cadastros reais como teste. Registrar resultados sem credenciais. Esta rodada não executou estas escritas/logins.

- [ ] Feedback POST `/feedbacks` funciona: 201, persistência privada.
- [ ] Cadastro POST `/artistas` funciona: 201.
- [ ] Cadastro nasce Pendente e senha não aparece na ficha/resposta.
- [ ] Login admin funciona com conta autorizada.
- [ ] GET admin `/artistas` funciona: 200.
- [ ] GET admin `/feedbacks` funciona: 200.
- [ ] PATCH status funciona: 200, somente fixture autorizada.
- [ ] Artista aprovado aparece no catálogo.
- [ ] Artista rejeitado/desaprovado deixa de aparecer.
- [ ] Rotas administrativas sem token retornam 401.
- [ ] Usuário comum sem papel admin recebe 403 nas rotas administrativas.

## Banco e segurança — conferir sem reaplicar SQL

- [ ] Data API anon continua bloqueada.
- [ ] Data API authenticated comum continua bloqueada; JWT de teste não aparece em relatório ou comando compartilhado.
- [ ] RLS continua ativo nas duas tabelas.
- [ ] Nenhuma policy pública criada.
- [ ] Grants/sequences browser continuam restritos e service_role preservado.
- [ ] Contagens/schema finais documentados e comparados com evidência anterior, considerando mudanças legítimas.

Não executar bootstrap, migration, GRANT/REVOKE ou mudanças de RLS nesta validação. As etapas antigas de migração são histórico de execução já realizada.

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

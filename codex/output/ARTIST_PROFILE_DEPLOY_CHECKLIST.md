# Perfil completo do artista — checklist de deploy

Data: 23/10/2026. **Código e migrations locais; nenhuma etapa remota executada nesta rodada.** A prévia usa API/Auth/Storage inteiramente em memória. Gates locais passaram; isso não homologa PostgreSQL, Storage, Auth ou infraestrutura publicados.

## 1. Revisar e aplicar a migration de dados

- [ ] Fazer backup e registrar a versão atualmente publicada. Revisar o diff e o schema efetivo, em especial `artistas.id`, `created_at`, `foto_url` e status `Aprovado`.
- [ ] Aplicar, primeiro em homologação, `backend/migrations/20261023_artist_profile.sql` como operador autorizado. Não usar `backend/supabase.sql`.
- [ ] Confirmar as cinco tabelas novas: `artist_media`, `artist_media_cleanup`, `artist_events`, `artist_profile_stats`, `artist_view_sessions`; índices, FKs e cascatas. As tabelas existentes não recebem novos grants/policies nesta migration.
- [ ] Confirmar RLS ativa e ausência de acesso direto por PUBLIC/anon/authenticated às novas tabelas. Confirmar que apenas service_role pode executar `attach_artist_media`, `delete_artist_media` e `record_artist_view`; as funções fixam `search_path` vazio e qualificam os objetos.
- [ ] Testar concorrência real: anexos do mesmo artista não excedem 1 foto/8 imagens/1 PDF e visitas simultâneas da mesma sessão incrementam uma vez. Os testes locais simulam esses contratos; não executam o PL/pgSQL.

As migrations são de execução única: colisão de nomes deve interromper e exigir revisão. Não há `IF NOT EXISTS` que esconda schema divergente. Falha dentro de cada transaction reverte aquela etapa.

## 2. Criar Storage privado

- [ ] Revisar e aplicar `backend/migrations/20261023_artist_storage.sql`, somente após a etapa anterior.
- [ ] Confirmar bucket `artist-media`, **public=false**, limite 10.485.760 bytes e MIME `image/webp`/`application/pdf`.
- [ ] Se já existir bucket com esse nome, interromper e comparar configuração/conteúdo. Não sobrescrever, tornar público ou apagar o bucket.

## 3. Validar policies e acesso negativo

- [ ] Conferir a policy **RESTRICTIVE** `artist_media_browser_deny` em `storage.objects`: bloqueia o bucket para anon e authenticated, mesmo com policy permissiva global. Para outros buckets, a expressão é verdadeira e não concede novos acessos.
- [ ] Inspecionar policies/grants/default privileges efetivos e testar SELECT/INSERT/UPDATE/DELETE diretamente nas novas tabelas, RPCs e Storage usando Publishable anônima e conta comum controlada. O esperado é negação, sem imprimir credenciais/linhas privadas.
- [ ] Com conta admin controlada, conferir mídia pendente pela API autenticada; no endpoint público, confirmar 404 antes da aprovação e após desaprovação. Conferir acesso público apenas via backend após aprovação.
- [ ] Não alterar as restrições RLS já aplicadas a `artistas` e `feedbacks`. Não usar Secret no browser como forma de teste.

## 4. Conferir ambiente e operação

- [ ] Nenhuma nova variável é obrigatória. Preservar `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` exclusivamente no ambiente adequado; Secret somente no backend. Não copiar valores para documentos, chat, Git ou `VITE_`.
- [ ] Instalar pelo lockfile em build limpo e validar Sharp no runtime do Render. Fazer dimensionamento de memória/CPU para imagens de até 40 MP e uploads: até 10 arquivos de 10 MB por lote, dois cadastros multipart simultâneos por processo.
- [ ] Revisar proxy/trust proxy e limites do host. O limitador local por IP é em memória (6 cadastros multipart/hora/IP; 60 registros de visita/minuto/IP); não é distribuído e não substitui proteção no edge. Revisar também o endpoint JSON legado já existente.
- [ ] Programar operação autenticada de `POST /artistas/manutencao/limpeza-midias`. Processa até 100 jobs com mais de 30 minutos, preserva objetos ainda referenciados e poda hashes de visitas após 30 dias. Não foi criado cron externo automaticamente. Monitorar falhas e repetir até esvaziar a fila.

## 5. Publicar backend

- [ ] Publicar a versão revisada somente após dados/bucket/policies estarem prontos. `GET /artistas/:id`, mídias e exclusão passam a depender das novas tabelas/RPCs.
- [ ] Confirmar contrato público sem CPF/CNPJ/e-mail/UID/status administrativo/paths. Conferir 404 para inexistente, pendente e rejeitado; 401 anônimo e 403 comum em todas as rotas de gestão.
- [ ] Conferir `Cache-Control: no-store`, `nosniff` e CSP restritiva em PDF. O app visualiza PDF em canvas; navegação direta no visualizador nativo pode ser bloqueada pela CSP. O download continua disponível.
- [ ] Avaliar CORS, timeouts, tamanho de request e abuso conforme hospedagem. Não remover validação ou abrir bucket para contornar erros.

## 6. Publicar frontend

- [ ] Publicar depois do backend compatível. Manter o rewrite SPA de `frontend/vercel.json` e testar abertura direta/refresh de `/artistas/:id`.
- [ ] Conferir destino de API no bundle final. O workaround DEV/PROD preexistente continua sendo dívida A-24; não foi removido como efeito colateral desta rodada.
- [ ] Conferir carregamento do chunk/worker PDF.js com cache/headers da hospedagem. O visualizador é carregado apenas ao abrir PDF; não depende de iframe nem JavaScript do documento.

## 7. Corrigir Supabase Auth redirect manualmente

- [ ] Site URL: `https://cadastro-de-artistas.vercel.app`.
- [ ] Redirect URL permitida exata: `https://cadastro-de-artistas.vercel.app/artista/login`.
- [ ] Remover localhost como destino de produção e conferir template: utilizar `ConfirmationURL`, sem substituir por `SiteURL`/link fixo de localhost. Manter Confirm Email ativado.
- [ ] Conferir versão efetiva do backend. O código já envia `emailRedirectTo` oficial em `auth.resend`; não aceita redirect fornecido pelo POST.
- [ ] Gerar uma confirmação nova por fluxo suportado com caixa controlada e respeitar cooldown. Não reutilizar link antigo como prova da nova configuração. Registrar apenas resultado sanitizado, nunca URL completa/token.
- [ ] Retestar redirect e login após confirmação. Recebimento e confirmação já têm PASSOU informado pelo usuário; redirect informado FALHOU por localhost. Ainda não há reteste remoto nesta rodada.

## 8. Smoke autorizado em homologação

- [ ] Cadastro sintético identificado: foto JPEG/PNG/WebP, até 8 imagens e PDF válido de até 10 MB. Conferir limites negativos, armazenamento privado e ficha Pendente.
- [ ] Admin confere imagens/PDF, cria/edita/remove evento, aprova e desaprova. Confirmar calendário futuro/público e ordenação, omissão de passado/privado, desaparecimento público após desaprovação sem perda dos dados.
- [ ] Perfil público: links reais, favoritos por navegador, visita deduplicada, membro desde real, copiar link, galeria por teclado e PDF em mobile. Conferir dados antigos sem mídia/DataURL.
- [ ] Exclusão de fixture especificamente autorizada: cascatas e remoção somente dos seus objetos. Simular falha de Storage e recuperar pela fila. Não reutilizar IDs de testes anteriores nem tocar registros reais.
- [ ] Reflow 320/375/768/1024/1440, teclado, leitor de tela, zoom real 200%, contraste com fotos reais e erros de console/rede. WCAG 2.1 AA é alvo; não está certificada.

## 9. Recuperação / rollback

- [ ] Antes de qualquer upload novo, frontend/backend podem voltar juntos à versão anterior, conservando as tabelas/bucket privados para investigação.
- [ ] **Depois de novos uploads**, `foto_url` pode conter endpoint relativo servido pelo novo backend. Não reverter apenas o backend: isso quebra fotos já salvas. Preferir correção para frente ou manter compatibilidade do endpoint enquanto os dados forem usados.
- [ ] Falha de mídia após cadastro retorna ficha criada com `media_upload: pending`; recuperar a ficha existente pelo admin, sem reenviar cadastro ou recriar Auth.
- [ ] Não fazer DROP, limpar bucket, desativar RLS ou liberar anon como rollback. Preservar backup, objetos e fila; qualquer restauração de dados exige plano específico e autorização humana.

**Bloqueios atuais:** sem PostgreSQL/Supabase local executável, sem aplicação remota autorizada e sem contas/caixa controladas para homologar novos fluxos reais. Checklist não marcado é trabalho pendente, não PASSOU por mock.

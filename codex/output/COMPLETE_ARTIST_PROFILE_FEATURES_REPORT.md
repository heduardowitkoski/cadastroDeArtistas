# Perfil completo do artista — relatório mestre

23/10/2026. Base desta rodada: HEAD local `f10b599`, árvore inicialmente limpa. Implementação e evidências ficam locais; nenhuma migration, bucket, configuração Auth, publicação, commit ou push executados.

## 1. RESUMO EXECUTIVO

Perfil público dedicado `/artistas/:id` substitui modal. Foto/galeria/PDF têm implementação de Storage privado, favoritos persistem no navegador, visitas têm deduplicação/contador no backend, agenda é gerida pelo admin e perfil mostra somente artista aprovado. UI segue a referência roxa preservando as demais páginas. **148 testes locais passaram; 49 novos.** Dependências remotas ainda exigem implantação e homologação humanas.

## 2. ESCOPO EXECUTADO

Perfil e navegação do catálogo/destaque; multipart de mídias no cadastro; revisão/administração em drawer; migrations versionadas para metadados, agenda, estatísticas, sessões, cleanup e bucket/policy; testes e documentação. Slug, vídeo/áudio, ownership, autoedição, ranking, chat, pagamentos e expansão de dados públicos não implementados. Código existente foi a fonte técnica; a instrução atual autoriza os recursos novos e supera a restrição histórica de não implementar favoritos/Storage nesta rodada.

## 3. ESTADO ANTES

Modal público com informações básicas; corações demonstrativos; foto DataURL; nomes de galeria/PDF sem bytes persistidos; ausência de agenda e estatísticas por perfil. Backend já tinha guards/admin, mapper público e solicitação de confirmação com redirect oficial. Rodada anterior tinha 99 testes (76 E2E + 8 unitários backend + 15 frontend). RLS antigo já havia sido aplicado pela equipe; não foi reaplicado.

## 4. ALTERAÇÕES IMPLEMENTADAS

- Rota pública lazy, skeleton, 404 indistinguível para privado/inexistente, erro/retry, document.title e âncoras. Hero, Sobre, atuação/disponibilidade, resumo, detalhes, contato e cidade seguem dados reais.
- Foto/galeria/PDF enviados como bytes multipart, validados antes de Auth, Storage privado e acesso público mediado por aprovação; thumbnails e galeria acessível. Legado DataURL continua aceito.
- PDF.js sob demanda com canvas/paginação/texto extraído/download; arquivos sem ações ativas, sem iframe/execução de script do documento.
- Favoritos locais reais, clipboard e Web Share opcional, visitas via RPC com sessão deduplicada e membro desde derivado da data existente.
- Drawer admin para mídias pendentes e CRUD de eventos; agenda pública só futura/pública. Guards em todas as operações administrativas.
- Fila antes de upload/delete, checagem de referências, retries e cascatas. Desaprovação conserva dados.
- Código de redirect auditado: já oficial, sem nova mudança artificial. Configuração remota e reteste descritos no relatório de e-mail.

## 5. ARQUIVOS ALTERADOS

Backend: `package.json`/lock; `src/artistas/artistas.module.ts`, `artistas.service.ts`; novos `profile/artist-profile.controller.ts`, `artist-profile.service.ts`, `event.dto.ts`, `media-validation.ts`; duas migrations de 20261023; `test/artist-profile.e2e-spec.ts`, `test/app.e2e-spec.ts`, `test/support/quality-fixture.ts`, `test/quality-preview.cjs`.

Frontend: `package.json`/lock; `src/App.tsx`; `pages/ArtistProfile/ArtistProfile.tsx` e CSS; `pages/Portal/Portal.tsx` e CSS; `pages/Cadastro/CadastroArtista.tsx`; `pages/Admin/AdminDashboard.tsx`, novos `ArtistTools.tsx`/CSS; `components/PdfPreview.tsx`/CSS; `lib/artistProfile.ts`, `mediaUrl.ts`, `useFavorites.ts`; `test/artistProfile.test.mjs`.

Documentos novos: este relatório, `ARTIST_PROFILE_DEPLOY_CHECKLIST.md`, `ARTIST_MEDIA_STORAGE_REPORT.md`, `ARTIST_PUBLIC_PROFILE_REPORT.md`, raiz `design-qa.md`, evidências em `codex/output/artist-profile-evidence/`. Atualizados: e-mail, backlog, matriz, conflitos, documentação técnica, acessibilidade e diagramas textuais, preservando histórico. Inventário de paths no arquivo `artist-profile-evidence/changed-files.txt`.

## 6. DECISÕES TÉCNICAS

Private bucket/bytes via backend evita publicação de pendentes e URL assinada ainda válida após desaprovação. Não há segredo no front. Fotos novas são WebP sem metadados, thumb480/full1920; 1 foto, 8 galeria, 1 PDF, 10 MB cada. Limite de pixels 40 MP/8000 por lado protege decodificação; quantidades são decisão técnica desta versão, não CT oficial inventado.

Funções service_role com lock por artista limitam anexos e tornam incremento/deduplicação atômicos. Testes fake não provam PL/pgSQL: gate real permanece aberto. Hash de sessão sem fingerprint, retenção 30 dias; limpeza permite contar novamente sessão extremamente longa após retenção. Rate limit em RAM por processo, com duas inscrições multipart simultâneas, requer revisão de proxy/edge na implantação.

PDF.js foi adicionado porque CSP segura bloqueou preview nativo no navegador; library/worker só carregam ao abrir documento. Inspeção estrutural não substitui antivírus. Estado parcial de mídia no cadastro não apaga ficha/Auth já criadas; suporte recupera pelo admin sem duplicar cadastro.

## 7. TESTES AUTOMATIZADOS

| Gate executado | Resultado |
|---|---|
| Backend `npm run test:e2e -- --runInBand` | 3 suítes, 115 passaram |
| Backend `npm test -- --runInBand` | 3 suítes, 8 passaram |
| Backend `npx tsc --noEmit -p tsconfig.json` | PASSOU |
| Backend `npm run build` | PASSOU |
| Backend `npx eslint "{src,apps,libs,test}/**/*.ts"` | PASSOU, sem --fix |
| Frontend `npm run lint` | PASSOU |
| Frontend `npx tsc -b --noEmit` | PASSOU |
| Frontend `npm test` | 25 passaram |
| Frontend `npm run build` | PASSOU; warning de chunk >500 kB |
| `git diff --check` | PASSOU na revisão final |

Total 148; 39 novos E2E de perfil/Storage/agenda/visitas e 10 novos frontend de favoritos/sessão/URLs. Os testes antigos continuam passando. Casos negativos incluem 401/403 nas nove operações de gestão, limites/formatos/bytes/PDF ativo, paths, privacidade, cleanup com falha e concorrência básica simulada. Logs de erros deliberadamente induzidos nos testes não são testes falhos. Audits de produção `npm audit --omit=dev`: zero nas duas árvores após atualizações compatíveis do backend; advisories de desenvolvimento preexistentes não foram resolvidos por atualização forçada.

## 8. TESTES MANUAIS

Browser IAB em `127.0.0.1:5187` / API `127.0.0.1:3207`, módulo real Nest com Supabase/Auth/Storage substituídos em memória. Nenhum cliente remoto instanciado pelo harness. Fixture identificada SMOKE_TEST; não houve envio real de e-mail.

Comprovados: CTA/destaque, refresh direto, privacidade 404, estados vazios, favorito persistente, visita igual após refresh, copiar link, setas/Tab/Shift+Tab/Escape e retorno do foco no lightbox; cadastro completo com três arquivos, review pendente/PDF privado, aprovação e mídias públicas; criação/edição/exclusão de evento refletida no perfil. PDF em mobile renderizou texto/canvas; Escape aninhado preservou drawer e fechamento restaurou botão da lista. Falha 503 mostrou retry e recuperação. Console final error/warn vazio.

Larguras 320/375/768/1024/1440 sem overflow; drawer a 320 e PDF canvas228×323. Capturas/JSON sanitizados em `artist-profile-evidence/`. Comparação conjunta de referência e captura final concluída: `design-qa.md` com **final result: passed**.

## 9. ERROS / LIMITAÇÕES

Nenhum teste automatizado falhou. Preview nativo PDF ficou bloqueado pela CSP; corrigido com visualizador canvas. Seleção de data no form admin mostrou divergência de valor nativo/estado React na automação; submit passou a ler FormData validado, e criar/editar foram retestados. Fechamento do drawer perdia foco ao atualizar lista; corrigido e retestado. Capturas intermediárias de viewport incompatível não foram usadas no aceite visual.

Sem PostgreSQL/Supabase local executável nem aplicação remota autorizada: migrations, policies efetivas e concorrência SQL real **BLOQUEADAS para homologação**. Sem conta/caixa controlada: novo teste real de confirmação/redirect/login bloqueado. Share nativo do OS não concluído na automação; fallback clipboard passou. Leitor real e zoom real 200% não validados. PDF complexo/fontes/CMAP e materiais reais diversos precisam de smoke.

## 10. RISCOS RESTANTES

Implantar backend antes das migrations quebra consultas novas; reverter backend após salvar endpoints de fotos também quebra imagens. Consultar checklist. Storage e Postgres não têm transação única: fila/retry reduz órfãos, mas exige agendamento/monitoramento. Uploads de PDFs/imagens ainda exigem proteção operacional de recursos e eventual serviço antimalware conforme política da equipe. Limites por RAM não são distribuídos. Chunk inicial559,73 kB/gzip158,29 mantém dívida de desempenho; PDFlazy433,30 kB/gzip130,36 e worker separado.

Dívidas antigas CORS amplo, workarounds de configuração A-24 e rotação histórica A-25 não são quitadas por esta rodada. Dados antigos/extensões remotas requerem homologação. Não se promete revogar cópia já baixada de arquivo.

## 11. PENDÊNCIAS

Aplicação humana das duas migrations, inspeção de grants/policies, bucket privado e smoke real com contas controladas; configuração Auth de produção e reteste de login; agenda de cleanup; leitores/zoom/dispositivos/PDFs reais. Vídeo/áudio ficam para fase seguinte, sem upload demonstrativo. C-02 ownership, C-03 categorias, C-04 documentos, rascunho e exportação continuam abertos.

## 12. REGRESSÕES

115 E2E, 8 unitários e 25 front passam, incluindo contratos antigos de cadastro/Auth, catálogo/allowlist/status, administração e feedback. Sem alteração de identidade global, Home, login, feedback ou autoedição. Portal recebe links/favoritos/URLs de mídia; cadastro e admin recebem somente suporte necessário. Não há evidência de regressão local nos cenários executados; produção ainda não recebeu este código e não foi revalidada como parte do deploy.

## 13. SEGURANÇA

Secret só no backend já existente; novos arquivos não contêm valores de secrets/tokens de produção. DTO público não inclui CPF/CNPJ/e-mail/UID/status administrativo. Admin guard continua servidor; usuário comum não ganha acesso por `user_metadata` ou payload. UUIDs server-side, path seguro, bytes reais validados, RLS e revogação de grants nas novas tabelas, bucket privado, RPC apenas service_role, CSP/nosniff/no-store e saneamento de URLs. Não foram registrados links de confirmação/JWTs/senhas reais. Tokens sintéticos do harness são exclusivamente memória local e não são credenciais reais.

## 14. BANCO / AMBIENTE REMOTO

**Zero escrita remota nesta rodada.** Nenhum SQL/migration/bucket/policy/env/role/config Auth remoto aplicado. Nenhum registro de produção criado/excluído. Bootstrap `backend/supabase.sql` intocado; RLS existente não foi desativado nem relaxado. As migrations são arquivos revisáveis, não comprovação de execução. O relatório antigo de cleanup/IDs reais é histórico e não autoriza repetir exclusões.

## 15. PRÓXIMOS PASSOS

Seguir [ARTIST_PROFILE_DEPLOY_CHECKLIST.md](ARTIST_PROFILE_DEPLOY_CHECKLIST.md): migration de dados → bucket/policies → env/operação → backend → frontend → Auth redirect → smoke → plano de recuperação. Não publicar antes de aprovar/revisar concretamente esses artefatos. Esta rodada não executa a publicação por instrução explícita do usuário.

## 16. STATUS DO BACKLOG

A-08 parcial implementado com persistência real projetada em Storage e testes locais; remoto/vídeo/áudio pendentes. A-10 avança a148 testes; A-12/A-13/A-17 avançam com teclado/reflow sem WCAG integral. A-18 favoritos deixa de ser demonstrativo na navegação pública, demais dívidas preservadas. A-05/A-20: entrega/confirmation link PASSOU conforme nova evidência humana; redirect FALHOU por localhost, login aguarda reteste. A-03 continua parcial, sem alteração das evidências remotas antigas. A-04/C-02 permanece bloqueado para ownership.

## 17. DIFF FUNCIONAL ANTES / DEPOIS

| Antes | Depois local |
|---|---|
| Modal e link não compartilhável | Página por ID, refresh e título |
| Foto DataURL / nomes de arquivos | Upload de bytes privado, metadata e leitura por aprovação; legado compatível |
| Galeria/PDF demonstrativos | Thumbnails/lightbox e PDF visualizável/baixável real |
| Coração demonstrativo | Favorito persistido por navegador |
| Sem métricas individuais | Visitas deduplicadas via backend e membro desde real |
| Sem agenda | CRUD admin e eventos públicos futuros |
| Sem revisão de arquivos privados | Drawer admin, PDF seguro, controle de acesso e cleanup |
| E-mail marcado totalmente bloqueado | Nova evidência humana de entrega/confirmação, redirect remoto ainda incorreto |

## 18. CONFIRMAÇÃO FINAL

Implementação local concluída e revisável, QA visual aprovado e gates locais verdes. Deploy/homologação remota e gaps explicitados permanecem pendentes. Nenhum commit/push/merge, segredo/token real exposto, escrita remota, SQL destrutivo ou liberação de RLS. Não há declaração de aceite integral dos 122 CTs oficiais nem WCAG integral. Relatórios especializados e checklist detalham o que o operador deve validar antes de produção.

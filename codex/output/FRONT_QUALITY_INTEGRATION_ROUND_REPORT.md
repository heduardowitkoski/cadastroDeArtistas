# Rodada de qualidade e integração — 23/10/2026

## 1. RESUMO EXECUTIVO

Rodada local concluída: mostrar/ocultar senha nos dois logins, Home sem logout, melhorias de legibilidade, contraste e reflow, solicitação de confirmação de e-mail e cobertura ampliada. **99/99 testes passam; 40 novos; 122 CTs oficiais mapeados; 70 IDs têm asserções automatizadas relacionadas.** Isso não significa 122 CTs integralmente homologados. Visual roxo e estrutura preservados; nenhuma alteração de produção, RLS, schema ou grants.

## 2. ESCOPO EXECUTADO

Lidos o prompt de qualidade vigente, AGENTS raiz/front/back, documentação técnica, contextos, relatórios anteriores e PDF oficial indicado pelo usuário. Inspeção de CSS, API, DTOs, Auth, navegação e uploads; testes de contrato e workflows com persistência em memória; navegador local e leituras remotas sem escrita. Quatro relatórios especializados e controles atualizados. O redesign anterior interrompido não foi retomado.

## 3. ESTADO ANTES

HEAD base `4ebffab`. Mural, login, wizard e admin já existiam. Faltavam controle de senha e Home uniforme; havia auxiliares de 11/12px, contrastes insuficientes e transbordamento na área indisponível a 320px. Cards aninhavam interações e os seletores de upload dependiam de labels. O mínimo oficial de 20 caracteres para bio não era exigido. createUser com email_confirm false não solicitava envio; login mostrava orientação técnica. Outros uploads guardavam apenas nomes. Baseline: 59 testes locais.

## 4. ALTERAÇÕES IMPLEMENTADAS

PasswordInput com Eye/EyeOff, type=button, labels, estado pressed e current-password preservado; Home para / sem modificar sessão; CTA nativo nos cards; Escape no menu; bloqueio e restauração de rolagem dos modais; landmarks e heading. Auxiliares, alvos, bordas e cores semânticas ajustados conforme contraste/legibilidade. Correções de grids, header, steps e modal. Busca inclui nome artístico. Bio exige 20..2000 caracteres no front/back. Backend solicita confirmação após inserção confirmada e retorna email_verification. UI distingue solicitação de e-mail de entrega pendente e explica uploads parciais. Como funciona deixou de prometer autoedição disponível.

## 5. ARQUIVOS ALTERADOS

30 arquivos de código/testes/configuração QA (lista também em [changed-source-files.json](front-quality-evidence/changed-source-files.json)):

- `backend/src/artistas/artistas.service.ts`
- `backend/src/artistas/dto/create-artista.dto.ts`
- `backend/test/app.e2e-spec.ts`
- `backend/test/quality-preview.cjs`
- `backend/test/support/quality-fixture.ts`
- `backend/test/workflows.e2e-spec.ts`
- `frontend/src/components/HomeButton.tsx`
- `frontend/src/components/Navbar.tsx`
- `frontend/src/components/PasswordInput.tsx`
- `frontend/src/index.css`
- `frontend/src/lib/authMessages.ts`
- `frontend/src/lib/cadastroValidation.ts`
- `frontend/src/lib/catalogFilter.ts`
- `frontend/src/lib/useDialogFocus.ts`
- `frontend/src/pages/Admin/AdminDashboard.css`
- `frontend/src/pages/Admin/AdminDashboard.tsx`
- `frontend/src/pages/Admin/Login.tsx`
- `frontend/src/pages/Artista/ArtistaLogin.tsx`
- `frontend/src/pages/Artista/EdicaoIndisponivel.tsx`
- `frontend/src/pages/Artista/EditarCadastro.tsx`
- `frontend/src/pages/Cadastro/Cadastro.css`
- `frontend/src/pages/Cadastro/CadastroArtista.tsx`
- `frontend/src/pages/ComoFunciona/ComoFunciona.tsx`
- `frontend/src/pages/Feedback/Feedback.css`
- `frontend/src/pages/Feedback/Feedback.tsx`
- `frontend/src/pages/Portal/Portal.css`
- `frontend/src/pages/Portal/Portal.tsx`
- `frontend/test/cadastroValidation.test.mjs`
- `frontend/test/quality-vite.config.mjs`
- `frontend/test/quality.test.mjs`

Documentação: quatro relatórios especializados e este mestre; ACESSIBILIDADE.md, DOCUMENTACAO_PROJETO.md, BACKLOG_PRIORIZADO.md, MATRIZ_RASTREABILIDADE.md, CONFLITOS_E_DECISOES.md; inventários, logs, JSON e screenshots em front-quality-evidence/. PDFs adicionados pelo usuário em codex/docs foram somente lidos, não editados/removidos.

## 6. DECISÕES TÉCNICAS

Preservar stack, identidade visual e contratos existentes; reutilizar lucide-react e infraestrutura de testes, sem dependências novas. createUser + resend no servidor mantém UID novo conhecido e compensação segura; confirmação não foi desabilitada nem signup movido ao browser. requested significa solicitação aceita, sem prova de entrega. Escritas e 1000 registros ficaram em memória. Perfil continua em modal; carrossel foi apenas avaliado. RN/UC não foram inventados onde o documento não individualiza a ligação.

## 7. TESTES AUTOMATIZADOS

| Gate executado | Resultado |
|---|---|
| Frontend npm run lint | PASSOU |
| Frontend npx tsc -b --noEmit | PASSOU |
| Frontend npm test | 15/15 |
| Frontend npm run build | PASSOU; JS 550,39kB, gzip 154,78kB; aviso de chunk grande |
| Backend npm run test:e2e -- --runInBand | 76/76, duas suítes |
| Backend npm test -- --runInBand | 8/8, três suítes |
| Backend npx tsc --noEmit -p tsconfig.json | PASSOU |
| Backend npm run build | PASSOU |
| Backend npx eslint "{src, apps, libs, test}/**/*.ts" | PASSOU, sem --fix |
| git diff --check | PASSOU; log final preservado |

Logs em `front-quality-evidence/`. Erros Nest nos testes negativos foram injetados e são esperados. Performance: 400 filtros em 1000 registros em 23,87ms e 20 GETs Nest com assert de cada duração abaixo de 5s. Isso não mede Supabase/Render. Nenhuma instalação limpa foi repetida; foram usados node_modules existentes. O script lint original do backend contém --fix; a rodada usou ESLint diretamente, sem fix. Warning de chunk acima de 500kB permanece.

## 8. TESTES MANUAIS

40 combinações de oito rotas e larguras 320/375/768/1024/1440 sem overflow horizontal final. Etapas 2/3/4 do wizard a 320px; modais a 320px; paisagem simulada 812×375 em três rotas. Enter/Space no olhinho; Home e retorno sem novo login em admin/artista simulados; Logout bloqueia o painel. Modais com Tab, Shift+Tab, Escape e retorno de foco; menus com Escape; cancelamento de exclusão preservou artista/feedback. Foto fictícia enviada, aprovada e renderizada 64×48 em memória. Catálogo loading/vazio/erro e feedback sucesso/erro observados. Provas em browser-results.json e screenshots.

## 9. ERROS / LIMITAÇÕES

Falhas de lint e types surgidas durante implementação foram corrigidas e os gates repetidos. Uma medida logo após resize capturou layout transitório; após estabilização e nova abertura, o editor em viewport 320×812 mediu 300×792, x=10, y=10, com rolagem interna. Não se usou o transitório como prova de falha final. Zoom real de 200%, leitor de tela, entrega de e-mail, contas controladas, metadados RLS completos e ensaio concorrente não foram validados. A ferramenta aceitou o atalho de zoom sem mudar a escala observável.

## 10. RISCOS RESTANTES

A-08: mídias/Storage/limites ausentes e Base64 no catálogo. A-07: Salvar rascunho ainda envia definitivamente; não se criou persistência de rascunho. A-18: ordenar, termos/privacidade e selos/favoritos demonstrativos. A-15: CORS amplo histórico. A-24: workaround de URL/env. A-25: rotação anterior não comprovada. Auth e DB não têm transação única; timeout ambíguo e falha de e-mail após inserção exigem recuperação. Não se declarou quitação de LGPD, WCAG ou homologação de produção.

## 11. PENDÊNCIAS

Configurar Confirm Email, SMTP, Site URL, Redirect URLs e template; homologar com caixa controlada. Disponibilizar admin/usuário comum controlados para CRUD real e Data API authenticated. Testar zoom de 200% em Chrome/Edge, NVDA, usuários e dispositivos reais, além de hero/gradientes/estados. Resolver C-02 ownership, C-03 categorias e C-04 documentos em decisões próprias. A-08 Storage e A-19 exportação ficam para rodadas específicas.

## 12. REGRESSÕES

Nenhuma regressão detectada nos 99 testes e fluxos locais descritos; isso não garante ausência de regressão remota. Bio agora é obrigatória de 20..2000 caracteres no POST, conforme CT-RF02-09: clientes antigos que omitem bio passam a receber 400. Resposta 201 ganha email_verification. Solicitação Auth pode aumentar latência; falha de e-mail mantém o cadastro persistido. Regras administrativas, ownership e categorias foram preservados.

## 13. SEGURANÇA

Guards administrativos no servidor, allowlist pública e clientes separados preservados. Testes 401/403, metadados forjados e campos extras continuam passando. Senha não é salva na ficha nem reenviada ao mailer. Nenhum segredo real foi impresso ou incluído em frontend/evidências/relatórios. Harness QA fica em test/, é opt-in, ligado a 127.0.0.1 e substitui integralmente Supabase/Auth; não deve ser publicado como API de produção.

## 14. BANCO / AMBIENTE REMOTO

Somente GET público e Data API anon nesta rodada: GET 200 com 11 artistas sem campos privados; Data API 401/42501 em artistas e feedbacks. Authenticated comum permanece BLOQUEADO. Zero POST/PATCH/PUT/DELETE remoto nesta rodada de qualidade. Nenhuma alteração em RLS, policies, grants, schema, bootstrap, buckets, env remoto ou conta real. Fixtures e limpeza autorizada de uma rodada anterior interrompida são histórico; não repetir exclusões nem tocar no feedback histórico ID 6.

## 15. PRÓXIMOS PASSOS

Revisar diff local; configurar e homologar e-mail com caixa autorizada; completar Chrome/NVDA e CRUD/segurança reais; então decidir A-08 e eventual faixa manual de artistas. Commit, push e deploy não foram executados.

## 16. STATUS DO BACKLOG

A-05/A-20: solicitação de e-mail pronta no código, configuração e entrega pendentes. A-10: 99 testes e 122 CTs rastreados, cobertura remota parcial. A-12/A-13: teclado e melhorias locais verificadas; leitores pendentes. A-14: nome artístico buscável, C-03 aberto. A-17: 40 reflows e performance com 1000 registros em memória; zoom, carga e aceite pendentes. A-08: lacuna com plano separado, sem Storage. A-03 segue parcial. Demais itens mantêm o estado histórico, sem fechamento indevido.

## 17. DIFF FUNCIONAL ANTES / DEPOIS

| Antes | Depois |
|---|---|
| Senha sempre oculta nos logins | Alternância por botão acessível sem submit |
| Retorno ao catálogo inconsistente | Home reutilizável e sessão preservada; Logout separado |
| Auxiliares/ações pequenos e contraste fraco | Auxiliares prioritários 13px, ações 14px, inputs 16px; contrastes corrigidos |
| Área indisponível transbordava a 320px | Reflow sem overflow nas 40 combinações |
| Busca ignorava nome artístico | Nome artístico incluído e combinação preservada |
| Bio abaixo de 20 aceita no POST | Mínimo oficial de 20 no front/back |
| Conta criada sem solicitar confirmação | Solicitação após persistência; falha de e-mail sinalizada |
| Nome de anexo parecia persistência | Passo 3 explica quais mídias não são enviadas |
| 59 testes locais | 99 testes; 122 CTs com rastreio explícito |

## 18. CONFIRMAÇÃO FINAL

Alterações locais prontas para revisão; homologação externa parcial, com bloqueios registrados. Servidores temporários de QA nas portas 3207/5187 encerrados após conferência de seus comandos. Sem redesign, segredos novos, alteração de RLS/schema/grants/ownership/C-03/C-04/favoritos, migration, SQL manual, bucket, commit, push, merge ou deploy. Relatórios: [front/a11y](FRONT_QUALITY_A11Y_RESPONSIVE_REPORT.md), [cobertura](INTEGRATION_TEST_COVERAGE_REPORT.md), [e-mail](EMAIL_VERIFICATION_FLOW_REPORT.md), [uploads/carrossel](UPLOAD_AND_CAROUSEL_ASSESSMENT.md).

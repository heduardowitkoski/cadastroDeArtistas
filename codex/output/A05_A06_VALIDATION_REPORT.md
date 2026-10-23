# A-05/A-06 — validação e consistência Auth/cadastro

Data: 06/10/2026. Escopo: cadastro público de artista, feedback e validação dos endpoints existentes. Evidência executável local com Supabase substituído por fake. Nenhum comando de SQL, migration ou alteração do banco remoto foi executado nesta rodada.

## Resultado

- **A-06 implementado localmente:** `backend/src/validation/configure-validation.ts` instala `ValidationPipe` global em `main.ts` e na aplicação E2E com `whitelist`, `forbidNonWhitelisted` e `transform`. DTOs distintos em `backend/src/artistas/dto/` e `backend/src/feedback/dto/` cobrem os quatro contratos exigidos.
- **A-05 mitigado localmente:** `frontend/src/pages/Cadastro/CadastroArtista.tsx` não chama mais `supabase.auth.signUp`; envia um único POST. `backend/src/artistas/artistas.service.ts` cria a conta Auth com o cliente servidor e então insere a ficha Pendente sem senha. Não existe transação única entre Supabase Auth e Postgres; a compensação descrita abaixo cobre respostas explícitas de erro.
- **Integração real pendente:** testes não acessaram produção nem homologação Supabase. A-03/RLS continua P0 aberto conforme auditoria anterior.

## Contratos e validações

| Entrada | Regras aplicadas no backend | Frontend / evidência |
|---|---|---|
| Artista público | `CreateArtistaDto`: nome aparado 2–120; nome artístico opcional até 120; e-mail obrigatório normalizado e validado; contato com DDD, 10/11 dígitos normalizados; área obrigatória até 500; cidade até 120; bio até 2000; tags até 20 e disponibilidade até 10, itens de texto não vazios até 60; `instagram` como @perfil ou URL Instagram; `site` http(s); senha 6–128; CPF/CNPJ válidos quando presentes. Campos extras, inclusive `status`, `id` e `forceStatus`, dão 400. | `cadastroValidation.ts`, `CadastroArtista.tsx` e `Cadastro.css`: máscaras, limites, mensagens por campo, `aria-invalid`, bloqueio de avanço/envio. Status persistido é sempre Pendente. |
| Atualização admin | `UpdateArtistaDto` separado; campos presentes validados; `status` limitado aos três estados atuais, `forceStatus` booleano; `:id` inteiro por `ParseIntPipe`. | `AdminDashboard.tsx` envia allowlist compatível com rejeição de extras. Guard administrativo existente permanece. |
| Status admin | `UpdateStatusDto`: somente Pendente, Aprovado ou Rejeitado. | PATCH com valor arbitrário retorna 400; valor válido retorna 200 no E2E. |
| Feedback público | `CreateFeedbackDto`: nome opcional 2–120; e-mail opcional válido; tipo entre Elogio/Sugestão/Crítica/Outro; nota inteira 1–5; mensagem aparada 10–2000; extras rejeitados. | `Feedback.tsx` agora exige nota 1–5 mesmo com mensagem preenchida, valida mensagem/e-mail e apresenta erro textual. |

Os limites de comprimento de nome, contato, listas e URLs são limites técnicos de entrada compatíveis com a UI atual, não novas decisões de negócio. O mínimo de senha segue o formulário atual; a política configurada no Supabase real pode ser mais forte, e `weak_password` é retornado como 400 compreensível. `foto_url` recebeu apenas limite de tamanho; upload e validação de mídia não pertencem a esta rodada.

### CPF/CNPJ e C-04

`backend/src/artistas/documento.ts` normaliza em maiúsculas e sem pontuação no campo `cpf_cnpj` TEXT existente, inclusive a forma `CPF / CNPJ`. CPF e CNPJ numérico têm dígitos verificadores conferidos, com rejeição de sequências repetidas. CNPJ alfanumérico aceita 12 posições alfanuméricas e dois DVs numéricos calculados com ASCII menos 48 e módulo 11; o exemplo oficial `12.ABC.345/01DE-35` passa. Fontes: [Receita Federal, CNPJ Alfanumérico](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/cnpj-alfanumerico) e [manual oficial de cálculo do DV](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf).

O formulário mantém sua regra atual de pedir ao menos um documento; o backend mantém o campo opcional como no schema. Não se decidiu se CPF, CNPJ, ambos ou um deles serão obrigatórios. Não houve mudança de schema nem constraint.

## Fluxo Auth + ficha e falhas

1. `ArtistasService.create` verifica se já existe ficha com o e-mail normalizado. Se houver, responde 409 antes de criar Auth.
2. `auth.admin.createUser` cria a conta com `email_confirm:false`; e-mail duplicado no Auth recebe 409, e-mail/senha rejeitados recebem 400, falha de Auth recebe 503. Nenhuma senha é inserida na tabela, devolvida ou registrada em log.
3. A ficha é inserida com `status:'Pendente'`; resposta 201 inclui só `{id,status}`.
4. Erro **explícito** da inserção após Auth aciona `auth.admin.deleteUser` somente para o UID devolvido por aquela criação. Falha de compensação retorna 503 com instrução de suporte e log genérico, sem identificador/segredo.
5. Exceção/timeout ou inserção sem confirmação é **ambígua**: o commit pode ter ocorrido. O serviço não apaga Auth às cegas, retorna 503 com orientação de suporte e registra a necessidade de revisão. Isso evita apagar uma conta ligada a uma ficha já gravada, mas requer reconciliação operacional.

Como `admin.createUser` não constitui prova de posse do endereço, a conta não é marcada como confirmada. Não foi implementado envio de confirmação (SMTP fora do escopo) e a Área do Artista segue indisponível. Antes de habilitar login/ownership, a equipe precisa decidir a verificação de e-mail, o vínculo UID–ficha e a rotina de reconciliação. O comportamento de duplicidade pressupõe a unicidade de e-mail imposta pelo Auth; a tabela `artistas` do SQL de bootstrap não declara índice único, e o banco real não foi consultado nesta rodada.

## Inventário dos endpoints afetados

| METHOD | PATH | AUTH | PAPEL | DTO | RESPOSTA | RF/CT |
|---|---|---|---|---|---|---|
| GET | `/artistas` | Bearer | admin | — | lista integral | RF-07; CT admin |
| GET | `/artistas/aprovados` | pública | — | — | allowlist pública | RF-04/05; CT privacidade |
| POST | `/artistas` | pública | — | `CreateArtistaDto` | 201 `{id,status}` / 400/409/503 | RF-01/02; CT cadastro/Auth |
| PATCH | `/artistas/:id/status` | Bearer | admin | `UpdateStatusDto` | registro / 400 | RF-08; CT status |
| PUT | `/artistas/:id` | Bearer | admin | `UpdateArtistaDto` | registro / 400 | RF-09; CT admin |
| DELETE | `/artistas/:id` | Bearer | admin | `ParseIntPipe` | mensagem | RF-10; CT exclusão |
| GET | `/feedbacks` | Bearer | admin | — | lista integral | RF-11; CT privacidade |
| POST | `/feedbacks` | pública | — | `CreateFeedbackDto` | 201 registro / 400 | RF-11; CT feedback |
| DELETE | `/feedbacks/:id` | Bearer | admin | `ParseIntPipe` | mensagem | RF-11; CT exclusão |

## Testes e comandos

| Comando | Resultado em 06/10/2026 |
|---|---|
| `cd backend; npm run test:e2e -- --runInBand` | **46/46 passaram**, Supabase simulado; preservados os casos P0 de autorização/privacidade e adicionados inválidos, sucesso, duplicidade, falhas Auth/DB, compensação e CNPJ alfanumérico. Um teste P0 antigo que esperava extras administrativos ignorados com 201 foi atualizado para esperar 400, pois `forbidNonWhitelisted` é requisito explícito desta rodada. Logs genéricos esperados nos cenários de falha simulada. |
| `cd backend; npm test -- --runInBand` | **6/6 passaram** em 3 suites, incluindo CPF/CNPJ. |
| `cd backend; npx tsc --noEmit -p tsconfig.json` | passou. |
| `cd backend; npm run build` | passou. |
| `cd backend; npx eslint` com globs dos arquivos alterados | passou após corrigir uma linha de formatação em `documento.ts` com Prettier direcionado. |
| `cd frontend; npm run test` | **3/3 passaram**, máscaras, DVs e etapa inválida. |
| `cd frontend; npm run lint` | passou. |
| `cd frontend; npx tsc -b --noEmit` | passou. |
| `cd frontend; npm run build` com URL/chave publishable fictícias | passou; aviso de chunk JS 542,45 kB, fora do escopo desta rodada. |
| `git diff --check` | passou; Git emitiu apenas avisos de conversão LF/CRLF em arquivos do checkout. |

Dependências novas no backend: `class-validator` e `class-transformer` em `backend/package.json`/`package-lock.json`. A instalação inicial em sandbox sem rede não completou; `npm install class-validator class-transformer --no-audit --no-fund` concluiu após autorização de rede. Não foram instaladas bibliotecas de teste no frontend; `node:test` usa o Node atual.

## Arquivos alterados nesta rodada

- Backend: `package.json`, `package-lock.json`, `src/main.ts`, `src/validation/configure-validation.ts`, `src/validation/normalizers.ts`, `src/artistas/artistas.controller.ts`, `src/artistas/artistas.service.ts`, `src/artistas/documento.ts`, `src/artistas/documento.spec.ts`, `src/artistas/dto/create-artista.dto.ts`, `src/artistas/dto/update-artista.dto.ts`, `src/artistas/dto/update-status.dto.ts`, `src/feedback/feedback.controller.ts`, `src/feedback/feedback.service.ts`, `src/feedback/dto/create-feedback.dto.ts`, `test/app.e2e-spec.ts`.
- Frontend: `package.json`, `src/lib/cadastroValidation.ts`, `src/pages/Cadastro/CadastroArtista.tsx`, `src/pages/Cadastro/Cadastro.css`, `src/pages/Feedback/Feedback.tsx`, `src/pages/Feedback/Feedback.css`, `src/pages/Admin/AdminDashboard.tsx`, `test/cadastroValidation.test.mjs`.
- Documentação: este relatório, `MATRIZ_RASTREABILIDADE.md`, `BACKLOG_PRIORIZADO.md`, `codex/context/CONFLITOS_E_DECISOES.md`.

O checkout já continha alterações anteriores da auditoria/P0/chaves Supabase, inclusive arquivos staged. Esta rodada não alterou `backend/supabase.sql`, RLS, grants, migrations, Storage ou dados remotos.

## Riscos, decisões e próximo passo

- **P0 A-03:** exposição direta via Data API pode continuar enquanto RLS/grants reais não forem verificados e corrigidos em etapa própria.
- **P1 A-05/A-20:** e-mail ainda não é verificado; a conta criada não deve ser tratada como acesso habilitado. Falha de compensação e resposta ambígua exigem reconciliação manual. Sem vínculo UID–artista, ownership continua proibido.
- **P1/P2 C-04/A-21:** regra formal de obrigatoriedade CPF/CNPJ pendente; registros legados com formato inválido podem exigir correção antes de edição admin.
- **P2 QA:** simulações locais não comprovam persistência, política de senha, envio de e-mail ou compatibilidade de dados no Supabase real; faltam E2E em navegador e testes de teclado/acessibilidade.

Próximo passo recomendado: validar A-05/A-06 em homologação com dados fictícios e decidir C-02/C-04; tratar A-03 em rodada separada com revisão da candidata SQL e testes negativos diretos ao Supabase.

# Conflitos e decisões que o Codex não pode inventar

## Decisões da rodada de qualidade — 23/10/2026

- C-01: baseline WCAG2.1 AA preservada. Auditoria local/contraste/40 reflows documentados, sem declarar conformidade integral; zoom200% e leitor pendentes.
- C-02: pedido explícito de manter confirmação de e-mail orientou createUserfalse + solicitação resend após ficha confirmada, server-side e com redirect oficial fixo. SMTP/entrega real pendentes; confirmação não concede aprovação nem ownership. Autoedição continua indisponível e PUT exige admin. Essa decisão não encerra vínculo UID–ficha.
- C-03/C-04: nenhuma mudança em categorias/cardinalidade/CPF-CNPJ. Nome artístico foi apenas incluído na busca. Bio20..2000 foi alinhada ao CT-RF02-09 do PDF oficial, sem inventar regra.
- C-05/C-06: disponibilidade/favoritos/destaque demonstrativos preservados; carrossel só avaliado, sem ranking. Ordem de criação atual não equivale a última aprovação.
- C-08/C-10: sem SQL/RLS/grants/schema/bucket/ambiente remoto ou reversão de workaround; somente leituras remotas públicas. Nenhum commit/push/deploy.
- Rastreabilidade:122 CTs oficiais preservados,70 com asserções automatizadas relacionadas. Testes em memória não se tornam prova de produção. Sem caixa/contas controladas, entrega e-mail e fluxos reais permanecem bloqueados conforme resposta do usuário.

Detalhes e justificativas: codex/output/FRONT_QUALITY_INTEGRATION_ROUND_REPORT.md e relatórios especializados. O histórico a seguir não é autorização para executar novamente prompts antigos, redesign ou exclusões já concluídas.

## Revisão de todas as decisões abertas — 23/10/2026

Os registros antigos abaixo preservam o que foi observado na época; referências a API sem guard, RLS não aplicado ou autoedição roteada não representam mais o código atual.

| Decisão | Estado atual / evidência | Encaminhamento |
|---|---|---|
| C-01 | Baseline WCAG 2.1 AA preservada; conformidade integral não comprovada | Leitor, zoom e contraste antes de afirmar aceite; não migrar baseline sem decisão |
| C-02 | Artista pode gerar conta no cadastro; autoedição segue indisponível; PUT somente admin | Decidir confirmação, vínculo UID–ficha e ownership; não habilitar nesta rodada |
| C-03 | Cadastro multisseleção serializa área em TEXT; editor/catálogo têm vocabulários distintos | Cardinalidade/vocabulário ainda dependem da equipe |
| C-04 | Front pede um documento; back opcional valida o que recebe; suporta CNPJ alfanumérico | Obrigatoriedade, LGPD e relação CPF/CNPJ continuam abertas |
| C-05 | Disponibilidade tem dado de cadastro; selo do mural é demonstrativo | Não transformar o selo em regra sem aceite |
| C-06 | Favoritos locais e métricas são demonstração | Sem backend novo/favoritos/ranking |
| C-07 | DOD histórico expandido não é backlog obrigatório | Manter itens condicionados ao aceite |
| C-08 | Bootstrap é destrutivo; RLS já aplicado manualmente e novo Render GET 200 | Não executar SQL/migrations/grants para esta troca de URL |
| C-09 | Diagramas conceituais sinalizados; PNGs históricos e modelo detalhado incompleto | Sincronizar após decisões funcionais, sem inventar schema |
| C-10 (operacional) | Novo Render da equipe criado para substituir antigo 500; GET novo 200 reconfirmado | URL pública fixa em PROD e localhost em DEV, ignorando VITE_API_URL temporariamente; reverter workaround antes da PRD final |

C-10 foi autorizada expressamente no prompt desta rodada: serviço `cadastro-artistas-api-matheus`, URL `https://cadastro-artistas-api-matheus.onrender.com`; variáveis SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY/SUPABASE_SECRET_KEY/FRONTEND_URL fornecidas externamente segundo a equipe. O site oficial ainda usa o antigo; publicar e validar. Esta exceção não autoriza segredo versionado. A-24 exige recuperar Vercel e remover hardcodes; A-25 exige rotação e saneamento do commit local preexistente, sem filter-repo automático.

## Histórico preservado das rodadas anteriores


## C-01 — Acessibilidade 2.1 x 2.2

O repositório documenta WCAG 2.1 AA.
Não renomear para WCAG 2.2 AA sem auditoria e decisão da equipe.
É válido propor evolução para 2.2 AA separadamente.

## C-02 — Área/Login do Artista

`ACESSIBILIDADE.md` cita:
- `ArtistaLogin.tsx`;
- `EditarCadastro.tsx`.

Por outro lado, a documentação técnica descreve Supabase Auth explicitamente como
autenticação administrativa, e diagramas simplificados não mostram login do artista.

**Ação:** descobrir o fluxo real e decidir se é requisito oficial, experimental ou incompleto.

**Registro A-05/A-06 (06/10/2026):** o cadastro público agora cria conta Auth e ficha pelo backend, mas não habilita autoedição nem ownership. `auth.admin.createUser` usa `email_confirm:false` para não afirmar posse do endereço sem verificação. O fluxo de envio de confirmação não está implementado nesta rodada (SMTP fora do escopo); portanto não afirmar que o artista já consegue entrar. Decidir verificação, vínculo UID–ficha e destino de contas sem ficha antes de abrir acesso. Falha explícita da ficha remove apenas o UID recém-criado; resposta ambígua ou falha da compensação exige revisão manual.

## C-03 — Categoria única x múltiplas categorias

Documentação histórica modelou uma categoria principal.
Registro de reunião posterior diz que categoria pode ser selecionada mais de uma vez.

**Ação:** verificar front/schema/API e registrar decisão. Não alterar cardinalidade no escuro.

## C-04 — CPF/CNPJ

O formulário atual declara campo `cpf_cnpj`, mas os documentos não fecham de maneira
inequívoca todas as regras:
- CPF obrigatório?
- CNPJ opcional?
- CPF OU CNPJ?
- ambos?

**Ação:** não criar constraint destrutiva sem validação.

**Registro A-05/A-06 (06/10/2026):** preservada a exigência atual de ao menos um documento no formulário; o backend mantém `cpf_cnpj` opcional como no schema e valida CPF/CNPJ quando enviados. Ambos continuam cabendo no campo TEXT existente. O CNPJ alfanumérico vigente desde julho de 2026 é aceito, conforme [Receita Federal](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/cnpj-alfanumerico) e [manual de DV](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf). Obrigatoriedade, relação entre CPF/CNPJ e tratamento LGPD ainda precisam de decisão formal; não houve alteração de banco.

## C-05 — Disponibilidade

`DOCUMENTACAO_PROJETO.md` diz que o formulário possui `disponibilidade`, mas também avisa
que o indicador visual `"Disponível"` no catálogo é elemento de demonstração.

**Ação:** separar dado real de UI demonstrativa e decidir o que deve ser conectado.

## C-06 — Favoritos e nota de eventos

O repositório diz explicitamente que são elementos visuais de demonstração.

**Ação:** não implementar backend/DB para isso sem novo aceite de escopo.

## C-07 — Escopo expandido do DOD

DOD antigo menciona favoritos, contato interno, métricas, comunicação em massa, relatórios,
histórico/auditoria e lembretes.

**Ação:** não tratar como obrigação automática. Classificar como backlog/decisão pendente.

## C-08 — Banco via `backend/supabase.sql`

A documentação atual manda executar manualmente um script SQL no editor do Supabase.

**Ação:** primeiro auditar esse script e o banco. Depois propor migrations/versionamento
reprodutível se isso melhorar a entrega sem quebrar ambiente existente.

## C-09 — Diagramas possivelmente desatualizados

Os diagramas PNG e alguns fluxos simplificados não representam todas as funcionalidades
citadas nos arquivos atuais, como feedback e possível Área do Artista.

**Ação:** diagramas são documentação a sincronizar depois da auditoria, não fonte absoluta.

## Registro da auditoria de 06/10/2026 — sem decisão de escopo

- **C-02:** a área do artista está roteada (`frontend/src/App.tsx:20-25`), usa Supabase Auth (`ArtistaLogin.tsx:18`) e busca todos os artistas para selecionar por e-mail no cliente (`EditarCadastro.tsx:82-93`). O back não valida ownership (`backend/src/artistas/artistas.controller.ts:31-37`). A existência da tela não prova que a regra de autenticação/autoedição foi validada pela equipe.
- **C-03:** o formulário aceita múltiplas categorias (`CadastroArtista.tsx:87-93`), mas serializa em `area_atuacao` TEXT separada por vírgulas (`:207`; `backend/supabase.sql:14`); o painel admin oferece categoria única (`AdminDashboard.tsx:531-534`). Cardinalidade oficial segue pendente.
- **C-04:** o front exige algum CPF ou CNPJ (`CadastroArtista.tsx:176-183`) e concatena ambos em `cpf_cnpj` (`:203`); o banco deixa o campo nulo (`backend/supabase.sql:10`). Regra oficial e tratamento LGPD seguem pendentes.
- **C-05/C-06:** o catálogo exibe “Disponível” fixo (`Portal.tsx:278-279`) e favoritos só em estado local (`:68,147-150`), coerente com a nota demonstrativa de `DOCUMENTACAO_PROJETO.md`; não há decisão para backend desses elementos.
- **C-08:** `backend/supabase.sql:4,26` apaga tabelas com `CASCADE` e `:39-40` desativa RLS. A orientação atual de executar o script (`DOCUMENTACAO_PROJETO.md:59`) é perigosa para uma base existente. O schema/policies reais não foram consultados nesta auditoria.
- **C-09:** os diagramas omitem área do artista e os campos recentes. Mostram portaria/controle de acesso, mas os controllers Nest não têm guards. Não alterar diagramas até a segurança e o escopo serem definidos.

Evidências e prioridades completas: `codex/output/ESTADO_ATUAL.md`, `MATRIZ_RASTREABILIDADE.md` e `BACKLOG_PRIORIZADO.md`.

## Registro técnico de 07/10/2026 — rodada front-end UX, sem decisão de negócio

- **A-07/C-02:** “Salvar rascunho” no cadastro ainda usa o envio definitivo. A rodada de UX não redefiniu rascunho, autenticação/ownership nem regra de submissão; esses pontos continuam exigindo decisão e implementação próprias.
- **A-22:** `frontend/src/lib/supabase.ts` ainda contém fallback hardcoded de URL e chave Publishable, embora a solicitação anterior pedisse falha clara sem variáveis. O relatório A-03 e a linha histórica da matriz que afirmam leitura exclusiva de `VITE_*` precisam ser interpretados à luz desta inspeção posterior. A correção de configuração ficou fora desta rodada por restrição expressa de não alterar Supabase Auth/configuração; nenhuma Secret key foi vista ou adicionada no front nesta rodada.
- **A-17:** reflow local em cinco larguras não substitui decisão ou auditoria formal de WCAG; permanece WCAG 2.1 AA como referência documentada, sem declaração de conformidade verificada.

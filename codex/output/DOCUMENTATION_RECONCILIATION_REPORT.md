# Reconciliação documental — 23/10/2026

## Inventário e método

Localizados e lidos **40 documentos existentes: 40 arquivos .md e nenhum .mdx**, em raiz, backend, frontend, figma e codex/context/output/prompts. Excluídos apenas diretórios gerados: node_modules, dist, build, coverage e .git. Os três documentos novos desta rodada levam o total final a **43**. Arquivos SQL/PNG/DOCX não entram nessa contagem de Markdown; migrations não foram executadas.

Foram lidos AGENTS da raiz/front/back, toda a documentação técnica raiz, os quatro contextos, os quatorze outputs anteriores, nove prompts e READMEs/atribuições/guidelines. Prompts históricos descrevem rodadas possíveis; não foram executados como ordens novas. Não se criaram agentes nem funcionalidades de seu escopo antigo.

Precedência técnica expressamente solicitada: **código atual → evidência manual mais recente → testes automatizados atuais → relatório mais recente → documentação histórica**. O código é evidência da implementação, não decisão de negócio para C-02/C-03/C-04. Datas antigas abaixo são explícitas no texto ou aproximadas pelo pacote histórico; datas de templates não foram inventadas.

## Matriz completa dos documentos

O estado classifica o documento **como encontrado**, antes dos avisos/ajustes desta rodada. A ação informa o tratamento feito ou a pendência preservada.

| Documento | Data/ordem aproximada | Assunto | Estado | Conflito encontrado | Ação recomendada/executada |
|---|---|---|---|---|---|
| README.md | Após contexto, antes desta rodada | Setup geral | PARCIALMENTE DESATUALIZADO | Dizia que VITE_API_URL podia trocar API; .env ignorado não descrevia o commit rastreado | Atualizado DEV/PROD, Git/histórico, destino novo e links |
| AGENTS.md | Pacote inicial | Instruções de engenharia | AINDA VÁLIDO | Precedência geral deve ser lida com a instrução técnica mais recente | Preservado; escopo atual explícito neste relatório |
| backend/AGENTS.md | Pacote inicial | Auditoria API/segurança | AINDA VÁLIDO | Não comprova estado remoto | Preservado; contratos e clientes auditados |
| frontend/AGENTS.md | Pacote inicial | Integração/acessibilidade | AINDA VÁLIDO | Não fecha WCAG nem decisões de artista | Preservado; nenhuma expansão de funcionalidade |
| backend/README.md | Template NestJS | Execução/deploy | DESATUALIZADO | Não documentava o projeto nem o novo serviço | Instruções reais adicionadas; template preservado como histórico |
| frontend/README.md | Template React/Vite | Execução frontend | DESATUALIZADO | Sem destino API e workaround DEV/PROD | Instruções reais adicionadas; template preservado |
| DOCUMENTACAO_PROJETO.md | Anterior à contenção, aviso 06/10 | Status e arquitetura | CONFLITANTE | “Concluído” excede evidência de integração; RLS/deploy posteriores ausentes | Nota atual e limites de negócio/homologação adicionados |
| ACESSIBILIDADE.md | Rodada a11y anterior | WCAG 2.1 AA | CONFLITANTE | Conformidade alegada sem auditoria integral; mudanças UX posteriores | Texto qualificado como alvo; evidências/pendências apontadas |
| DIAGRAMAS_UML.md | Baseline histórica | UML conceitual | PARCIALMENTE DESATUALIZADO | Não representa todo schema/ownership e fluxo de Auth atual | Nota de escopo atual; diagramas conceituais preservados |
| DIAGRAMAS_MERMAID.md | Baseline histórica | Fluxos didáticos | PARCIALMENTE DESATUALIZADO | Simplificações não são contrato nem prova remota | Nota datada e destino atual; sem inventar entidades |
| figma/README.md | Exportação Figma | Protótipo separado | AINDA VÁLIDO | Não é o frontend publicado | Preservado; não usar para stack de produção |
| figma/ATTRIBUTIONS.md | Exportação Figma | Atribuições/licenças | AINDA VÁLIDO | Nenhum conflito de deploy | Preservado integralmente |
| figma/guidelines/Guidelines.md | Template sem data | Exemplos de design | HISTÓRICO | Placeholder, não requisito oficial | Preservado; não executado como instrução |
| codex/context/FONTES_E_PRECEDENCIA.md | Pacote inicial | Fontes/prevalência | PARCIALMENTE DESATUALIZADO | Cita orientação antiga de bootstrap e baseline antiga de fontes | Atualizado com precedência desta rodada, RLS aplicado e histórico |
| codex/context/ESCOPO_E_TESTES.md | Pacote inicial | RF/RNF/CT | AINDA VÁLIDO | Inclui itens condicionados a decisão; não prova implementação | Preservado; usado para rastreio sem ampliar negócio |
| codex/context/CONFLITOS_E_DECISOES.md | 06–07/10 | C-01–C-09 | CONFLITANTE | Observações iniciais sem guard/edição roteada não são mais atuais | Revisão de todas as decisões + C-10 operacional; histórico preservado |
| codex/context/DEFINITION_OF_DONE.md | Pacote inicial | Critérios de aceite | AINDA VÁLIDO | Checklist vazio não é falha nem autorização de features | Preservado; sem marcar aceite não executado |
| codex/output/ESTADO_ATUAL.md | 06/10, auditoria inicial | Fotografia pré-contenção | HISTÓRICO | Sem guards/DTOs, testes ausentes, RLS desconhecido | Aviso atual; fotografia original preservada |
| codex/output/P0_SECURITY_FIX_REPORT.md | 06/10, contenção | Guards/allowlist | HISTÓRICO | Ainda descreve RLS aberto e 24 E2E | Aviso atual, resultados daquela rodada preservados |
| codex/output/SUPABASE_SERVER_ACCESS_REPORT.md | 06/10 | Separação de clientes | PARCIALMENTE DESATUALIZADO | Arquivos codex ignorados, frontend sem fallback, fluxo cadastro antigo | Aviso atual; arquitetura ainda válida; rodadas posteriores prevalecem |
| codex/output/SUPABASE_RLS_AUDIT.md | 06–07/10 | Auditoria pré-RLS | DESATUALIZADO | RLS=false e aplicação pendente | Aviso: RLS aplicado; não reutilizar como estado atual |
| codex/output/SUPABASE_MIGRATION_PLAN.md | 06–07/10 | Plano pré-migração | DESATUALIZADO | Mandava preparar/aplicar o que já foi feito | Aviso: plano histórico; não reaplicar nesta troca de URL |
| codex/output/RLS_ACCESS_MATRIX.md | 07/10 | Acesso esperado | PARCIALMENTE DESATUALIZADO | Matriz válida, mas título/condições diziam não aplicado | Aviso atual distingue regras preservadas e execução já feita |
| codex/output/A03_RLS_FINAL_REPORT.md | 07/10, preparação | Migration/checklists | DESATUALIZADO | Aplicação ainda bloqueada, Vercel branco e ausência de fallback | Aviso atual; histórico SQL não é roteiro para reaplicar |
| codex/output/A03_RLS_MANUAL_TEST_CHECKLIST.md | 07/10 | Gates de migration/segurança | DESATUALIZADO | Etapas pré/migration não são próximas ações atuais | Aviso: migração realizada; usar agora pós-deploy/security |
| codex/output/A05_A06_VALIDATION_REPORT.md | 06/10 | Cadastro/DTO/compensação | HISTÓRICO | Testes antigos e RLS pendente naquela rodada | Aviso atual; decisões de CPF/ownership continuam abertas |
| codex/output/FRONTEND_UX_A11Y_RESPONSIVE_REPORT.md | 07/10 | UX/foco/reflow | HISTÓRICO | Migração não aplicada e codex ignorado eram estados da época | Aviso atual; testes UX antigos não repetidos nesta rodada |
| codex/output/FRONTEND_MANUAL_TEST_CHECKLIST.md | 07/10 | Teclado/UX/homologação | AINDA VÁLIDO | Lista de testes continua pendente; A-03 agora está mais avançado | Preservado; complementar com novo checklist pós-deploy |
| codex/output/BACKEND_POST_RLS_RENDER_REPORT.md | 07/10 | Local 503/Render 500 | DESATUALIZADO | Falha local e ausência de novo Render superadas por evidência recente | Aviso atual; hipótese antiga não substitui GET novo 200 |
| codex/output/BACKLOG_PRIORIZADO.md | 06–07/10, várias rodadas | A-01–A-23 | CONFLITANTE | Várias seções “estado mais recente” incompatíveis | Nova tabela A-01–A-25 autoritativa, preservando história |
| codex/output/MATRIZ_RASTREABILIDADE.md | 06–07/10, várias rodadas | RF/RNF/CT | CONFLITANTE | Linhas pré-guard/migração convivem com posteriores | Nova seção datada com testes atuais e limites |
| codex/prompts/00_AUDITORIA_ESTADO_REAL.md | Pacote inicial | Roteiro auditoria | HISTÓRICO | Não é uma nova ordem de implementação | Lido/preservado, não executado como rodada |
| codex/prompts/01_FRONTEND_INTEGRACAO.md | Pacote inicial | Roteiro front | HISTÓRICO | Escopo mais amplo que a troca de URL | Lido/preservado, sem redesign/novas features |
| codex/prompts/02_ACESSIBILIDADE_AUDITORIA.md | Pacote inicial | Roteiro a11y | HISTÓRICO | Auditoria completa não ocorreu nesta rodada | Lido/preservado; testes assistivos seguem pendentes |
| codex/prompts/03_BACKEND_API.md | Pacote inicial | Roteiro API | HISTÓRICO | Não autoriza mudar arquitetura backend agora | Lido/preservado; apenas inspeção e gates |
| codex/prompts/04_SUPABASE_BANCO.md | Pacote inicial | Roteiro banco | HISTÓRICO | Migration não pertence à troca de frontend | Lido/preservado; nenhum SQL executado |
| codex/prompts/05_SEGURANCA_LGPD.md | Pacote inicial | Roteiro segurança | HISTÓRICO | Não equivale a conformidade jurídica ou nova rodada | Lido/preservado; checagens técnicas documentadas |
| codex/prompts/06_QA_INTEGRACAO_E2E.md | Pacote inicial | Roteiro QA | HISTÓRICO | Cobertura proposta excede testes executados | Lido/preservado; não declarar QA integral |
| codex/prompts/07_DOCUMENTACAO_DIAGRAMAS_RELEASE.md | Pacote inicial | Roteiro documentação | HISTÓRICO | Features instáveis impedem diagrama/manuais definitivos | Lido/preservado; escopo conceitual anotado |
| codex/prompts/08_VALIDACAO_FINAL.md | Pacote inicial | Roteiro aceite | HISTÓRICO | Release ainda possui pendências P0/P1 | Lido/preservado; sem prontidão final inventada |

## Divergências reconciliadas

1. **RLS e banco:** não estão mais em preparação. Postcheck da equipe informa RLS ativo, zero policies públicas, browser sem CRUD/sequences e service_role preservado. Nenhum SQL foi repetido; contagens/schema finais e authenticated direto ainda precisam evidência formal.
2. **Backend:** clientes Publishable/Auth e Secret/DB já estão separados. Local pós-RLS funcionou conforme evidência da conversa/equipe; novo Render teve GET 200 reconfirmado, enquanto o antigo continua 500. O estado antigo local 503 é histórico.
3. **Frontend:** existe workaround público Supabase, embora alguns relatórios dissessem configuração exclusiva por env. Foi preservado. A API agora usa novo Render em PROD e local em DEV, ignorando VITE_API_URL antiga. O site oficial ainda não recebeu o build.
4. **Autorização/validação:** observações iniciais sem guards/DTOs são superadas pelo código e pelos 48 E2E atuais. Isso não comprova Auth/admin real no novo serviço nem autoriza autoedição.
5. **Git:** codex e AGENTS são rastreados atualmente; avisos históricos de ignorados não são configuração presente. .env estavam rastreados apesar do ignore; foram retirados somente do índice. Há segredo em commit local anterior; remoção do arquivo não resolve histórico/rotação.
6. **“Concluído” e WCAG:** implementação não equivale a homologação. Qualificada a conformidade alegada em ACESSIBILIDADE; pendências de leitor/zoom/contraste/carga e fluxos reais preservadas.
7. **Funcionalidades incompletas:** rascunho ainda envia definitivo; uploads além da foto não persistem integralmente; ownership/SMTP e categorias/documentos não receberam decisões inventadas. A busca administrativa inerte já foi removida em UX; outras demonstrações permanecem.
8. **Bundle:** novo host presente, antigo/local ausentes, nenhuma credencial privilegiada real. Uma ocorrência textual `sb_secret_` é detector de formato do SDK, não chave. O gate literal de zero marcadores deve registrar essa exceção.

## Documentos atualizados e histórico preservado

Atualizados os três READMEs do projeto, DOCUMENTACAO_PROJETO, ACESSIBILIDADE, dois diagramas MD, FONTES_E_PRECEDENCIA, CONFLITOS_E_DECISOES, BACKLOG_PRIORIZADO e MATRIZ_RASTREABILIDADE. Adicionados avisos datados em onze outputs: ESTADO_ATUAL, P0_SECURITY_FIX_REPORT, SUPABASE_SERVER_ACCESS_REPORT, SUPABASE_RLS_AUDIT, SUPABASE_MIGRATION_PLAN, RLS_ACCESS_MATRIX, A03_RLS_FINAL_REPORT, A03_RLS_MANUAL_TEST_CHECKLIST, A05_A06_VALIDATION_REPORT, FRONTEND_UX_A11Y_RESPONSIVE_REPORT e BACKEND_POST_RLS_RENDER_REPORT.

Preservados sem reescrever: AGENTS, ESCOPO_E_TESTES, DEFINITION_OF_DONE, checklist UX, nove prompts e documentos Figma. Nos guias front/back, templates originais foram preservados sob rótulo histórico. Nenhuma decisão de negócio anterior apagada, nenhum PNG regenerado e nenhuma migration modificada.

## Backlog, decisões e pendências documentais

BACKLOG_PRIORIZADO contém revisão individual de A-01 a A-23 e novas entradas A-24 (remoção dos workarounds) e A-25 (rotação/histórico local). CONFLITOS_E_DECISOES revisa C-01–C-09 e registra C-10 como decisão operacional expressamente autorizada. C-02/C-03/C-04 permanecem abertos.

A-03 só encerra após frontend publicado no destino novo, smoke positivos, negativos diretos de authenticated e registro final de contagens/schema. O relatório de função não afirma que o site já foi corrigido. A-25 exige rotação e histórico seguro antes de push. Depois da publicação, anexar evidências sem dados pessoais/chaves, atualizar estados e planejar manuais/diagramas definitivos após as decisões pendentes.

## Novos documentos desta rodada

- `FRONTEND_NEW_RENDER_MIGRATION_REPORT.md`: 18 seções, mudanças, inventário HTTP, testes, riscos e limites.
- Este `DOCUMENTATION_RECONCILIATION_REPORT.md`: inventário e matriz dos 40 documentos anteriores.
- `NEW_RENDER_POST_DEPLOY_CHECKLIST.md`: critérios operacionais, de segurança e de retirada dos workarounds.

Nenhum desses documentos inclui valores de credenciais. Fonte backend, RLS, grants, schema, dados, Auth, ownership, CPF/CNPJ e regras de categoria não foram alterados.

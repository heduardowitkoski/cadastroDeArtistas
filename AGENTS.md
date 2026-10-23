# AGENTS.md — Cadastro Municipal de Artistas

## Missão

Ajudar a concluir, corrigir, testar e documentar o **Cadastro Municipal de Artistas de Bagé**
sem reescrever funcionalidades que já funcionam e sem transformar documentação antiga em
requisito novo.

A regra central deste repositório é:

> **Primeiro provar o estado real. Depois corrigir apenas as lacunas confirmadas.**

## Leitura obrigatória antes de alterar código

Leia, nesta ordem:

1. `DOCUMENTACAO_PROJETO.md`
2. `ACESSIBILIDADE.md`
3. `DIAGRAMAS_UML.md`
4. `DIAGRAMAS_MERMAID.md`
5. `codex/context/FONTES_E_PRECEDENCIA.md`
6. `codex/context/ESCOPO_E_TESTES.md`
7. `codex/context/CONFLITOS_E_DECISOES.md`
8. `codex/context/DEFINITION_OF_DONE.md`
9. o `AGENTS.md` específico da pasta em que você trabalhar, quando existir.

## Stack atual declarada pelo repositório

A documentação técnica atual declara:

- Front-end: React 19 + TypeScript + Vite + Vanilla CSS.
- Back-end: NestJS + TypeScript.
- API: REST.
- Banco: Supabase PostgreSQL.
- Autenticação: Supabase Auth.
- Front-end publicado na Vercel.
- Back-end publicado na Render.
- Banco/Auth no Supabase.

Confirme versões e dependências reais nos manifests antes de mudar qualquer coisa.

## Documentação existente é parte do produto

Não crie outro documento duplicando silenciosamente:
- acessibilidade;
- diagramas;
- arquitetura;
- status.

Se o conteúdo estiver incorreto, **atualize o arquivo existente** e registre por que mudou.

## Precedência de fontes

Quando houver conflito:

1. decisão explícita e mais recente validada pela equipe/demandante;
2. Documento de Testes e Validação mais recente;
3. Documento de Requisitos mais recente;
4. documentação técnica atual do repositório, quando confirmada pelo código;
5. registros de reunião;
6. DOD/Projeto de Extensão;
7. relatórios e protótipos históricos;
8. diagramas/imagens antigas.

O código é evidência do estado atual, não autorização para mudar requisitos.

## Regra para documentos que dizem "Concluído"

`DOCUMENTACAO_PROJETO.md` afirma que formulário, catálogo, busca, painel e feedback estão
concluídos. Trate isso como uma **hipótese a validar**, não como fato automático.

Para considerar confirmado, localize:
- implementação;
- contrato de API;
- persistência;
- permissão;
- teste;
- comportamento no ambiente executável.

## Regras de engenharia

- Faça mudanças pequenas e revisáveis.
- Não altere stack principal sem aprovação.
- Não implemente itens de backlog antigo só porque aparecem no DOD.
- Não exponha CPF/CNPJ, dados privados, tokens ou feedbacks publicamente.
- Autorização administrativa deve existir no servidor.
- Valide entradas no front e novamente no back.
- Não coloque `service_role`, tokens ou secrets no front.
- Toda alteração de banco deve ser reprodutível e documentada.
- Não faça operação destrutiva em produção.
- Não invente regra de CPF/CNPJ, autenticação do artista, ranking ou histórico de portfólio.
- Associe alterações a RF/RNF/CT quando houver identificador.

## Testes mínimos

Quando aplicável:

- instalação limpa;
- lint;
- typecheck;
- build;
- testes unitários;
- integração;
- E2E de fluxo crítico;
- auditoria de acessibilidade;
- teste manual de teclado;
- teste de autorização negativa.

Não marque teste como aprovado sem executá-lo.

## Saída de toda tarefa

Informe:
1. arquivos alterados;
2. requisitos/casos de teste relacionados;
3. testes executados;
4. resultado;
5. riscos;
6. decisões pendentes;
7. próximo passo.

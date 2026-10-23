# Agente 0 — Auditoria do estado real

NÃO implemente features nesta primeira rodada.

Leia:
- `AGENTS.md`
- `DOCUMENTACAO_PROJETO.md`
- `ACESSIBILIDADE.md`
- `DIAGRAMAS_UML.md`
- `DIAGRAMAS_MERMAID.md`
- `codex/context/*`

Depois audite o repositório inteiro.

## Objetivos

1. Confirmar stack e versões.
2. Executar instalação, lint, typecheck, build e testes existentes.
3. Mapear rotas React.
4. Mapear endpoints NestJS.
5. Mapear autenticação admin e possível autenticação de artista.
6. Ler `backend/supabase.sql` e qualquer migration/config de Supabase.
7. Verificar se as funcionalidades marcadas como "Concluído" realmente funcionam.
8. Conferir os arquivos citados em `ACESSIBILIDADE.md`.
9. Criar rastreabilidade RF/RNF/CT -> código -> teste -> status.
10. Identificar divergências dos diagramas.

## Produzir

- `codex/output/ESTADO_ATUAL.md`
- `codex/output/MATRIZ_RASTREABILIDADE.md`
- `codex/output/BACKLOG_PRIORIZADO.md`
- atualizar `codex/context/CONFLITOS_E_DECISOES.md` se necessário.

## Classificação

- P0: segurança, perda de dados, auth quebrada, build/deploy inviável.
- P1: requisito principal quebrado/incompleto.
- P2: qualidade, acessibilidade, inconsistência não bloqueadora.
- P3: melhoria/backlog.

Para cada achado, cite arquivo/linha/comando/evidência.

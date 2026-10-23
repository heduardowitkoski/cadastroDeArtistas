# Fontes do projeto e precedência

## Arquivos atuais do Git

### `DOCUMENTACAO_PROJETO.md`
É a melhor fotografia declarada do estado recente do código:
- React 19 + TS + Vite + CSS;
- NestJS;
- Supabase;
- funcionalidades marcadas como concluídas;
- pendência de manuais/homologação;
- instrução atual de executar `backend/supabase.sql`.

**Uso:** ponto de partida da auditoria.
**Limite:** status "Concluído" precisa ser confirmado no código/testes.

### `ACESSIBILIDADE.md`
Registra melhorias já implementadas com alvo WCAG 2.1 AA:
- foco;
- teclado;
- modal;
- labels;
- autocomplete;
- alertas;
- contraste;
- idioma;
- headings;
- links/ícones.

**Uso:** checklist do que deveria existir.
**Limite:** não prova conformidade sozinho; precisa auditoria real.

### `DIAGRAMAS_UML.md`
Representa:
- casos de uso;
- entidades conceituais;
- cadastro/aprovação;
- feedback;
- implantação.

**Uso:** comunicação e arquitetura conceitual.
**Limite:** pode estar defasado em relação ao código.

### `DIAGRAMAS_MERMAID.md`
Versão didática dos fluxos para equipe/demandantes.

**Uso:** documentação de comunicação.
**Limite:** modelo simplificado e não deve substituir schema real.

### PNGs de casos de uso e sequência
Trate como artefatos gerados/históricos.
Se divergirem dos `.md`, prefira atualizar a fonte textual e regenerar as imagens.

## Documentos externos resumidos neste pacote

O projeto também possui:
- DOD;
- Projeto de Extensão;
- Documento de Requisitos;
- Termo LGPD;
- relatório/apresentação de Práticas Extensionistas I;
- Documento de Testes e Validação.

Os pontos necessários ao desenvolvimento estão consolidados em
`codex/context/ESCOPO_E_TESTES.md`.

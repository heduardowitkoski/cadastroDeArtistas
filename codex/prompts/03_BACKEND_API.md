# Agente 3 — Backend/API NestJS

Leia a auditoria antes.

Confirme controllers/services/modules e produza/atualize:
`codex/output/CONTRATO_API.md`.

Tabela:
`METHOD | PATH | AUTH | ROLE | INPUT | OUTPUT | RF/CT`.

Audite e corrija:
- cadastro;
- aprovados públicos;
- listagem admin;
- busca;
- status;
- edição;
- exclusão;
- feedback;
- exportação se estiver no escopo;
- autenticação/autorização;
- validação DTO.

Regras:
- pendente/rejeitado nunca em resposta pública;
- autorização no servidor;
- nenhuma role confiada ao cliente;
- DTO público separado quando necessário;
- desaprovar != excluir;
- status persistido e testado.

Se Área do Artista estiver incompleta, não invente o fluxo; registre a decisão necessária.

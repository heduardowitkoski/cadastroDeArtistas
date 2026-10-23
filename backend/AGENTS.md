# AGENTS.md — Back-end

Aplica-se a `backend/`.

## Baseline declarada

NestJS + TypeScript + API REST.

A documentação e os diagramas indicam, entre outros, fluxos/rotas equivalentes a:
- criação de artista;
- listagem administrativa;
- listagem pública de aprovados;
- atualização de status;
- feedbacks.

Não presuma os paths exatos; confirme nos controllers.

## Auditoria obrigatória

Monte inventário:
`METHOD | PATH | AUTH | PAPEL | DTO | RESPOSTA | RF/CT`.

## Segurança

- validação server-side obrigatória;
- guards/autorização em rotas administrativas;
- nunca confiar em papel enviado pelo cliente;
- endpoints públicos devem retornar DTO público;
- pendentes/rejeitados não podem vazar;
- validar ownership se existir autoedição do artista;
- não logar CPF/CNPJ/senhas/tokens;
- tratar uploads de forma segura se estiverem implementados.

## Estados

Verifique consistência de:
- Pendente;
- Aprovado;
- Rejeitado;
- desaprovação de aprovado;
- exclusão definitiva.

Desaprovar e excluir não são a mesma operação.

## Auth do artista

Há evidência documental de telas de login/edição de artista, mas a documentação técnica
também descreve Supabase Auth como autenticação administrativa.

Não conclua a regra sozinho. Primeiro descubra o fluxo real e registre a divergência.

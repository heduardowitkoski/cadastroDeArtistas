# Agente 4 — Supabase, banco, Auth e Storage

Primeiro audite:
- `backend/supabase.sql`;
- uso real do Supabase;
- tabelas;
- colunas;
- FKs;
- índices;
- RLS/policies;
- Auth;
- Storage;
- seeds/dados de exemplo.

Compare com o código e a baseline.

Atenção especial:
- `nome_artistico`;
- `cpf_cnpj`;
- `tags`;
- `disponibilidade`;
- `feedbacks`;
- status;
- categorias;
- possível N:N;
- possível vínculo com usuário artista;
- dados públicos/privados.

Produza:
- `codex/output/MODELO_BANCO.md`
- `codex/output/MATRIZ_RLS.md`
- plano de migração.

Não execute mudança destrutiva em produção.
Não trate execução manual de SQL como única forma aceitável sem avaliar alternativa de
migration versionada.

Seed de performance deve usar dados fictícios.

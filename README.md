# Cadastro Municipal de Artistas de Bagé

Este repositório contém o frontend React/Vite, a API NestJS, o código de referência em `figma/`, a documentação técnica e os registros de auditoria em `codex/`.

## Preparar em outro computador

```powershell
git clone https://github.com/heduardowitkoski/cadastroDeArtistas.git
cd cadastroDeArtistas
cd backend
npm ci
Copy-Item .env.example .env
```

Preencha `backend/.env` localmente com `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`. Obtenha os valores pelo canal seguro da equipe. A Secret Key deve ficar somente no backend.

```powershell
cd ../frontend
npm ci
Copy-Item .env.example .env
```

Preencha `frontend/.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Temporariamente, `frontend/src/lib/apiConfig.ts` ignora `VITE_API_URL`: `npm run dev` usa `http://localhost:3001`; builds de produção usam `https://cadastro-artistas-api-matheus.onrender.com`. Isso impede que a variável antiga da Vercel mantenha o frontend no backend anterior. Nunca crie uma variável `VITE_` para a Secret Key.

Abra dois terminais na raiz do repositório:

```powershell
cd backend
npm run start:dev
```

```powershell
cd frontend
npm run dev
```

`figma/` é o projeto de referência visual. Para executá-lo separadamente, entre nessa pasta e rode `npm install` e `npm run dev` conforme `figma/README.md`.

## Verificações locais

```powershell
cd backend
npm test -- --runInBand
npm run test:e2e -- --runInBand
npx tsc --noEmit -p tsconfig.json
npm run build
```

```powershell
cd frontend
npm run lint
npm test
npm run build
```

O script `npm run lint` do backend inclui `--fix` e modifica arquivos; use `npx eslint` para uma checagem sem alterações.

## O que o GitHub não transporta

Os arquivos `.env` reais, `node_modules/`, `dist/`, caches, logs e backups locais devem permanecer ignorados. Nesta recuperação, os `.env` foram removidos somente do índice, preservando os arquivos locais. Há um commit local anterior com Secret Key: remover o arquivo do índice não limpa o histórico. A equipe deve rotacionar a chave e preparar um histórico seguro antes de qualquer push, sem contornar o GitHub Push Protection. O Git não transporta a configuração remota do Supabase, Render ou Vercel. Use `.env.example` como modelo; **não execute `backend/supabase.sql` em um banco existente**, pois é um bootstrap destrutivo.

Leia `AGENTS.md` e `codex/context/` antes de continuar o desenvolvimento. O estado e os limites das rodadas anteriores estão em `codex/output/`.

## Estado de integração em 23/10/2026

O RLS já foi aplicado manualmente. O novo backend da equipe, `cadastro-artistas-api-matheus`, respondeu 200 em `/artistas/aprovados`; o antigo continua retornando 500. O frontend foi preparado localmente para a nova URL, mas o bundle oficial ainda precisa ser publicado e validado. A-03 permanece parcial até os smoke/security tests finais.

**REMOVER ANTES DO DEPLOY PRD FINAL:** recuperar o acesso à Vercel, configurar externamente `VITE_API_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` e remover o hardcode da API e os fallbacks públicos do Supabase. No Render, manter `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` e `FRONTEND_URL` externos ao Git. Os valores não pertencem aos relatórios.

- [Relatório da migração](codex/output/FRONTEND_NEW_RENDER_MIGRATION_REPORT.md)
- [Reconciliação dos 40 documentos](codex/output/DOCUMENTATION_RECONCILIATION_REPORT.md)
- [Checklist pós-deploy](codex/output/NEW_RENDER_POST_DEPLOY_CHECKLIST.md)

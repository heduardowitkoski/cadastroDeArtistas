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

Preencha `frontend/.env` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY`. Para usar uma API em outro endereço, defina também `VITE_API_URL` nesse arquivo (por padrão o frontend usa `http://localhost:3001`). Nunca crie uma variável `VITE_` para a Secret Key.

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

Os arquivos `.env` reais, `node_modules/`, `dist/`, caches, logs e backups locais são ignorados. O GitHub também não contém os dados nem a configuração remota do Supabase, Render ou Vercel. Use os `.env.example` como modelo e configure as credenciais e serviços separadamente; **não execute `backend/supabase.sql` em um banco existente**, pois é um script de bootstrap destrutivo.

Leia `AGENTS.md` e `codex/context/` antes de continuar o desenvolvimento. O estado e os limites das rodadas anteriores estão em `codex/output/`.

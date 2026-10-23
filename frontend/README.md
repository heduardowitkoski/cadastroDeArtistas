# React + TypeScript + Vite

## Configuração real do projeto — 23/10/2026

- Execute `npm ci` e `npm run dev`: o Vite usa a API local `http://localhost:3001`.
- `npm run build` produz `dist/` e aponta temporariamente para `https://cadastro-artistas-api-matheus.onrender.com`, mesmo se VITE_API_URL ainda contiver o backend antigo.
- A configuração única está em `src/lib/apiConfig.ts`. Essa exceção impede usar VITE_API_URL para alternar ambientes enquanto o workaround estiver ativo; builds de preview também usam o novo Render.
- Supabase Auth usa VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY; fallbacks públicos existentes foram mantidos e marcados com TODO PRD. Nenhuma chave privilegiada pertence ao frontend.
- Gates: `npm run lint`, `npx tsc -b --noEmit`, `npm test`, `npm run build`.
- Vercel: Root Directory `frontend`, build `npm run build`, output `dist`, rewrite SPA em `vercel.json`. Publicar um novo build é obrigatório para atualizar o site oficial.
- **REMOVER ANTES DO DEPLOY PRD FINAL:** configurar as três variáveis VITE_API_URL/VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY no painel, restaurar uso normal de VITE_API_URL e remover hardcode/fallbacks.

Relatório e checklist: `../codex/output/FRONTEND_NEW_RENDER_MIGRATION_REPORT.md` e `../codex/output/NEW_RENDER_POST_DEPLOY_CHECKLIST.md`.

## Template original do framework — referência histórica

O conteúdo abaixo foi preservado; não é a configuração de deploy deste projeto.


This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

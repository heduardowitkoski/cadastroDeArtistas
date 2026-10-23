// TODO PRD: REMOVER ANTES DO DEPLOY PRD FINAL.
// A equipe ainda não tem acesso às Environment Variables da Vercel.
// Em produção, ignorar a VITE_API_URL antiga até recuperar esse acesso.
// Antes do deploy definitivo, configurar VITE_API_URL no painel e restaurar seu uso.
export const API_URL = import.meta.env.DEV
  ? 'http://localhost:3001'
  : 'https://cadastro-artistas-api-matheus.onrender.com'

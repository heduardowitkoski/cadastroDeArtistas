import { createClient } from '@supabase/supabase-js'

// TODO PRD: REMOVER ANTES DO DEPLOY PRD FINAL — configurar VITE_SUPABASE_URL na Vercel.
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://asxqxyukeokrhxischog.supabase.co'

// TODO PRD: REMOVER ANTES DO DEPLOY PRD FINAL — configurar VITE_SUPABASE_PUBLISHABLE_KEY na Vercel.
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_TRSEfXCLkEtpQQ8uDQXfCQ_FFrAF5wR'

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Configuração do Supabase ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
  )
}

const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
const authStorageKey = `sb-${projectRef}-auth-token`;
const rememberPreferenceKey = `${authStorageKey}-remember`;

const authStorage = {
  getItem(key: string) {
    if (typeof window === 'undefined') return null;
    const remember = window.localStorage.getItem(rememberPreferenceKey) !== 'false';
    return (remember ? window.localStorage : window.sessionStorage).getItem(key);
  },
  setItem(key: string, value: string) {
    if (typeof window === 'undefined') return;
    const remember = window.localStorage.getItem(rememberPreferenceKey) !== 'false';
    const target = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    target.setItem(key, value);
    other.removeItem(key);
  },
  removeItem(key: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

export function setSupabaseSessionPersistence(remember: boolean) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(rememberPreferenceKey, String(remember));
  const source = remember ? window.sessionStorage : window.localStorage;
  const target = remember ? window.localStorage : window.sessionStorage;
  const existingSession = source.getItem(authStorageKey);
  if (existingSession) target.setItem(authStorageKey, existingSession);
  source.removeItem(authStorageKey);
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  { auth: { storage: authStorage, storageKey: authStorageKey } }
)

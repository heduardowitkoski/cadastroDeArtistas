import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://SEU-PROJETO.supabase.co'

const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_TRSEfXCLkEtpQQ8uDQXfCQ_FFrAF5wR'

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Configuração do Supabase ausente: defina VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY.'
  )
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
)
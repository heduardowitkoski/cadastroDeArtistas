import { supabase } from './supabase'
import { API_URL } from './apiConfig'

export async function adminFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const { data, error } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (error || !token) {
    throw new Error('Sessão administrativa indisponível. Entre novamente.')
  }

  const headers = new Headers(init.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return fetch(`${API_URL}${path}`, { ...init, headers })
}

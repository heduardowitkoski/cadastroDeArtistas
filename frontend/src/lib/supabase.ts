import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://asxqxyukeokrhxischog.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzeHF4eXVrZW9rcmh4aXNjaG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTYyMjcsImV4cCI6MjEwMjQ3MjIyN30.Sy4yzl5854ULfWjBd2uTzD42Bm5PvqYaT84D0q7CHrU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

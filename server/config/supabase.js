import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const options = { auth: { persistSession: false, autoRefreshToken: false } }

// Cliente con privilegios totales: solo en el servidor
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  options
)

// Alias para no romper routes/births.js
export const supabase = supabaseAdmin

// Cliente nuevo por petición (login, refresh...) para no compartir estado
export const createAnonClient = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, options)

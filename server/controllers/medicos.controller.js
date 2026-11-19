import { supabase } from '../config/supabase.js'

export async function list(req, res) {
  const { data, error } = await supabase
    .from('medico')
    .select('id, nombre, apellidos, especialidad')
    .eq('activo', true)
    .order('apellidos')
  if (error) throw error

  res.json(
    data.map((m) => ({
      id: m.id,
      nombre: `${m.nombre} ${m.apellidos}`,
      especialidad: m.especialidad,
    }))
  )
}

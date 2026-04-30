import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

function mapGolf(row) {
  if (!row) return null;
  return {
    fecha: row.fecha,
    sesionId: row.sesion_id,
    datos: row.datos || {},
    scorecard: row.scorecard || null,
    notas: row.notas || ''
  };
}

function mapGym(row) {
  if (!row) return null;
  return {
    fecha: row.fecha,
    sesionId: row.sesion_id,
    series: row.series || {},
    notas: row.notas || ''
  };
}

function mapHockey(row) {
  if (!row) return null;
  return {
    fecha: row.fecha,
    asistido: row.asistio,
    sensacion: row.sensacion,
    notas: row.notas || ''
  };
}

export async function guardarGolf({ fecha, sesionId, datos, scorecard, notas }) {
  try {
    const { error } = await supabase
      .from('golf_sessions')
      .upsert(
        {
          fecha,
          sesion_id: sesionId,
          datos,
          scorecard,
          notas
        },
        { onConflict: 'fecha,sesion_id' }
      );
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error guardando golf:', error);
    return false;
  }
}

export async function cargarGolf(fecha, sesionId) {
  try {
    let query = supabase.from('golf_sessions').select('*');
    if (fecha) query = query.eq('fecha', fecha);
    if (sesionId) query = query.eq('sesion_id', sesionId);
    const { data, error } = await query.order('fecha', { ascending: true });
    if (error) throw error;
    return fecha && sesionId ? mapGolf(data?.[0]) : (data || []).map(mapGolf);
  } catch (error) {
    console.error('Error cargando golf:', error);
    return fecha && sesionId ? null : [];
  }
}

export async function guardarGym({ fecha, sesionId, series, notas }) {
  try {
    const { error } = await supabase
      .from('gym_sessions')
      .upsert(
        {
          fecha,
          sesion_id: sesionId,
          series,
          notas
        },
        { onConflict: 'fecha,sesion_id' }
      );
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error guardando gym:', error);
    return false;
  }
}

export async function cargarGym(fecha, sesionId) {
  try {
    let query = supabase.from('gym_sessions').select('*');
    if (fecha) query = query.eq('fecha', fecha);
    if (sesionId) query = query.eq('sesion_id', sesionId);
    const { data, error } = await query.order('fecha', { ascending: true });
    if (error) throw error;
    return fecha && sesionId ? mapGym(data?.[0]) : (data || []).map(mapGym);
  } catch (error) {
    console.error('Error cargando gym:', error);
    return fecha && sesionId ? null : [];
  }
}

export async function guardarHockey({ fecha, asistio, sensacion, notas }) {
  try {
    const { error } = await supabase
      .from('hockey_sessions')
      .upsert(
        {
          fecha,
          asistio,
          sensacion,
          notas
        },
        { onConflict: 'fecha' }
      );
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error guardando hockey:', error);
    return false;
  }
}

export async function cargarHockey(fecha) {
  try {
    let query = supabase.from('hockey_sessions').select('*');
    if (fecha) query = query.eq('fecha', fecha);
    const { data, error } = await query.order('fecha', { ascending: true });
    if (error) throw error;
    return fecha ? mapHockey(data?.[0]) : (data || []).map(mapHockey);
  } catch (error) {
    console.error('Error cargando hockey:', error);
    return fecha ? null : [];
  }
}

export async function guardarTareas(fecha, tareas) {
  try {
    await supabase.from('tareas_extra').delete().eq('fecha', fecha);
    if (!tareas.length) return true;

    const rows = tareas.map(tarea => ({
      id: tarea.id,
      fecha,
      hora: tarea.hora,
      texto: tarea.texto,
      hecho: tarea.hecho
    }));

    const { error } = await supabase
      .from('tareas_extra')
      .upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error guardando tareas:', error);
    return false;
  }
}

export async function cargarTareas(fecha) {
  try {
    const { data, error } = await supabase
      .from('tareas_extra')
      .select('*')
      .eq('fecha', fecha)
      .order('hora', { ascending: true });
    if (error) throw error;
    return (data || []).map(tarea => ({
      id: tarea.id,
      hora: tarea.hora,
      texto: tarea.texto,
      hecho: tarea.hecho
    }));
  } catch (error) {
    console.error('Error cargando tareas:', error);
    return [];
  }
}

export const obtenerGrupoMixtoPorFecha = (fechaISO: string): 'A' | 'B' | 'C' => {
  const ancla = new Date('2026-01-01T12:00:00');
  const actual = new Date(`${fechaISO}T12:00:00`);
  const diffDias = Math.round((actual.getTime() - ancla.getTime()) / (1000 * 60 * 60 * 24));
  const mod = ((diffDias % 3) + 3) % 3;
  if (mod === 0) return 'A';
  if (mod === 1) return 'B';
  return 'C';
};

export const obtenerGrupo24x24PorFecha = (fechaISO: string): 'A' | 'B' => {
  const ancla = new Date('2026-01-01T12:00:00');
  const actual = new Date(`${fechaISO}T12:00:00`);
  const diffDias = Math.round((actual.getTime() - ancla.getTime()) / (1000 * 60 * 60 * 24));
  const par = ((diffDias % 2) + 2) % 2 === 0;
  return par ? 'A' : 'B';
};

export const leTocaGuardiaHoy = (
  grupoRaw: string,
  turnoRaw: string,
  fechaISO: string
): boolean => {
  const grupo = String(grupoRaw || 'A').trim().toUpperCase();
  const turno = String(turnoRaw || 'MIXTO').trim().toUpperCase();

  if (turno === 'DIURNO' || turno === 'NOCTURNO') {
    return true;
  }

  // Esquema 48X48 con fin de semana alterno (V-S-D)
  // Ancla: Jueves 26/11/2026 (Grupo A trabaja, Grupo B libra)
  if (turno === '48X48') {
    const ancla = new Date('2026-11-26T12:00:00');
    const actual = new Date(`${fechaISO}T12:00:00`);
    const diffDias = Math.round((actual.getTime() - ancla.getTime()) / (1000 * 60 * 60 * 24));
    const diaCiclo14 = ((diffDias % 14) + 14) % 14;

    const diasGrupoA = new Set([0, 1, 2, 3, 6, 7, 10, 11]);
    const trabajaA = diasGrupoA.has(diaCiclo14);
    return grupo === 'B' ? !trabajaA : trabajaA;
  }

  // Esquema 24X24 (Grupos A, B)
  if (turno === '24X24') {
    return grupo === obtenerGrupo24x24PorFecha(fechaISO);
  }

  // Esquema MIXTO estándar (Grupos A, B, C)
  return grupo === obtenerGrupoMixtoPorFecha(fechaISO);
};

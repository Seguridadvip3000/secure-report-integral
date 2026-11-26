export const PROYECTOS: string[] = [
  'ACADEMIA WASHINGTON',
  'ASOPRASUR',
  'BANCO DE VENEZUELA SEDE PRINCIPAL',
  'BARUTA',
  'CAMPO CLARO',
  'CARONOCO',
  'CCCT',
  'CENTRO PLAZA',
  'CHACAITO',
  'COMERCIO CCCT',
  'CONCRESA',
  'DUNCAN LA CALIFORNIA',
  'ESTACIONAMIENTO CCCT',
  'GALP 02 Y 03 VALENCIA',
  'GALP 110',
  'GALP IMPAL',
  'GALP MONTERREY',
  'GALPS IND IMPAL',
  'GALPS IND MONTERREY',
  'GALPS. INDUSTRIAL',
  'GALPS. MARACAY',
  'INCAMETAL',
  'LA CALIFORNIA',
  'LA GRANJA',
  'LAB. GALP 141 Y 142',
  'LAB. GALP 34',
  'MULTICENTRO EMPRESARIAL DEL ESTE',
  'OFICINA PRINCIPAL',
  'PRADOS DEL ESTE',
  'RESID. EDEN PARK',
  'RESID. QUINZANDAL',
  'RESID. VISTA REAL',
  'SEDE PRINCIPAL',
  'SUELOPETROL',
  'TORRE BRITANICA',
  'TRINIDAD',
  'TRINITARIAS',
  'URBANIZACION SAN ROMAN',
  'VALENCIA',
  'YARIBU',
];

export const PROYECTOS_EXCLUIDOS: string[] = [
  'HIERROBECO',
  'GALP HIERROBECO BQTO',
  'TERRENO LA ONZA',
  'TERRENOS LA ONZA',
  'TERRENO ARAUCA',
  'TERRENOS ARAUCA',
];

export type HorarioPermitido = 'MIXTO' | '24X24' | '48X48' | 'DIURNO' | 'NOCTURNO';

export interface ConfigHorarioProyecto {
  turnosPermitidos: HorarioPermitido[];
  tieneLider: boolean;
  esCombinado: boolean;
}

const PROYECTOS_COMBINADO_MIXTO_DIURNO = new Set([
  'CENTRO PLAZA',
  'CONCRESA',
  'CHACAITO',
  'BARUTA',
  'LA GRANJA',
  'TRINIDAD',
  'ASOPRASUR',
  'ASOPROSUR',
]);

const PROYECTOS_DIURNO_NOCTURNO = new Set([
  'TRINITARIAS',
]);

const PROYECTOS_SOLO_DIURNO = new Set([
  'BANCO DE VENEZUELA SEDE PRINCIPAL',
  'ENTIDADES BANCARIAS',
  'BANCO DE VENEZUELA',
  'BANCO MERCANTIL',
  'BANCO PROVINCIAL',
  'BANESCO',
  'BNC',
  'BANCARIBE',
  'BANCO DEL TESORO',
  'BANCO BICENTENARIO',
]);

const PROYECTOS_48X48_SIN_LIDER = new Set([
  'RESID. EDEN PARK',
  'GALPS IND MONTERREY',
  'GALP MONTERREY',
  'RESID. QUINZANDAL',
  'GALPS IND IMPAL',
  'GALP IMPAL',
]);

const PROYECTOS_24X24 = new Set([
  'RESID. VISTA REAL',
  'URBANIZACION SAN ROMAN',
]);
export const obtenerConfigHorarioProyecto = (proyectoRaw: string): ConfigHorarioProyecto => {
  const proy = String(proyectoRaw || '').trim().toUpperCase();

  if (PROYECTOS_COMBINADO_MIXTO_DIURNO.has(proy)) {
    return {
      turnosPermitidos: ['MIXTO', 'DIURNO'],
      tieneLider: true,
      esCombinado: true,
    };
  }

  if (PROYECTOS_DIURNO_NOCTURNO.has(proy)) {
    return {
      turnosPermitidos: ['DIURNO', 'NOCTURNO'],
      tieneLider: true,
      esCombinado: false,
    };
  }

  if (
    PROYECTOS_SOLO_DIURNO.has(proy) ||
    proy.includes('BANCO') ||
    proy.includes('ENTIDAD BANCARIA')
  ) {
    return {
      turnosPermitidos: ['DIURNO'],
      tieneLider: true,
      esCombinado: false,
    };
  }

  if (PROYECTOS_48X48_SIN_LIDER.has(proy)) {
    return {
      turnosPermitidos: ['48X48'],
      tieneLider: false,
      esCombinado: false,
    };
  }

  if (PROYECTOS_24X24.has(proy)) {
    return {
      turnosPermitidos: ['24X24'],
      tieneLider: true,
      esCombinado: false,
    };
  }

  return {
    turnosPermitidos: ['MIXTO'],
    tieneLider: true,
    esCombinado: false,
  };
};

export const TITULOS_NOVEDAD: string[] = [
  'NOVEDAD EN EL SERVICIO',
  'INFORME DE INCIDENCIA OPERATIVA',
  'REPORTE DE SUPERVISIÓN Y CONTROL',
  'REPORTE DE FALLA DE INFRAESTRUCTURA / SERVICIOS',
  'NOVEDAD CON PERSONAL / ASISTENCIA',
  'ENTREGA Y RECEPCIÓN DE GUARDIA',
  'HURTO O ROBO DETECTADO',
  'ACCIDENTE O EMERGENCIA MÉDICA',
  'OTRA:',
];

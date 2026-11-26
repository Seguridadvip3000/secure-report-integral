export const PROYECTOS: string[] = [
  "ESTACIONAMIENTO CCCT",
  "COMERCIO CCCT",
  "NIKEL 3",
  "SECTOR YAREY",
  "HOTEL CCT",
  "CENTRO JOYERO",
  "EXPRESO CHACAITO",
  "EXPRESO BARUTA",
  "EXPRESO LA TRINIDAD",
  "GALERIA SEBUCAN",
  "CC GALERIA PRADO DEL ESTE",
  "CC UNICO",
  "CC VIZCAYA",
  "CC CONCRESA",
  "CENTRO PLAZA",
  "ACADEMIA WASHINGTON",
  "CC CASCADA CARRIZAL",
  "CECOM CASCADA CARRIZAL",
  "CC CASCADA MATURIN",
  "HOTEL CASCADA MATURIN",
  "GOKARTS",
  "DUNCAN LOS RUICES",
  "DUNCAN LA CALIFORNIA",
  "LA GRANJA",
  "CC LAS TRINITARIAS",
  "HOTEL TRINITARIAS SUITS",
  "RESIDENCIA ASOPRASUR",
  "RESIDENCIA ESCAMPADERO",
  "RESID. LA HACIENDA",
  "RESID. VILLA SALVA III",
  "RESID. QUINZANDAL",
  "RESID. ESPOSALLE",
  "RESID. EDEN PARK",
  "RESID. ASONAPOLEON",
  "RESID. YARIBU",
  "COUNTRY",
  "GALPS IND MONTERREY",
  "GALPS IND IMPAL",
  "ENTIDADES BANCARIAS",
  "FUERZA AEREA MARACAY",
  "RESIDENCIAS PARAISO LOS CHORROS",
];

export const PROYECTOS_EXCLUIDOS: string[] = [
  "HIERROBECO",
  "GALP HIERROBECO BQTO",
  "TERRENO LA ONZA",
  "TERRENO ARAUCA",
];

export type HorarioPermitido = 'MIXTO' | '24X24' | '48X48' | 'DIURNO' | 'NOCTURNO';

export interface ConfigHorarioProyecto {
  turnosPermitidos: HorarioPermitido[];
  tieneLider: boolean;
  esCombinado: boolean;
}

const PROYECTOS_COMBINADO_MIXTO_DIURNO = new Set([
  "CENTRO JOYERO",
  "EXPRESO CHACAITO",
  "EXPRESO BARUTA",
  "EXPRESO LA TRINIDAD",
  "CC CONCRESA",
  "CENTRO PLAZA",
  "RESIDENCIA ASOPRASUR",
  "LA GRANJA",
]);

const PROYECTOS_DIURNO_NOCTURNO = new Set([
  "CC LAS TRINITARIAS",
  "HOTEL TRINITARIAS SUITS",
]);

const PROYECTOS_SOLO_DIURNO = new Set([
  "ENTIDADES BANCARIAS",
]);

const PROYECTOS_48X48_SIN_LIDER = new Set([
  "GALPS IND MONTERREY",
  "GALPS IND IMPAL",
  "RESID. QUINZANDAL",
  "RESID. EDEN PARK",
]);

const PROYECTOS_MIXTO_SIN_LIDER = new Set([
  "SECTOR YAREY",
  "CC VIZCAYA",
  "CECOM CASCADA CARRIZAL",
  "HOTEL CASCADA MATURIN",
  "RESID. VILLA SALVA III",
  "RESID. ESPOSALLE",
  "RESID. ASONAPOLEON",
  "COUNTRY",
  "FUERZA AEREA MARACAY",
]);

const PROYECTOS_NOCTURNO_SIN_LIDER = new Set([
  "RESID. YARIBU",
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

  if (PROYECTOS_SOLO_DIURNO.has(proy)) {
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

  if (PROYECTOS_MIXTO_SIN_LIDER.has(proy)) {
    return {
      turnosPermitidos: ['MIXTO'],
      tieneLider: false,
      esCombinado: false,
    };
  }

  if (PROYECTOS_NOCTURNO_SIN_LIDER.has(proy)) {
    return {
      turnosPermitidos: ['NOCTURNO'],
      tieneLider: false,
      esCombinado: false,
    };
  }

  // Todos los demás proyectos trabajan ÚNICAMENTE con personal MIXTO y Líder de Proyecto
  return {
    turnosPermitidos: ['MIXTO'],
    tieneLider: true,
    esCombinado: false,
  };
};

export const TITULOS_NOVEDAD: string[] = [
  "Recorrido general",
  "Objeto extraviado / recuperado",
  "Entrega / Recepción de guardia",
  "Novedad en control de acceso",
  "Vehículo sospechoso / mal estacionado",
  "Visita de supervisión / auditoría",
  "Hurto",
  "Robo",
  "Sospechoso",
  "Procedimiento Policial",
  "Procedimiento de otras autoridades",
  "Daño a las instalaciones",
  "Daños a terceros",
  "Presencia de pedigüeños / Venta ambulante",
  "Colisión / Choque vehicular",
  "Atropello",
  "Emergencia médica de empleados",
  "Emergencia médica de terceros (visitantes/clientes)",
  "Falla del sistema de seguridad (CCTV/Alarmas)",
  "Fuga de fluidos (Agua/Gas)",
  "Fallo de energía",
  "Conato de incendio",
  "OTRA:",
];

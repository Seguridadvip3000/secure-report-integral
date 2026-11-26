export const PROYECTOS = [
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

export const PROYECTOS_EXCLUIDOS = [
  "HIERROBECO",
  "GALP HIERROBECO BQTO",
  "TERRENOS LA ONZA",
  "TERRENO LA ONZA",
  "TERRENOS ARAUCA",
  "TERRENO ARAUCA",
];

export type ConfigHorarioProyecto = {
  tieneLider: boolean;
  turnosPermitidos: ('MIXTO' | 'DIURNO' | 'NOCTURNO' | '24X24' | '48X48')[];
  esCombinado?: boolean;
};

export const obtenerConfigHorarioProyecto = (proyectoRaw: string): ConfigHorarioProyecto => {
  const p = String(proyectoRaw || '').trim().toUpperCase();

  // 1. Proyectos con rotación 48X48 (fin de semana alterno V-S-D) y SIN Líder de Proyecto
  if (
    p.includes('EDEN PARK') ||
    p.includes('MONTERREY') ||
    p.includes('QUINZANDAL') ||
    p.includes('QUIZANDAL') ||
    p.includes('IMPAL')
  ) {
    return {
      tieneLider: false,
      turnosPermitidos: ['48X48'],
    };
  }

  // 2. Proyectos combinados (Líder + Oficiales Mixtos + Oficiales Diurnos)
  if (
    p.includes('CENTRO PLAZA') ||
    p.includes('CONCRESA') ||
    p.includes('CHACAITO') ||
    p.includes('BARUTA') ||
    p.includes('LA GRANJA') ||
    p.includes('TRINIDAD') ||
    p.includes('ASOPRASUR')
  ) {
    return {
      tieneLider: true,
      turnosPermitidos: ['MIXTO', 'DIURNO'],
      esCombinado: true,
    };
  }

  // 3. Trinitarias: Solo Diurno y Nocturno (con Líder)
  if (p.includes('TRINITARIAS')) {
    return {
      tieneLider: true,
      turnosPermitidos: ['DIURNO', 'NOCTURNO'],
    };
  }

  // 4. Entidades Bancarias: Solo Diurno (con Líder)
  if (p.includes('BANCARIA') || p.includes('BANCO')) {
    return {
      tieneLider: true,
      turnosPermitidos: ['DIURNO'],
    };
  }

  // 5. Resto de proyectos estándar
  return {
    tieneLider: true,
    turnosPermitidos: ['MIXTO', '24X24', 'DIURNO', 'NOCTURNO'],
  };
};

export const TITULOS_NOVEDAD = [
  "Recorrido general",
  "Objeto extraviado / recuperado",
  "Entrega / Recepción de guardia",
  "Novedad en control de acceso",
  "Vehículo sospechoso / mal estacionado",
  "Visita de supervisión / auditoría",
  "Consigna especial / protocolo",
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

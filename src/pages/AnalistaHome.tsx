import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  PROYECTOS,
  PROYECTOS_EXCLUIDOS,
  obtenerConfigHorarioProyecto,
} from '../data/constants';
import {
  generarPDFAsistenciaDiaria,
  generarPDFInformeDiarioDirectiva,
  ordenarRegistrosAsistencia,
  DatosInformeDiarioPDF,
} from '../utils/pdfAsistenciaDiaria';
import { generarExcelRolQuincenal } from '../utils/excelRolQuincenal';
import {
  Search,
  ClipboardList,
  UserCheck,
  Building2,
  Calendar,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Edit3,
  History,
  Clock,
  Users,
  Lock,
} from 'lucide-react';

const PROYECTOS_CON_JEFE_OP = ['ESTACIONAMIENTO CCCT', 'COMERCIO CCCT'];

const ESTATUS_ASISTENTES = [
  'PRESENTE',
  'SERVICIO ESPECIAL PROPIO',
  'SERVICIO ESPECIAL MIXTO',
  'SERVICIO ESPECIAL DIURNO/NOCTURNO',
  'SERVICIO ESPECIAL RECIBIDO',
  'APOYO RECIBIDO',
];

export default function AnalistaHome() {
  const { currentUser } = useAuth();
  const hoyLocal = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Caracas' });

  const rolActual = (currentUser?.role || '').toLowerCase();
  const esDirectivaOAdmin = ['directiva', 'admin', 'directivo'].includes(rolActual);
  const puedeEditarHoraDirectiva = ['directiva', 'admin', 'directivo'].includes(rolActual);
  const puedeCerrarAsistencia = ['analista', 'rrhh', 'recursos_humanos'].includes(rolActual);
  const nombreAnalista = currentUser?.nombre_completo || currentUser?.username || 'Analista';

  const [pestana, setPestana] = useState<'ASISTENCIAS_PROYECTO' | 'PLANTILLA_PROYECTO' | 'HISTORIAL_CEDULA'>(
    'ASISTENCIAS_PROYECTO'
  );
  const [listaProyectos, setListaProyectos] = useState<string[]>([]);

  const [proyectoFiltro, setProyectoFiltro] = useState<string>('TODOS');
  const [fechaDesdeAsist, setFechaDesdeAsist] = useState<string>(hoyLocal);
  const [fechaHastaAsist, setFechaHastaAsist] = useState<string>(hoyLocal);
  const [turnoFiltro, setTurnoFiltro] = useState<string>('TODOS');
  const [asistenciasProyecto, setAsistenciasProyecto] = useState<any[]>([]);
  const [auditoriaDia, setAuditoriaDia] = useState<any[]>([]);
  const [liderActivoPorQR, setLiderActivoPorQR] = useState<boolean>(false);
  const [diaCerradoActual, setDiaCerradoActual] = useState<any | null>(null);
  const [cerrandoDia, setCerrandoDia] = useState<boolean>(false);
  const [cargandoAsist, setCargandoAsist] = useState(false);

  const [proyectoPlantilla, setProyectoPlantilla] = useState<string>('');
  const [plantillaProyectoList, setPlantillaProyectoList] = useState<any[]>([]);
  const [filtroHorarioPlantilla, setFiltroHorarioPlantilla] = useState<string>('MIXTO');
  const [grupoDesplegadoAnalista, setGrupoDesplegadoAnalista] = useState<'A' | 'B' | 'C'>('A');
  const [oficialEditandoFechaTab, setOficialEditandoFechaTab] = useState<any | null>(null);
  const [fechaIngresoTabInput, setFechaIngresoTabInput] = useState<string>(hoyLocal);
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false);

  const [registroEditando, setRegistroEditando] = useState<any | null>(null);
  const [nuevoEstatus, setNuevoEstatus] = useState<string>('PRESENTE');
  const [nuevoTurno, setNuevoTurno] = useState<string>('MIXTO');
  const [nuevaHoraEntrada, setNuevaHoraEntrada] = useState<string>('');
  const [nuevoProyectoApoyo, setNuevoProyectoApoyo] = useState<string>('');
  const [justificacionCambio, setJustificacionCambio] = useState<string>('');
  const [guardandoCambio, setGuardandoCambio] = useState(false);

  const [cedulaBusqueda, setCedulaBusqueda] = useState('');
  const [fechaDesdeCedula, setFechaDesdeCedula] = useState('');
  const [fechaHastaCedula, setFechaHastaCedula] = useState('');
  const [buscandoCedula, setBuscandoCedula] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [editandoFechaIngresoAnalista, setEditandoFechaIngresoAnalista] = useState(false);
  const [fechaIngresoAnalistaInput, setFechaIngresoAnalistaInput] = useState(hoyLocal);
  const [resultadoCedula, setResultadoCedula] = useState<{
    cedula: string;
    nombreCompleto: string;
    fichaActual: any | null;
    movimientos: any[];
    asistencias: any[];
  } | null>(null);

  const [mensajeGlobal, setMensajeGlobal] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    const cargarProyectos = async () => {
      const setProy = new Set<string>(
        (Array.isArray(PROYECTOS) ? PROYECTOS : []).filter(
          (p) => !PROYECTOS_EXCLUIDOS.includes(p.trim().toUpperCase())
        )
      );
      const { data: plantillaProys } = await supabase.from('plantilla_proyectos').select('proyecto');
      if (Array.isArray(plantillaProys)) {
        plantillaProys.forEach((p: any) => {
          const val = String(p?.proyecto || '').trim();
          if (val && !PROYECTOS_EXCLUIDOS.includes(val.toUpperCase())) {
            setProy.add(val);
          }
        });
      }
      const ordenados = Array.from(setProy).sort();
      setListaProyectos(ordenados);
      if (ordenados.length > 0 && !proyectoPlantilla) {
        const primero = ordenados.at(0) || '';
        setProyectoPlantilla(primero);
        setFiltroHorarioPlantilla(obtenerConfigHorarioProyecto(primero).turnosPermitidos.at(0) || 'MIXTO');
      }
    };
    cargarProyectos();
  }, []);
  const verificarLiderPorQR = async (proyecto: string, fechaRef: string) => {
    if (!proyecto || proyecto === 'TODOS') {
      setLiderActivoPorQR(false);
      return;
    }
    try {
      const { data: logsHoy } = await supabase
        .from('attendance_logs')
        .select('*')
        .eq('project_name', proyecto)
        .gte('created_at', `${fechaRef}T00:00:00`)
        .lte('created_at', `${fechaRef}T23:59:59`)
        .order('created_at', { ascending: true });

      const listaLogs = Array.isArray(logsHoy) ? logsHoy : [];
      if (listaLogs.length === 0) {
        setLiderActivoPorQR(false);
        return;
      }
      const ultimoLog = listaLogs.at(-1);
      const tipoEvento = String(
        ultimoLog?.type || ultimoLog?.event_type || ultimoLog?.action || ultimoLog?.tipo || ''
      ).toUpperCase();
      setLiderActivoPorQR(
        !(tipoEvento.includes('SALIDA') || tipoEvento.includes('OUT') || tipoEvento.includes('EXIT'))
      );
    } catch {
      setLiderActivoPorQR(false);
    }
  };

  const consultarAsistencias = async () => {
    setCargandoAsist(true);
    try {
      let query = supabase
        .from('asistencias_diarias_oficiales')
        .select('*')
        .gte('fecha', fechaDesdeAsist)
        .lte('fecha', fechaHastaAsist);

      if (proyectoFiltro !== 'TODOS') query = query.eq('proyecto', proyectoFiltro);
      if (turnoFiltro !== 'TODOS') query = query.eq('turno', turnoFiltro);

      const { data, error } = await query.limit(1000);
      if (error) throw error;
      setAsistenciasProyecto(Array.isArray(data) ? data : []);

      await verificarLiderPorQR(proyectoFiltro, fechaDesdeAsist);

      if (proyectoFiltro !== 'TODOS' && fechaDesdeAsist === fechaHastaAsist) {
        const { data: cierreData } = await supabase
          .from('cierres_asistencia_diaria')
          .select('*')
          .eq('proyecto', proyectoFiltro)
          .eq('fecha', fechaDesdeAsist)
          .maybeSingle();
        setDiaCerradoActual(cierreData || null);
      } else {
        setDiaCerradoActual(null);
      }

      let qAud = supabase
        .from('auditoria_modificaciones_asistencia')
        .select('*')
        .gte('fecha', fechaDesdeAsist)
        .lte('fecha', fechaHastaAsist)
        .order('created_at', { ascending: false });

      if (proyectoFiltro !== 'TODOS') qAud = qAud.eq('proyecto', proyectoFiltro);
      const { data: dataAud } = await qAud.limit(100);
      setAuditoriaDia(Array.isArray(dataAud) ? dataAud : []);
    } catch (err) {
      console.error('Error consultando asistencias:', err);
    } finally {
      setCargandoAsist(false);
    }
  };

  const consultarPlantillaProyecto = async (proy: string) => {
    if (!proy) return;
    setCargandoPlantilla(true);
    try {
      const { data, error } = await supabase
        .from('plantilla_proyectos')
        .select('*')
        .eq('proyecto', proy)
        .eq('estado', 'ACTIVO')
        .order('apellidos', { ascending: true });

      if (error) throw error;
      setPlantillaProyectoList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error consultando plantilla:', err);
    } finally {
      setCargandoPlantilla(false);
    }
  };

  useEffect(() => {
    if (pestana === 'ASISTENCIAS_PROYECTO') {
      consultarAsistencias();
    }
  }, [proyectoFiltro, fechaDesdeAsist, fechaHastaAsist, turnoFiltro, pestana]);

  useEffect(() => {
    if (pestana === 'PLANTILLA_PROYECTO' && proyectoPlantilla) {
      const cfg = obtenerConfigHorarioProyecto(proyectoPlantilla);
      const primero = cfg.turnosPermitidos.at(0) || 'MIXTO';
      setFiltroHorarioPlantilla(primero);
      if ((primero === '24X24' || primero === '48X48') && grupoDesplegadoAnalista === 'C') {
        setGrupoDesplegadoAnalista('A');
      }
      consultarPlantillaProyecto(proyectoPlantilla);
    }
  }, [proyectoPlantilla, pestana]);
  const manejarCerrarAsistenciaDia = async () => {
    if (!puedeCerrarAsistencia || proyectoFiltro === 'TODOS') return;
    if (fechaDesdeAsist >= hoyLocal) {
      setMensajeGlobal({
        tipo: 'error',
        texto: '⚠️ No puede cerrar la asistencia del día en curso. Debe cerrarse a partir del día siguiente una vez cumplidas las 24 horas.',
      });
      return;
    }
    if (
      !window.confirm(
        `¿Confirma CERRAR LA ASISTENCIA de ${proyectoFiltro} del día ${fechaDesdeAsist}? Una vez cerrada se plasmará en el Rol de Guardia.`
      )
    ) {
      return;
    }

    setCerrandoDia(true);
    try {
      const { error } = await supabase.from('cierres_asistencia_diaria').upsert(
        [
          {
            proyecto: proyectoFiltro,
            fecha: fechaDesdeAsist,
            cerrado: true,
            cerrado_por: nombreAnalista,
            cerrado_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'proyecto,fecha' }
      );
      if (error) throw error;

      setMensajeGlobal({
        tipo: 'exito',
        texto: `🔒 Asistencia de ${proyectoFiltro} (${fechaDesdeAsist}) CERRADA por ${nombreAnalista} y enviada al Rol de Guardia.`,
      });
      await consultarAsistencias();
    } catch (err: any) {
      setMensajeGlobal({
        tipo: 'error',
        texto: 'Error al cerrar asistencia: ' + (err?.message || 'Verifique conexión.'),
      });
    } finally {
      setCerrandoDia(false);
    }
  };

  const guardarFechaIngresoDesdePlantilla = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oficialEditandoFechaTab || !fechaIngresoTabInput) return;

    setGuardandoCambio(true);
    try {
      const fechaISO = `${fechaIngresoTabInput}T07:00:00-04:00`;
      const { error } = await supabase
        .from('plantilla_proyectos')
        .update({
          fecha_ingreso: fechaISO,
          updated_at: new Date().toISOString(),
        })
        .eq('id', oficialEditandoFechaTab.id);

      if (error) throw error;

      setMensajeGlobal({
        tipo: 'exito',
        texto: `✅ Fecha de ingreso de ${oficialEditandoFechaTab.nombres} ${oficialEditandoFechaTab.apellidos} actualizada a ${fechaIngresoTabInput}.`,
      });
      setOficialEditandoFechaTab(null);
      await consultarPlantillaProyecto(proyectoPlantilla);
    } catch (err: any) {
      setMensajeGlobal({ tipo: 'error', texto: 'Error guardando fecha: ' + (err?.message || 'Error.') });
    } finally {
      setGuardandoCambio(false);
    }
  };

  const abrirModalEdicion = (reg: any) => {
    setMensajeGlobal(null);
    setRegistroEditando(reg);
    setNuevoEstatus(reg.estatus);
    setNuevoTurno(reg.turno || 'MIXTO');
    setNuevaHoraEntrada(reg.hora_entrada || '07:00 AM');
    setNuevoProyectoApoyo(reg.proyecto_apoyo || '');
    setJustificacionCambio('');
  };

  const guardarModificacionAnalista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registroEditando) return;

    if (!justificacionCambio.trim()) {
      setMensajeGlobal({
        tipo: 'error',
        texto: '⚠️ Debe escribir obligatoriamente el motivo o justificación de la modificación.',
      });
      return;
    }

    const requiereProyectoRel = [
      'APOYO ENVIADO',
      'SERVICIO ESPECIAL ENVIADO',
      'APOYO RECIBIDO',
      'SERVICIO ESPECIAL RECIBIDO',
    ].includes(nuevoEstatus);

    if (requiereProyectoRel && !nuevoProyectoApoyo.trim()) {
      setMensajeGlobal({
        tipo: 'error',
        texto: `⚠️ Debe seleccionar el Proyecto Origen/Destino para ${nuevoEstatus}.`,
      });
      return;
    }

    setGuardandoCambio(true);
    try {
      const ahora = new Date().toISOString();
      const justifLimpia = justificacionCambio.trim();
      const proyRel = requiereProyectoRel ? nuevoProyectoApoyo.trim() : null;
      const horaFinal = puedeEditarHoraDirectiva ? nuevaHoraEntrada.trim() : registroEditando.hora_entrada;

      const { error: errUpd } = await supabase
        .from('asistencias_diarias_oficiales')
        .update({
          estatus: nuevoEstatus,
          turno: nuevoTurno,
          hora_entrada: horaFinal,
          proyecto_apoyo: proyRel,
          modificado_por: nombreAnalista,
          modificado_at: ahora,
          justificacion_modificacion: justifLimpia,
          updated_at: ahora,
        })
        .eq('id', registroEditando.id);

      if (errUpd) throw errUpd;

      await supabase.from('auditoria_modificaciones_asistencia').insert([
        {
          asistencia_id: registroEditando.id,
          fecha: registroEditando.fecha,
          proyecto: registroEditando.proyecto,
          cedula: registroEditando.cedula,
          nombre_completo: registroEditando.nombre_completo,
          estatus_anterior: registroEditando.estatus,
          estatus_nuevo: nuevoEstatus,
          justificacion: justifLimpia,
          modificado_por: nombreAnalista,
        },
      ]);

      setMensajeGlobal({
        tipo: 'exito',
        texto: `✅ Asistencia de ${registroEditando.nombre_completo} modificada a ${nuevoEstatus} y registrada en auditoría.`,
      });
      setRegistroEditando(null);
      await consultarAsistencias();
    } catch (err: any) {
      setMensajeGlobal({
        tipo: 'error',
        texto: 'Error al guardar modificación: ' + (err?.message || 'Error de conexión.'),
      });
    } finally {
      setGuardandoCambio(false);
    }
  };
  const prepararYGenerarPDF = async (tipo: 'ASISTENCIA' | 'IMPRIMIR' | 'INFORME_DIRECTIVA') => {
    try {
      let qMovs = supabase
        .from('movimientos_plantilla')
        .select('*')
        .gte('created_at', `${fechaDesdeAsist}T00:00:00`)
        .lte('created_at', `${fechaHastaAsist}T23:59:59`);

      if (proyectoFiltro !== 'TODOS') qMovs = qMovs.eq('proyecto', proyectoFiltro);
      const { data: movsDia } = await qMovs;

      const etiquetaFecha =
        fechaDesdeAsist === fechaHastaAsist
          ? fechaDesdeAsist
          : `${fechaDesdeAsist} al ${fechaHastaAsist}`;

      const datosPDF: DatosInformeDiarioPDF = {
        proyecto: proyectoFiltro === 'TODOS' ? 'TODOS LOS PROYECTOS' : proyectoFiltro,
        fecha: etiquetaFecha,
        registros: asistenciasProyecto,
        movimientosDia: Array.isArray(movsDia) ? movsDia : [],
        auditoriaModificaciones: auditoriaDia,
      };

      if (tipo === 'INFORME_DIRECTIVA') {
        await generarPDFInformeDiarioDirectiva(datosPDF);
      } else {
        await generarPDFAsistenciaDiaria(datosPDF, tipo === 'IMPRIMIR' ? 'IMPRIMIR' : 'DESCARGAR');
      }
    } catch (err: any) {
      setMensajeGlobal({ tipo: 'error', texto: 'Error generando PDF: ' + (err?.message || 'Error.') });
    }
  };

  const consultarExpedientePorCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    const cedulaLimpia = cedulaBusqueda.trim().toUpperCase();
    if (!cedulaLimpia) return;

    setBuscandoCedula(true);
    setErrorBusqueda(null);
    setResultadoCedula(null);
    setEditandoFechaIngresoAnalista(false);

    try {
      const { data: fichasPlantilla, error: errPlantilla } = await supabase
        .from('plantilla_proyectos')
        .select('*')
        .ilike('cedula', `%${cedulaLimpia}%`)
        .order('created_at', { ascending: false });

      if (errPlantilla) throw errPlantilla;

      let qMovs = supabase
        .from('movimientos_plantilla')
        .select('*')
        .ilike('cedula', `%${cedulaLimpia}%`)
        .order('created_at', { ascending: false });

      if (fechaDesdeCedula) qMovs = qMovs.gte('created_at', `${fechaDesdeCedula}T00:00:00`);
      if (fechaHastaCedula) qMovs = qMovs.lte('created_at', `${fechaHastaCedula}T23:59:59`);
      const { data: historialMovs, error: errMovs } = await qMovs;
      if (errMovs) throw errMovs;

      let qAsist = supabase
        .from('asistencias_diarias_oficiales')
        .select('*')
        .ilike('cedula', `%${cedulaLimpia}%`)
        .order('fecha', { ascending: false });

      if (fechaDesdeCedula) qAsist = qAsist.gte('fecha', fechaDesdeCedula);
      if (fechaHastaCedula) qAsist = qAsist.lte('fecha', fechaHastaCedula);
      const { data: historialAsist, error: errAsist } = await qAsist;
      if (errAsist) throw errAsist;

      const fichaActual = fichasPlantilla && fichasPlantilla.length > 0 ? fichasPlantilla.at(0) : null;
      const nombreDetectado = fichaActual
        ? `${fichaActual.nombres} ${fichaActual.apellidos}`
        : historialMovs && historialMovs.length > 0
        ? historialMovs.at(0).nombre_completo
        : historialAsist && historialAsist.length > 0
        ? historialAsist.at(0).nombre_completo
        : '';

      if (!fichaActual && (!historialMovs || historialMovs.length === 0) && (!historialAsist || historialAsist.length === 0)) {
        setErrorBusqueda(`No se encontraron registros para la cédula "${cedulaLimpia}".`);
        return;
      }

      setResultadoCedula({
        cedula: fichaActual?.cedula || cedulaLimpia,
        nombreCompleto: nombreDetectado,
        fichaActual,
        movimientos: historialMovs || [],
        asistencias: historialAsist || [],
      });
    } catch (err: any) {
      setErrorBusqueda('Error al consultar expediente: ' + (err?.message || 'Verifique conexión.'));
    } finally {
      setBuscandoCedula(false);
    }
  };

  const guardarFechaIngresoPorAnalista = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultadoCedula?.fichaActual || !fechaIngresoAnalistaInput) return;

    setGuardandoCambio(true);
    try {
      const fechaISO = `${fechaIngresoAnalistaInput}T07:00:00-04:00`;
      const { error } = await supabase
        .from('plantilla_proyectos')
        .update({
          fecha_ingreso: fechaISO,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resultadoCedula.fichaActual.id);

      if (error) throw error;

      setMensajeGlobal({
        tipo: 'exito',
        texto: `✅ Fecha de ingreso de ${resultadoCedula.nombreCompleto} actualizada a ${fechaIngresoAnalistaInput}.`,
      });
      setResultadoCedula({
        ...resultadoCedula,
        fichaActual: { ...resultadoCedula.fichaActual, fecha_ingreso: fechaISO },
      });
      setEditandoFechaIngresoAnalista(false);
    } catch (err: any) {
      setMensajeGlobal({ tipo: 'error', texto: 'Error actualizando fecha: ' + (err?.message || 'Error.') });
    } finally {
      setGuardandoCambio(false);
    }
  };

  const listaOrdenadaAsistencia = ordenarRegistrosAsistencia(asistenciasProyecto);

  const totalPresentes = asistenciasProyecto.filter((a) =>
    ESTATUS_ASISTENTES.includes(a.estatus)
  ).length;
  const totalApoyos = asistenciasProyecto.filter((a) =>
    ['APOYO RECIBIDO', 'APOYO ENVIADO', 'SERVICIO ESPECIAL RECIBIDO', 'SERVICIO ESPECIAL ENVIADO'].includes(
      a.estatus
    )
  ).length;
  const totalFaltas = asistenciasProyecto.filter((a) => a.estatus === 'FALTA INJUSTIFICADA').length;
  const totalOtros = asistenciasProyecto.filter((a) =>
    ['REPOSO MEDICO', 'BAJA POR SALUD', 'VACACIONES', 'FALTA JUSTIFICADA', 'PERMISO', 'DESCANSO'].includes(
      a.estatus
    )
  ).length;

  const proyUpper = proyectoFiltro.toUpperCase();
  const configFiltro = obtenerConfigHorarioProyecto(proyectoFiltro);
  const asistentesProyecto = asistenciasProyecto.filter((a) =>
    ESTATUS_ASISTENTES.includes(String(a.estatus || '').toUpperCase())
  );
  const tieneJefeOp = PROYECTOS_CON_JEFE_OP.includes(proyUpper);
  const tieneLiderProy = configFiltro.tieneLider;
  const tieneMixtoProy =
    configFiltro.turnosPermitidos.includes('MIXTO') ||
    configFiltro.turnosPermitidos.includes('24X24');
  const tiene48x48Proy = configFiltro.turnosPermitidos.includes('48X48');
  const tieneDiurno = configFiltro.turnosPermitidos.includes('DIURNO');
  const tieneNocturno = configFiltro.turnosPermitidos.includes('NOCTURNO');

  const countLider = tieneLiderProy && liderActivoPorQR ? 1 : 0;
  const countJefeOp = tieneJefeOp
    ? asistentesProyecto.filter((a) => String(a.cargo || '').toUpperCase() === 'J. OPERACIONES').length
    : 0;
  const countOficialesMixtos = asistentesProyecto.filter(
    (a) =>
      String(a.cargo || '').toUpperCase() !== 'LIDER' &&
      String(a.cargo || '').toUpperCase() !== 'J. OPERACIONES' &&
      ['MIXTO', '24X24'].includes(String(a.turno || 'MIXTO').toUpperCase())
  ).length;
  const countOficiales48x48 = asistentesProyecto.filter(
    (a) =>
      String(a.cargo || '').toUpperCase() !== 'LIDER' &&
      String(a.turno || '').toUpperCase() === '48X48'
  ).length;
  const countOficialesDiurnos = asistentesProyecto.filter(
    (a) =>
      String(a.cargo || '').toUpperCase() !== 'LIDER' &&
      String(a.cargo || '').toUpperCase() !== 'J. OPERACIONES' &&
      String(a.turno || '').toUpperCase() === 'DIURNO'
  ).length;
  const countOficialesNocturnos = asistentesProyecto.filter(
    (a) =>
      String(a.cargo || '').toUpperCase() !== 'LIDER' &&
      String(a.cargo || '').toUpperCase() !== 'J. OPERACIONES' &&
      String(a.turno || '').toUpperCase() === 'NOCTURNO'
  ).length;
  const totalCuadroEjecutivo =
    countLider +
    countJefeOp +
    countOficialesMixtos +
    countOficiales48x48 +
    countOficialesDiurnos +
    countOficialesNocturnos;
  const pad2 = (n: number) => String(n).padStart(2, '0');
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border-l-4 border-teal-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            Módulo Analista / RRHH
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-0.5 flex items-center gap-2">
            <ClipboardList className="text-teal-600" size={26} /> Control de Asistencia, Cierre Diario y Rol de Guardia
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audite la asistencia del día anterior, cierre el parte diario (24h cumplidas) y descargue el Rol Quincenal en Excel.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold px-3.5 py-2 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800">
          <Clock size={16} /> Edición de Asistencia: ACTIVA
        </div>
      </div>

      {mensajeGlobal && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-start gap-2 ${
            mensajeGlobal.tipo === 'exito'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {mensajeGlobal.tipo === 'exito' ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <span>{mensajeGlobal.texto}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        <button
          type="button"
          onClick={() => setPestana('ASISTENCIAS_PROYECTO')}
          className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            pestana === 'ASISTENCIAS_PROYECTO' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ClipboardList size={18} /> ASISTENCIAS, CIERRE Y ROL
        </button>

        <button
          type="button"
          onClick={() => setPestana('PLANTILLA_PROYECTO')}
          className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            pestana === 'PLANTILLA_PROYECTO' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users size={18} /> PLANTILLA POR PROYECTO
        </button>

        <button
          type="button"
          onClick={() => setPestana('HISTORIAL_CEDULA')}
          className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
            pestana === 'HISTORIAL_CEDULA' ? 'bg-teal-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck size={18} /> HISTORIAL POR CÉDULA
        </button>
      </div>

      {pestana === 'ASISTENCIAS_PROYECTO' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                  <Building2 size={14} /> Proyecto
                </label>
                <select
                  value={proyectoFiltro}
                  onChange={(e) => setProyectoFiltro(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                >
                  <option value="TODOS">TODOS LOS PROYECTOS</option>
                  {listaProyectos.map((proy) => (
                    <option key={proy} value={proy}>
                      {proy}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                  <Calendar size={14} /> Desde
                </label>
                <input
                  type="date"
                  value={fechaDesdeAsist}
                  onChange={(e) => setFechaDesdeAsist(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1 flex items-center gap-1">
                  <Calendar size={14} /> Hasta
                </label>
                <input
                  type="date"
                  value={fechaHastaAsist}
                  onChange={(e) => setFechaHastaAsist(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Horario</label>
                <select
                  value={turnoFiltro}
                  onChange={(e) => setTurnoFiltro(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold"
                >
                  <option value="TODOS">TODOS LOS HORARIOS</option>
                  <option value="MIXTO">MIXTO</option>
                  <option value="24X24">24X24</option>
                  <option value="48X48">48X48</option>
                  <option value="DIURNO">DIURNO</option>
                  <option value="NOCTURNO">NOCTURNO</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              {proyectoFiltro !== 'TODOS' && fechaDesdeAsist === fechaHastaAsist && (
                diaCerradoActual ? (
                  <span className="px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                    <Lock size={14} /> ASISTENCIA CERRADA ({diaCerradoActual.cerrado_por})
                  </span>
                ) : puedeCerrarAsistencia ? (
                  <button
                    type="button"
                    disabled={cerrandoDia || fechaDesdeAsist >= hoyLocal}
                    onClick={manejarCerrarAsistenciaDia}
                    className="px-4 py-2.5 rounded-xl text-xs font-black bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Lock size={14} />
                    {fechaDesdeAsist >= hoyLocal
                      ? 'CERRAR ASISTENCIA (Disponible mañana)'
                      : cerrandoDia
                      ? 'Cerrando...'
                      : 'CERRAR ASISTENCIA'}
                  </button>
                ) : null
              )}

              <button
                type="button"
                onClick={() => {
                  const [yStr, mStr, dStr] = fechaDesdeAsist.split('-');
                  const quincenaDetectada = Number(dStr) <= 15 ? '1ERA' : '2DA';
                  generarExcelRolQuincenal({
                    proyecto: proyectoFiltro,
                    proyectosLista: listaProyectos,
                    anio: Number(yStr),
                    mes: Number(mStr),
                    quincena: quincenaDetectada,
                  });
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download size={15} />
                {proyectoFiltro === 'TODOS'
                  ? 'Roles Quincenales Excel (Por Proyecto)'
                  : 'Rol Quincenal Excel (.xlsx)'}
              </button>

              <button
                type="button"
                onClick={() => prepararYGenerarPDF('ASISTENCIA')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download size={15} /> Descargar PDF Asistencia
              </button>

              <button
                type="button"
                onClick={() => prepararYGenerarPDF('IMPRIMIR')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Printer size={15} /> Imprimir Asistencia
              </button>

              {esDirectivaOAdmin && (
                <button
                  type="button"
                  onClick={() => prepararYGenerarPDF('INFORME_DIRECTIVA')}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-700 text-white hover:bg-red-800 flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download size={15} /> Informe Diario Directiva
                </button>
              )}
            </div>
          </div>

          {proyectoFiltro !== 'TODOS' && (
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Resumen Numérico de Plantilla Presente — {proyectoFiltro}
                </span>
                <span className="text-lg font-black text-emerald-400">
                  TOTAL: {pad2(totalCuadroEjecutivo)}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                {tieneLiderProy && (
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-slate-400 font-bold uppercase">Líder de Proyecto</div>
                    <div className="text-xl font-black text-white mt-0.5">{pad2(countLider)}</div>
                  </div>
                )}

                {tieneJefeOp && (
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-slate-400 font-bold uppercase">Jefe de Operaciones</div>
                    <div className="text-xl font-black text-white mt-0.5">{pad2(countJefeOp)}</div>
                  </div>
                )}

                {(tieneMixtoProy || countOficialesMixtos > 0) && (
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-slate-400 font-bold uppercase">Oficiales Mixtos</div>
                    <div className="text-xl font-black text-blue-300 mt-0.5">{pad2(countOficialesMixtos)}</div>
                  </div>
                )}

                {(tiene48x48Proy || countOficiales48x48 > 0) && (
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-slate-400 font-bold uppercase">Oficiales 48X48</div>
                    <div className="text-xl font-black text-cyan-300 mt-0.5">{pad2(countOficiales48x48)}</div>
                  </div>
                )}

                {(tieneDiurno || countOficialesDiurnos > 0) && (
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-slate-400 font-bold uppercase">Oficiales Diurnos</div>
                    <div className="text-xl font-black text-amber-300 mt-0.5">{pad2(countOficialesDiurnos)}</div>
                  </div>
                )}

                {(tieneNocturno || countOficialesNocturnos > 0) && (
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-slate-400 font-bold uppercase">Oficiales Nocturnos</div>
                    <div className="text-xl font-black text-purple-300 mt-0.5">{pad2(countOficialesNocturnos)}</div>
                  </div>
                )}
              </div>
            </div>
          )}

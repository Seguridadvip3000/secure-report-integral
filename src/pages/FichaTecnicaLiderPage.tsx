import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  UserCheck,
  Search,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Users,
  Edit3,
  UserPlus,
} from 'lucide-react';

export default function FichaTecnicaLiderPage() {
  const { currentUser } = useAuth();
  const nombreLider = currentUser?.nombre_completo || currentUser?.username || 'Líder';

  const proyectosLider: string[] =
    Array.isArray(currentUser?.proyectos) && currentUser.proyectos.length > 0
      ? currentUser.proyectos
      : currentUser?.proyecto_id
      ? [currentUser.proyecto_id]
      : [];

  const [proyectoSel, setProyectoSel] = useState<string>(proyectosLider.at(0) || '');
  const [oficialesPlantilla, setOficialesPlantilla] = useState<any[]>([]);
  const [fichasExistentesMap, setFichasExistentesMap] = useState<Record<string, any>>({});
  const [busqueda, setBusqueda] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);

  const [modoEditor, setModoEditor] = useState<boolean>(false);
  const [fichaIdExistente, setFichaIdExistente] = useState<string | null>(null);

  // Campos de Ficha Técnica
  const [nacionalidad, setNacionalidad] = useState('V');
  const [cedula, setCedula] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('MASCULINO');
  const [estadoCivil, setEstadoCivil] = useState('SOLTERO/A');
  const [cargaFamiliar, setCargaFamiliar] = useState('0');
  const [rif, setRif] = useState('');

  const [banco, setBanco] = useState('');
  const [tipoCuenta, setTipoCuenta] = useState('CORRIENTE');
  const [numeroCuenta, setNumeroCuenta] = useState('');
  const [telefonoPagoMovil, setTelefonoPagoMovil] = useState('');

  const [estadoResidencia, setEstadoResidencia] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [parroquia, setParroquia] = useState('');
  const [direccionDomicilio, setDireccionDomicilio] = useState('');
  const [puntoReferencia, setPuntoReferencia] = useState('');
  const [telefonoCelular, setTelefonoCelular] = useState('');
  const [telefonoAlternativo, setTelefonoAlternativo] = useState('');
  const [correoElectronico, setCorreoElectronico] = useState('');

  const [emerg1Nombre, setEmerg1Nombre] = useState('');
  const [emerg1Parentesco, setEmerg1Parentesco] = useState('');
  const [emerg1Telefono, setEmerg1Telefono] = useState('');

  const [grupoSanguineo, setGrupoSanguineo] = useState('O+');
  const [alergiasCondiciones, setAlergiasCondiciones] = useState('NINGUNA');
  const [tallaCamisa, setTallaCamisa] = useState('M');
  const [tallaPantalon, setTallaPantalon] = useState('32');
  const [tallaBotas, setTallaBotas] = useState('41');
  const [tallaGorra, setTallaGorra] = useState('ÚNICA');
  const [estatura, setEstatura] = useState('');
  const [peso, setPeso] = useState('');

  const [fotoCarnetActualUrl, setFotoCarnetActualUrl] = useState<string | null>(null);
  const [fotoCedulaActualUrl, setFotoCedulaActualUrl] = useState<string | null>(null);
  const [fotoCarnetFile, setFotoCarnetFile] = useState<File | null>(null);
  const [fotoCedulaFile, setFotoCedulaFile] = useState<File | null>(null);

  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const cargarOficialesYFichas = async () => {
    if (!proyectoSel) return;
    setCargando(true);
    try {
      const { data: plantilla } = await supabase
        .from('plantilla_proyectos')
        .select('*')
        .eq('proyecto', proyectoSel)
        .eq('estado', 'ACTIVO')
        .order('apellidos', { ascending: true });

      const lista = Array.isArray(plantilla) ? plantilla : [];
      setOficialesPlantilla(lista);

      const cedulasNum = lista
        .map((o) => String(o.cedula || '').replace(/\D/g, ''))
        .filter((c) => c.length >= 5);

      if (cedulasNum.length > 0) {
        const { data: fichas } = await supabase
          .from('aspirantes_reclutamiento')
          .select('*')
          .in('cedula', cedulasNum);

        const mapa: Record<string, any> = {};
        if (Array.isArray(fichas)) {
          fichas.forEach((f) => {
            const key = String(f.cedula || '').replace(/\D/g, '');
            if (key) mapa[key] = f;
          });
        }
        setFichasExistentesMap(mapa);
      } else {
        setFichasExistentesMap({});
      }
    } catch (err) {
      console.error('Error cargando oficiales y fichas:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (proyectoSel) cargarOficialesYFichas();
  }, [proyectoSel]);
  const abrirEditorConDatos = async (oficialPlantilla?: any) => {
    setMensaje(null);
    setFotoCarnetFile(null);
    setFotoCedulaFile(null);

    if (!oficialPlantilla) {
      setFichaIdExistente(null);
      setNacionalidad('V');
      setCedula('');
      setNombres('');
      setApellidos('');
      setFechaNacimiento('');
      setSexo('MASCULINO');
      setEstadoCivil('SOLTERO/A');
      setCargaFamiliar('0');
      setRif('');
      setBanco('');
      setTipoCuenta('CORRIENTE');
      setNumeroCuenta('');
      setTelefonoPagoMovil('');
      setEstadoResidencia('');
      setMunicipio('');
      setParroquia('');
      setDireccionDomicilio('');
      setPuntoReferencia('');
      setTelefonoCelular('');
      setTelefonoAlternativo('');
      setCorreoElectronico('');
      setEmerg1Nombre('');
      setEmerg1Parentesco('');
      setEmerg1Telefono('');
      setGrupoSanguineo('O+');
      setAlergiasCondiciones('NINGUNA');
      setTallaCamisa('M');
      setTallaPantalon('32');
      setTallaBotas('41');
      setTallaGorra('ÚNICA');
      setEstatura('');
      setPeso('');
      setFotoCarnetActualUrl(null);
      setFotoCedulaActualUrl(null);
      setModoEditor(true);
      return;
    }

    const cedLimpia = String(oficialPlantilla.cedula || '').replace(/\D/g, '');
    const nacDetectada = String(oficialPlantilla.cedula || '').toUpperCase().startsWith('E') ? 'E' : 'V';

    let ficha = fichasExistentesMap[cedLimpia] || null;
    if (!ficha && cedLimpia) {
      const { data } = await supabase
        .from('aspirantes_reclutamiento')
        .select('*')
        .ilike('cedula', `%${cedLimpia}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) ficha = data;
    }

    setFichaIdExistente(ficha?.id || null);
    setNacionalidad(ficha?.nacionalidad || nacDetectada);
    setCedula(cedLimpia);
    setNombres(ficha?.nombres || oficialPlantilla.nombres || '');
    setApellidos(ficha?.apellidos || oficialPlantilla.apellidos || '');
    setFechaNacimiento(ficha?.fecha_nacimiento || '');
    setSexo(ficha?.sexo || 'MASCULINO');
    setEstadoCivil(ficha?.estado_civil || 'SOLTERO/A');
    setCargaFamiliar(String(ficha?.carga_familiar ?? '0'));
    setRif(ficha?.rif || '');
    setBanco(ficha?.banco || '');
    setTipoCuenta(ficha?.tipo_cuenta || 'CORRIENTE');
    setNumeroCuenta(ficha?.numero_cuenta || '');
    setTelefonoPagoMovil(ficha?.telefono_pago_movil || '');
    setEstadoResidencia(ficha?.estado_residencia || '');
    setMunicipio(ficha?.municipio || '');
    setParroquia(ficha?.parroquia || '');
    setDireccionDomicilio(ficha?.direccion_domicilio || '');
    setPuntoReferencia(ficha?.punto_referencia || '');
    setTelefonoCelular(ficha?.telefono_celular || '');
    setTelefonoAlternativo(ficha?.telefono_alternativo || '');
    setCorreoElectronico(ficha?.correo_electronico || '');
    setEmerg1Nombre(ficha?.contacto_emergencia_1_nombre || '');
    setEmerg1Parentesco(ficha?.contacto_emergencia_1_parentesco || '');
    setEmerg1Telefono(ficha?.contacto_emergencia_1_telefono || '');
    setGrupoSanguineo(ficha?.grupo_sanguineo || 'O+');
    setAlergiasCondiciones(ficha?.alergias_condiciones || 'NINGUNA');
    setTallaCamisa(ficha?.talla_camisa || 'M');
    setTallaPantalon(ficha?.talla_pantalon || '32');
    setTallaBotas(ficha?.talla_botas || '41');
    setTallaGorra(ficha?.talla_gorra || 'ÚNICA');
    setEstatura(ficha?.estatura || '');
    setPeso(ficha?.peso || '');
    setFotoCarnetActualUrl(ficha?.foto_carnet_url || null);
    setFotoCedulaActualUrl(ficha?.foto_cedula_url || null);
    setModoEditor(true);
  };

  const subirArchivoStorage = async (file: File | null, carpeta: string, cedulaStr: string) => {
    if (!file) return null;
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${carpeta}/${cedulaStr}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from('fichas-reclutamiento')
      .upload(path, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from('fichas-reclutamiento').getPublicUrl(path);
    return data?.publicUrl || null;
  };

  const guardarFichaTecnicaOficial = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const cedLimpia = cedula.replace(/\D/g, '');
    if (!cedLimpia || !nombres.trim() || !apellidos.trim()) {
      setMensaje({ tipo: 'error', texto: '⚠️ Cédula, Nombres y Apellidos son obligatorios.' });
      return;
    }

    setGuardando(true);
    try {
      const nuevaFotoCarnetUrl = await subirArchivoStorage(fotoCarnetFile, 'carnets', cedLimpia);
      const nuevaFotoCedulaUrl = await subirArchivoStorage(fotoCedulaFile, 'cedulas', cedLimpia);

      const fotoCarnetFinal = nuevaFotoCarnetUrl || fotoCarnetActualUrl || null;
      const fotoCedulaFinal = nuevaFotoCedulaUrl || fotoCedulaActualUrl || null;

      let idDestino = fichaIdExistente;
      if (!idDestino) {
        const { data: yaExiste } = await supabase
          .from('aspirantes_reclutamiento')
          .select('id')
          .eq('cedula', cedLimpia)
          .limit(1)
          .maybeSingle();
        if (yaExiste?.id) idDestino = yaExiste.id;
      }

      const payload: Record<string, any> = {
        nacionalidad,
        cedula: cedLimpia,
        nombres: nombres.trim().toUpperCase(),
        apellidos: apellidos.trim().toUpperCase(),
        fecha_nacimiento: fechaNacimiento || null,
        sexo,
        estado_civil: estadoCivil,
        carga_familiar: cargaFamiliar,
        rif: rif.trim().toUpperCase(),
        banco: banco.trim().toUpperCase(),
        tipo_cuenta: tipoCuenta,
        numero_cuenta: numeroCuenta.replace(/\D/g, ''),
        telefono_pago_movil: telefonoPagoMovil.replace(/\D/g, ''),
        estado_residencia: estadoResidencia.trim().toUpperCase(),
        municipio: municipio.trim().toUpperCase(),
        parroquia: parroquia.trim().toUpperCase(),
        direccion_domicilio: direccionDomicilio.trim(),
        punto_referencia: puntoReferencia.trim(),
        telefono_celular: telefonoCelular.replace(/\D/g, ''),
        telefono_alternativo: telefonoAlternativo.replace(/\D/g, ''),
        correo_electronico: correoElectronico.trim().toLowerCase(),
        contacto_emergencia_1_nombre: emerg1Nombre.trim().toUpperCase(),
        contacto_emergencia_1_parentesco: emerg1Parentesco.trim().toUpperCase(),
        contacto_emergencia_1_telefono: emerg1Telefono.replace(/\D/g, ''),
        grupo_sanguineo: grupoSanguineo,
        alergias_condiciones: alergiasCondiciones.trim().toUpperCase(),
        talla_camisa: tallaCamisa,
        talla_pantalon: tallaPantalon,
        talla_botas: tallaBotas,
        talla_gorra: tallaGorra,
        estatura: estatura.trim(),
        peso: peso.trim(),
        foto_carnet_url: fotoCarnetFinal,
        foto_cedula_url: fotoCedulaFinal,
        proyecto_asignado: proyectoSel,
        updated_at: new Date().toISOString(),
      };

      if (idDestino) {
        const { error } = await supabase
          .from('aspirantes_reclutamiento')
          .update(payload)
          .eq('id', idDestino);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('aspirantes_reclutamiento').insert([
          {
            ...payload,
            estatus_seleccion: 'INGRESADO',
            cargo_asignado: 'OFICIAL',
            turno_asignado: 'MIXTO',
            grupo_asignado: 'A',
            registrado_por: `LÍDER: ${nombreLider}`,
          },
        ]);
        if (error) throw error;
      }

      setMensaje({
        tipo: 'exito',
        texto: `✅ Ficha Técnica de ${nombres.toUpperCase()} ${apellidos.toUpperCase()} (C.I. ${nacionalidad}-${cedLimpia}) guardada correctamente.`,
      });
      setModoEditor(false);
      await cargarOficialesYFichas();
    } catch (err: any) {
      setMensaje({
        tipo: 'error',
        texto: 'Error guardando Ficha Técnica: ' + (err?.message || 'Verifique conexión.'),
      });
    } finally {
      setGuardando(false);
    }
  };
  const oficialesFiltrados = oficialesPlantilla.filter((of) => {
    const q = busqueda.toLowerCase().trim();
    if (!q) return true;
    return `${of.cedula} ${of.nombres} ${of.apellidos} ${of.cargo || ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border-l-4 border-indigo-600 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Expediente Operativo del Personal — Líder de Proyecto
          </span>
          <h1 className="text-2xl font-bold text-slate-800 mt-0.5 flex items-center gap-2">
            <UserCheck className="text-indigo-600" size={26} /> Ficha Técnica y Foto de Oficiales
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete o actualice los datos personales, tallas, contacto de emergencia y fotografía de los oficiales de su proyecto.
          </p>
        </div>

        <button
          type="button"
          onClick={() => abrirEditorConDatos()}
          className="px-4 py-2.5 rounded-xl text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer self-start"
        >
          <UserPlus size={16} /> Crear Ficha Nueva desde Cero
        </button>
      </div>

      {mensaje && (
        <div
          className={`p-4 rounded-xl text-sm border flex items-start gap-2 ${
            mensaje.tipo === 'exito'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {mensaje.tipo === 'exito' ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <span>{mensaje.texto}</span>
        </div>
      )}

      {!modoEditor ? (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            {proyectosLider.length > 1 && (
              <select
                value={proyectoSel}
                onChange={(e) => setProyectoSel(e.target.value)}
                className="border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
              >
                {proyectosLider.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            )}

            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar oficial por cédula o nombre..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>
          </div>

          {cargando ? (
            <p className="text-center text-slate-500 py-8 text-sm">Cargando oficiales de {proyectoSel}...</p>
          ) : oficialesFiltrados.length === 0 ? (
            <p className="text-center text-slate-500 py-8 text-sm">
              No hay oficiales activos en {proyectoSel}. Puede usar el botón "Crear Ficha Nueva desde Cero".
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {oficialesFiltrados.map((of) => {
                const cedNum = String(of.cedula || '').replace(/\D/g, '');
                const ficha = fichasExistentesMap[cedNum];
                const tieneFoto = Boolean(ficha?.foto_carnet_url);

                return (
                  <div
                    key={of.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {tieneFoto ? (
                        <img
                          src={ficha.foto_carnet_url}
                          alt="Foto"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <Users size={20} />
                        </div>
                      )}

                      <div>
                        <div className="font-bold text-sm text-slate-800">
                          {of.apellidos}, {of.nombres}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="font-mono">C.I. {of.cedula}</span>
                          <span>• {of.cargo || 'OFICIAL'}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              ficha && tieneFoto
                                ? 'bg-emerald-100 text-emerald-800'
                                : ficha
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {ficha && tieneFoto
                              ? '✅ FICHA + FOTO COMPLETA'
                              : ficha
                              ? '⚠️ FALTA FOTO / COMPLETAR'
                              : '❌ SIN FICHA TÉCNICA'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirEditorConDatos(of)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                    >
                      <Edit3 size={14} /> {ficha ? 'Editar / Completar Ficha' : 'Crear Ficha y Foto'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={guardarFichaTecnicaOficial}
          className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-800 uppercase">
              {fichaIdExistente ? 'Editando Ficha Técnica Existente (Datos Conservados)' : 'Nueva Ficha Técnica de Oficial'}
            </h2>
            <button
              type="button"
              onClick={() => setModoEditor(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 cursor-pointer"
            >
              Volver a Lista
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-indigo-50/60 p-4 rounded-xl border border-indigo-200">
            <div className="space-y-2">
              <label className="block text-xs font-black text-indigo-900 uppercase flex items-center gap-1.5">
                <Camera size={16} /> Foto Tipo Carnet del Oficial (Cámara o Galería)
              </label>
              {fotoCarnetActualUrl && (
                <img
                  src={fotoCarnetActualUrl}
                  alt="Carnet actual"
                  className="w-24 h-28 rounded-xl object-cover border-2 border-indigo-300"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoCarnetFile(e.target.files?.item(0) || null)}
                className="text-xs text-slate-700"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-indigo-900 uppercase flex items-center gap-1.5">
                <Camera size={16} /> Foto de Cédula de Identidad
              </label>
              {fotoCedulaActualUrl && (
                <img
                  src={fotoCedulaActualUrl}
                  alt="Cédula actual"
                  className="h-28 rounded-xl object-contain border-2 border-indigo-300"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoCedulaFile(e.target.files?.item(0) || null)}
                className="text-xs text-slate-700"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nacionalidad *</label>
              <select
                value={nacionalidad}
                onChange={(e) => setNacionalidad(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
              >
                <option value="V">V</option>
                <option value="E">E</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cédula *</label>
              <input
                type="text"
                required
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Nombres *</label>
              <input
                type="text"
                required
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Apellidos *</label>
              <input
                type="text"
                required
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Fecha Nacimiento</label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono Celular</label>
              <input
                type="text"
                value={telefonoCelular}
                onChange={(e) => setTelefonoCelular(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">RIF Personal</label>
              <input
                type="text"
                value={rif}
                onChange={(e) => setRif(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Grupo Sanguíneo</label>
              <select
                value={grupoSanguineo}
                onChange={(e) => setGrupoSanguineo(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
              >
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((gs) => (
                  <option key={gs} value={gs}>
                    {gs}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Estado / Municipio</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Estado"
                  value={estadoResidencia}
                  onChange={(e) => setEstadoResidencia(e.target.value)}
                  className="w-1/2 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
                <input
                  type="text"
                  placeholder="Municipio"
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-1/2 border border-slate-300 rounded-xl px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dirección Domicilio</label>
              <input
                type="text"
                value={direccionDomicilio}
                onChange={(e) => setDireccionDomicilio(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Punto de Referencia</label>
              <input
                type="text"
                value={puntoReferencia}
                onChange={(e) => setPuntoReferencia(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Contacto Emergencia</label>
              <input
                type="text"
                value={emerg1Nombre}
                onChange={(e) => setEmerg1Nombre(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Parentesco</label>
              <input
                type="text"
                value={emerg1Parentesco}
                onChange={(e) => setEmerg1Parentesco(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Teléfono Emergencia</label>
              <input
                type="text"
                value={emerg1Telefono}
                onChange={(e) => setEmerg1Telefono(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Banco</label>
              <input
                type="text"
                value={banco}
                onChange={(e) => setBanco(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Número de Cuenta (20 dígitos)</label>
              <input
                type="text"
                maxLength={20}
                value={numeroCuenta}
                onChange={(e) => setNumeroCuenta(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Tel. Pago Móvil</label>
              <input
                type="text"
                value={telefonoPagoMovil}
                onChange={(e) => setTelefonoPagoMovil(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Talla Camisa</label>
              <select
                value={tallaCamisa}
                onChange={(e) => setTallaCamisa(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
              >
                {['SS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Talla Pantalón</label>
              <select
                value={tallaPantalon}
                onChange={(e) => setTallaPantalon(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
              >
                {['28', '30', '32', '34', '36', '38', '40', '42', '44+'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Talla Botas</label>
              <select
                value={tallaBotas}
                onChange={(e) => setTallaBotas(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold"
              >
                {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Estatura (m)</label>
              <input
                type="text"
                value={estatura}
                onChange={(e) => setEstatura(e.target.value)}
                placeholder="1.75"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Peso (kg)</label>
              <input
                type="text"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                placeholder="78"
                className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModoEditor(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2.5 rounded-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save size={16} /> {guardando ? 'Guardando Ficha...' : 'Guardar Ficha y Foto'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { PROYECTOS } from '../data/constants';
import { obtenerUbicacionGPSAltaPrecision } from '../utils/geofencing';
import {
  MapPin,
  Save,
  Crosshair,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Search,
} from 'lucide-react';

export default function GeocercasProyectosPage() {
  const { currentUser } = useAuth();
  const nombreUsuario = currentUser?.nombre_completo || currentUser?.username || 'Directiva';
  const rolActual = (currentUser?.role || '').toLowerCase();
  const puedeConfigurarCercos = ['directiva', 'administrador', 'admin'].includes(rolActual);

  const listaProyectos = [...PROYECTOS].sort();
  const [proyectoSel, setProyectoSel] = useState<string>(listaProyectos.at(0) || '');
  const [latitud, setLatitud] = useState<string>('');
  const [longitud, setLongitud] = useState<string>('');
  const [radioMetros, setRadioMetros] = useState<number>(100);
  const [activo, setActivo] = useState<boolean>(true);

  const [geocercasMap, setGeocercasMap] = useState<Record<string, any>>({});
  const [intentosBloqueados, setIntentosBloqueados] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState<string>('');
  const [capturandoGPS, setCapturandoGPS] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error'; texto: string } | null>(null);

  const cargarGeocercasYAlertas = async () => {
    try {
      const { data: cercos } = await supabase.from('geocercas_proyectos').select('*');
      const mapa: Record<string, any> = {};
      if (Array.isArray(cercos)) {
        cercos.forEach((c) => {
          mapa[String(c.proyecto).trim().toUpperCase()] = c;
        });
      }
      setGeocercasMap(mapa);

      const { data: intentos } = await supabase
        .from('intentos_qr_fuera_cerco')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      setIntentosBloqueados(Array.isArray(intentos) ? intentos : []);
    } catch (err) {
      console.error('Error cargando geocercas:', err);
    }
  };

  useEffect(() => {
    if (!puedeConfigurarCercos) return;
    cargarGeocercasYAlertas();
  }, [puedeConfigurarCercos]);

  useEffect(() => {
    if (!proyectoSel) return;
    const existente = geocercasMap[proyectoSel.trim().toUpperCase()];
    if (existente) {
      setLatitud(String(existente.latitud));
      setLongitud(String(existente.longitud));
      setRadioMetros(Number(existente.radio_metros || 100));
      setActivo(Boolean(existente.activo));
    } else {
      setLatitud('');
      setLongitud('');
      setRadioMetros(100);
      setActivo(true);
    }
  }, [proyectoSel, geocercasMap]);
  if (!puedeConfigurarCercos) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-bold">
          Acceso restringido: Solo Directiva y Administrador pueden configurar los cercos geográficos.
        </div>
      </div>
    );
  }

  const capturarUbicacionActual = async () => {
    setCapturandoGPS(true);
    setMensaje(null);
    try {
      const coords = await obtenerUbicacionGPSAltaPrecision();
      setLatitud(coords.lat.toFixed(7));
      setLongitud(coords.lng.toFixed(7));
      setMensaje({
        tipo: 'exito',
        texto: `📍 Coordenadas GPS capturadas en sitio: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}. Presione "Guardar Cerco Geográfico".`,
      });
    } catch (err: any) {
      setMensaje({
        tipo: 'error',
        texto: err?.message || 'No se pudo obtener la ubicación GPS.',
      });
    } finally {
      setCapturandoGPS(false);
    }
  };

  const guardarCercoProyecto = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);

    const latNum = Number(latitud);
    const lngNum = Number(longitud);
    if (!proyectoSel || Number.isNaN(latNum) || Number.isNaN(lngNum) || latNum === 0 || lngNum === 0) {
      setMensaje({
        tipo: 'error',
        texto: '⚠️ Debe ingresar coordenadas válidas de Latitud y Longitud (o capturarlas con el botón GPS).',
      });
      return;
    }

    setGuardando(true);
    try {
      const { error } = await supabase.from('geocercas_proyectos').upsert(
        [
          {
            proyecto: proyectoSel,
            latitud: latNum,
            longitud: lngNum,
            radio_metros: Math.max(20, Number(radioMetros) || 100),
            activo,
            updated_by: nombreUsuario,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'proyecto' }
      );
      if (error) throw error;

      setMensaje({
        tipo: 'exito',
        texto: `✅ Cerco geográfico de ${proyectoSel} guardado (${latNum.toFixed(6)}, ${lngNum.toFixed(6)} • Radio: ${radioMetros} m).`,
      });
      await cargarGeocercasYAlertas();
    } catch (err: any) {
      setMensaje({
        tipo: 'error',
        texto: 'Error guardando cerco: ' + (err?.message || 'Error de conexión.'),
      });
    } finally {
      setGuardando(false);
    }
  };

  const proyectosFiltrados = listaProyectos.filter((p) =>
    p.toLowerCase().includes(busqueda.toLowerCase().trim())
  );
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border-l-4 border-emerald-600">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
          Seguridad Perimetral QR — Control de Ubicación en Vivo
        </span>
        <h1 className="text-2xl font-bold text-slate-800 mt-0.5 flex items-center gap-2">
          <MapPin className="text-emerald-600" size={26} /> Cercos Geográficos por Proyecto (Geofencing)
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fije las coordenadas GPS y el radio permitido (en metros) de cada proyecto para impedir que los líderes marquen asistencia fuera del puesto.
        </p>
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

      <form
        onSubmit={guardarCercoProyecto}
        className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-800">Configurar Perímetro de Proyecto</h2>
          <button
            type="button"
            disabled={capturandoGPS}
            onClick={capturarUbicacionActual}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 cursor-pointer self-start"
          >
            <Crosshair size={15} />
            {capturandoGPS ? 'Obteniendo GPS...' : 'Capturar Mi Ubicación GPS Actual'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Proyecto *</label>
            <select
              value={proyectoSel}
              onChange={(e) => setProyectoSel(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
            >
              {listaProyectos.map((p) => (
                <option key={p} value={p}>
                  {p} {geocercasMap[p.toUpperCase()] ? '✅ (Con Cerco)' : '⚠️ (Sin Cerco)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Latitud *</label>
            <input
              type="text"
              required
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
              placeholder="Ej: 10.484512"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Longitud *</label>
            <input
              type="text"
              required
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              placeholder="Ej: -66.854120"
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Radio (Metros) *</label>
            <input
              type="number"
              min={20}
              max={2000}
              required
              value={radioMetros}
              onChange={(e) => setRadioMetros(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-black"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-4 h-4 accent-emerald-600"
            />
            Cerco Activo (Bloquear marcaje QR si el líder está fuera del radio)
          </label>

          <button
            type="submit"
            disabled={guardando}
            className="px-6 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={15} /> {guardando ? 'Guardando...' : 'Guardar Cerco Geográfico'}
          </button>
        </div>
      </form>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-800 uppercase">
            Estado de Cercos en los {listaProyectos.length} Proyectos
          </h2>
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Filtrar proyecto..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
          {proyectosFiltrados.map((proy) => {
            const c = geocercasMap[proy.toUpperCase()];
            return (
              <div
                key={proy}
                onClick={() => setProyectoSel(proy)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  c
                    ? 'bg-emerald-50/60 border-emerald-300 hover:bg-emerald-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-black text-slate-800">{proy}</div>
                {c ? (
                  <div className="text-[11px] text-emerald-800 mt-0.5 font-mono">
                    {Number(c.latitud).toFixed(5)}, {Number(c.longitud).toFixed(5)} • Radio {c.radio_metros}m
                  </div>
                ) : (
                  <div className="text-[11px] text-amber-700 mt-0.5 font-semibold">Sin cerco configurado</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {intentosBloqueados.length > 0 && (
        <div className="bg-red-50 p-5 rounded-2xl border border-red-200 space-y-3">
          <h3 className="text-xs font-black text-red-900 uppercase flex items-center gap-1.5">
            <ShieldAlert size={16} /> Auditoría: Intentos de Marcaje QR Bloqueados Fuera de Cerco ({intentosBloqueados.length})
          </h3>
          <div className="divide-y divide-red-200 text-xs text-red-950">
            {intentosBloqueados.map((it) => (
              <div key={it.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <strong>{it.nombre_lider}</strong> intentó marcar en <strong>{it.proyecto}</strong> estando a{' '}
                  <strong className="underline">{it.distancia_metros} metros</strong> (máximo permitido: {it.radio_permitido}m).
                </div>
                <span className="text-[11px] text-red-700 font-mono">
                  {new Date(it.created_at).toLocaleString('es-VE')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

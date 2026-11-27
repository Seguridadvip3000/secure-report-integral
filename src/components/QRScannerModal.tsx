import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { supabase } from '../lib/supabase';
import { validarUbicacionEnCerco } from '../utils/geofencing';
import { Camera, X, AlertCircle, ShieldCheck, MapPin } from 'lucide-react';

interface QRScannerModalProps {
  titulo: string;
  subtitulo: string;
  proyectoEsperado?: string;
  liderId?: string;
  nombreLider?: string;
  onScanSuccess: (proyectoEscaneado: string, coords?: { lat: number; lng: number; distancia?: number }) => void;
  onClose: () => void;
}

export default function QRScannerModal({
  titulo,
  subtitulo,
  proyectoEsperado,
  liderId,
  nombreLider,
  onScanSuccess,
  onClose,
}: QRScannerModalProps) {
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const [verificandoGPS, setVerificandoGPS] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const procesadoRef = useRef(false);

  useEffect(() => {
    const readerId = 'vip3000-live-qr-reader';
    const html5QrCode = new Html5Qrcode(readerId);
    scannerRef.current = html5QrCode;

    const iniciarCamaraEnVivo = async () => {
      try {
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          async (decodedText) => {
            if (procesadoRef.current) return;

            const prefijo = 'VIP3000_PROYECTO:';
            if (!decodedText.startsWith(prefijo)) {
              setErrorCamara('Código QR no válido. Escanee el cartel oficial de Seguridad VIP 3000 ubicado en el puesto.');
              return;
            }

            const proyectoLeido = decodedText.replace(prefijo, '').trim();

            if (
              proyectoEsperado &&
              proyectoLeido.toLowerCase() !== proyectoEsperado.toLowerCase()
            ) {
              setErrorCamara(
                `❌ Proyecto incorrecto: Este QR pertenece a "${proyectoLeido}", pero usted tiene asignado "${proyectoEsperado}".`
              );
              return;
            }

            procesadoRef.current = true;
            setVerificandoGPS(true);
            setErrorCamara(null);

            try {
              const { data: cerco } = await supabase
                .from('geocercas_proyectos')
                .select('*')
                .ilike('proyecto', proyectoLeido)
                .eq('activo', true)
                .maybeSingle();

              if (cerco) {
                const resGPS = await validarUbicacionEnCerco(
                  Number(cerco.latitud),
                  Number(cerco.longitud),
                  Number(cerco.radio_metros || 100)
                );

                if (!resGPS.dentroDelCerco) {
                  await supabase.from('intentos_qr_fuera_cerco').insert([
                    {
                      lider_id: liderId || null,
                      nombre_lider: nombreLider || 'Líder',
                      proyecto: proyectoLeido,
                      latitud: resGPS.latitud,
                      longitud: resGPS.longitud,
                      distancia_metros: resGPS.distanciaMetros,
                      radio_permitido: Number(cerco.radio_metros || 100),
                    },
                  ]);

                  procesadoRef.current = false;
                  setVerificandoGPS(false);
                  setErrorCamara(
                    `🚫 BLOQUEADO POR CERCO GEOGRÁFICO: Te encuentras a ${resGPS.distanciaMetros} metros de ${proyectoLeido} (radio máximo permitido: ${cerco.radio_metros} m). Debes estar dentro del puesto para marcar.`
                  );
                  return;
                }

                await html5QrCode.stop().catch(() => {});
                onScanSuccess(proyectoLeido, {
                  lat: resGPS.latitud,
                  lng: resGPS.longitud,
                  distancia: resGPS.distanciaMetros,
                });
                return;
              }

              await html5QrCode.stop().catch(() => {});
              onScanSuccess(proyectoLeido);
            } catch (gpsErr: any) {
              procesadoRef.current = false;
              setVerificandoGPS(false);
              setErrorCamara(
                `📍 ${gpsErr?.message || 'Active el GPS de su teléfono para validar su ubicación.'}`
              );
            }
          },
          () => {}
        );
      } catch {
        setErrorCamara(
          'No se pudo abrir la cámara en vivo. Verifique que el permiso de cámara esté autorizado en su teléfono.'
        );
      }
    };

    iniciarCamaraEnVivo();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [proyectoEsperado, liderId, nombreLider, onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Camera className="text-blue-400" size={22} />
            <div>
              <h3 className="font-bold text-base">{titulo}</h3>
              <p className="text-xs text-slate-300">{subtitulo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 flex items-center gap-2 text-xs text-blue-800">
            <ShieldCheck size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>Verificación GPS + QR en Vivo:</strong> Debe encontrarse dentro del perímetro del proyecto con el GPS activo.
            </span>
          </div>

          <div
            id="vip3000-live-qr-reader"
            className="w-full rounded-xl overflow-hidden bg-black min-h-[280px]"
          />

          {verificandoGPS && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-lg p-3 flex items-center gap-2 font-bold">
              <MapPin size={16} className="animate-bounce text-amber-600 shrink-0" />
              <span>Verificando coordenadas GPS dentro del cerco del proyecto...</span>
            </div>
          )}

          {errorCamara && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3 flex items-start gap-2 font-semibold">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorCamara}</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors"
          >
            Cancelar Escaneo
          </button>
        </div>
      </div>
    </div>
  );
}

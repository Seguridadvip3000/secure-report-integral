export interface ResultadoGeocerca {
  dentroDelCerco: boolean;
  distanciaMetros: number;
  latitud: number;
  longitud: number;
}

export const calcularDistanciaMetros = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

export const obtenerUbicacionGPSAltaPrecision = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Este teléfono no soporta geolocalización GPS.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (err) => {
        if (err.code === 1) {
          reject(new Error('Permiso de ubicación denegado. Active el GPS y autorice la ubicación en el navegador.'));
        } else {
          reject(new Error('No se pudo obtener señal GPS precisa. Salga a un área despejada e intente de nuevo.'));
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
};

export const validarUbicacionEnCerco = async (
  latProyecto: number,
  lonProyecto: number,
  radioPermitidoMetros: number
): Promise<ResultadoGeocerca> => {
  const coords = await obtenerUbicacionGPSAltaPrecision();
  const distancia = calcularDistanciaMetros(coords.lat, coords.lng, latProyecto, lonProyecto);
  return {
    dentroDelCerco: distancia <= radioPermitidoMetros,
    distanciaMetros: distancia,
    latitud: coords.lat,
    longitud: coords.lng,
  };
};

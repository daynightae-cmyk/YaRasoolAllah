/** Kaaba (al-Masjid al-Haram), WGS84. */
export const KAABA = { lat: 21.422487, lng: 39.826206 };

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

/** Initial great-circle bearing from a point to the Kaaba, degrees clockwise from true north. */
export function qiblaBearing(lat: number, lng: number): number {
  const φ1 = toRad(lat);
  const φ2 = toRad(KAABA.lat);
  const Δλ = toRad(KAABA.lng - lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Haversine distance in kilometres. */
export function distanceToKaabaKm(lat: number, lng: number): number {
  const R = 6371;
  const dφ = toRad(KAABA.lat - lat);
  const dλ = toRad(KAABA.lng - lng);
  const a =
    Math.sin(dφ / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(KAABA.lat)) * Math.sin(dλ / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function compassCardinal(deg: number, lang: "ar" | "en") {
  const dirs =
    lang === "ar"
      ? ["شمال", "شمال شرق", "شرق", "جنوب شرق", "جنوب", "جنوب غرب", "غرب", "شمال غرب"]
      : ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}

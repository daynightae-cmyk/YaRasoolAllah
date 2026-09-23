import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  MapPin,
  Settings,
  RefreshCw,
  Info,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MAKKAH = { lat: 21.4225, lng: 39.8262 };

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle initial bearing from (lat,lng) to Makkah, in degrees. */
function qiblaBearing(lat: number, lng: number) {
  const pLat = toRad(lat);
  const pLng = toRad(lng);
  const mLat = toRad(MAKKAH.lat);
  const mLng = toRad(MAKKAH.lng);
  const dLng = mLng - pLng;
  const y = Math.sin(dLng);
  const x = Math.cos(pLat) * Math.tan(mLat) - Math.sin(pLat) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/** Haversine distance to Makkah, in km. */
function makkahDistanceKm(lat: number, lng: number) {
  const R = 6371;
  const dLat = toRad(MAKKAH.lat - lat);
  const dLng = toRad(MAKKAH.lng - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat)) * Math.cos(toRad(MAKKAH.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(a)));
}

interface QiblaCity {
  id: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

const KNOWN_CITIES: QiblaCity[] = [
  { id: "riyadh", city: "الرياض", country: "السعودية", latitude: 24.7136, longitude: 46.6753 },
  { id: "jeddah", city: "جدة", country: "السعودية", latitude: 21.4858, longitude: 39.1925 },
  { id: "cairo", city: "القاهرة", country: "مصر", latitude: 30.0444, longitude: 31.2357 },
  { id: "dubai", city: "دبي", country: "الإمارات", latitude: 25.2048, longitude: 55.2708 },
  { id: "istanbul", city: "إسطنبول", country: "تركيا", latitude: 41.0082, longitude: 28.9784 },
];

export default function QiblaCompassPage() {
  const { t, isRTL } = useLanguage();
  // Device heading from the orientation sensor when available; otherwise the
  // user rotates the dial manually. The needle never moves on its own.
  const [sensorHeading, setSensorHeading] = useState<number | null>(null);
  const [manualHeading, setManualHeading] = useState(0);
  const [sensorState, setSensorState] = useState<"idle" | "active" | "unsupported" | "denied">("idle");
  const [location, setLocation] = useState<(QiblaCity & { source: "gps" | "manual" }) | null>(null);
  const [locating, setLocating] = useState(false);

  // Real device-orientation heading. No simulated drift: without a sensor
  // the needle stays where the user puts it.
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const anyE = e as DeviceOrientationEvent & { webkitCompassHeading?: number };
      if (typeof anyE.webkitCompassHeading === "number") {
        setSensorHeading(anyE.webkitCompassHeading);
        setSensorState("active");
      } else if (typeof e.alpha === "number") {
        setSensorHeading((360 - e.alpha) % 360);
        setSensorState("active");
      }
    };

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", handleOrientation);
      return () => window.removeEventListener("deviceorientation", handleOrientation);
    }
    setSensorState("unsupported");
  }, []);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocation(null);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        setLocation({
          id: "gps",
          city: "موقعي الحالي",
          country: "GPS",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          source: "gps",
        });
      },
      () => {
        setLocating(false);
        setLocation(null);
      },
      { timeout: 10000 },
    );
  };

  const calibrateCompass = () => {
    // Re-requesting location is the only honest "recalibration": there is no
    // fake animation and no sensor reset theater.
    requestLocation();
  };

  const getDirectionText = (angle: number) => {
    const directions = [
      "شمال",
      "شمال شرق",
      "شرق",
      "جنوب شرق",
      "جنوب",
      "جنوب غرب",
      "غرب",
      "شمال غرب",
    ];
    const index = Math.round(angle / 45) % 8;
    return directions[index];
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  // Heading shown by the needle: sensor first, manual dial otherwise.
  const heading = sensorHeading ?? manualHeading;
  const bearing = location ? qiblaBearing(location.latitude, location.longitude) : null;
  const distanceKm = location ? makkahDistanceKm(location.latitude, location.longitude) : null;
  const qiblaAngle = bearing === null ? null : (bearing - heading + 360) % 360;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-900 to-green-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pt-12">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>

        <div className="text-center">
          <h1 className="text-xl font-bold font-amiri">اتجاه القبلة</h1>
          <p className="text-sm opacity-75 font-inter">Qibla Direction</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <Settings className="w-6 h-6" />
        </Button>
      </div>

      {/* Current Time and Location */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold font-mono mb-2">{formatTime()}</div>
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm opacity-75">
          <MapPin className="w-4 h-4" />
          <span>
            {location ? `${location.city}، ${location.country}` : "لم يُحدد الموقع بعد"}
          </span>
        </div>
        {/* Honest location sourcing: GPS on demand or a named city. */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-3 px-6">
          <Button
            variant="outline"
            size="sm"
            onClick={requestLocation}
            disabled={locating}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs font-amiri"
          >
            <MapPin className="w-3.5 h-3.5 ml-1" />
            {locating ? "جارٍ التحديد..." : location?.source === "gps" ? "تحديث موقعي" : "استخدام موقعي الحالي"}
          </Button>
          {KNOWN_CITIES.map((c) => (
            <Button
              key={c.id}
              variant="outline"
              size="sm"
              onClick={() => setLocation({ ...c, source: "manual" })}
              className={cn(
                "text-xs font-amiri border-white/20",
                location?.id === c.id
                  ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                  : "bg-white/10 text-white hover:bg-white/20",
              )}
            >
              {c.city}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Compass */}
      <div className="flex-1 flex items-center justify-center px-6 mb-8">
        <div className="relative">
          {/* Outer Ring */}
          <div className="w-80 h-80 relative">
            {/* Background Circle */}
            <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>

            {/* Degree Markings */}
            <div className="absolute inset-0">
              {Array.from({ length: 36 }, (_, i) => {
                const angle = i * 10;
                const isMainDirection = angle % 90 === 0;
                const isMidDirection = angle % 45 === 0;

                return (
                  <div
                    key={i}
                    className="absolute w-1 bg-white/60"
                    style={{
                      height: isMainDirection
                        ? "20px"
                        : isMidDirection
                          ? "15px"
                          : "8px",
                      left: "50%",
                      top: isMainDirection
                        ? "4px"
                        : isMidDirection
                          ? "6px"
                          : "10px",
                      transformOrigin: "50% 156px",
                      transform: `translateX(-50%) rotate(${angle}deg)`,
                    }}
                  />
                );
              })}
            </div>

            {/* Direction Labels */}
            <div className="absolute inset-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <span className="text-lg font-bold font-amiri">ش</span>
              </div>
              <div className="absolute right-0 top-1/2 transform translate-x-2 -translate-y-1/2">
                <span className="text-lg font-bold font-amiri">ق</span>
              </div>
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-2">
                <span className="text-lg font-bold font-amiri">ج</span>
              </div>
              <div className="absolute left-0 top-1/2 transform -translate-x-2 -translate-y-1/2">
                <span className="text-lg font-bold font-amiri">غ</span>
              </div>
            </div>

            {/* Compass Needle: follows the real sensor heading, or the manual
                dial below when no sensor exists. */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${heading}deg)` }}
            >
              <div className="absolute left-1/2 top-1/2 w-1 h-24 bg-gradient-to-t from-red-500 to-white transform -translate-x-1/2 -translate-y-full origin-bottom rounded-full"></div>
              <div className="absolute left-1/2 top-1/2 w-1 h-16 bg-gradient-to-b from-gray-400 to-gray-600 transform -translate-x-1/2 origin-top rounded-full"></div>
            </div>

            {/* Qibla Indicator: rendered only once a location is known. */}
            {qiblaAngle !== null && (
              <div
                className="absolute inset-0 transition-transform duration-500"
                style={{ transform: `rotate(${qiblaAngle}deg)` }}
              >
                <div className="absolute left-1/2 top-4 transform -translate-x-1/2">
                  <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <span className="text-white text-xs font-bold">🕋</span>
                  </div>
                </div>
                <div className="absolute left-1/2 top-12 w-0.5 h-16 bg-gradient-to-b from-amber-400 to-transparent transform -translate-x-1/2"></div>
              </div>
            )}

            {/* Center Circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center shadow-xl border-4 border-white/30">
                <Compass className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Angle Display */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
                <span className="text-lg font-bold font-mono">
                  {qiblaAngle !== null ? `${Math.round(qiblaAngle)}°` : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-6 space-y-4 mb-8">
        {/* Manual dial: the only heading control when no sensor is present. */}
        {sensorHeading === null && (
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-amiri text-white/85 text-center">
                {sensorState === "unsupported"
                  ? "حساس الاتجاه غير متاح على هذا الجهاز — أدر المؤشر يدويًا حتى يطابق اتجاهك"
                  : "بانتظار حساس الاتجاه — يمكنك التدوير اليدوي ريثما يُفعّل"}
              </p>
              <input
                type="range"
                min={0}
                max={359}
                value={manualHeading}
                onChange={(e) => setManualHeading(Number(e.target.value))}
                className="w-full accent-amber-400"
                aria-label="تدوير مؤشر الاتجاه يدويًا"
              />
              <p className="text-center text-sm font-mono">{manualHeading}°</p>
            </CardContent>
          </Card>
        )}
        {/* Direction Info */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold font-amiri text-amber-400">
                  {qiblaAngle !== null ? getDirectionText(qiblaAngle) : "حدد موقعك أولًا"}
                </div>
                <div className="text-xs opacity-75">اتجاه القبلة</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {distanceKm !== null ? `${distanceKm.toLocaleString("en")} كم` : "—"}
                </div>
                <div className="text-xs opacity-75">المسافة إلى مكة</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Makkah Time */}
        <Card className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-300/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-xl">🕋</span>
                </div>
                <div>
                  <div className="font-amiri font-bold text-amber-200">
                    مكة المكرمة
                  </div>
                  <div className="text-sm opacity-75">الوقت المحلي</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold font-mono text-amber-200">
                  {formatTime()}
                </div>
                <div className="text-xs opacity-75">GMT +3</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="px-6 mb-8">
        <div className="grid grid-cols-1 gap-4">
          <Button
            variant="outline"
            onClick={calibrateCompass}
            disabled={locating}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center py-4"
          >
            <RefreshCw
              className={cn("w-5 h-5 mb-1", locating && "animate-spin")}
            />
            <span className="text-xs font-amiri">
              {locating ? "جارٍ تحديد الموقع..." : "إعادة تحديد الموقع"}
            </span>
          </Button>
        </div>
      </div>

      {/* Instructions */}
      <div className="px-6 mb-6">
        <Card className="bg-blue-500/20 border-blue-300/30">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3 rtl:space-x-reverse">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Info className="w-4 h-4 text-blue-900" />
              </div>
              <div className="flex-1">
                <h3 className="font-amiri font-bold text-blue-200 mb-1">
                  تعليمات الاستخدام
                </h3>
                <p className="text-sm text-blue-300 leading-relaxed font-amiri">
                  حدد موقعك أولًا، ثم وجّه أعلى الهاتف نحو الشمال الحقيقي (بالبوصلة
                  أو الشمس) وحرّك المؤشر اليدوي إن لزم، واتجه نحو الرمز الذهبي 🕋.
                  الزاوية والمسافة حساب فلكي من إحداثياتك، ودقة الاتجاه على الشاشة
                  رهينة بحساس جهازك.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom spacing */}
      <div className="h-20"></div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  ArrowLeft,
  Navigation,
  MapPin,
  Settings,
  RefreshCw,
  Info,
  Share2,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function QiblaCompassPage() {
  const { t, isRTL } = useLanguage();
  const [direction, setDirection] = useState(0);
  const [qiblaDirection, setQiblaDirection] = useState(45); // Mock Qibla direction
  const [distance, setDistance] = useState(1234); // Distance to Makkah in km
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [location, setLocation] = useState({
    city: "الرياض",
    country: "السعودية",
    latitude: 24.7136,
    longitude: 46.6753,
  });

  useEffect(() => {
    // Simulate compass updates
    const interval = setInterval(() => {
      if (!isCalibrating) {
        setDirection((prev) => (prev + Math.random() * 4 - 2) % 360);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isCalibrating]);

  const calibrateCompass = () => {
    setIsCalibrating(true);
    setTimeout(() => {
      setIsCalibrating(false);
      setDirection(0);
    }, 2000);
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

  const calculateQiblaAngle = () => {
    return (qiblaDirection - direction + 360) % 360;
  };

  const qiblaAngle = calculateQiblaAngle();

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
      <div className="text-center mb-8">
        <div className="text-3xl font-bold font-mono mb-2">{formatTime()}</div>
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-sm opacity-75">
          <MapPin className="w-4 h-4" />
          <span>
            {location.city}، {location.country}
          </span>
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

            {/* Compass Needle */}
            <div
              className="absolute inset-0 transition-transform duration-300 ease-out"
              style={{ transform: `rotate(${direction}deg)` }}
            >
              <div className="absolute left-1/2 top-1/2 w-1 h-24 bg-gradient-to-t from-red-500 to-white transform -translate-x-1/2 -translate-y-full origin-bottom rounded-full"></div>
              <div className="absolute left-1/2 top-1/2 w-1 h-16 bg-gradient-to-b from-gray-400 to-gray-600 transform -translate-x-1/2 origin-top rounded-full"></div>
            </div>

            {/* Qibla Indicator */}
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
                  {Math.round(qiblaAngle)}°
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="px-6 space-y-4 mb-8">
        {/* Direction Info */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold font-amiri text-amber-400">
                  {getDirectionText(qiblaAngle)}
                </div>
                <div className="text-xs opacity-75">اتجاه القبلة</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {distance} كم
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
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={calibrateCompass}
            disabled={isCalibrating}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center py-4"
          >
            <RefreshCw
              className={cn("w-5 h-5 mb-1", isCalibrating && "animate-spin")}
            />
            <span className="text-xs font-amiri">
              {isCalibrating ? "معايرة..." : "معايرة"}
            </span>
          </Button>

          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center py-4"
          >
            <Share2 className="w-5 h-5 mb-1" />
            <span className="text-xs font-amiri">مشاركة</span>
          </Button>

          <Button
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex flex-col items-center py-4"
          >
            <Info className="w-5 h-5 mb-1" />
            <span className="text-xs font-amiri">معلومات</span>
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
                  ضع الهاتف على سطح مستوٍ واتجه نحو الرمز الذهبي 🕋 للوصول
                  لاتجاه القبلة الصحيح
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prayer Times Reminder */}
      <div className="px-6 mb-6">
        <Card className="bg-emerald-500/20 border-emerald-300/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-amiri font-bold text-emerald-200">
                  الصلاة التالية
                </h3>
                <p className="text-sm text-emerald-300">العصر - بعد ساعتين</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold font-mono text-emerald-200">
                  15:08
                </div>
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

import React, { useState } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import EvidenceDrawer, { EvidenceSource } from "@/components/Institution/EvidenceDrawer";
import LearningDepthSelector, { useLearningDepth } from "@/components/Institution/LearningDepthSelector";
import { PROPHETIC_DAY_STATIONS, DailyStation } from "@/data/propheticDailyData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Clock,
  Sparkles,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PropheticDayPage() {
  const { depth } = useLearningDepth();
  const [activeStationId, setActiveStationId] = useState<string>(PROPHETIC_DAY_STATIONS[0].id);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);

  const activeStation =
    PROPHETIC_DAY_STATIONS.find((s) => s.id === activeStationId) ||
    PROPHETIC_DAY_STATIONS[0];

  const currentIndex = PROPHETIC_DAY_STATIONS.findIndex(
    (s) => s.id === activeStationId
  );

  const handleNext = () => {
    if (currentIndex < PROPHETIC_DAY_STATIONS.length - 1) {
      setActiveStationId(PROPHETIC_DAY_STATIONS[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveStationId(PROPHETIC_DAY_STATIONS[currentIndex - 1].id);
    }
  };

  const getStationIcon = (period: DailyStation["period"]) => {
    switch (period) {
      case "fajr":
        return <Sunrise className="w-5 h-5 text-amber-500" />;
      case "morning":
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case "noon":
        return <Sun className="w-5 h-5 text-orange-500" />;
      case "afternoon":
        return <Sunset className="w-5 h-5 text-rose-500" />;
      case "maghrib":
        return <Sunset className="w-5 h-5 text-purple-500" />;
      case "night":
        return <Moon className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <InstitutionShell activeWing="prophetic-day">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 text-white shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-xs font-tajawal">
                  منظومة التطبيق المعاصر
                </Badge>
                <span className="text-xs text-slate-400 font-mono">
                  من الفجر إلى سكون الليل
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-amiri font-bold tracking-tight">
                24 ساعة في رحاب الهدي النبوي
              </h1>
              <p className="text-sm md:text-base font-tajawal text-slate-300 leading-relaxed">
                معايشة يومية دقيقة لأخلاق النبي ﷺ وتعامله في بيته، وسوقه، ومجتمعه، ومحرابه؛ وكيف نترجم هذا الهدي الرفيع إلى ممارسة أخلاقية حيّة في واقعنا المعاصر.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <LearningDepthSelector compact />
            </div>
          </div>
        </div>

        {/* Stations Navigation Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PROPHETIC_DAY_STATIONS.map((station) => {
            const isActive = station.id === activeStationId;
            return (
              <button
                key={station.id}
                onClick={() => setActiveStationId(station.id)}
                className={cn(
                  "p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2",
                  isActive
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                    : "bg-white dark:bg-slate-900 border-border hover:border-emerald-600/50"
                )}
              >
                <div className="flex items-center justify-between w-full">
                  {getStationIcon(station.period)}
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {station.period.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-tajawal text-muted-foreground block">
                    {station.timeframeAr}
                  </span>
                  <span className="font-amiri font-bold text-sm text-foreground line-clamp-1">
                    {station.titleAr}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Station Deep Dive */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Card (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <article className="p-6 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-border shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center">
                    {getStationIcon(activeStation.period)}
                  </div>
                  <div>
                    <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold block">
                      {activeStation.timeframeAr}
                    </span>
                    <h2 className="text-xl md:text-2xl font-amiri font-bold text-foreground">
                      {activeStation.titleAr}
                    </h2>
                  </div>
                </div>

                <Badge variant="outline" className="text-xs font-mono">
                  {activeStation.sourceReference}
                </Badge>
              </div>

              {/* Hadith Section */}
              <div className="p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3">
                <div className="flex items-center justify-between text-xs font-cairo text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    النص النبوي المسند
                  </span>
                  <span className="font-mono text-[11px]">{activeStation.sourceReference}</span>
                </div>
                <p className="font-amiri text-xl md:text-2xl leading-relaxed text-foreground font-semibold">
                  {activeStation.hadithTextAr}
                </p>
                <p className="text-xs font-inter text-muted-foreground" dir="ltr">
                  "{activeStation.hadithTextEn}"
                </p>
              </div>

              {/* Ethical Principle */}
              <div className="space-y-2">
                <h3 className="text-sm font-cairo font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  المبدأ القيمي والأخلاقي
                </h3>
                <p className="text-sm font-tajawal text-foreground leading-relaxed">
                  {activeStation.ethicalPrincipleAr}
                </p>
              </div>

              {/* Modern Application */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border space-y-2">
                <h3 className="text-sm font-cairo font-bold text-foreground flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  التطبيق العملي في حياتنا المعاصرة
                </h3>
                <p className="text-xs md:text-sm font-tajawal text-muted-foreground leading-relaxed">
                  {activeStation.modernApplicationAr}
                </p>
              </div>

              {/* Footer Controls */}
              <div className="pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentIndex === 0}
                    onClick={handlePrev}
                    className="gap-1.5 text-xs font-cairo"
                  >
                    <ChevronRight className="w-4 h-4" />
                    المحطة السابقة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentIndex === PROPHETIC_DAY_STATIONS.length - 1}
                    onClick={handleNext}
                    className="gap-1.5 text-xs font-cairo"
                  >
                    المحطة التالية
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setSelectedEvidence({
                      title: activeStation.titleAr,
                      collectionOrWork: activeStation.sourceReference,
                      authorOrCompiler: "الأئمة المحدثون",
                      referenceNumber: activeStation.id,
                      originalText: activeStation.hadithTextAr,
                      translationExcerpt: activeStation.hadithTextEn,
                      status: "verified",
                      provenanceDataset: "صحيح السنة النبوية والدواوين المعتمدة",
                    })
                  }
                  className="gap-1.5 text-xs font-cairo text-emerald-700 dark:text-emerald-400"
                >
                  <ShieldCheck className="w-4 h-4" />
                  توثيق المحطة
                </Button>
              </div>
            </article>
          </div>

          {/* Reflection & Study Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 rounded-3xl border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent text-right space-y-4">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-cairo font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                سؤال التأمل اليومي
              </div>

              <blockquote className="font-amiri text-lg text-foreground italic leading-relaxed border-r-2 border-amber-500 pr-3">
                "{activeStation.reflectivePromptAr}"
              </blockquote>

              <p className="text-xs font-tajawal text-muted-foreground leading-relaxed">
                خذ دقيقة من يومك، وأوقف التشتت الرقمي، وتأمل كيف يمكن لهذا المبدأ النبوي أن يغير طريقتك في العيش والتعامل مع من حولك.
              </p>
            </Card>

            <Card className="p-6 rounded-3xl border-border bg-white dark:bg-slate-900 text-right space-y-3">
              <h3 className="font-cairo font-bold text-sm text-foreground">
                المسار اليومي المتكامل
              </h3>
              <ul className="space-y-2 text-xs font-tajawal text-muted-foreground">
                <li className="flex items-center justify-between border-b pb-1.5">
                  <span>محطات اليوم:</span>
                  <span className="font-mono font-bold text-foreground">6 محطات هدي</span>
                </li>
                <li className="flex items-center justify-between border-b pb-1.5">
                  <span>درجة التحقيق:</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">صحيح متفق عليه</span>
                </li>
                <li className="flex items-center justify-between">
                  <span>الهدف التربوي:</span>
                  <span>التحول من المعرفة النظرية إلى السلوك الحي</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <EvidenceDrawer
        isOpen={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        evidence={selectedEvidence}
      />
    </InstitutionShell>
  );
}

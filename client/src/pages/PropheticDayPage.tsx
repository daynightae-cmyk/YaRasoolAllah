import React, { useState } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import EvidenceDrawer, { EvidenceSource } from "@/components/Institution/EvidenceDrawer";
import LearningDepthSelector, { useLearningDepth } from "@/components/Institution/LearningDepthSelector";
import { PROPHETIC_DAY_STATIONS, DailyStation } from "@/data/propheticDailyData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Sparkles,
  ShieldCheck,
  Heart,
  ChevronLeft,
  ChevronRight,
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
        return <Sunrise className="w-5 h-5" />;
      case "morning":
        return <Sun className="w-5 h-5" />;
      case "noon":
        return <Sun className="w-5 h-5" />;
      case "afternoon":
        return <Sunset className="w-5 h-5" />;
      case "maghrib":
        return <Sunset className="w-5 h-5" />;
      case "night":
        return <Moon className="w-5 h-5" />;
    }
  };

  return (
    <InstitutionShell activeWing="prophetic-day">
      <div className="prophetic-journey text-right">
        {/* Banner */}
        <section className="wing-hero wing-hero--daily" aria-labelledby="prophetic-day-title">
          <div className="wing-hero__grid">
            <div>
              <div className="wing-hero__eyebrow">
                <Sun className="h-4 w-4" />
                من الفجر إلى سكون الليل — معايشة الهدي النبوي
              </div>
              <h1 id="prophetic-day-title">24 ساعة في رحاب الهدي النبوي</h1>
              <p>
                معايشة يومية دقيقة لأخلاق النبي ﷺ وتعامله في بيته، وسوقه، ومجتمعه، ومحرابه؛
                وكيف نترجم هذا الهدي الرفيع إلى ممارسة أخلاقية حيّة في واقعنا المعاصر.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3 self-end">
              <LearningDepthSelector compact />
            </div>
          </div>
        </section>

        {/* Sundial Timeline — the hours of the prophetic day */}
        <div className="sundial" role="group" aria-label="محطات اليوم النبوي">
          {PROPHETIC_DAY_STATIONS.map((station) => {
            const isActive = station.id === activeStationId;
            return (
              <button
                key={station.id}
                type="button"
                id={`station-control-${station.id}`}
                aria-pressed={isActive}
                aria-controls="prophetic-day-station-panel"
                data-period={station.period}
                className={cn("sundial-node", isActive && "is-active")}
                onClick={() => setActiveStationId(station.id)}
              >
                <span className="sundial-node__orb">{getStationIcon(station.period)}</span>
                <span className="sundial-node__label">{station.titleAr}</span>
                <span className="sundial-node__time" dir="ltr">{station.timeframeEn}</span>
              </button>
            );
          })}
        </div>

        {/* Reading Alcove — the active station deep dive */}
        <div className="alcove">
          <article
            id="prophetic-day-station-panel"
            aria-labelledby={`station-control-${activeStation.id}`}
            className="alcove__stage"
            data-period={activeStation.period}
            style={{ ["--alcove-wash" as string]: `hsl(${activeStation.period === "fajr" ? "35 75% 50%" : activeStation.period === "morning" ? "45 85% 45%" : activeStation.period === "noon" ? "28 80% 48%" : activeStation.period === "afternoon" ? "15 70% 48%" : activeStation.period === "maghrib" ? "330 45% 50%" : "240 45% 58%"} / 0.06)` }}
          >
            <header className="alcove__header">
              <div
                className="alcove__icon"
                data-period={activeStation.period}
                style={{ ["--time-color" as string]: activeStation.period === "fajr" ? "hsl(35 75% 50%)" : activeStation.period === "morning" ? "hsl(45 85% 45%)" : activeStation.period === "noon" ? "hsl(28 80% 48%)" : activeStation.period === "afternoon" ? "hsl(15 70% 48%)" : activeStation.period === "maghrib" ? "hsl(330 45% 50%)" : "hsl(240 45% 58%)" }}
              >
                {getStationIcon(activeStation.period)}
              </div>
              <div>
                <span className="alcove__timeframe">{activeStation.timeframeAr}</span>
                <h2 className="alcove__title">{activeStation.titleAr}</h2>
              </div>
              <Badge variant="outline" className="alcove__source ms-auto font-mono text-[10px]">
                {activeStation.sourceReference}
              </Badge>
            </header>

            {/* Manuscript Cartouche — the hadith */}
            <div className="prophetic-cartouche">
              <div className="prophetic-cartouche__label">
                <span>
                  <Sparkles className="w-4 h-4" />
                  النص النبوي المسند
                </span>
                <span className="font-mono text-[11px]">{activeStation.sourceReference}</span>
              </div>
              <p className="prophetic-cartouche__arabic">{activeStation.hadithTextAr}</p>
              <p className="prophetic-cartouche__translation" dir="ltr">
                "{activeStation.hadithTextEn}"
              </p>
            </div>

            {/* Ethical Principle */}
            <div className="alcove__principle">
              <h3>
                <ShieldCheck className="w-4 h-4" />
                المبدأ القيمي والأخلاقي
              </h3>
              <p>{activeStation.ethicalPrincipleAr}</p>
            </div>

            {/* Modern Application */}
            <div className="alcove__application">
              <h3>
                <Heart className="w-4 h-4" />
                التطبيق العملي في حياتنا المعاصرة
              </h3>
              <p>{activeStation.modernApplicationAr}</p>
            </div>

            {/* Navigation */}
            <div className="alcove__nav">
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
                    status: "editorial_review_pending",
                    reviewNote: "سجل عرض يومي؛ يتطلب مطابقة الطبعة والرقم ومراجعة تحريرية قبل الاعتماد.",
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

          {/* Reflection Nook */}
          <aside className="reflection-nook">
            <span className="reflection-nook__label">
              <Sparkles className="w-4 h-4 text-amber-600" />
              سؤال التأمل اليومي
            </span>
            <blockquote className="reflection-nook__prompt">
              "{activeStation.reflectivePromptAr}"
            </blockquote>
            <p className="reflection-nook__hint">
              خذ دقيقة من يومك، وأوقف التشتت الرقمي، وتأمل كيف يمكن لهذا المبدأ النبوي
              أن يغير طريقتك في العيش والتعامل مع من حولك.
            </p>
            <ul className="reflection-nook__summary">
              <li>
                <span>محطات اليوم:</span>
                <strong className="font-mono">6 محطات هدي</strong>
              </li>
              <li>
                <span>درجة التحقيق:</span>
                <strong className="text-amber-700 dark:text-amber-300">قيد المراجعة التحريرية</strong>
              </li>
              <li>
                <span>الهدف التربوي:</span>
                <strong>التحول من المعرفة إلى السلوك</strong>
              </li>
            </ul>
          </aside>
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

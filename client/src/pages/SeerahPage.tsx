import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import SourceDrawer, { SourceProvenanceItem } from "@/components/common/SourceDrawer";
import LearningDepthSelector, { useLearningDepth } from "@/components/Institution/LearningDepthSelector";
import MountainousBattlefieldMap from "@/components/Seerah/MountainousBattlefieldMap";
import {
  seerahChapters,
  seerahCategories,
  getChaptersByCategory,
  getChapterById,
  getRelatedChapters,
  searchChapters,
  SeerahChapter,
  TimelineEvent,
} from "@/data/seerahData";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Compass,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  ShieldCheck,
  Search,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Users,
  Layers,
  GitCommit,
  CheckCircle2,
  Mountain,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Historical geographic places in Seerah (responsible historical coordinates & context)
const HISTORICAL_LOCATIONS = [
  {
    id: "makkah",
    nameAr: "مكة المكرمة",
    nameEn: "Mecca",
    period: "العهد المكي (571م - 622م)",
    descriptionAr: "البلد الحرام، مهد ولادة النبي ﷺ، مهبط الوحي الأول، وبداية الدعوة إلى التوحيد.",
    eventsCount: 4,
    historicalNote: "الموقع المركزي في تهامة الحجاز.",
  },
  {
    id: "cave-hira",
    nameAr: "غار حراء (جبل النور)",
    nameEn: "Cave Hira (Jabal al-Nur)",
    period: "610م",
    descriptionAr: "المكان الذي كان يخلو فيه النبي ﷺ للتعبد، وفيه نزل الملك جبريل بأول آيات القرآن: «اقْرَأْ».",
    eventsCount: 1,
    historicalNote: "يبعد نحو 4 كيلومترات شمال شرق المسجد الحرام.",
  },
  {
    id: "hijrah-route",
    nameAr: "طريق الهجرة النبوية",
    nameEn: "Prophetic Hijrah Route",
    period: "ربيع الأول 1 هـ (622م)",
    descriptionAr: "المسار الوعر غير المألوف الذي سلكه النبي ﷺ وصاحبه أبو بكر برفقة الدليل عبد الله بن أريقط نحو يثرب.",
    eventsCount: 2,
    historicalNote: "مسار ساحلي وصحراوي يقارب 450 كم لتفادي دوريات قريش.",
  },
  {
    id: "quba",
    nameAr: "قباء",
    nameEn: "Quba",
    period: "ربيع الأول 1 هـ (622م)",
    descriptionAr: "المحطة الأولى عند مشارف المدينة، وفيه أسس النبي ﷺ أول مسجد أُسس على التقوى في الإسلام.",
    eventsCount: 1,
    historicalNote: "الضاحية الجنوبية للمدينة المنورة.",
  },
  {
    id: "madinah",
    nameAr: "المدينة المنورة (يثرب)",
    nameEn: "Medina",
    period: "العهد المدني (622م - 632م)",
    descriptionAr: "دار الهجرة، عاصمة الدولة الأولى، موطن المسجد النبوي الشريف، ومستقر النبي ﷺ حتى وفاته.",
    eventsCount: 8,
    historicalNote: "واحة زراعية في الحجاز تحيط بها الحِرات البركانية وجبل أحد شمالاً وعير جنوباً.",
  },
  {
    id: "badr",
    nameAr: "بدر",
    nameEn: "Badr",
    period: "17 رمضان 2 هـ (624م)",
    descriptionAr: "موقع غزوة بدر الكبرى، يوم الفرقان الذي انتصر فيه الحق وأعز الله به المستضعفين.",
    eventsCount: 1,
    historicalNote: "محطة مياه وتجارة على بعد نحو 150 كم جنوب غرب المدينة المنورة.",
  },
  {
    id: "uhud",
    nameAr: "جبل أحد",
    nameEn: "Mount Uhud",
    period: "شوال 3 هـ (625م)",
    descriptionAr: "موقع معركة أحد، الجبل الذي قال عنه النبي ﷺ: «أُحُدٌ جَبَلٌ يُحِبُّنَا وَنُحِبُّهُ».",
    eventsCount: 1,
    historicalNote: "جبل شمال المدينة المنورة.",
  },
];

export default function SeerahPage() {
  const { depth } = useLearningDepth();
  const [selectedChapter, setSelectedChapter] = useState<SeerahChapter | null>(null);
  const [activeTab, setActiveTab] = useState<"chapters" | "timeline" | "battles" | "map" | "causes">("chapters");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<SourceProvenanceItem | null>(null);
  const [readingProgress, setReadingProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("seerah-reading-progress");
      if (saved) setReadingProgress(JSON.parse(saved));
    } catch {
      // Ignore
    }
  }, []);

  const handleSelectChapter = (ch: SeerahChapter) => {
    setSelectedChapter(ch);
    try {
      localStorage.setItem("last-reading-path", `/seerah`);
      localStorage.setItem("last-reading-title", ch.title);
      const updated = { ...readingProgress, [ch.id]: true };
      setReadingProgress(updated);
      localStorage.setItem("seerah-reading-progress", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const filteredChapters = searchQuery
    ? searchChapters(searchQuery)
    : seerahChapters;

  // Aggregate all timeline events across all chapters
  const allTimelineEvents = seerahChapters.flatMap((ch) =>
    (ch.timelineEvents || []).map((ev) => ({
      ...ev,
      chapterTitle: ch.title,
      chapterId: ch.id,
    }))
  );

  return (
    <InstitutionShell activeWing="prophetic-seerah">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
        {/* Header Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-900/40 text-white shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-tajawal text-emerald-300">
                  الرواق الثاني في الصرح النبوي
                </span>
                <span className="text-slate-500 text-xs">·</span>
                <span className="text-xs text-slate-300 font-mono">
                  {seerahChapters.length} فصول · {allTimelineEvents.length} محطة موثقة
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-amiri font-bold tracking-tight">
                درب السيرة النبوية الشريفة
              </h1>
              <p className="text-sm md:text-base font-tajawal text-slate-300 max-w-2xl leading-relaxed">
                استكشف السيرة العطرة لخير الأنام ﷺ عبر تسلسل زمني دقيق، وأطلس تضاريسي متحرك لغزوات النبي ﷺ، وخرائط للمواقع التاريخية، وشواهد موثقة من أمهات كتب الحديث والسير، خالية تماماً من أي تجسيد.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <LearningDepthSelector compact />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800 text-xs font-cairo">
            <button
              onClick={() => {
                setActiveTab("chapters");
                setSelectedChapter(null);
              }}
              className={cn(
                "px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold",
                activeTab === "chapters"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              )}
            >
              <BookOpen className="w-4 h-4" />
              <span>فصول السيرة ({seerahChapters.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("timeline");
                setSelectedChapter(null);
              }}
              className={cn(
                "px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold",
                activeTab === "timeline"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              )}
            >
              <Clock className="w-4 h-4" />
              <span>شريط التسلسل الزمني الكامل</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("battles");
                setSelectedChapter(null);
              }}
              className={cn(
                "px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold",
                activeTab === "battles"
                  ? "bg-amber-700 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              )}
            >
              <Mountain className="w-4 h-4 text-amber-300" />
              <span>أطلس الغزوات التضاريسي المتحرك</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("map");
                setSelectedChapter(null);
              }}
              className={cn(
                "px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold",
                activeTab === "map"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              )}
            >
              <Compass className="w-4 h-4" />
              <span>الجغرافيا والمسارات التاريخية</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("causes");
                setSelectedChapter(null);
              }}
              className={cn(
                "px-4 py-2 rounded-xl transition-colors flex items-center gap-2 font-semibold",
                activeTab === "causes"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-800/80 text-slate-300 hover:bg-slate-700"
              )}
            >
              <Layers className="w-4 h-4" />
              <span>خيط الأحداث والعلل</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            VIEW 1: SINGLE CHAPTER READER (WHEN SELECTED)
            ======================================================== */}
        {selectedChapter ? (
          <article className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-xs space-y-8">
            <div className="flex items-center justify-between border-b pb-4 text-xs font-tajawal text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedChapter(null)}
                className="font-cairo text-xs gap-1 text-emerald-700 dark:text-emerald-400"
              >
                <ChevronRight className="w-4 h-4" />
                العودة لقائمة الفصول
              </Button>
              <span className="font-mono">
                الفصل {selectedChapter.order} من {seerahChapters.length}
              </span>
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl md:text-4xl font-amiri font-bold text-foreground">
                {selectedChapter.title}
              </h2>
              <p className="text-sm font-cairo text-muted-foreground leading-relaxed">
                {selectedChapter.description}
              </p>
            </div>

            {/* Narrative text */}
            <div className="space-y-4 font-amiri text-lg md:text-xl leading-loose text-slate-800 dark:text-slate-200">
              {selectedChapter.details.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Chapter Timeline Events if present */}
            {selectedChapter.timelineEvents && selectedChapter.timelineEvents.length > 0 && (
              <div className="space-y-4 pt-6 border-t">
                <h3 className="font-cairo font-bold text-base text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  أبرز محطات هذا الفصل
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedChapter.timelineEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className="p-4 rounded-2xl border border-border/80 bg-slate-50 dark:bg-slate-800/50 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-tajawal text-muted-foreground">
                        <span className="font-mono">
                          {ev.date}
                        </span>
                        {ev.location && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-cairo">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {ev.location}
                          </span>
                        )}
                      </div>
                      <h4 className="font-cairo font-bold text-sm text-foreground">{ev.title}</h4>
                      <p className="text-xs text-muted-foreground font-tajawal leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source and Evidence Button */}
            <div className="pt-6 border-t flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedEvidence({
                    title: `توثيق الفصل: ${selectedChapter.title}`,
                    collectionNameAr: "سيرة ابن هشام، وصحيح البخاري، والبداية والنهاية لابن كثير",
                    compilerAr: "ابن هشام (ت 218 هـ) · الإمام البخاري (ت 256 هـ) · ابن كثير (ت 774 هـ)",
                    status: "editorial_review_pending",
                    chapterNameAr: selectedChapter.title,
                    textAr: selectedChapter.details.slice(0, 300) + "...",
                    provenanceDataset: "سجل السيرة النبوية المؤسسي — صرح يا رسول الله ﷺ v1.0",
                    reviewNote: "عرض تحريري أولي من بيانات المنصة؛ لم تُطابق الطبعة والصفحة وسند المراجعة لكل فقرة بعد، ولا يُعتمد بوصفه توثيقًا محققًا.",
                  })
                }
                className="font-cairo text-xs gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                الاطلاع على أصل التوثيق
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const next = seerahChapters.find((c) => c.order === selectedChapter.order + 1);
                    if (next) setSelectedChapter(next);
                  }}
                  disabled={selectedChapter.order >= seerahChapters.length}
                  className="font-cairo text-xs gap-1"
                >
                  الفصل التالي
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </article>
        ) : activeTab === "chapters" ? (
          /* ========================================================
             VIEW 2: CHAPTERS LIST
             ======================================================== */
          <div className="space-y-6">
            <div className="relative max-w-md">
              <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في فصول ومحطات السيرة..."
                className="pr-10 font-cairo text-sm h-11 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredChapters.map((ch) => {
                const isRead = readingProgress[ch.id];
                return (
                  <Card
                    key={ch.id}
                    onClick={() => handleSelectChapter(ch)}
                    className="p-6 rounded-3xl border-border/80 hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group bg-white dark:bg-slate-900 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-tajawal text-muted-foreground">
                        <span className="font-mono font-bold">
                          الفصل 0{ch.order}
                        </span>
                        {isRead && (
                          <span className="text-[11px] font-cairo text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            تمت القراءة
                          </span>
                        )}
                      </div>

                      <h3 className="font-amiri font-bold text-xl text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {ch.title}
                      </h3>

                      <p className="text-xs text-muted-foreground font-tajawal line-clamp-3 leading-relaxed">
                        {ch.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs font-cairo text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>قراءة الفصل والشواهد</span>
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : activeTab === "timeline" ? (
          /* ========================================================
             VIEW 3: COMPLETE CHRONOLOGICAL TIMELINE
             ======================================================== */
          <div className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-amiri font-bold text-foreground">
                التسلسل الزمني التاريخي لسيرة النبي ﷺ
              </h2>
              <p className="text-xs text-muted-foreground font-cairo">
                محطات موثقة من عام الفيل حتى حجة الوداع والوفاة
              </p>
            </div>

            <div className="relative border-r-2 border-emerald-600/30 pr-6 space-y-8 mr-3">
              {allTimelineEvents.map((ev, idx) => (
                <div key={ev.id} className="relative group">
                  {/* Timeline node */}
                  <div className="absolute -right-[31px] top-1 w-4 h-4 rounded-full bg-emerald-700 border-4 border-white dark:border-slate-900" />

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-border/80 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {ev.date}
                      </span>
                      <span className="text-xs text-muted-foreground font-cairo">
                        مرتبط بفصل: {ev.chapterTitle}
                      </span>
                    </div>

                    <h4 className="font-amiri font-bold text-lg text-foreground">{ev.title}</h4>
                    <p className="text-xs text-muted-foreground font-tajawal leading-relaxed">
                      {ev.description}
                    </p>

                    {ev.location && (
                      <div className="pt-2 flex items-center justify-between border-t text-[11px] text-muted-foreground font-cairo">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600" />
                          الموقع التاريخي: {ev.location}
                        </span>
                        <button
                          onClick={() => {
                            const ch = getChapterById(ev.chapterId);
                            if (ch) setSelectedChapter(ch);
                          }}
                          className="text-emerald-700 dark:text-emerald-400 hover:underline"
                        >
                          قراءة الفصل الكامل
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === "battles" ? (
          /* ========================================================
             VIEW: MOUNTAINOUS BATTLEFIELD CARTOGRAPHY ATLAS
             ======================================================== */
          <div className="space-y-6">
            <div className="p-6 bg-card rounded-3xl border border-border space-y-2">
              <div className="flex items-center gap-2">
                <Mountain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-xl font-amiri font-bold text-foreground">
                  أطلس الغزوات التضاريسي (رسم تعليمي)
                </h2>
              </div>
              <p className="text-xs text-muted-foreground font-tajawal leading-relaxed">
                خرائط تضاريسية جبلية ثلاثية الأبعاد لغزوات النبي ﷺ الكبرى، توضح طبيعة التضاريس (جبال، أودية، حرات، خنادق، آبار مياه) ومسارات الزحف والتحركات التكتيكية والمراحل العسكرية التاريخية دون أي تمثيل تصويري للمصطفى ﷺ.
                تنبيه منهجي: المسارات والمواضع رسوم توضيحية تعليمية تقريبية وليست إحداثيات مساحية؛ وكل مرحلة مشروحة نصيًا أسفل الرسم لغير القادرين على قراءة الخريطة.
              </p>
            </div>
            <MountainousBattlefieldMap />
          </div>
        ) : activeTab === "map" ? (
          /* ========================================================
             VIEW 4: HISTORICAL GEOGRAPHY & TOPOGRAPHY
             ======================================================== */
          <div className="space-y-6">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl font-amiri font-bold text-foreground">
                  جغرافيا السيرة والمسارات التاريخية
                </h2>
              </div>
              <p className="text-xs text-muted-foreground font-cairo leading-relaxed">
                تنويه تحقيقي: إحداثيات المواقع القديمة تقريبية ومستندة إلى معالم الحجاز ومرويات كتب المغازي (معجم البلدان لياقوت، وتاريخ الطبري) مع الحفاظ على الأمانة العلمية في تمييز الثابت من التقريبي.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {HISTORICAL_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation === loc.id;
                return (
                  <div
                    key={loc.id}
                    onClick={() => setSelectedLocation(isSelected ? null : loc.id)}
                    className={cn(
                      "p-5 rounded-2xl border transition-all cursor-pointer text-right space-y-3",
                      isSelected
                        ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                        : "bg-white dark:bg-slate-900 border-border hover:border-emerald-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {loc.period}
                      </span>
                      <Badge variant="outline" className="text-[10px] font-tajawal">
                        {loc.eventsCount} أحداث كبرى
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-amiri font-bold text-lg text-foreground flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        {loc.nameAr}
                      </h3>
                      <span className="text-[11px] text-muted-foreground font-mono block">
                        {loc.nameEn}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground font-tajawal leading-relaxed">
                      {loc.descriptionAr}
                    </p>

                    <div className="pt-2 border-t text-[11px] text-amber-800 dark:text-amber-400 font-cairo">
                      {loc.historicalNote}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ========================================================
             VIEW 5: CAUSE → EVENT → CONSEQUENCE (خيط الأحداث والعلل)
             ======================================================== */
          <div className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-border shadow-xs space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-amiri font-bold text-foreground">
                خيط الأحداث والعلل (السبب ↔ الواقعة ↔ الأثر)
              </h2>
              <p className="text-xs text-muted-foreground font-cairo">
                فهم السياق التاريخي دون تبسيط مخل: ما الذي أدى إلى الحدث، وماذا نتج عنه في ميزان بناء المجتمع.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  cause: "استمرار تعذيب المستضعفين بمكة واشتداد أذى قريش وموت أبي طالب وخديجة رضي الله عنها.",
                  event: "الهجرة النبوية الشريفة إلى يثرب (المدينة المنورة)",
                  consequence: "تأسيس الدولة المدنية الأولى، المؤاخاة، وإعلان وثيقة المدينة للمواطنة المتكافئة.",
                },
                {
                  cause: "استيلاء قريش على أموال المهاجرين وديارهم بمكة وطردهم ظلماً.",
                  event: "غزوة بدر الكبرى (يوم الفرقان)",
                  consequence: "كسر شوكة الظلم، تثبيت هيبة المجتمع الإسلامي الوليد، وحماية حقوق المستضعفين.",
                },
                {
                  cause: "حرص النبي ﷺ على حقن الدماء وإيقاف الحرب ولو بشروط تبدو قاسية في الظاهر.",
                  event: "صلح الحديبية (عام الهدنة والسلام)",
                  consequence: "اتساع انتشار الإسلام سلمياً بالحوار واللقاءات الحرة، ودخول أضعاف من دخلوا في سنوات الحرب.",
                },
                {
                  cause: "نقض قريش وحلفائها لبنود صلح الحديبية بالاعتداء على خزاعة حليفة المسلمين.",
                  event: "فتح مكة المكرمة الأكبر (العفو الشامل)",
                  consequence: "تطهير البيت الحرام من الأصنام، وإعلان العفو العام: «اذهبوا فأنتم الطلقاء».",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-border/80 bg-slate-50 dark:bg-slate-800/40 space-y-3 text-right"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 font-cairo">
                    <GitCommit className="w-4 h-4" />
                    <span>سلسلة السببية التاريخية {idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-cairo">
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1">
                      <span className="font-bold text-red-800 dark:text-red-400 block">السبب والسياق:</span>
                      <p className="text-muted-foreground leading-relaxed">{item.cause}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
                      <span className="font-bold text-amber-800 dark:text-amber-400 block">الحدث المفصلي:</span>
                      <p className="text-foreground font-semibold leading-relaxed">{item.event}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                      <span className="font-bold text-emerald-800 dark:text-emerald-400 block">الأثر والنتيجة:</span>
                      <p className="text-muted-foreground leading-relaxed">{item.consequence}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Source & Provenance Drawer */}
      <SourceDrawer
        isOpen={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        source={selectedEvidence}
        viewMode="seerah"
      />
    </InstitutionShell>
  );
}

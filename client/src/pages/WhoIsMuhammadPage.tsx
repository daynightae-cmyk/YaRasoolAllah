import React, { useState } from "react";
import { Link, useRoute } from "wouter";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import SourceDrawer, { SourceProvenanceItem } from "@/components/common/SourceDrawer";
import LearningDepthSelector, { useLearningDepth } from "@/components/Institution/LearningDepthSelector";
import { WHO_IS_MUHAMMAD_CHAPTERS, HumanityChapter } from "@/data/whoIsMuhammadData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Share2,
  CheckCircle2,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WhoIsMuhammadPage({ defaultChapterId }: { defaultChapterId?: string } = {}) {
  const [, params] = useRoute("/who-is-muhammad/:chapter");
  const { depth } = useLearningDepth();
  const [selectedEvidence, setSelectedEvidence] = useState<SourceProvenanceItem | null>(null);

  const activeChapterId = params?.chapter || defaultChapterId || WHO_IS_MUHAMMAD_CHAPTERS[0].id;
  const activeChapterIndex = WHO_IS_MUHAMMAD_CHAPTERS.findIndex(
    (c) => c.id === activeChapterId
  );
  // Unknown deep-link ids fall back to the first chapter AND say so openly
  // instead of silently pretending the requested chapter exists.
  const unknownChapterId =
    params?.chapter && activeChapterIndex === -1 ? params.chapter : null;
  const activeChapter =
    activeChapterIndex !== -1
      ? WHO_IS_MUHAMMAD_CHAPTERS[activeChapterIndex]
      : WHO_IS_MUHAMMAD_CHAPTERS[0];

  const prevChapter =
    activeChapterIndex > 0 ? WHO_IS_MUHAMMAD_CHAPTERS[activeChapterIndex - 1] : null;
  const nextChapter =
    activeChapterIndex < WHO_IS_MUHAMMAD_CHAPTERS.length - 1
      ? WHO_IS_MUHAMMAD_CHAPTERS[activeChapterIndex + 1]
      : null;

  return (
    <InstitutionShell activeWing="prophetic-seerah">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
        {unknownChapterId && (
          <div
            role="status"
            className="rounded-2xl border border-amber-500/40 bg-amber-50 p-4 text-sm font-tajawal text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
          >
            الفصل المطلوب «{unknownChapterId}» غير موجود — يُعرض الفصل الأول بدلًا منه.
          </div>
        )}
        {/* Header Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-l from-emerald-950/80 via-slate-900 to-slate-950 border border-amber-500/20 text-white space-y-4 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <div className="flex items-center gap-2">
                <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-xs font-tajawal">
                  مسار تعريفي جامع للإنسانية
                </Badge>
                <span className="text-xs text-slate-400 font-mono">{WHO_IS_MUHAMMAD_CHAPTERS.length} فصلًا تعريفيًا</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-amiri font-bold text-white tracking-tight leading-tight">
                من هو محمد بن عبد الله ﷺ؟
              </h1>
              <p className="text-sm md:text-base font-tajawal text-slate-300 leading-relaxed">
                رحلة استكشافية موجهة لكل إنسان باحث عن المعرفة المجردة، تعتمد الروايات المحققة والمصادر الأصلية دون أي تجسيد، وتكشف سيرة نبي الرحمة في سياقها التاريخي الحقيقي.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <LearningDepthSelector compact />
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar Chapter Rail + Active Chapter View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Chapter Navigation Rail (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-border/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-tajawal text-muted-foreground">
                  فصول الرحلة المعرفية
                </span>
                <span className="text-xs font-cairo font-bold text-emerald-700 dark:text-emerald-400">
                  الفصل {activeChapter.order} من {WHO_IS_MUHAMMAD_CHAPTERS.length}
                </span>
              </div>

              <div className="space-y-1.5 max-h-[70vh] overflow-y-auto pr-1">
                {WHO_IS_MUHAMMAD_CHAPTERS.map((ch) => {
                  const isActive = ch.id === activeChapter.id;
                  return (
                    <Link
                      key={ch.id}
                      href={`/who-is-muhammad/${ch.id}`}
                      className={cn(
                        "block p-3 rounded-xl transition-all text-right group",
                        isActive
                          ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 shadow-xs"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          0{ch.order}
                        </span>
                        <h4
                          className={cn(
                            "font-cairo text-sm font-bold",
                            isActive
                              ? "text-emerald-800 dark:text-emerald-300"
                              : "text-foreground group-hover:text-emerald-700"
                          )}
                        >
                          {ch.titleAr}
                        </h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-tajawal line-clamp-1 mt-0.5">
                        {ch.subtitleAr}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Chapter Reading Room (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            <article className="p-6 md:p-10 bg-white dark:bg-slate-900 rounded-3xl border border-border/80 shadow-xs space-y-8">
              {/* Chapter Header */}
              <div className="space-y-3 border-b pb-6">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs font-mono">
                    الفصل {activeChapter.order} • {activeChapter.titleEn}
                  </Badge>
                  <div className="flex items-center gap-2">
                    {activeChapter.valuesHighlighted.map((val) => (
                      <Badge key={val} variant="secondary" className="text-[11px] font-tajawal">
                        {val}
                      </Badge>
                    ))}
                  </div>
                </div>

                <h2 className="text-2xl md:text-4xl font-amiri font-bold text-foreground">
                  {activeChapter.titleAr}
                </h2>
                <p className="text-sm font-cairo text-amber-700 dark:text-amber-400 font-semibold">
                  {activeChapter.subtitleAr}
                </p>
              </div>

              {/* Beginner / Discover Summary Card */}
              <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold font-cairo text-amber-900 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>الموجز الميسر (مستوى الاستكشاف):</span>
                </div>
                <p className="text-sm font-cairo text-foreground leading-relaxed">
                  {activeChapter.summaryAr}
                </p>
                <p className="text-xs font-tajawal text-muted-foreground border-t border-amber-500/20 pt-2" dir="ltr">
                  {activeChapter.summaryEn}
                </p>
              </div>

              {/* Full Narrative Text */}
              <div className="space-y-4 font-amiri text-lg md:text-xl leading-loose text-slate-800 dark:text-slate-200">
                {activeChapter.fullNarrativeAr.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {/* Historical Context Note */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 text-xs font-cairo space-y-1">
                <span className="font-bold text-muted-foreground block">السياق التاريخي والجغرافي:</span>
                <p className="text-foreground">{activeChapter.historicalContextAr}</p>
              </div>

              {/* Primary Sources & Evidence Panel (Section 22C) */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-cairo font-bold text-base flex items-center gap-2 text-foreground">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    الشواهد والوثائق من أمهات المصادر
                  </h3>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    لا اجتهاد مع النص
                  </span>
                </div>

                <div className="space-y-3">
                  {activeChapter.coreEvidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2 text-right"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="text-[10px] bg-emerald-700">
                          {ev.status === "verified" ? "توثيق معتمد" : "رواية تاريخية"}
                        </Badge>
                        <span className="text-xs font-mono text-muted-foreground">
                          {ev.compilerOrWork} ({ev.reference})
                        </span>
                      </div>
                      <p className="font-amiri text-lg text-emerald-950 dark:text-emerald-200 leading-relaxed font-semibold">
                        {ev.textAr}
                      </p>
                      <p className="text-xs text-muted-foreground font-inter" dir="ltr">
                        "{ev.textEn}"
                      </p>
                      <div className="pt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedEvidence({
                              title: `شاهد الفصل ${activeChapter.order}: ${activeChapter.titleAr}`,
                              collectionOrWork: ev.compilerOrWork,
                              referenceNumber: ev.reference,
                              originalText: ev.textAr,
                              translationExcerpt: ev.textEn,
                              status: ev.status,
                              provenanceDataset: "سجل الروايات الصحيحة المعتمدة",
                            })
                          }
                          className="text-xs font-cairo gap-1.5 text-emerald-800 dark:text-emerald-300"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          عرض توثيق الأثر في خزانة المصادر
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quran Connections if present */}
              {activeChapter.quranConnections && activeChapter.quranConnections.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h3 className="font-cairo font-bold text-base flex items-center gap-2 text-foreground">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                    شواهد الذكر الحكيم ذات الصلة
                  </h3>
                  {activeChapter.quranConnections.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-center space-y-2"
                    >
                      <p className="font-amiri text-xl text-foreground font-bold">
                        «{q.textAr}»
                      </p>
                      <span className="text-xs font-tajawal text-amber-800 dark:text-amber-400 block font-semibold">
                        [سورة {q.surahNameAr}، الآية {q.ayahNumber}]
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation Actions (Prev / Next Chapter) */}
              <div className="pt-8 border-t flex items-center justify-between">
                {prevChapter ? (
                  <Link href={`/who-is-muhammad/${prevChapter.id}`} asChild>
                    <Button variant="outline" className="font-cairo rounded-xl gap-2 text-xs">
                      <ChevronRight className="w-4 h-4" />
                      <span>السابق: {prevChapter.titleAr}</span>
                    </Button>
                  </Link>
                ) : (
                  <div />
                )}

                {nextChapter ? (
                  <Link href={`/who-is-muhammad/${nextChapter.id}`} asChild>
                    <Button className="bg-emerald-700 hover:bg-emerald-600 text-white font-cairo rounded-xl gap-2 text-xs font-bold">
                      <span>التالي: {nextChapter.titleAr}</span>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/seerah" asChild>
                    <Button className="bg-amber-600 hover:bg-amber-500 text-white font-cairo rounded-xl gap-2 text-xs font-bold">
                      <span>الانتقال إلى درب السيرة الكامل</span>
                      <Compass className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </article>
          </div>
        </div>
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

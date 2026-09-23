import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import LearningDepthSelector, { useLearningDepth } from "@/components/Institution/LearningDepthSelector";
import EvidenceDrawer, { EvidenceSource } from "@/components/Institution/EvidenceDrawer";
import { BRAND, INSTITUTION_WINGS } from "@/config/brand";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { seerahChapters } from "@/data/seerahData";
import booksData from "@/data/books.json";
import {
  Sparkles,
  Compass,
  BookOpen,
  Feather,
  Library,
  Baby,
  Sun,
  ShieldCheck,
  Heart,
  ArrowLeft,
  ChevronLeft,
  Bookmark,
  Calendar,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function GateOfLightPage() {
  const { depth } = useLearningDepth();
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);
  const [lastVisitedPath, setLastVisitedPath] = useState<string | null>(null);
  const [lastVisitedTitle, setLastVisitedTitle] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedPath = localStorage.getItem("last-reading-path");
      const savedTitle = localStorage.getItem("last-reading-title");
      if (savedPath && savedTitle) {
        setLastVisitedPath(savedPath);
        setLastVisitedTitle(savedTitle);
      }
    } catch {
      // Ignore
    }
  }, []);

  // First 4 real Seerah chapters for highlights
  const seerahTeaser = seerahChapters.slice(0, 4);

  // Books categories from authentic books.json
  const categories = (booksData as any).categories || [];
  const books = (booksData as any).books || [];

  return (
    <InstitutionShell activeWing="gate-of-light">
      <div className="space-y-16 py-6 md:py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================
            HERO SECTION — بوابـــــة النــــور
            ======================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 border border-emerald-900/40 p-8 md:p-14 text-white shadow-2xl text-right">
          {/* Subtle Islamic geometric pattern background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-6 text-center">
            {/* Sacred Prophetic Emblem */}
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 mb-2 shadow-inner">
              <span className="font-amiri font-bold text-3xl md:text-4xl leading-none">
                ﷺ
              </span>
            </div>

            <div className="space-y-3">
              <span className="inline-block text-xs md:text-sm font-tajawal uppercase tracking-widest text-amber-300 font-semibold">
                الصرح الرقمي العالمي للسيرة النبوية والقرآن والسنة
              </span>
              <h1 className="text-4xl md:text-6xl font-amiri font-bold text-white tracking-tight leading-tight">
                {BRAND.name.ar}
              </h1>
              <p className="text-base md:text-xl font-tajawal text-slate-300 max-w-2xl mx-auto leading-relaxed">
                {BRAND.tagline.ar}
              </p>
            </div>

            {/* Depth Mode Indicator */}
            <div className="pt-2 flex items-center justify-center">
              <LearningDepthSelector />
            </div>

            {/* Direct Entry Actions - One Dominant Focal Anchor + Secondary Guides */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <Link href="/who-is-muhammad" asChild>
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-cairo font-bold rounded-2xl shadow-lg hover:shadow-amber-500/20 px-8 h-12 text-sm sm:text-base gap-2.5 transition-all"
                >
                  <Heart className="w-5 h-5 text-red-800" />
                  <span>ابدأ رحلة «من هو محمد ﷺ؟» (مدخل للإنسانية)</span>
                </Button>
              </Link>

              <Link href="/prophetic-day" asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-emerald-950/60 hover:bg-emerald-900/80 border-emerald-500/40 text-emerald-200 font-cairo font-semibold rounded-2xl px-6 h-12 text-sm gap-2"
                >
                  <Sun className="w-4 h-4 text-amber-300" />
                  <span>24 ساعة في رحاب الهدي النبوي</span>
                </Button>
              </Link>

              <Link href="/sunnah" asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-slate-900/60 hover:bg-slate-800/80 border-slate-700 text-slate-300 font-cairo rounded-2xl px-6 h-12 text-sm gap-2"
                >
                  <Feather className="w-4 h-4 text-cyan-300" />
                  <span>دار الحديث الشريف</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            REAL CONTINUATION PANEL — "أين أنت في الرحلة؟"
            ======================================================== */}
        {lastVisitedPath ? (
          <section className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-right">
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-tajawal text-muted-foreground block">
                  متابعة من حيث توقفت:
                </span>
                <span className="font-cairo font-bold text-sm text-foreground">
                  {lastVisitedTitle || "محطة السيرة"}
                </span>
              </div>
            </div>
            <Link href={lastVisitedPath} asChild>
              <Button size="sm" className="bg-emerald-700 hover:bg-emerald-600 text-white font-cairo rounded-xl gap-1.5">
                متابعة القراءة
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </section>
        ) : (
          <section className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-border/80 flex items-center justify-between text-right">
            <div className="flex items-center gap-3">
              <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs font-cairo text-muted-foreground">
                ابدأ رحلتك المعرفية الآن في السيرة النبوية أو اختر رواقاً للتعلم. سجل قراءاتك يحفظ محلياً بخصوصية تامة.
              </p>
            </div>
            <Link href="/who-is-muhammad" asChild>
              <Button variant="ghost" size="sm" className="text-xs font-cairo gap-1 text-emerald-700 dark:text-emerald-400">
                ابدأ من الفصل الأول
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
          </section>
        )}

        {/* ========================================================
            FLAGSHIP JOURNEY BANNER: "من هو محمد بن عبد الله ﷺ؟"
            ======================================================== */}
        <section className="rounded-3xl p-8 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/30 text-right space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <Badge className="bg-amber-600/20 text-amber-900 dark:text-amber-300 hover:bg-amber-600/30 text-xs font-tajawal">
                رحلة إنسانية موثقة لجميع القراء
              </Badge>
              <h2 className="text-2xl md:text-3xl font-amiri font-bold text-foreground">
                من هو محمد بن عبد الله ﷺ؟
              </h2>
              <p className="text-sm font-cairo text-muted-foreground leading-relaxed">
                مدخل منهجي يخاطب كل إنسان باحث عن الحقيقة: سياق نشأته، أخلاقه قبل البعثة، رسالته الإنسانية الكبرى، تعامله مع الضعفاء والأسرة والخصوم، مع إبراز نصوص الشواهد التاريخية والمصادر المعتمدة دون أي تجسيد.
              </p>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row gap-2">
              <Link href="/who-is-muhammad" asChild>
                <Button size="lg" className="bg-emerald-800 hover:bg-emerald-700 text-white font-cairo font-bold rounded-2xl gap-2 px-6">
                  استكشف الفصول الـ 15
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/character" asChild>
                <Button variant="outline" size="lg" className="font-cairo rounded-2xl">
                  موسوعة الشمائل والقيم
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================
            THE SEVEN INSTITUTIONAL WINGS — أروقة الصرح
            ======================================================== */}
        <section className="space-y-6 text-right">
          <div className="space-y-1">
            <span className="text-xs font-tajawal text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
              الهيكل المكاني للصرح الرقمي
            </span>
            <h2 className="text-2xl font-amiri font-bold text-foreground">
              أروقة المعرفة السبعة
            </h2>
            <p className="text-xs text-muted-foreground font-cairo">
              تنظيم مؤسسي متكامل يجمع النص الأصلي، والشرح المحقق، والأرفف التراثية، والبيئة الآمنة للأسرة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INSTITUTION_WINGS.filter((w) => w.id !== "gate-of-light").map((wing) => (
              <Link key={wing.id} href={wing.path}>
                <Card className="h-full rounded-2xl border-border/80 hover:border-emerald-600 dark:hover:border-emerald-500 hover:shadow-md transition-all group cursor-pointer bg-white/70 dark:bg-slate-900/60">
                  <CardContent className="p-5 space-y-3 text-right">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-tajawal">
                      <span className="font-mono font-bold">
                        رواق {wing.number}
                      </span>
                      {wing.badge && (
                        <span>
                          {wing.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-amiri font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {wing.nameAr}
                      </h3>
                      <p className="text-xs text-muted-foreground font-cairo line-clamp-2 mt-1 leading-relaxed">
                        {wing.taglineAr}
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-between text-xs font-cairo text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>دخول الرواق</span>
                      <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ========================================================
            SEERAH HIGHLIGHTS — من درب السيرة
            ======================================================== */}
        <section className="space-y-6 text-right">
          <div className="flex items-center justify-between">
            <Link href="/seerah" asChild>
              <Button variant="ghost" size="sm" className="font-cairo text-xs gap-1">
                عرض كامل المحطات
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-amiri font-bold text-foreground">
                محطات خالدة من السيرة النبوية
              </h2>
              <p className="text-xs text-muted-foreground font-cairo">
                محطات من السيرة النبوية — حالة المراجعة موضحة في بطاقة مصدر كل محطة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {seerahTeaser.map((ch, idx) => (
              <div
                key={ch.id}
                className="p-5 rounded-2xl border border-border/80 bg-white dark:bg-slate-900/80 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-tajawal text-muted-foreground">
                    <span className="font-mono">
                      المحطة {idx + 1}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedEvidence({
                          title: ch.title,
                          collectionOrWork: "سيرة ابن هشام والبداية والنهاية لابن كثير",
                          status: "editorial_review_pending",
                          chapter: ch.title,
                          originalText: ch.details.slice(0, 200) + "...",
                          provenanceDataset: "سجل السيرة النبوية المعتمدة",
                          reviewNote: "سجل تعريفي من بيانات العرض؛ لم تُطابق الطبعة والصفحة وسند المراجعة بعد.",
                        })
                      }
                      className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 font-cairo"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      المصدر
                    </button>
                  </div>
                  <h3 className="font-amiri font-bold text-lg text-foreground">{ch.title}</h3>
                  <p className="text-xs text-muted-foreground font-tajawal line-clamp-3 leading-relaxed">
                    {ch.description}
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <Link href="/seerah" asChild>
                    <Button variant="ghost" size="sm" className="w-full text-xs font-cairo justify-between">
                      <span>قراءة التفاصيل والخرائط</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            LIVING SHELVES TEASER — مكتبة الرفوف
            ======================================================== */}
        <section className="space-y-6 text-right">
          <div className="flex items-center justify-between">
            <Link href="/library" asChild>
              <Button variant="ghost" size="sm" className="font-cairo text-xs gap-1">
                تصفح الأرفف الكاملة ({books.length} كتاباً)
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-amiri font-bold text-foreground">
                مكتبة الرفوف الرقمية
              </h2>
              <p className="text-xs text-muted-foreground font-cairo">
                أرفف منظمة تحاكي تجربة التصفح في خزانة الكتب التراثية
              </p>
            </div>
          </div>

          {/* Render 3 Top Shelves */}
          <div className="space-y-6">
            {categories.slice(0, 3).map((cat: any) => {
              const catBooks = books.filter((b: any) => b.category === cat.id).slice(0, 5);
              return (
                <div
                  key={cat.id}
                  className="p-6 rounded-3xl bg-amber-950/5 dark:bg-amber-950/20 border border-amber-900/15 dark:border-amber-500/15 space-y-4"
                >
                  <div className="flex items-center justify-between">
                      <span className="text-xs font-tajawal text-muted-foreground">
                        {catBooks.length} كتب في الفهرس
                      </span>
                    <div className="flex items-center gap-2">
                      <h3 className="font-amiri font-bold text-lg text-foreground">{cat.name}</h3>
                      <Library className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    </div>
                  </div>

                  {/* Visual Shelf Line */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                    {catBooks.map((book: any) => (
                      <Link key={book.id} href="/library">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-border/80 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all group text-right flex flex-col justify-between h-36 cursor-pointer">
                          <div>
                            <span className="text-[10px] font-mono text-muted-foreground block mb-1">
                              {book.pages || 0} ص
                            </span>
                            <h4 className="font-cairo font-bold text-xs text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 line-clamp-2">
                              {book.title}
                            </h4>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-tajawal line-clamp-1 border-t pt-1">
                            {book.author}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {/* Shelf bottom wood ledge */}
                  <div className="h-2 rounded-full bg-amber-900/30 dark:bg-amber-700/40 mt-2 shadow-inner" />
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================
            DAR AL-HADITH & SUNNAH TEASER — دار الحديث
            ======================================================== */}
        <section className="rounded-3xl p-8 bg-slate-900 text-white border border-slate-800 space-y-6 text-right">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge className="bg-cyan-900/50 text-cyan-200 border-cyan-700/50 text-xs font-tajawal">
                الكتب الستة والأسانيد المحققة
              </Badge>
              <h2 className="text-2xl md:text-3xl font-amiri font-bold">
                دار الحديث النبوي الشريف
              </h2>
              <p className="text-xs text-slate-400 font-cairo">
                منهج علمي صارم في عرض الأحاديث مع تصنيف درجات الصحة، وبيان الرواة، والربط العضوي بأحداث السيرة، مع حظر كامل للأحاديث الموضوعة والمختلقة.
                الأعداد أدناه أحجام المدونات الست المعتمدة عالميًا؛ التغطية النصية المحلية المعروضة حاليًا عينة قيد الإدخال والمراجعة.
              </p>
            </div>
            <Link href="/sunnah" asChild>
              <Button size="lg" className="bg-cyan-700 hover:bg-cyan-600 text-white font-cairo font-bold rounded-2xl gap-2 shrink-0">
                ادخل دار الحديث
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: "صحيح البخاري", count: "7563 حديثاً", icon: "الجامع المسند" },
              { name: "صحيح مسلم", count: "3033 حديثاً", icon: "المسند الصحيح" },
              { name: "سنن أبي داود", count: "5274 حديثاً", icon: "السنن الفقهية" },
              { name: "جامع الترمذي", count: "3956 حديثاً", icon: "العلل والأحكام" },
              { name: "سنن النسائي", count: "5758 حديثاً", icon: "المجتبى" },
              { name: "سنن ابن ماجه", count: "4341 حديثاً", icon: "السنن" },
            ].map((col) => (
              <div
                key={col.name}
                className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 text-center space-y-1"
              >
                <span className="text-[10px] text-cyan-400 font-mono block">{col.icon}</span>
                <h4 className="font-amiri font-bold text-base text-slate-100">{col.name}</h4>
                <span className="text-[11px] text-slate-400 font-tajawal">{col.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================
            DAILY SANCTUARY TEASER — محراب اليوم
            ======================================================== */}
        <section className="p-6 rounded-3xl border border-emerald-600/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-right space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-amiri font-bold text-xl text-foreground">
                محراب اليوم والهدي اليومي
              </h3>
              <p className="text-xs text-muted-foreground font-cairo">
                أوقات الصلاة الدقيقة، أذكار الصباح والمساء، المسبحة الرقمية، والتقويم الهجري الشريف.
              </p>
            </div>
            <Link href="/daily" asChild>
              <Button className="bg-emerald-700 hover:bg-emerald-600 text-white font-cairo rounded-xl gap-2">
                <Sun className="w-4 h-4" />
                فتح محراب اليوم
              </Button>
            </Link>
          </div>
        </section>
      </div>

      {/* Evidence Modal */}
      <EvidenceDrawer
        isOpen={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        evidence={selectedEvidence}
      />
    </InstitutionShell>
  );
}

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
import { workRegistry } from "@shared/knowledge-registry";
import WingCorridor from "@/components/Homepage/WingCorridor";
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

  const categories = [
    { id: "seerah", name: "السيرة" },
    { id: "tafsir", name: "التفسير" },
    { id: "hadith", name: "الحديث" },
  ] as const;
  const books = workRegistry;

  return (
    <InstitutionShell activeWing="gate-of-light">
      <div className="gate-page space-y-16 pb-10 max-w-[92rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ========================================================
            HERO SECTION — بوابـــــة النــــور
            ======================================================== */}
        <section className="gate-stage" aria-labelledby="gate-title">
          <div className="gate-stage__light" aria-hidden="true" />
          <div className="gate-stage__arch" aria-hidden="true" />
          <div className="gate-stage__content">
            <div className="gate-stage__intro">
              <div className="gate-seal" aria-label="صلى الله عليه وسلم"><span>ﷺ</span></div>
              <p className="gate-stage__eyebrow">صرح رقمي للسيرة النبوية والقرآن والسنة</p>
              <h1 id="gate-title">{BRAND.name.ar}</h1>
              <p className="gate-stage__tagline">{BRAND.tagline.ar}</p>
              <div className="gate-stage__rule" aria-hidden="true"><span /></div>
              <p className="gate-stage__invitation">
                ادخل من سيرة الإنسان والرسول ﷺ، ثم سر بين النص، والرواية، والمكان،
                والمصدر بطمأنينة الباحث وأمانة المؤسسة.
              </p>
              <div className="gate-stage__actions">
                <Link href="/who-is-muhammad" className="gate-primary-journey">
                  <Heart className="h-5 w-5" />
                  <span><small>الرحلة الأساسية</small>من هو محمد ﷺ؟</span>
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="gate-stage__depth"><LearningDepthSelector /></div>
              </div>
            </div>

            <nav className="gate-stage__portals" aria-label="مداخل المعرفة">
              <Link href="/seerah" className="gate-portal gate-portal--seerah">
                <Compass className="h-5 w-5" /><span><small>السرد والمكان</small>درب السيرة</span><ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/quran" className="gate-portal gate-portal--quran">
                <BookOpen className="h-5 w-5" /><span><small>قراءة هادئة</small>رِواق القرآن</span><ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/sunnah" className="gate-portal gate-portal--hadith">
                <Feather className="h-5 w-5" /><span><small>الرواية والدرجة</small>دار الحديث</span><ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/library" className="gate-portal gate-portal--library">
                <Library className="h-5 w-5" /><span><small>الأعمال والنسخ</small>مكتبة الرفوف</span><ArrowLeft className="h-4 w-4" />
              </Link>
              <Link href="/prophetic-day" className="gate-portal gate-portal--daily">
                <Sun className="h-5 w-5" /><span><small>تأمل وتطبيق</small>محراب اليوم</span><ArrowLeft className="h-4 w-4" />
              </Link>
            </nav>
          </div>
          <div className="gate-stage__foundation" aria-hidden="true"><span>معرفة</span><span>سكينة</span><span>كرامة</span><span>اكتشاف</span></div>
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

          <WingCorridor />
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
                تصفح الأرفف الكاملة ({books.length} سجل عمل)
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
            {categories.map((cat) => {
              const catBooks = books.filter((work) => work.category === cat.id).slice(0, 5);
              return (
                <div
                  key={cat.id}
                  className="p-6 rounded-3xl bg-amber-950/5 dark:bg-amber-950/20 border border-amber-900/15 dark:border-amber-500/15 space-y-4"
                >
                  <div className="flex items-center justify-between">
                      <span className="text-xs font-tajawal text-muted-foreground">
                        {catBooks.length} أعمال في الفهرس
                      </span>
                    <div className="flex items-center gap-2">
                      <h3 className="font-amiri font-bold text-lg text-foreground">{cat.name}</h3>
                      <Library className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    </div>
                  </div>

                  {/* Visual Shelf Line */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-2">
                    {catBooks.map((book) => (
                      <Link key={book.workId} href="/library">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-border/80 hover:border-emerald-600 shadow-xs hover:shadow-md transition-all group text-right flex flex-col justify-between h-36 cursor-pointer">
                          <div>
                            <span className="text-[10px] font-mono text-muted-foreground block mb-1">
                              {book.openitiWorkUri ?? "catalog-only"}
                            </span>
                            <h4 className="font-cairo font-bold text-xs text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400 line-clamp-2">
                              {book.titleAr}
                            </h4>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-tajawal line-clamp-1 border-t pt-1">
                            {book.authorAr}
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
                أعمال مفهرسة · عينات قيد المراجعة
              </Badge>
              <h2 className="text-2xl md:text-3xl font-amiri font-bold">
                دار الحديث النبوي الشريف
              </h2>
              <p className="text-xs text-slate-400 font-cairo">
                جناح أرشيفي يفصل بين الرواية، والعمل، والحكم، ومصدر الحكم، والمقيّم،
                وحالة المراجعة. لا Corpus خارجي منشور ولا اتصال API حاليًا.
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
              { name: "صحيح البخاري", count: "فهرس عمل", icon: "OpenITI · مراجعة" },
              { name: "صحيح مسلم", count: "فهرس عمل", icon: "OpenITI · مراجعة" },
              { name: "سنن أبي داود", count: "سجل ببليوغرافي", icon: "Corpus غير متصل" },
              { name: "جامع الترمذي", count: "سجل ببليوغرافي", icon: "Corpus غير متصل" },
              { name: "سنن النسائي", count: "سجل ببليوغرافي", icon: "Corpus غير متصل" },
              { name: "سنن ابن ماجه", count: "سجل ببليوغرافي", icon: "Corpus غير متصل" },
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
                 مواقيت مع طريقة الحساب الظاهرة، وأداة ذكر محلية. نصوص الأذكار متوقفة حتى اكتمال المصدر والدرجة والمراجعة.
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

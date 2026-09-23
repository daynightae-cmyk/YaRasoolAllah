import React, { useState } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import SourceDrawer, { SourceProvenanceItem } from "@/components/common/SourceDrawer";
import LearningDepthSelector, { useLearningDepth } from "@/components/Institution/LearningDepthSelector";
import { HADITH_COLLECTIONS, INITIAL_VERIFIED_HADITHS, HadithCollection, HadithRecord } from "@/data/hadithData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Feather,
  ShieldCheck,
  Search,
  BookOpen,
  Bookmark,
  Share2,
  ChevronLeft,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SunnahPage() {
  const { depth } = useLearningDepth();
  const [selectedCollection, setSelectedCollection] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<SourceProvenanceItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHadiths = INITIAL_VERIFIED_HADITHS.filter((h) => {
    const matchesCol = selectedCollection === "all" || h.collectionId === selectedCollection;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      h.textAr.toLowerCase().includes(q) ||
      h.textEn.toLowerCase().includes(q) ||
      h.narratorAr.toLowerCase().includes(q) ||
      h.bookNameAr.toLowerCase().includes(q);
    return matchesCol && matchesQuery;
  });

  const handleCopy = (id: string, text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <InstitutionShell activeWing="dar-al-hadith">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
        {/* Header Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-cyan-950 via-slate-900 to-slate-950 border border-cyan-800/40 text-white shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-tajawal text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span className="font-semibold">الرواق الرابع في الصرح</span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300 font-mono">
                  الكتب الستة والأسانيد المحققة
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-amiri font-bold tracking-tight">
                دار الحديث وصحيح السنّة
              </h1>
              <p className="text-sm md:text-base font-tajawal text-slate-300 leading-relaxed">
                منظومة موثقة لكلمات وتوجيهات النبي ﷺ مع بيان درجات الصحة، وأسماء الرواة، والربط الموضوعي بأحداث السيرة والقرآن الكريم، مع حظر كامل للأحاديث الموضوعة والمختلقة.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <LearningDepthSelector compact />
            </div>
          </div>
        </div>

        {/* The Six Canonical Collections Shelf */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tajawal text-muted-foreground">
              أصول دواوين السنة النبوية المعتمدة
            </span>
            <h2 className="text-xl font-amiri font-bold text-foreground">
              الكتب الستة الجامعة
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HADITH_COLLECTIONS.map((col) => {
              const isSelected = selectedCollection === col.id;
              return (
                <div
                  key={col.id}
                  onClick={() => setSelectedCollection(isSelected ? "all" : col.id)}
                  className={cn(
                    "p-5 rounded-2xl border transition-all cursor-pointer text-right space-y-3",
                    isSelected
                      ? "bg-cyan-500/10 border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/30"
                      : "bg-white dark:bg-slate-900 border-border hover:border-cyan-600/50"
                  )}
                >
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-tajawal">
                    <span className="font-mono">
                      توفي {col.deathHijri} هـ
                    </span>
                    <span className="font-mono font-bold text-cyan-700 dark:text-cyan-400">
                      {col.totalHadithCount} حديثاً
                    </span>
                  </div>

                  <div>
                    <h3 className="font-amiri font-bold text-lg text-foreground">
                      {col.nameAr}
                    </h3>
                    <span className="text-xs text-muted-foreground font-cairo block">
                      {col.compiler}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground font-tajawal line-clamp-2 leading-relaxed">
                    {col.descriptionAr}
                  </p>

                  <div className="pt-2 border-t border-border text-[11px] font-cairo text-cyan-700 dark:text-cyan-400 flex items-center justify-between font-semibold">
                    <span>{isSelected ? "إلغاء التصفية" : "تصفية حسب الكتاب"}</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Editorial Integrity Notice */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-cairo flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-900 dark:text-amber-200 block mb-0.5">
              ميثاق النزاهة الحديثية والأمانة العلمية:
            </span>
            <p className="text-muted-foreground leading-relaxed">
              تُعرض نصوص الأحاديث مع بيان المصدر والراوي ودرجة الحديث ومصدر الحكم. التغطية النصية المحلية حاليًا عينة أولية من الكتب الستة، وتُستكمل تدريجيًا مع مراجعة الأسانيد وحظر أي مرويات ضعيفة أو موضوعة دون بيان درجتها.
            </p>
          </div>
        </div>

        {/* Search Bar & Result Counts */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في نص الحديث، الراوي، أو الباب..."
              className="pr-10 font-cairo text-xs h-11 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-tajawal text-muted-foreground self-start sm:self-auto">
            <span>المعروض:</span>
            <span className="font-mono font-bold text-foreground">{filteredHadiths.length}</span>
            <span>حديثاً ببيان درجته ومصدر الحكم</span>
            {selectedCollection !== "all" && (
              <button
                type="button"
                onClick={() => setSelectedCollection("all")}
                className="text-cyan-700 dark:text-cyan-400 hover:underline mr-2"
              >
                (عرض جميع الكتب)
              </button>
            )}
          </div>
        </div>

        {/* Authenticated Hadith List */}
        <div className="space-y-4">
          {filteredHadiths.map((item) => (
            <article
              key={item.id}
              className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-border shadow-xs space-y-4 text-right"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2 text-xs font-tajawal">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 inline" />
                    {item.gradeAr}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-muted-foreground font-cairo">
                    {item.bookNameAr} · {item.chapterNameAr}
                  </span>
                </div>

                <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                  حديث #{item.hadithNumber}
                </span>
              </div>

              {/* Narrator */}
              <div className="text-xs font-cairo text-muted-foreground">
                <span className="font-bold text-foreground">راوي الحديث: </span>
                {item.narratorAr}
              </div>

              {/* Prophetic Text */}
              <p className="font-amiri text-xl md:text-2xl leading-relaxed text-foreground font-semibold py-2">
                {item.textAr}
              </p>

              {/* English translation */}
              <div
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-border text-xs text-muted-foreground font-inter"
                dir="ltr"
              >
                "{item.textEn}"
              </div>

              {/* Metadata Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-cairo">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        item.id,
                        `قال رسول الله ﷺ: "${item.textAr}" [${item.bookNameAr} - ${item.chapterNameAr} - ${item.gradeAr}]`
                      )
                    }
                    className="h-8 px-2.5 text-xs font-cairo gap-1"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الحديث</span>
                      </>
                    )}
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const collection = HADITH_COLLECTIONS.find(
                      (c) => c.id === item.collectionId,
                    );
                    setSelectedEvidence({
                      title: `حديث رقم ${item.hadithNumber} — ${item.bookNameAr}`,
                      collectionNameAr: collection
                        ? `${collection.nameAr} — ${item.bookNameAr}`
                        : item.bookNameAr,
                      compilerAr: collection?.compiler ?? "غير محدد في سجل المصدر",
                      compilerDeathHijri: collection?.deathHijri,
                      // Narrator (ruler of the report) is distinct from the
                      // compiler (author of the collection) and is kept here.
                      isnadChainAr: `راوي الحديث: ${item.narratorAr}`,
                      referenceNumber: `HADITH-${item.hadithNumber}`,
                      textAr: item.textAr,
                      textEn: item.textEn,
                      status: "verified",
                      hadithGrade: item.gradeAr,
                      gradeAssessor: item.gradeSource,
                      chapterNameAr: item.chapterNameAr,
                      provenanceDataset: item.provenance || "صحيح السنة النبوية — صرح يا رسول الله ﷺ",
                      reviewNote: "بيانات الطبعة والمقابلة الخطية غير مسجلة على مستوى هذا العنصر؛ الاعتماد الحالي على نص الحديث ودرجته ومصدر الحكم فقط.",
                    });
                  }}
                  className="text-xs text-amber-700 dark:text-amber-400 gap-1 font-cairo"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  توثيق المصدر والإسناد
                </Button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <SourceDrawer
        isOpen={!!selectedEvidence}
        onClose={() => setSelectedEvidence(null)}
        source={selectedEvidence}
        viewMode="hadith"
      />
    </InstitutionShell>
  );
}

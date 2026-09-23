import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import EvidenceDrawer, { EvidenceSource } from "@/components/Institution/EvidenceDrawer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";
import {
  getQuranChapters,
  getQuranVerse,
  getTafsir,
  type QuranChapter,
  type QuranVerse,
} from "@/services/quranService";
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Headphones,
  Scroll,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Check,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TafsirScholar {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  compiler: string;
}

const tafsirScholars: TafsirScholar[] = [
  {
    id: "ibn-kathir",
    name: "Ibn Kathir",
    arabicName: "تفسير ابن كثير",
    description: "تفسير القرآن العظيم للإمام الحافظ ابن كثير رحمه الله",
    compiler: "ابن كثير (ت 774هـ)",
  },
  {
    id: "tabari",
    name: "Al-Tabari",
    arabicName: "تفسير الطبري",
    description: "جامع البيان عن تأويل آي القرآن للإمام ابن جرير الطبري",
    compiler: "الإمام الطبري (ت 310هـ)",
  },
  {
    id: "qurtubi",
    name: "Al-Qurtubi",
    arabicName: "تفسير القرطبي",
    description: "الجامع لأحكام القرآن للإمام القرطبي",
    compiler: "الإمام القرطبي (ت 671هـ)",
  },
  {
    id: "saadi",
    name: "As-Sa'di",
    arabicName: "تفسير السعدي",
    description: "تيسير الكريم الرحمن في تفسير كلام المنان",
    compiler: "الشيخ عبد الرحمن السعدي (ت 1376هـ)",
  },
];

// Foundation truth: only the English development sample exists locally.
// Other languages are listed as explicitly unavailable until their
// licensed resources are acquired, versioned, and rights-cleared.
const translationLanguages = [
  { code: "en", name: "English", arabicName: "الإنجليزية", available: true },
  { code: "fr", name: "French", arabicName: "الفرنسية — غير متاحة بعد", available: false },
  { code: "ur", name: "Urdu", arabicName: "الأردية — غير متاحة بعد", available: false },
  { code: "tr", name: "Turkish", arabicName: "التركية — غير متاحة بعد", available: false },
  { code: "es", name: "Spanish", arabicName: "الإسبانية — غير متاحة بعد", available: false },
];

export default function QuranPage() {
  const { updateLastVisited } = useProgress();
  const { direction } = useLanguage();

  const [selectedChapter, setSelectedChapter] = useState<QuranChapter | null>(null);
  const [currentVerse, setCurrentVerse] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTafsir, setSelectedTafsir] = useState("ibn-kathir");
  const [selectedTranslation, setSelectedTranslation] = useState("en");
  const [showTafsir, setShowTafsir] = useState(false);
  const [bookmarkedVerses, setBookmarkedVerses] = useState<string[]>([]);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSource | null>(null);

  useEffect(() => {
    updateLastVisited("/quran");
  }, [updateLastVisited]);

  useEffect(() => {
    const saved = localStorage.getItem("quran-bookmarks");
    if (saved) {
      try {
        setBookmarkedVerses(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery({
    queryKey: ["quran-chapters"],
    queryFn: getQuranChapters,
  });

  useEffect(() => {
    if (chapters.length > 0 && !selectedChapter) {
      setSelectedChapter(chapters[0]);
    }
  }, [chapters, selectedChapter]);

  const { data: verse, isLoading: verseLoading } = useQuery({
    queryKey: [
      "quran-verse",
      selectedChapter?.number,
      currentVerse,
      selectedTranslation,
    ],
    queryFn: () =>
      selectedChapter
        ? getQuranVerse(
            selectedChapter.number,
            currentVerse,
            selectedTranslation,
          )
        : null,
    enabled: !!selectedChapter,
  });

  const { data: tafsirText } = useQuery({
    queryKey: [
      "quran-tafsir",
      selectedChapter?.number,
      currentVerse,
      selectedTafsir,
    ],
    queryFn: () =>
      selectedChapter
        ? getTafsir(selectedChapter.number, currentVerse, selectedTafsir)
        : null,
    enabled: !!selectedChapter && showTafsir,
  });

  const isBookmarked = (surahNum: number, ayahNum: number) => {
    return bookmarkedVerses.includes(`${surahNum}:${ayahNum}`);
  };

  const toggleBookmark = (surahNum: number, ayahNum: number) => {
    const key = `${surahNum}:${ayahNum}`;
    const next = isBookmarked(surahNum, ayahNum)
      ? bookmarkedVerses.filter((v) => v !== key)
      : [...bookmarkedVerses, key];
    setBookmarkedVerses(next);
    localStorage.setItem("quran-bookmarks", JSON.stringify(next));
  };

  const handleCopy = async (text: string) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedVerse(true);
      setTimeout(() => setCopiedVerse(false), 2000);
    }
  };

  const filteredChapters = chapters.filter(
    (c) =>
      c.arabicName.includes(searchQuery) ||
      c.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.number.toString().includes(searchQuery)
  );

  return (
    <InstitutionShell activeWing="quran">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
        {/* Banner */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-800/40 text-white shadow-xl space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-emerald-300">
                  المصحف الشريف المرتل
                </span>
                <span className="text-slate-400 text-xs">·</span>
                <span className="text-xs font-tajawal text-slate-300">
                  فهرس 114 سورة · المتن المتاح حاليًا عينة تطوير محدودة
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-amiri font-bold tracking-tight text-white">
                رِواق القرآن الكريم
              </h1>
              <p className="text-sm md:text-base font-tajawal text-slate-300 max-w-2xl leading-relaxed">
                قراءة متأنية بالرسم العثماني المعتمد، مع عينة ترجمة إنجليزية للتطوير؛
                والتفاسير المحققة لأئمة التفسير قيد الإدخال والمراجعة.
              </p>
            </div>
          </div>
        </div>

        {/* Main Quran Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chapter Selector Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-amiri font-bold text-base text-foreground flex items-center gap-2">
                  <Scroll className="w-4 h-4 text-emerald-600" />
                  فهرس السور المباركة
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {chapters.length} سورة
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن اسم سورة أو رقمها..."
                  className="pr-9 h-10 rounded-xl text-xs font-cairo"
                />
              </div>

              {/* Scrollable list */}
              <ScrollArea className="h-[600px] pr-2">
                <div className="space-y-1.5">
                  {filteredChapters.map((chapter) => {
                    const isSelected = selectedChapter?.number === chapter.number;
                    return (
                      <button
                        key={chapter.number}
                        onClick={() => {
                          setSelectedChapter(chapter);
                          setCurrentVerse(1);
                        }}
                        className={cn(
                          "w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-3",
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/50 shadow-xs ring-1 ring-emerald-500/30"
                            : "bg-slate-50/50 dark:bg-slate-800/40 border-transparent hover:border-border"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-xl font-mono text-xs flex items-center justify-center font-bold",
                              isSelected
                                ? "bg-emerald-700 text-white"
                                : "bg-slate-200 dark:bg-slate-700 text-foreground"
                            )}
                          >
                            {chapter.number}
                          </div>
                          <div>
                            <span className="font-amiri font-bold text-sm text-foreground block">
                              سورة {chapter.arabicName}
                            </span>
                            <span className="text-[11px] font-tajawal text-muted-foreground">
                              {chapter.revelationType === "meccan" ? "مكية" : "مدنية"} · {chapter.ayahCount} آية
                            </span>
                          </div>
                        </div>

                        <span className="text-xs font-inter text-muted-foreground" dir="ltr">
                          {chapter.englishName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Reading Sanctuary (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedChapter && (
              <article className="p-6 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-border shadow-xs space-y-8">
                {/* Surah Cartouche (Classical Manuscript Title Frame) */}
                <div className="surah-cartouche rounded-2xl py-6 px-10 text-center space-y-2">
                  <div className="flex items-center justify-center gap-3 text-xs font-tajawal text-muted-foreground">
                    <span>السورة رقم {selectedChapter.number}</span>
                    <span>·</span>
                    <span>
                      {selectedChapter.revelationType === "meccan" ? "مكية" : "مدنية"}
                    </span>
                    <span>·</span>
                    <span className="font-mono">{selectedChapter.ayahCount} آية</span>
                  </div>

                  <h2 className="font-amiri font-bold text-3xl md:text-4xl text-foreground">
                    سورة {selectedChapter.arabicName}
                  </h2>
                  <p className="text-xs font-inter text-muted-foreground" dir="ltr">
                    {selectedChapter.englishName}
                  </p>
                </div>

                {/* Bismillah */}
                {selectedChapter.number !== 1 && selectedChapter.number !== 9 && (
                  <div className="text-center py-4">
                    <p className="font-quran text-2xl md:text-3xl text-emerald-800 dark:text-emerald-300">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                )}

                {/* Verse Card */}
                {verseLoading ? (
                  <div className="py-20 text-center space-y-3">
                    <div className="w-10 h-10 mx-auto rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                    <p className="text-xs font-cairo text-muted-foreground">
                      جاري استرجاع الآية المباركة...
                    </p>
                  </div>
                ) : verse ? (
                  <div className="space-y-6">
                    {/* Arabic Verse Display */}
                    <div className="p-8 md:p-12 rounded-3xl bg-amber-50/20 dark:bg-slate-800/40 border border-amber-900/10 dark:border-amber-500/10 text-center space-y-6">
                      <p className="font-quran text-2xl md:text-4xl leading-loose text-foreground font-medium select-text">
                        {verse.arabic}
                        <span className="ayah-rosette">
                          {verse.ayah}
                        </span>
                      </p>
                    </div>

                    {/* Navigation between Ayahs */}
                    <div className="flex items-center justify-between gap-2 border-y border-border py-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentVerse <= 1}
                        onClick={() => setCurrentVerse((v) => Math.max(1, v - 1))}
                        className="text-xs font-cairo gap-1 px-2 sm:px-3"
                        aria-label="الآية السابقة"
                      >
                        <ChevronRight className="w-4 h-4" />
                        <span className="hidden sm:inline">الآية السابقة</span>
                      </Button>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-tajawal text-muted-foreground">
                          الآية:
                        </span>
                        <select
                          value={currentVerse}
                          onChange={(e) => setCurrentVerse(Number(e.target.value))}
                          className="h-8 px-2.5 rounded-lg border border-border bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                        >
                          {Array.from(
                            { length: selectedChapter.ayahCount },
                            (_, i) => i + 1
                          ).map((num) => (
                            <option key={num} value={num}>
                              {num} من {selectedChapter.ayahCount}
                            </option>
                          ))}
                        </select>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={currentVerse >= selectedChapter.ayahCount}
                        onClick={() =>
                          setCurrentVerse((v) =>
                            Math.min(selectedChapter.ayahCount, v + 1)
                          )
                        }
                        className="text-xs font-cairo gap-1 px-2 sm:px-3"
                        aria-label="الآية التالية"
                      >
                        <span className="hidden sm:inline">الآية التالية</span>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Translation Panel */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/50 border border-border space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="text-xs font-bold font-cairo text-foreground">
                          ترجمة إنجليزية ضمن عينة التطوير
                        </span>
                        <Select
                          value={selectedTranslation}
                          onValueChange={(v) => {
                            const lang = translationLanguages.find((l) => l.code === v);
                            if (lang?.available) setSelectedTranslation(v);
                          }}
                        >
                          <SelectTrigger className="w-44 h-8 text-xs font-cairo">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {translationLanguages.map((l) => (
                              <SelectItem key={l.code} value={l.code} disabled={!l.available}>
                                {l.arabicName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-[11px] font-tajawal text-muted-foreground leading-relaxed">
                        المتاح حاليًا الإنجليزية فقط ضمن عينة التطوير. بقية اللغات معطلة
                        صراحة حتى إدخال مورد مرخص لكل لغة مع الإصدار والحقوق.
                      </p>
                      <p className="text-sm font-inter text-foreground/90 leading-relaxed" dir="ltr">
                        {verse.translation}
                      </p>
                    </div>

                    {/* Tafsir Panel */}
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-border space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-cairo font-bold text-foreground">
                            تفسير الآية الكريمة
                          </h4>
                          <p className="text-[11px] font-tajawal text-muted-foreground">
                            عينة تطوير عامة — غير منسوبة لإمام بعينه. تفاسير ابن كثير
                            والطبري والقرطبي والسعدي قيد الإدخال والمراجعة وغير متاحة بعد.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Select
                            value={selectedTafsir}
                            onValueChange={setSelectedTafsir}
                            disabled
                          >
                            <SelectTrigger className="w-40 h-8 text-xs font-cairo" aria-disabled="true" title="اختيار المفسر معطل: لا يوجد تفسير محقق مدخل بعد">
                              <SelectValue placeholder="التفسير قيد الإدخال" />
                            </SelectTrigger>
                            <SelectContent>
                              {tafsirScholars.map((s) => (
                                <SelectItem key={s.id} value={s.id} disabled>
                                  {s.arabicName} — غير متاح بعد
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTafsir(!showTafsir)}
                            className="h-8 text-xs font-cairo"
                          >
                            {showTafsir ? "إخفاء" : "عرض التفسير"}
                          </Button>
                        </div>
                      </div>

                      {showTafsir && (
                        <div className="text-sm font-tajawal leading-relaxed text-foreground/90 whitespace-pre-line">
                          {tafsirText || verse.tafsir || "لا يتوفر نص تفسير مراجع لهذه الآية."}
                        </div>
                      )}
                    </div>

                    {/* Actions Bar */}
                    <div className="pt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBookmark(verse.surah, verse.ayah)}
                          className="h-9 px-3 gap-1.5 text-xs font-cairo"
                        >
                          {isBookmarked(verse.surah, verse.ayah) ? (
                            <>
                              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                              <span>محفوظة</span>
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-4 h-4" />
                              <span>حفظ الآية</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(`${verse.arabic} [سورة ${selectedChapter.arabicName}: ${verse.ayah}]`)}
                          className="h-9 px-3 gap-1.5 text-xs font-cairo"
                        >
                          {copiedVerse ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span>تم النسخ</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-4 h-4" />
                              <span>نسخ الآية</span>
                            </>
                          )}
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedEvidence({
                            title: `سورة ${selectedChapter.arabicName} — الآية ${verse.ayah}`,
                            collectionOrWork: "عينة تطوير محلية — مصدر الإنتاج لم يُربط بعد",
                            authorOrCompiler: "غير محدد في سجل المصدر الحالي",
                            referenceNumber: `QUR-${selectedChapter.number}:${verse.ayah}`,
                            originalText: verse.arabic,
                            translationExcerpt: verse.translation,
                            status: "editorial_review_pending",
                            reviewNote: "لا يجوز اعتماد هذا السجل للنشر قبل ربط ملف المصدر، الإصدار، الترخيص، والبصمة الرقمية.",
                            provenanceDataset: "QURAN-DEVELOPMENT-SAMPLE",
                            sourceRegistryId: "src-quran-development-sample",
                            rightsDecision: "development_only",
                            allowedUsageLabel: "عرض تطوير محلي فقط؛ غير صالح للإنتاج أو إعادة التوزيع",
                            rightsCheckedAt: "2026-09-23T00:00:00+04:00",
                          })
                        }
                        className="text-xs font-cairo text-emerald-700 dark:text-emerald-400 gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        توثيق المصدر
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl border border-amber-500/30 bg-amber-50/70 p-8 text-center dark:bg-amber-950/20"
                    role="status"
                  >
                    <AlertTriangle className="mx-auto mb-3 h-6 w-6 text-amber-700 dark:text-amber-300" aria-hidden="true" />
                    <h3 className="font-cairo text-sm font-bold text-foreground">
                      متن هذه الآية غير متاح في العينة المحلية
                    </h3>
                    <p className="mx-auto mt-2 max-w-prose-ar font-tajawal text-xs leading-6 text-muted-foreground">
                      لم نضع نصًا بديلًا أو مولّدًا داخل متن الآية. يظل هذا الموضع
                      غير متاح حتى إدخال Corpus موثّق مع المصدر والإصدار والبصمة الرقمية.
                    </p>
                  </div>
                )}
              </article>
            )}
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

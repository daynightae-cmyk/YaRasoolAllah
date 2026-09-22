import React, { useState, useMemo } from "react";
import InstitutionShell from "@/components/Institution/InstitutionShell";
import {
  childrenVideos,
  videoCategories,
  ChildrenVideo,
} from "@/data/childrenVideos";
import VideoPlayer from "@/components/ChildrenTV/VideoPlayer";
import VideoGrid from "@/components/ChildrenTV/VideoGrid";
import CategorySidebar from "@/components/ChildrenTV/CategorySidebar";
import AgeFilter from "@/components/ChildrenTV/AgeFilter";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/brand";
import {
  Heart,
  Baby,
  BookOpen,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Smile,
  Sun,
  Moon,
  Compass,
  Award,
  ChevronLeft,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Prophetic manners with Hadith backing for kids
const PROPHETIC_MANNERS = [
  {
    id: "eating",
    titleAr: "أدب الطعام والشراب",
    hadithAr: "«يَا غُلَامُ، سَمِّ اللَّهَ، وَكُلْ بِيَمِينِكَ، وَكُلْ مِمَّا يَلِيكَ»",
    guidanceAr: "نبدأ الطعام دائماً بقول «بسم الله»، ونأكل باليد اليمنى من أمامنا بهدوء وشكر لنعمة الله.",
    icon: "🥣",
  },
  {
    id: "smile",
    titleAr: "البشاشة والتبسم في وجوه الناس",
    hadithAr: "«تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ»",
    guidanceAr: "الابتسامة الصادقة صدقة سهلة تسعد والديك وإخوتك وتملأ بيتنا مودة ورحمة.",
    icon: "😊",
  },
  {
    id: "greeting",
    titleAr: "إفشاء السلام عند الدخول والخروج",
    hadithAr: "«أَفْشُوا السَّلَامَ بَيْنَكُمْ تَحَابُّوا»",
    guidanceAr: "نحيي من نلقاه بقول: «السلام عليكم ورحمة الله وبركاته»، وهي دعوة أمان وبركة.",
    icon: "🕊️",
  },
  {
    id: "kindness-animals",
    titleAr: "الرحمة بالحيوان والرفق بكل كائن",
    hadithAr: "«مَا فَعَلَ النُّغَيْرُ يَا أَبَا عُمَيْر؟»",
    guidanceAr: "كان النبي ﷺ يمازح الأطفال برفق ويسأل عن عصفورهم الصغير، ويعلمنا الرحمة بالقطط والطيور.",
    icon: "🌿",
  },
  {
    id: "parents",
    titleAr: "بر الوالدين وحسن معاملتهما",
    hadithAr: "«رِضَا الرَّبِّ فِي رِضَا الْوَالِدَيْنِ»",
    guidanceAr: "نسمع كلام أمنا وأبينا بأدب، ونقبل أيديهما ورؤوسهما، ونساعدهما في البيت بحب.",
    icon: "🏡",
  },
];

export default function ChildrenTVPage() {
  const [selectedVideo, setSelectedVideo] = useState<ChildrenVideo | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("prophets");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("all");
  const [activeTab, setActiveTab] = useState<"manners" | "videos" | "daily-sunnah">("manners");

  // Track completed daily sunnah practices
  const [dailyHabits, setDailyHabits] = useState<Record<string, boolean>>({
    habit1: true,
    habit2: true,
    habit3: false,
    habit4: false,
    habit5: false,
  });

  const toggleHabit = (id: string) => {
    setDailyHabits((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredVideos = useMemo(() => {
    return childrenVideos.filter((video) => {
      const categoryMap: Record<string, string> = {
        prophets: "قصص الأنبياء",
        prayer: "تعليم الصلاة",
        morals: "الأخلاق والآداب",
        songs: "أناشيد",
        seerah: "السيرة",
        bedtime: "قصص قبل النوم",
        dhikr: "الأذكار اليومية",
      };
      return video.category === categoryMap[selectedCategory];
    });
  }, [selectedCategory]);

  return (
    <InstitutionShell activeWing="family">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
        {/* Dignified Institutional Banner with Gentle Warmth */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-[#17251f] via-[#101e18] to-stone-950 border border-emerald-900/40 text-emerald-50 shadow-xl overflow-hidden space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-tajawal text-emerald-300">
                  واحة التنشئة والأسرة المسلمة
                </span>
                <span className="text-stone-500 text-xs">·</span>
                <span className="text-xs font-tajawal text-stone-300">
                  تربية على الشمائل والأخلاق المحمدية
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-amiri font-bold text-white tracking-tight leading-tight">
                واحة الأسرة والطفل: نقتدي بحبيبنا ﷺ
              </h1>
              <p className="text-sm md:text-base font-tajawal text-stone-300 leading-relaxed">
                مساحة تربوية دافئة ووقورة، تنقل للأجيال الصاعدة محبة رسول الله ﷺ عبر الآداب اليومية، وقصص الرحمة والصدق، والأوراد الخفيفة، خالية تماماً من أي بهرجة أو تمثيل تصويري للأنبياء.
              </p>
            </div>

            {/* Theological Guard Note */}
            <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/20 max-w-xs space-y-1.5 self-start lg:self-auto text-xs font-tajawal text-emerald-200">
              <div className="flex items-center gap-2 font-bold text-white font-cairo">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ميثاق التنزيه والأمان التربوي</span>
              </div>
              <p className="text-[11px] text-stone-300 leading-relaxed">
                محتوى منتقى بعناية يحفظ مهابة الأنبياء، دون أي تجسيد كارتوني أو صوتي، مركزاً على القيم والاقتداء الصادق.
              </p>
            </div>
          </div>

          {/* Navigation Segments for Family Oasis */}
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-emerald-900/40 text-xs font-cairo">
            <button
              type="button"
              onClick={() => setActiveTab("manners")}
              className={cn(
                "px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold",
                activeTab === "manners"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-black/30 text-stone-300 hover:bg-black/50 hover:text-white"
              )}
            >
              <Heart className="w-4 h-4 text-emerald-300" />
              <span>الآداب والأخلاق النبوية الصغرى</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("daily-sunnah")}
              className={cn(
                "px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold",
                activeTab === "daily-sunnah"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-black/30 text-stone-300 hover:bg-black/50 hover:text-white"
              )}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>لوحة الاقتداء اليومي (أنا أقتدي به اليوم)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("videos")}
              className={cn(
                "px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold",
                activeTab === "videos"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-black/30 text-stone-300 hover:bg-black/50 hover:text-white"
              )}
            >
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>المشاهدة والقصص التعليمية الآمنة</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* VIEW 1: PROPHETIC MANNERS FOR LITTLE HEARTS (الآداب النبوية) */}
        {/* ============================================================== */}
        {activeTab === "manners" && (
          <div className="space-y-8 animate-fade-in">
            <div className="p-6 bg-card rounded-3xl border border-border space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-amiri font-bold text-foreground">
                  شمائل وآداب الصغار في هدي المختار ﷺ
                </h2>
              </div>
              <p className="text-xs text-muted-foreground font-tajawal leading-relaxed">
                كلمات وتوجيهات شريفة وجّهها النبي ﷺ للأطفال برقة ولطف، تبني شخصية الطفل المسلم على الصدق والرحمة والمروءة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PROPHETIC_MANNERS.map((m) => (
                <div
                  key={m.id}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-emerald-600/40 hover:shadow-lg transition-all duration-200 space-y-4 text-right flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        {m.icon}
                      </span>
                      <span className="text-xs font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        أدب نبوي معتمد
                      </span>
                    </div>

                    <h3 className="text-lg font-amiri font-bold text-foreground">
                      {m.titleAr}
                    </h3>

                    <div className="p-3 rounded-xl bg-muted/50 border border-border/80 text-xs font-amiri font-bold text-primary leading-relaxed">
                      {m.hadithAr}
                    </div>

                    <p className="text-xs font-tajawal text-muted-foreground leading-relaxed">
                      {m.guidanceAr}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] font-tajawal text-muted-foreground">
                    <span>صحيح البخاري ومسلم</span>
                    <span className="text-emerald-600 font-semibold">تطبيق عملي يومي</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: DAILY NOBLE HABIT TRACKER (لوحة الاقتداء اليومي) */}
        {/* ============================================================== */}
        {activeTab === "daily-sunnah" && (
          <div className="p-8 rounded-3xl bg-card border border-border space-y-8 animate-fade-in">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h2 className="text-2xl font-amiri font-bold text-foreground">
                  لوحة الاقتداء اليومي: «أنا أقتدي بحبيبي ﷺ اليوم»
                </h2>
              </div>
              <p className="text-xs text-muted-foreground font-tajawal leading-relaxed">
                سنن بسيطة خفيفة يتعاهد الطفل ووالداه على إحيائها كل يوم في البيت والمدرسة لننال محبة الله ورسوله ﷺ.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: "habit1",
                  title: "الابتسامة وبشاشة الوجه عند الاستيقاظ وملاقاة الوالدين",
                  desc: "«تبسمك في وجه أخيك صدقة» — أبدأ يومي بابتسامة طيبة.",
                },
                {
                  id: "habit2",
                  title: "قول «بسم الله» قبل الأكل و«الحمد لله» بعد الانتهاء",
                  desc: "«يا غلام سمّ الله وكل بيمينك» — حفظ النعمة بالحمد والذكر.",
                },
                {
                  id: "habit3",
                  title: "إفشاء السلام عند الدخول على الأهل في البيت",
                  desc: "«أفشوا السلام بينكم» — نشر الطمأنينة والمحبة بين الإخوة.",
                },
                {
                  id: "habit4",
                  title: "ترتيب السرير وإماطة الأذى عن طريق إخوتي",
                  desc: "«إماطة الأذى عن الطريق صدقة» — النظافة والترتيب خلق إسلامي.",
                },
                {
                  id: "habit5",
                  title: "الصلاة على النبي الحبيب ﷺ 10 مرات في اليوم",
                  desc: "«من صلى عليّ صلاة صلى الله عليه بها عشراً» — ليكون رفيقنا في الجنة.",
                },
              ].map((habit) => {
                const isChecked = !!dailyHabits[habit.id];
                return (
                  <div
                    key={habit.id}
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 text-right",
                      isChecked
                        ? "bg-emerald-500/10 border-emerald-500/40 text-foreground"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-lg border flex items-center justify-center transition-colors",
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-muted-foreground/40 bg-background"
                        )}
                      >
                        {isChecked && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className={cn("text-sm font-cairo font-bold", isChecked ? "text-foreground" : "text-muted-foreground")}>
                          {habit.title}
                        </h4>
                        <p className="text-xs font-tajawal text-muted-foreground">{habit.desc}</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 shrink-0">
                      {isChecked ? "تم الإنجاز ✓" : "في الانتظار"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: SAFE CURATED VIDEO & STORY LIBRARY */}
        {/* ============================================================== */}
        {activeTab === "videos" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            {/* Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              <CategorySidebar
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
              <AgeFilter
                selectedAgeGroup={selectedAgeGroup}
                onAgeGroupChange={setSelectedAgeGroup}
              />
            </div>

            {/* Video Player & Selected Stream */}
            <div className="lg:col-span-9 space-y-6">
              {selectedVideo ? (
                <div className="p-4 rounded-3xl bg-card border border-border shadow-lg">
                  <VideoPlayer
                    video={selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                  />
                </div>
              ) : (
                <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground">
                      {filteredVideos.length} مقاطع وقصص متاحة
                    </span>
                    <h3 className="text-lg font-amiri font-bold text-foreground">
                      المكتبة المرئية والقصصية المعتمدة
                    </h3>
                  </div>
                  <VideoGrid
                    videos={filteredVideos}
                    selectedCategory={selectedCategory}
                    selectedAgeGroup={selectedAgeGroup}
                    onVideoPlay={setSelectedVideo}
                    onAgeGroupChange={setSelectedAgeGroup}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </InstitutionShell>
  );
}

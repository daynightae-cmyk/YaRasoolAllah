import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BookMarked,
  Moon,
  Sparkles,
  Calendar,
  Headphones,
  FileText,
  Bookmark,
  Search,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { TiltCard } from "@/visual-golden/components/present/TiltCard";
import { ViewSwitcher, type ViewMode } from "@/visual-golden/components/present/ViewSwitcher";
import {
  getDailyVerse,
  getQuranChapters,
  type DailyVerse,
  type QuranChapter,
} from "@/services/quranService";
import { discoveryFacts } from "@/visual-golden/services/discovery";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./HomePage.module.css";

const gateways = [
  {
    to: "/seerah" as const,
    title: "السيرة النبوية",
    en: "Prophetic Biography",
    desc: "رحلة في حياة خير الخلق ﷺ",
    img: art.domeCard,
  },
  {
    to: "/hadith" as const,
    title: "الأحاديث النبوية",
    en: "Hadith Collection",
    desc: "كنوز من هدي المصطفى",
    img: art.books,
  },
  {
    to: "/library" as const,
    title: "العلوم الإسلامية",
    en: "Islamic Sciences",
    desc: "معرفة راسخة ومنهج وسطي",
    img: art.arches,
  },
  {
    to: "/basirah" as const,
    title: "بصيرة",
    en: "Basirah",
    desc: "رفيق البحث الموثَّق في المصادر",
    img: art.lantern,
  },
  {
    to: "/kids" as const,
    title: "الأطفال والعائلة",
    en: "Kids & Family",
    desc: "مسرح قصص دافئ للأسرة",
    img: art.archesNight,
  },
];

const quick = [
  { to: "/quran" as const, label: "القرآن الكريم", icon: BookMarked },
  { to: "/daily" as const, label: "مرصد الصلاة", icon: Moon },
  { to: "/daily" as const, label: "الأدعية", icon: Sparkles },
  { to: "/daily" as const, label: "التقويم الهجري", icon: Calendar },
  { to: "/audio" as const, label: "المواد الصوتية", icon: Headphones },
  { to: "/basirah" as const, label: "بصيرة", icon: Search },
  { to: "/library" as const, label: "المقالات", icon: FileText },
  { to: "/hadith" as const, label: "الحديث", icon: BookMarked },
];

function GateBody({ g }: { g: (typeof gateways)[number] }) {
  return (
    <>
      <img src={g.img} alt="" />
      <div className={styles.gateBody}>
        <h3>{g.title}</h3>
        <span>{g.en}</span>
        <p>{g.desc}</p>
        <i className={styles.gateGo}>←</i>
      </div>
    </>
  );
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function HomePage() {
  const [mode, setMode] = useState<ViewMode>("cards");
  const [, navigate] = useLocation();
  const [heroQ, setHeroQ] = useState("");
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [daily, setDaily] = useState<DailyVerse | null>(null);
  const lang = useInstitution((s) => s.lang);
  const visits = useInstitution((s) => s.visits);
  const favorites = useInstitution((s) => s.favorites);
  const notes = useInstitution((s) => s.notes);
  const toggleFavorite = useInstitution((s) => s.toggleFavorite);

  const [continueSignals] = useState(() => ({
    seerahRead: readJson<string[]>("seerah-read-chapters-v1", []).length,
    quranMarks: readJson<string[]>("quran-bookmarks", []).length,
    hadithMarks: readJson<string[]>("hadith-sample-bookmarks-v1", []).length,
    kidsSeen: readJson<string[]>("kids-seen-adaptations-v1", []).length,
  }));

  useEffect(() => {
    let cancelled = false;
    getQuranChapters()
      .then((items) => {
        if (!cancelled) setChapters(items);
      })
      .catch(() => {
        if (!cancelled) setChapters([]);
      });
    getDailyVerse()
      .then((verse) => {
        if (!cancelled) setDaily(verse);
      })
      .catch(() => {
        if (!cancelled) setDaily(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const facts = discoveryFacts(chapters);
  const recentFavorites = favorites.slice(0, 3);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img className={styles.heroImg} src={art.mosque} alt="" />
        <div className={styles.heroFrame} />
        <div className={`${styles.mash} ${styles.mashL}`} />
        <div className={`${styles.mash} ${styles.mashR}`} />
        <div className={styles.heroCopy}>
          <p className={styles.invoke}>يا رسول الله</p>
          <h1 className="gold-shimmer">بوابة النور</h1>
          <p className={styles.heroSub}>رحلة معرفية إلى سيرة خير البشر ﷺ</p>
          <p className={styles.heroDesc}>
            من هنا نبدأ رحلتنا في طلب العلم، على هدي النبي محمد ﷺ. نكتشف سيرته، وأخلاقه،
            وهديه، وننهل من نوره الذي أضاء للعالمين.
          </p>
        </div>
        <form
          className={styles.heroSearch}
          onSubmit={(e) => {
            e.preventDefault();
            navigate(heroQ.trim() ? `/basirah?q=${encodeURIComponent(heroQ.trim())}` : "/basirah");
          }}
        >
          <Search size={16} />
          <input
            value={heroQ}
            onChange={(e) => setHeroQ(e.target.value)}
            placeholder="ماذا تريد أن تتعلم اليوم؟"
            aria-label="البحث في بصيرة"
          />
          <button className="btn-gold" type="submit">
            بحث
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.headRow}>
          <SectionHead title="بوابات المعرفة الرئيسية" en="Featured Knowledge Gateways" href="/library" action="استكشف جميع البوابات" />
          <ViewSwitcher value={mode} onChange={setMode} />
        </div>

        {mode === "cards" ? (
          <div className={`${styles.gateGrid} stagger`}>
            {gateways.map((g) => (
              <TiltCard key={g.title}>
                <Link href={g.to} className={`${styles.gateCard} ${styles.mashOpen}`}>
                  <GateBody g={g} />
                </Link>
              </TiltCard>
            ))}
          </div>
        ) : null}

        {mode === "panorama" ? (
          <div className={p.panorama}>
            {gateways.map((g) => (
              <Link key={g.title} href={g.to} className={`${styles.gateCard} ${styles.mashOpen}`}>
                <GateBody g={g} />
              </Link>
            ))}
          </div>
        ) : null}

        {mode === "path" ? (
          <div className={p.path}>
            {gateways.map((g, i) => (
              <div key={g.title} className={p.pathStep}>
                {i < gateways.length - 1 ? <span className={p.pathLine} /> : null}
                <span className={p.pathNum}>{i + 1}</span>
                <Link href={g.to} className={p.pathCard}>
                  <img src={g.img} alt="" />
                  <div>
                    <h3>{g.title}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className={styles.section}>
        <SectionHead title="حقائق السجل الموثق" en="Registry-derived facts" />
        <div className={styles.facts}>
          <div className={styles.fact}>
            <strong>{facts.surahs || "—"}</strong>
            <span>سورة قرآنية</span>
          </div>
          <div className={styles.fact}>
            <strong>{facts.ayahs || "—"}</strong>
            <span>آية عربية موثقة</span>
          </div>
          <div className={styles.fact}>
            <strong>{facts.works}</strong>
            <span>عملًا مسجلًا</span>
          </div>
          <div className={styles.fact}>
            <strong>{facts.versions}</strong>
            <span>نسخة رقمية فهرسية</span>
          </div>
          <div className={styles.fact}>
            <strong>{facts.seerahChapters}</strong>
            <span>فصول سيرة</span>
          </div>
          <div className={styles.fact}>
            <strong>{facts.hadithSamples}</strong>
            <span>سجلات حديث محلية</span>
          </div>
        </div>
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.panel}>
          <SectionHead title="مواصلة محلية" en="Local continue signals" href="/seerah" />
          <div className={styles.continueRow}>
            <img src={art.bookStack} alt="" />
            <div className={styles.continueMeta}>
              <strong>نشاطك على هذا الجهاز</strong>
              <p>السيرة: {continueSignals.seerahRead} فصول مقروءة</p>
              <p>القرآن: {continueSignals.quranMarks} علامات · الحديث: {continueSignals.hadithMarks} محفوظات</p>
              <p className="muted">الأطفال: {continueSignals.kidsSeen} قصص فُتحت</p>
            </div>
          </div>
          {recentFavorites.length > 0 ? (
            <ul style={{ listStyle: "none", margin: "0.6rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {recentFavorites.map((fav) => (
                <li key={fav.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
                  <button
                    type="button"
                    aria-label="إزالة"
                    onClick={() => toggleFavorite({ id: fav.id, title: fav.title, path: fav.path })}
                  >
                    <Bookmark size={14} fill="currentColor" />
                  </button>
                  <Link href={fav.path}>{fav.title}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ fontSize: "0.8rem" }}>
              لا محفوظات بعد — احفظ من أي جناح لتظهر هنا.
            </p>
          )}
          <Link href="/seerah" className={styles.followBtn}>
            متابعة ←
          </Link>
        </article>

        <article className={styles.inspire}>
          <img src={art.mosque} alt="" />
          <div className={styles.inspireInner}>
            <SectionHead title="إلهام اليوم" en="Daily Inspiration" />
            <p className={styles.hadithLabel}>آية اليوم — تدوير يومي على المصحف الكامل</p>
            {daily ? (
              <>
                <blockquote dir="rtl" lang="ar">{daily.arabic}</blockquote>
                <p className="muted">
                  سورة {daily.surahName} · الآية {daily.ayah}
                </p>
              </>
            ) : (
              <p className="muted">جارٍ تحميل آية اليوم من المصحف المحلي…</p>
            )}
          </div>
        </article>

        <article className={styles.panel}>
          <div className={styles.quickHead}>
            <SectionHead title="وصول سريع" en="Quick Access" />
          </div>
          <div className={`${styles.quickGrid} stagger`}>
            {quick.map((q) => (
              <Link key={q.label} href={q.to}>
                <q.icon size={18} />
                {q.label}
              </Link>
            ))}
          </div>
        </article>
      </section>

      <footer className={styles.statsBar}>
        <div className={styles.stat}>
          <strong>{Object.keys(visits).length}</strong>
          <span>{lang === "ar" ? "أبواب زرتها" : "Wings visited"}</span>
        </div>
        <div className={styles.stat}>
          <strong>{favorites.length}</strong>
          <span>{lang === "ar" ? "محفوظات" : "Saved"}</span>
        </div>
        <div className={styles.stat}>
          <strong>{notes.length}</strong>
          <span>{lang === "ar" ? "ملاحظات" : "Notes"}</span>
        </div>
        <span className={styles.quote}>
          {lang === "ar" ? "مسار تعلّم محايد على هذا الجهاز — ليس تقييمًا للعبادة" : "A neutral learning path on this device — not a piety score"}
        </span>
      </footer>
    </div>
  );
}

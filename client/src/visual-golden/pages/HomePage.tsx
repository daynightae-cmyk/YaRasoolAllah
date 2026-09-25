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
    desc: "رحلة سردية موثقة في حياة النبي ﷺ",
    enDesc: "A sourced narrative journey through the Prophet's life ﷺ",
    img: art.domeCard,
  },
  {
    to: "/quran" as const,
    title: "القرآن الكريم",
    en: "The Qur'an",
    desc: "المصحف العربي والقراءة والبحث",
    enDesc: "Arabic text, reading and search",
    img: art.mushafOpen,
  },
  {
    to: "/hadith" as const,
    title: "السنة والحديث",
    en: "Sunnah & Hadith",
    desc: "فهرس المصادر وسجلات محلية قيد المراجعة",
    enDesc: "Source catalog and local records under review",
    img: art.books,
  },
  {
    to: "/library" as const,
    title: "المكتبة الكبرى",
    en: "The Great Library",
    desc: "رفوف الأعمال ونسخها وحقوق الوصول",
    enDesc: "Works, editions and access rights",
    img: art.library,
  },
  {
    to: "/atlas" as const,
    title: "الأطلس التاريخي",
    en: "Historical Atlas",
    desc: "مواضع ومسارات تخطيطية للسيرة",
    enDesc: "Schematic places and routes through the Seerah",
    img: art.desert,
  },
  {
    to: "/kids" as const,
    title: "الأسرة والطفل",
    en: "Family & Children",
    desc: "قصص تعليمية بمحتوى خاضع للمراجعة",
    enDesc: "Educational stories with governed content",
    img: art.kidsRead,
  },
  {
    to: "/daily" as const,
    title: "محراب اليوم",
    en: "Daily Sanctuary",
    desc: "مواقيت الصلاة والذكر حسب المكان",
    enDesc: "Prayer times and remembrance by location",
    img: art.lantern,
  },
  {
    to: "/sources" as const,
    title: "خزانة المصادر",
    en: "Sources Vault",
    desc: "الأصول والحقوق والمزوّدون",
    enDesc: "Origins, rights and providers",
    img: art.arches,
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

function GateBody({ g, lang, preview }: { g: (typeof gateways)[number]; lang: "ar" | "en"; preview?: string }) {
  return (
    <>
      <img src={g.img} alt="" />
      <div className={styles.gateBody}>
        <span className={styles.gateIndex}>{String(gateways.indexOf(g) + 1).padStart(2, "0")} / 08</span>
        <h3>{lang === "ar" ? g.title : g.en}</h3>
        <span className={styles.gateSecondary}>{lang === "ar" ? g.en : g.title}</span>
        <p>{lang === "ar" ? g.desc : g.enDesc}</p>
        {preview ? <small className={styles.gatePreview}>{preview}</small> : null}
        <i className={styles.gateGo} aria-hidden="true">←</i>
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
  const previewFor = (path: (typeof gateways)[number]["to"]) => {
    if (path === "/quran" && facts.surahs) return lang === "ar" ? `${facts.surahs} سورة في النص المحلي` : `${facts.surahs} chapters in the local text`;
    if (path === "/seerah" && facts.seerahChapters) return lang === "ar" ? `${facts.seerahChapters} فصلًا سرديًا` : `${facts.seerahChapters} narrative chapters`;
    if (path === "/library" && facts.works) return lang === "ar" ? `${facts.works} عملًا مسجلًا · ${facts.versions} نسخة مفهرسة` : `${facts.works} registered works · ${facts.versions} cataloged editions`;
    if (path === "/hadith" && facts.hadithSamples) return lang === "ar" ? `${facts.hadithSamples} عينات محلية قيد المراجعة` : `${facts.hadithSamples} local samples under review`;
    if (path === "/daily" && daily) return lang === "ar" ? `آية اليوم: ${daily.surahName} · ${daily.ayah}` : `Today's verse: ${daily.surahName} · ${daily.ayah}`;
    return undefined;
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img className={styles.heroImg} src={art.mosque} alt="" />
        <div className={styles.heroFrame} />
        <div className={`${styles.mash} ${styles.mashL}`} />
        <div className={`${styles.mash} ${styles.mashR}`} />
        <div className={styles.heroCopy}>
          <p className={styles.invoke}>{lang === "ar" ? "يا رسول الله" : "YA RASOOL ALLAH"}</p>
          <h1 className="gold-shimmer">{lang === "ar" ? "بوابة النور" : "Gateway of Light"}</h1>
          <p className={styles.heroSub}>{lang === "ar" ? "رحلة معرفية إلى سيرة خير البشر ﷺ" : "A journey through the life and legacy of the Prophet ﷺ"}</p>
          <p className={styles.heroDesc}>
            {lang === "ar" ? "من هنا نبدأ رحلتنا في طلب العلم، على هدي النبي محمد ﷺ. نكتشف سيرته، وأخلاقه، وهديه، وننهل من نوره الذي أضاء للعالمين." : "Explore the Qur'an, Seerah, Sunnah and the source library through their own spaces and verified records."}
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
            placeholder={lang === "ar" ? "ماذا تريد أن تتعلم اليوم؟" : "What would you like to explore?"}
            aria-label={lang === "ar" ? "البحث في بصيرة" : "Search Basirah"}
          />
          <button className="btn-gold" type="submit">
            {lang === "ar" ? "بحث" : "Search"}
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.headRow}>
          <div>
            <p className={styles.wingEyebrow}>{lang === "ar" ? "خريطة المؤسسة" : "INSTITUTION MAP"}</p>
            <SectionHead title={lang === "ar" ? "أجنحة المعرفة" : "Knowledge Wings"} en="Eight distinct ways to explore" />
          </div>
          <ViewSwitcher value={mode} onChange={setMode} />
        </div>

        {mode === "cards" ? (
          <nav className={styles.gateGrid} aria-label={lang === "ar" ? "أجنحة المعرفة" : "Knowledge wings"}>
            {gateways.map((g) => (
              <Link key={g.to} href={g.to} className={`${styles.gateCard} ${styles.mashOpen}`}>
                <GateBody g={g} lang={lang} preview={previewFor(g.to)} />
              </Link>
            ))}
          </nav>
        ) : null}

        {mode === "panorama" ? (
          <div className={p.panorama}>
            {gateways.map((g) => (
              <Link key={g.title} href={g.to} className={`${styles.gateCard} ${styles.mashOpen}`}>
                <GateBody g={g} lang={lang} preview={previewFor(g.to)} />
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
                    <h3>{lang === "ar" ? g.title : g.en}</h3>
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

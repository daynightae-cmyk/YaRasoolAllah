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
  Compass,
  Feather,
  Library,
  Users,
  Sun,
  ShieldCheck,
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
    desc: "رحلة سردية موثقة في حياة النبي ﷺ من مولده إلى وفاته",
    enDesc: "A sourced narrative journey through the Prophet's life ﷺ",
    img: art.domeCard,
    icon: Compass,
    color: "amber",
  },
  {
    to: "/quran" as const,
    title: "القرآن الكريم",
    en: "The Qur'an",
    desc: "المصحف العربي، القراءة، البحث، والتفسير بالسياق النبوي",
    enDesc: "Arabic text, reading, search and prophetic-context tafsir",
    img: art.mushafOpen,
    icon: BookMarked,
    color: "teal",
  },
  {
    to: "/hadith" as const,
    title: "السنة والحديث",
    en: "Sunnah & Hadith",
    desc: "فهرس المصادر وسجلات محلية قيد المراجعة والتوثيق",
    enDesc: "Source catalog and local records under review",
    img: art.books,
    icon: Feather,
    color: "cyan",
  },
  {
    to: "/library" as const,
    title: "مكتبة الرفوف",
    en: "Library on Shelves",
    desc: "أرفف تفاعلية للكتب والمصادر التراثية والمعاصرة",
    enDesc: "Interactive shelves of classical and modern Islamic texts",
    img: art.library,
    icon: Library,
    color: "violet",
  },
  {
    to: "/atlas" as const,
    title: "الأطلس التاريخي",
    en: "Historical Atlas",
    desc: "مواضع ومسارات تخطيطية للسيرة النبوية",
    enDesc: "Schematic places and routes through the Seerah",
    img: art.desert,
    icon: Sun,
    color: "rose",
  },
  {
    to: "/kids" as const,
    title: "الأسرة والطفل",
    en: "Family & Children",
    desc: "مساحة آمنة تربوية بلا تجسيد تحبب الأجيال في رسول الله ﷺ",
    enDesc: "A secure, ad-free world nurturing the love of the Prophet ﷺ",
    img: art.kidsRead,
    icon: Users,
    color: "rose",
  },
  {
    to: "/daily" as const,
    title: "محراب اليوم",
    en: "Daily Sanctuary",
    desc: "مواقيت الصلاة والذكر والتقويم الهجري حسب المكان",
    enDesc: "Prayer times, adhkar and Hijri calendar by location",
    img: art.lantern,
    icon: Moon,
    color: "emerald",
  },
  {
    to: "/sources" as const,
    title: "خزانة المصادر",
    en: "Sources Vault",
    desc: "الأصول، الحقوق، المزودون، وضمانات النزاهة العلمية",
    enDesc: "Origins, rights, providers and editorial integrity",
    img: art.arches,
    icon: ShieldCheck,
    color: "slate",
  },
];

const quick = [
  { to: "/quran" as const, label: "القرآن الكريم", en: "The Qur'an", icon: BookMarked },
  { to: "/daily" as const, label: "مرصد الصلاة", en: "Prayer Times", icon: Moon },
  { to: "/daily" as const, label: "الأدعية", en: "Adhkar", icon: Sparkles },
  { to: "/daily" as const, label: "التقويم الهجري", en: "Hijri Calendar", icon: Calendar },
  { to: "/audio" as const, label: "التلاوات الصوتية", en: "Qur'an Audio", icon: Headphones },
  { to: "/basirah" as const, label: "بصيرة", en: "Basirah Research", icon: Search },
  { to: "/library" as const, label: "المقالات", en: "Library", icon: FileText },
  { to: "/hadith" as const, label: "الحديث", en: "Hadith", icon: BookMarked },
];

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
  const favorites = useInstitution((s) => s.favorites);
  const notes = useInstitution((s) => s.notes);
  const visits = useInstitution((s) => s.visits);
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
    if (path === "/quran" && facts.surahs)
      return lang === "ar" ? `${facts.surahs} سورة في النص المحلي` : `${facts.surahs} chapters in the local text`;
    if (path === "/seerah" && facts.seerahChapters)
      return lang === "ar" ? `${facts.seerahChapters} فصلًا سرديًا` : `${facts.seerahChapters} narrative chapters`;
    if (path === "/library" && facts.works)
      return lang === "ar" ? `${facts.works} عملًا مسجلًا · ${facts.versions} نسخة مفهرسة` : `${facts.works} registered works · ${facts.versions} cataloged editions`;
    if (path === "/hadith" && facts.hadithSamples)
      return lang === "ar" ? `${facts.hadithSamples} عينات محلية قيد المراجعة` : `${facts.hadithSamples} local samples under review`;
    if (path === "/daily" && daily)
      return lang === "ar" ? `آية اليوم: ${daily.surahName} · ${daily.ayah}` : `Today's verse: ${daily.surahName} · ${daily.ayah}`;
    return undefined;
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <img className={styles.heroBg} src={art.mosque} alt="" />
        <div className={styles.heroOrnament} />
        <div className={styles.heroVeil} />
        <div className={styles.heroIllumination} />
        <div className={styles.heroCopy}>
          <p className={styles.invoke} lang="ar">
            يا رسول الله
          </p>
          <h1 className="calligraphy">
            {lang === "ar" ? "بوابة النور" : "Gateway of Light"}
          </h1>
          <p className={styles.heroSub}>
            {lang === "ar"
              ? "رحلة معرفية إلى سيرة خير البشر ﷺ، القرآن الكريم، والسنة المطهرة — من مصادرها، وبإذن الله."
              : "A journey through the life, message and legacy of the Prophet ﷺ — from the Qur'an, Seerah, Sunnah and their verified sources."}
          </p>
          <p className={styles.heroDesc}>
            {lang === "ar"
              ? "من هنا نبدأ طلب العلم على هدي النبي محمد ﷺ. نكتشف سيرته وأخلاقه وهديه، وننهل من نوره الذي أضاء للعالمين، كل ذلك موثقٌ بالمراجع والمصادر."
              : "Explore the Qur'an, Seerah, Sunnah and the source library through their own spaces and verified records."}
          </p>
        </div>
        <form
          className={styles.heroSearch}
          onSubmit={(e) => {
            e.preventDefault();
            navigate(heroQ.trim() ? `/basirah?q=${encodeURIComponent(heroQ.trim())}` : "/basirah");
          }}
        >
          <Search size={15} className="sr-only" />
          <span className="sr-only">بحث</span>
          <input
            value={heroQ}
            onChange={(e) => setHeroQ(e.target.value)}
            placeholder={lang === "ar" ? "ماذا تريد أن تتعلم اليوم؟" : "What would you like to explore?"}
            aria-label={lang === "ar" ? "البحث في بصيرة" : "Search Basirah"}
          />
          <button type="submit">
            {lang === "ar" ? "بحث" : "Search"}
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <div className={styles.headRow}>
          <div>
            <p className={styles.wingEyebrow}>
              {lang === "ar" ? "خريطة المؤسسة" : "INSTITUTION MAP"}
            </p>
            <SectionHead
              title={lang === "ar" ? "أجنحة المعرفة" : "Knowledge Wings"}
              en="Eight distinct ways to explore the message"
            />
          </div>
          <ViewSwitcher value={mode} onChange={setMode} lang={lang} />
        </div>

        {mode === "cards" ? (
          <nav className={styles.gateGrid} aria-label={lang === "ar" ? "أجنحة المعرفة" : "Knowledge wings"}>
            {gateways.map((g, i) => (
              <Link key={g.to} href={g.to} className={styles.gateCard}>
                <img src={g.img} alt="" />
                <div className={styles.gateBody}>
                  <span className={styles.gateIndex}>{String(i + 1).padStart(2, "0")} / 08</span>
                  <h3>{lang === "ar" ? g.title : g.en}</h3>
                  <span className={styles.gateSecondary}>
                    {lang === "ar" ? g.en : g.title}
                  </span>
                  <p>{lang === "ar" ? g.desc : g.enDesc}</p>
                  {previewFor(g.to) ? (
                    <small className={styles.gatePreview}>{previewFor(g.to)}</small>
                  ) : null}
                </div>
                <i className={styles.gateGo} aria-hidden="true">
                  ←
                </i>
              </Link>
            ))}
          </nav>
        ) : null}

        {mode === "panorama" ? (
          <div className={p.panorama}>
            {gateways.map((g, i) => (
              <Link key={g.title} href={g.to} className={styles.gateCard}>
                <img src={g.img} alt="" />
                <div className={styles.gateBody}>
                  <span className={styles.gateIndex}>{String(i + 1).padStart(2, "0")} / 08</span>
                  <h3>{lang === "ar" ? g.title : g.en}</h3>
                  <span className={styles.gateSecondary}>
                    {lang === "ar" ? g.en : g.title}
                  </span>
                  <p>{lang === "ar" ? g.desc : g.enDesc}</p>
                  {previewFor(g.to) ? (
                    <small className={styles.gatePreview}>{previewFor(g.to)}</small>
                  ) : null}
                </div>
                <i className={styles.gateGo} aria-hidden="true">
                  ←
                </i>
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
              <div className={styles.progressBar}>
                <div />
              </div>
              <span className={styles.pct}>تواصل من حيث انتهيت</span>
            </div>
          </div>
          {recentFavorites.length > 0 ? (
            <ul style={{ listStyle: "none", margin: "0.7rem 0 0", padding: 0, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              {recentFavorites.map((fav) => (
                <li key={fav.id} style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem" }}>
                  <button
                    type="button"
                    aria-label="إزالة من المفضلة"
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
                <q.icon size={17} />
                {lang === "ar" ? q.label : q.en}
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

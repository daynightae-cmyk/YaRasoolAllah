import { useEffect, useMemo, useState } from "react";
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
import { apiUrl } from "@/lib/api-origin";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { SectionEntry3D } from "@/visual-golden/components/entry/SectionEntry3D";
import {
  readingProgressPercent,
  readingResumeTarget,
} from "@/visual-golden/lib/institution/reading-progress";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { ViewSwitcher, type ViewMode } from "@/visual-golden/components/present/ViewSwitcher";
import {
  getDailyVerse,
  getQuranChapters,
  type DailyVerse,
  type QuranChapter,
} from "@/services/quranService";
import { discoveryFacts, recentCatalogAdditions } from "@/visual-golden/services/discovery";
import { SEERAH_COUNTS } from "@/visual-golden/services/seerah";
import { worldPlateForWing } from "@/visual-golden/lib/institution/worlds";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./HomePage.module.css";

const gateways = [
  {
    to: "/seerah" as const,
    title: "السيرة النبوية",
    en: "Prophetic Biography",
    desc: "رحلة سردية موثقة في حياة النبي ﷺ من مولده إلى وفاته",
    enDesc: "A sourced narrative journey through the Prophet's life ﷺ",
    img: worldPlateForWing("seerah").plate,
    icon: Compass,
    color: "amber",
  },
  {
    to: "/quran" as const,
    title: "القرآن الكريم",
    en: "The Qur'an",
    desc: "المصحف العربي، القراءة، البحث، والتفسير بالسياق النبوي",
    enDesc: "Arabic text, reading, search and prophetic-context tafsir",
    img: worldPlateForWing("quran").plate,
    icon: BookMarked,
    color: "teal",
  },
  {
    to: "/hadith" as const,
    title: "السنة والحديث",
    en: "Sunnah & Hadith",
    desc: "فهرس المصادر وسجلات محلية قيد المراجعة والتوثيق",
    enDesc: "Source catalog and local records under review",
    img: worldPlateForWing("hadith").plate,
    icon: Feather,
    color: "cyan",
  },
  {
    to: "/library" as const,
    title: "مكتبة الرفوف",
    en: "Library on Shelves",
    desc: "أرفف تفاعلية للكتب والمصادر التراثية والمعاصرة",
    enDesc: "Interactive shelves of classical and modern Islamic texts",
    img: worldPlateForWing("library").plate,
    icon: Library,
    color: "violet",
  },
  {
    to: "/atlas" as const,
    title: "الأطلس التاريخي",
    en: "Historical Atlas",
    desc: "مواضع ومسارات تخطيطية للسيرة النبوية",
    enDesc: "Schematic places and routes through the Seerah",
    img: worldPlateForWing("atlas").plate,
    icon: Sun,
    color: "rose",
  },
  {
    to: "/kids" as const,
    title: "الأسرة والطفل",
    en: "Family & Children",
    desc: "مساحة آمنة تربوية بلا تجسيد تحبب الأجيال في رسول الله ﷺ",
    enDesc: "A secure, ad-free world nurturing the love of the Prophet ﷺ",
    img: worldPlateForWing("kids").plate,
    icon: Users,
    color: "rose",
  },
  {
    to: "/audio" as const,
    title: "ستوديو التلاوات",
    en: "Recitation Studio",
    desc: "تلاوات حقيقية من مزوّد موثّق مع تحكم كامل بالاستماع",
    enDesc: "Real recitations from a governed provider with full playback control",
    img: worldPlateForWing("audio").plate,
    icon: Headphones,
    color: "teal",
  },
  {
    to: "/daily" as const,
    title: "محراب اليوم",
    en: "Daily Sanctuary",
    desc: "مواقيت الصلاة والذكر والتقويم الهجري حسب المكان",
    enDesc: "Prayer times, adhkar and Hijri calendar by location",
    img: worldPlateForWing("daily").plate,
    icon: Moon,
    color: "emerald",
  },
  {
    to: "/sources" as const,
    title: "خزانة المصادر",
    en: "Sources Vault",
    desc: "الأصول، الحقوق، المزودون، وضمانات النزاهة العلمية",
    enDesc: "Origins, rights, providers and editorial integrity",
    img: worldPlateForWing("sources").plate,
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

export function HomePage() {
  const [mode, setMode] = useState<ViewMode>("cards");
  const [, navigate] = useLocation();
  const [heroQ, setHeroQ] = useState("");
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [daily, setDaily] = useState<DailyVerse | null>(null);
  // Live reciter count from the governed provider — null until proven, never
  // a sample statistic. Failure keeps the honest "provider unavailable" state.
  const [reciterCount, setReciterCount] = useState<number | null>(null);
  const lang = useInstitution((s) => s.lang);
  const favorites = useInstitution((s) => s.favorites);
  const notes = useInstitution((s) => s.notes);
  const visits = useInstitution((s) => s.visits);
  const journey = useInstitution((s) => s.journey);
  const readingProgress = useInstitution((s) => s.readingProgress);
  const toggleFavorite = useInstitution((s) => s.toggleFavorite);
  const resumeTarget = useMemo(() => readingResumeTarget(readingProgress), [readingProgress]);
  const resumePercent = readingProgressPercent(resumeTarget);
  const seerahProgress = useMemo(
    () => readingProgress.find((entry) => entry.surface === "seerah") ?? null,
    [readingProgress],
  );

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
    // Governed recitation availability for surah 1 — the same endpoint and
    // https/mp3quran filter the audio studio uses. Count only what the
    // provider actually returned; a failure leaves the count unknown.
    const controller = new AbortController();
    fetch(apiUrl("/api/content/audio/reciters?sura=1"), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<{ reciters?: { streamUrl?: string }[] }>;
      })
      .then((data) => {
        if (cancelled) return;
        const items = (data.reciters ?? []).filter((item) => {
          try {
            const url = new URL(item.streamUrl ?? "");
            return url.protocol === "https:"
              && (url.hostname === "mp3quran.net" || url.hostname.endsWith(".mp3quran.net"));
          } catch {
            return false;
          }
        });
        setReciterCount(items.length);
      })
      .catch(() => {
        if (!cancelled) setReciterCount(null);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const facts = discoveryFacts(chapters);
  const recentAdditions = useMemo(() => recentCatalogAdditions(4), []);
  const recentJourney = journey.slice(0, 4);
  const recentFavorites = favorites.slice(0, 3);
  const previewFor = (path: (typeof gateways)[number]["to"]) => {
    if (path === "/quran" && facts.surahs)
      return lang === "ar" ? `${facts.surahs} سورة في النص المحلي` : `${facts.surahs} chapters in the local text`;
    if (path === "/seerah" && facts.seerahChapters)
      return lang === "ar" ? `${facts.seerahChapters} فصلًا سرديًا` : `${facts.seerahChapters} narrative chapters`;
    if (path === "/library" && facts.works)
      return lang === "ar"
        ? `${facts.works} عملًا مسجلًا · ${facts.readableVersions} نسخة قابلة للقراءة`
        : `${facts.works} registered works · ${facts.readableVersions} readable editions`;
    if (path === "/audio")
      return reciterCount !== null
        ? lang === "ar"
          ? `${reciterCount} تلاوة متاحة الآن من المزوّد`
          : `${reciterCount} recitations available now from the provider`
        : lang === "ar"
          ? "التلاوات تُجلب من المزوّد عند الدخول"
          : "Recitations are fetched from the provider on entry";
    if (path === "/atlas" && facts.atlasPlaces)
      return lang === "ar" ? `${facts.atlasPlaces} موضعًا تخطيطيًا` : `${facts.atlasPlaces} schematic places`;
    if (path === "/hadith" && facts.hadithSamples)
      return lang === "ar" ? `${facts.hadithSamples} عينات محلية قيد المراجعة` : `${facts.hadithSamples} local samples under review`;
    if (path === "/daily" && daily)
      return lang === "ar" ? `آية اليوم: ${daily.surahName} · ${daily.ayah}` : `Today's verse: ${daily.surahName} · ${daily.ayah}`;
    return undefined;
  };

  return (
    <SectionEntry3D wing="home">
    <div className={styles.page}>
      <section className={styles.hero} data-visual="home-gateway" dir="rtl" lang="ar">
        <img className={styles.heroBg} src={art.sceneThreshold} alt="" />
        <div className={styles.heroOrnament} />
        <div className={styles.heroBloom} aria-hidden />
        <div className={styles.heroVeil} />
        <div className={styles.heroIllumination} />
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>
            <span className={styles.kickerRule} aria-hidden />
            الموسوعة الحية للسيرة النبوية
            <span className={styles.kickerRule} aria-hidden />
          </p>
          <h1 className="calligraphy">
            يا رسول الله <span className={styles.heroSalat}>ﷺ</span>
          </h1>
          <p className={styles.heroLatin}>THE LIVING SEERAH</p>
          <p className={styles.heroSub}>
            رحلةٌ في المكان والزمان، من مكة إلى المدينة، ومن الغار إلى الفتح.
          </p>
          <p className={styles.heroDesc}>
            أطلسٌ حيّ، وفصولٌ غامرة، وقاعدةٌ زمنية تربط كل حدث بمصدره — دون تجسيد،
            ودون اختلاق. ادخل من البوابة، ثم اختر طريقك: الفصل، أو المكان، أو المصدر.
          </p>
          <div className={styles.heroActions}>
            <Link href="/seerah" className={styles.heroPrimary}>
              ابدأ رحلة السيرة <span aria-hidden>←</span>
            </Link>
            <Link href="/seerah/database" className={styles.heroSecondary}>
              قاعدة السيرة
            </Link>
            <Link href="/atlas" className={styles.heroSecondary}>
              الأطلس التاريخي
            </Link>
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
              placeholder="ابحث في بصيرة: حدث، موضع، أو مصدر…"
              aria-label="البحث في بصيرة"
            />
            <button type="submit">بحث</button>
          </form>
        </div>
        <div className={styles.heroFooter}>
          <p>
            <strong>{SEERAH_COUNTS.chapters}</strong> فصول
            <span aria-hidden>·</span>
            <strong>{SEERAH_COUNTS.timelineEvents}</strong> محطة
            <span aria-hidden>·</span>
            <strong>{SEERAH_COUNTS.categories}</strong> مراحل سردية
          </p>
          <a href="#knowledge-wings" className={styles.heroScroll}>
            اكتشف الأجنحة <span aria-hidden>↓</span>
          </a>
        </div>
      </section>

      <section className={styles.section} id="knowledge-wings">
        <div className={styles.headRow}>
          <div>
            <p className={styles.wingEyebrow}>
              {lang === "ar" ? "خريطة المؤسسة" : "INSTITUTION MAP"}
            </p>
            <SectionHead
              title={lang === "ar" ? "أجنحة المعرفة" : "Knowledge Wings"}
              en="Nine distinct ways to explore the message"
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
                  <span className={styles.gateIndex}>{String(i + 1).padStart(2, "0")} / {String(gateways.length).padStart(2, "0")}</span>
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
                  <span className={styles.gateIndex}>{String(i + 1).padStart(2, "0")} / {String(gateways.length).padStart(2, "0")}</span>
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
            <strong>{facts.readableVersions}</strong>
            <span>نسخة قابلة للقراءة</span>
          </div>
          <div className={styles.fact}>
            <strong>{facts.seerahChapters}</strong>
            <span>فصول سيرة</span>
          </div>
          <div className={styles.fact}>
            <strong>{facts.hadithSamples}</strong>
            <span>سجلات حديث محلية</span>
          </div>
          <div className={styles.fact}>
            <strong>{reciterCount ?? "—"}</strong>
            <span>تلاوة متاحة من المزوّد</span>
          </div>
        </div>
      </section>

      <section className={styles.bottomGrid}>
        <article className={styles.panel}>
          <SectionHead
            title="مواصلة محلية"
            en="Local reading progress"
            href={resumeTarget?.path ?? "/seerah"}
          />
          <div className={styles.continueRow}>
            <img src={art.bookStack} alt="" />
            <div className={styles.continueMeta}>
              <strong>{lang === "ar" ? "نشاط القراءة على هذا الجهاز" : "Reading activity on this device"}</strong>
              <p>
                {lang === "ar"
                  ? seerahProgress?.completed !== null && seerahProgress?.completed !== undefined
                    ? `السيرة: ${seerahProgress.completed} من ${seerahProgress.total ?? "—"} فصلًا`
                    : "لا يوجد عدد مقروء مسجل في السيرة"
                  : seerahProgress?.completed !== null && seerahProgress?.completed !== undefined
                    ? `Seerah: ${seerahProgress.completed} of ${seerahProgress.total ?? "—"} chapters`
                    : "No read-chapter count is recorded for Seerah"}
              </p>
              <p className="muted">
                {resumeTarget
                  ? lang === "ar"
                    ? `آخر موضع: ${resumeTarget.locationAr || resumeTarget.titleAr}`
                    : `Last position: ${resumeTarget.locationEn || resumeTarget.titleEn}`
                  : lang === "ar"
                    ? "لا يوجد موضع قراءة محفوظ بعد."
                    : "No saved reading position yet."}
              </p>
              {resumePercent !== null ? (
                <div
                  className={styles.progressBar}
                  role="progressbar"
                  aria-label={lang === "ar" ? "تقدم القراءة المحلي" : "Local reading progress"}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={resumePercent}
                >
                  <div style={{ width: `${resumePercent}%` }} />
                </div>
              ) : null}
              <span className={styles.pct}>
                {resumePercent !== null
                  ? lang === "ar"
                    ? `${resumePercent}% من الموضع المسجل`
                    : `${resumePercent}% of the recorded position`
                  : lang === "ar"
                    ? "موضع محفوظ محليًا — لا نسبة تقديرية"
                    : "Saved local position — no estimated percentage"}
              </span>
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
          <Link href={resumeTarget?.path ?? "/seerah"} className={styles.followBtn}>
            {resumeTarget
              ? lang === "ar"
                ? "متابعة من الموضع المحفوظ ←"
                : "Continue from the saved position ←"
              : lang === "ar"
                ? "ابدأ رحلة السيرة ←"
                : "Begin the Seerah journey ←"}
          </Link>
        </article>

        <article className={styles.inspire}>
          <img src={worldPlateForWing("home").plate} alt="" />
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

      <section className={styles.section}>
        <div className={styles.headRow}>
          <SectionHead
            title={lang === "ar" ? "أحدث الإضافات الموثقة" : "Latest verified additions"}
            en="Derived from the digital edition registry — verification dates, not invented publication dates"
            href="/library"
          />
        </div>
        <ul className={styles.additions} data-visual="home-recent-additions">
          {recentAdditions.map((item) => (
            <li key={item.versionId}>
              <Link href={item.path}>
                <strong>{lang === "ar" ? item.titleAr : item.titleEn}</strong>
                <span>{lang === "ar" ? item.authorAr : item.titleEn}</span>
                <small>
                  {lang === "ar" ? "توثيق السجل: " : "Registry check: "}
                  {new Date(item.checkedAt).toLocaleDateString(lang === "ar" ? "ar" : "en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </small>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {recentJourney.length > 0 ? (
        <section className={styles.section}>
          <SectionHead
            title={lang === "ar" ? "مسار تعلّمك" : "Your learning journey"}
            en="Recent activity on this device — private, never a piety score"
          />
          <ol className={styles.journeyList} data-visual="home-learning-journey">
            {recentJourney.map((event) => (
              <li key={event.id}>
                {event.path ? (
                  <Link href={event.path}>{event.label}</Link>
                ) : (
                  <span>{event.label}</span>
                )}
                <small>
                  {event.kind === "visit"
                    ? lang === "ar" ? "زيارة" : "Visit"
                    : event.kind === "bookmark"
                      ? lang === "ar" ? "حفظ" : "Saved"
                      : lang === "ar" ? "ملاحظة" : "Note"}
                </small>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

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
    </SectionEntry3D>
  );
}

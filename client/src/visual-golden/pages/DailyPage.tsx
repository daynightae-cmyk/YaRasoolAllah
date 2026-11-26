import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  RotateCcw,
  Sparkles,
  BookOpen,
  BookOpenCheck,
  ScrollText,
  GraduationCap,
  Compass,
  CalendarDays,
  Moon,
  Sun,
  Star,
  Heart,
  Check,
  Target,
  Copy,
  Volume2,
  Repeat,
  Bookmark,
} from "lucide-react";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { TasbihBeads } from "@/visual-golden/components/unique/TasbihBeads";
import { PrayerObservatory } from "@/visual-golden/components/prayer/PrayerObservatory";
import { QuranDuas } from "@/visual-golden/components/prayer/QuranDuas";
import { QuranAdhkar } from "@/visual-golden/components/prayer/QuranAdhkar";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { worldPlateForWing } from "@/visual-golden/lib/institution/worlds";
import { getDailyVerse, dailyVerseDayKey, type DailyVerse } from "@/services/quranService";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./DailyPage.module.css";

/** Spiritual rhythm of the day — narrative stations, not a ruling schedule. */
const RHYTHM = [
  { id: "qiyam", t: "قيام الليل", n: "تهجّد وخشوع", time: "قبل الفجر" },
  { id: "morning", t: "أذكار الصباح", n: "حصن وطمأنينة", time: "بعد الفجر" },
  { id: "work", t: "العبادة والعمل", n: "إتقان وإخلاص", time: "نهارًا" },
  { id: "evening", t: "أذكار المساء", n: "شكر ومراجعة", time: "بعد العصر" },
  { id: "night", t: "مراجعة اليوم", n: "محاسبة وذكر", time: "قبل النوم" },
] as const;

/** Daily worship routine — a personal checklist, honestly a user's own goals. */
const ROUTINE: { id: string; t: string; n: string; href?: string }[] = [
  { id: "quran", t: "قراءة القرآن", n: "ورد يومي ثابت", href: "/quran" },
  { id: "salah", t: "الصلاة في وقتها", n: "عمود الدين", href: "#daily-prayer" },
  { id: "adhkar", t: "أذكار اليوم", n: "حفظ، وطمأنينة، وبركة", href: "#daily-adhkar" },
  { id: "qiyam", t: "قيام الليل", n: "قرب وخشوع وتزكية", href: "#daily-rhythm" },
  { id: "sunan", t: "السنن الرواتب", n: "قبلية وبعدية", href: "/prayer-guide" },
  { id: "sadaqah", t: "الصدقة والإحسان", n: "قليل دائم خير من كثير منقطع" },
  { id: "siyam", t: "صيام النوافل", n: "الاثنين والخميس وأيام البيض", href: "/calendar" },
] as const;

/** Daily lessons — real governed surfaces, never invented lesson content. */
const LESSONS = [
  {
    kind: "درس قصير",
    t: "من وحي القرآن",
    n: "آية اليوم كاملة من المصحف الموثق، بمرجعها",
    href: "/daily-verse",
    Icon: BookOpenCheck,
  },
  {
    kind: "تذكير اليوم",
    t: "من السيرة النبوية",
    n: "فصول ومحطات مسجّلة بإحالاتها",
    href: "/seerah",
    Icon: ScrollText,
  },
  {
    kind: "حديث اليوم",
    t: "من الحديث الشريف",
    n: "أحاديث مختارة مع شرحها ومراجعها",
    href: "/hadith",
    Icon: ScrollText,
  },
  {
    kind: "فائدة تربوية",
    t: "من مركز بصيرة المعرفي",
    n: "مقالات ودراسات محكومة بحالة التحقق",
    href: "/basirah",
    Icon: GraduationCap,
  },
] as const;

/** Quick tools — every entry is a real, canonical in-platform surface. */
const TOOLS = [
  { t: "التقويم الهجري", href: "/calendar", Icon: CalendarDays },
  { t: "دليل الصلاة", href: "/prayer-guide", Icon: BookOpen },
  { t: "اتجاه القبلة", href: "/qibla-compass", Icon: Compass },
  { t: "تسبيح إلكتروني", href: "/digital-tasbih", Icon: RotateCcw },
  { t: "آية اليوم", href: "/daily-verse", Icon: BookOpenCheck },
  { t: "أركان الإسلام", href: "/five-pillars", Icon: Star },
  { t: "المعرفة الإسلامية", href: "/islamic-knowledge", Icon: GraduationCap },
  { t: "يوم النبي", href: "/prophetic-day", Icon: Sun },
] as const;

const QUICK_DHIKR = ["سبحان الله", "الحمد لله", "الله أكبر", "لا إله إلا الله", "أستغفر الله", "حسبي الله"];

/* --- Local, per-day routine persistence (fail-closed sanitizer). --- */
const ROUTINE_KEY = "yra-daily-routine-v1";

function localDayKey(at = new Date()): string {
  return `${at.getFullYear()}-${at.getMonth() + 1}-${at.getDate()}`;
}

function safeReadRoutine(): string[] {
  try {
    const raw = localStorage.getItem(ROUTINE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];
    const bag = parsed as { date?: unknown; ids?: unknown };
    if (bag.date !== localDayKey()) return [];
    if (!Array.isArray(bag.ids)) return [];
    const known = new Set<string>(ROUTINE.map((item) => item.id));
    return bag.ids.filter((value): value is string => typeof value === "string" && known.has(value));
  } catch {
    return [];
  }
}

function writeRoutine(ids: string[]) {
  try {
    localStorage.setItem(ROUTINE_KEY, JSON.stringify({ date: localDayKey(), ids }));
  } catch {
    /* storage may be unavailable; the checklist still works for this session */
  }
}

interface CalendarParts {
  weekday: string;
  gDay: string;
  gMonth: string;
  gYear: string;
  hDay: string;
  hMonth: string;
  hYear: string;
}

/** Real Hijri (Umm al-Qura) + Gregorian date from the runtime calendar. */
function readCalendar(): CalendarParts | null {
  try {
    const h = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    }).formatToParts(new Date());
    const g = new Intl.DateTimeFormat("ar", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).formatToParts(new Date());
    const pick = (parts: Intl.DateTimeFormatPart[], type: string) =>
      parts.find((part) => part.type === type)?.value ?? "";
    return {
      weekday: pick(h, "weekday"),
      gDay: pick(g, "day"),
      gMonth: pick(g, "month"),
      gYear: pick(g, "year"),
      hDay: pick(h, "day"),
      hMonth: pick(h, "month"),
      hYear: pick(h, "year"),
    };
  } catch {
    return null;
  }
}

export function DailyPage() {
  const tasbih = useInstitution((s) => s.tasbih);
  const setTasbih = useInstitution((s) => s.setTasbih);
  const count = tasbih.count;
  const dhikr = tasbih.dhikr;
  // Functional updates resolve against live store state so rapid taps
  // accumulate rather than overwriting each other with a stale render count.
  const setCount = (next: number | ((c: number) => number)) =>
    setTasbih(typeof next === "function" ? (current) => ({ count: next(current.count) }) : { count: next });
  const setDhikr = (next: string) => setTasbih({ dhikr: next });

  const [hour, setHour] = useState(2);
  const wash = hour <= 0 ? p.night : hour <= 1 ? p.dawn : hour <= 2 ? p.noon : hour <= 3 ? p.dusk : p.night;

  const [routine, setRoutine] = useState<string[]>(() => safeReadRoutine());
  const toggleRoutine = (id: string) => {
    setRoutine((current) => {
      const next = current.includes(id) ? current.filter((value) => value !== id) : [...current, id];
      writeRoutine(next);
      return next;
    });
  };
  const routineDone = routine.length;
  const routinePercent = Math.round((routineDone / ROUTINE.length) * 100);

  const [verse, setVerse] = useState<DailyVerse | null>(null);
  const [verseFailed, setVerseFailed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    getDailyVerse()
      .then((result) => {
        if (!cancelled) setVerse(result);
      })
      .catch(() => {
        if (!cancelled) setVerseFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const calendar = useMemo(() => readCalendar(), []);
  const verseDay = useMemo(() => dailyVerseDayKey(), []);

  return (
    <div className={styles.page}>
      <div className={`${p.hourWash} ${wash}`} aria-hidden />

      {/* ================= HERO — approved reference 09_daily.png ================= */}
      <header className={styles.hero} data-visual="daily-hero" aria-labelledby="daily-hero-title">
        <img className={styles.heroPlate} src={worldPlateForWing("daily").plate} alt="" aria-hidden="true" />
        <div className={styles.heroShade} aria-hidden="true" />

        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>
            <Sparkles size={15} aria-hidden="true" /> الهداية اليومية
          </p>
          <h1 id="daily-hero-title" className={styles.heroTitle}>الهداية اليومية والعبادة</h1>
          <p className={styles.heroLead}>
            دليلك العملي ليومٍ مبارك يجمع بين العبادة، والذكر، وتزكية النفس، واستثمار الأوقات
            في طاعة الله على هدي القرآن والسنة.
          </p>
          <ul className={styles.heroFeatures}>
            <li><Check size={15} aria-hidden="true" /> إرشادات عملية لعبادة أفضل</li>
            <li><Check size={15} aria-hidden="true" /> هداية وتزكية مستمرة في يومك</li>
            <li><Check size={15} aria-hidden="true" /> روتين عبادي متوازن ليلك ونهارك</li>
          </ul>
          <div className={styles.heroCtas}>
            <button
              type="button"
              className={styles.heroGhost}
              onClick={() => document.getElementById("daily-rhythm")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Moon size={15} aria-hidden="true" /> إيقاع العبادة اليومي
            </button>
            <button
              type="button"
              className={styles.heroPrimary}
              onClick={() => document.getElementById("daily-routine")?.scrollIntoView({ behavior: "smooth" })}
            >
              <Target size={15} aria-hidden="true" /> ابدأ روتينك اليومي
            </button>
          </div>
        </div>

        <aside className={styles.heroCard} data-visual="daily-today-guidance" aria-label="توجيه اليوم">
          <span className={styles.heroCardKicker}><Sun size={14} aria-hidden="true" /> توجيه اليوم</span>
          <p className={styles.heroCardTitle}>من وحي القرآن الكريم</p>
          {verse ? (
            <>
              <p className={styles.heroVerse} lang="ar" dir="rtl">{verse.arabic}</p>
              <p className={styles.heroRef}>
                سورة {verse.surahName} · الآية {verse.ayah}
                <span aria-hidden="true"> · </span>
                <Link href={`/quran?surah=${verse.surah}&ayah=${verse.ayah}`} className={styles.heroCardLink}>
                  افتح في المصحف
                </Link>
              </p>
            </>
          ) : verseFailed ? (
            <p className={styles.heroRef} role="status">
              تعذّر قراءة آية اليوم من المصحف المحلي — لا يُعرض نص بديل غير موثق.
            </p>
          ) : (
            <p className={styles.heroRef} role="status">جارٍ قراءة آية اليوم من المصحف الموثق…</p>
          )}
          <p className={styles.heroCardNote} data-verse-day={verseDay}>
            الآية تُختار تلقائيًا من المصحف العربي الموثق وتتبدّل كل يوم.
          </p>
        </aside>
      </header>

      {/* ================= PRAYER OBSERVATORY — the real prayer surface ================= */}
      <div id="daily-prayer">
        <PrayerObservatory />
      </div>

      {/* ================= SPIRITUAL RHYTHM ================= */}
      <section className={styles.rhythm} id="daily-rhythm" data-visual="daily-rhythm" aria-label="إيقاع اليوم الروحي">
        <header className={styles.rhythmHead}>
          <div>
            <p className={styles.sectionKicker}><Moon size={15} aria-hidden="true" /> إيقاع اليوم الروحي</p>
            <h2>من قيام الليل إلى مراجعة اليوم</h2>
          </div>
          <p className={styles.rhythmHint}>محطات يومية إرشادية — لا مواقيت شرعية بديلة.</p>
        </header>
        <ol className={styles.rhythmList}>
          {RHYTHM.map((station, index) => (
            <li key={station.id}>
              <button
                type="button"
                className={index === hour ? `${styles.rhythmItem} ${styles.rhythmItemOn}` : styles.rhythmItem}
                aria-pressed={index === hour}
                onClick={() => setHour(index)}
              >
                <i className={styles.rhythmNode} aria-hidden="true" />
                <b>{station.t}</b>
                <span>{station.time}</span>
                <small>{station.n}</small>
              </button>
            </li>
          ))}
        </ol>
      </section>

      {/* ================= MAIN GRID ================= */}
      <div className={styles.grid}>
        <section className={styles.panel} id="daily-adhkar" aria-label="أذكار اليوم">
          <SectionHead title="أذكار اليوم" en="Quranic remembrance · verified corpus" />
          <QuranAdhkar />
        </section>

        <div className={styles.col}>
          <section className={styles.calendarCard} data-visual="daily-calendar" aria-label="التقويم الهجري والميلادي">
            <header className={styles.calHead}>
              <CalendarDays size={16} aria-hidden="true" />
              <h3>التقويم الهجري والميلادي</h3>
            </header>
            {calendar ? (
              <div className={styles.calRow}>
                <div className={styles.calBlock}>
                  <b>{calendar.gDay}</b>
                  <span>{calendar.gMonth}</span>
                  <small>{calendar.gYear}</small>
                </div>
                <span className={styles.calDivider} aria-hidden="true" />
                <div className={styles.calBlock}>
                  <b>{calendar.hDay}</b>
                  <span>{calendar.hMonth}</span>
                  <small>{calendar.hYear} هـ</small>
                </div>
              </div>
            ) : (
              <p className={styles.calNote} role="status">التقويم الهجري غير متاح على هذا الجهاز.</p>
            )}
            <p className={styles.calNote}>
              {calendar ? `${calendar.weekday} · ` : ""}
              التقويم الهجري محسوب محليًا (أم القرى). المناسبات الرسمية غير مربوطة بعد بمصدر محكوم.
            </p>
          </section>

          <section className={styles.wirdCard} data-visual="daily-wird" aria-label="وردك اليومي من القرآن الكريم">
            <header className={styles.calHead}>
              <BookOpen size={16} aria-hidden="true" />
              <h3>وردك اليومي من القرآن الكريم</h3>
            </header>
            <div className={styles.wirdGrid}>
              <div>
                <b>القراءة</b>
                <span>المصحف العربي الموثق</span>
              </div>
              <div>
                <b>التلاوة</b>
                <span>روافد الصوت المسجّلة</span>
              </div>
            </div>
            <div className={styles.wirdActions}>
              <Link href="/quran" className="btn-gold">ابدأ ورد القرآن</Link>
              <Link href="/audio" className="btn-outline">استمع للتلاوات</Link>
            </div>
            <p className={styles.calNote}>
              لا نعرض مواعيد أجزاء أو أحزاب غير مربوطة بمصدر محكوم؛ الورد دعوة للقراءة، والقارئ يختار موضعه.
            </p>
          </section>
        </div>

        <section className={styles.panel} aria-label="المسبحة الإلكترونية">
          <div className={styles.tasbihHead}>
            <SectionHead title="المسبحة الإلكترونية" en="Tasbih Counter" />
            <button type="button" onClick={() => setCount(0)} aria-label="إعادة">
              <RotateCcw size={14} />
            </button>
          </div>
          <div className={styles.counter}>
            <button type="button" onClick={() => setCount((c) => Math.max(0, c - 1))}>−</button>
            <span key={count}>{count}</span>
            <button type="button" onClick={() => setCount((c) => c + 1)}>+</button>
          </div>
          <TasbihBeads count={count} onCount={setCount} />
          <p className={styles.dhikr}>{dhikr}</p>
          <div className={styles.presets}>
            {[33, 100, 300, 1000].map((n) => (
              <button key={n} type="button" className={count === n ? styles.on : ""} onClick={() => setCount(n)}>
                {n}
              </button>
            ))}
          </div>
          <div className={styles.quickDhikr} aria-label="اختر ذكرًا">
            {QUICK_DHIKR.map((q) => (
              <button key={q} type="button" className={dhikr === q ? styles.on : ""} onClick={() => setDhikr(q)}>
                {q}
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* ================= DAILY WORSHIP ROUTINE ================= */}
      <section className={styles.routine} id="daily-routine" data-visual="daily-routine" aria-label="روتينك العبادي اليومي">
        <header className={styles.routineHead}>
          <div>
            <p className={styles.sectionKicker}><Target size={15} aria-hidden="true" /> روتينك العبادي اليومي</p>
            <h2>خطوات عملية ليومٍ مبارك</h2>
            <p>قائمة شخصية تحفظ تقدمك على هذا الجهاز — أهدافك أنت، وليست حكمًا شرعيًا.</p>
          </div>
          <div className={styles.routineProgress} role="img" aria-label={`أنجزت ${routineDone} من ${ROUTINE.length} خطوات`}>
            <span>{routineDone}</span>
            <small>من {ROUTINE.length}</small>
          </div>
        </header>
        <ul className={styles.routineList}>
          {ROUTINE.map((item) => {
            const done = routine.includes(item.id);
            return (
              <li key={item.id} className={done ? styles.routineItemOn : styles.routineItem}>
                <button
                  type="button"
                  className={styles.routineCheck}
                  aria-pressed={done}
                  aria-label={`${done ? "إلغاء" : "إتمام"} خطوة: ${item.t}`}
                  onClick={() => toggleRoutine(item.id)}
                >
                  {done ? <Check size={15} aria-hidden="true" /> : null}
                </button>
                <div className={styles.routineBody}>
                  <b>{item.t}</b>
                  <span>{item.n}</span>
                </div>
                {item.href ? (
                  item.href.startsWith("#") ? (
                    <button
                      type="button"
                      className={styles.routineLink}
                      onClick={() =>
                        document.getElementById(item.href!.slice(1))?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      اذهب
                    </button>
                  ) : (
                    <Link href={item.href} className={styles.routineLink}>افتح</Link>
                  )
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ================= DAILY LESSONS ================= */}
      <section className={styles.lessons} data-visual="daily-lessons" aria-label="دروس وإرشادات يومية">
        <header className={styles.lessonsHead}>
          <div>
            <p className={styles.sectionKicker}><GraduationCap size={15} aria-hidden="true" /> دروس وإرشادات يومية</p>
            <h2>محتوى مختصر يعينك على العبادة والتزكية</h2>
          </div>
        </header>
        <div className={styles.lessonsGrid}>
          {LESSONS.map(({ kind, t, n, href, Icon }) => (
            <Link key={href} href={href} className={styles.lessonCard}>
              <span className={styles.lessonKind}>{kind}</span>
              <strong>{t}</strong>
              <small>{n}</small>
              <span className={styles.lessonGo}><Icon size={16} aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= PROGRESS + QUICK TOOLS ================= */}
      <div className={styles.lower}>
        <section className={styles.progressCard} data-visual="daily-progress" aria-label="متابعة روحيتك اليوم">
          <header className={styles.calHead}>
            <Target size={16} aria-hidden="true" />
            <h3>متابعة روحيتك اليوم</h3>
          </header>
          <div className={styles.ringWrap}>
            <svg className={styles.ring} viewBox="0 0 120 120" role="img" aria-label={`نسبة إنجاز الروتين ${routinePercent} بالمئة`}>
              <circle cx="60" cy="60" r="52" className={styles.ringTrack} />
              <circle
                cx="60"
                cy="60"
                r="52"
                className={styles.ringBar}
                style={{ strokeDasharray: `${(routinePercent / 100) * 326.7} 326.7` }}
              />
            </svg>
            <span className={styles.ringValue}>{routinePercent}%</span>
          </div>
          <p className={styles.ringNote}>
            النسبة محسوبة من خطوات روتينك المكتملة اليوم ({routineDone} من {ROUTINE.length}) على هذا الجهاز فقط،
            ولا تعبّر عن ثواب أو قبول.
          </p>
        </section>

        <section className={styles.toolsCard} data-visual="daily-tools" aria-label="أدوات سريعة للعبادة والمعرفة">
          <header className={styles.calHead}>
            <Compass size={16} aria-hidden="true" />
            <h3>أدوات سريعة للعبادة والمعرفة</h3>
          </header>
          <div className={styles.toolsGrid}>
            {TOOLS.map(({ t, href, Icon }) => (
              <Link key={href} href={href} className={styles.toolItem}>
                <Icon size={18} aria-hidden="true" />
                <span>{t}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.panel} aria-label="أدعية من القرآن">
          <SectionHead title="أدعية من القرآن" en="Qur'anic Duʿas · verified corpus" />
          <QuranDuas />
        </section>

        <section className={styles.panel} aria-label="بطاقات الذكر">
          <SectionHead title="بطاقات الذكر" en="Quick reminders" />
          <div className={styles.dhikrCards}>
            <span><Heart size={15} aria-hidden="true" /> صدقة ولو قليلة</span>
            <span><Repeat size={15} aria-hidden="true" /> استغفار متصل</span>
            <span><Copy size={15} aria-hidden="true" /> اجعل وردك ثابتًا</span>
            <span><Bookmark size={15} aria-hidden="true" /> احفظ مفضلاتك</span>
            <span><Volume2 size={15} aria-hidden="true" /> استمع وتدبّر</span>
            <span><Star size={15} aria-hidden="true" /> سنن لا تغفل عنها</span>
          </div>
        </section>
      </div>
    </div>
  );
}

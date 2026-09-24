import { useState } from "react";
import {
  Bookmark,
  Share2,
  Copy,
  Star,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  StickyNote,
  MoreHorizontal,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { FocusBar } from "@/visual-golden/components/present/FocusBar";
import styles from "./QuranPage.module.css";

const surahs = [
  { id: 1, name: "سورة الفاتحة", en: "Al-Fatiha" },
  { id: 2, name: "سورة البقرة", en: "Al-Baqarah" },
  { id: 3, name: "سورة آل عمران", en: "Al-Imran" },
  { id: 4, name: "سورة النساء", en: "An-Nisa" },
  { id: 5, name: "سورة المائدة", en: "Al-Ma'idah" },
  { id: 6, name: "سورة الأنعام", en: "Al-An'am" },
  { id: 7, name: "سورة الأعراف", en: "Al-A'raf" },
  { id: 8, name: "سورة الأنفال", en: "Al-Anfal" },
  { id: 9, name: "سورة التوبة", en: "At-Tawbah" },
  { id: 10, name: "سورة يونس", en: "Yunus" },
];

const ayat = [
  { n: 1, t: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
  { n: 2, t: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
  { n: 3, t: "الرَّحْمَٰنِ الرَّحِيمِ" },
  { n: 4, t: "مَالِكِ يَوْمِ الدِّينِ" },
  { n: 5, t: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
  { n: 6, t: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
  { n: 7, t: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ" },
];

const words = [
  { ar: "الحمد", en: "All praise" },
  { ar: "رب", en: "Lord" },
  { ar: "العالمين", en: "The worlds" },
  { ar: "الرحمن", en: "The Most Merciful" },
];

export function QuranPage() {
  const [active, setActive] = useState(1);
  const [tab, setTab] = useState<"surah" | "juz" | "marks">("surah");
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);
  const [focus, setFocus] = useState(false);
  const [lamp, setLamp] = useState(true);
  const [ayah, setAyah] = useState(1);
  const surah = surahs.find((s) => s.id === active) ?? surahs[0];

  return (
    <div className={`${styles.page} ${focus ? styles.focus : ""}`}>
      {focus ? null : (
        <PageHero
          title="رواق القرآن"
          subtitle="تلاوة · تدبّر · علم · عمل"
          desc="اقرأ وارتَقِ … فكل آية نور"
          image={art.mushafOpen}
          compact
          wing="quran"
        />
      )}
      <FocusBar
        focus={focus}
        onFocus={() => setFocus((v) => !v)}
        extra={{ label: lamp ? "إطفاء المصباح" : "إضاءة المصباح", on: lamp, onClick: () => setLamp((v) => !v) }}
      />

      <div className={styles.workspace}>
        {focus ? null : (
          <aside className={styles.surahNav}>
            <div className={styles.tabs}>
              <button type="button" className={tab === "surah" ? styles.tabOn : ""} onClick={() => setTab("surah")}>
                السور
              </button>
              <button type="button" className={tab === "juz" ? styles.tabOn : ""} onClick={() => setTab("juz")}>
                الأجزاء
              </button>
              <button type="button" className={tab === "marks" ? styles.tabOn : ""} onClick={() => setTab("marks")}>
                العلامات
              </button>
            </div>
            <input placeholder="ابحث في السور..." className={styles.search} />
            <ul>
              {surahs.map((s) => (
                <li
                  key={s.id}
                  className={active === s.id ? styles.active : ""}
                  onClick={() => setActive(s.id)}
                >
                  <span className={styles.num}>{s.id}</span>
                  <div>
                    <strong>{s.name}</strong>
                    <em>{s.en}</em>
                  </div>
                  <Star size={13} />
                </li>
              ))}
            </ul>
          </aside>
        )}

        <main className={styles.reader}>
          <div className={styles.sheetHead}>
            <span>الجزء 1</span>
            <h2>{surah.name}</h2>
            <span>الصفحة 1</span>
          </div>
          <div className={`${styles.sheet} ${lamp ? styles.lampOn : ""}`}>
            <button className={styles.sheetNav} type="button" aria-label="السابق" onClick={() => setActive((n) => Math.max(1, n - 1))}>
              <ChevronRight size={18} />
            </button>
            <div className={styles.ayat}>
              {ayat.map((a) => (
                <p
                  key={a.n}
                  className={`${styles.ayah} ${ayah === a.n ? styles.ayahOn : ""}`}
                  onClick={() => setAyah(a.n)}
                >
                  {a.t}
                  <span className={styles.ayahNum}>{a.n}</span>
                </p>
              ))}
            </div>
            <button className={styles.sheetNav} type="button" aria-label="التالي" onClick={() => setActive((n) => Math.min(10, n + 1))}>
              <ChevronLeft size={18} />
            </button>
          </div>
          <div className={styles.player}>
            <img src={art.kaaba} alt="" />
            <div>
              <strong>{surah.name}</strong>
              <span>الشيخ عبد الباسط عبد الصمد</span>
            </div>
            <button className={styles.play} type="button" onClick={() => setPlaying((p) => !p)}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <div className={styles.scrub}>
              <i style={{ width: playing ? "38%" : "18%" }} />
            </div>
            <span>0:52</span>
          </div>
        </main>

        {focus ? null : (
          <aside className={styles.sidePanel}>
            <h4>الجزء والصفحة</h4>
            <div className={styles.pages}>
              {[1, 2, 3, 4].map((pg) => (
                <div key={pg} className={pg === 1 ? styles.pageOn : ""}>
                  <img src={art.mushafOpen} alt="" />
                  <span>{pg}</span>
                </div>
              ))}
            </div>
            <h4>أدوات الآية</h4>
            <div className={styles.toolGrid}>
              <button type="button">
                <Copy size={14} /> نسخ الآية
              </button>
              <button type="button">
                <Share2 size={14} /> مشاركة
              </button>
              <button type="button" className={saved ? styles.toolOn : ""} onClick={() => setSaved((s) => !s)}>
                <Bookmark size={14} /> المفضلة
              </button>
              <button type="button">
                <StickyNote size={14} /> ملاحظة
              </button>
              <button type="button">
                <MoreHorizontal size={14} /> المزيد
              </button>
            </div>
            <h4>التفسير المختصر</h4>
            <p className={styles.tafsirBox}>[التفسير سيُربط لاحقًا] الحمد لله رب العالمين: الثناء على الله بجميع محامد الكمال.</p>
            <h4>معاني الكلمات</h4>
            <div className={styles.words}>
              {words.map((w) => (
                <span key={w.ar}>
                  <b>{w.ar}</b>
                  <em>{w.en}</em>
                </span>
              ))}
            </div>
          </aside>
        )}
      </div>

      {focus ? null : (
        <footer className={styles.progress}>
          <span>خطة القراءة</span>
          <b>3%</b>
          <span>الجزء 1 من 30</span>
          <span>1 أجزاء مكتملة</span>
          <span>23 صفحات مقروءة</span>
          <span>7 أيام متتالية</span>
        </footer>
      )}
    </div>
  );
}

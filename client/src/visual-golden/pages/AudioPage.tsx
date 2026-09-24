import { useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  Share2,
  Repeat,
  Shuffle,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { Waveform } from "@/visual-golden/components/unique/Waveform";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./AudioPage.module.css";

const reciters = [
  { name: "عبد الرحمن السديس", img: art.reciterDome },
  { name: "سعود الشريم", img: art.reciterKaaba },
  { name: "مشاري العفاسي", img: art.reciterWater },
  { name: "ماهر المعيقلي", img: art.reciterLanterns },
  { name: "ياسر الدوسري", img: art.reciterCourtyard },
  { name: "أحمد العجمي", img: art.archesNight },
  { name: "عبد الباسط عبد الصمد", img: art.reciterMushaf },
  { name: "محمد صديق المنشاوي", img: art.dome },
];

const playlist = [
  { name: "سورة البقرة", duration: null as string | null },
  { name: "سورة آل عمران", duration: null },
  { name: "سورة النساء", duration: null },
  { name: "سورة المائدة", duration: null },
  { name: "سورة الأنعام", duration: null },
];

const surahBrowse = [
  { name: "سورة الفاتحة", n: 7 },
  { name: "سورة البقرة", n: 286 },
  { name: "سورة آل عمران", n: 200 },
  { name: "سورة النساء", n: 176 },
];

const cats = ["القرآن الكريم", "مؤثرات إسلامية", "الأدعية والأذكار", "تلاوات نادرة", "مقاطع قصيرة", "خطب ومحاضرات"];
const lists = [
  { title: "أجمل التلاوات", img: art.mosque, n: 48 },
  { title: "تلاوات لصلاة القيام", img: art.kaaba, n: 32 },
  { title: "تلاوات للنوم والراحة", img: art.lantern, n: 28 },
  { title: "سور الحفظ والمراجعة", img: art.mushaf, n: 114 },
];

export function AudioPage() {
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(0);
  const [reciter, setReciter] = useState(0);
  const [loved, setLoved] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <img className={styles.bg} src={art.kaaba} alt="" />
        <div className={styles.nowPlaying}>
          <div className={p.vinyl}>
            <div className={`${p.vinylDisc} ${playing ? p.spinning : ""}`} />
            <div className={p.vinylHub}>
              <img src={art.mushaf} alt="" />
            </div>
            {playing ? (
              <span className={p.rings} aria-hidden>
                <i />
                <i />
                <i />
              </span>
            ) : null}
          </div>
          <div>
            <span className={styles.label}>التلاوة الحالية</span>
            <h1>{playlist[active].name}</h1>
            <p>{reciters[reciter].name}</p>
            <p className="muted">لا يوجد ملف صوتي مرتبط بعد — عناصر التشغيل للتجربة البصرية.</p>
            <Waveform playing={playing} />
            <div className={styles.tags}>
              <span>مصحف المدينة</span>
              <span>جودة عالية</span>
            </div>
            <div className={styles.mini}>
              <button type="button" className={loved ? styles.on : ""} onClick={() => setLoved((v) => !v)}>
                <Heart size={16} />
              </button>
              <button type="button">
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
        <aside className={styles.playlist}>
          <h3>قائمة التشغيل الحالية</h3>
          <ul>
            {playlist.map((p, i) => (
              <li
                key={p.name}
                className={i === active ? styles.activeTrack : ""}
                onClick={() => {
                  setActive(i);
                  setPlaying(true);
                }}
              >
                <span>{i + 1}</span>
                <div>
                  <strong>{p.name}</strong>
                  <em>{p.duration ?? "—"}</em>
                </div>
                {i === active && playing ? (
                  <div className={`${styles.eq} ${styles.eqOn}`} aria-hidden>
                    <i />
                    <i />
                    <i />
                  </div>
                ) : (
                  <Play size={14} />
                )}
              </li>
            ))}
          </ul>
        </aside>
        <div className={styles.player}>
          <div className={styles.progress}>
            <span>—</span>
            <div className={styles.bar}>
              <div style={{ width: playing ? "8%" : "0%" }} />
            </div>
            <span>—</span>
          </div>
          <div className={styles.controls}>
            <button type="button">
              <Shuffle size={16} />
            </button>
            <button type="button" onClick={() => setActive((i) => Math.max(0, i - 1))}>
              <SkipBack size={20} />
            </button>
            <button className={styles.playBtn} type="button" onClick={() => setPlaying(!playing)}>
              {playing ? <Pause size={28} /> : <Play size={28} />}
            </button>
            <button type="button" onClick={() => setActive((i) => Math.min(playlist.length - 1, i + 1))}>
              <SkipForward size={20} />
            </button>
            <button type="button">
              <Repeat size={16} />
            </button>
            <button type="button">
              <Volume2 size={18} />
            </button>
            <span>1.0x</span>
          </div>
        </div>
      </header>

      <section className={styles.pad}>
        <SectionHead title="القراء المميزون" en="Featured Reciters" href="/audio" />
        <div className={`${styles.reciters} stagger`}>
          {reciters.map((r, i) => (
            <button
              key={r.name}
              type="button"
              className={`${styles.reciter} ${i === reciter ? styles.recOn : ""}`}
              onClick={() => setReciter(i)}
            >
              <img src={r.img} alt="" />
              <span>{r.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className={styles.lower}>
        <section className={styles.box}>
          <SectionHead title="الاستماع حسب السورة" en="Browse by Surah" />
          <ul className={styles.surahs}>
            {surahBrowse.map((s) => (
              <li key={s.name}>
                <span>{s.name}</span>
                <em>{s.n} مقطع</em>
              </li>
            ))}
          </ul>
        </section>
        <section className={styles.box}>
          <SectionHead title="التصنيفات" en="Audio Categories" />
          <div className={styles.cats}>
            {cats.map((c) => (
              <button key={c} type="button">
                {c}
              </button>
            ))}
          </div>
        </section>
        <section className={styles.box}>
          <SectionHead title="قوائم مختارة" en="Curated Playlists" />
          <div className={styles.lists}>
            {lists.map((l) => (
              <article key={l.title}>
                <img src={l.img} alt="" />
                <div>
                  <strong>{l.title}</strong>
                  <span>{l.n} تلاوة</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

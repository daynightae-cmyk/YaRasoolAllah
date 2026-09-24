import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Heart, Share2, ExternalLink, ShieldCheck, Lock } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { Waveform } from "@/visual-golden/components/unique/Waveform";
import p from "@/visual-golden/components/present/present.module.css";
import {
  getQuranChapters,
  type QuranChapter,
} from "@/services/quranService";
import {
  AUDIO_COUNTS,
  AUDIO_PROVIDERS,
  rightsLabel,
} from "@/visual-golden/services/audio";
import styles from "./AudioPage.module.css";

export function AudioPage() {
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [active, setActive] = useState(1);
  const [loved, setLoved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getQuranChapters()
      .then((items) => {
        if (!cancelled) setChapters(items);
      })
      .catch(() => {
        if (!cancelled) setChapters([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = chapters.find((chapter) => chapter.number === active) ?? null;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <img className={styles.bg} src={art.kaaba} alt="" />
        <div className={styles.nowPlaying}>
          <div className={p.vinyl}>
            <div className={p.vinylDisc} />
            <div className={p.vinylHub}>
              <img src={art.mushaf} alt="" />
            </div>
          </div>
          <div>
            <span className={styles.label}>مسرح الاستماع · سجل المزوّدين</span>
            <h1>{current ? `سورة ${current.arabicName}` : "التلاوات الصوتية"}</h1>
            <p>
              {current
                ? `${current.englishName} · ${current.ayahCount} آية — لا يوجد تسجيل معتمد مربوط بهذه السورة`
                : "جارٍ تحميل فهرس السور…"}
            </p>
            <p className="muted" style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <Lock size={13} /> التشغيل غير مفعّل — {AUDIO_COUNTS.clearedRecordings} تسجيلات مُجازة
              داخل المنصة
            </p>
            <Waveform playing={false} />
            <div className={styles.tags}>
              <span>سجل المزوّد</span>
              <span>التشغيل غير مُجاز</span>
            </div>
            <div className={styles.mini}>
              <button type="button" className={loved ? styles.on : ""} onClick={() => setLoved((v) => !v)} aria-label="حفظ محلي">
                <Heart size={16} />
              </button>
              <button type="button" aria-label="مشاركة السجل" disabled title="لا يوجد تسجيل لمشاركته" style={{ opacity: 0.55 }}>
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
        <aside className={styles.playlist}>
          <h3>التصفح حسب السورة ({chapters.length || 114})</h3>
          <ul>
            {chapters.slice(0, 24).map((chapter, i) => (
              <li
                key={chapter.number}
                className={chapter.number === active ? styles.activeTrack : ""}
                onClick={() => setActive(chapter.number)}
              >
                <span>{i + 1}</span>
                <div>
                  <strong>سورة {chapter.arabicName}</strong>
                  <em>{chapter.ayahCount} آية · بدون تسجيل معتمد</em>
                </div>
              </li>
            ))}
          </ul>
          <p className="muted" style={{ fontSize: "0.75rem", padding: "0 0.6rem" }}>
            أول 24 سورة من الفهرس الموثق — التصفح الكامل للسور في{" "}
            <Link href="/quran">رواق القرآن</Link>.
          </p>
        </aside>
        <div className={styles.player}>
          <div className={styles.progress}>
            <span>—</span>
            <div className={styles.bar}>
              <div style={{ width: "0%" }} />
            </div>
            <span>—</span>
          </div>
          <div className={styles.controls}>
            <span
              className="btn-outline"
              style={{ opacity: 0.65, cursor: "not-allowed", fontSize: "0.78rem", padding: "0.4rem 0.8rem", borderRadius: 10 }}
              title="التشغيل والإيقاف والتنقل والمدة والتنزيل غير مفعّلة: لا توجد وسائط مُجازة"
            >
              عناصر التشغيل معطلة — لا توجد وسائط مُجازة
            </span>
          </div>
        </div>
      </header>

      <section className={styles.pad}>
        <SectionHead title="سجل المزوّدين الصوتيين" en="Provider catalog — playback not cleared" />
        <div className={`${styles.reciters} stagger`}>
          {AUDIO_PROVIDERS.map((provider) => (
            <article key={provider.providerId} className={styles.reciter} style={{ cursor: "default" }}>
              <div style={{ padding: "0.7rem", textAlign: "start" }}>
                <strong style={{ display: "block", fontSize: "0.92rem" }}>{provider.provider}</strong>
                <span style={{ fontSize: "0.75rem", display: "flex", gap: 4, alignItems: "center" }}>
                  <ShieldCheck size={12} /> {rightsLabel(provider.rightsState)}
                </span>
                <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>{provider.productionUse}</span>
                <a
                  href={provider.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 4, marginTop: "0.3rem" }}
                >
                  <ExternalLink size={12} /> الموقع الرسمي
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.lower}>
        <section className={styles.box}>
          <SectionHead title="مكتب الحقوق الصوتية" en="Rights desk" />
          <p className="muted" style={{ fontSize: "0.82rem", lineHeight: 1.9 }}>
            لا تُحوَّل روابط المزوّدين الخارجيين إلى ادعاء تشغيل إنتاجي. كل تسجيل يحتاج مراجعة
            حقوق على مستوى التسجيل قبل التفعيل — عدد التسجيلات المُجازة حاليًا:{" "}
            {AUDIO_COUNTS.clearedRecordings}. لا تُعرض مدد مزيفة ولا تقدّم زائف ولا عدّادات
            استماع.
          </p>
        </section>
        <section className={styles.box}>
          <SectionHead title="النص العربي الموثق" en="Verified Arabic text" />
          <p className="muted" style={{ fontSize: "0.82rem", lineHeight: 1.9 }}>
            النص العربي الكامل متاح للقراءة في{" "}
            <Link href="/quran">رواق القرآن</Link> (Tanzil Uthmani-min 1.1) — الصوت فقط هو
            غير المربوط.
          </p>
        </section>
        <section className={styles.box}>
          <SectionHead title="شروط التفعيل" en="What enabling requires" />
          <p className="muted" style={{ fontSize: "0.82rem", lineHeight: 1.9 }}>
            لا يُفعَّل أي زر تشغيل أو تنزيل قبل: تسجيل مُكتسب قانونيًا، مراجعة ترخيص كل
            تسجيل على حدة، ونسبة المصدر ظاهرة بجانب كل تسجيل.
          </p>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Heart, Share2, ExternalLink, ShieldCheck, Lock } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
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
  const [reciterCatalog, setReciterCatalog] = useState<
    { state: "idle" | "loading" | "error" } | { state: "ready"; items: Array<{ id: number; name: string; reading: string | null }> }
  >({ state: "idle" });
  const reciterRequest = useRef<AbortController | null>(null);

  useEffect(() => () => reciterRequest.current?.abort(), []);

  const discoverReciters = async () => {
    reciterRequest.current?.abort();
    const controller = new AbortController();
    reciterRequest.current = controller;
    setReciterCatalog({ state: "loading" });
    try {
      const response = await fetch(`/api/content/audio/reciters?sura=${active}`, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: { reciters: Array<{ id: number; name: string; reading: string | null }> } = await response.json();
      if (!controller.signal.aborted) setReciterCatalog({ state: "ready", items: data.reciters });
    } catch {
      if (!controller.signal.aborted) setReciterCatalog({ state: "error" });
    }
  };

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
          <div className={styles.coverWrap} aria-hidden="true">
            <img className={styles.cover} src={art.mushaf} alt="" />
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
              <li key={chapter.number}>
                <button
                  type="button"
                  className={`${styles.track} ${chapter.number === active ? styles.activeTrack : ""}`}
                  aria-current={chapter.number === active ? "true" : undefined}
                  onClick={() => {
                  reciterRequest.current?.abort();
                  setActive(chapter.number);
                  setReciterCatalog({ state: "idle" });
                  }}
                >
                <span>{i + 1}</span>
                <div>
                  <strong>سورة {chapter.arabicName}</strong>
                  <em>{chapter.ayahCount} آية · بدون تسجيل معتمد</em>
                </div>
                </button>
              </li>
            ))}
          </ul>
          <p className="muted" style={{ fontSize: "0.75rem", padding: "0 0.6rem" }}>
            أول 24 سورة من الفهرس الموثق — التصفح الكامل للسور في{" "}
            <Link href="/quran">رواق القرآن</Link>.
          </p>
        </aside>
        <div className={styles.player}>
          <Lock size={17} aria-hidden="true" />
          <p>مساحة الاستماع تُفتح عند اعتماد تسجيل ومراجعة حق عرضه. يمكنك الآن تصفح السور وفهرس القراء.</p>
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

      <section className={styles.pad} aria-label="اكتشاف القراء من المصدر">
        <div className={styles.reciterDiscovery}>
          <div>
            <SectionHead title="اكتشف القراء من الفهرس الرسمي" en="MP3Quran catalog metadata" />
            <p>أسماء القراء والروايات المتاحة في فهرس المزوّد للسورة المختارة؛ لا تشغيل ولا تنزيل ولا تسجيلات مُجازة داخل المنصة.</p>
          </div>
          <button type="button" onClick={discoverReciters} disabled={reciterCatalog.state === "loading"}>
            {reciterCatalog.state === "loading" ? "جارٍ جلب الفهرس…" : `اعرض قراء سورة ${current?.arabicName ?? active}`}
          </button>
          {reciterCatalog.state === "error" ? <p role="status">تعذر جلب الفهرس الآن. <a href="https://mp3quran.net/" target="_blank" rel="noopener noreferrer">افتح المصدر الرسمي <ExternalLink size={13} aria-hidden="true" /></a></p> : null}
          {reciterCatalog.state === "ready" ? (
            reciterCatalog.items.length ? <ul className={styles.reciterList}>
              {reciterCatalog.items.map((item) => <li key={item.id}>
                <strong>{item.name}</strong><span>{item.reading ?? "الرواية غير مذكورة في هذه النتيجة"}</span>
              </li>)}
            </ul> : <p role="status">لا يظهر قارئ لهذه السورة في استجابة المزوّد حاليًا.</p>
          ) : null}
          <small>المصدر: <a href="https://mp3quran.net/ar/api" target="_blank" rel="noopener noreferrer">توثيق MP3Quran API</a> · حالة العرض: بيانات فهرسية فقط.</small>
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

import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, BookOpenCheck, Map } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import p from "@/visual-golden/components/present/present.module.css";
import u from "@/visual-golden/components/unique/unique.module.css";
import {
  CHAPTERS,
  CATEGORIES,
  SEERAH_COUNTS,
  getRelatedChapters,
} from "@/visual-golden/services/seerah";
import styles from "./SeerahPage.module.css";

const READ_KEY = "seerah-read-chapters-v1";

function safeReadRead(): string[] {
  try {
    const raw = localStorage.getItem(READ_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

const STAGE_ART = [
  art.reciterKaaba,
  art.lanternGlow,
  art.kaaba,
  art.storyHijrah,
  art.reciterDome,
  art.desert,
  art.mosque,
  art.mushafOpen,
];

export function SeerahPage() {
  const [chapterId, setChapterId] = useState(CHAPTERS[3]?.id ?? CHAPTERS[0].id);
  const [read, setRead] = useState<string[]>(() => safeReadRead());

  const index = Math.max(0, CHAPTERS.findIndex((chapter) => chapter.id === chapterId));
  const chapter = CHAPTERS[index] ?? CHAPTERS[0];
  const related = useMemo(() => getRelatedChapters(chapter.id), [chapter.id]);
  const events = chapter.timelineEvents ?? [];

  const readCount = CHAPTERS.filter((c) => read.includes(c.id)).length;
  const percent = Math.round((readCount / CHAPTERS.length) * 100);

  const toggleRead = () => {
    const next = read.includes(chapter.id)
      ? read.filter((id) => id !== chapter.id)
      : [...read, chapter.id];
    setRead(next);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(next));
    } catch {
      // progress remains in-memory
    }
  };

  const step = (delta: number) => {
    const next = Math.min(CHAPTERS.length - 1, Math.max(0, index + delta));
    setChapterId(CHAPTERS[next].id);
  };

  return (
    <div className={styles.page}>
      <PageHero
        title="درب السيرة"
        subtitle={`رحلة سردية · ${SEERAH_COUNTS.chapters} فصول · ${SEERAH_COUNTS.categories} مراحل`}
        desc="فصول السيرة بترتيبها السردي من المصدر المعتمد — المراحل والتسلسل سرديان لا تقويمًا تاريخيًا دقيقًا"
        image={art.desert}
        tall
        wing="seerah"
      >
        <div className={styles.heroBtns}>
          <button
            className="btn-gold"
            type="button"
            onClick={() => document.getElementById("seerah-journey")?.scrollIntoView({ behavior: "smooth" })}
          >
            ابدأ الرحلة
          </button>
          <Link href="/atlas" className="btn-outline">
            <Map size={14} /> الخريطة التخطيطية
          </Link>
        </div>
      </PageHero>

      <section className={styles.timelineWrap} id="seerah-journey" aria-label="فصول السيرة بالترتيب السردي">
        <button type="button" className={styles.arrow} onClick={() => step(-1)} aria-label="الفصل السابق">
          <ChevronRight size={18} />
        </button>
        <div className={p.film}>
          {CHAPTERS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className={`${p.filmItem} ${i === index ? p.filmOn : ""}`}
              onClick={() => setChapterId(c.id)}
              aria-current={i === index ? "true" : undefined}
            >
              <img src={STAGE_ART[i % STAGE_ART.length]} alt="" />
              {i === index ? <span className={u.lantern} aria-hidden /> : null}
              <span>
                <b>{c.title}</b>
                <br />
                مرحلة {c.order} · ترتيب سردي
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => step(1)}
          aria-label="الفصل التالي"
        >
          <ChevronLeft size={18} />
        </button>
      </section>

      <div className={styles.main}>
        <aside className={styles.panel}>
          <SectionHead title="محطات الفصل" en="Chapter events — from source data" />
          {events.length === 0 ? (
            <p className="muted" style={{ fontSize: "0.8rem" }}>
              لا توجد محطات مسجلة لهذا الفصل في المصدر.
            </p>
          ) : (
            <ol className={styles.events}>
              {events.map((e) => (
                <li key={e.id}>
                  <img src={STAGE_ART[(e.title.length + index) % STAGE_ART.length]} alt="" />
                  <div>
                    <span>{e.date}</span>
                    <strong>{e.title}</strong>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </aside>

        <section className={styles.mapCard}>
          <SectionHead title={chapter.title} en={`فصل ${chapter.order} من ${CHAPTERS.length} · سياق سردي`} />
          <p style={{ lineHeight: 2, fontSize: "0.92rem" }}>{chapter.description}</p>
          <p className="muted" style={{ lineHeight: 2, fontSize: "0.84rem", whiteSpace: "pre-line" }}>
            {chapter.details.split("\n\n")[0]}
          </p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.6rem" }}>
            {chapter.keywords.slice(0, 6).map((keyword) => (
              <span
                key={keyword}
                style={{
                  fontSize: "0.72rem",
                  border: "1px solid rgba(212,160,23,0.35)",
                  borderRadius: 999,
                  padding: "0.15rem 0.55rem",
                }}
              >
                {keyword}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.8rem", flexWrap: "wrap" }}>
            <button type="button" className="btn-outline" onClick={() => step(-1)} disabled={index <= 0}>
              <ChevronRight size={14} /> الفصل السابق
            </button>
            <button
              type="button"
              className="btn-gold"
              onClick={toggleRead}
            >
              <BookOpenCheck size={14} /> {read.includes(chapter.id) ? "تمت القراءة محليًا ✓" : "تعليم كمقروء محليًا"}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => step(1)}
              disabled={index >= CHAPTERS.length - 1}
            >
              الفصل التالي <ChevronLeft size={14} />
            </button>
          </div>
        </section>

        <aside className={styles.panel}>
          <SectionHead title="المراحل السردية" en="Narrative phases" />
          <div className={styles.miles}>
            {CATEGORIES.map((category) => (
              <article key={category.id}>
                <img src={STAGE_ART[category.chapters.length % STAGE_ART.length]} alt="" />
                <span>
                  {category.name} · {category.chapters.length} {category.chapters.length === 1 ? "فصل" : "فصول"}
                </span>
              </article>
            ))}
            <article>
              <img src={art.books} alt="" />
              <span>الفصول المقروءة محليًا: {readCount} من {CHAPTERS.length}</span>
            </article>
          </div>
        </aside>
      </div>

      <div className={styles.lower}>
        <section className={styles.panel}>
          <SectionHead title="فصول مرتبطة" en="Related chapters" />
          <div className={styles.figures}>
            {related.length === 0 ? (
              <span className="muted">لا توجد روابط مسجلة لهذا الفصل.</span>
            ) : (
              related.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setChapterId(r.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    background: "rgba(0,0,0,0.16)",
                    borderRadius: 999,
                    padding: "0.25rem 0.55rem",
                    fontSize: "0.75rem",
                  }}
                >
                  فصل {r.order} · {r.title}
                </button>
              ))
            )}
          </div>
        </section>
        <section className={styles.panel}>
          <SectionHead title="المواقع في السيرة" en="Schematic — not GIS" href="/atlas" action="عرض الخريطة" />
          <p className="muted" style={{ fontSize: "0.8rem", lineHeight: 1.9 }}>
            المواقع المذكورة في هذا الفصل:{" "}
            {[...new Set(events.map((e) => e.location).filter(Boolean))].join(" · ") || "غير محددة كبنية مواقع"}.
            أي تمثيل بصري للمواقع تخطيطي وليس إحداثيات تاريخية دقيقة.
          </p>
        </section>
        <section className={styles.panel}>
          <SectionHead title="رحلتك في تعلم السيرة" en="Local progress only" />
          <p>
            {readCount} من {CHAPTERS.length} فصول مقروءة محليًا
          </p>
          <div className={styles.bar}>
            <i style={{ width: `${percent}%` }} />
          </div>
          <span>{percent}% · تقدّم محلي على هذا الجهاز فقط</span>
        </section>
      </div>
    </div>
  );
}

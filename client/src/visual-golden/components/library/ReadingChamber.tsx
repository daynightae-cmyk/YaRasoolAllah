import { useEffect, useState } from "react";
import { BookOpen, Headphones, ScanEye, X, ChevronRight, ChevronLeft, Play, Pause, Bookmark } from "lucide-react";
import type { BookMode, LibraryBook } from "@/visual-golden/mock/books";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./ReadingChamber.module.css";

interface Props {
  book: LibraryBook;
  initialMode?: BookMode;
  onClose: () => void;
}

export function ReadingChamber({ book, initialMode, onClose }: Props) {
  const start = initialMode && book.modes.includes(initialMode) ? initialMode : book.modes[0];
  const [mode, setMode] = useState<BookMode>(start);
  const [page, setPage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [chapter, setChapter] = useState(0);
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setProgress((n) => (n >= 96 ? 12 : n + 1)), 400);
    return () => clearInterval(t);
  }, [playing]);

  const pages = [
    book.excerpt,
    "[بيانات الكتاب] الصفحة التالية للعرض البصري. النص الإنتاجي سيُحقن من مصدر المكتبة دون إعادة تصميم الصفحة.",
    "[بيانات الكتاب] حاشية بصرية للمحاذاة والكثافة فقط.",
    "خاتمة المجلد — [بيانات المصدر]",
  ];

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <div className={styles.chamber} role="dialog" aria-label={book.title} onClick={(e) => e.stopPropagation()}>
        <header className={styles.bar}>
          <strong className="gold-text">{book.title}</strong>
          <div className={styles.tabs} role="tablist">
            {book.modes.map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                className={mode === m ? styles.on : ""}
                onClick={() => setMode(m)}
              >
                {m === "عرض" ? <ScanEye size={14} /> : m === "قراءة" ? <BookOpen size={14} /> : <Headphones size={14} />}
                {m}
              </button>
            ))}
          </div>
          <button type="button" className="btn-outline" onClick={onClose} aria-label="إغلاق">
            <X size={14} />
          </button>
        </header>

        <div className={styles.desk}>
          <div className={styles.lamp} aria-hidden>
            <div className={styles.lampHead} />
            <div className={styles.lampArm} />
          </div>
          <div className={styles.glow} />
          <div className={styles.stage}>
            {mode === "عرض" ? (
              <article className={styles.coverCard}>
                <img src={book.cover} alt="" />
                <div>
                  <h3>{book.title}</h3>
                  <p className="muted">{book.author}</p>
                  <div className={styles.meta}>
                    <span>{book.tag}</span>
                    <span>{book.shelf}</span>
                    <span>{book.pages} صفحة</span>
                  </div>
                  <div className={p.parchment}>
                    <p style={{ margin: 0, lineHeight: 1.9 }}>{book.excerpt}</p>
                  </div>
                  <div className={styles.actions}>
                    {book.modes.includes("قراءة") ? (
                      <button type="button" className="btn-gold" onClick={() => setMode("قراءة")}>
                        ابدأ القراءة
                      </button>
                    ) : null}
                    {book.modes.includes("استماع") ? (
                      <button type="button" className="btn-outline" onClick={() => setMode("استماع")}>
                        استمع
                      </button>
                    ) : null}
                    <button type="button" className="btn-outline" onClick={() => setSaved((s) => !s)}>
                      <Bookmark size={14} /> {saved ? "في الرف الخاص" : "أضف للرف"}
                    </button>
                  </div>
                </div>
              </article>
            ) : null}

            {mode === "قراءة" ? (
              <div>
                <div className={styles.spread}>
                  <div className={styles.page}>
                    <h4>{book.title}</h4>
                    <p>{pages[page] ?? pages[0]}</p>
                    <span className={styles.folio}>{page * 2 + 1}</span>
                  </div>
                  <div className={styles.page}>
                    <h4>{book.chapters[Math.min(page, book.chapters.length - 1)]}</h4>
                    <p>{pages[page + 1] ?? pages[0]}</p>
                    <span className={styles.folio}>{page * 2 + 2}</span>
                  </div>
                </div>
                <div className={styles.turn}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setPage((n) => Math.max(0, n - 1))}
                    aria-label="الصفحة السابقة"
                  >
                    <ChevronRight size={14} /> السابق
                  </button>
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => setPage((n) => Math.min(pages.length - 2, n + 1))}
                    aria-label="الصفحة التالية"
                  >
                    التالي <ChevronLeft size={14} />
                  </button>
                </div>
              </div>
            ) : null}

            {mode === "استماع" ? (
              <article className={`${styles.listen} ${playing ? styles.playing : ""}`}>
                <div className={p.vinyl}>
                  <div className={`${p.vinylDisc} ${playing ? p.spinning : ""}`} />
                  <div className={p.vinylHub}>
                    <img src={book.cover} alt="" />
                  </div>
                </div>
                <div>
                  <p className="gold-text">كتاب صوتي</p>
                  <h3 style={{ margin: "0.2rem 0", color: "#f8efc2" }}>{book.title}</h3>
                  <p className="muted">{book.author}</p>
                  <div className={styles.wave} aria-hidden>
                    {Array.from({ length: 28 }).map((_, i) => (
                      <i key={i} style={{ animationDelay: `${(i % 7) * 80}ms` }} />
                    ))}
                  </div>
                  <div className="scrub" style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 99 }}>
                    <i
                      style={{
                        display: "block",
                        width: `${progress}%`,
                        height: "100%",
                        background: "var(--gold-500)",
                        borderRadius: 99,
                      }}
                    />
                  </div>
                  <div className={styles.actions}>
                    <button type="button" className="btn-gold" onClick={() => setPlaying((v) => !v)}>
                      {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? "إيقاف" : "تشغيل"}
                    </button>
                  </div>
                  <div className={styles.chapters} style={{ marginTop: "0.8rem" }}>
                    {book.chapters.map((c, i) => (
                      <button
                        key={c}
                        type="button"
                        className={chapter === i ? styles.on : ""}
                        onClick={() => {
                          setChapter(i);
                          setPlaying(true);
                          setProgress(8);
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

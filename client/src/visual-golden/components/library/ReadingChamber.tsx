import { useEffect, useState } from "react";
import { Eye, X, Bookmark, ExternalLink, ShieldCheck, BookOpen, Headphones } from "lucide-react";
import type { BookMode, LibraryBook } from "@/visual-golden/services/library";
import p from "@/visual-golden/components/present/present.module.css";
import styles from "./ReadingChamber.module.css";

interface Props {
  book: LibraryBook;
  initialMode?: BookMode;
  onClose: () => void;
}

const BOOKMARK_KEY = "library-shelf-bookmarks-v1";

function safeReadBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function ReadingChamber({ book, onClose }: Props) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(safeReadBookmarks().includes(book.workId));
  }, [book.workId]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const toggleSaved = () => {
    try {
      const current = safeReadBookmarks();
      const next = current.includes(book.workId)
        ? current.filter((id) => id !== book.workId)
        : [...current, book.workId];
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(next));
      setSaved(next.includes(book.workId));
    } catch {
      setSaved((s) => !s);
    }
  };

  return (
    <div className={styles.scrim} onClick={onClose} role="presentation">
      <div className={styles.chamber} role="dialog" aria-label={book.title} onClick={(e) => e.stopPropagation()}>
        <header className={styles.bar}>
          <strong className="gold-text">{book.title}</strong>
          <div className={styles.tabs} role="tablist">
            <button type="button" role="tab" aria-selected className={styles.on}>
              <Eye size={14} />
              سجل العمل
            </button>
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
            <article className={styles.coverCard}>
              <img src={book.cover} alt="" />
              <div>
                <h3>{book.title}</h3>
                <p className="muted">
                  {book.author} · {book.authorEn}
                </p>
                <p className="muted" style={{ fontSize: "0.78rem" }}>
                  {book.titleEn} · {book.shelf}
                </p>
                <div className={styles.meta}>
                  <span>{book.tag}</span>
                  <span>{book.shelf}</span>
                  <span>{book.versionCount} نسخة رقمية</span>
                  <span>سجل فهرسي فقط</span>
                </div>

                <div className={p.parchment}>
                  <p style={{ margin: 0, lineHeight: 1.9 }}>
                    {book.attributionCaveat}
                  </p>
                  <p style={{ margin: "0.6rem 0 0", lineHeight: 1.9, fontSize: "0.85rem" }}>
                    النص الكامل لهذا العمل غير متاح داخل المنصة حتى مراجعة النسخة والحقوق على مستوى
                    كل نسخة رقمية. ما يُعرض هنا هو بيانات الفهرسة والنسخ والمصادر فقط.
                  </p>
                </div>

                <div className={styles.meta} style={{ marginTop: "0.8rem" }}>
                  <span>
                    <ShieldCheck size={12} style={{ verticalAlign: "-2px" }} /> الببليوغرافيا:{" "}
                    {book.bibliographicStatus === "verified_bibliographic" ? "موثقة" : "قيد المراجعة"}
                  </span>
                  <span>المراجعة العلمية: معلقة</span>
                  <span>الإتاحة: فهرس فقط</span>
                </div>

                {book.openitiWorkUri ? (
                  <p className="muted" style={{ fontSize: "0.75rem", direction: "ltr", textAlign: "end" }}>
                    OpenITI: {book.openitiWorkUri}
                  </p>
                ) : (
                  <p className="muted" style={{ fontSize: "0.75rem" }}>
                    لا توجد نسخة OpenITI مثبتة لهذا العمل في هذا الإصدار.
                  </p>
                )}

                <div className={styles.actions}>
                  <button type="button" className="btn-outline" onClick={toggleSaved}>
                    <Bookmark size={14} /> {saved ? "في الرف الخاص (محلي)" : "أضف للرف الخاص (محلي)"}
                  </button>
                </div>

                <div style={{ marginTop: "1rem" }}>
                  <h4 style={{ margin: "0 0 0.5rem", color: "#f8efc2", fontSize: "0.95rem" }}>
                    النسخ الرقمية ({book.versions.length})
                  </h4>
                  {book.versions.length === 0 ? (
                    <p className="muted" style={{ fontSize: "0.82rem" }}>
                      لم تُثبت أي نسخة رقمية لهذا العمل في هذا الإصدار.
                    </p>
                  ) : (
                    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                      {book.versions.map((version) => (
                        <li
                          key={version.versionId}
                          style={{
                            border: "1px solid rgba(212,160,23,0.3)",
                            borderRadius: 10,
                            padding: "0.5rem 0.65rem",
                            background: "rgba(0,0,0,0.2)",
                            fontSize: "0.78rem",
                          }}
                        >
                          <div style={{ direction: "ltr", textAlign: "left", wordBreak: "break-all", color: "#f8efc2" }}>
                            {version.openitiUri}
                          </div>
                          <div className="muted" style={{ marginTop: "0.25rem" }}>
                            {version.editionStatement}
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                            <a href={version.sourceUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: "0.75rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <ExternalLink size={12} /> المصدر
                            </a>
                            <a href={version.versionMetadataUrl} target="_blank" rel="noreferrer" className="btn-outline" style={{ fontSize: "0.75rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
                              <ExternalLink size={12} /> بيانات النسخة
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span className="btn-outline" style={{ opacity: 0.65, cursor: "not-allowed", display: "inline-flex", alignItems: "center", gap: 4 }} title="القراءة الداخلية غير مفعّلة: لا توجد نسخة كاملة cleared الحقوق">
                    <BookOpen size={14} /> قراءة — غير متاحة
                  </span>
                  <span className="btn-outline" style={{ opacity: 0.65, cursor: "not-allowed", display: "inline-flex", alignItems: "center", gap: 4 }} title="الاستماع غير مفعّل: لا يوجد أصل صوتي cleared">
                    <Headphones size={14} /> استماع — غير متاح
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { CSSProperties } from "react";
import { useMemo } from "react";
import { Eye } from "lucide-react";
import { catalog, shelves, searchLibrary, LIBRARY_COUNTS, type LibraryBook } from "@/visual-golden/services/library";
import styles from "./BookshelfHall.module.css";
import { art } from "@/visual-golden/mock/art";

interface Props {
  activeShelf: string | "الكل";
  onShelf: (s: string | "الكل") => void;
  selected: LibraryBook | null;
  onSelect: (b: LibraryBook) => void;
  onOpen: (b: LibraryBook, mode?: LibraryBook["modes"][number]) => void;
  query: string;
}

export function BookshelfHall({ activeShelf, onShelf, selected, onSelect, onOpen, query }: Props) {
  const visible = useMemo(() => searchLibrary(query, "الكل"), [query]);
  const shelfVisible = useMemo(() => searchLibrary(query, activeShelf), [query, activeShelf]);
  const current = selected ?? shelfVisible[0] ?? visible[0] ?? catalog[0];

  return (
    <section className={styles.hall} aria-label="قاعة الرفوف">
      <img src={art.shelves} alt="" className={styles.ambient} />
      <div className={styles.inner}>
        <header className={styles.plaque}>
          <div>
            <h2>قاعة الرفوف</h2>
            <p>
              THE READING HALL · {LIBRARY_COUNTS.works} عملًا موثقًا · {LIBRARY_COUNTS.versions} نسخة رقمية
            </p>
          </div>
          <div className={styles.cats}>
            <button type="button" className={activeShelf === "الكل" ? styles.on : ""} onClick={() => onShelf("الكل")}>
              كل الرفوف
            </button>
            {shelves.map((s) => (
              <button
                key={s}
                type="button"
                className={activeShelf === s ? styles.on : ""}
                onClick={() => onShelf(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </header>

        <div className={styles.cabinet}>
          <div className={styles.case}>
            {shelves.map((shelf) => {
              const books = visible.filter((b) => b.shelf === shelf);
              if (!books.length) return null;
              const dim = activeShelf !== "الكل" && activeShelf !== shelf;
              return (
                <div key={shelf} className={`${styles.shelf} ${dim ? styles.dim : ""}`}>
                  <div className={styles.row}>
                    <span className={styles.plate}>{shelf}</span>
                    {books.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className={`${styles.tome} ${selected?.id === b.id ? styles.pulled : ""}`}
                        style={
                          {
                            "--w": `${b.spine.width}px`,
                            "--h": `${b.spine.height}px`,
                            "--c": b.spine.color,
                            "--g": b.spine.gilt,
                          } as CSSProperties
                        }
                        aria-label={`${b.title} — ${b.author}`}
                        onClick={() => onSelect(b)}
                        onDoubleClick={() => onOpen(b, "عرض")}
                      >
                        <span className={styles.spine}>
                          <i className={styles.band} />
                          <em>{b.title}</em>
                          <i className={styles.band} />
                        </span>
                        <span className={styles.pages} aria-hidden />
                      </button>
                    ))}
                  </div>
                  <div className={styles.plank} />
                </div>
              );
            })}
          </div>
        </div>

        <footer className={styles.foot}>
          <div>
            <strong>{current.title}</strong>
            <p className={styles.hint}>
              {current.author} · {current.versionCount} نسخة رقمية · سجل فهرسي — النص الكامل غير متاح داخل
              المنصة
            </p>
          </div>
          <div className={styles.modes}>
            <button type="button" onClick={() => onOpen(current, "عرض")}>
              <Eye size={14} /> سجل العمل
            </button>
          </div>
        </footer>
      </div>
    </section>
  );
}

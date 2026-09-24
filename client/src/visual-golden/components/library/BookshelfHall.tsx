import type { CSSProperties } from "react";
import { useMemo } from "react";
import { BookOpen, Eye, Headphones } from "lucide-react";
import {
  catalog,
  shelves,
  searchLibrary,
  LIBRARY_COUNTS,
  type BookMode,
  type LibraryBook,
} from "@/visual-golden/services/library";
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

const modeIcon: Record<BookMode, typeof Eye> = {
  عرض: Eye,
  قراءة: BookOpen,
  Audiobook: Headphones,
};

export function BookshelfHall({ activeShelf, onShelf, selected, onSelect, onOpen, query }: Props) {
  const visible = useMemo(() => searchLibrary(query, "الكل"), [query]);
  const shelfVisible = useMemo(() => searchLibrary(query, activeShelf), [query, activeShelf]);
  const current = selected ?? shelfVisible[0] ?? visible[0] ?? catalog[0];

  return (
    <section className={styles.hall} aria-label="قاعة الرفوف الخشبية">
      <img src={art.shelves} alt="" className={styles.ambient} />
      <div className={styles.inner}>
        <header className={styles.plaque}>
          <div>
            <h2>قاعة الرفوف</h2>
            <p>
              THE READING HALL · {LIBRARY_COUNTS.works} عملًا · {LIBRARY_COUNTS.readableWorks} للقراءة · {LIBRARY_COUNTS.audiobookWorks} Audiobook موثق
            </p>
          </div>
          <div className={styles.cats} aria-label="اختيار خزانة">
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
                  <div className={styles.row} role="list" aria-label={shelf}>
                    {books.map((b) => {
                      const preferredMode: BookMode = b.modes.includes("قراءة") ? "قراءة" : "عرض";
                      return (
                        <button
                          key={b.id}
                          type="button"
                          role="listitem"
                          className={`${styles.tome} ${selected?.id === b.id ? styles.pulled : ""}`}
                          data-book-spine
                          style={
                            {
                              "--w": `${b.spine.width}px`,
                              "--h": `${b.spine.height}px`,
                              "--c": b.spine.color,
                              "--g": b.spine.gilt,
                            } as CSSProperties
                          }
                          aria-label={`${b.title} — ${b.author}`}
                          aria-pressed={selected?.id === b.id}
                          onClick={() => onSelect(b)}
                          onDoubleClick={() => onOpen(b, preferredMode)}
                        >
                          <span className={styles.spine}>
                            <i className={styles.band} />
                            <em>{b.title}</em>
                            <i className={styles.band} />
                          </span>
                          <span className={styles.pages} aria-hidden />
                        </button>
                      );
                    })}
                  </div>
                  <div className={styles.plank}>
                    <span className={styles.shelfPlate} data-shelf-plate>
                      <strong>{shelf}</strong>
                      <small>{books.length} {books.length === 1 ? "عمل" : "أعمال"}</small>
                    </span>
                  </div>
                </div>
              );
            })}
            {!visible.length ? (
              <div className={styles.empty}>لا توجد كتب مطابقة للبحث الحالي داخل الرفوف المحلية.</div>
            ) : null}
          </div>
        </div>

        <footer className={styles.foot}>
          <div>
            <strong>{current.title}</strong>
            <p className={styles.hint}>
              {current.author} · {current.versionCount} نسخة رقمية ·{" "}
              {current.contentAvailability === "full_text_cleared"
                ? "نص تاريخي متاح للقراءة داخل المنصة"
                : "سجل فهرسي فقط"}{" "}
              {current.audiobook ? "· Audiobook بشري موثق" : ""}
            </p>
          </div>
          <div className={styles.modes} aria-label="طرق فتح الكتاب">
            {current.modes.map((mode) => {
              const Icon = modeIcon[mode];
              return (
                <button type="button" key={mode} onClick={() => onOpen(current, mode)}>
                  <Icon size={14} /> {mode}
                </button>
              );
            })}
          </div>
        </footer>
      </div>
    </section>
  );
}

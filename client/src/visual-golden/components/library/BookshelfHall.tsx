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

function BookCard({
  book,
  selected,
  onSelect,
  onOpen,
}: {
  book: LibraryBook;
  selected: boolean;
  onSelect: (book: LibraryBook) => void;
  onOpen: (book: LibraryBook, mode: BookMode) => void;
}) {
  return (
    <article
      className={`${styles.bookCard} ${selected ? styles.selected : ""}`}
      style={
        {
          "--cover": book.spine.color,
          "--gilt": book.spine.gilt,
        } as CSSProperties
      }
    >
      <button
        type="button"
        className={styles.coverButton}
        data-book-spine
        aria-label={`${book.title} — ${book.author}`}
        aria-pressed={selected}
        onClick={() => onSelect(book)}
        onDoubleClick={() =>
          onOpen(book, book.modes.includes("قراءة") ? "قراءة" : "عرض")
        }
      >
        <span className={styles.bookCover}>
          <span className={styles.coverFrame} aria-hidden />
          <span className={styles.coverOrnament}>✦</span>
          <strong>{book.title}</strong>
          <small>{book.author}</small>
          <span className={styles.coverFoot}>{book.shelf}</span>
        </span>
      </button>

      <div className={styles.bookMeta}>
        <strong>{book.title}</strong>
        <span>{book.author}</span>
        <div className={styles.badges}>
          <i>{book.versionCount} نسخة</i>
          {book.modes.includes("قراءة") ? <i>نص كامل</i> : <i>فهرس</i>}
          {book.audiobook ? <i>Audiobook</i> : null}
        </div>
      </div>

      <div className={styles.bookActions} aria-label={`فتح ${book.title}`}>
        {book.modes.map((mode) => {
          const Icon = modeIcon[mode];
          return (
            <button type="button" key={mode} onClick={() => onOpen(book, mode)}>
              <Icon size={14} />
              {mode}
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function BookshelfHall({
  activeShelf,
  onShelf,
  selected,
  onSelect,
  onOpen,
  query,
}: Props) {
  const allVisible = useMemo(() => searchLibrary(query, "الكل"), [query]);
  const sections = useMemo(
    () =>
      shelves
        .map((shelf) => ({
          shelf,
          books: allVisible.filter((book) => book.shelf === shelf),
        }))
        .filter(
          (section) =>
            section.books.length > 0 &&
            (activeShelf === "الكل" || activeShelf === section.shelf),
        ),
    [activeShelf, allVisible],
  );

  return (
    <section className={styles.library} aria-label="المكتبة العالمية">
      <header className={styles.grandHeader}>
        <div>
          <span className={styles.eyebrow}>YA RASOOL ALLAH · GRAND LIBRARY</span>
          <h2>مهرجان الكتب</h2>
          <p>
            الكتب أمامك مباشرة، لا مخفية داخل رف صغير. اختر القسم ثم افتح
            العرض أو القراءة من بطاقة الكتاب نفسها.
          </p>
        </div>

        <div className={styles.stats} aria-label="إحصاءات المكتبة">
          <span><strong>{LIBRARY_COUNTS.works}</strong> كتابًا وعملًا</span>
          <span><strong>{LIBRARY_COUNTS.versions}</strong> نسخة رقمية</span>
          <span><strong>{LIBRARY_COUNTS.readableWorks}</strong> للقراءة المباشرة</span>
          <span><strong>{LIBRARY_COUNTS.audiobookWorks}</strong> Audiobook موثق</span>
        </div>
      </header>

      <nav className={styles.categories} aria-label="أقسام المكتبة">
        <button
          type="button"
          className={activeShelf === "الكل" ? styles.categoryOn : ""}
          onClick={() => onShelf("الكل")}
        >
          كل المكتبة
          <small>{allVisible.length}</small>
        </button>
        {shelves.map((shelf) => {
          const count = allVisible.filter((book) => book.shelf === shelf).length;
          return (
            <button
              type="button"
              key={shelf}
              className={activeShelf === shelf ? styles.categoryOn : ""}
              onClick={() => onShelf(shelf)}
            >
              {shelf}
              <small>{count}</small>
            </button>
          );
        })}
      </nav>

      <div className={styles.sections}>
        {sections.map(({ shelf, books }) => (
          <section className={styles.section} key={shelf}>
            <header className={styles.sectionHead} data-shelf-plate>
              <div>
                <span>COLLECTION</span>
                <h3>{shelf}</h3>
              </div>
              <p>{books.length} {books.length === 1 ? "كتاب" : "كتب"} في هذا القسم</p>
            </header>

            <div className={styles.bookGrid} role="list" aria-label={shelf}>
              {books.map((book) => (
                <div role="listitem" key={book.id}>
                  <BookCard
                    book={book}
                    selected={selected?.id === book.id}
                    onSelect={onSelect}
                    onOpen={onOpen}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {!allVisible.length ? (
          <div className={styles.empty}>
            <strong>لا توجد نتيجة مطابقة.</strong>
            <span>جرّب اسم كتاب أو مؤلف أو قسم آخر.</span>
          </div>
        ) : null}
      </div>

      <footer className={styles.truthBar}>
        <span>
          <BookOpen size={15} />
          القراءة المباشرة تعمل من النسخة الأصلية المثبتة ولا تعتمد على API داخلي.
        </span>
        <span>
          <Headphones size={15} />
          Audiobook لا يظهر إلا عند وجود تسجيل بشري موثق.
        </span>
      </footer>
    </section>
  );
}

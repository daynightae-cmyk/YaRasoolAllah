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
import { useInstitution } from "@/visual-golden/lib/institution/store";
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
  lang,
}: {
  book: LibraryBook;
  selected: boolean;
  onSelect: (book: LibraryBook) => void;
  lang: "ar" | "en";
}) {
  const title = lang === "ar" ? book.title : book.titleEn;
  const author = lang === "ar" ? book.author : book.authorEn;
  return (
    <article
      className={`${styles.bookCard} ${selected ? styles.selected : ""}`}
      style={
        {
          "--cover": book.spine.color,
          "--gilt": book.spine.gilt,
          "--spine-height": `${book.spine.height}px`,
          "--spine-width": `${Math.max(42, book.spine.width + 24)}px`,
        } as CSSProperties
      }
    >
      <button
        type="button"
        className={styles.spineButton}
        data-book-spine
        aria-label={`${title} — ${author}`}
        aria-pressed={selected}
        onClick={() => onSelect(book)}
      >
        <span className={styles.spineCap} aria-hidden="true" />
        <span className={styles.spineTitle}>
          <strong>{title}</strong>
          <small>{author}</small>
        </span>
        <span className={styles.spineMark} aria-hidden="true">✦</span>
      </button>
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
  const lang = useInstitution((state) => state.lang);
  const labels = lang === "ar" ? {
    aria: "الرفوف المعمارية للمكتبة",
    eyebrow: "المجموعة المنقحة للرفوف",
    title: "قاعات الكتب",
    description: "لا يُرقّى إلى هذه الرفوف إلا عمل مكتمل العنوان والمؤلف والقسم والمصدر، وله نسخة رقمية موصولة وسجل ببليوغرافي متحقق.",
    works: "عملاً منقحاً",
    versions: "نسخة رقمية موصولة",
    readable: "عملاً للقراءة المباشرة",
    audio: "كتاباً صوتياً موثقاً",
    all: "كل الرفوف",
    section: "مجموعة منقحة",
    inSection: (count: number) => `${count.toLocaleString("ar")} ${count === 1 ? "كتاب" : "كتب"} في هذا القسم`,
    selected: "الكتاب المختار",
    fullText: "نص كامل متاح",
    catalogOnly: "بيانات فهرسية فقط",
    versionsCount: (count: number) => `${count.toLocaleString("ar")} نسخة رقمية`,
    open: (title: string) => `فتح ${title}`,
    noResult: "لا توجد نتيجة مطابقة.",
    tryAgain: "جرّب اسم كتاب أو مؤلف أو قسم آخر.",
    textTruth: "غرفة القراءة لا تُفتح إلا من نسخة أصلية مثبتة ومصرح بها.",
    audioTruth: "الكتاب الصوتي لا يظهر إلا عند وجود تسجيل بشري موثق.",
  } : {
    aria: "Architectural Library shelves",
    eyebrow: "Curated shelf collection",
    title: "Book Halls",
    description: "A work is promoted to these shelves only when title, author, subject, source, verified bibliographic status, and a connected digital version are present.",
    works: "curated works",
    versions: "connected digital versions",
    readable: "works available to read",
    audio: "verified audiobooks",
    all: "All shelves",
    section: "Curated collection",
    inSection: (count: number) => `${count.toLocaleString("en")} ${count === 1 ? "work" : "works"} in this section`,
    selected: "Selected work",
    fullText: "Full text available",
    catalogOnly: "Catalog metadata only",
    versionsCount: (count: number) => `${count.toLocaleString("en")} digital versions`,
    open: (title: string) => `Open ${title}`,
    noResult: "No matching result.",
    tryAgain: "Try another title, author, or subject.",
    textTruth: "The Reading Chamber opens only from a pinned, permitted source version.",
    audioTruth: "Audiobooks appear only when a human recording has been verified.",
  };
  const shelfLabel = (shelf: string) => lang === "ar" ? shelf : ({
    "السيرة النبوية": "Prophetic Biography",
    "التاريخ": "History",
    "التفسير وعلوم القرآن": "Exegesis and Qur'anic Studies",
    "الحديث الشريف": "Hadith",
    "الآداب والأخلاق": "Ethics and Conduct",
  }[shelf] ?? shelf);
  const modeLabel = (mode: BookMode) => lang === "ar" ? ({ عرض: "تفاصيل", قراءة: "قراءة", Audiobook: "كتاب صوتي" }[mode]) : ({ عرض: "Details", قراءة: "Read", Audiobook: "Audiobook" }[mode]);
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
    <section className={styles.library} aria-label={labels.aria}>
      <header className={styles.grandHeader}>
        <div>
          <span className={styles.eyebrow}>{labels.eyebrow}</span>
          <h2>{labels.title}</h2>
          <p>{labels.description}</p>
        </div>

        <div className={styles.stats} aria-label="إحصاءات المكتبة">
          <span><strong>{LIBRARY_COUNTS.works.toLocaleString(lang)}</strong> {labels.works}</span>
          <span><strong>{LIBRARY_COUNTS.versions.toLocaleString(lang)}</strong> {labels.versions}</span>
          <span><strong>{LIBRARY_COUNTS.readableWorks.toLocaleString(lang)}</strong> {labels.readable}</span>
          <span><strong>{LIBRARY_COUNTS.audiobookWorks.toLocaleString(lang)}</strong> {labels.audio}</span>
        </div>
      </header>

      <nav className={styles.categories} aria-label="أقسام المكتبة">
        <button
          type="button"
          className={activeShelf === "الكل" ? styles.categoryOn : ""}
          onClick={() => onShelf("الكل")}
        >
          {labels.all}
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
              {shelfLabel(shelf)}
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
                <span>{labels.section}</span>
                <h3>{shelfLabel(shelf)}</h3>
              </div>
              <p>{labels.inSection(books.length)}</p>
            </header>

            <div className={styles.shelfCase}>
            <div className={styles.bookGrid} role="list" aria-label={shelf}>
              {books.map((book) => (
                <div role="listitem" key={book.id}>
                  <BookCard
                    book={book}
                    selected={selected?.id === book.id}
                    onSelect={onSelect}
                    lang={lang}
                  />
                </div>
              ))}
            </div>
            </div>

            {selected && selected.shelf === shelf ? (
              <aside className={styles.selectionDesk} aria-live="polite">
                <div>
                  <span>{labels.selected}</span>
                  <strong>{lang === "ar" ? selected.title : selected.titleEn}</strong>
                  <p>{lang === "ar" ? selected.author : selected.authorEn} · {labels.versionsCount(selected.versionCount)} · {selected.modes.includes("قراءة") ? labels.fullText : labels.catalogOnly}</p>
                </div>
                <div className={styles.bookActions} aria-label={labels.open(lang === "ar" ? selected.title : selected.titleEn)}>
                  {selected.modes.map((mode) => {
                    const Icon = modeIcon[mode];
                    return <button type="button" key={mode} onClick={() => onOpen(selected, mode)}><Icon size={14} />{modeLabel(mode)}</button>;
                  })}
                </div>
              </aside>
            ) : null}
          </section>
        ))}

        {!allVisible.length ? (
          <div className={styles.empty}>
            <strong>{labels.noResult}</strong>
            <span>{labels.tryAgain}</span>
          </div>
        ) : null}
      </div>

      <footer className={styles.truthBar}>
        <span>
          <BookOpen size={15} />
          {labels.textTruth}
        </span>
        <span>
          <Headphones size={15} />
          {labels.audioTruth}
        </span>
      </footer>
    </section>
  );
}

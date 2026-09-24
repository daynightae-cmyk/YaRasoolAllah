import { useState } from "react";
import { BookOpen, LibraryBig, Search, ExternalLink } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import {
  LIBRARY_COUNTS,
  type BookMode,
  type LibraryBook,
} from "@/visual-golden/services/library";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { BookshelfHall } from "@/visual-golden/components/library/BookshelfHall";
import { LibraryCatalog } from "@/visual-golden/components/library/LibraryCatalog";
import { ReadingChamber } from "@/visual-golden/components/library/ReadingChamber";
import styles from "./LibraryPage.module.css";

export function LibraryPage({ initialWorkId }: { initialWorkId?: string }) {
  const [q, setQ] = useState("");
  const [shelf, setShelf] = useState<string | "الكل">("الكل");
  const [selected, setSelected] = useState<LibraryBook | null>(null);
  const [open, setOpen] = useState<{ book: LibraryBook; mode?: BookMode } | null>(null);
  const [view, setView] = useState<"shelves" | "catalog">(initialWorkId ? "catalog" : "shelves");

  return (
    <div className={styles.page}>
      <PageHero
        title="المكتبة الكبرى"
        subtitle={`GRAND DIGITAL LIBRARY · ${LIBRARY_COUNTS.works} كتابًا وعملًا · ${LIBRARY_COUNTS.versions} نسخة رقمية · ${LIBRARY_COUNTS.readableWorks} للقراءة المباشرة`}
        desc="مكتبة بصرية كبيرة بأقسام وواجهات كتب واضحة. افتح العرض أو القراءة من بطاقة الكتاب نفسها. الكتب المتاحة تُجلب مباشرة من نسخها المثبتة وتُنسّق داخل القارئ بدون اعتماد على API داخلي."
        image={art.library}
        wing="library"
      >
        <div className={styles.search}>
          <Search size={16} />
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="ابحث باسم الكتاب أو المؤلف أو القسم..."
            aria-label="بحث مباشر داخل المكتبة"
          />
          {q.trim().length > 1 ? (
            <a
              className="btn-outline"
              href={`https://openlibrary.org/search?q=${encodeURIComponent(q.trim())}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              بحث عالمي <ExternalLink size={13} />
            </a>
          ) : null}
        </div>
      </PageHero>

      {!initialWorkId ? (
        <nav className={styles.modeSwitch} aria-label="طرق استكشاف المكتبة">
          <button type="button" className={view === "shelves" ? styles.modeOn : ""} onClick={() => setView("shelves")}><LibraryBig size={17} /> الرفوف المعمارية</button>
          <button type="button" className={view === "catalog" ? styles.modeOn : ""} onClick={() => setView("catalog")}><BookOpen size={17} /> الفهرس العلمي · 9,129 عملًا</button>
        </nav>
      ) : null}

      {view === "shelves" ? (
        <BookshelfHall
          activeShelf={shelf}
          onShelf={setShelf}
          selected={selected}
          onSelect={setSelected}
          onOpen={(book, mode) => setOpen({ book, mode })}
          query={q}
        />
      ) : <LibraryCatalog initialWorkId={initialWorkId} />}

      {open ? (
        <ReadingChamber
          book={open.book}
          initialMode={open.mode}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}

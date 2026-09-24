import { useState } from "react";
import { Search } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { LIBRARY_COUNTS, type BookMode, type LibraryBook } from "@/visual-golden/services/library";
import { PageHero } from "@/visual-golden/components/shared/PageHero";
import { BookshelfHall } from "@/visual-golden/components/library/BookshelfHall";
import { ReadingChamber } from "@/visual-golden/components/library/ReadingChamber";
import styles from "./LibraryPage.module.css";

export function LibraryPage() {
  const [q, setQ] = useState("");
  const [shelf, setShelf] = useState<string | "الكل">("الكل");
  const [selected, setSelected] = useState<LibraryBook | null>(null);
  const [open, setOpen] = useState<{ book: LibraryBook; mode?: BookMode } | null>(null);

  return (
    <div className={styles.page}>
      <PageHero
        title="المكتبة والرفوف الرقمية"
        subtitle={`DIGITAL LIBRARY · ${LIBRARY_COUNTS.works} عملًا · ${LIBRARY_COUNTS.versions} نسخة`}
        desc="سجلات فهرسية ونسخ رقمية موثقة من OpenITI — النص الكامل غير متاح داخل المنصة حتى مراجعة النسخة والحقوق"
        image={art.library}
        wing="library"
      >
        <form className={styles.search} onSubmit={(e) => e.preventDefault()}>
          <Search size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في عناوين الرفوف والمؤلفين..."
          />
          <button className="btn-gold" type="submit">
            بحث
          </button>
        </form>
      </PageHero>

      <BookshelfHall
        activeShelf={shelf}
        onShelf={setShelf}
        selected={selected}
        onSelect={setSelected}
        onOpen={(book, mode) => setOpen({ book, mode })}
        query={q}
      />

      {open ? (
        <ReadingChamber book={open.book} initialMode={open.mode} onClose={() => setOpen(null)} />
      ) : null}
    </div>
  );
}

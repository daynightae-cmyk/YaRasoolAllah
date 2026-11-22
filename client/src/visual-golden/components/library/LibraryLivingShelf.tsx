import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { categoryLabel } from "@/visual-golden/services/library-catalog-presentation";
import {
  displayAuthor,
  displayTitle,
  canReadTextInside,
  type CatalogWork,
} from "@/visual-golden/services/catalog-library";
import styles from "./LibraryLivingShelf.module.css";

/**
 * The Library Living Shelf — the wing's full facade.
 *
 * Two wooden rows of real catalogued volumes, ten at a time, turning with the
 * day. This is the front of the Library the reference depicts: a bookcase
 * wall, not a banner. Nothing here is hand-written — every book is a work the
 * catalog can actually open (`canReadTextInside`), and the order is a stable
 * hash of the work id against the local date, so the shelf is curated, not
 * random, and it will not shuffle under the reader's hand on a re-render.
 */

const SHELF_SIZE = 5;
const SHELF_ROWS = 2;
const PAGE_SIZE = SHELF_SIZE * SHELF_ROWS;

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function dayIndex(): number {
  const now = new Date();
  return now.getFullYear() * 372 + now.getMonth() * 31 + now.getDate();
}

interface Props {
  works: CatalogWork[];
  onOpen: (work: CatalogWork) => void;
}

export function LibraryLivingShelf({ works, onOpen }: Props) {
  const lang = useInstitution((state) => state.lang);
  const [rotation, setRotation] = useState(0);

  const readable = useMemo(
    () => works.filter((work) => canReadTextInside(work)),
    [works],
  );

  const rows = useMemo(() => {
    if (!readable.length) return [];
    const day = dayIndex();
    const ranked = readable
      .map((work, index) => ({
        work,
        rank: (hash(work.id) + index * 7919 + day * 104729) % 1000003,
      }))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, Math.min(PAGE_SIZE * 2, readable.length));

    const page = Array.from(
      { length: Math.min(PAGE_SIZE, ranked.length) },
      (_, slot) => ranked[(slot + rotation * PAGE_SIZE) % ranked.length].work,
    );
    const result: CatalogWork[][] = [];
    for (let row = 0; row < SHELF_ROWS; row += 1) {
      const slice = page.slice(row * SHELF_SIZE, (row + 1) * SHELF_SIZE);
      if (slice.length) result.push(slice);
    }
    return result;
  }, [readable, rotation]);

  if (!rows.length) return null;

  const copy =
    lang === "ar"
      ? {
          eyebrow: "واجهة الرفوف",
          title: "كتبٌ من فهرس المؤسسة، كلٌّ منها بنسخة موثقة تُفتح الآن",
          prev: "الكتب السابقة",
          next: "كتب أخرى",
          note: "ترتيب الواجهة يتغيّر مع كل يوم، والأعمال كلها من فهرس المؤسسة المحمّل: لا عنوان ولا غلاف من عندنا.",
        }
      : {
          eyebrow: "The shelf facade",
          title: "Catalogued works, each opened from a governed version",
          prev: "Previous works",
          next: "More works",
          note: "The facade order turns with the day. Every work comes from the loaded catalog: no invented title, no invented cover.",
        };

  // `readable` is the honest inventory: works whose governed version the reader
  // can actually open. Rotation only turns when there is another page to turn to.
  const canTurn = readable.length > PAGE_SIZE;
  const pageCount = Math.max(
    1,
    Math.ceil(Math.min(readable.length, PAGE_SIZE * 2) / PAGE_SIZE),
  );

  return (
    <section
      className={styles.wrap}
      aria-labelledby="living-shelf-title"
      data-visual="library-living-shelf"
      data-readable={readable.length}
      data-rows={rows.length}
    >
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          <Sparkles size={13} aria-hidden="true" />
          {copy.eyebrow}
        </p>
        <h2 id="living-shelf-title">{copy.title}</h2>
      </header>

      <div className={styles.stage}>
        {canTurn ? (
          <button
            type="button"
            className={styles.arrow}
            onClick={() => setRotation((v) => (v + pageCount - 1) % pageCount)}
            aria-label={copy.prev}
          >
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        ) : null}

        <div className={styles.facade}>
          {rows.map((row, rowIndex) => (
            <div className={styles.shelfUnit} key={rowIndex} data-shelf-row={rowIndex}>
              <ol className={styles.row}>
                {row.map((work) => (
                  <li key={work.id}>
                    <button
                      type="button"
                      className={styles.book}
                      onClick={() => onOpen(work)}
                      title={`${displayTitle(work, lang)} — ${displayAuthor(work, lang)}`}
                    >
                      <span className={styles.band} aria-hidden="true" />
                      <strong>{displayTitle(work, lang)}</strong>
                      <span>{displayAuthor(work, lang)}</span>
                      <small>
                        {categoryLabel(work.category, lang)}
                        {work.deathHijri ? ` · ${work.deathHijri} ھ` : ""}
                      </small>
                    </button>
                  </li>
                ))}
              </ol>
              <div className={styles.ledge} aria-hidden="true" />
            </div>
          ))}
        </div>

        {canTurn ? (
          <button
            type="button"
            className={styles.arrow}
            onClick={() => setRotation((v) => (v + 1) % pageCount)}
            aria-label={copy.next}
          >
            <ArrowLeft size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <p className={styles.note}>{copy.note}</p>
    </section>
  );
}

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
 * The Library Living Shelf — the wing's front door.
 *
 * The shelves should not go quiet behind a catalog table. This is the honest
 * answer: not invented shelf decoration, but real catalogued works, five at a
 * time, turning with the day, each one openable.
 *
 * Nothing here is hand-written. Every book is a work the catalog can actually
 * open (`canReadTextInside`), and the order is a stable hash of the work id
 * against the local date — so the shelf is curated, not random, and it will
 * not shuffle under the reader's hand on a re-render.
 */

const SHELF_SIZE = 5;

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

  const shelf = useMemo(() => {
    if (!readable.length) return [];
    const day = dayIndex();
    const ranked = readable
      .map((work, index) => ({
        work,
        rank: (hash(work.id) + index * 7919 + day * 104729) % 1000003,
      }))
      .sort((a, b) => a.rank - b.rank)
      .slice(0, Math.min(SHELF_SIZE * 4, readable.length));

    return Array.from(
      { length: Math.min(SHELF_SIZE, ranked.length) },
      (_, slot) => ranked[(slot + rotation * SHELF_SIZE) % ranked.length].work,
    );
  }, [readable, rotation]);

  if (!shelf.length) return null;

  const copy =
    lang === "ar"
      ? {
          eyebrow: "رفّ اليوم",
          title: "كتبٌ من فهرس المؤسسة، كلٌّ منها بنسخة موثقة تُفتح الآن",
          prev: "الكتب السابقة",
          next: "كتب أخرى",
          note: "ترتيب الرفّ يتغيّر مع كل يوم، والأعمال كلها من فهرس المؤسسة المحمّل: لا عنوان ولا غلاف من عندنا.",
        }
      : {
          eyebrow: "Shelf of the day",
          title: "Catalogued works, each opened from a governed version",
          prev: "Previous works",
          next: "More works",
          note: "The shelf order turns with the day. Every work comes from the loaded catalog: no invented title, no invented cover.",
        };

  // `readable` is the honest inventory: works whose governed version the reader
  // can actually open. Rotation only turns when there is another page to turn to.
  const canTurn = readable.length > SHELF_SIZE;
  const pageCount = Math.max(1, Math.ceil(Math.min(readable.length, SHELF_SIZE * 4) / SHELF_SIZE));

  return (
    <section
      className={styles.wrap}
      aria-labelledby="living-shelf-title"
      data-visual="library-living-shelf"
      data-readable={readable.length}
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

        <ol className={styles.row}>
          {shelf.map((work) => (
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

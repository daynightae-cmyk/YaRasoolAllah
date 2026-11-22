import { useMemo, type CSSProperties } from "react";
import { ArrowUpRight } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import {
  displayAuthor,
  displayTitle,
  hashWorkId,
  type CatalogWork,
} from "@/visual-golden/services/catalog-library";
import styles from "./LibraryDomainShelves.module.css";

/**
 * Doors of Knowledge, shelved — not a flat card grid.
 *
 * Each domain is a wooden shelf strip beneath the living facade: a brass
 * plate with the domain's real catalog count, and a row of actual spines from
 * that domain. The spines are the first works the catalog holds for the
 * domain (deterministic order, no invented books); opening one goes straight
 * to the reading chamber, and the plate enters the full hall.
 */

const SPINES_PER_DOMAIN = 6;
const SPINE_COLORS = [
  "#14372f", "#4a2418", "#192947", "#4a1f2c",
  "#0e3f35", "#5a3a17", "#28324d", "#3f243f",
];

export interface DomainGateway {
  category: string;
  titleAr: string;
  titleEn: string;
  hintAr: string;
  hintEn: string;
  mark: string;
}

interface Props {
  domains: DomainGateway[];
  works: CatalogWork[];
  onOpen: (work: CatalogWork) => void;
  onEnterDomain: (category: string) => void;
}

export function LibraryDomainShelves({ domains, works, onOpen, onEnterDomain }: Props) {
  const lang = useInstitution((state) => state.lang);

  const byCategory = useMemo(() => {
    const map = new Map<string, CatalogWork[]>();
    for (const work of works) {
      if (!work.category) continue;
      const list = map.get(work.category);
      if (list) list.push(work);
      else map.set(work.category, [work]);
    }
    return map;
  }, [works]);

  const arNumber = useMemo(() => new Intl.NumberFormat("ar-EG"), []);
  const enNumber = useMemo(() => new Intl.NumberFormat("en-US"), []);
  const formatCount = (count: number) =>
    lang === "ar" ? arNumber.format(count) : enNumber.format(count);

  const copy = lang === "ar"
    ? {
        eyebrow: "أبواب المعرفة",
        title: "ابدأ من العلم الذي تطلبه",
        hint: "كل باب رفٌّ حقيقي من الفهرس: الكتب الظاهرة أعمال مسجلة، والعدد من الفهرس المحمّل لا من تقدير مكتوب بيد.",
        works: "عمل",
        openHall: "افتح القاعة",
        openBook: "افتح الكتاب",
        empty: "لا أعمال مصنفة في هذا الباب بعد.",
      }
    : {
        eyebrow: "Doors of Knowledge",
        title: "Begin with the science you seek",
        hint: "Every door is a real catalog shelf: the visible spines are catalogued works, and the count comes from the loaded catalog, not a hand-written estimate.",
        works: "works",
        openHall: "Open the hall",
        openBook: "Open book",
        empty: "No classified works in this domain yet.",
      };

  return (
    <section
      className={styles.wrap}
      data-visual="library-gateways"
      aria-labelledby="library-gateways-title"
    >
      <header className={styles.heading}>
        <span>{copy.eyebrow}</span>
        <h2 id="library-gateways-title">{copy.title}</h2>
        <p>{copy.hint}</p>
      </header>

      <div className={styles.ledger}>
        {domains.map((domain) => {
          const domainWorks = byCategory.get(domain.category) ?? [];
          const spines = domainWorks.slice(0, SPINES_PER_DOMAIN);
          return (
            <article
              key={domain.category}
              className={styles.shelfStrip}
              data-domain-shelf={domain.category}
            >
              <button
                type="button"
                className={styles.plate}
                data-domain-gateway={domain.category}
                onClick={() => onEnterDomain(domain.category)}
              >
                <em className={styles.mark} aria-hidden="true">{domain.mark}</em>
                <strong>{lang === "ar" ? domain.titleAr : domain.titleEn}</strong>
                <span>{lang === "ar" ? domain.hintAr : domain.hintEn}</span>
                <small>
                  {formatCount(domainWorks.length)} {copy.works}
                  <ArrowUpRight size={13} aria-hidden="true" />
                  <i>{copy.openHall}</i>
                </small>
              </button>

              <div className={styles.spineBay}>
                {spines.length ? (
                  <div className={styles.spines} role="list">
                    {spines.map((work) => {
                      const hash = hashWorkId(work.id);
                      const style = {
                        "--spine": SPINE_COLORS[hash % SPINE_COLORS.length],
                        "--height": `${118 + (hash % 34)}px`,
                      } as CSSProperties;
                      return (
                        <div role="listitem" key={work.id} className={styles.spineWrap}>
                          <button
                            type="button"
                            className={styles.spine}
                            style={style}
                            onClick={() => onOpen(work)}
                            aria-label={`${copy.openBook}: ${displayTitle(work, lang)}`}
                            title={`${displayTitle(work, lang)} — ${displayAuthor(work, lang)}`}
                          >
                            <span className={styles.spineCap} aria-hidden="true" />
                            <span className={styles.spineTitle}>
                              {displayTitle(work, lang)}
                            </span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.empty}>{copy.empty}</p>
                )}
                <div className={styles.ledge} aria-hidden="true" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

LibraryDomainShelves.displayName = "LibraryDomainShelves";

import { BookImage, ExternalLink, ShieldAlert } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { MANUSCRIPT_SOURCES, type ManuscriptSource } from "@/visual-golden/services/iiif";
import styles from "./ManuscriptGallery.module.css";

interface Props {
  onOpen: (source: ManuscriptSource) => void;
}

export function ManuscriptGallery({ onOpen }: Props) {
  const lang = useInstitution((state) => state.lang);
  const ar = lang === "ar";
  const copy = ar
    ? {
        eyebrow: "قارئ IIIF الخارجي",
        title: "قاعة المخطوطات المصورة",
        intro: "صفحات تُقرأ من المؤسسات المالكة عبر IIIF، بلا نسخ للمحتوى أو إنشاء سجل قراءة داخلي. تُفحص الإتاحة الفعلية عند فتح كل بيان.",
        live: "فحص مباشر عند الفتح",
        blocked: "آخر حالة معروفة: HTTP 403",
        open: "افتح وافحص الإتاحة",
        retry: "أعد فحص الإتاحة",
        source: "المصدر الأصلي",
      }
    : {
        eyebrow: "EXTERNAL IIIF READER",
        title: "Digitized manuscript gallery",
        intro: "Pages stream from their holding institutions through IIIF. Nothing is copied or promoted to an internal catalog record; live availability is checked on open.",
        live: "Live check on open",
        blocked: "Last known status: HTTP 403",
        open: "Open and check availability",
        retry: "Recheck availability",
        source: "Original source",
      };

  return (
    <section className={styles.gallery} aria-labelledby="manuscript-gallery-title">
      <header>
        <div>
          <span>{copy.eyebrow}</span>
          <h2 id="manuscript-gallery-title">{copy.title}</h2>
          <p>{copy.intro}</p>
        </div>
        <BookImage aria-hidden="true" />
      </header>
      <div className={styles.grid}>
        {MANUSCRIPT_SOURCES.map((source) => (
          <article key={source.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span>{source.provider}</span>
              {source.state === "provider_blocked" ? (
                <b data-blocked>
                  <ShieldAlert size={13} aria-hidden="true" /> {copy.blocked}
                </b>
              ) : <b>{copy.live}</b>}
            </div>
            <h3>{ar ? source.titleAr : source.titleEn}</h3>
            <p>{ar ? source.descriptionAr : source.descriptionEn}</p>
            <div className={styles.actions}>
              <button type="button" onClick={() => onOpen(source)}>
                {source.state === "provider_blocked" ? copy.retry : copy.open}
              </button>
              <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                {copy.source} <ExternalLink size={14} aria-hidden="true" />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

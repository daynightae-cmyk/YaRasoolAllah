import { BookImage, ExternalLink, ShieldAlert } from "lucide-react";
import {
  MANUSCRIPT_SOURCES,
  type ManuscriptSource,
} from "@/visual-golden/services/iiif";
import styles from "./ManuscriptGallery.module.css";

interface Props {
  onOpen: (source: ManuscriptSource) => void;
}

export function ManuscriptGallery({ onOpen }: Props) {
  return (
    <section className={styles.gallery} aria-labelledby="manuscript-gallery-title">
      <header>
        <div>
          <span>IIIF MANUSCRIPT READER</span>
          <h2 id="manuscript-gallery-title">قاعة المخطوطات المصوّرة</h2>
          <p>
            صفحات أصلية من المؤسسات المالكة، تُقرأ من بيانات IIIF بدون نسخ
            المحتوى إلى المنصة أو ادعاء حقوق غير موجودة.
          </p>
        </div>
        <BookImage aria-hidden="true" />
      </header>

      <div className={styles.grid}>
        {MANUSCRIPT_SOURCES.map((source) => (
          <article key={source.id} className={styles.card}>
            <div className={styles.cardTop}>
              <span>{source.provider}</span>
              {source.state === "verified_reader" ? (
                <b>تم التحقق الحي</b>
              ) : (
                <b data-blocked>
                  <ShieldAlert size={13} /> حجب مزوّد
                </b>
              )}
            </div>
            <h3>{source.titleAr}</h3>
            <p>{source.descriptionAr}</p>
            <div className={styles.actions}>
              {source.state === "verified_reader" ? (
                <button type="button" onClick={() => onOpen(source)}>
                  افتح داخل القارئ
                </button>
              ) : null}
              <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
                المصدر الأصلي <ExternalLink size={14} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

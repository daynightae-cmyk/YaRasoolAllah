import { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import styles from "./present.module.css";

interface Props {
  title: string;
  en?: string;
  image: string;
  summary?: string;
  ageBand?: string;
  adaptationLabel?: string;
  editorialStatus?: string;
  reviewStatus?: string;
  depictionPolicy?: string;
  sourceCount?: number;
  onClose: () => void;
}

export function StoryTheatre({
  title,
  en,
  image,
  summary,
  ageBand,
  adaptationLabel,
  editorialStatus,
  reviewStatus,
  depictionPolicy,
  sourceCount,
  onClose,
}: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setOpen(true));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className={`${styles.theatre} ${open ? styles.theatreOpen : ""}`} role="dialog" aria-label={title}>
      <div className={styles.curtain} aria-hidden>
        <div className={styles.curtainL} />
        <div className={styles.curtainR} />
      </div>
      <div className={styles.theatreBar}>
        <span className="gold-text">مسرح القصص · وضع القراءة</span>
        <button type="button" className="btn-outline" onClick={onClose} aria-label="إغلاق">
          <X size={16} /> إغلاق
        </button>
      </div>
      <div className={styles.theatreStage}>
        <img src={image} alt="" />
        <div className={styles.theatreCaption}>
          <h2>{title}</h2>
          {en ? <p className="muted">{en}</p> : null}
          {ageBand ? <p className="muted">الفئة العمرية: {ageBand}</p> : null}
          {summary ? <p style={{ lineHeight: 1.9 }}>{summary}</p> : null}
          <p className="muted" style={{ fontSize: "0.8rem" }}>
            الوسائط المعتمدة (فيديو/صوت) غير متوفرة بعد — هذا وضع معاينة وقراءة فقط.
          </p>
          <p className="muted" style={{ fontSize: "0.78rem", display: "flex", gap: 4, alignItems: "center" }}>
            <ShieldCheck size={13} />
            {adaptationLabel === "platform_original_not_a_direct_quote"
              ? "تكييف تعليمي أصلي للمنصة — ليس اقتباسًا مباشرًا من نص منقول"
              : "مادة تعليمية"}
            {editorialStatus ? ` · التحرير: ${editorialStatus === "draft" ? "مسودة" : "قيد المراجعة التحريرية"}` : ""}
            {reviewStatus ? ` · المراجعة العلمية: معلقة` : ""}
          </p>
          {depictionPolicy ? (
            <p className="muted" style={{ fontSize: "0.78rem" }}>
              سياسة التصوير: لا تجسيد للنبي ﷺ
              {typeof sourceCount === "number" ? ` · ${sourceCount} مصادر مرتبطة` : ""}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

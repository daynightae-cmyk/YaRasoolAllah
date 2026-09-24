import { useEffect, useState } from "react";
import { X } from "lucide-react";
import styles from "./present.module.css";

interface Props {
  title: string;
  en?: string;
  image: string;
  onClose: () => void;
}

export function StoryTheatre({ title, en, image, onClose }: Props) {
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
        <span className="gold-text">مسرح القصص</span>
        <button type="button" className="btn-outline" onClick={onClose} aria-label="إغلاق">
          <X size={16} /> إغلاق
        </button>
      </div>
      <div className={styles.theatreStage}>
        <img src={image} alt="" />
        <div className={styles.theatreCaption}>
          <h2>{title}</h2>
          {en ? <p className="muted">{en}</p> : null}
          <p>قصة تفاعلية — المحتوى سيُربط لاحقًا من مصدر البيانات</p>
        </div>
      </div>
    </div>
  );
}

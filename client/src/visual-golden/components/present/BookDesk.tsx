import { X } from "lucide-react";
import styles from "./present.module.css";

interface Props {
  title: string;
  author: string;
  pages: number;
  tag: string;
  image: string;
  onClose: () => void;
}

export function BookDesk({ title, author, pages, tag, image, onClose }: Props) {
  return (
    <div className={styles.deskScrim} onClick={onClose} role="presentation">
      <div className={styles.desk} role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <img src={image} alt="" />
        <div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h3>{title}</h3>
            <button type="button" className="btn-outline" onClick={onClose} aria-label="إغلاق">
              <X size={14} />
            </button>
          </div>
          <p>{author}</p>
          <div className={styles.deskMeta}>
            <span>{tag}</span>
            <span>PDF</span>
            <span>{pages} صفحة</span>
          </div>
          <div className={styles.parchment}>
            <p style={{ margin: 0, lineHeight: 1.9 }}>[بيانات الكتاب] مقتطف بصري من غلاف ومقدمة العمل. النص الكامل سيُربط لاحقًا من مصدر المكتبة.</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
            <button type="button" className="btn-gold">
              فتح المكتب
            </button>
            <button type="button" className="btn-outline">
              أضف للقائمة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

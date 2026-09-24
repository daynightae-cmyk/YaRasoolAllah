import { useState } from "react";
import { X } from "lucide-react";
import styles from "./unique.module.css";

const colors = ["#065f46", "#d4a017", "#1a2d4a", "#b45309", "#fefdf8", "#047857"];

interface Props {
  onClose: () => void;
}

export function ColoringStudio({ onClose }: Props) {
  const [paint, setPaint] = useState(colors[0]);
  const [fills, setFills] = useState<Record<string, string>>({
    dome: "#064e3b",
    arch: "#0b2a24",
    lantern: "#a16207",
    floor: "#12241e",
    moon: "#e8c547",
  });

  return (
    <div className={styles.studio} role="dialog" aria-label="استوديو التلوين">
      <div className={styles.board}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.6rem" }}>
          <strong className="gold-text">تلوين الفانوس والقبة</strong>
          <button type="button" className="btn-outline" onClick={onClose} aria-label="إغلاق">
            <X size={14} />
          </button>
        </div>
        <svg viewBox="0 0 240 200" width="100%" height="220" aria-hidden>
          <circle
            cx="200"
            cy="28"
            r="14"
            fill={fills.moon}
            onClick={() => setFills((f) => ({ ...f, moon: paint }))}
            style={{ cursor: "pointer" }}
          />
          <path
            d="M30 170 L210 170 L210 110 Q120 40 30 110 Z"
            fill={fills.arch}
            stroke="#e8c547"
            strokeWidth="2"
            onClick={() => setFills((f) => ({ ...f, arch: paint }))}
            style={{ cursor: "pointer" }}
          />
          <ellipse
            cx="120"
            cy="78"
            rx="42"
            ry="28"
            fill={fills.dome}
            stroke="#e8c547"
            onClick={() => setFills((f) => ({ ...f, dome: paint }))}
            style={{ cursor: "pointer" }}
          />
          <rect
            x="108"
            y="118"
            width="24"
            height="36"
            rx="4"
            fill={fills.lantern}
            stroke="#f5e6b8"
            onClick={() => setFills((f) => ({ ...f, lantern: paint }))}
            style={{ cursor: "pointer" }}
          />
          <rect
            x="20"
            y="170"
            width="200"
            height="16"
            fill={fills.floor}
            onClick={() => setFills((f) => ({ ...f, floor: paint }))}
            style={{ cursor: "pointer" }}
          />
        </svg>
        <p className="muted" style={{ textAlign: "center", fontSize: "0.78rem" }}>
          اختر لونًا ثم اضغط جزءًا من الرسم
        </p>
        <div className={styles.palette}>
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.swatch} ${paint === c ? styles.swatchOn : ""}`}
              style={{ background: c }}
              aria-label={c}
              onClick={() => setPaint(c)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import type { BasirahRecord } from "@/visual-golden/services/basirah";
import styles from "./basirah.module.css";

export function BasirahRelatedPath({ records, lang }: { records: BasirahRecord[]; lang: "ar" | "en" }) {
  const nodes = records.slice(0, 5);
  return (
    <svg className={styles.constellation} viewBox="0 0 640 160" role="img" aria-label={lang === "ar" ? "مسار الأدلة" : "Evidence path"}>
      <defs>
        <linearGradient id="thread" x1="0" x2="1">
          <stop offset="0%" stopColor="rgba(232,197,71,0.15)" />
          <stop offset="100%" stopColor="rgba(232,197,71,0.8)" />
        </linearGradient>
      </defs>
      {nodes.map((_, i) =>
        i < nodes.length - 1 ? (
          <line key={`l${i}`} x1={70 + i * 120} y1="80" x2={70 + (i + 1) * 120} y2="80" stroke="url(#thread)" strokeWidth="1.5" />
        ) : null,
      )}
      {nodes.map((n, i) => (
        <g key={n.id}>
          <circle cx={70 + i * 120} cy="80" r="18" fill="#041612" stroke="#e8c547" strokeWidth="1.4" />
          <text x={70 + i * 120} y="118" textAnchor="middle" fill="#f0d78c" fontSize="10" fontFamily="Cairo, sans-serif">
            {lang === "ar" ? n.kindAr : n.kindEn}
          </text>
        </g>
      ))}
    </svg>
  );
}

import type { BasirahRecord } from "@/visual-golden/mock/basirah";
import { BasirahEvidenceCard } from "./BasirahEvidenceCard";
import styles from "./basirah.module.css";

export function BasirahSourceRail({
  records,
  lang,
  title,
}: {
  records: BasirahRecord[];
  lang: "ar" | "en";
  title: string;
}) {
  return (
    <aside className={styles.rail}>
      <h3>{title}</h3>
      {records.map((r) => (
        <BasirahEvidenceCard key={r.id} record={r} lang={lang} />
      ))}
    </aside>
  );
}

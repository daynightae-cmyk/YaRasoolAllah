import { Link } from "wouter";
import type { BasirahRecord } from "@/visual-golden/services/basirah";
import styles from "./basirah.module.css";

export function BasirahEvidenceCard({ record, lang }: { record: BasirahRecord; lang: "ar" | "en" }) {
  return (
    <Link href={record.path} className={styles.card}>
      <b>{lang === "ar" ? record.titleAr : record.titleEn}</b>
      <small>
        {lang === "ar" ? record.kindAr : record.kindEn} · {lang === "ar" ? record.hintAr : record.hintEn}
      </small>
      <small style={{ opacity: 0.8 }}>{record.availabilityAr}</small>
    </Link>
  );
}

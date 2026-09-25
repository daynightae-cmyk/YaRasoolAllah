import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";
import styles from "./shared.module.css";

type AppPath =
  | "/"
  | "/library"
  | "/quran"
  | "/tafsir"
  | "/hadith"
  | "/atlas"
  | "/kids"
  | "/daily"
  | "/audio"
  | "/seerah";

interface Props {
  title: string;
  en?: string;
  href?: AppPath;
  action?: string;
}

export function SectionHead({ title, en, href, action = "عرض الكل" }: Props) {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.sectionTitles}>
        <h2>{title}</h2>
        {en ? <span className={styles.en}>{en}</span> : null}
      </div>
      {href ? (
        <Link href={href} className={styles.viewAll}>
          {action} <ChevronLeft size={14} />
        </Link>
      ) : null}
    </div>
  );
}

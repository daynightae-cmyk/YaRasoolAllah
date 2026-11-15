import { Link } from "wouter";
import { Clock3, History, LockKeyhole } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { readingResumeTarget } from "@/visual-golden/lib/institution/reading-progress";
import styles from "./shell.module.css";

export function InstitutionActivityRail() {
  const lang = useInstitution((state) => state.lang);
  const readingProgress = useInstitution((state) => state.readingProgress);
  const setPanel = useInstitution((state) => state.setPanel);
  const recent = [...readingProgress]
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 4);
  const resumeTarget = readingResumeTarget(readingProgress);

  return (
    <aside className={styles.activityRail} aria-label={lang === "ar" ? "نشاط القراءة المحلي" : "Local reading activity"}>
      <div className={styles.railHead}>
        <History size={15} aria-hidden="true" />
        <span>{lang === "ar" ? "مواضع القراءة المحلية" : "Local reading positions"}</span>
      </div>

      {resumeTarget ? (
        <Link href={resumeTarget.path} className={styles.lastActivity}>
          <small>{lang === "ar" ? "آخر موضع قراءة" : "Last reading position"}</small>
          <strong>{lang === "ar" ? resumeTarget.titleAr : resumeTarget.titleEn}</strong>
          <span>{lang === "ar" ? resumeTarget.locationAr : resumeTarget.locationEn}</span>
        </Link>
      ) : (
        <p className={styles.railEmpty}>{lang === "ar" ? "لا يوجد موضع قراءة محفوظ بعد." : "No saved reading position yet."}</p>
      )}

      {recent.length > 0 ? (
        <ol className={styles.railList}>
          {recent.map((entry) => (
            <li key={entry.id}>
              <Link href={entry.path}>
                <Clock3 size={12} aria-hidden="true" />
                <span>{lang === "ar" ? entry.titleAr : entry.titleEn}</span>
              </Link>
            </li>
          ))}
        </ol>
      ) : null}

      <button type="button" className={styles.railButton} onClick={() => setPanel("journey")}>
        {lang === "ar" ? "عرض سجل الرحلة" : "View journey"}
      </button>

      <p className={styles.railScope}>
        <LockKeyhole size={12} aria-hidden="true" />
        {lang === "ar" ? "حفظ محلي فقط؛ لا يوجد حساب أو مزامنة." : "Local storage only; no account or sync."}
      </p>
    </aside>
  );
}

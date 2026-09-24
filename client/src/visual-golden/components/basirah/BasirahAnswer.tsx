import { t, type Lang } from "@/visual-golden/lib/i18n";
import { BasirahEmptyState } from "./BasirahEmptyState";
import styles from "./basirah.module.css";

interface Props {
  lang: Lang;
  ran: boolean;
  hitCount: number;
  modeLabel: string;
}

export function BasirahAnswer({ lang, ran, hitCount, modeLabel }: Props) {
  return (
    <div className={styles.lanes}>
      <article className={styles.lane} data-kind="source">
        <h4>{t(lang, "sourceText")}</h4>
        <BasirahEmptyState text="[ستظهر الإجابة الموثقة هنا بعد ربط محرك البحث بالمصادر]" />
      </article>
      <article className={styles.lane}>
        <h4>{t(lang, "summary")}</h4>
        {ran && hitCount === 0 ? (
          <BasirahEmptyState text={t(lang, "noResults")} />
        ) : (
          <BasirahEmptyState
            text={
              lang === "ar"
                ? `فهرس المؤسسة يعرض ${hitCount} سجلًا مطابقًا في وضع «${modeLabel}». ليست هذه نصوصًا دينية مولَّدة.`
                : `The institutional index lists ${hitCount} matching records in “${modeLabel}”. These are not generated religious texts.`
            }
          />
        )}
      </article>
      <article className={styles.lane}>
        <h4>{t(lang, "explanation")}</h4>
        <BasirahEmptyState
          text={
            lang === "ar"
              ? "الشرح سيُربط لاحقًا بالمصادر المعتمدة، منفصلًا عن أي توليد آلي."
              : "Explanation will later bind to approved sources, kept separate from any generated assistance."
          }
        />
      </article>
      <article className={styles.lane} data-kind="ai">
        <h4>{t(lang, "assistance")}</h4>
        <BasirahEmptyState text={t(lang, "emptyAnswer")} />
      </article>
    </div>
  );
}

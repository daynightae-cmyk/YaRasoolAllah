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
        <BasirahEmptyState
          text={
            lang === "ar"
              ? hitCount > 0
                ? `تم العثور على ${hitCount} من المصادر ذات الصلة في وضع «${modeLabel}» — افتح بطاقات السكة للوصول إلى المصدر.`
                : "لم تُطابق المصادر المحلية هذا الاستعلام بعد."
              : hitCount > 0
                ? `${hitCount} related sources found in “${modeLabel}” — open the rail cards to reach each source.`
                : "No local sources match this query yet."
          }
        />
      </article>
      <article className={styles.lane}>
        <h4>{t(lang, "summary")}</h4>
        {ran && hitCount === 0 ? (
          <BasirahEmptyState text={t(lang, "noResults")} />
        ) : (
          <BasirahEmptyState
            text={
              lang === "ar"
                ? `فهرس المصادر المحلية يعرض ${hitCount} سجلًا مطابقًا في وضع «${modeLabel}». ليست هذه نصوصًا دينية مولَّدة ولا فتوى.`
                : `The local source index lists ${hitCount} matching records in “${modeLabel}”. These are not generated religious texts or fatwa.`
            }
          />
        )}
      </article>
      <article className={styles.lane}>
        <h4>{t(lang, "explanation")}</h4>
        <BasirahEmptyState
          text={
            lang === "ar"
              ? "لا يولّد بصيرة إجابات دينية من عنده — اعتمد سكة المصادر ومواضعها."
              : "Basirah does not generate religious answers — rely on the source rail and its passages."
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

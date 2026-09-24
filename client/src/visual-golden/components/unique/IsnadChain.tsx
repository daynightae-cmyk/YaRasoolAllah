import styles from "./unique.module.css";

interface Props {
  /** Recorded narrator for the displayed sample. Only this node is real data. */
  narrator?: string;
  collection?: string;
}

/**
 * Honest single-attestation display: the structured isnad chain is not
 * available as data, so only the sample's recorded narrator is shown.
 */
export function IsnadChain({ narrator, collection }: Props) {
  if (!narrator) {
    return (
      <p className="muted" style={{ fontSize: "0.78rem" }}>
        بيانات السلسلة غير متوفرة — لم تُربط سلاسل الإسناد كبنية بيانات بعد.
      </p>
    );
  }
  return (
    <div>
      <div className={styles.chain} role="list" aria-label="الراوي المسجل">
        <div role="listitem" className={`${styles.bead} ${styles.beadOn}`}>
          <b>{narrator.length > 28 ? `${narrator.slice(0, 28)}…` : narrator}</b>
        </div>
      </div>
      <p className="muted" style={{ margin: "0.4rem 0 0", fontSize: "0.75rem" }}>
        الراوي المسجل في السجل التطويري{collection ? ` · ${collection}` : ""} — السلسلة الكاملة غير
        متوفرة كبنية بيانات.
      </p>
    </div>
  );
}

import { useState } from "react";
import styles from "./unique.module.css";

/** VISUAL PROTOTYPE — narrator labels are display placeholders. */
const links = ["أبو هريرة", "الراوي 02", "الراوي 03", "يحيى بن سعيد", "البخاري"];

export function IsnadChain() {
  const [on, setOn] = useState(0);
  return (
    <div className={styles.chain} role="list" aria-label="سلسلة الإسناد البصرية">
      {links.map((n, i) => (
        <div key={n} style={{ display: "contents" }}>
          {i > 0 ? <span className={styles.thread} aria-hidden /> : null}
          <button
            type="button"
            className={`${styles.bead} ${on === i ? styles.beadOn : ""}`}
            onClick={() => setOn(i)}
          >
            <b>{n}</b>
          </button>
        </div>
      ))}
    </div>
  );
}

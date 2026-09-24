import styles from "./basirah.module.css";

export function BasirahEmptyState({ text }: { text: string }) {
  return <p className={styles.placeholder}>{text}</p>;
}

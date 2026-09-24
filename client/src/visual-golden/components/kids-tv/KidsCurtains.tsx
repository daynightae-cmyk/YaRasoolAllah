import styles from "./KidsTVRoom.module.css";

type Props = {
  open: boolean;
};

export function KidsCurtains({ open }: Props) {
  return (
    <div className={styles.curtainLayer} data-open={open} aria-hidden="true">
      <div className={styles.curtainLeft}><span /></div>
      <div className={styles.curtainRight}><span /></div>
      <div className={styles.curtainValance} />
    </div>
  );
}

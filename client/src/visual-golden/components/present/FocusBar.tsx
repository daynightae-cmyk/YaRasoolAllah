import { Expand, Minimize2, LayoutGrid } from "lucide-react";
import styles from "./present.module.css";

interface Props {
  focus: boolean;
  onFocus: () => void;
  extra?: { label: string; on: boolean; onClick: () => void };
}

export function FocusBar({ focus, onFocus, extra }: Props) {
  return (
    <div className={styles.focusBar}>
      {extra ? (
        <button type="button" className={extra.on ? styles.on : ""} onClick={extra.onClick}>
          <LayoutGrid size={14} /> {extra.label}
        </button>
      ) : null}
      <button type="button" className={focus ? styles.on : ""} onClick={onFocus}>
        {focus ? <Minimize2 size={14} /> : <Expand size={14} />}
        {focus ? "خروج من العرض" : "عرض مركّز"}
      </button>
    </div>
  );
}

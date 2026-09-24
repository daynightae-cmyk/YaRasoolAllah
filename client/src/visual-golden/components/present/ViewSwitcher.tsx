import { LayoutGrid, PanelsTopLeft, Route } from "lucide-react";
import styles from "./present.module.css";

export type ViewMode = "cards" | "panorama" | "path";

const modes: { id: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { id: "cards", label: "بطاقات", icon: LayoutGrid },
  { id: "panorama", label: "بانوراما", icon: PanelsTopLeft },
  { id: "path", label: "مسار", icon: Route },
];

interface Props {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}

export function ViewSwitcher({ value, onChange }: Props) {
  return (
    <div className={styles.switcher} role="tablist" aria-label="طريقة العرض">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          role="tab"
          aria-selected={value === m.id}
          className={value === m.id ? styles.on : ""}
          onClick={() => onChange(m.id)}
        >
          <m.icon size={13} />
          {m.label}
        </button>
      ))}
    </div>
  );
}

import { LayoutGrid, Route } from "lucide-react";
import styles from "./present.module.css";

export type ViewMode = "cards" | "panorama" | "path";

const modes: { id: ViewMode; label: string; en: string; icon: typeof LayoutGrid }[] = [
  { id: "cards", label: "بطاقات", en: "Wings", icon: LayoutGrid },
  { id: "panorama", label: "بانوراما", en: "Panorama", icon: LayoutGrid },
  { id: "path", label: "مسار", en: "Path", icon: Route },
];

interface Props {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
  lang?: "ar" | "en";
}

export function ViewSwitcher({ value, onChange, lang = "ar" }: Props) {
  return (
    <div className={styles.switcher} role="tablist" aria-label={lang === "ar" ? "طريقة العرض" : "View mode"}>
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
          {lang === "ar" ? m.label : m.en}
        </button>
      ))}
    </div>
  );
}

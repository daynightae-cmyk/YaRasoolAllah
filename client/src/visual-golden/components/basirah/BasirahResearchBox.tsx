import { Search } from "lucide-react";
import styles from "./basirah.module.css";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
}

export function BasirahResearchBox({ value, onChange, onSubmit, placeholder, submitLabel }: Props) {
  return (
    <form
      className={styles.search}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Search size={18} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
      <button type="submit">{submitLabel}</button>
    </form>
  );
}

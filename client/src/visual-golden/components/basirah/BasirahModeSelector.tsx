import { BASIRAH_MODES, BASIRAH_SCOPES, type BasirahMode, type BasirahScope } from "@/visual-golden/services/basirah";
import styles from "./basirah.module.css";

interface Props {
  scope: BasirahScope;
  mode: BasirahMode;
  lang: "ar" | "en";
  onScope: (s: BasirahScope) => void;
  onMode: (m: BasirahMode) => void;
}

export function BasirahModeSelector({ scope, mode, lang, onScope, onMode }: Props) {
  return (
    <>
      <div className={styles.scopes} role="tablist" aria-label={lang === "ar" ? "نطاق البحث" : "Search scope"}>
        {BASIRAH_SCOPES.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={scope === s.id} className={scope === s.id ? styles.on : ""} onClick={() => onScope(s.id)}>
            {lang === "ar" ? s.ar : s.en}
          </button>
        ))}
      </div>
      <div className={styles.modes} role="tablist" aria-label={lang === "ar" ? "وضع البحث" : "Research mode"}>
        {BASIRAH_MODES.map((m) => (
          <button key={m.id} type="button" role="tab" aria-selected={mode === m.id} className={mode === m.id ? styles.on : ""} onClick={() => onMode(m.id)}>
            {lang === "ar" ? m.ar : m.en}
          </button>
        ))}
      </div>
    </>
  );
}

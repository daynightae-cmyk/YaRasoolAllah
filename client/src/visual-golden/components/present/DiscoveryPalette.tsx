import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { discoveryWings, type WingPath } from "@/visual-golden/mock/discovery";
import styles from "./present.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function DiscoveryPalette({ open, onClose }: Props) {
  const [, navigate] = useLocation();
  const [q, setQ] = useState("");
  const [i, setI] = useState(0);

  const items = useMemo(() => {
    const n = q.trim();
    if (!n) return discoveryWings;
    return discoveryWings.filter(
      (w) => w.ar.includes(n) || w.en.toLowerCase().includes(n.toLowerCase()) || w.hint.includes(n),
    );
  }, [q]);

  useEffect(() => {
    setI(0);
  }, [q, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setI((v) => Math.min(items.length - 1, v + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setI((v) => Math.max(0, v - 1));
      }
      if (e.key === "Enter" && items[i]) {
        e.preventDefault();
        go(items[i].path);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, i, onClose]);

  if (!open) return null;

  function go(path: WingPath) {
    navigate(path);
    onClose();
    setQ("");
  }

  return (
    <div className={styles.paletteScrim} onClick={onClose} role="presentation">
      <div
        className={styles.palette}
        role="dialog"
        aria-label="اكتشاف الأبواب"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.paletteHead}>
          <Search size={18} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="إلى أي باب تريد أن تدخل؟"
          />
          <span className={styles.hintK}>Esc</span>
        </div>
        <div className={styles.paletteList}>
          {items.map((w, idx) => (
            <button
              key={w.path}
              type="button"
              className={`${styles.wing} ${idx === i ? styles.wingOn : ""}`}
              onMouseEnter={() => setI(idx)}
              onClick={() => go(w.path)}
            >
              <span className={styles.wingMark}>{idx + 1}</span>
              <span>
                <b>{w.ar}</b>
                <em>{w.en}</em>
                <small>{w.hint}</small>
              </span>
            </button>
          ))}
          {items.length === 0 ? <p className="muted" style={{ padding: "1rem" }}>لا نتائج في هذا النموذج البصري</p> : null}
        </div>
      </div>
    </div>
  );
}

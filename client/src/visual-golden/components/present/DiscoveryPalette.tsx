import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { BookOpen, Search, ScrollText } from "lucide-react";
import { buildLocalIndex, searchBasirah, type BasirahRecord } from "@/visual-golden/services/basirah";
import { filterWings, type WingPath } from "@/visual-golden/services/discovery";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import styles from "./present.module.css";

interface Props {
  open: boolean;
  onClose: () => void;
}

type PaletteItem =
  | { id: string; kind: "wing"; path: WingPath; titleAr: string; titleEn: string; hintAr: string; hintEn: string }
  | { id: string; kind: "record"; path: string; titleAr: string; titleEn: string; hintAr: string; hintEn: string; scope: BasirahRecord["scope"] }
  | { id: string; kind: "action"; path: string; titleAr: string; titleEn: string; hintAr: string; hintEn: string };

const FOCUSABLE = 'input, button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function DiscoveryPalette({ open, onClose }: Props) {
  const [, navigate] = useLocation();
  const lang = useInstitution((state) => state.lang);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const records = useMemo(() => buildLocalIndex(), []);

  const items = useMemo<PaletteItem[]>(() => {
    const normalized = query.trim();
    const wings = filterWings(normalized).map((wing) => ({
      id: `wing:${wing.path}`,
      kind: "wing" as const,
      path: wing.path,
      titleAr: wing.ar,
      titleEn: wing.en,
      hintAr: wing.hint,
      hintEn: wing.hint,
    }));
    const knowledge = searchBasirah(records, normalized, "all")
      .slice(0, normalized ? 24 : 12)
      .map((record) => ({
        id: `record:${record.id}`,
        kind: "record" as const,
        path: record.path,
        titleAr: record.titleAr,
        titleEn: record.titleEn,
        hintAr: `${record.kindAr} · ${record.availabilityAr}`,
        hintEn: `${record.kindEn} · ${record.availabilityAr}`,
        scope: record.scope,
      }));
    const actions: PaletteItem[] = normalized
      ? [
          {
            id: "action:quran-search",
            kind: "action",
            path: `/quran?q=${encodeURIComponent(normalized)}`,
            titleAr: `البحث في القرآن عن «${normalized}»`,
            titleEn: `Search the Qur'an for “${normalized}”`,
            hintAr: "يفتح بحث المصحف الرقمي",
            hintEn: "Opens the digital mushaf search",
          },
          {
            id: "action:basirah-search",
            kind: "action",
            path: `/basirah?q=${encodeURIComponent(normalized)}`,
            titleAr: `متابعة البحث الموثق عن «${normalized}»`,
            titleEn: `Continue sourced research on “${normalized}”`,
            hintAr: "يفتح مكتب بحث بصيرة",
            hintEn: "Opens the Basirah research desk",
          },
        ]
      : [];
    return [...wings, ...knowledge, ...actions];
  }, [query, records]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((value) => Math.min(items.length - 1, value + 1));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((value) => Math.max(0, value - 1));
        return;
      }
      if (event.key === "Enter" && items[activeIndex]) {
        event.preventDefault();
        go(items[activeIndex].path);
        return;
      }
      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      previousFocusRef.current?.focus?.();
    };
  }, [activeIndex, items, onClose, open]);

  if (!open) return null;

  function go(path: string) {
    navigate(path);
    onClose();
    setQuery("");
  }

  const activeId = items[activeIndex] ? `palette-item-${activeIndex}` : undefined;

  return (
    <div className={styles.paletteScrim} onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        className={styles.palette}
        role="dialog"
        aria-modal="true"
        aria-label={lang === "ar" ? "مركز البحث والأوامر" : "Search and command center"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.paletteHead}>
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={lang === "ar" ? "ابحث في الأجنحة والكتب والآيات والأحاديث والمواضيع" : "Search wings, books, verses, hadith, and topics"}
            aria-label={lang === "ar" ? "نص البحث المؤسسي" : "Institutional search"}
            aria-controls="institutional-command-results"
            aria-activedescendant={activeId}
            role="combobox"
            aria-expanded="true"
          />
          <span className={styles.hintK}>Esc</span>
        </div>
        <div className={styles.paletteMeta}>
          <span>{lang === "ar" ? "الأجنحة" : "Wings"}</span>
          <span>{lang === "ar" ? "الكتب والسجلات والمواضيع" : "Books, records, and topics"}</span>
          <span>{lang === "ar" ? "تنقل بلوحة المفاتيح أو اللمس" : "Keyboard or touch navigation"}</span>
        </div>
        <div id="institutional-command-results" className={styles.paletteList} role="listbox" aria-label={lang === "ar" ? "نتائج البحث" : "Search results"}>
          {items.map((item, index) => (
            <button
              key={item.id}
              id={`palette-item-${index}`}
              type="button"
              role="option"
              aria-selected={index === activeIndex}
              className={`${styles.wing} ${index === activeIndex ? styles.wingOn : ""}`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
              onClick={() => go(item.path)}
            >
              <span className={styles.wingMark}>
                {item.kind === "record" ? <BookOpen size={14} aria-hidden="true" /> : item.kind === "action" ? <ScrollText size={14} aria-hidden="true" /> : index + 1}
              </span>
              <span>
                <b>{lang === "ar" ? item.titleAr : item.titleEn}</b>
                <em>{lang === "ar" ? item.titleEn : item.titleAr}</em>
                <small>{lang === "ar" ? item.hintAr : item.hintEn}</small>
              </span>
            </button>
          ))}
          {items.length === 0 ? (
            <p className="muted" style={{ padding: "1rem" }}>
              {lang === "ar" ? "لا توجد نتيجة في الفهرس المحلي. جرّب البحث العام في بصيرة." : "No local index match. Try the general Basirah search."}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

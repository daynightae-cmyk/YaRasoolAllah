import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { shouldCountColoringSession } from "@/visual-golden/services/kids";
import styles from "./unique.module.css";

type PaintRegion = "moon" | "arch" | "dome" | "lantern" | "floor";

type FillState = Record<PaintRegion, string>;

interface Props {
  onClose: () => void;
  onSessionComplete?: () => void;
}

const COLOR_OPTIONS = [
  { value: "#065f46", label: "أخضر داكن" },
  { value: "#d4a017", label: "ذهبي" },
  { value: "#1a2d4a", label: "أزرق ليلي" },
  { value: "#b45309", label: "برتقالي ترابي" },
  { value: "#fefdf8", label: "أبيض" },
  { value: "#047857", label: "أخضر زمردي" },
] as const;

const PAINT_TARGETS: ReadonlyArray<{ id: PaintRegion; label: string }> = [
  { id: "moon", label: "الهلال" },
  { id: "arch", label: "القوس" },
  { id: "dome", label: "القبة" },
  { id: "lantern", label: "الفانوس" },
  { id: "floor", label: "الأرضية" },
];

const INITIAL_FILLS: FillState = {
  dome: "#064e3b",
  arch: "#0b2a24",
  lantern: "#a16207",
  floor: "#12241e",
  moon: "#e8c547",
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => !element.hidden && element.getAttribute("aria-hidden") !== "true",
  );
}

export function ColoringStudio({ onClose, onSessionComplete }: Props) {
  const [paint, setPaint] = useState<string>(COLOR_OPTIONS[0].value);
  const [fills, setFills] = useState<FillState>(INITIAL_FILLS);
  const [lastColoredRegion, setLastColoredRegion] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const hasInteractedRef = useRef(false);
  const completionReportedRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const onSessionCompleteRef = useRef(onSessionComplete);

  onCloseRef.current = onClose;
  onSessionCompleteRef.current = onSessionComplete;

  const markInteracted = useCallback(() => {
    hasInteractedRef.current = true;
  }, []);

  const reportCompletion = useCallback(() => {
    if (!shouldCountColoringSession(hasInteractedRef.current, completionReportedRef.current)) return;
    completionReportedRef.current = true;
    onSessionCompleteRef.current?.();
  }, []);

  const closeDialog = useCallback(() => {
    reportCompletion();
    onCloseRef.current();
  }, [reportCompletion]);

  const chooseColor = (color: string) => {
    markInteracted();
    setPaint(color);
  };

  const paintRegion = (region: PaintRegion, label: string) => {
    markInteracted();
    setFills((current) => ({ ...current, [region]: paint }));
    setLastColoredRegion(label);
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = getFocusableElements(dialog)[0];
      (firstFocusable ?? dialog).focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        closeDialog();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(dialog);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const activeElement = document.activeElement;
      const focusIsOutside = !(activeElement instanceof Node) || !dialog.contains(activeElement);

      if (event.shiftKey && (activeElement === first || focusIsOutside)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (activeElement === last || focusIsOutside)) {
        event.preventDefault();
        first.focus();
      }
    };

    const keepFocusInside = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node) || dialog.contains(target)) return;
      const firstFocusable = getFocusableElements(dialog)[0];
      (firstFocusable ?? dialog).focus();
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("focusin", keepFocusInside, true);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("focusin", keepFocusInside, true);
      if (opener?.isConnected) opener.focus();
    };
  }, [closeDialog]);

  return (
    <div className={styles.studio}>
      <div
        ref={dialogRef}
        className={styles.board}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coloring-studio-title"
        aria-describedby="coloring-studio-help"
        tabIndex={-1}
      >
        <div className={styles.studioHead}>
          <h2 id="coloring-studio-title" className="gold-text">تلوين الفانوس والقبة</h2>
          <button
            type="button"
            className="btn-outline"
            onClick={closeDialog}
            aria-label="إغلاق استوديو التلوين"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <svg viewBox="0 0 240 200" width="100%" height="220" aria-hidden="true" focusable="false">
          <circle
            cx="200"
            cy="28"
            r="14"
            fill={fills.moon}
            onClick={() => paintRegion("moon", "الهلال")}
            style={{ cursor: "pointer" }}
          />
          <path
            d="M30 170 L210 170 L210 110 Q120 40 30 110 Z"
            fill={fills.arch}
            stroke="#e8c547"
            strokeWidth="2"
            onClick={() => paintRegion("arch", "القوس")}
            style={{ cursor: "pointer" }}
          />
          <ellipse
            cx="120"
            cy="78"
            rx="42"
            ry="28"
            fill={fills.dome}
            stroke="#e8c547"
            onClick={() => paintRegion("dome", "القبة")}
            style={{ cursor: "pointer" }}
          />
          <rect
            x="108"
            y="118"
            width="24"
            height="36"
            rx="4"
            fill={fills.lantern}
            stroke="#f5e6b8"
            onClick={() => paintRegion("lantern", "الفانوس")}
            style={{ cursor: "pointer" }}
          />
          <rect
            x="20"
            y="170"
            width="200"
            height="16"
            fill={fills.floor}
            onClick={() => paintRegion("floor", "الأرضية")}
            style={{ cursor: "pointer" }}
          />
        </svg>

        <div className={styles.paintTargets} role="group" aria-label="مناطق الرسم القابلة للتلوين">
          {PAINT_TARGETS.map((target) => (
            <button
              key={target.id}
              type="button"
              className={styles.paintTarget}
              aria-label={`لوّن ${target.label}`}
              onClick={() => paintRegion(target.id, target.label)}
            >
              <span
                className={styles.paintTargetDot}
                style={{ background: fills[target.id] }}
                aria-hidden="true"
              />
              <span>{target.label}</span>
            </button>
          ))}
        </div>

        <p id="coloring-studio-help" className="muted" style={{ textAlign: "center", fontSize: "0.78rem" }}>
          اختر لونًا ثم استخدم زر المنطقة المطلوب تلوينها. يمكن أيضًا النقر على الرسم مباشرة.
        </p>
        <p className="muted" aria-live="polite" style={{ minHeight: "1.2em", textAlign: "center", fontSize: "0.75rem" }}>
          {lastColoredRegion ? `تم تطبيق اللون على ${lastColoredRegion}.` : "لم يُطبّق لون على أي منطقة بعد."}
        </p>

        <div className={styles.palette} role="group" aria-label="ألوان التلوين">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              type="button"
              className={`${styles.swatch} ${paint === color.value ? styles.swatchOn : ""}`}
              style={{ background: color.value }}
              aria-label={`اختر اللون ${color.label}`}
              aria-pressed={paint === color.value}
              onClick={() => chooseColor(color.value)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

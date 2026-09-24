import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LoaderCircle,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import {
  fetchIiifManifest,
  type ManuscriptSource,
} from "@/visual-golden/services/iiif";
import type { IiifManifestSummary } from "@shared/iiif";
import styles from "./ManuscriptReader.module.css";

interface Props {
  source: ManuscriptSource;
  onClose: () => void;
}

type LoadState =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; provider: string; manifest: IiifManifestSummary };

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function pageImage(
  service: string | undefined,
  fallback: string | undefined,
  zoom: number,
): string | undefined {
  if (!service) return fallback;
  const width = zoom >= 1.7 ? 2400 : zoom >= 1.2 ? 2000 : 1600;
  return service.replace(/\/+$/, "") + "/full/" + width + ",/0/default.jpg";
}

export function ManuscriptReader({ source, onClose }: Props) {
  const [load, setLoad] = useState<LoadState>({ state: "loading" });
  const [pageIndex, setPageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoad({ state: "loading" });
    setPageIndex(0);
    setZoom(1);

    fetchIiifManifest(source.manifestUrl, controller.signal)
      .then((result) => {
        setLoad({
          state: "ready",
          provider: result.provider,
          manifest: result.manifest,
        });
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setLoad({
            state: "error",
            message:
              error instanceof Error
                ? error.message
                : "تعذر فتح المخطوط الآن.",
          });
        }
      });

    return () => controller.abort();
  }, [source.manifestUrl]);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (load.state !== "ready") return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPageIndex((index) =>
          clamp(index + 1, 0, load.manifest.canvases.length - 1),
        );
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPageIndex((index) => clamp(index - 1, 0, load.manifest.canvases.length - 1));
      }
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom((value) => clamp(value + 0.2, 0.7, 2.6));
      }
      if (event.key === "-") {
        event.preventDefault();
        setZoom((value) => clamp(value - 0.2, 0.7, 2.6));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [load, onClose]);

  const current =
    load.state === "ready"
      ? load.manifest.canvases[pageIndex]
      : undefined;
  const currentImage = useMemo(
    () => pageImage(current?.imageService, current?.imageUrl, zoom),
    [current, zoom],
  );

  return (
    <div className={styles.scrim} role="presentation" onClick={onClose}>
      <section
        className={styles.reader}
        role="dialog"
        aria-modal="true"
        aria-label={"قارئ المخطوط: " + source.titleAr}
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <span>{source.provider} · IIIF</span>
            <h2>
              {load.state === "ready"
                ? load.manifest.label
                : source.titleAr}
            </h2>
          </div>
          <div className={styles.headerActions}>
            <a
              href={source.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.sourceLink}
            >
              المصدر الأصلي <ExternalLink size={15} />
            </a>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="إغلاق قارئ المخطوط"
            >
              <X />
            </button>
          </div>
        </header>

        {load.state === "loading" ? (
          <div className={styles.status}>
            <LoaderCircle className={styles.spin} aria-hidden="true" />
            <strong>جارٍ تجهيز صفحات المخطوط…</strong>
            <span>نقرأ بيان IIIF ونحوّله إلى صفحات قابلة للتصفح.</span>
          </div>
        ) : null}

        {load.state === "error" ? (
          <div className={styles.status} role="alert">
            <strong>تعذر فتح القارئ الداخلي</strong>
            <span>{load.message}</span>
            <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
              افتح المصدر الأصلي <ExternalLink size={15} />
            </a>
          </div>
        ) : null}

        {load.state === "ready" && current ? (
          <>
            <div className={styles.toolbar} aria-label="أدوات قارئ المخطوط">
              <div className={styles.pageControls}>
                <button
                  type="button"
                  onClick={() =>
                    setPageIndex((index) =>
                      clamp(index - 1, 0, load.manifest.canvases.length - 1),
                    )
                  }
                  disabled={pageIndex === 0}
                  aria-label="الصفحة السابقة"
                >
                  <ChevronRight />
                </button>
                <label>
                  <span className={styles.srOnly}>رقم الصفحة</span>
                  <input
                    type="number"
                    min={1}
                    max={load.manifest.canvases.length}
                    value={pageIndex + 1}
                    onChange={(event) => {
                      const next = Number(event.target.value) - 1;
                      if (Number.isFinite(next)) {
                        setPageIndex(
                          clamp(next, 0, load.manifest.canvases.length - 1),
                        );
                      }
                    }}
                  />
                  <b>من {load.manifest.canvases.length}</b>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setPageIndex((index) =>
                      clamp(index + 1, 0, load.manifest.canvases.length - 1),
                    )
                  }
                  disabled={pageIndex >= load.manifest.canvases.length - 1}
                  aria-label="الصفحة التالية"
                >
                  <ChevronLeft />
                </button>
              </div>

              <div className={styles.zoomControls}>
                <button
                  type="button"
                  onClick={() => setZoom((value) => clamp(value - 0.2, 0.7, 2.6))}
                  aria-label="تصغير الصفحة"
                >
                  <Minus />
                </button>
                <output aria-label="نسبة التكبير">
                  {Math.round(zoom * 100)}%
                </output>
                <button
                  type="button"
                  onClick={() => setZoom((value) => clamp(value + 0.2, 0.7, 2.6))}
                  aria-label="تكبير الصفحة"
                >
                  <Plus />
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  aria-label="إعادة ضبط التكبير"
                >
                  <RotateCcw />
                </button>
              </div>
            </div>

            <div className={styles.viewport}>
              {currentImage ? (
                <div
                  className={styles.imageStage}
                  style={{ width: Math.round(zoom * 100) + "%" }}
                >
                  <img
                    key={current.id + "-" + currentImage}
                    src={currentImage}
                    alt={current.label}
                  />
                </div>
              ) : (
                <div className={styles.status}>
                  <strong>هذه الصفحة لا تحتوي صورة قابلة للعرض.</strong>
                </div>
              )}
            </div>

            <footer className={styles.footer}>
              <div>
                <span>الصفحة {pageIndex + 1}</span>
                <strong>{current.label}</strong>
              </div>
              <div className={styles.manifestMeta}>
                <span>Presentation API v{load.manifest.presentationVersion}</span>
                {load.manifest.rights ? (
                  <a
                    href={load.manifest.rights}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    الحقوق
                  </a>
                ) : null}
              </div>
              {load.manifest.requiredStatement || load.manifest.attribution ? (
                <p>
                  {load.manifest.requiredStatement ??
                    load.manifest.attribution}
                </p>
              ) : null}
            </footer>
          </>
        ) : null}
      </section>
    </div>
  );
}

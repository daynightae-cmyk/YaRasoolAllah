import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
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
import { useInstitution } from "@/visual-golden/lib/institution/store";
import {
  clampManuscriptPage,
  clampManuscriptZoom,
  fetchIiifManifest,
  IiifServiceError,
  manuscriptKeyboardAction,
  manuscriptPageImage,
  MAX_MANUSCRIPT_ZOOM,
  MIN_MANUSCRIPT_ZOOM,
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
  | { state: "error"; code: string; upstreamStatus?: number }
  | { state: "ready"; provider: string; manifest: IiifManifestSummary };

type PanState = { pointerId: number; x: number; y: number; left: number; top: number };

function isEditable(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && Boolean(target.closest("input, textarea, select, [contenteditable='true']"));
}

export function ManuscriptReader({ source, onClose }: Props) {
  const lang = useInstitution((state) => state.lang);
  const ar = lang === "ar";
  const direction = ar ? "rtl" : "ltr";
  const copy = ar
    ? {
        close: "إغلاق قارئ المخطوط",
        source: "المصدر الأصلي",
        loading: "جارٍ فحص المزود وتجهيز صفحات المخطوط…",
        loadingHint: "لا تُعرض الإتاحة كمؤكدة إلا بعد نجاح بيان IIIF.",
        error: "تعذر فتح القارئ الداخلي",
        retry: "أعد المحاولة",
        previous: "الصفحة السابقة",
        next: "الصفحة التالية",
        page: "رقم الصفحة",
        of: "من",
        zoomOut: "تصغير الصفحة",
        zoomIn: "تكبير الصفحة",
        zoomReset: "إعادة ضبط التكبير",
        zoom: "نسبة التكبير",
        tools: "أدوات قارئ المخطوط",
        viewport: "صفحة المخطوط. اسحب لتحريك الصفحة المكبرة.",
        imageLoading: "جارٍ تحميل صورة الصفحة من المزود…",
        imageError: "تعذر تحميل صورة هذه الصفحة من المزود. لم تُنسخ الصورة إلى المنصة.",
        rights: "بيان الحقوق",
        pageAnnouncement: "الصفحة",
        shortcuts: "لوحة المفاتيح: PageUp/PageDown أو الأسهم للتنقل، و+ و− للتكبير، و0 لإعادة الضبط.",
        provider: "المزود",
      }
    : {
        close: "Close manuscript reader",
        source: "Original source",
        loading: "Checking the provider and preparing manuscript pages…",
        loadingHint: "Availability is confirmed only after the IIIF manifest loads successfully.",
        error: "The internal reader could not be opened",
        retry: "Try again",
        previous: "Previous page",
        next: "Next page",
        page: "Page number",
        of: "of",
        zoomOut: "Zoom out",
        zoomIn: "Zoom in",
        zoomReset: "Reset zoom",
        zoom: "Zoom level",
        tools: "Manuscript reader controls",
        viewport: "Manuscript page. Drag to pan when zoomed in.",
        imageLoading: "Loading this page image from the provider…",
        imageError: "This page image could not be loaded from the provider. It has not been copied to the platform.",
        rights: "Rights statement",
        pageAnnouncement: "Page",
        shortcuts: "Keyboard: PageUp/PageDown or arrow keys to navigate, + and − to zoom, 0 to reset.",
        provider: "Provider",
      };

  const [load, setLoad] = useState<LoadState>({ state: "loading" });
  const [retryToken, setRetryToken] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageDraft, setPageDraft] = useState("1");
  const [zoom, setZoom] = useState(1);
  const [imageStatus, setImageStatus] = useState<"loading" | "ready" | "error">("loading");
  const [panning, setPanning] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panRef = useRef<PanState | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener && document.contains(opener)) opener.focus();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoad({ state: "loading" });
    setPageIndex(0);
    setZoom(1);
    fetchIiifManifest(source.manifestUrl, controller.signal)
      .then((result) => {
        setLoad({ state: "ready", provider: result.provider, manifest: result.manifest });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setLoad({
          state: "error",
          code: error instanceof IiifServiceError ? error.code : "manifest_unavailable",
          upstreamStatus: error instanceof IiifServiceError ? error.upstreamStatus : undefined,
        });
      });
    return () => controller.abort();
  }, [source.manifestUrl, retryToken]);

  const pageCount = load.state === "ready" ? load.manifest.canvases.length : 0;
  const current = load.state === "ready" ? load.manifest.canvases[pageIndex] : undefined;
  const currentImage = manuscriptPageImage(current, zoom);

  useEffect(() => {
    setPageDraft(String(pageIndex + 1));
    panRef.current = null;
    setPanning(false);
    viewportRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pageIndex]);

  useEffect(() => {
    setImageStatus("loading");
  }, [currentImage]);

  const goToPage = (index: number) => {
    setPageIndex(clampManuscriptPage(index, pageCount));
  };
  const changeZoom = (delta: number) => {
    setZoom((value) => clampManuscriptZoom(Number((value + delta).toFixed(2))));
  };
  const commitPageDraft = () => {
    const requested = Number(pageDraft);
    if (Number.isFinite(requested)) goToPage(requested - 1);
    else setPageDraft(String(pageIndex + 1));
  };

  const onDialogKeyDown = (event: ReactKeyboardEvent<HTMLDialogElement>) => {
    if (event.key === "Tab") {
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
      return;
    }
    if (isEditable(event.target)) return;
    const action = manuscriptKeyboardAction(event.key, direction);
    if (!action) return;
    event.preventDefault();
    if (action === "previous") goToPage(pageIndex - 1);
    if (action === "next") goToPage(pageIndex + 1);
    if (action === "zoom-in") changeZoom(0.2);
    if (action === "zoom-out") changeZoom(-0.2);
    if (action === "zoom-reset") setZoom(1);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (zoom <= 1 || event.button !== 0) return;
    event.currentTarget.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    panRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      left: event.currentTarget.scrollLeft,
      top: event.currentTarget.scrollTop,
    };
    setPanning(true);
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;
    event.currentTarget.scrollLeft = pan.left - (event.clientX - pan.x);
    event.currentTarget.scrollTop = pan.top - (event.clientY - pan.y);
  };
  const finishPan = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (panRef.current?.pointerId !== event.pointerId) return;
    panRef.current = null;
    setPanning(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const failureMessage = (code: string, upstreamStatus?: number) => {
    const status = upstreamStatus ? ` (HTTP ${upstreamStatus})` : "";
    if (code === "provider_blocked") {
      return (ar
        ? "المزود يرفض طلب الخادم حاليًا. هذا فشل إتاحة فعلي، وليس قارئًا موثقًا."
        : "The provider is currently refusing the server request. This is a real availability failure, not a verified reader.") + status;
    }
    if (code === "provider_timeout") {
      return ar ? "انتهت مهلة استجابة المزود." : "The provider request timed out.";
    }
    if (code === "manifest_too_large") {
      return ar ? "البيان أكبر من حد الأمان المسموح للقارئ." : "The manifest exceeds the reader's safety limit.";
    }
    if (["redirect_not_allowed", "manifest_resource_not_allowed", "manifest_rights_not_allowed"].includes(code)) {
      return ar
        ? "أعاد المزود توجيهًا أو رابط مورد لا يجتاز سياسة HTTPS والمضيفين المعتمدين."
        : "The provider returned a redirect or resource URL that failed the HTTPS and allowed-host policy.";
    }
    return ar
      ? "لم ينجح جلب بيان IIIF أو تطبيعه. افتح المصدر الأصلي أو حاول لاحقًا."
      : "The IIIF manifest could not be fetched or normalized. Open the original source or try again later.";
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.reader}
      aria-modal="true"
      aria-labelledby="manuscript-reader-title"
      aria-describedby="manuscript-reader-shortcuts"
      dir={direction}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={onDialogKeyDown}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
          onClose();
        }
      }}
    >
      <header className={styles.header}>
        <div>
          <span>{source.provider} · IIIF</span>
          <h2 id="manuscript-reader-title">
            {load.state === "ready" ? load.manifest.label : ar ? source.titleAr : source.titleEn}
          </h2>
        </div>
        <div className={styles.headerActions}>
          <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
            {copy.source} <ExternalLink size={15} aria-hidden="true" />
          </a>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label={copy.close}>
            <X aria-hidden="true" />
          </button>
        </div>
      </header>
      <p id="manuscript-reader-shortcuts" className={styles.srOnly}>{copy.shortcuts}</p>

      {load.state === "loading" ? (
        <div className={styles.status} role="status">
          <LoaderCircle className={styles.spin} aria-hidden="true" />
          <strong>{copy.loading}</strong>
          <span>{copy.loadingHint}</span>
        </div>
      ) : null}

      {load.state === "error" ? (
        <div className={styles.status} role="alert">
          <strong>{copy.error}</strong>
          <span>{failureMessage(load.code, load.upstreamStatus)}</span>
          <div className={styles.statusActions}>
            <button type="button" onClick={() => setRetryToken((value) => value + 1)}>{copy.retry}</button>
            <a href={source.sourceUrl} target="_blank" rel="noopener noreferrer">
              {copy.source} <ExternalLink size={15} aria-hidden="true" />
            </a>
          </div>
        </div>
      ) : null}

      {load.state === "ready" && current ? (
        <>
          <div className={styles.toolbar} aria-label={copy.tools}>
            <div className={styles.pageControls}>
              <button
                type="button"
                onClick={() => goToPage(pageIndex - 1)}
                disabled={pageIndex === 0}
                aria-label={copy.previous}
                aria-keyshortcuts={direction === "rtl" ? "ArrowRight PageUp" : "ArrowLeft PageUp"}
              >
                {direction === "rtl" ? <ChevronRight aria-hidden="true" /> : <ChevronLeft aria-hidden="true" />}
              </button>
              <label>
                <span className={styles.srOnly}>{copy.page}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={pageCount}
                  value={pageDraft}
                  onChange={(event) => setPageDraft(event.target.value)}
                  onBlur={commitPageDraft}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      commitPageDraft();
                      event.currentTarget.blur();
                    }
                  }}
                  aria-label={copy.page}
                />
                <b>{copy.of} {pageCount}</b>
              </label>
              <button
                type="button"
                onClick={() => goToPage(pageIndex + 1)}
                disabled={pageIndex >= pageCount - 1}
                aria-label={copy.next}
                aria-keyshortcuts={direction === "rtl" ? "ArrowLeft PageDown" : "ArrowRight PageDown"}
              >
                {direction === "rtl" ? <ChevronLeft aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
              </button>
            </div>
            <div className={styles.zoomControls}>
              <button
                type="button"
                onClick={() => changeZoom(-0.2)}
                disabled={zoom <= MIN_MANUSCRIPT_ZOOM}
                aria-label={copy.zoomOut}
                aria-keyshortcuts="-"
              >
                <Minus aria-hidden="true" />
              </button>
              <output aria-label={copy.zoom} aria-live="polite">{Math.round(zoom * 100)}%</output>
              <button
                type="button"
                onClick={() => changeZoom(0.2)}
                disabled={zoom >= MAX_MANUSCRIPT_ZOOM}
                aria-label={copy.zoomIn}
                aria-keyshortcuts="+"
              >
                <Plus aria-hidden="true" />
              </button>
              <button type="button" onClick={() => setZoom(1)} aria-label={copy.zoomReset} aria-keyshortcuts="0">
                <RotateCcw aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            ref={viewportRef}
            className={styles.viewport}
            data-panning={panning ? "true" : "false"}
            data-zoomed={zoom > 1 ? "true" : "false"}
            style={{ touchAction: zoom > 1 ? "none" : "pan-x pan-y" }}
            tabIndex={0}
            dir="ltr"
            aria-label={copy.viewport}
            aria-busy={imageStatus === "loading"}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={finishPan}
            onPointerCancel={finishPan}
          >
            {imageStatus === "loading" ? (
              <div className={styles.imageState} role="status">
                <LoaderCircle className={styles.spin} aria-hidden="true" /> {copy.imageLoading}
              </div>
            ) : null}
            {imageStatus === "error" || !currentImage ? (
              <div className={styles.imageState} role="alert">{copy.imageError}</div>
            ) : (
              <div className={styles.imageStage} style={{ width: `${Math.round(zoom * 100)}%` }}>
                <img
                  key={`${current.id}-${currentImage}`}
                  src={currentImage}
                  alt={current.label}
                  draggable={false}
                  data-loaded={imageStatus === "ready" ? "true" : "false"}
                  onLoad={() => setImageStatus("ready")}
                  onError={() => setImageStatus("error")}
                />
              </div>
            )}
          </div>

          <footer className={styles.footer}>
            <div className={styles.pageLabel} aria-live="polite" aria-atomic="true">
              <span>{copy.pageAnnouncement} {pageIndex + 1} / {pageCount}</span>
              <strong>{current.label}</strong>
            </div>
            <div className={styles.manifestMeta}>
              <span>Presentation API v{load.manifest.presentationVersion}</span>
              <span>{copy.provider}: {load.provider}</span>
              {load.manifest.rights ? (
                <a href={load.manifest.rights} target="_blank" rel="noopener noreferrer">{copy.rights}</a>
              ) : null}
            </div>
            {load.manifest.requiredStatement || load.manifest.attribution ? (
              <p>{load.manifest.requiredStatement ?? load.manifest.attribution}</p>
            ) : null}
            <p className={styles.shortcuts}>{copy.shortcuts}</p>
          </footer>
        </>
      ) : null}
    </dialog>
  );
}

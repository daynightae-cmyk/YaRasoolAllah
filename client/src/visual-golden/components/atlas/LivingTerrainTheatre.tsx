import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { AtlasMarker, OverlayPath, Weather } from "@/visual-golden/data/living-atlas";
import { CERTAINTY_LABEL } from "@/visual-golden/data/living-atlas";
import styles from "./LivingTerrainTheatre.module.css";

interface Props {
  plate: string;
  plateAlt: string;
  weather: Weather;
  overlays: OverlayPath[];
  markers: AtlasMarker[];
  selectedId: string;
  activeIds: string[];
  showOverlays: boolean;
  showMarkers: boolean;
  zoom: number;
  onSelect: (id: string) => void;
  /** Focus camera onto one marker. */
  onFocus?: (id: string) => void;
  /** Reset camera to full map view. */
  onReset?: () => void;
  /** Bounds of the map surface in CSS percentage coords [x0, y0, x1, y1]. */
  bounds?: [number, number, number, number];
}

/** The map surface is an artistic plate, not a surveyed terrain. Markers live
 * on this surface in illustration slots (x/y percent). The theatre maps those
 * slots into CSS percentage coordinates through a coherent origin/scale so
 * markers never drift when the viewport resizes. */
/** Imperative handle exposed to the page for programmatic focus and reset. */
export interface LivingTerrainTheatreRef {
  reset(): void;
  focus(id: string): void;
}

export const LivingTerrainTheatre = forwardRef<LivingTerrainTheatreRef, Props>((props, ref) => {
  const {
    plate,
    plateAlt,
    weather,
    overlays,
    markers,
    selectedId,
    activeIds,
    showOverlays,
    showMarkers,
    zoom,
    onSelect,
    onFocus,
    onReset,
    bounds = [0, 0, 100, 100],
  } = props;
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const selected = markers.find((m) => m.id === selectedId);

  const origin = useMemo(() => {
    if (!selected) return "50% 50%";
    return `${selected.x}% ${selected.y}%`;
  }, [selected]);

  // Drag-to-pan state.
  const pan = useRef({ x: 0, y: 0 });
  const dragStart = useRef<{ x: number; y: number; px: number; py: number; active: boolean; pointerId?: number; dist?: number; zoom?: number }>({ x: 0, y: 0, px: 0, py: 0, active: false });
  const pointerCount = useRef(0);
  const center = useRef({ x: 0, y: 0 });

  const focusMarker = useCallback(
    (id: string) => {
      const marker = markers.find((m) => m.id === id);
      if (!marker) return;
      const targetX = marker.x / 100;
      const targetY = marker.y / 100;
      const el = viewportRef.current;
      const stage = stageRef.current;
      if (!el || !stage) return;
      const vw = el.clientWidth;
      const vh = el.clientHeight;
      // Place the marker at the center of the viewport.
      const dx = targetX - 0.5;
      const dy = targetY - 0.5;
      pan.current = { x: pan.current.x - dx * vw, y: pan.current.y - dy * vh };
      dragStart.current.active = false;
      const nx = Math.round(pan.current.x);
      const ny = Math.round(pan.current.y);
      stage.style.transform = `translate(${nx}px, ${ny}px) scale(${zoom})`;
      onFocus?.(id);
    },
    [markers, zoom, onFocus],
  );

  const resetView = useCallback(() => {
    pan.current = { x: 0, y: 0 };
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.transform = `translate(0, 0) scale(${zoom})`;
    if (onReset) onReset();
  }, [zoom, onReset]);

  useImperativeHandle(ref, () => ({
    reset: resetView,
    focus: focusMarker,
  }));

  useEffect(() => {
    const el = selectedId ? stageRef.current?.querySelector(`[data-marker="${selectedId}"]`) : null;
    if (el instanceof HTMLElement) {
      el.focus({ preventScroll: true });
    }
  }, [selectedId]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${zoom})`;
  }, [zoom]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      dragStart.current.active = true;
      dragStart.current.x = event.clientX;
      dragStart.current.y = event.clientY;
      dragStart.current.px = pan.current.x;
      dragStart.current.py = pan.current.y;
      dragStart.current.pointerId = event.pointerId;
      stage.setPointerCapture(event.pointerId);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!dragStart.current.active) return;
      const stage = stageRef.current;
      if (!stage) return;
      const dx = event.clientX - dragStart.current.x;
      const dy = event.clientY - dragStart.current.y;
      pan.current = { x: dragStart.current.px + dx, y: dragStart.current.py + dy };
      stage.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${zoom})`;
    },
    [zoom],
  );

  const handlePointerUp = useCallback(() => {
    dragStart.current.active = false;
    const stage = stageRef.current;
    if (!stage) return;
    if (dragStart.current.pointerId !== undefined) {
      stage.releasePointerCapture(dragStart.current.pointerId);
      dragStart.current.pointerId = undefined;
    }
  }, []);

  const handleWheel = useCallback(
    (event: React.WheelEvent) => {
      event.preventDefault();
      const stage = stageRef.current;
      const el = viewportRef.current;
      if (!stage || !el) return;
      const rect = el.getBoundingClientRect();
      const cx = event.clientX - rect.left;
      const cy = event.clientY - rect.top;
      const delta = -Math.sign(event.deltaY) * 0.12;
      const next = Math.min(3, Math.max(0.4, zoom + delta));
      if (next === zoom) return;
      // Zoom toward the pointer, keeping it pinned in place.
      const before = { x: cx - pan.current.x, y: cy - pan.current.y };
      pan.current = {
        x: cx - before.x * (next / zoom),
        y: cy - before.y * (next / zoom),
      };
      stage.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${next})`;
    },
    [zoom],
  );

  const handleTouchStart = useCallback(
    (event: React.TouchEvent) => {
      const touches = event.touches;
      pointerCount.current = touches.length;
      if (touches.length === 1) {
        const t = touches[0];
        dragStart.current.active = true;
        dragStart.current.x = t.clientX;
        dragStart.current.y = t.clientY;
        dragStart.current.px = pan.current.x;
        dragStart.current.py = pan.current.y;
        center.current = { x: t.clientX, y: t.clientY };
      } else if (touches.length === 2) {
        dragStart.current.active = false;
        const [a, b] = Array.from(touches) as [Touch, Touch];
        const dx = a.clientX - b.clientX;
        const dy = a.clientY - b.clientY;
        center.current = {
          x: (a.clientX + b.clientX) / 2,
          y: (a.clientY + b.clientY) / 2,
        };
        dragStart.current.px = pan.current.x;
        dragStart.current.py = pan.current.y;
        dragStart.current.dist = Math.hypot(dx, dy);
        dragStart.current.zoom = zoom;
      }
    },
    [zoom],
  );

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      const touches = event.touches;
      if (touches.length === 1 && dragStart.current.active) {
        event.preventDefault();
        const t = touches[0];
        const dx = t.clientX - dragStart.current.x;
        const dy = t.clientY - dragStart.current.y;
        pan.current = { x: dragStart.current.px + dx, y: dragStart.current.py + dy };
        const stage = stageRef.current;
        if (stage) stage.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${zoom})`;
      } else if (touches.length === 2 && !dragStart.current.active) {
        event.preventDefault();
        const [a, b] = Array.from(touches) as [Touch, Touch];
        const dx = a.clientX - b.clientX;
        const dy = a.clientY - b.clientY;
        const dist = Math.hypot(dx, dy);
        const midX = (a.clientX + b.clientX) / 2;
        const midY = (a.clientY + b.clientY) / 2;
        const stage = stageRef.current;
        const el = viewportRef.current;
        if (!stage || !el) return;
        const rect = el.getBoundingClientRect();
        const cx = midX - rect.left;
        const cy = midY - rect.top;
        const ratio = dist / (dragStart.current.dist || 1);
        const next = Math.min(3, Math.max(0.4, (dragStart.current.zoom || 1) * ratio));
        const before = { x: cx - pan.current.x, y: cy - pan.current.y };
        pan.current = {
          x: cx - before.x * (next / (dragStart.current.zoom || 1)),
          y: cy - before.y * (next / (dragStart.current.zoom || 1)),
        };
        stage.style.transform = `translate(${pan.current.x}px, ${pan.current.y}px) scale(${next})`;
      }
    },
    [zoom],
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      pointerCount.current = event.touches.length;
      if (event.touches.length === 0) {
        dragStart.current.active = false;
        dragStart.current.dist = 0;
      }
    },
    [],
  );

  return (
    <div
      className={styles.viewport}
      data-weather={weather}
      role="region"
      aria-label={plateAlt}
      ref={viewportRef}
      style={{ touchAction: showMarkers || showOverlays ? "none" : "auto" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={styles.stage}
        ref={stageRef}
        style={{ transform: `translate(${pan.current.x}px, ${pan.current.y}px) scale(${zoom})` }}
      >
        <img className={styles.plate} src={plate} alt="" />
        <div className={styles.grade} aria-hidden />
        <div className={styles.contours} aria-hidden />
        <div className={styles.weather} aria-hidden>
          <span className={styles.sheet} />
          <span className={styles.sheetB} />
        </div>
        {selected ? (
          <div
            className={styles.lantern}
            style={{ left: `${selected.x}%`, top: `${selected.y}%` }}
            aria-hidden
          />
        ) : null}
        <svg className={styles.overlay} viewBox="0 0 100 56.25" preserveAspectRatio="xMidYMid slice" aria-hidden>
          {showOverlays
            ? overlays.map((path) => {
                const stroke =
                  path.kind === "ridge"
                    ? styles.ridge
                    : path.kind === "harrah"
                      ? styles.harrah
                      : path.kind === "wadi" || path.kind === "basin"
                        ? styles.wadi
                        : styles.trench;
                return (
                  <g key={path.id}>
                    <path className={stroke} d={path.d} />
                    <text className={styles.ridgeLabel} x={path.labelAt.x} y={path.labelAt.y}>
                      {path.labelAr}
                    </text>
                  </g>
                );
              })
            : null}
        </svg>
        {showMarkers
          ? markers.map((marker) => {
              const selectedMarker = marker.id === selectedId;
              const active = activeIds.includes(marker.id);
              const maqam = marker.kind === "maqam-nur";
              return (
                <button
                  key={marker.id}
                  type="button"
                  data-marker={marker.id}
                  className={`${styles.marker} ${selectedMarker ? styles.markerSel : ""} ${active ? styles.markerOn : ""} ${maqam ? styles.maqam : ""}`}
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                  onClick={() => {
                    focusMarker(marker.id);
                    onSelect(marker.id);
                  }}
                  aria-pressed={selectedMarker}
                  aria-label={`${marker.labelAr} — ${CERTAINTY_LABEL[marker.certainty]}`}
                >
                  {maqam ? <span className={styles.arch} aria-hidden /> : <span className={styles.pin} aria-hidden />}
                  <span className={styles.caption}>
                    <strong>{marker.labelAr}</strong>
                    <em>{maqam ? "بلا تجسيد" : CERTAINTY_LABEL[marker.certainty].split(" — ")[0]}</em>
                  </span>
                </button>
              );
            })
          : null}
        <div className={styles.vignette} aria-hidden />
      </div>
    </div>
  );
});

import { useEffect, useMemo, useRef } from "react";
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
}

export function LivingTerrainTheatre({
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
}: Props) {
  const selected = markers.find((m) => m.id === selectedId);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = selectedId ? stageRef.current?.querySelector(`[data-marker="${selectedId}"]`) : null;
    if (el instanceof HTMLElement) {
      el.focus({ preventScroll: true });
    }
  }, [selectedId]);

  const origin = useMemo(() => {
    if (!selected) return "50% 50%";
    return `${selected.x}% ${selected.y}%`;
  }, [selected]);

  return (
    <div
      className={styles.viewport}
      data-weather={weather}
      role="region"
      aria-label={plateAlt}
    >
      <div
        className={styles.stage}
        ref={stageRef}
        style={{ transform: `scale(${zoom})`, transformOrigin: origin }}
      >
        <img className={styles.plate} src={plate} alt="" />
        <div className={styles.grade} aria-hidden />
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
            ? overlays.map((path) =>
                path.kind === "trench" ? (
                  <g key={path.id}>
                    <path className={styles.trench} d={path.d} />
                    <text className={styles.ridgeLabel} x={path.labelAt.x} y={path.labelAt.y}>
                      {path.labelAr}
                    </text>
                  </g>
                ) : (
                  <g key={path.id}>
                    <path
                      className={
                        path.kind === "harrah"
                          ? styles.harrah
                          : path.kind === "wadi" || path.kind === "basin"
                            ? styles.wadi
                            : styles.ridge
                      }
                      d={path.d}
                    />
                    <text className={styles.ridgeLabel} x={path.labelAt.x} y={path.labelAt.y}>
                      {path.labelAr}
                    </text>
                  </g>
                ),
              )
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
                  onClick={() => onSelect(marker.id)}
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
}

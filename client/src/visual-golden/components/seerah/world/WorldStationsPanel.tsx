/**
 * WorldStationsPanel — the unified immersion log inside the living world.
 *
 * One panel collects every immersive surface of the institution: the six
 * living-world scenes plus the reading, archive, treasury, studio, atlas,
 * library, Noor theatre and kids garden surfaces. Every entry points at a
 * route the app already serves, and every reconstructed space carries its
 * artistic-reconstruction disclosure.
 *
 * Travel inside the world uses the authored travel network (so the
 * traveller lands with the right position and heading), while cross-section
 * links stay plain routes.
 */

import { useMemo } from "react";
import { useLocation } from "wouter";
import { X, MapPin, Check, Compass } from "lucide-react";
import { getStationsBySection, WORLD_STATIONS } from "@/visual-golden/services/world-stations";
import { buildTravelUrl } from "./WorldTravel";
import styles from "./WorldStationsPanel.module.css";

interface WorldStationsPanelProps {
  /** Scene the traveller is currently standing in. */
  currentSceneId?: string;
  /** Scene ids already visited (persisted locally). */
  visitedScenes: string[];
  /** Optional navigation override (the host page's wouter navigate). */
  onNavigate?: (url: string) => void;
  /** Close the panel. */
  onClose: () => void;
}

export function WorldStationsPanel({
  currentSceneId,
  visitedScenes,
  onNavigate,
  onClose,
}: WorldStationsPanelProps) {
  const [, wouterNavigate] = useLocation();

  const groups = useMemo(() => getStationsBySection(), []);
  const visited = useMemo(() => new Set(visitedScenes), [visitedScenes]);
  const sceneStations = useMemo(
    () => WORLD_STATIONS.filter((station) => station.kind === "world-scene"),
    [],
  );

  const go = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      wouterNavigate(href);
    }
  };

  const hrefFor = (station: (typeof WORLD_STATIONS)[number]): string => {
    if (station.kind === "world-scene" && station.sceneId && currentSceneId) {
      const travel = buildTravelUrl(currentSceneId, station.sceneId);
      if (travel) return travel;
    }
    return station.href;
  };

  return (
    <aside
      className={styles.panel}
      data-visual="world-stations-panel"
      role="dialog"
      aria-label="سجل المحطات"
    >
      <header className={styles.head}>
        <div className={styles.headTitle}>
          <Compass size={16} aria-hidden />
          <h2>سجل المحطات</h2>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="إغلاق سجل المحطات"
          title="إغلاق"
        >
          <X size={16} aria-hidden />
        </button>
      </header>

      <p className={styles.summary}>
        زرت <strong>{visited.size}</strong> من <strong>{sceneStations.length}</strong> بيئات حية ·{" "}
        <strong>{WORLD_STATIONS.length}</strong> محطة انغماس في المؤسسة
      </p>

      <div className={styles.scroll}>
        {groups.map((group) => (
          <section key={group.section.id} className={styles.group}>
            <h3 className={styles.groupTitle}>{group.section.labelAr}</h3>
            <ul className={styles.list}>
              {group.stations.map((station) => {
                const isCurrent = station.kind === "world-scene" && station.sceneId === currentSceneId;
                const isVisited = station.kind === "world-scene" && !!station.sceneId && visited.has(station.sceneId);
                return (
                  <li key={station.id} className={styles.item}>
                    <button
                      type="button"
                      className={`${styles.station} ${isCurrent ? styles.stationCurrent : ""}`}
                      onClick={() => go(hrefFor(station))}
                      aria-current={isCurrent ? "true" : undefined}
                    >
                      <span className={styles.stationIcon} aria-hidden>
                        {isVisited ? <Check size={14} /> : <MapPin size={14} />}
                      </span>
                      <span className={styles.stationBody}>
                        <span className={styles.stationTitle}>{station.titleAr}</span>
                        <span className={styles.stationSubtitle}>{station.subtitleAr}</span>
                      </span>
                      {isCurrent && <span className={styles.badgeCurrent}>هنا الآن</span>}
                      {isVisited && !isCurrent && <span className={styles.badgeVisited}>تمت الزيارة</span>}
                    </button>
                    {station.disclosureAr && (
                      <p className={styles.disclosure}>{station.disclosureAr}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </aside>
  );
}

WorldStationsPanel.displayName = "WorldStationsPanel";

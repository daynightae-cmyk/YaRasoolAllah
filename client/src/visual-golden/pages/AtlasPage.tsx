import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Link, useSearch } from "wouter";
import {
  ZoomIn,
  ZoomOut,
  Locate,
  List,
  ChevronRight,
  ChevronLeft,
  Mountain,
  BookOpen,
  BookMarked,
  Clock,
  ExternalLink,
  Boxes,
  Compass,
  Map as MapIcon,
  Layers,
  Play,
  Pause,
  Star,
  Landmark,
  ArrowLeft,
  Globe2,
  Route,
  X,
  Maximize,
  Volume2,
  VolumeX,
} from "lucide-react";
import { LivingTerrainTheatre, type LivingTerrainTheatreRef } from "@/visual-golden/components/atlas/LivingTerrainTheatre";
import { atlasCampaignTerrain } from "@/visual-golden/services/atlas-terrain";
import { art } from "@/visual-golden/mock/art";
import { SEERAH_DATABASE, SEERAH_DATABASE_COUNTS, getEventsForEra } from "@/data/seerah";
import { listGhazawatScenes } from "@/visual-golden/services/seerah-ghazawat";

// Three.js stays out of the initial chunk: the observer terrain loads only
// when the visitor opts into the 3D mode.
const TerrainTheatre3D = lazy(() =>
  import("@/visual-golden/components/seerah/TerrainTheatre3D").then((module) => ({
    default: module.TerrainTheatre3D,
  })),
);
import {
  LIVING_CAMPAIGNS,
  CERTAINTY_LABEL,
  WEATHER_LABEL,
  campaignById,
  type Weather,
} from "@/visual-golden/data/living-atlas";
import {
  ATLAS_COUNTS,
  ATLAS_FILTERS,
  ATLAS_NODES,
  filterNodes,
  type AtlasFilter,
} from "@/visual-golden/services/atlas";
import {
  atlasPlaceDatabaseHref,
  campaignChapterHref,
  campaignSeerahHref,
  findAtlasNodeByQuery,
  seerahEventForCampaign,
  seerahEventsForAtlasNode,
  seerahPlaceForAtlasNode,
} from "@/visual-golden/services/atlas-seerah";
import styles from "./LivingAtlasPage.module.css";

const HIJAZ_PLATE = "/visual-golden/art/atlas-hero.webp";
const ATLAS_WORLD_PLATE = "/visual-golden/art/worlds/atlas.webp";

// Specialized atlases map to real registry views. Counts are measured.
const ghazawatScenes = listGhazawatScenes();

// Featured maps are the real campaign theatres — each card opens the same
// documented campaign inside the living theatre, never a static picture.
// Card art comes from the distinct ghazawat scene plates (the theatre's own
// climate plate is reused across campaigns and would look identical).
const FEATURED_CAMPAIGNS = LIVING_CAMPAIGNS.map((campaign) => {
  const scene = ghazawatScenes.find((item) => item.atlasCampaignId === campaign.id);
  return { campaign, plate: scene ? art[scene.plate] : campaign.plate };
});

function initialPlace() {
  const requested = new URLSearchParams(window.location.search).get("place");
  return findAtlasNodeByQuery(requested)?.id ?? null;
}

/**
 * StagePortal — renders children through a React portal into one stable
 * container element. While `active`, that container is physically moved
 * into a <body>-level fixed layer, escaping any transformed ancestor (page
 * entrance animation). The portal target never changes identity, so React
 * keeps its event listeners on the container and the theatre is never
 * remounted (zoom, marker selection and 3D context all survive).
 */
function StagePortal({ active, children }: { active: boolean; children: ReactNode }) {
  const homeRef = useRef<HTMLDivElement | null>(null);
  const [host] = useState(() => document.createElement("div"));

  useEffect(() => {
    host.className = styles.stageContent;
    homeRef.current?.appendChild(host);
    return () => {
      host.remove();
    };
  }, [host]);

  useEffect(() => {
    const home = homeRef.current;
    if (!home) return;
    if (!active) return;
    const layer = document.createElement("div");
    layer.setAttribute("data-visual", "atlas-stage-expanded");
    layer.style.position = "fixed";
    layer.style.inset = "0";
    layer.style.zIndex = "900";
    layer.style.background = "#060a09";
    document.body.appendChild(layer);
    layer.appendChild(host);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      home.appendChild(host);
      layer.remove();
    };
  }, [active, host]);

  return (
    <div ref={homeRef} className={styles.stageHome}>
      {createPortal(children, host)}
    </div>
  );
}

export function AtlasPage() {
  const search = useSearch();
  const requestedPlace = useMemo(() => new URLSearchParams(search).get("place"), [search]);
  const [linkedPlace] = useState(initialPlace);
  const [mode, setMode] = useState<"theatre" | "places">(linkedPlace ? "places" : "theatre");
  const [campaignId, setCampaignId] = useState(LIVING_CAMPAIGNS[0].id);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [markerId, setMarkerId] = useState(LIVING_CAMPAIGNS[0].markers[0]?.id ?? "");
  const [zoom, setZoom] = useState(1);
  const [showOverlays, setShowOverlays] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [listMode, setListMode] = useState(false);
  const [observer3D, setObserver3D] = useState(false);
  const [observerFailed, setObserverFailed] = useState(false);
  const [placeFilter, setPlaceFilter] = useState<AtlasFilter>("all");
  const [placeId, setPlaceId] = useState(linkedPlace ?? ATLAS_NODES[0]?.id ?? "");
  const [immersivePlaceId, setImmersivePlaceId] = useState<string | null>(null);
  // Parallax is written straight to CSS variables on the overlay element —
  // no React re-render per pointermove.
  const immersiveRef = useRef<HTMLDivElement | null>(null);
  // Era rail + timeline playback over the real Seerah eras.
  const [eraId, setEraId] = useState<string>("all");
  const [eraPlaying, setEraPlaying] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const theatreRef = useRef<LivingTerrainTheatreRef | null>(null);

  const campaign = campaignById(campaignId);
  const phase = campaign.phases[Math.min(phaseIndex, campaign.phases.length - 1)];
  const marker = campaign.markers.find((item) => item.id === markerId) ?? campaign.markers[0];
  const weather: Weather = phase.weather;
  const places = useMemo(() => filterNodes(placeFilter), [placeFilter]);
  const place = places.find((node) => node.id === placeId) ?? places[0] ?? null;
  const placeSeerah = place ? seerahPlaceForAtlasNode(place) : null;
  const placeEvents = place ? seerahEventsForAtlasNode(place) : [];
  const campaignEvent = seerahEventForCampaign(campaign.id);
  const campaignRecordHref = campaignSeerahHref(campaign.id);
  const campaignChapterLink = campaignChapterHref(campaign.id);

  // ---------------- Immersive place view (full-screen on tap) ----------------
  // One lazily-created AudioContext per page visit: a soft synthesized desert
  // wind bed while the immersive view is open, plus a short open/close chime.
  // No external audio files; everything is generated with Web Audio.
  const audioRef = useRef<{
    ctx: AudioContext;
    master: GainNode;
    windGain: GainNode;
    wind: AudioBufferSourceNode;
    lfo: OscillatorNode;
  } | null>(null);
  const [immersiveSound, setImmersiveSound] = useState(true);
  const [stageExpanded, setStageExpanded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioRef.current && audioRef.current.ctx.state !== "closed") return audioRef.current;
    audioRef.current = null;
    try {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
      // Wind bed: looped brown-ish noise through a slowly wandering lowpass.
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        const white = Math.random() * 2 - 1;
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      }
      const wind = ctx.createBufferSource();
      wind.buffer = buffer;
      wind.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 420;
      filter.Q.value = 0.6;
      const windGain = ctx.createGain();
      windGain.gain.value = 0;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 160;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      wind.connect(filter);
      filter.connect(windGain);
      windGain.connect(master);
      wind.start();
      lfo.start();
      audioRef.current = { ctx, master, windGain, wind, lfo };
      return audioRef.current;
    } catch {
      // Ambience is optional — silent failure is acceptable.
      return null;
    }
  }, []);

  const playPlaceChime = useCallback((open: boolean) => {
    const engine = ensureAudio();
    if (!engine || engine.ctx.state === "closed") return;
    try {
      void engine.ctx.resume().catch(() => undefined);
      const now = engine.ctx.currentTime;
      const osc = engine.ctx.createOscillator();
      const gain = engine.ctx.createGain();
      osc.type = open ? "sine" : "triangle";
      osc.frequency.setValueAtTime(open ? 660 : 520, now);
      osc.frequency.exponentialRampToValueAtTime(open ? 990 : 390, now + 0.35);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(engine.master);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch {
      // ignore
    }
  }, [ensureAudio]);

  const setWind = useCallback((on: boolean) => {
    const engine = audioRef.current;
    if (!engine || engine.ctx.state === "closed") return;
    try {
      void engine.ctx.resume().catch(() => undefined);
      const now = engine.ctx.currentTime;
      engine.windGain.gain.cancelScheduledValues(now);
      engine.windGain.gain.setTargetAtTime(on ? 0.055 : 0, now, on ? 0.9 : 0.35);
    } catch {
      // ignore
    }
  }, []);

  const openImmersive = useCallback((id: string) => {
    setPlaceId(id);
    setImmersivePlaceId(id);
    playPlaceChime(true);
    if (immersiveSound) {
      ensureAudio();
      setWind(true);
    }
  }, [playPlaceChime, immersiveSound, ensureAudio, setWind]);

  const closeImmersive = useCallback(() => {
    playPlaceChime(false);
    setWind(false);
    setImmersivePlaceId(null);
  }, [playPlaceChime, setWind]);

  // Full audio teardown when the page unmounts.
  useEffect(() => () => {
    const engine = audioRef.current;
    audioRef.current = null;
    if (!engine) return;
    try {
      engine.wind.stop();
      engine.lfo.stop();
      void engine.ctx.close().catch(() => undefined);
    } catch {
      // ignore
    }
  }, []);

  const immersivePlace = useMemo(
    () => (immersivePlaceId ? ATLAS_NODES.find((node) => node.id === immersivePlaceId) ?? null : null),
    [immersivePlaceId],
  );
  const immersiveSeerah = immersivePlace ? seerahPlaceForAtlasNode(immersivePlace) : null;
  const immersiveEvents = useMemo(
    () => (immersivePlace ? seerahEventsForAtlasNode(immersivePlace) : []),
    [immersivePlace],
  );

  // While the immersive dialog is open: lock page scroll and move focus in.
  const immersiveCloseRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!immersivePlaceId) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    immersiveCloseRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [immersivePlaceId]);

  // Parallax writes CSS variables directly — no React re-render per move.
  const handleImmersivePointer = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const el = immersiveRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    el.style.setProperty("--par-x", x.toFixed(3));
    el.style.setProperty("--par-y", y.toFixed(3));
  }, []);

  useEffect(() => {
    const requested = findAtlasNodeByQuery(requestedPlace);
    if (!requested) return;
    setMode("places");
    setPlaceFilter("all");
    setPlaceId(requested.id);
  }, [requestedPlace]);

  useEffect(() => {
    setPhaseIndex(0);
    setZoom(1);
    setObserver3D(false);
    setObserverFailed(false);
  }, [campaignId]);

  const observerTerrain = useMemo(
    () => (mode === "theatre" ? atlasCampaignTerrain(campaign) : null),
    [mode, campaign],
  );
  const observerAvailable = !!observerTerrain && !observerFailed;
  const showObserver = observer3D && observerAvailable && !listMode;

  useEffect(() => {
    const firstActive = phase.activeMarkerIds[0];
    if (firstActive) setMarkerId(firstActive);
  }, [campaignId, phaseIndex, phase.activeMarkerIds]);

  useEffect(() => {
    if (!places.some((node) => node.id === placeId)) {
      setPlaceId(places[0]?.id ?? "");
    }
  }, [places, placeId]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return;
    if (immersivePlaceId && event.key === "Escape") {
        event.preventDefault();
        closeImmersive();
        return;
      }
      if (!immersivePlaceId && stageExpanded && event.key === "Escape") {
        event.preventDefault();
        setStageExpanded(false);
        return;
      }
      if (mode !== "theatre" || immersivePlaceId) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPhaseIndex((index) => Math.min(campaign.phases.length - 1, index + 1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setPhaseIndex((index) => Math.max(0, index - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode, campaign.phases.length, immersivePlaceId, stageExpanded, closeImmersive]);

  const witnessKind =
    phase.witness.kind === "quran" ? "قرآن" : phase.witness.kind === "hadith" ? "حديث" : "سيرة";

  // Era rail: the ten recorded Seerah eras with measured event counts.
  // Selecting an era opens its events in the chronological database —
  // the atlas never invents polities or borders beyond the registry.
  const eraRail = useMemo(
    () => SEERAH_DATABASE.eras.map((era) => ({ era, count: getEventsForEra(era.id).length })),
    [],
  );
  const activeEra = eraRail.find((entry) => entry.era.id === eraId)?.era ?? null;

  // Timeline playback walks the recorded eras in order; reduced-motion
  // visitors keep manual control (the interval simply never starts).
  useEffect(() => {
    if (!eraPlaying) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setEraPlaying(false);
      return;
    }
    const timer = window.setInterval(() => {
      setEraId((current) => {
        const index = SEERAH_DATABASE.eras.findIndex((era) => era.id === current);
        const next = SEERAH_DATABASE.eras[(index + 1) % SEERAH_DATABASE.eras.length];
        return next.id;
      });
    }, 4000);
    return () => window.clearInterval(timer);
  }, [eraPlaying]);

  // Latest recorded events for the "أحدث الأحداث" rail — real registry rows.
  const latestEvents = useMemo(
    () => [...SEERAH_DATABASE.events].sort((a, b) => b.order - a.order).slice(0, 4),
    [],
  );

  return (
    <div className={styles.page} data-climate={mode === "theatre" ? weather : "places"}>
      {/* Full-page hero, as in the approved composition: plate art with the
          atlas identity, service row and honest registry counts. */}
      <section className={styles.atlasHero} aria-labelledby="atlas-title" data-visual="atlas-hero">
        <img className={styles.atlasHeroPlate} src={ATLAS_WORLD_PLATE} alt="" />
        <div className={styles.atlasHeroShade} aria-hidden="true" />
        <div className={styles.atlasHeroBody}>
          <div className={styles.atlasHeroCopy}>
            <span className={styles.atlasEyebrow}><Compass size={15} aria-hidden="true" /> الأطلس التاريخي الإسلامي</span>
            <h1 id="atlas-title">الأطلس التاريخي التفاعلي</h1>
            <p>
              رحلة بصرية عبر الزمن والمكان: مسارح الغزوات الموثقة ومواضع السيرة التخطيطية
              على لوحات فنية — بلا تجسيد للنبي ﷺ ولا محاكاة قتال، وبلا إحداثيات مساحية.
            </p>
            <div className={styles.atlasServices}>
              <span><Globe2 size={14} aria-hidden="true" /> مواضع السيرة من الفصول المسجلة</span>
              <span><Clock size={14} aria-hidden="true" /> خط زمني بعصور السيرة العشرة</span>
              <span><Route size={14} aria-hidden="true" /> مسارح غزوات بطبقات ومراحل</span>
              <span><Layers size={14} aria-hidden="true" /> مراقبة ثلاثية الأبعاد اختيارية</span>
            </div>
            <div className={styles.atlasHeroCtas}>
              <button type="button" className={styles.atlasCtaPrimary} onClick={() => stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                <MapIcon size={15} aria-hidden="true" /> استكشف الأطلس التفاعلي
              </button>
              <Link href="/seerah/database" className={styles.atlasCtaGhost}>
                <BookMarked size={15} aria-hidden="true" /> تصفح قاعدة السيرة الزمنية
              </Link>
            </div>
          </div>
          <div className={styles.atlasLedger} aria-label="أعداد الأطلس المسجلة">
            <div>
              <strong>{ATLAS_COUNTS.nodes.toLocaleString("ar-EG")}</strong>
              <span>مواضع تخطيطية</span>
            </div>
            <div>
              <strong>{LIVING_CAMPAIGNS.length.toLocaleString("ar-EG")}</strong>
              <span>مسارح غزوات موثقة</span>
            </div>
            <div>
              <strong>{SEERAH_DATABASE_COUNTS.events.toLocaleString("ar-EG")}</strong>
              <span>حدثًا في قاعدة السيرة</span>
            </div>
            <div>
              <strong>{SEERAH_DATABASE_COUNTS.eras.toLocaleString("ar-EG")}</strong>
              <span>عصور زمنية مسجلة</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dominant living historical map — the approved Atlas composition
         becomes the interactive experience itself. Markers live on the map
         surface and move with it; they never drift on resize. */}
      <section
        className={styles.tableEntry}
        aria-label="الأطلس التاريخي التفاعلي"
        data-visual="atlas-map-stage"
      >
        <div className={styles.mapViewport}>
          {mode === "theatre" ? (
            <LivingTerrainTheatre
              ref={theatreRef}
              plate={campaign.plate}
              plateAlt={`لوحة فنية لمناخ ${campaign.nameAr} — ليست خريطة مساحية. ${campaign.terrainTeacherAr}`}
              weather={weather}
              overlays={campaign.overlays}
              markers={campaign.markers}
              selectedId={markerId}
              activeIds={phase.activeMarkerIds}
              showOverlays={showOverlays}
              showMarkers={showMarkers}
              zoom={zoom}
              onSelect={setMarkerId}
              onFocus={() => {
                // Focus onto the selected marker; keep the current zoom scale.
                setMarkerId(markerId);
              }}
              onReset={() => {
                setMarkerId(campaign.markers[0]?.id ?? "");
                setZoom(1);
              }}
              bounds={[0, 0, 100, 100]}
            />
          ) : (
            <LivingTerrainTheatre
              ref={theatreRef}
              plate={HIJAZ_PLATE}
              plateAlt="لوحة فنية لمرتفعات الحجاز — مواضع السيرة عليها تخطيطية وليست إحداثيات."
              weather="clear-dawn"
              overlays={[]}
              markers={places.map((node) => ({
                id: node.id,
                labelAr: node.name,
                x: node.layout.x,
                y: node.layout.y,
                kind: "place",
                certainty: "schematic",
                descriptionAr: node.mentions.map((mention) => mention.eventTitle).join(" · "),
                source: "فصول السيرة الموجودة في المنصة",
              }))}
              selectedId={place?.id ?? ""}
              activeIds={place ? [place.id] : []}
              showOverlays={false}
              showMarkers={showMarkers}
              zoom={zoom}
              onSelect={setPlaceId}
              onFocus={() => setPlaceId(place?.id ?? "")}
              onReset={() => {
                setPlaceId(places[0]?.id ?? "");
                setZoom(1);
              }}
              bounds={[0, 0, 100, 100]}
            />
          )}
        </div>
      </section>

      {/* Era timeline rail — the ten recorded Seerah eras, with playback. */}
      <div className={styles.eraRailWrap} data-visual="atlas-era-rail">
        <span className={styles.eraRailTitle}><Clock size={15} aria-hidden="true" /> الخط الزمني للسيرة النبوية</span>
        <div className={styles.eraRailControls}>
          <button
            type="button"
            onClick={() => setEraPlaying((value) => !value)}
            aria-label={eraPlaying ? "إيقاف التشغيل التلقائي للعصور" : "تشغيل تلقائي للعصور"}
            aria-pressed={eraPlaying}
          >
            {eraPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          </button>
        </div>
        <div className={styles.eraRail} role="tablist" aria-label="عصور السيرة">
          <button
            type="button"
            role="tab"
            aria-selected={eraId === "all"}
            className={eraId === "all" ? styles.eraOn : undefined}
            onClick={() => { setEraId("all"); setEraPlaying(false); }}
          >
            <strong>كل العصور</strong>
            <span>{SEERAH_DATABASE_COUNTS.events.toLocaleString("ar-EG")} حدثًا</span>
          </button>
          {eraRail.map(({ era, count }) => (
            <button
              key={era.id}
              type="button"
              role="tab"
              aria-selected={eraId === era.id}
              className={eraId === era.id ? styles.eraOn : undefined}
              onClick={() => { setEraId(era.id); setEraPlaying(false); }}
            >
              <strong>{era.titleAr}</strong>
              <span>{era.rangeAr} · {count.toLocaleString("ar-EG")}</span>
            </button>
          ))}
        </div>
        {activeEra ? (
          <p className={styles.eraSummary} role="status">
            {activeEra.summaryAr}{" "}
            <Link href={`/seerah/database?era=${encodeURIComponent(activeEra.id)}`}>
              عرض أحداث هذا العصر في القاعدة <ArrowLeft size={12} aria-hidden="true" />
            </Link>
          </p>
        ) : null}
      </div>

      <div className={styles.stageWrap} ref={stageRef}>
        <StagePortal active={stageExpanded}>
        {listMode ? (
          <ol className={styles.listEq}>
            {(mode === "theatre" ? campaign.markers : places).map((item) => {
              const id = item.id;
              const name = "labelAr" in item ? item.labelAr : item.name;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (mode === "theatre") {
                        setMarkerId(id);
                        setListMode(false);
                      } else {
                        setListMode(false);
                        openImmersive(id);
                      }
                    }}
                  >
                    <strong>{name}</strong>
                    <span>{"certainty" in item ? CERTAINTY_LABEL[item.certainty] : "موضع تخطيطي"}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className={styles.frame}>
            {mode === "theatre" ? (
              showObserver && observerTerrain ? (
                <Suspense fallback={<div className={styles.observerLoading}>جارٍ تحميل البيئة ثلاثية الأبعاد…</div>}>
                  <TerrainTheatre3D
                    scene={observerTerrain}
                    onExit={() => setObserver3D(false)}
                    onUnavailable={() => {
                      setObserverFailed(true);
                      setObserver3D(false);
                    }}
                  />
                </Suspense>
              ) : (
                null
              )
            ) : (
              null
            )}
          </div>
        )}

        <header className={styles.top}>
          <div className={styles.kicker}>
            <Mountain size={16} />
            <span>الأطلس الجبلي الحي</span>
            <em>SCHEMATIC · بلا تجسيد · بلا إحداثيات</em>
          </div>
          {/* The page keeps a single h1 in the hero; the stage title is h2. */}
          <h2 className={styles.stageTitle}>{mode === "theatre" ? campaign.nameAr : "مواضع السيرة التخطيطية"}</h2>
          <p className={styles.lede}>
            {mode === "theatre"
              ? `${campaign.questionAr} · ${phase.hourLabel} · ${WEATHER_LABEL[weather]}`
              : "أسماء مواضع من فصول السيرة على لوحة فنية. ليست خريطة مساحية."}
          </p>
          <div className={styles.pledge} role="note">
            نعيش الحدث بالمكان والزمن والرواية. لا صورة لرسول الله ﷺ ولا محاكاة قتال.
          </div>
          <div className={styles.modes} role="tablist" aria-label="نمط الأطلس">
            <button type="button" role="tab" aria-selected={mode === "theatre"} onClick={() => setMode("theatre")}>
              مسرح الغزوات
            </button>
            <button type="button" role="tab" aria-selected={mode === "places"} onClick={() => setMode("places")}>
              مواضع السيرة
            </button>
          </div>
          {mode === "theatre" ? (
            <div className={styles.campaigns} role="list">
              {LIVING_CAMPAIGNS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === campaign.id}
                  onClick={() => setCampaignId(item.id)}
                >
                  <strong>{item.nameAr}</strong>
                  <span>{item.dateAr}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.campaigns}>
              {ATLAS_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={placeFilter === filter.id}
                  onClick={() => setPlaceFilter(filter.id)}
                >
                  <strong>{filter.label}</strong>
                  <span>{filter.id === "all" ? `${ATLAS_COUNTS.nodes} مواضع` : ""}</span>
                </button>
              ))}
            </div>
          )}
        </header>

        <div className={styles.tools}>
          {mode === "theatre" && observerAvailable && !showObserver ? (
            <button
              type="button"
              className={styles.observerEnter}
              data-visual="atlas-observer-enter"
              onClick={() => setObserver3D(true)}
              aria-label="الدخول إلى بيئة ثلاثية الأبعاد لمراقبة التضاريس"
            >
              <Boxes size={15} /> مراقبة ثلاثية الأبعاد
            </button>
          ) : null}
          {!showObserver ? (
            <>
              <button type="button" onClick={() => setZoom((value) => Math.min(1.7, +(value + 0.15).toFixed(2)))} aria-label="تكبير">
                <ZoomIn size={16} />
              </button>
              <button type="button" onClick={() => setZoom((value) => Math.max(1, +(value - 0.15).toFixed(2)))} aria-label="تصغير">
                <ZoomOut size={16} />
              </button>
              <button type="button" onClick={() => { theatreRef.current?.reset(); setZoom(1); }} aria-label="إعادة الضبط">
                <Locate size={16} />
              </button>
            </>
          ) : null}
          <button type="button" onClick={() => setListMode((value) => !value)} aria-label="عرض كقائمة">
            <List size={16} />
          </button>
          <button
            type="button"
            onClick={() => setStageExpanded((value) => !value)}
            aria-label={stageExpanded ? "إغلاق العرض الموسّع" : "تكبير الشاشة — عرض ملء الصفحة"}
            aria-pressed={stageExpanded}
            data-visual="atlas-stage-expand"
          >
            {stageExpanded ? <X size={16} /> : <Maximize size={16} />}
          </button>
        </div>

        <aside className={styles.layers}>
          <h4>الطبقات</h4>
          <label>
            <input type="checkbox" checked={showOverlays} onChange={() => setShowOverlays((value) => !value)} />
            حدود تضاريسية تخطيطية
          </label>
          <label>
            <input type="checkbox" checked={showMarkers} onChange={() => setShowMarkers((value) => !value)} />
            العلامات
          </label>
          <p>لوحة فنية للمناخ. العلامات تخطيطية. لا مقياس مسافة.</p>
        </aside>

        {mode === "theatre" && marker ? (
          <aside className={styles.floatCard} aria-live="polite" data-visual="atlas-theatre-evidence">
            <span className={styles.badge}>{CERTAINTY_LABEL[marker.certainty]}</span>
            <h2>{marker.labelAr}</h2>
            <p>{marker.descriptionAr}</p>
            <p className={styles.src}>
              {witnessKind} · {phase.witness.cite}
            </p>
            {campaignEvent ? (
              <p className={styles.src}>
                <Clock size={12} /> {campaignEvent.dateTextAr}
              </p>
            ) : null}
            <div className={styles.recordLinks}>
              {campaignChapterLink ? (
                <Link href={campaignChapterLink} className={styles.seerahLink}>
                  <BookOpen size={14} /> فصل الغزوة
                </Link>
              ) : null}
              {campaignRecordHref ? (
                <Link href={campaignRecordHref} className={styles.seerahLink} data-visual="atlas-campaign-record">
                  <BookMarked size={14} /> التفصيل والمصادر
                </Link>
              ) : null}
            </div>
          </aside>
        ) : null}

        {mode === "places" && place ? (
          <aside className={styles.floatCard} aria-live="polite" data-visual="atlas-place-evidence">
            <span className={styles.badge}>موضع تخطيطي — ليس إحداثيات</span>
            <h2>{place.name}</h2>
            <ul className={styles.mentions}>
              {place.mentions.slice(0, 4).map((mention) => (
                <li key={`${mention.chapterId}-${mention.eventId}`}>
                  <Link href={`/seerah?chapter=${encodeURIComponent(mention.chapterId)}&event=${encodeURIComponent(mention.eventId)}`}>
                    <strong>{mention.eventTitle}</strong>
                  </Link>
                  <span>
                    {mention.chapterTitle} · {mention.eventDate}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className={styles.watchBtn}
              data-visual="atlas-place-watch"
              onClick={() => openImmersive(place.id)}
            >
              <Maximize size={14} /> مشاهدة الموضع بالحجم الكامل
            </button>
            {placeSeerah ? (
              <Link href={atlasPlaceDatabaseHref(placeSeerah)} className={styles.seerahLink}>
                <BookMarked size={14} /> السجل الزمني للموضع ({placeEvents.length})
              </Link>
            ) : null}
            <Link href="/seerah" className={styles.seerahLink}>
              <BookOpen size={14} /> فتح فصول السيرة
            </Link>
          </aside>
        ) : null}

        {mode === "theatre" ? (
          <div className={styles.phaseRail}>
            <button
              type="button"
              onClick={() => setPhaseIndex((index) => Math.max(0, index - 1))}
              disabled={phaseIndex === 0}
              aria-label="المرحلة السابقة"
            >
              <ChevronRight size={16} />
            </button>
            <ol>
              {campaign.phases.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={index === phaseIndex ? "step" : undefined}
                    onClick={() => setPhaseIndex(index)}
                  >
                    <span>٠{index + 1}</span>
                    {item.titleAr}
                  </button>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => setPhaseIndex((index) => Math.min(campaign.phases.length - 1, index + 1))}
              disabled={phaseIndex === campaign.phases.length - 1}
              aria-label="المرحلة التالية"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : null}
        </StagePortal>
      </div>

      {mode === "theatre" ? (
        <section className={styles.board}>
          <article className={styles.teacher}>
            <h2>الأرض معلّمة</h2>
            <p>{campaign.terrainTeacherAr}</p>
            <dl>
              <div>
                <dt>نوع الخريطة</dt>
                <dd>{campaign.mapTypeLabel}</dd>
              </div>
              <div>
                <dt>ساعة المرحلة</dt>
                <dd>
                  {phase.hourLabel} · {WEATHER_LABEL[weather]}
                </dd>
              </div>
              <div>
                <dt>الثقة المكانية</dt>
                <dd>{campaign.confidenceLabel}</dd>
              </div>
              <div>
                <dt>المسافة</dt>
                <dd>{campaign.distanceNote}</dd>
              </div>
            </dl>
          </article>
          <article className={styles.witness}>
            <h2>دفتر الشاهد</h2>
            <span className={styles.badge}>{witnessKind}</span>
            <blockquote>
              <p>{phase.witness.arabic}</p>
              <footer>{phase.witness.cite}</footer>
            </blockquote>
            <p className={styles.phaseBody}>{phase.bodyAr}</p>
          </article>
          <section className={styles.legend} aria-label="مفتاح الرموز واليقين">
            <h2>مفتاح اليقين</h2>
            <ul>
              <li>
                <i className={styles.kNamed} /> معلم مسمّى
              </li>
              <li>
                <i className={styles.kApprox} /> تقريبي
              </li>
              <li>
                <i className={styles.kSchema} /> تخطيطي
              </li>
              <li>
                <i className={styles.kNur} /> مقام النور — بلا تجسيد
              </li>
            </ul>
            <p>{campaign.disputeAr}</p>
            <p>{campaign.geographicBasisAr}</p>
            <p className={styles.src}>{campaign.sources.join(" · ")}</p>
          </section>
        </section>
      ) : null}

      {mode === "places" && place ? (
        <section
          className={styles.placeBoard}
          data-visual="atlas-place-timeline"
          aria-label={`الخط الزمني المسجل لموضع ${place.name}`}
        >
          <header className={styles.placeBoardHead}>
            <div>
              <span className={styles.badge}>مزامنة مع قاعدة السيرة الزمنية</span>
              <h2>الخط الزمني للموضع</h2>
              <p>
                الأحداث المسجلة في قاعدة السيرة عند «{place.name}»، مرتبة بحسب ترتيبها
                الزمني في السجل. الموضع نفسه يبقى تخطيطيًا على اللوحة.
              </p>
            </div>
            {placeSeerah ? (
              <Link href={atlasPlaceDatabaseHref(placeSeerah)} className={styles.seerahLink}>
                <BookMarked size={14} /> تصفية القاعدة بهذا الموضع
              </Link>
            ) : null}
          </header>

          {placeEvents.length === 0 ? (
            <p className={styles.placeEmpty}>
              لا توجد أحداث مرتبطة بهذا الموضع في قاعدة السيرة الحالية. لا يُستنتج
              وجود حدث من مجرد ورود اسم الموضع في فصل آخر.
            </p>
          ) : (
            <ol className={styles.placeEventList}>
              {placeEvents.map((event) => (
                <li key={event.id}>
                  <Link href={event.href} className={styles.placeEvent}>
                    <span className={styles.placeOrder}>{event.order}</span>
                    <span className={styles.placeEventText}>
                      <span>
                        {event.yearAH === null ? "قبل الهجرة" : `${event.yearAH} هـ`}
                        {event.yearCE === null ? "" : ` / ${event.yearCE} م`}
                        {" · "}
                        {event.eraTitleAr}
                      </span>
                      <strong>{event.titleAr}</strong>
                      <small>
                        {event.chapterTitleAr} · {event.dateTextAr}
                      </small>
                    </span>
                    <span className={styles.placeCounts}>
                      <span>{event.quranCount} قرآن</span>
                      <span>{event.hadithCount} حديث</span>
                      <span>{event.sourceCount} مصدر</span>
                    </span>
                    <ExternalLink size={14} aria-hidden />
                  </Link>
                </li>
              ))}
            </ol>
          )}

          <p className={styles.placeSourceNote}>
            كل سجل معلّق للمراجعة العلمية. فتح الحدث يعرض إحالاته القرآنية
            والحديثية وقائمة مصادره، ولا يضيف الموقع علاقة غير مسجلة.
          </p>
        </section>
      ) : null}

      {/* Lower deck, as in the approved composition: latest recorded events ·
          featured campaign maps · specialized atlas gateways. Every card is
          a real registry entry opening a real view. */}
      <div className={styles.lowerDeck} data-visual="atlas-lower-deck">
        <section className={styles.lowerPanel} aria-label="أحدث الأحداث في الأطلس">
          <header><Clock size={15} aria-hidden="true" /> أحدث الأحداث في السجل</header>
          <ul className={styles.latestList}>
            {latestEvents.map((event) => (
              <li key={event.id}>
                <Link href={`/seerah/database?event=${encodeURIComponent(event.id)}`}>
                  <img src={art[event.visualKey as keyof typeof art] ?? art.atlas} alt="" />
                  <span>
                    <strong>{event.titleAr}</strong>
                    <small>{event.dateTextAr}</small>
                  </span>
                  <ArrowLeft size={13} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/seerah/database" className={styles.lowerAll}>
            عرض جميع الأحداث ({SEERAH_DATABASE_COUNTS.events.toLocaleString("ar-EG")}) <ArrowLeft size={13} aria-hidden="true" />
          </Link>
        </section>

        <section className={styles.lowerPanel} aria-label="خرائط مميزة">
          <header><Star size={15} aria-hidden="true" /> خرائط مميزة — مسارح الغزوات</header>
          <div className={styles.featuredGrid}>
            {FEATURED_CAMPAIGNS.map(({ campaign: item, plate }) => (
              <button
                key={item.id}
                type="button"
                className={campaign.id === item.id && mode === "theatre" ? styles.featuredOn : undefined}
                onClick={() => {
                  setMode("theatre");
                  setCampaignId(item.id);
                  stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                aria-label={`فتح مسرح ${item.nameAr}`}
              >
                <img src={plate} alt="" />
                <span>
                  <strong>{item.nameAr}</strong>
                  <small>{item.dateAr}</small>
                </span>
              </button>
            ))}
          </div>
          <p className={styles.lowerNote}>
            كل خريطة مسرح حي بطبقات ومراحل وشاهد نصي — وليست صورة ثابتة.
          </p>
        </section>

        <section className={styles.lowerPanel} aria-label="أطالس متخصصة">
          <header><Landmark size={15} aria-hidden="true" /> أطالس متخصصة</header>
          <div className={styles.specialGrid}>
            <button
              type="button"
              onClick={() => {
                setMode("theatre");
                stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Mountain size={16} aria-hidden="true" />
              <strong>أطلس الغزوات</strong>
              <small>{LIVING_CAMPAIGNS.length.toLocaleString("ar-EG")} مسارح موثقة</small>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("places");
                setPlaceFilter("battles");
                stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <MapIcon size={16} aria-hidden="true" />
              <strong>مواضع الغزوات</strong>
              <small>{filterNodes("battles").length.toLocaleString("ar-EG")} مواضع تخطيطية</small>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("places");
                setPlaceFilter("journey");
                stageRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <Route size={16} aria-hidden="true" />
              <strong>مواضع الرحلة</strong>
              <small>{filterNodes("journey").length.toLocaleString("ar-EG")} مواضع تخطيطية</small>
            </button>
            <Link href="/seerah/database" className={styles.specialLink}>
              <BookMarked size={16} aria-hidden="true" />
              <strong>القاعدة الزمنية</strong>
              <small>{SEERAH_DATABASE_COUNTS.events.toLocaleString("ar-EG")} حدثًا مسجلًا</small>
            </Link>
            <Link href="/seerah" className={styles.specialLink}>
              <BookOpen size={16} aria-hidden="true" />
              <strong>فصول السيرة</strong>
              <small>{ghazawatScenes.length.toLocaleString("ar-EG")} مشاهد غزوات</small>
            </Link>
            <Link href="/library" className={styles.specialLink}>
              <Layers size={16} aria-hidden="true" />
              <strong>مصادر الأطلس</strong>
              <small>المصنفات الجغرافية والتاريخية</small>
            </Link>
          </div>
        </section>
      </div>

      {/* Immersive place view — opens automatically on marker tap or «مشاهدة».
          Full-screen glass dialog: living plate with parallax, atmosphere
          particles, synthesized desert wind and the governed record links. */}
      {immersivePlace ? createPortal(
        <div
          className={`${styles.immersive} ${reducedMotion ? styles.immersiveStill : ""}`}
          ref={immersiveRef}
          role="dialog"
          aria-modal="true"
          aria-label={`مشاهدة موضع ${immersivePlace.name} بالحجم الكامل`}
          data-visual="atlas-immersive-place"
          onPointerMove={handleImmersivePointer}
        >
          <div className={styles.immersivePlateWrap} aria-hidden="true">
            <img className={styles.immersivePlate} src={HIJAZ_PLATE} alt="" />
            <div className={styles.immersiveGrade} />
            <div className={styles.immersiveGlow} />
            <div className={styles.immersiveDust}>
              {Array.from({ length: 14 }, (_, index) => (
                <i key={index} style={{ "--i": index } as CSSProperties} />
              ))}
            </div>
            <div className={styles.immersiveVignette} />
          </div>

          <div className={styles.immersiveBar}>
            <span className={styles.badge}>إعادة بناء فنية — موضع تخطيطي، ليس إحداثيات</span>
            <div className={styles.immersiveActions}>
              <button
                type="button"
                className={styles.immersiveSoundBtn}
                aria-pressed={immersiveSound}
                aria-label={immersiveSound ? "كتم أجواء الصحراء" : "تشغيل أجواء الصحراء"}
                onClick={() => {
                  setImmersiveSound((value) => {
                    const next = !value;
                    if (next) {
                      ensureAudio();
                      setWind(true);
                    } else {
                      setWind(false);
                    }
                    return next;
                  });
                }}
              >
                {immersiveSound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>{immersiveSound ? "الأجواء تعمل" : "الأجواء مكتومة"}</span>
              </button>
              <button
                type="button"
                ref={immersiveCloseRef}
                className={styles.immersiveClose}
                onClick={closeImmersive}
                aria-label="إغلاق المشاهدة (Escape)"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className={styles.immersiveBody}>
            <aside className={styles.immersiveCard}>
              <span className={styles.immersiveKicker}>
                <Compass size={14} aria-hidden="true" /> من فصول السيرة المسجلة
              </span>
              <h2>{immersivePlace.name}</h2>
              <p className={styles.immersiveNote}>
                يُعرض الموضع على لوحة فنية بروح المكان — بلا تجسيد للنبي ﷺ ولا لأصحابه،
                وبلا إحداثيات مساحية. العلاقات والأحداث من قاعدة السيرة المحكومة فقط.
              </p>
              {immersivePlace.mentions.length > 0 ? (
                <ul className={styles.mentions}>
                  {immersivePlace.mentions.slice(0, 5).map((mention) => (
                    <li key={`${mention.chapterId}-${mention.eventId}`}>
                      <Link href={`/seerah?chapter=${encodeURIComponent(mention.chapterId)}&event=${encodeURIComponent(mention.eventId)}`}>
                        <strong>{mention.eventTitle}</strong>
                      </Link>
                      <span>
                        {mention.chapterTitle} · {mention.eventDate}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className={styles.immersiveLinks}>
                {immersiveSeerah ? (
                  <Link href={atlasPlaceDatabaseHref(immersiveSeerah)} className={styles.seerahLink}>
                    <BookMarked size={14} /> السجل الزمني للموضع ({immersiveEvents.length})
                  </Link>
                ) : null}
                <Link href="/seerah" className={styles.seerahLink}>
                  <BookOpen size={14} /> فتح فصول السيرة
                </Link>
              </div>
            </aside>

            {immersiveEvents.length > 0 ? (
              <aside className={styles.immersiveTimeline} aria-label={`أحداث مسجلة عند ${immersivePlace.name}`}>
                <header>
                  <Clock size={14} aria-hidden="true" /> الخط الزمني المسجل
                </header>
                <ol>
                  {immersiveEvents.slice(0, 6).map((event) => (
                    <li key={event.id}>
                      <Link href={event.href}>
                        <span className={styles.placeOrder}>{event.order}</span>
                        <span>
                          <strong>{event.titleAr}</strong>
                          <small>
                            {event.yearAH === null ? "قبل الهجرة" : `${event.yearAH} هـ`} · {event.eraTitleAr}
                          </small>
                        </span>
                        <ArrowLeft size={13} aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </aside>
            ) : null}
          </div>

          <p className={styles.immersiveFoot}>
            حرّك المؤشر لتتنفس اللوحة · Esc للإغلاق · الصوت مُولّد لحظيًا (رياح صحراوية) ولا يعمل إلا باختيارك
          </p>
        </div>,
        document.body,
      ) : null}

      <p className={styles.atlasBoundary}>
        الأطلس إعادة بناء فنية تعليمية: المواضع تخطيطية على لوحات، لا خرائط مساحية ولا إحداثيات
        قياس، ولا تجسيد للنبي ﷺ ولا محاكاة قتال. العلاقات والأحداث من قاعدة السيرة المحكومة فقط.
      </p>
    </div>
  );
}

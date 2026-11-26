import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import {
  BookOpenText,
  CheckCircle2,
  ChevronLeft,
  Clapperboard,
  Clock3,
  ExternalLink,
  Film,
  HandHeart,
  Headphones,
  Info,
  Landmark,
  LayoutGrid,
  ListFilter,
  ListVideo,
  LoaderCircle,
  Maximize2,
  Mic2,
  Minimize2,
  Play,
  RotateCcw,
  ScrollText,
  Search,
  SearchX,
  ShieldAlert,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sun,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import {
  MEDIA_REVIEW_GATE_LABELS,
  isMediaGatePassed,
  isOfficialProviderPlaybackCandidate,
  mediaReviewCounts,
  type MediaReviewGateKey,
} from "@/visual-golden/services/media/review-gates";
import {
  EMPTY_NOOR_FILTERS,
  NOOR_MEDIA_RECORDS,
  approvedNoorEmbedUrl,
  clearedNoorThumbnail,
  compareNoorEpisodes,
  filterNoorRecords,
  matchesNoorTopic,
  noorMediaDuration,
  noorMediaTitle,
  type NoorAvailability,
  type NoorDuration,
  type NoorFilters,
  type NoorTopic,
} from "@/visual-golden/services/media/noor-theatre";
import { recordMediaCategory } from "@/visual-golden/services/media/taxonomy";
import type { MediaDiscoveryRecord } from "@/visual-golden/services/media/types";
import type { HallView } from "@/visual-golden/components/three/CinematicHall";
import { art } from "@/visual-golden/mock/art";
import styles from "./NoorMediaTheatre.module.css";

const CinematicHall = lazy(() => import("@/visual-golden/components/three/CinematicHall"));
const VIEW_CHOICES = [
  { id: "explore", label: "استكشف القاعة" },
  { id: "interactive", label: "تصفح واختر" },
  { id: "cinema", label: "عرض سينمائي" },
] as const;

const GATE_ORDER = Object.keys(MEDIA_REVIEW_GATE_LABELS) as MediaReviewGateKey[];
const TOPICS: ReadonlyArray<{ id: NoorTopic; label: string; en: string; icon: typeof Film }> = [
  { id: "all", label: "كل المواد", en: "Complete catalog", icon: LayoutGrid },
  { id: "seerah", label: "السيرة النبوية", en: "Prophetic biography", icon: BookOpenText },
  { id: "quran", label: "القرآن وعلومه", en: "Quran sciences", icon: ScrollText },
  { id: "history", label: "التاريخ الإسلامي", en: "Islamic history", icon: Landmark },
  { id: "companions", label: "الصحابة والأئمة", en: "Companions and imams", icon: Users },
  { id: "worship", label: "العبادات", en: "Worship", icon: HandHeart },
  { id: "lectures", label: "محاضرات ومواعظ", en: "Lectures", icon: Mic2 },
  { id: "stories", label: "قصص الأنبياء", en: "Prophetic stories", icon: Film },
];

const QUEUE_PAGE_SIZE = 24;
const DURATION_CHOICES: ReadonlyArray<{ id: NoorDuration; label: string }> = [
  { id: "all", label: "كل المدد" },
  { id: "short", label: "حتى 15 دقيقة" },
  { id: "medium", label: "15–45 دقيقة" },
  { id: "long", label: "أكثر من 45 دقيقة" },
  { id: "unknown", label: "المدة غير موثقة" },
];

function uniqueValues(key: "channel_name" | "speaker" | "series_name"): string[] {
  return [...new Set(NOOR_MEDIA_RECORDS.map((record) => record[key]).filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b, "ar"));
}

function uniqueCanonicalCategories(): string[] {
  return [...new Set(NOOR_MEDIA_RECORDS.map((record) => recordMediaCategory(record)))]
    .sort((a, b) => a.localeCompare(b, "ar"));
}

function recordMeta(record: MediaDiscoveryRecord): string {
  return [record.channel_name ?? "ناشر غير موثق", record.series_name, record.subcategory]
    .filter(Boolean)
    .join(" · ");
}

export function NoorMediaTheatre() {
  const search = useSearch();
  const [, navigate] = useLocation();
  const effectiveMotion = useEffectiveMotion();
  const [filters, setFilters] = useState<NoorFilters>(EMPTY_NOOR_FILTERS);
  const [visibleCount, setVisibleCount] = useState(8);

  // Deep-link into a topic from other institution sections:
  // /noor?topic=quran opens the Qur'an sciences room, /noor?topic=seerah the
  // Prophetic biography room, etc. Applied once on mount so the visitor's own
  // topic choices are not overwritten afterwards.
  useEffect(() => {
    const topicParam = new URLSearchParams(search).get("topic");
    if (topicParam && topicParam !== "all") {
      const validTopic = ["all", "seerah", "quran", "history", "companions", "worship", "lectures", "stories"].includes(topicParam)
        ? (topicParam as NoorFilters["topic"])
        : "all";
      if (validTopic !== "all") {
        setFilters((current) => ({ ...current, topic: validTopic, category: "all" }));
      }
    }
  }, []);
  const [detail, setDetail] = useState<MediaDiscoveryRecord | null>(null);
  const [playerState, setPlayerState] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [playerAttempt, setPlayerAttempt] = useState(0);
  const [fullscreenMode, setFullscreenMode] = useState<"native" | "viewport" | null>(null);
  const [fullscreenMessage, setFullscreenMessage] = useState("");
  const [view, setView] = useState<HallView>("interactive");
  const [illuminated, setIlluminated] = useState(true);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(true);
  const [plainView, setPlainView] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullscreenRequestRef = useRef(0);
  const fullscreen = fullscreenMode !== null;

  const counts = useMemo(() => mediaReviewCounts(NOOR_MEDIA_RECORDS), []);
  const playbackCandidateCount = useMemo(
    () => NOOR_MEDIA_RECORDS.filter(isOfficialProviderPlaybackCandidate).length,
    [],
  );
  const categories = useMemo(uniqueCanonicalCategories, []);
  const seriesOptions = useMemo(() => uniqueValues("series_name"), []);
  const channels = useMemo(() => uniqueValues("channel_name"), []);
  const speakers = useMemo(() => uniqueValues("speaker"), []);
  const topicCounts = useMemo(() => {
    return Object.fromEntries(
      TOPICS.map((topic) => [
        topic.id,
        NOOR_MEDIA_RECORDS.filter((record) => matchesNoorTopic(record, topic.id)).length,
      ]),
    ) as Record<NoorTopic, number>;
  }, []);
  const filtered = useMemo(() => filterNoorRecords(NOOR_MEDIA_RECORDS, filters), [filters]);
  const requestedId = new URLSearchParams(search).get("media");
  const selected = filtered.length
    ? filtered.find((record) => record.id === requestedId) ?? filtered[0]
    : null;
  const selectedIndex = selected ? filtered.findIndex((record) => record.id === selected.id) : -1;
  const navigationRecords = useMemo(() => {
    if (!selected?.series_name) return filtered;
    const sameSeries = filtered.filter((record) => record.series_name === selected.series_name);
    return sameSeries.length ? [...sameSeries].sort(compareNoorEpisodes) : filtered;
  }, [filtered, selected?.id, selected?.series_name]);
  const navigationIndex = selected
    ? navigationRecords.findIndex((record) => record.id === selected.id)
    : -1;
  const queueStart = selectedIndex < 0
    ? 0
    : Math.max(0, Math.min(selectedIndex - Math.floor(QUEUE_PAGE_SIZE / 2), Math.max(0, filtered.length - QUEUE_PAGE_SIZE)));
  const queue = filtered.slice(queueStart, queueStart + QUEUE_PAGE_SIZE);
  const embedUrl = selected ? approvedNoorEmbedUrl(selected) : null;
  const selectedPlayable = Boolean(embedUrl);
  const selectedThumbnail = selected ? clearedNoorThumbnail(selected) : null;
  const visible = filtered.slice(0, visibleCount);

  useEffect(() => {
    setPlayerState("idle");
    setPlayerAttempt(0);
    setFullscreenMessage("");
  }, [selected?.id]);

  useEffect(() => {
    if (playerState !== "loading") return;
    const timeout = window.setTimeout(() => setPlayerState("error"), 15_000);
    return () => window.clearTimeout(timeout);
  }, [playerAttempt, playerState, selected?.id]);

  useEffect(() => {
    const onFullscreen = () => {
      if (document.fullscreenElement === screenRef.current) {
        setFullscreenMode("native");
        setFullscreenMessage("");
      } else {
        setFullscreenMode((current) => current === "native" ? null : current);
      }
    };
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  useEffect(() => {
    const screen = screenRef.current;
    if (fullscreenMode !== "viewport" || !screen?.showPopover) return;
    screen.setAttribute("popover", "manual");
    try {
      screen.showPopover();
    } catch {
      screen.removeAttribute("popover");
      return;
    }
    return () => {
      if (screen.matches(":popover-open")) screen.hidePopover();
      screen.removeAttribute("popover");
    };
  }, [fullscreenMode]);

  useEffect(() => {
    if (!fullscreen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || document.fullscreenElement || dialogRef.current?.open) return;
      fullscreenRequestRef.current += 1;
      setFullscreenMode(null);
      setFullscreenMessage("");
    };
    window.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onEscape);
    };
  }, [fullscreen]);

  useEffect(() => {
    if (view === "interactive") return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement && !dialogRef.current?.open) setView("interactive");
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [view]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (detail && !dialog.open) dialog.showModal();
    if (!detail && dialog.open) dialog.close();
  }, [detail]);

  const patchFilters = (patch: Partial<NoorFilters>) => {
    const structuralPatch = ["topic", "category", "channel", "speaker"].some((key) => key in patch);
    setFilters((current) => ({
      ...current,
      ...patch,
      ...(structuralPatch && !("series" in patch) ? { series: "all" } : {}),
    }));
    setVisibleCount(12);
  };

  const selectRecord = (record: MediaDiscoveryRecord, bringIntoView = false) => {
    const params = new URLSearchParams(search);
    params.set("media", record.id);
    navigate(`/noor?${params.toString()}`);
    if (bringIntoView) {
      screenRef.current?.scrollIntoView({
        block: "center",
        behavior: effectiveMotion === "reduced" ? "auto" : "smooth",
      });
    }
  };

  const selectRelative = (direction: -1 | 1) => {
    if (!navigationRecords.length) return;
    const nextIndex = navigationIndex < 0
      ? 0
      : (navigationIndex + direction + navigationRecords.length) % navigationRecords.length;
    selectRecord(navigationRecords[nextIndex]);
  };

  const toggleFullscreen = async () => {
    const requestId = ++fullscreenRequestRef.current;
    setFullscreenMessage("");
    if (fullscreenMode || document.fullscreenElement) {
      setFullscreenMode(null);
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          setFullscreenMessage("أغلق وضع ملء الشاشة من زر المتصفح إذا بقي ظاهرًا.");
        }
      }
      return;
    }

    const screen = screenRef.current;
    if (!screen) return;
    // The viewport mode is immediate and remains usable when an embedded browser
    // leaves the native Fullscreen API promise pending instead of settling it.
    setFullscreenMode("viewport");
    if (!screen.requestFullscreen) {
      setFullscreenMessage("وضع ملء النافذة فعّال؛ ملء الشاشة الأصلي غير مدعوم هنا.");
      return;
    }

    const fallbackTimer = window.setTimeout(() => {
      if (fullscreenRequestRef.current === requestId && !document.fullscreenElement) {
        setFullscreenMessage("وضع ملء النافذة فعّال؛ ملء الشاشة الأصلي غير متاح في بيئة العرض.");
      }
    }, 800);
    try {
      await screen.requestFullscreen();
      window.clearTimeout(fallbackTimer);
      if (fullscreenRequestRef.current !== requestId) {
        if (document.fullscreenElement === screen) await document.exitFullscreen();
        return;
      }
      if (document.fullscreenElement === screen) {
        setFullscreenMode("native");
        setFullscreenMessage("");
      }
    } catch {
      window.clearTimeout(fallbackTimer);
      if (fullscreenRequestRef.current === requestId) {
        setFullscreenMessage("وضع ملء النافذة فعّال؛ تعذر تفعيل ملء الشاشة الأصلي.");
      }
    }
  };

  const beginPlayback = () => {
    if (!embedUrl) return;
    setPlayerAttempt((attempt) => attempt + 1);
    setPlayerState("loading");
  };

  const availabilityLabel = (record: MediaDiscoveryRecord) =>
    isOfficialProviderPlaybackCandidate(record) ? "مرشح لمشغل المصدر الرسمي" : "لا يوجد مشغل رسمي صالح";

  return (
    <div
      className={styles.page}
      data-visual="noor-theatre"
      data-approved-count={counts.approved}
      data-playback-candidate-count={playbackCandidateCount}
      data-result-count={filtered.length}
      data-selected-series={selected?.series_name ?? ""}
    >
      <div className={styles.room} data-view={plainView ? "interactive" : view} data-plain={plainView}>
      {!plainView ? <Suspense fallback={null}>
        <CinematicHall room="noor" view={view} illuminated={illuminated} />
      </Suspense> : null}
      <header className={styles.masthead}>
        <div className={styles.mastheadCopy}>
          <h1>مسرح <em>النور</em></h1>
          <p className={styles.englishTitle} lang="en">Noor Media Theatre</p>
          <p className={styles.lead}>
            مكتبة عربية للسيرة والمحاضرات والقصص؛ شاهد المواد المتاحة عبر مشغلات ناشريها الرسمية، مع بيان مستقل لحالة المراجعة والحقوق.
          </p>
        </div>
      </header>

      <div className={styles.viewControls} role="group" aria-label="عرض قاعة مسرح النور">
        {!plainView ? VIEW_CHOICES.map(({ id, label }) => (
          <button type="button" key={id} aria-pressed={id === view} onClick={() => setView(id)}>{label}</button>
        )) : null}
        {!plainView ? <button type="button" aria-pressed={illuminated} onClick={() => setIlluminated((value) => !value)}>
          <Sun size={16} aria-hidden="true" /> إضاءة القاعة
        </button> : null}
        <button type="button" aria-pressed={plainView} onClick={() => { setView("interactive"); setPlainView((value) => !value); }}>عرض مبسّط</button>
        {view === "interactive" ? <>
          <button type="button" aria-controls="noor-topics-panel" aria-expanded={topicsOpen} onClick={() => setTopicsOpen((value) => !value)}>الأروقة</button>
          <button type="button" aria-controls="noor-playlist-panel" aria-expanded={playlistOpen} onClick={() => setPlaylistOpen((value) => !value)}>قائمة التشغيل</button>
        </> : null}
      </div>
      <section className={styles.cinema} aria-label="قاعة مسرح النور" hidden={view === "explore"} data-topics={view === "interactive" && topicsOpen} data-playlist={view === "interactive" && playlistOpen}>
        <div className={styles.hallLight} aria-hidden="true" />
        <div className={styles.hallGrid}>
          <aside id="noor-topics-panel" hidden={view !== "interactive" || !topicsOpen} className={`${styles.glassPanel} ${styles.topics}`} aria-labelledby="noor-topics-title">
            <header className={styles.panelHead}>
              <ListFilter size={17} aria-hidden />
              <div><h2 id="noor-topics-title">أروقة المسرح</h2><span lang="en">Media rooms</span></div>
            </header>
            <div className={styles.topicList}>
              {TOPICS.map((topic) => {
                const Icon = topic.icon;
                const count = topicCounts[topic.id];
                return (
                  <button
                    type="button"
                    key={topic.id}
                    className={styles.topicButton}
                    data-active={filters.topic === topic.id}
                    aria-pressed={filters.topic === topic.id}
                    onClick={() => patchFilters({ topic: topic.id, category: "all" })}
                  >
                    <Icon size={20} aria-hidden />
                    <span><strong>{topic.label}</strong><small lang="en">{topic.en}</small></span>
                    <b>{count}</b>
                  </button>
                );
              })}
            </div>
            <p className={styles.topicNote}>التصنيف يغيّر الفهرس فقط؛ لا يبدأ أي تشغيل تلقائي.</p>
          </aside>

          <div className={styles.screenColumn}>
            <div
              ref={screenRef}
              className={styles.screenFrame}
              data-player-state={selectedPlayable ? playerState : "blocked"}
              data-media-id={selected?.id ?? "none"}
              data-expanded={fullscreen}
              data-fullscreen-mode={fullscreenMode ?? "none"}
            >
              <div className={styles.screenTopline}>
                <span><Clapperboard size={15} aria-hidden /> {selected ? recordMediaCategory(selected) : "لا توجد مادة محددة"}</span>
                <span className={selectedPlayable ? styles.approvedBadge : styles.reviewBadge}>
                  {selectedPlayable ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                  {selected ? availabilityLabel(selected) : "نتائج فارغة"}
                </span>
              </div>

              <div className={styles.screenBody}>
                {selected && selectedPlayable && embedUrl && playerState !== "idle" ? (
                  <>
                    <iframe
                      key={`${selected.id}-${playerAttempt}`}
                      className={styles.providerFrame}
                      src={embedUrl}
                      title={`مشغل الفيديو الرسمي: ${noorMediaTitle(selected)}`}
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                      onLoad={() => setPlayerState("ready")}
                      onError={() => setPlayerState("error")}
                    />
                    {playerState === "loading" ? (
                      <div className={styles.playerOverlay} role="status">
                        <LoaderCircle className={styles.spinner} size={34} aria-hidden />
                        <strong>جاري تحميل مشغل المزود…</strong>
                        <span>لن يبدأ الفيديو تلقائيًا.</span>
                      </div>
                    ) : null}
                    {playerState === "error" ? (
                      <div className={styles.playerOverlay} role="alert">
                        <ShieldAlert size={34} aria-hidden />
                        <strong>تعذر تحميل إطار المزود</strong>
                        <span>تحقق من الاتصال أو افتح المصدر الرسمي.</span>
                        <button type="button" className={styles.goldButton} onClick={beginPlayback}><RotateCcw size={15} /> إعادة المحاولة</button>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <img
                      className={styles.screenArt}
                      data-decorative={!selectedThumbnail}
                      src={selectedThumbnail ?? art.mosque}
                      alt=""
                    />
                    <div className={styles.screenVeil} aria-hidden="true" />
                    <div className={styles.emptyState}>
                      {selected ? <ShieldAlert size={35} aria-hidden /> : <SearchX size={35} aria-hidden />}
                      <p className={styles.emptyKicker}>{selected ? "المادة المحددة" : "الفهرس الحالي"}</p>
                      <h2>{selected ? noorMediaTitle(selected) : "لا توجد نتائج مطابقة"}</h2>
                      <p>
                        {!selected
                          ? "جرّب إزالة بعض الفلاتر أو البحث بكلمة أخرى."
                          : selectedPlayable && !embedUrl
                            ? "تعذر تكوين رابط التضمين الرسمي؛ لم نركّب مشغلًا بديلًا."
                            : "لا يتوفر مشغل رسمي صالح لهذه المادة، أو توجد قيود صريحة من الناشر. يمكنك فتح المصدر الأصلي عند توفره."}
                      </p>
                      <div className={styles.emptyActions}>
                        {selectedPlayable && embedUrl ? (
                          <button type="button" className={styles.playButton} onClick={beginPlayback}>
                            <Play size={22} fill="currentColor" aria-hidden /> تحميل المشغل الرسمي
                          </button>
                        ) : null}
                        {selected?.official_url ? (
                          <a href={selected.official_url} target="_blank" rel="noopener noreferrer" className={styles.sourceButton}>
                            <ExternalLink size={16} /> فتح المصدر الرسمي
                          </a>
                        ) : null}
                        {selected ? (
                          <button type="button" className={styles.detailButton} onClick={() => setDetail(selected)}>
                            <Info size={16} /> المصدر وحالة التشغيل
                          </button>
                        ) : (
                          <button type="button" className={styles.detailButton} onClick={() => setFilters(EMPTY_NOOR_FILTERS)}>
                            <RotateCcw size={16} /> إعادة ضبط الفلاتر
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.screenControls}>
                <span className={styles.playerTruth} aria-live="polite">
                  {playerState === "ready"
                    ? "تم تحميل إطار المزود؛ التحكم والتشغيل من داخل المشغل."
                    : "بدون تشغيل تلقائي · بدون تقدم مشاهدة مقدّر"}
                </span>
                <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? "الخروج من ملء الشاشة" : "فتح المسرح بملء الشاشة"}>
                  {fullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
                  <span>{fullscreen ? "تصغير" : "ملء الشاشة"}</span>
                </button>
              </div>
              {fullscreenMessage ? <p className={styles.fullscreenMessage} role="status">{fullscreenMessage}</p> : null}
            </div>
            <div className={styles.nowCard}>
              <div>
                <span>المادة المحددة الآن</span>
                <strong>{selected ? noorMediaTitle(selected) : "لا يوجد اختيار"}</strong>
                <small>{selected ? recordMeta(selected) : "عدّل البحث أو الفلاتر لعرض المواد."}</small>
              </div>
              <div className={styles.nowActions}>
                <button type="button" onClick={() => selectRelative(-1)} disabled={!filtered.length} aria-label="المادة السابقة"><SkipForward size={18} /></button>
                <button type="button" onClick={() => selectRelative(1)} disabled={!filtered.length} aria-label="المادة التالية"><SkipBack size={18} /></button>
              </div>
            </div>
            {selected ? (
              <div className={styles.mediaAttribution} aria-label="المصدر وحقوق المحتوى">
                <span><strong>المصدر:</strong> {selected.channel_name ?? "الناشر الأصلي غير موثق"}</span>
                {selected.speaker ? <span><strong>المقدم:</strong> {selected.speaker}</span> : null}
                <span>حقوق النشر والمحتوى محفوظة لأصحابها؛ يُعرض الفيديو بواسطة المشغل الرسمي وفق صلاحيات التضمين المتاحة.</span>
                {selected.official_url ? (
                  <a href={selected.official_url} target="_blank" rel="noopener noreferrer">
                    رابط المصدر الأصلي <ExternalLink size={13} aria-hidden />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <aside id="noor-playlist-panel" hidden={view !== "interactive" || !playlistOpen} className={`${styles.glassPanel} ${styles.playlist}`} aria-labelledby="noor-playlist-title">
            <header className={styles.panelHead}>
              <ListVideo size={18} aria-hidden />
              <div><h2 id="noor-playlist-title">قائمة التشغيل</h2><span>{queue.length} من {filtered.length} نتيجة</span></div>
            </header>
            <p className={styles.playlistNote}>اختيار مادة يعرض بيانها، ولا يشغّلها تلقائيًا.</p>
            <ol className={styles.playlistItems}>
              {queue.map((record, index) => {
                const active = selected?.id === record.id;
                const duration = noorMediaDuration(record.duration_seconds);
                return (
                  <li key={record.id}>
                    <button
                      type="button"
                      className={styles.playlistItem}
                      data-active={active}
                      aria-current={active ? "true" : undefined}
                      onClick={() => selectRecord(record)}
                    >
                      <span className={styles.queueIndex}>{String(queueStart + index + 1).padStart(2, "0")}</span>
                      <span className={styles.queueCopy}>
                        <strong>{noorMediaTitle(record)}</strong>
                        <small>{record.speaker ?? record.channel_name ?? "ناشر غير موثق"}</small>
                        <em>{duration ?? "المدة غير موثقة"} · {availabilityLabel(record)}</em>
                      </span>
                      <ChevronLeft size={16} aria-hidden />
                    </button>
                  </li>
                );
              })}
            </ol>
            {!filtered.length ? <p className={styles.playlistEmpty}>القائمة فارغة بهذه الفلاتر.</p> : null}
          </aside>
        </div>

        <div className={styles.filterDeck} hidden={view === "cinema"}>
          <label className={styles.searchBox}>
            <Search size={18} aria-hidden />
            <span className="sr-only">ابحث في مسرح النور</span>
            <input
              type="search"
              value={filters.query}
              onChange={(event) => patchFilters({ query: event.target.value })}
              placeholder="ابحث بالعنوان أو السلسلة أو القناة أو المتحدث"
            />
          </label>
          <label className={styles.selectBox}><span>التصنيف</span>
            <select value={filters.category} onChange={(event) => patchFilters({ category: event.target.value, topic: "all" })}>
              <option value="all">كل التصنيفات</option>
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className={styles.selectBox}><span>السلسلة</span>
            <select value={filters.series} onChange={(event) => patchFilters({ series: event.target.value })}>
              <option value="all">كل السلاسل</option>
              {seriesOptions.map((series) => <option key={series} value={series}>{series}</option>)}
            </select>
          </label>
          <label className={styles.selectBox}><span>المدة</span>
            <select value={filters.duration} onChange={(event) => patchFilters({ duration: event.target.value as NoorDuration })}>
              {DURATION_CHOICES.map((choice) => <option key={choice.id} value={choice.id}>{choice.label}</option>)}
            </select>
          </label>
          <label className={styles.selectBox}><span>القناة / الناشر</span>
            <select value={filters.channel} onChange={(event) => patchFilters({ channel: event.target.value })}>
              <option value="all">كل القنوات</option>
              {channels.map((channel) => <option key={channel} value={channel}>{channel}</option>)}
            </select>
          </label>
          <label className={styles.selectBox}><span>المتحدث</span>
            <select value={filters.speaker} onChange={(event) => patchFilters({ speaker: event.target.value })}>
              <option value="all">كل المتحدثين</option>
              {speakers.map((speaker) => <option key={speaker} value={speaker}>{speaker}</option>)}
            </select>
          </label>
          <div className={styles.availability} aria-label="حالة الاعتماد">
            {(["all", "review", "approved"] as NoorAvailability[]).map((value) => (
              <button
                type="button"
                key={value}
                data-active={filters.availability === value}
                aria-pressed={filters.availability === value}
                onClick={() => patchFilters({ availability: value })}
              >
                {value === "all" ? "كل الحالات" : value === "review" ? "غير مرشحة للمشغل" : "مرشحة للمشغل"}
              </button>
            ))}
          </div>
        </div>
      </section>
      </div>

      <div className={styles.hallServices}>
        <nav className={styles.mastheadActions} aria-label="أبواب مرتبطة بالمسرح">
          <Link href="/seerah" className={styles.textLink}><BookOpenText size={15} /> اقرأ السيرة</Link>
          <Link href="/audio" className={styles.textLink}><Headphones size={15} /> غرفة التلاوات</Link>
          <Link href="/seerah/world" className={styles.textLink}><Clapperboard size={15} /> العالم التفاعلي</Link>
        </nav>
        <dl className={styles.ledger} aria-label="حصيلة كتالوج المسرح">
          <div><dt>مادة مفهرسة</dt><dd>{counts.total}</dd></div>
          <div><dt>مرشحة لمشغل المصدر</dt><dd>{playbackCandidateCount}</dd></div>
          <div><dt>بانتظار الاعتماد التحريري الكامل</dt><dd>{counts.editorialPending}</dd></div>
        </dl>
      </div>

      <section className={styles.library} aria-labelledby="noor-library-title">
        <header className={styles.libraryHead}>
          <div><p className={styles.kicker}><Film size={15} /> فهرس القاعة</p><h2 id="noor-library-title">المواد المسجّلة في مسرح النور</h2></div>
          <p><strong>{filtered.length}</strong> نتيجة · لا يُركَّب مشغل إلا للمادة المحددة، وصور YouTube الرسمية تظهر للمرشحات فقط.</p>
        </header>
        <div className={styles.mediaGrid}>
          {visible.map((record) => {
            const active = selected?.id === record.id;
            const duration = noorMediaDuration(record.duration_seconds);
            const thumbnail = clearedNoorThumbnail(record);
            const playable = isOfficialProviderPlaybackCandidate(record);
            return (
              <article className={styles.mediaCard} key={record.id} data-active={active}>
                <button type="button" className={styles.mediaSelect} onClick={() => selectRecord(record, true)} aria-label={`تحديد ${noorMediaTitle(record)}`}>
                  <span className={styles.mediaArt} aria-hidden="true">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" loading="lazy" decoding="async" />
                    ) : (
                      <>
                        <span className={styles.mediaArch} />
                        {record.category === "محاضرات ومواعظ" ? <Mic2 size={32} /> : <BookOpenText size={32} />}
                      </>
                    )}
                    <b>{record.episode_number ? `حلقة ${record.episode_number}` : recordMediaCategory(record)}</b>
                  </span>
                  <span className={styles.mediaCopy}>
                    <span className={styles.mediaStatus}>
                      {playable ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                      {availabilityLabel(record)}
                    </span>
                    <strong>{noorMediaTitle(record)}</strong>
                    <small>{recordMeta(record)}</small>
                    <em>{duration ?? "المدة غير موثقة"}</em>
                  </span>
                </button>
                <footer>
                  <button type="button" onClick={() => setDetail(record)}><Info size={14} /> بيانات المراجعة</button>
                  {record.official_url ? <a href={record.official_url} target="_blank" rel="noopener noreferrer" aria-label={`فتح المصدر الرسمي لـ ${noorMediaTitle(record)}`}><ExternalLink size={14} /> المصدر</a> : null}
                </footer>
              </article>
            );
          })}
        </div>
        {!visible.length ? <div className={styles.libraryEmpty}><SearchX size={28} /><p>لا توجد مواد بهذا البحث. الفلاتر لا تغيّر حالة اعتماد أي سجل.</p></div> : null}
        {visible.length < filtered.length ? (
          <button type="button" className={styles.moreButton} onClick={() => setVisibleCount((count) => count + 8)}>
            عرض المزيد <span>{filtered.length - visible.length} مادة متبقية</span><ChevronLeft size={16} />
          </button>
        ) : null}
      </section>

      <footer className={styles.sessionDock}>
        <div className={styles.dockIdentity}>
          <span className={styles.dockIcon}><Clapperboard size={22} aria-hidden /></span>
          <span><small>جلسة الاستكشاف الحالية</small><strong>{selected ? noorMediaTitle(selected) : "لا توجد مادة محددة"}</strong></span>
        </div>
        <div className={styles.dockControls}>
          <button type="button" onClick={() => selectRelative(-1)} disabled={!filtered.length}><SkipForward size={16} /> السابق</button>
          <button type="button" onClick={() => selectRelative(1)} disabled={!filtered.length}>التالي <SkipBack size={16} /></button>
          {selected ? <button type="button" onClick={() => setDetail(selected)}><Info size={16} /> المصدر والحالة</button> : null}
        </div>
        <span className={styles.dockStatus}><ShieldCheck size={15} /> {playbackCandidateCount} رابط مصدر رسمي من {counts.total} — التشغيل الفعلي داخل مشغل الناشر</span>
      </footer>

      <dialog
        ref={dialogRef}
        className={styles.reviewDialog}
        aria-labelledby="noor-review-title"
        onClose={() => setDetail(null)}
        onClick={(event) => { if (event.target === event.currentTarget) setDetail(null); }}
      >
        {detail ? (
          <div className={styles.dialogInner}>
            <button type="button" className={styles.dialogClose} onClick={() => setDetail(null)} aria-label="إغلاق بيانات المراجعة"><X size={20} /></button>
            <p className={styles.kicker}><ShieldCheck size={15} /> سجل الاستحواذ والاعتماد</p>
            <h2 id="noor-review-title">{noorMediaTitle(detail)}</h2>
            <p className={styles.dialogMeta}>{recordMeta(detail)}</p>
            <div className={styles.gateGrid} aria-label="بوابات المراجعة السبع">
              {GATE_ORDER.map((gate) => {
                const passed = isMediaGatePassed(gate, detail[gate]);
                return (
                  <div key={gate} className={styles.gate} data-passed={passed}>
                    {passed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    <span>{MEDIA_REVIEW_GATE_LABELS[gate]}</span>
                    <b>{detail[gate] ?? "UNKNOWN"}</b>
                  </div>
                );
              })}
            </div>
            <dl className={styles.sourceFacts}>
              <div><dt>المصدر</dt><dd>{detail.official_url ? <a href={detail.official_url} target="_blank" rel="noopener noreferrer">صفحة الفيديو الأصلية <ExternalLink size={13} /></a> : "غير مسجل"}</dd></div>
              <div><dt>القناة / الناشر</dt><dd>{detail.channel_url ? <a href={detail.channel_url} target="_blank" rel="noopener noreferrer">{detail.channel_name ?? detail.channel_url}</a> : detail.channel_name ?? "غير موثق"}</dd></div>
              <div><dt>سجل الاستحواذ</dt><dd>{detail.provenance.sourceFile} · سطر {detail.provenance.sourceRow}</dd></div>
              <div><dt>بصمة الإدخال</dt><dd><code>{detail.provenance.inputSha256.slice(0, 20)}…</code></dd></div>
              <div><dt>الخطوة التالية</dt><dd>{detail.review_next_action ?? "غير مسجلة"}</dd></div>
            </dl>
            {detail.notes ? <p className={styles.reviewNotes}>{detail.notes}</p> : null}
          </div>
        ) : null}
      </dialog>
    </div>
  );
}

import { lazy, Suspense, useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import { Link } from "wouter";
import {
  ExternalLink,
  Headphones,
  Heart,
  Lamp,
  Pause,
  Play,
  Repeat,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Sparkles,
  BookOpen,
  ScrollText,
  Target,
  Volume2,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { worldPlateForWing } from "@/visual-golden/lib/institution/worlds";
import { apiUrl } from "@/lib/api-origin";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import {
  getQuranChapters,
  type QuranChapter,
} from "@/services/quranService";
import {
  AUDIO_COUNTS,
  AUDIO_PROVIDERS,
  isPlaybackAbortError,
  rightsLabel,
} from "@/visual-golden/services/audio";
import { getInteriorScene } from "@/visual-golden/services/interior-scenes";
import styles from "./AudioPage.module.css";

// Three.js stays out of the initial chunk: the studio loads only when the
// visitor explicitly opts into the immersive listening room (directive §4.E).
const AudioStudio3D = lazy(() =>
  import("@/visual-golden/components/audio/AudioStudio3D").then((module) => ({
    default: module.AudioStudio3D,
  })),
);

interface StreamReciter {
  id: number;
  name: string;
  reading: string;
  moshafId: number;
  surahTotal: number;
  streamUrl: string;
  attribution: "MP3Quran.net";
}

type ReciterState =
  | { state: "idle" | "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; items: StreamReciter[]; rightsUrl: string };

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

const STUDIO_SETTINGS_KEY = "audio-studio-settings-v1";
const STUDIO_RESUME_KEY = "audio-studio-resume-v1";

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Listening remains usable when storage is unavailable.
  }
}

/** Fail-closed listening preferences: volume, repeat, stable reciter identity. */
function readStudioSettings() {
  const settings = safeReadJson<{ volume?: number; repeat?: boolean; reciterKey?: string }>(STUDIO_SETTINGS_KEY, {});
  return {
    volume: Number.isFinite(settings.volume) ? Math.min(1, Math.max(0, settings.volume!)) : 0.78,
    repeat: settings.repeat === true,
    reciterKey: typeof settings.reciterKey === "string" ? settings.reciterKey : null,
  };
}

interface StudioResume {
  surah: number;
  reciterKey: string;
  position: number;
}

/**
 * Resume is only honored for the exact same surah AND reciter/reading — a
 * position from another recording is never applied to a different stream.
 */
function readStudioResume(): StudioResume | null {
  const saved = safeReadJson<Partial<StudioResume> | null>(STUDIO_RESUME_KEY, null);
  if (!saved) return null;
  if (!Number.isInteger(saved.surah) || saved.surah! < 1 || saved.surah! > 114) return null;
  if (typeof saved.reciterKey !== "string" || !/^\d+:\d+$/.test(saved.reciterKey)) return null;
  if (!Number.isFinite(saved.position) || saved.position! < 0) return null;
  return { surah: saved.surah!, reciterKey: saved.reciterKey, position: saved.position! };
}

export function AudioPage() {
  const initialResume = useMemo(readStudioResume, []);
  const initialSettings = useMemo(readStudioSettings, []);
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [active, setActive] = useState(() => {
    // Deep link ?surah= wins; otherwise resume the last listening session.
    try {
      const requested = Number(new URLSearchParams(window.location.search).get("surah"));
      if (Number.isInteger(requested) && requested >= 1 && requested <= 114) return requested;
    } catch {
      // URL parsing is a convenience; listening must still work.
    }
    return initialResume?.surah ?? 1;
  });
  const [reciters, setReciters] = useState<ReciterState>({ state: "idle" });
  const [selectedReciterId, setSelectedReciterId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(initialSettings.volume);
  const [repeat, setRepeat] = useState(initialSettings.repeat);
  const requestRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  // Stable provider identity ("id:moshafId") preferred across surahs/reloads,
  // honored only when that exact reciter/reading is available.
  const preferredReciterKey = useRef<string | null>(initialResume?.reciterKey ?? initialSettings.reciterKey);
  // One-shot resume: applied only when the saved surah+reciter stream loads.
  const pendingResume = useRef<StudioResume | null>(initialResume);
  // Natural-end continuation only; manual navigation always clears it.
  const autoAdvanceRef = useRef(false);
  const favorites = useInstitution((state) => state.favorites);
  const toggleFavorite = useInstitution((state) => state.toggleFavorite);

  // Immersive studio (opt-in). The real <audio> element and every player
  // control stay mounted while the scene is open — listening never stops or
  // restarts when entering/leaving the room; the scene only visualizes state.
  // Deep link /audio?studio=1 opens the studio directly (the unified station
  // log links straight into the immersive surface).
  const [studioOpen, setStudioOpen] = useState(
    () => new URLSearchParams(window.location.search).get("studio") === "1",
  );
  const [studioFailed, setStudioFailed] = useState(false);
  const [studioLamp, setStudioLamp] = useState(true);
  const studioScene = useMemo(() => getInteriorScene("audio-studio"), []);
  const studioAvailable = !!studioScene && !studioFailed;
  const showStudio = studioOpen && studioAvailable;
  // Reciters shown as catalog records in the studio overlay — the same real
  // governed MP3Quran response the full surface uses, never invented names.
  const studioReciters = reciters.state === "ready" ? reciters.items.slice(0, 8) : [];

  useEffect(() => {
    let cancelled = false;
    getQuranChapters()
      .then((items) => {
        if (!cancelled) setChapters(items);
      })
      .catch(() => {
        if (!cancelled) setChapters([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    setReciters({ state: "loading" });
    setSelectedReciterId(null);
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    fetch(apiUrl(`/api/content/audio/reciters?sura=${active}`), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => ({})) as { message?: string };
          throw new Error(body.message || `HTTP ${response.status}`);
        }
        return response.json() as Promise<{
          availability: string;
          rightsUrl: string;
          reciters: StreamReciter[];
        }>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const items = data.reciters.filter((item) => {
          try {
            const url = new URL(item.streamUrl);
            return url.protocol === "https:"
              && (url.hostname === "mp3quran.net" || url.hostname.endsWith(".mp3quran.net"));
          } catch {
            return false;
          }
        });
        setReciters({
          state: "ready",
          items,
          rightsUrl: data.rightsUrl,
        });
        const preferred = preferredReciterKey.current
          ? items.find((item) => `${item.id}:${item.moshafId}` === preferredReciterKey.current)
          : null;
        setSelectedReciterId((preferred ?? items[0])?.id ?? null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setReciters({
          state: "error",
          message: error instanceof Error ? error.message : "تعذر جلب التلاوات.",
        });
      });

    return () => controller.abort();
  }, [active]);

  const current = chapters.find((chapter) => chapter.number === active) ?? null;
  const selectedReciter = useMemo(() => {
    if (reciters.state !== "ready") return null;
    return reciters.items.find((item) => item.id === selectedReciterId) ?? reciters.items[0] ?? null;
  }, [reciters, selectedReciterId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.load();
    setPlaying(false);
    setStreamError(null);
    setCurrentTime(0);
    setDuration(0);
  }, [selectedReciter?.streamUrl]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    safeWriteJson(STUDIO_SETTINGS_KEY, {
      volume,
      repeat,
      reciterKey: selectedReciter
        ? `${selectedReciter.id}:${selectedReciter.moshafId}`
        : preferredReciterKey.current,
    });
  }, [volume, repeat, selectedReciter]);

  // Persist the listening position (throttled by timeupdate ~4Hz) so a
  // restart resumes the exact same surah + reciter + position.
  useEffect(() => {
    if (!selectedReciter || currentTime <= 0) return;
    safeWriteJson(STUDIO_RESUME_KEY, {
      surah: active,
      reciterKey: `${selectedReciter.id}:${selectedReciter.moshafId}`,
      position: currentTime,
    });
  }, [active, currentTime, selectedReciter]);

  // Apply the saved position once, only when the exact saved stream loads.
  const handleLoadedMetadata = (event: SyntheticEvent<HTMLAudioElement>) => {
    const audio = event.currentTarget;
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const resume = pendingResume.current;
    if (
      resume
      && selectedReciter
      && resume.surah === active
      && resume.reciterKey === `${selectedReciter.id}:${selectedReciter.moshafId}`
      && Number.isFinite(audio.duration)
      && audio.duration > 0
    ) {
      const target = Math.min(resume.position, Math.max(0, audio.duration - 1));
      audio.currentTime = target;
      setCurrentTime(target);
      pendingResume.current = null;
    }
  };

  // Natural-end continuation in canonical order with the same reciter
  // preference. Never auto-plays on manual navigation or initial load.
  useEffect(() => {
    if (!autoAdvanceRef.current) return;
    if (reciters.state === "error") {
      autoAdvanceRef.current = false;
      return;
    }
    if (reciters.state !== "ready" || !selectedReciter) return;
    autoAdvanceRef.current = false;
    const audio = audioRef.current;
    if (!audio) return;
    void audio.play().catch((error: unknown) => {
      if (isPlaybackAbortError(error)) return;
      handleStreamError();
    });
    // Intentionally keyed on the loaded stream only: play once per arrival.
  }, [selectedReciter?.streamUrl, reciters.state]);

  // Browser / OS media-session controls reflect the real governed stream.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !selectedReciter || !current) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `سورة ${current.arabicName}`,
        artist: `${selectedReciter.name} · ${selectedReciter.reading}`,
        album: "يا رسول الله ﷺ — تلاوات MP3Quran",
      });
      navigator.mediaSession.setActionHandler("play", () => { void audioRef.current?.play().catch(() => handleStreamError()); });
      navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
      navigator.mediaSession.setActionHandler("previoustrack", () => changeSurah(active - 1));
      navigator.mediaSession.setActionHandler("nexttrack", () => changeSurah(active + 1));
      navigator.mediaSession.setActionHandler("seekto", (details) => {
        const audio = audioRef.current;
        if (!audio || !Number.isFinite(audio.duration) || details.seekTime == null) return;
        audio.currentTime = Math.min(Math.max(0, details.seekTime), audio.duration);
        setCurrentTime(audio.currentTime);
      });
    } catch {
      // Media Session is progressive enhancement; the in-page player governs.
    }
  }, [selectedReciter?.streamUrl, current?.number]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = playing ? "playing" : "paused";
      if (Number.isFinite(duration) && duration > 0 && "setPositionState" in navigator.mediaSession) {
        navigator.mediaSession.setPositionState({
          duration,
          playbackRate: 1,
          position: Math.min(currentTime, duration),
        });
      }
    } catch {
      // Position state is best-effort; some browsers reject invalid values.
    }
  }, [playing, currentTime, duration]);

  useEffect(() => () => requestRef.current?.abort(), []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !selectedReciter) return;
    const source = audio.src;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      setStreamError(null);
      await audio.play();
      if (audio.src !== source) return;
      setPlaying(true);
    } catch (error) {
      if (audio.src !== source || isPlaybackAbortError(error)) return;
      setPlaying(false);
      setStreamError("تعذر تشغيل البث من MP3Quran لهذه السورة الآن.");
    }
  };

  const handleStreamError = () => {
    setPlaying(false);
    setStreamError("تعذر تشغيل البث من MP3Quran لهذه السورة الآن.");
  };

  const changeSurah = (next: number) => {
    if (next < 1 || next > 114) return;
    // Manual navigation cancels any pending auto-play intent.
    autoAdvanceRef.current = false;
    setActive(next);
  };

  const chooseReciter = (item: StreamReciter) => {
    preferredReciterKey.current = `${item.id}:${item.moshafId}`;
    autoAdvanceRef.current = false;
    setSelectedReciterId(item.id);
  };

  const handleEnded = () => {
    setPlaying(false);
    if (repeat) return;
    if (active < 114) {
      changeSurah(active + 1);
      // Arm AFTER changeSurah clears manual intent — natural end only.
      autoAdvanceRef.current = true;
    }
  };

  const favoriteId = selectedReciter
    ? `audio:${selectedReciter.id}:${selectedReciter.moshafId}:surah-${active}`
    : null;
  const isFavorite = favoriteId ? favorites.some((favorite) => favorite.id === favoriteId) : false;
  const toggleTrackFavorite = () => {
    if (!favoriteId || !selectedReciter || !current) return;
    toggleFavorite({
      id: favoriteId,
      title: `سورة ${current.arabicName} · ${selectedReciter.name}`,
      path: `/audio?surah=${active}`,
    });
  };

  return (
    <div className={styles.page}>
      {showStudio && studioScene ? (
        <Suspense fallback={<div className={styles.studioLoading} role="status">جارٍ تهيئة استوديو الاستماع ثلاثي الأبعاد…</div>}>
          <AudioStudio3D
            scene={studioScene}
            lampOn={studioLamp}
            playing={playing}
            onExit={() => setStudioOpen(false)}
            onUnavailable={() => {
              setStudioFailed(true);
              setStudioOpen(false);
            }}
            overlay={
              <div className={styles.studioCard} data-visual="audio-studio-player">
                <div className={styles.studioCardHead}>
                  <strong>{current ? `سورة ${current.arabicName}` : "التلاوات الصوتية"}</strong>
                  <span className={styles.studioReciterName}>
                    {selectedReciter
                      ? `${selectedReciter.name} · ${selectedReciter.reading}`
                      : reciters.state === "loading"
                        ? "جارٍ جلب القراء…"
                        : "لا توجد تلاوة متاحة الآن"}
                  </span>
                </div>

                <div className={styles.studioTransport}>
                  <button
                    type="button"
                    className={styles.studioPlay}
                    onClick={() => void togglePlay()}
                    disabled={!selectedReciter}
                    aria-label={playing ? "إيقاف التلاوة مؤقتًا" : "تشغيل التلاوة"}
                  >
                    {playing ? <Pause size={20} aria-hidden /> : <Play size={20} aria-hidden />}
                  </button>
                  <button type="button" className={styles.studioIcon} onClick={() => changeSurah(active - 1)} disabled={active <= 1} aria-label="السورة السابقة">
                    <SkipBack size={15} aria-hidden />
                  </button>
                  <button type="button" className={styles.studioIcon} onClick={() => changeSurah(active + 1)} disabled={active >= 114} aria-label="السورة التالية">
                    <SkipForward size={15} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={`${styles.studioIcon} ${repeat ? styles.studioToolOn : ""}`}
                    data-visual="studio-repeat"
                    aria-pressed={repeat}
                    onClick={() => setRepeat((value) => !value)}
                    aria-label={repeat ? "إلغاء تكرار السورة" : "تكرار السورة الحالية"}
                  >
                    <Repeat size={15} aria-hidden />
                  </button>
                  <button
                    type="button"
                    className={`${styles.studioIcon} ${isFavorite ? styles.studioToolOn : ""}`}
                    data-visual="studio-favorite"
                    aria-pressed={isFavorite}
                    disabled={!selectedReciter}
                    onClick={toggleTrackFavorite}
                    aria-label={isFavorite ? "إزالة التلاوة من المفضلة" : "حفظ التلاوة في المفضلة"}
                  >
                    <Heart size={15} fill={isFavorite ? "currentColor" : "none"} aria-hidden />
                  </button>
                </div>

                <div className={styles.studioProgress}>
                  <span>{formatTime(currentTime)}</span>
                  <input
                    className={styles.seek}
                    type="range"
                    min={0}
                    max={Number.isFinite(duration) && duration > 0 ? duration : 1}
                    step={1}
                    value={Math.min(currentTime, Number.isFinite(duration) && duration > 0 ? duration : 1)}
                    disabled={!duration}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      if (audioRef.current) audioRef.current.currentTime = next;
                      setCurrentTime(next);
                    }}
                    aria-label="موضع التلاوة"
                  />
                  <span>{formatTime(duration)}</span>
                </div>

                <label className={styles.studioVolume}>
                  <Volume2 size={14} aria-hidden />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setVolume(next);
                      if (audioRef.current) audioRef.current.volume = next;
                    }}
                    aria-label="مستوى الصوت"
                  />
                </label>

                {streamError ? <span role="alert" className={styles.streamError}>{streamError}</span> : null}

                <div className={styles.studioCatalog} role="tablist" aria-label="فهرس القراء">
                  {studioReciters.map((item) => (
                    <button
                      key={`${item.id}-${item.moshafId}`}
                      type="button"
                      role="tab"
                      aria-selected={item.id === selectedReciter?.id && item.moshafId === selectedReciter.moshafId}
                      className={item.id === selectedReciter?.id && item.moshafId === selectedReciter.moshafId ? styles.studioReciterOn : ""}
                      onClick={() => chooseReciter(item)}
                    >
                      <Headphones size={13} aria-hidden />
                      <span><strong>{item.name}</strong><small>{item.reading}</small></span>
                    </button>
                  ))}
                  {reciters.state === "ready" && !studioReciters.length ? (
                    <span className={styles.studioMeta}>لا توجد تلاوة في استجابة المزوّد لهذه السورة الآن.</span>
                  ) : null}
                </div>

                <div className={styles.studioCardTools}>
                  <button
                    type="button"
                    className={studioLamp ? styles.studioToolOn : ""}
                    onClick={() => setStudioLamp((value) => !value)}
                  >
                    <Lamp size={13} aria-hidden /> {studioLamp ? "إطفاء المصباح" : "إضاءة المصباح"}
                  </button>
                  <button type="button" onClick={() => setStudioOpen(false)}>
                    الواجهة الكاملة والفهرس
                  </button>
                </div>

                <p className={styles.studioBoundary}>
                  البث مباشر من خوادم MP3Quran.net داخل المشغل — لا أصوات مولدة ولا صور قراء مختلقة.
                  شريط الصوت في المشهد يتحرك فقط أثناء التشغيل الحقيقي، والموضع أعلاه هو موضع الوسائط الفعلي.
                </p>
              </div>
            }
          />
        </Suspense>
      ) : null}

      {studioAvailable && !showStudio ? (
        <button
          type="button"
          className={styles.studioEnter}
          data-visual="audio-studio-enter"
          onClick={() => setStudioOpen(true)}
        >
          <Headphones size={15} aria-hidden />
          ادخل استوديو الاستماع ثلاثي الأبعاد — رحل وسماعات وبث حقيقي
        </button>
      ) : null}

      <header className={`${styles.hero} ${showStudio ? styles.studioHidden : ""}`} data-visual="audio-hero" aria-labelledby="audio-hero-title">
        <img className={styles.heroPlate} src={worldPlateForWing("audio").plate} alt="" aria-hidden="true" />
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={styles.heroCopy}>
          <p className={styles.heroKicker}>
            <Sparkles size={15} aria-hidden="true" /> عالم الصوت والتلاوات
          </p>
          <h1 id="audio-hero-title" className={styles.heroTitle}>عالم من التلاوة والصوت</h1>
          <p className={styles.heroLead}>
            مسرح استماع مباشر داخل المنصة: تلاوة حقيقية من MP3Quran، وقراءات حقيقية، وموضع استماع يُحفظ ويُستأنف عند العودة، واستوديو listening ثلاثي الأبعاد اختياري — بلا أصوات مولدة ولا صور قراء مختلقة.
          </p>
          <ul className={styles.heroServices} data-visual="audio-hero-services">
            <li><Headphones size={14} aria-hidden="true" /> قارئ مباشرة من MP3Quran</li>
            <li><BookOpen size={14} aria-hidden="true" /> {chapters.length} سورة من المصحف الموثق</li>
            <li><ScrollText size={14} aria-hidden="true" /> الموضع يُحفظ ويُستأنف عند العودة</li>
            <li><Target size={14} aria-hidden="true" /> استوديو listening ثلاثي الأبعاد (اختياري)</li>
          </ul>
          <div className={styles.heroCtas}>
            <button
              type="button"
              className={styles.heroPrimary}
              disabled={!studioAvailable}
              onClick={() => setStudioOpen(true)}
              aria-label={studioAvailable ? "دخول استوديو الاستماع ثلاثي الأبعاد" : "الاستوديو غير متاح على هذا الجهاز"}
            >
              {studioAvailable ? <Target size={15} aria-hidden="true" /> : null} دخول الاستوديو
            </button>
            <button
              type="button"
              className={styles.heroGhost}
              onClick={() => document.getElementById("audio-player")?.scrollIntoView({ behavior: "smooth" })}
            >
              <ScrollText size={15} aria-hidden="true" /> افتح المشغل الكامل
            </button>
          </div>
        </div>
        <div className={styles.heroLedger}>
          <dl className={styles.heroStats} aria-label="إحصاءات سطح الصوت المسجلة">
            <div>
              <dt>سورًا مسجلة</dt>
              <dd>{chapters.length}</dd>
            </div>
            <div>
              <dt>مزوّد تشغيل مُجاز</dt>
              <dd>{AUDIO_COUNTS.streamingProviders}</dd>
            </div>
            <div>
              <dt>قراءات مباشرة</dt>
              <dd>{reciters.state === "ready" ? reciters.items.length : 0}</dd>
            </div>
            <div>
              <dt>استوديو ثلاثي الأبعاد</dt>
              <dd>{studioAvailable ? "متاح" : "غير متاح"}</dd>
            </div>
          </dl>
          <p className={styles.heroNote}>
            الأعداد من فهرس السور المحلي ومن استجابة المزوّع الفعلية — لا من أرقام طموحة في المرجع.
            البث من خوادم MP3Quran.net فقط؛ لا إعادة استضافة ولا أصوات اصطناعية.
          </p>
        </div>
        <div className={styles.nowPlaying}>
          <div className={`${styles.coverWrap} ${playing ? styles.coverPlaying : ""}`} aria-hidden="true">
            <img className={styles.cover} src={art.mushaf} alt="" />
          </div>
          <div>
            <span className={styles.label}>مسرح الاستماع · تلاوة داخل المنصة</span>
            <h2 className={styles.nowTitle}>{current ? `سورة ${current.arabicName}` : "التلاوات الصوتية"}</h2>
            <p>
              {selectedReciter
                ? `${selectedReciter.name} · ${selectedReciter.reading}`
                : current
                  ? `${current.englishName} · ${current.ayahCount} آية`
                  : "جارٍ تحميل فهرس السور…"}
            </p>
            <p className={styles.sourceNote}>
              <ShieldCheck size={14} aria-hidden="true" />
              البث مباشر من خوادم MP3Quran.net داخل المشغل. لا نعيد استضافة التسجيل ولا ننسب صوتًا مصطنعًا لقارئ.
            </p>
            <div className={styles.tags}>
              <span>MP3Quran API v3</span>
              <span>{AUDIO_COUNTS.streamingProviders} مزوّد تشغيل مُجاز</span>
            </div>
          </div>
        </div>

        <aside className={styles.playlist}>
          <h3>السور ({chapters.length || 114})</h3>
          <ul>
            {(chapters.length ? chapters : Array.from({ length: 114 }, (_, index) => ({
              number: index + 1,
              arabicName: String(index + 1),
              englishName: "",
              ayahCount: 0,
            } as QuranChapter))).map((chapter) => (
              <li key={chapter.number}>
                <button
                  type="button"
                  className={`${styles.track} ${chapter.number === active ? styles.activeTrack : ""}`}
                  aria-current={chapter.number === active ? "true" : undefined}
                  onClick={() => changeSurah(chapter.number)}
                >
                  <span>{chapter.number}</span>
                  <div>
                    <strong>{chapter.arabicName.startsWith("سورة") ? chapter.arabicName : `سورة ${chapter.arabicName}`}</strong>
                    <em>{chapter.englishName || "اختر للاستماع"}</em>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div id="audio-player" className={styles.player} data-visual="audio-player">
          <audio
            ref={audioRef}
            src={selectedReciter?.streamUrl}
            preload="metadata"
            loop={repeat}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onLoadedMetadata={handleLoadedMetadata}
            onPause={() => setPlaying(false)}
            onPlay={() => { setPlaying(true); setStreamError(null); }}
            onEnded={handleEnded}
            onError={handleStreamError}
          />

          <button
            type="button"
            className={styles.playBtn}
            onClick={() => void togglePlay()}
            disabled={!selectedReciter}
            aria-label={playing ? "إيقاف التلاوة مؤقتًا" : "تشغيل التلاوة"}
          >
            {playing ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button type="button" className={styles.playerIconButton} onClick={() => changeSurah(active - 1)} disabled={active <= 1} aria-label="السورة السابقة">
            <SkipBack size={18} />
          </button>

          <button
            type="button"
            className={`${styles.playerIconButton} ${repeat ? styles.playerIconButtonOn : ""}`}
            data-visual="audio-repeat"
            aria-pressed={repeat}
            onClick={() => setRepeat((value) => !value)}
            aria-label={repeat ? "إلغاء تكرار السورة" : "تكرار السورة الحالية"}
            title={repeat ? "تكرار السورة الحالية مفعّل" : "تكرار السورة الحالية"}
          >
            <Repeat size={17} />
          </button>

          <button
            type="button"
            className={`${styles.playerIconButton} ${isFavorite ? styles.playerIconButtonOn : ""}`}
            data-visual="audio-favorite"
            aria-pressed={isFavorite}
            disabled={!selectedReciter}
            onClick={toggleTrackFavorite}
            aria-label={isFavorite ? "إزالة التلاوة من المفضلة" : "حفظ التلاوة في المفضلة"}
            title={isFavorite ? "محفوظة في المفضلة" : "حفظ في المفضلة"}
          >
            <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
          </button>

          <div className={styles.playerCenter}>
            <div className={styles.progress}>
              <span>{formatTime(currentTime)}</span>
              <input
                className={styles.seek}
                type="range"
                min={0}
                max={Number.isFinite(duration) && duration > 0 ? duration : 1}
                step={1}
                value={Math.min(currentTime, Number.isFinite(duration) && duration > 0 ? duration : 1)}
                disabled={!duration}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (audioRef.current) audioRef.current.currentTime = next;
                  setCurrentTime(next);
                }}
                aria-label="موضع التلاوة"
              />
              <span>{formatTime(duration)}</span>
            </div>
            <strong>{selectedReciter?.name ?? (reciters.state === "loading" ? "جارٍ جلب القراء…" : "لا توجد تلاوة متاحة")}</strong>
            {streamError ? <span role="alert" className={styles.streamError}>{streamError}</span> : null}
            <span className={styles.resumeNote}>
              يُحفظ موضع الاستماع محليًا ويُستأنف عند العودة لنفس السورة والقارئ. عند انتهاء السورة تُتلى التالية تلقائيًا ما لم يكن التكرار مفعّلًا — لا تشغيل تلقائي عند التصفح اليدوي.
            </span>
          </div>

          <button type="button" className={styles.playerIconButton} onClick={() => changeSurah(active + 1)} disabled={active >= 114} aria-label="السورة التالية">
            <SkipForward size={18} />
          </button>

          <label className={styles.volume}>
            <Volume2 size={16} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => {
                const next = Number(event.target.value);
                setVolume(next);
                if (audioRef.current) audioRef.current.volume = next;
              }}
              aria-label="مستوى الصوت"
            />
          </label>
        </div>
      </header>

      <div className={showStudio ? styles.studioHidden : undefined}>
      <section className={styles.pad} aria-label="اختيار القارئ">
        <div className={styles.reciterDiscovery}>
          <div>
            <SectionHead title="اختر القارئ والرواية" en="Live reciters from MP3Quran" />
            <p>
              القائمة تأتي من API الرسمي للسورة المختارة. اختيار القارئ يغيّر مصدر الصوت داخل نفس المشغل،
              ولا يخرج الزائر من المؤسسة.
            </p>
          </div>

          {reciters.state === "loading" ? <p role="status">جارٍ تحميل القراء المتاحين لهذه السورة…</p> : null}
          {reciters.state === "error" ? <p role="alert">{reciters.message}</p> : null}
          {reciters.state === "ready" && !reciters.items.length ? <p role="status">لا توجد تلاوة في استجابة المزوّد لهذه السورة الآن.</p> : null}

          {reciters.state === "ready" && reciters.items.length ? (
            <div className={styles.streamReciters}>
              {reciters.items.map((item) => (
                <button
                  key={`${item.id}-${item.moshafId}`}
                  type="button"
                  className={item.id === selectedReciter?.id && item.moshafId === selectedReciter.moshafId ? styles.streamReciterOn : ""}
                  onClick={() => chooseReciter(item)}
                >
                  <Headphones size={16} aria-hidden="true" />
                  <span><strong>{item.name}</strong><small>{item.reading}</small></span>
                </button>
              ))}
            </div>
          ) : null}

          {reciters.state === "ready" ? (
            <small className={styles.rightsLine}>
              <ShieldCheck size={13} />
              مصدر الصوت: MP3Quran.net · التشغيل من رابط المزوّد مباشرة ·
              <a href={reciters.rightsUrl} target="_blank" rel="noopener noreferrer"> سياسة الاستخدام <ExternalLink size={12} /></a>
            </small>
          ) : null}
        </div>
      </section>

      <section className={styles.pad}>
        <SectionHead title="سجل المزوّدين الصوتيين" en="Provider governance" />
        <div className={`${styles.reciters} stagger`}>
          {AUDIO_PROVIDERS.map((provider) => (
            <article key={provider.providerId} className={styles.reciter}>
              <div style={{ padding: "0.7rem", textAlign: "start" }}>
                <strong style={{ display: "block", fontSize: "0.92rem" }}>{provider.provider}</strong>
                <span style={{ fontSize: "0.75rem", display: "flex", gap: 4, alignItems: "center" }}>
                  <ShieldCheck size={12} /> {rightsLabel(provider.rightsState)}
                </span>
                <span style={{ fontSize: "0.72rem", opacity: 0.85 }}>{provider.productionUse}</span>
                <a href={provider.canonicalUrl} target="_blank" rel="noreferrer" className={styles.providerLink} style={{ fontSize: "0.72rem", color: "var(--gold-300)", marginTop: 6 }}>
                  التوثيق فقط <ExternalLink size={12} />
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className={styles.lower}>
        <section className={styles.box}>
          <SectionHead title="الاستماع داخل المؤسسة" en="Internal listening" />
          <p className="muted" style={{ fontSize: "0.82rem", lineHeight: 1.9 }}>
            زر التشغيل الحقيقي موجود هنا. الملف يبقى على خادم المزوّد، والمستخدم يستمع إليه داخل
            واجهة «يا رسول الله ﷺ» بدل تحويله إلى موقع آخر.
          </p>
        </section>
        <section className={styles.box}>
          <SectionHead title="النص العربي الموثق" en="Verified Arabic text" />
          <p className="muted" style={{ fontSize: "0.82rem", lineHeight: 1.9 }}>
            النص العربي الكامل متاح في <Link href="/quran" className={styles.textLink}>رواق القرآن</Link> من أصل Tanzil المثبت،
            والصوت مستقل عنه ولا يغيّر النص القرآني.
          </p>
        </section>
        <section className={styles.box}>
          <SectionHead title="حدود الأمانة" en="Integrity boundary" />
          <p className="muted" style={{ fontSize: "0.82rem", lineHeight: 1.9 }}>
            لا أصوات مولدة، لا مدد مختلقة، ولا تنزيلات وهمية. اسم القارئ والرواية ورابط التسجيل
            مصدرها استجابة MP3Quran الرسمية لكل سورة.
          </p>
        </section>
      </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Info, Radio, Tv } from "lucide-react";
import { KIDS_TOPIC_LABELS, KIDS_VIDEO_CATALOG, buildKidsVideoRows } from "@/visual-golden/services/kids-media/catalog";
import { DISCOVERED_KIDS_VIDEOS } from "@/visual-golden/data/kids-youtube-discovered.generated";
import { getContinueWatchingIds, readKidsProgress, writeKidsProgress } from "@/visual-golden/services/kids-media/progress";
import type {
  KidsPlayerHandle,
  KidsPlayerState,
  KidsTVState,
  KidsVideo,
  KidsVideoTopic,
} from "@/visual-golden/services/kids-media/types";
import { KidsCurtains } from "./KidsCurtains";
import { KidsLibraryToolbar } from "./KidsLibraryToolbar";
import { KidsRemote, type KidsRemoteCommand } from "./KidsRemote";
import { KidsVideoRow } from "./KidsVideoRow";
import { YouTubePlayer } from "./providers/YouTubePlayer";
import styles from "./KidsTVRoom.module.css";

type Props = {
  videos?: KidsVideo[];
  onReadStory?: () => void;
};

const PLAYER_ACTIVE_STATES: KidsTVState[] = ["playing", "paused", "loading", "ended"];

export function KidsTVRoom({ videos = KIDS_VIDEO_CATALOG, onReadStory }: Props) {
  const playable = useMemo(() => videos.filter((video) => video.embeddable), [videos]);
  // The catalogue is empty until an episode clears content, depiction, age and
  // rights review, so the transport is offered honestly: disabled, with a
  // reason, rather than enabled and inert.
  const nothingPlayable = playable.length === 0;
  const transportReason = "لا توجد حلقة معتمدة للتشغيل بعد";
  const [currentId, setCurrentId] = useState(playable[0]?.id ?? "");
  const current = playable.find((video) => video.id === currentId) ?? playable[0];
  const [tvState, setTvState] = useState<KidsTVState>("idle");
  const [playerState, setPlayerState] = useState<KidsPlayerState>("idle");
  const [volume, setVolume] = useState(72);
  const [muted, setMuted] = useState(false);
  const [captions, setCaptions] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [mobileRemote, setMobileRemote] = useState(false);
  const [progressRevision, setProgressRevision] = useState(0);
  const [friendlyError, setFriendlyError] = useState("");
  const [libraryQuery, setLibraryQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState<KidsVideoTopic | "all">("all");

  const playerRef = useRef<KidsPlayerHandle>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<KidsVideo | undefined>(current);
  const playerReadyRef = useRef(false);
  const pendingPlayRef = useRef(false);
  const hasStartedRef = useRef(false);
  const failedIdsRef = useRef(new Set<string>());
  const transitionTimerRef = useRef<number | null>(null);
  const resumeAppliedRef = useRef<string | null>(null);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const clearTimers = useCallback(() => {
    if (transitionTimerRef.current !== null) window.clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const persistProgress = useCallback((completed = false) => {
    const video = currentRef.current;
    const player = playerRef.current;
    if (!video || !player) return;

    const currentTime = Math.max(0, player.getCurrentTime());
    const duration = Math.max(0, player.getDuration());
    if (!duration && !currentTime) return;

    writeKidsProgress({
      videoId: video.id,
      currentTime,
      duration,
      completed: completed || (duration > 0 && currentTime / duration >= 0.92),
      lastWatchedAt: new Date().toISOString(),
    });
    setProgressRevision((value) => value + 1);
  }, []);

  const switchTo = useCallback((video: KidsVideo, autoplay: boolean) => {
    clearTimers();
    setAutoplayBlocked(false);
    setFriendlyError("");
    resumeAppliedRef.current = null;
    persistProgress(false);

    setCurrentId(video.id);
    currentRef.current = video;

    if (!hasStartedRef.current || !autoplay) {
      setTvState("selected");
      playerRef.current?.load(video.providerVideoId, false);
      return;
    }

    setTvState("loading");
    if (playerReadyRef.current) {
      playerRef.current?.load(video.providerVideoId, true);
    } else {
      pendingPlayRef.current = true;
    }
  }, [clearTimers, persistProgress]);

  const changeBy = useCallback((direction: 1 | -1, autoplay = false) => {
    const active = currentRef.current;
    if (!active || playable.length < 2) return;

    const index = Math.max(0, playable.findIndex((video) => video.id === active.id));
    for (let step = 1; step <= playable.length; step += 1) {
      const candidate = playable[(index + direction * step + playable.length) % playable.length];
      if (!failedIdsRef.current.has(candidate.id)) {
        switchTo(candidate, autoplay);
        return;
      }
    }
  }, [playable, switchTo]);

  const openAndPlay = useCallback(() => {
    const video = currentRef.current;
    if (!video) return;
    hasStartedRef.current = true;
    setFriendlyError("");
    setAutoplayBlocked(false);
    setTvState("curtain-opening");

    transitionTimerRef.current = window.setTimeout(() => {
      setTvState("loading");
      if (playerReadyRef.current) {
        playerRef.current?.load(video.providerVideoId, true);
      } else {
        pendingPlayRef.current = true;
      }
    }, 720);
  }, []);

  const handlePlayerState = useCallback((next: KidsPlayerState) => {
    setPlayerState(next);

    if (next === "ready") {
      playerReadyRef.current = true;
      if (pendingPlayRef.current && currentRef.current) {
        pendingPlayRef.current = false;
        playerRef.current?.load(currentRef.current.providerVideoId, true);
      }
      return;
    }

    if (next === "playing") {
      const video = currentRef.current;
      if (video && resumeAppliedRef.current !== video.id) {
        const saved = readKidsProgress()[video.id];
        if (saved && !saved.completed && saved.currentTime > 5) {
          const now = playerRef.current?.getCurrentTime() ?? 0;
          playerRef.current?.seekBy(Math.max(0, saved.currentTime - now));
        }
        resumeAppliedRef.current = video.id;
      }

      clearTimers();
      setTvState("playing");
      return;
    }

    if (next === "paused") {
      persistProgress(false);
      setTvState("paused");
      return;
    }

    if (next === "buffering") {
      setTvState("loading");
      return;
    }

    if (next === "ended") {
      persistProgress(true);
      setTvState("ended");
    }
  }, [clearTimers, persistProgress]);

  const handlePlayerError = useCallback((code?: number) => {
    const video = currentRef.current;
    if (video) failedIdsRef.current.add(video.id);
    clearTimers();
    setPlayerState("error");
    setTvState("error");
    setFriendlyError("هذه الحلقة غير متاحة الآن");
    console.warn("[kids-tv] provider playback error", { videoId: video?.id, code });
  }, [clearTimers]);

  const handleAutoplayBlocked = useCallback(() => {
    setAutoplayBlocked(true);
    setTvState("paused");
  }, []);

  useEffect(() => {
    if (playerState !== "playing") return;
    const timer = window.setInterval(() => persistProgress(false), 5000);
    return () => window.clearInterval(timer);
  }, [persistProgress, playerState]);

  const toggleFullscreen = useCallback(async () => {
    if (!screenRef.current) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await screenRef.current.requestFullscreen();
    } catch (error) {
      console.warn("[kids-tv] fullscreen unavailable", error);
    }
  }, []);

  const closePlayback = useCallback(() => {
    clearTimers();
    persistProgress(false);
    playerRef.current?.pause();
    setTvState("curtain-closing");
    transitionTimerRef.current = window.setTimeout(() => {
      hasStartedRef.current = false;
      setTvState("selected");
    }, 320);
  }, [clearTimers, persistProgress]);

  const handleCommand = useCallback((command: KidsRemoteCommand) => {
    switch (command) {
      case "power":
        if (hasStartedRef.current && ["playing", "paused", "loading", "ended"].includes(tvState)) closePlayback();
        else openAndPlay();
        break;
      case "ok":
        openAndPlay();
        break;
      case "play-pause":
        if (!hasStartedRef.current || tvState === "selected" || tvState === "idle" || tvState === "error") {
          openAndPlay();
        } else if (playerState === "playing") {
          playerRef.current?.pause();
        } else {
          playerRef.current?.play();
        }
        break;
      case "previous":
      case "channel-down":
        changeBy(-1, hasStartedRef.current);
        break;
      case "next":
      case "channel-up":
        changeBy(1, hasStartedRef.current);
        break;
      case "left":
        playerRef.current?.seekBy(-10);
        break;
      case "right":
        playerRef.current?.seekBy(10);
        break;
      case "up":
      case "volume-up": {
        const next = Math.min(100, volume + 10);
        setVolume(next);
        setMuted(false);
        playerRef.current?.unmute();
        playerRef.current?.setVolume(next);
        break;
      }
      case "down":
      case "volume-down": {
        const next = Math.max(0, volume - 10);
        setVolume(next);
        playerRef.current?.setVolume(next);
        break;
      }
      case "mute":
        setMuted((wasMuted) => {
          if (wasMuted) playerRef.current?.unmute();
          else playerRef.current?.mute();
          return !wasMuted;
        });
        break;
      case "captions":
        setCaptions((enabled) => {
          playerRef.current?.toggleCaptions(!enabled);
          return !enabled;
        });
        break;
      case "fullscreen":
        void toggleFullscreen();
        break;
      case "back":
        if (document.fullscreenElement) void document.exitFullscreen();
        else closePlayback();
        break;
      case "home":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
    }
  }, [changeBy, closePlayback, openAndPlay, playerState, toggleFullscreen, tvState, volume]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      if (target?.closest("[data-video-card]") && ["ArrowLeft", "ArrowRight", "Enter", " "].includes(event.key)) return;
      if (target?.closest("button, a") && ["Enter", " "].includes(event.key)) return;

      const keyMap: Record<string, KidsRemoteCommand> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        Enter: "ok",
        " ": "play-pause",
        Escape: "back",
      };

      const command = keyMap[event.key];
      if (!command) return;
      event.preventDefault();
      handleCommand(command);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleCommand]);

  const availableTopics = useMemo(
    () => [...new Set(playable.map((video) => video.topic))],
    [playable],
  );

  const filteredVideos = useMemo(() => {
    const normalized = libraryQuery.trim().toLocaleLowerCase("ar");
    return playable.filter((video) => {
      if (activeTopic !== "all" && video.topic !== activeTopic) return false;
      if (!normalized) return true;
      const haystack = [
        video.titleAr,
        video.titleOriginal,
        video.description ?? "",
        video.series ?? "",
        video.publisherName,
        KIDS_TOPIC_LABELS[video.topic],
        ...video.tags,
      ]
        .join(" ")
        .toLocaleLowerCase("ar");
      return haystack.includes(normalized);
    });
  }, [activeTopic, libraryQuery, playable]);

  const baseRows = useMemo(() => buildKidsVideoRows(filteredVideos), [filteredVideos]);
  const continueWatching = useMemo(() => {
    const ids = getContinueWatchingIds();
    return ids
      .map((id) => playable.find((video) => video.id === id))
      .filter((video): video is KidsVideo => Boolean(video));
  }, [playable, progressRevision]);

  const watchNext = useMemo(() => {
    if (!current) return [];
    const sameTopic = filteredVideos.filter(
      (video) => video.id !== current.id && video.topic === current.topic,
    );
    const others = filteredVideos.filter(
      (video) => video.id !== current.id && video.topic !== current.topic,
    );
    return [...sameTopic, ...others].slice(0, 8);
  }, [current, filteredVideos]);

  if (!current) {
    return (
      <section className={styles.room} aria-labelledby="kids-tv-title">
        <div className={styles.ambient} aria-hidden="true" />
        <header className={styles.roomIntro}>
          <p><Radio size={16} aria-hidden="true" /> واحة الأطفال</p>
          <h2 id="kids-tv-title">مسرح النور</h2>
          <span>اختر الحلقة، اضغط OK، ثم شاهد داخل مشغّل يوتيوب دون تغطية.</span>
        </header>

        <div className={styles.stage}>
          <div className={styles.tvColumn}>
            <div className={styles.cabinet}>
              <div className={styles.bezel}>
                <div className={styles.screen} data-player-active="false">
                  <div className={styles.pendingScreen} role="status">
                    <strong>الحلقات المختارة قيد المراجعة والتحقق قبل النشر</strong>
                    <span>
                      لا توجد حلقات معتمدة للتشغيل في الفهرس الحالي. يعمل التشغيل العام
                      للحلقات المعتمدة فقط، وتبقى المواد المكتشفة قيد المراجعة الدينية
                      والتربوية والحقوقية قبل النشر.
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.tvBar}>
                <span className={styles.led} data-on={false} />
                <span>NOOR KIDS TV</span>
                <Tv size={15} aria-hidden="true" />
              </div>
              <div className={styles.stand} />
            </div>

            <KidsRemote
              compact
              playing={false}
              muted={muted}
              captions={captions}
              nothingPlayable={nothingPlayable}
              unavailableReason={transportReason}
              onCommand={handleCommand}
            />
          </div>

          <KidsRemote
            playing={false}
            muted={muted}
            captions={captions}
            nothingPlayable={nothingPlayable}
            unavailableReason={transportReason}
            onCommand={handleCommand}
          />
        </div>

        <div className={styles.library}>
          <div className={styles.reviewQueueHead} role="status">
            <div>
              <span>مكتبة الاستحواذ المرئي</span>
              <strong>{DISCOVERED_KIDS_VIDEOS.length} روابط فيديو مستعادة وقيد المراجعة</strong>
            </div>
            <p>
              الروابط التي جمعناها لم تعد مختفية. تظهر هنا داخل المؤسسة كعناصر مكتشفة،
              ولا يتحول أي عنصر إلى تشغيل عام حتى تنتهي مراجعة المحتوى والتصوير والعمر والحقوق.
            </p>
          </div>
          <div className={styles.pendingRail} aria-label="الفيديوهات المكتشفة قيد المراجعة">
            {DISCOVERED_KIDS_VIDEOS.map((video) => (
              <article key={video.id} className={styles.pendingCard}>
                <div className={styles.pendingThumb}>
                  <img src={video.thumbnailUrl} alt="" loading="lazy" />
                  <span>قيد المراجعة</span>
                </div>
                <div>
                  <strong>{video.titleAr}</strong>
                  <small>{video.publisherName}</small>
                  <p>{video.titleOriginal}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const playerViewportActive = hasStartedRef.current && PLAYER_ACTIVE_STATES.includes(tvState);
  const showPoster = !playerViewportActive && (tvState === "selected" || tvState === "idle" || tvState === "curtain-closing");
  const showCurtains = !playerViewportActive && (showPoster || tvState === "curtain-opening" || tvState === "curtain-closing");
  const curtainsOpen = tvState === "curtain-opening";
  const isPlaying = playerState === "playing";

  return (
    <section className={styles.room} aria-labelledby="kids-tv-title">
      <div className={styles.ambient} aria-hidden="true" />
      <header className={styles.roomIntro}>
        <p><Radio size={16} aria-hidden="true" /> واحة الأطفال</p>
        <h2 id="kids-tv-title">مسرح النور</h2>
        <span>اختر الحلقة، اضغط OK، ثم شاهد داخل مشغّل يوتيوب دون تغطية.</span>
      </header>

      <div className={styles.stage}>
        <div className={styles.tvColumn}>
          <div className={styles.cabinet}>
            <div className={styles.bezel}>
              <div
                className={styles.screen}
                ref={screenRef}
                data-player-active={playerViewportActive ? "true" : "false"}
              >
                <YouTubePlayer
                  ref={playerRef}
                  videoId={current.providerVideoId}
                  title={current.titleAr}
                  onStateChange={handlePlayerState}
                  onError={handlePlayerError}
                  onAutoplayBlocked={handleAutoplayBlocked}
                />

                {showPoster ? (
                  <button type="button" className={styles.posterButton} onClick={openAndPlay} aria-label={"تشغيل " + current.titleAr}>
                    <img src={current.thumbnailUrl} alt="" />
                    <span className={styles.posterShade} />
                    <span className={styles.posterPlay}>▶</span>
                  </button>
                ) : null}

                {showCurtains ? <KidsCurtains open={curtainsOpen} /> : null}

                {friendlyError ? (
                  <div className={styles.errorState} role="status">
                    <strong>{friendlyError}</strong>
                    <span>اختر حلقة أخرى من الرف عندما تكون جاهزًا. لن ننتقل تلقائيًا.</span>
                  </div>
                ) : null}
              </div>
            </div>
            <div className={styles.tvBar}>
              <span className={styles.led} data-on={isPlaying} />
              <span>NOOR KIDS TV</span>
              <Tv size={15} aria-hidden="true" />
            </div>
            <div className={styles.stand} />
          </div>

          <KidsRemote
            compact
            playing={isPlaying}
            muted={muted}
            captions={captions}
            nothingPlayable={nothingPlayable}
            unavailableReason={transportReason}
            onCommand={handleCommand}
          />

          <div className={styles.nowPlaying}>
            <div>
              <span>{tvState === "ended" ? "انتهت الحلقة" : "يعرض الآن"}</span>
              <h3>{current.titleAr}</h3>
              <p>{current.description}</p>
            </div>
            <div className={styles.infoActions}>
              {onReadStory ? (
                <button type="button" onClick={onReadStory}><BookOpen size={16} /> اقرأ قصة</button>
              ) : null}
              <a href={current.sourceUrl} target="_blank" rel="noopener noreferrer">
                <Info size={16} /> معلومات المصدر
              </a>
            </div>
          </div>

          {tvState === "ended" && watchNext.length ? (
            <div className={styles.nextChoices} role="region" aria-label="اختر الحلقة التالية">
              <p>اختر الحلقة التالية. لا يوجد تشغيل تلقائي.</p>
              <div>
                {watchNext.slice(0, 3).map((video) => (
                  <button key={video.id} type="button" onClick={() => switchTo(video, false)}>
                    {video.titleAr}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <KidsRemote
          playing={isPlaying}
          muted={muted}
          captions={captions}
          nothingPlayable={nothingPlayable}
          unavailableReason={transportReason}
          onCommand={handleCommand}
        />
      </div>

      <button type="button" className={styles.mobileRemoteButton} onClick={() => setMobileRemote(true)}>
        🎛 الريموت
      </button>

      {mobileRemote ? (
        <div className={styles.remoteSheetBackdrop} role="presentation" onClick={() => setMobileRemote(false)}>
          <div className={styles.remoteSheet} role="dialog" aria-label="ريموت مسرح النور" onClick={(event) => event.stopPropagation()}>
            <button type="button" className={styles.sheetClose} onClick={() => setMobileRemote(false)}>إغلاق</button>
            <KidsRemote
              playing={isPlaying}
              muted={muted}
              captions={captions}
              nothingPlayable={nothingPlayable}
              unavailableReason={transportReason}
              onCommand={handleCommand}
            />
          </div>
        </div>
      ) : null}

      <div className={styles.library}>
        <KidsLibraryToolbar
          query={libraryQuery}
          onQueryChange={setLibraryQuery}
          activeTopic={activeTopic}
          availableTopics={availableTopics}
          onTopicChange={setActiveTopic}
          resultCount={filteredVideos.length}
        />

        {continueWatching.length && !libraryQuery && activeTopic === "all" ? (
          <KidsVideoRow
            title="استمر في المشاهدة"
            videos={continueWatching}
            selectedId={current.id}
            onSelect={(video) => switchTo(video, false)}
          />
        ) : null}

        {watchNext.length ? (
          <KidsVideoRow
            title="شاهد التالي"
            videos={watchNext}
            selectedId={current.id}
            onSelect={(video) => switchTo(video, false)}
          />
        ) : null}

        {baseRows.map((row) => (
          <KidsVideoRow
            key={row.id}
            title={row.title}
            videos={row.videos}
            selectedId={current.id}
            onSelect={(video) => switchTo(video, false)}
          />
        ))}

        {!filteredVideos.length ? (
          <div className={styles.noResults} role="status">
            <strong>لم نجد حلقة مطابقة</strong>
            <span>جرّب كلمة أبسط أو اختر «الكل» من الموضوعات.</span>
            <button
              type="button"
              onClick={() => {
                setLibraryQuery("");
                setActiveTopic("all");
              }}
            >
              عرض كل الحلقات
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { KidsPlayerHandle, KidsPlayerState } from "@/visual-golden/services/kids-media/types";

type Props = {
  videoId: string;
  title: string;
  onStateChange: (state: KidsPlayerState) => void;
  onError: (code?: number) => void;
  onAutoplayBlocked: () => void;
};

type YoutubeWindow = Window & {
  YT?: any;
  onYouTubeIframeAPIReady?: () => void;
};

let youtubeApiPromise: Promise<any> | null = null;

function loadYoutubeApi(): Promise<any> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube player requires a browser."));
  }

  const target = window as YoutubeWindow;
  if (target.YT?.Player) return Promise.resolve(target.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReady = target.onYouTubeIframeAPIReady;
    target.onYouTubeIframeAPIReady = () => {
      previousReady?.();
      if (target.YT?.Player) resolve(target.YT);
      else reject(new Error("YouTube IFrame API loaded without Player."));
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    if (existing) {
      existing.addEventListener("error", () => reject(new Error("YouTube IFrame API failed to load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("YouTube IFrame API failed to load."));
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

function mapYoutubeState(code: number): KidsPlayerState {
  if (code === 0) return "ended";
  if (code === 1) return "playing";
  if (code === 2) return "paused";
  if (code === 3) return "buffering";
  if (code === 5) return "ready";
  return "idle";
}

export const YouTubePlayer = forwardRef<KidsPlayerHandle, Props>(function YouTubePlayer(
  { videoId, title, onStateChange, onError, onAutoplayBlocked },
  ref,
) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const volumeRef = useRef(72);

  useImperativeHandle(
    ref,
    () => ({
      load(nextVideoId, autoplay = false) {
        const player = playerRef.current;
        if (!player) return;
        if (autoplay) player.loadVideoById(nextVideoId);
        else player.cueVideoById(nextVideoId);
      },
      play() {
        playerRef.current?.playVideo?.();
      },
      pause() {
        playerRef.current?.pauseVideo?.();
      },
      seekBy(seconds) {
        const player = playerRef.current;
        if (!player?.getCurrentTime || !player?.seekTo) return;
        player.seekTo(Math.max(0, Number(player.getCurrentTime()) + seconds), true);
      },
      setVolume(volume) {
        const safe = Math.max(0, Math.min(100, volume));
        volumeRef.current = safe;
        playerRef.current?.setVolume?.(safe);
      },
      mute() {
        playerRef.current?.mute?.();
      },
      unmute() {
        playerRef.current?.unMute?.();
        playerRef.current?.setVolume?.(volumeRef.current);
      },
      toggleCaptions(enabled) {
        const player = playerRef.current;
        if (!player?.setOption) return;
        try {
          player.loadModule?.("captions");
          player.setOption("captions", "track", enabled ? { languageCode: "en" } : {});
        } catch {
          // Caption availability is provider/video dependent.
        }
      },
      getCurrentTime() {
        return Number(playerRef.current?.getCurrentTime?.() ?? 0);
      },
      getDuration() {
        return Number(playerRef.current?.getDuration?.() ?? 0);
      },
    }),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    loadYoutubeApi()
      .then((YT) => {
        if (cancelled || !hostRef.current) return;

        playerRef.current = new YT.Player(hostRef.current, {
          videoId,
          playerVars: {
            enablejsapi: 1,
            playsinline: 1,
            rel: 0,
            controls: 0,
            cc_load_policy: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              event.target?.setVolume?.(volumeRef.current);
              onStateChange("ready");
            },
            onStateChange: (event: any) => onStateChange(mapYoutubeState(Number(event.data))),
            onError: (event: any) => {
              onStateChange("error");
              onError(Number(event.data));
            },
            onAutoplayBlocked: () => onAutoplayBlocked(),
          },
        });
      })
      .catch(() => {
        onStateChange("error");
        onError();
      });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {
        // Nothing else should fail because provider cleanup failed.
      }
      playerRef.current = null;
    };
  }, [onAutoplayBlocked, onError, onStateChange, videoId]);

  return (
    <div
      ref={hostRef}
      aria-label={"مشغل الفيديو: " + title}
      style={{ width: "100%", height: "100%" }}
    />
  );
});

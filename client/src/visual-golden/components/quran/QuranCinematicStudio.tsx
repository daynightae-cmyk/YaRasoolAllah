import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { BookOpen, Maximize2, Sun } from "lucide-react";
import type { HallView } from "@/visual-golden/components/three/CinematicHall";
import styles from "./QuranCinematicStudio.module.css";

const CinematicHall = lazy(() => import("@/visual-golden/components/three/CinematicHall"));

interface StudioProps {
  verse: string | null;
  passage: string;
  onClose(): void;
  onAccessibleReading(): void;
  children: ReactNode;
  /** Actual playback position in seconds, from the governed audio element. */
  audioTime?: number;
  /** Actual playback duration in seconds, from the governed audio element. */
  audioDuration?: number;
  /** Whether recitation audio is currently playing. */
  audioPlaying?: boolean;
}

const views = [
  { id: "explore", title: "استكشف الاستوديو" },
  { id: "interactive", title: "القراءة والتلاوة" },
  { id: "cinema", title: "عرض سينمائي" },
] as const;

export function QuranCinematicStudio({ verse, passage, onClose, onAccessibleReading, children, audioTime, audioDuration, audioPlaying }: StudioProps) {
  const host = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const [view, setView] = useState<HallView>("interactive");
  const [illuminated, setIlluminated] = useState(true);
  const [fullscreenMessage, setFullscreenMessage] = useState("");

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
    host.current?.scrollIntoView({ block: "start" });
  }, []);

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.fullscreenElement && view !== "interactive") setView("interactive");
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [view]);

  const fullscreen = async () => {
    setFullscreenMessage("");
    try {
      if (document.fullscreenElement === host.current) await document.exitFullscreen();
      else if (host.current?.requestFullscreen) await host.current.requestFullscreen();
      else setFullscreenMessage("ملء الشاشة غير متاح في هذا المتصفح.");
    } catch {
      setFullscreenMessage("تعذر فتح ملء الشاشة في هذا المتصفح.");
    }
  };

  return (
    <section className={styles.studio} ref={host} data-visual="quran-cinematic-studio" data-view={view} aria-labelledby="quran-cinematic-title" dir="rtl">
      <Suspense fallback={null}>
        <CinematicHall room="quran" view={view} illuminated={illuminated} />
      </Suspense>
      <header className={styles.heading}>
        <h1 ref={title} tabIndex={-1} id="quran-cinematic-title">استوديو القرآن الكريم</h1>
        <p lang="en">Qur’an Studio</p>
      </header>
      <div className={styles.toolbar} role="group" aria-label="أوضاع استوديو القرآن">
        {views.map(({ id, title: label }) => <button key={id} type="button" aria-pressed={id === view} onClick={() => setView(id)}>{label}</button>)}
        <button type="button" aria-pressed={illuminated} onClick={() => setIlluminated((lit) => !lit)}><Sun size={16} aria-hidden="true" />إضاءة الاستوديو</button>
        <button type="button" onClick={() => void fullscreen()}><Maximize2 size={16} aria-hidden="true" />تبديل ملء الشاشة</button>
        <button type="button" onClick={onAccessibleReading}><BookOpen size={16} aria-hidden="true" />قراءة مركّزة</button>
        <button type="button" onClick={onClose}>العودة إلى رواق القرآن</button>
        <Link href="/">الرئيسية</Link>
      </div>
      {fullscreenMessage ? <p className={styles.status} role="status">{fullscreenMessage}</p> : null}
      {view !== "explore" ? (
        <div className={styles.display} aria-live="polite">
          <span>{passage}</span>
          {verse ? <p lang="ar">{verse}</p> : null}
        </div>
      ) : null}
      {audioDuration && audioDuration > 0 && audioTime != null ? (
        <div className={styles.audioProgress} role="group" aria-label="تقدّم التلاوة">
          <span className={styles.audioTime} id="quran-audio-time">
            {Math.floor(audioTime / 60)}:{String(Math.floor(audioTime % 60)).padStart(2, "0")}
          </span>
          <span className={styles.audioTime} id="quran-audio-duration">
            {Math.floor(audioDuration / 60)}:{String(Math.floor(audioDuration % 60)).padStart(2, "0")}
          </span>
          <div className={styles.audioBar}>
            <span className={styles.audioFill} style={{ width: `${Math.min(100, Math.max(0, ((audioTime ?? 0) / audioDuration) * 100))}%` }} aria-hidden="true" />
          </div>
          <span className={styles.audioState}>
            {audioPlaying ? "تُراد الآيات" : "مستعدة"}
          </span>
        </div>
      ) : null}
      {view === "interactive" ? <div className={styles.readingControls}>{children}</div> : null}
    </section>
  );
}

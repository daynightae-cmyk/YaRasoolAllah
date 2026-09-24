import { useEffect, useMemo, useRef, useState } from "react";
import { ExternalLink, Pause, Play, RotateCcw, RotateCw } from "lucide-react";
import type { AudiobookRecord } from "@shared/audiobook-registry";
import styles from "./ReadingChamber.module.css";

interface Props {
  audiobook: AudiobookRecord;
}

interface SavedProgress {
  chapterId: string;
  seconds: number;
  rate: number;
}

const PROGRESS_PREFIX = "library-audiobook-progress-v1:";

function readSaved(audiobookId: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(`${PROGRESS_PREFIX}${audiobookId}`);
    if (!raw) return null;
    const value = JSON.parse(raw) as SavedProgress;
    if (!value.chapterId || !Number.isFinite(value.seconds) || !Number.isFinite(value.rate)) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function AudiobookPlayer({ audiobook }: Props) {
  const saved = useMemo(() => readSaved(audiobook.audiobookId), [audiobook.audiobookId]);
  const initialIndex = Math.max(
    0,
    saved
      ? audiobook.chapters.findIndex((chapter) => chapter.chapterId === saved.chapterId)
      : 0,
  );
  const [chapterIndex, setChapterIndex] = useState(initialIndex);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(saved?.seconds ?? 0);
  const [duration, setDuration] = useState(0);
  const [rate, setRate] = useState(saved?.rate ?? 1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lastPersistedSecond = useRef(-1);

  const chapter = audiobook.chapters[chapterIndex];

  const persist = (seconds: number) => {
    try {
      localStorage.setItem(
        `${PROGRESS_PREFIX}${audiobook.audiobookId}`,
        JSON.stringify({ chapterId: chapter.chapterId, seconds, rate }),
      );
    } catch {
      // Local progress is a convenience only.
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
    setDuration(0);
    const chapterSaved = readSaved(audiobook.audiobookId);
    const restore =
      chapterSaved?.chapterId === chapter.chapterId ? Math.max(0, chapterSaved.seconds) : 0;
    setCurrentTime(restore);
    audio.load();
  }, [audiobook.audiobookId, chapter.chapterId, chapter.audioUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.playbackRate = rate;
  }, [rate]);

  useEffect(() => () => {
    const audio = audioRef.current;
    if (audio) persist(audio.currentTime);
  }, [chapter.chapterId, rate]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  };

  const seek = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.max(0, Math.min(seconds, Number.isFinite(audio.duration) ? audio.duration : seconds));
    audio.currentTime = next;
    setCurrentTime(next);
    persist(next);
  };

  const changeRate = (value: number) => {
    setRate(value);
    if (audioRef.current) audioRef.current.playbackRate = value;
    persist(audioRef.current?.currentTime ?? currentTime);
  };

  const selectChapter = (index: number) => {
    if (index < 0 || index >= audiobook.chapters.length) return;
    if (audioRef.current) persist(audioRef.current.currentTime);
    setChapterIndex(index);
  };

  return (
    <section className={styles.audiobookDesk} data-audiobook-player>
      <audio
        ref={audioRef}
        src={chapter.audioUrl}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onLoadedMetadata={(event) => {
          const audio = event.currentTarget;
          setDuration(audio.duration);
          const chapterSaved = readSaved(audiobook.audiobookId);
          if (chapterSaved?.chapterId === chapter.chapterId && chapterSaved.seconds > 0) {
            audio.currentTime = Math.min(chapterSaved.seconds, Math.max(0, audio.duration - 0.25));
            setCurrentTime(audio.currentTime);
          }
          audio.playbackRate = rate;
        }}
        onTimeUpdate={(event) => {
          const seconds = event.currentTarget.currentTime;
          setCurrentTime(seconds);
          const whole = Math.floor(seconds);
          if (whole !== lastPersistedSecond.current && whole % 2 === 0) {
            lastPersistedSecond.current = whole;
            persist(seconds);
          }
        }}
        onEnded={() => {
          persist(0);
          if (chapterIndex < audiobook.chapters.length - 1) setChapterIndex((value) => value + 1);
          else setPlaying(false);
        }}
      />

      <aside className={styles.audiobookChapters} aria-label="فصول الكتاب الصوتي">
        <strong>فصول التسجيل</strong>
        {audiobook.chapters.map((item, index) => (
          <button
            type="button"
            key={item.chapterId}
            className={index === chapterIndex ? styles.tocOn : ""}
            onClick={() => selectChapter(index)}
          >
            <span>{index + 1}. {item.title}</span>
            <small>{item.durationSeconds ? formatTime(item.durationSeconds) : "مدة من الملف"}</small>
          </button>
        ))}
      </aside>

      <div className={styles.audiobookBody}>
        <div className={styles.audiobookIdentity}>
          {audiobook.coverUrl ? <img src={audiobook.coverUrl} alt="" /> : null}
          <div>
            <span>AUDIOBOOK · تسجيل بشري موثق</span>
            <h3>{audiobook.title}</h3>
            <p>القارئ/الراوي: <strong>{chapter.narrator || audiobook.narrator}</strong></p>
          </div>
        </div>

        <div className={styles.audiobookNow}>
          <strong>{chapter.title}</strong>
          <span>{formatTime(currentTime)} / {formatTime(duration || chapter.durationSeconds || 0)}</span>
        </div>

        <input
          className={styles.audioSeek}
          type="range"
          min="0"
          max={Math.max(1, duration || chapter.durationSeconds || 1)}
          step="0.25"
          value={Math.min(currentTime, Math.max(1, duration || chapter.durationSeconds || 1))}
          onChange={(event) => seek(Number(event.target.value))}
          aria-label="موضع الاستماع"
        />

        <div className={styles.audioControls}>
          <button type="button" className="btn-outline" onClick={() => seek(currentTime - 15)}>
            <RotateCcw size={15} /> 15ث
          </button>
          <button type="button" className="btn-gold" onClick={toggle}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
            {playing ? "إيقاف مؤقت" : "تشغيل"}
          </button>
          <button type="button" className="btn-outline" onClick={() => seek(currentTime + 30)}>
            <RotateCw size={15} /> 30ث
          </button>
          <label>
            السرعة
            <select value={rate} onChange={(event) => changeRate(Number(event.target.value))}>
              {[0.75, 0.9, 1, 1.15, 1.25, 1.5, 1.75, 2].map((value) => (
                <option key={value} value={value}>{value}×</option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.audiobookRights}>
          <span><strong>المصدر:</strong> {audiobook.provider}</span>
          <span><strong>الحقوق:</strong> {audiobook.licenseName}</span>
          <span><strong>حفظ الموضع:</strong> محلي على هذا الجهاز</span>
          <span>
            <strong>مزامنة النص:</strong>{" "}
            {audiobook.synchronization.mode === "chapter_to_text_cursor" && audiobook.synchronization.verified
              ? "موثقة على مستوى الفصل"
              : "غير متاحة لهذا التسجيل"}
          </span>
          <a href={chapter.sourcePageUrl} target="_blank" rel="noreferrer">
            صفحة التسجيل <ExternalLink size={13} />
          </a>
          <a href={audiobook.rightsUrl} target="_blank" rel="noreferrer">
            حالة الحقوق <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ExternalLink,
  Headphones,
  Pause,
  Play,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import { art } from "@/visual-golden/mock/art";
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
import styles from "./AudioPage.module.css";

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

export function AudioPage() {
  const [chapters, setChapters] = useState<QuranChapter[]>([]);
  const [active, setActive] = useState(1);
  const [reciters, setReciters] = useState<ReciterState>({ state: "idle" });
  const [selectedReciterId, setSelectedReciterId] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.78);
  const requestRef = useRef<AbortController | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

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

    fetch(`/api/content/audio/reciters?sura=${active}`, { signal: controller.signal })
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
        setSelectedReciterId(items[0]?.id ?? null);
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
  }, [volume]);

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
    setActive(next);
  };

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <img className={styles.bg} src={art.kaaba} alt="" />
        <div className={styles.nowPlaying}>
          <div className={`${styles.coverWrap} ${playing ? styles.coverPlaying : ""}`} aria-hidden="true">
            <img className={styles.cover} src={art.mushaf} alt="" />
          </div>
          <div>
            <span className={styles.label}>مسرح الاستماع · تلاوة داخل المنصة</span>
            <h1>{current ? `سورة ${current.arabicName}` : "التلاوات الصوتية"}</h1>
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

        <div className={styles.player}>
          <audio
            ref={audioRef}
            src={selectedReciter?.streamUrl}
            preload="metadata"
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onPause={() => setPlaying(false)}
            onPlay={() => { setPlaying(true); setStreamError(null); }}
            onEnded={() => setPlaying(false)}
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
                  onClick={() => setSelectedReciterId(item.id)}
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
                <a href={provider.canonicalUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.72rem", color: "var(--gold-300)", marginTop: 6, display: "inline-flex", gap: 4, alignItems: "center" }}>
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
            النص العربي الكامل متاح في <Link href="/quran">رواق القرآن</Link> من أصل Tanzil المثبت،
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
  );
}

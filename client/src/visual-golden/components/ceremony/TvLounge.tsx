import { Play, Pause, Volume2 } from "lucide-react";
import styles from "./tv.module.css";

export interface StoryItem {
  title: string;
  en: string;
  age: string;
  img: string;
  summary?: string;
}

interface Props {
  stories: StoryItem[];
  current: StoryItem;
  playing: boolean;
  onPlay: () => void;
  onSelect: (story: StoryItem) => void;
}

export function TvLounge({ stories, current, playing, onPlay, onSelect }: Props) {
  return (
    <section className={styles.lounge} aria-label="مسرح القصص">
      <div className={styles.roomGlow} aria-hidden="true" />
      <header className={styles.intro}>
        <p className={styles.kicker}>واحة الأطفال</p>
        <h1>مسرح القصص العائلي</h1>
        <p>قيم تُضيء جيل المستقبل — قصص دافئة في إطار آمن وجميل</p>
      </header>

      <div className={styles.stage}>
        <div className={styles.cabinet}>
          <div className={styles.ornL} aria-hidden />
          <div className={styles.ornR} aria-hidden />
          <div className={styles.bezel}>
            <div className={styles.screen}>
              <img src={current.img} alt="" />
              <div className={styles.scan} aria-hidden />
              <div className={styles.vignette} aria-hidden />
              <button type="button" className={styles.play} onClick={onPlay} aria-label="فتح وضع القراءة">
                {playing ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <div className={styles.osd}>
                <span>{current.age} · وضع المعاينة والقراءة — لا يوجد فيديو معتمد</span>
                <strong>{current.title}</strong>
                <em>{current.en}</em>
              </div>
            </div>
          </div>
          <div className={styles.bar}>
            <span className={styles.led} data-on={playing} />
            <span>مسرح النور</span>
            <Volume2 size={14} />
          </div>
          <div className={styles.stand} />
        </div>
      </div>

      <div className={styles.channels} role="list">
        {stories.map((s) => (
          <button
            key={s.title}
            type="button"
            role="listitem"
            className={s.title === current.title ? styles.chOn : styles.ch}
            onClick={() => onSelect(s)}
          >
            <img src={s.img} alt="" />
            <span>
              <b>{s.title}</b>
              <small>{s.en}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

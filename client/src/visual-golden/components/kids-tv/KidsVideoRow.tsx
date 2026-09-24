import type { KeyboardEvent } from "react";
import type { KidsVideo } from "@/visual-golden/services/kids-media/types";
import styles from "./KidsTVRoom.module.css";

type Props = {
  title: string;
  videos: KidsVideo[];
  selectedId: string;
  onSelect: (video: KidsVideo) => void;
};

export function KidsVideoRow({ title, videos, selectedId, onSelect }: Props) {
  const onCardKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();

    const direction = event.key === "ArrowRight" ? -1 : 1;
    const nextIndex = (index + direction + videos.length) % videos.length;
    const row = event.currentTarget.parentElement;
    const buttons = row?.querySelectorAll<HTMLButtonElement>("button[data-video-card]");
    buttons?.[nextIndex]?.focus();
  };

  return (
    <section className={styles.videoRow} aria-label={title}>
      <div className={styles.rowHeading}>
        <h3>{title}</h3>
        <span>{videos.length} حلقات</span>
      </div>
      <div className={styles.videoRail} role="grid" aria-label={title}>
        {videos.map((video, index) => (
          <button
            key={video.id}
            type="button"
            role="gridcell"
            data-video-card
            className={video.id === selectedId ? styles.videoCardSelected : styles.videoCard}
            onClick={() => onSelect(video)}
            onKeyDown={(event) => onCardKeyDown(event, index)}
            aria-pressed={video.id === selectedId}
          >
            <span className={styles.videoThumb}>
              <img src={video.thumbnailUrl} alt="" loading="lazy" />
              {video.episode ? <b>الحلقة {video.episode}</b> : null}
            </span>
            <span className={styles.videoCardBody}>
              <strong>{video.titleAr}</strong>
              <small>{video.series ?? video.publisherName}</small>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

import { Search, SlidersHorizontal, X } from "lucide-react";
import { KIDS_TOPIC_LABELS } from "@/visual-golden/services/kids-media/catalog";
import type { KidsVideoTopic } from "@/visual-golden/services/kids-media/types";
import styles from "./KidsTVRoom.module.css";

type Props = {
  query: string;
  onQueryChange: (query: string) => void;
  activeTopic: KidsVideoTopic | "all";
  availableTopics: KidsVideoTopic[];
  onTopicChange: (topic: KidsVideoTopic | "all") => void;
  resultCount: number;
};

export function KidsLibraryToolbar({
  query,
  onQueryChange,
  activeTopic,
  availableTopics,
  onTopicChange,
  resultCount,
}: Props) {
  return (
    <section className={styles.libraryToolbar} aria-label="البحث وتصفية مكتبة الأطفال">
      <div className={styles.libraryToolbarHead}>
        <div>
          <span><SlidersHorizontal size={15} aria-hidden="true" /> مكتبة مسرح النور</span>
          <h3>اختر ما يناسب وقت الحكاية</h3>
        </div>
        <b>{resultCount} نتيجة</b>
      </div>

      <label className={styles.librarySearch}>
        <Search size={17} aria-hidden="true" />
        <span className={styles.srOnly}>ابحث في مكتبة الأطفال</span>
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="ابحث: السيرة، الصدق، قصص الأنبياء..."
        />
        {query ? (
          <button type="button" onClick={() => onQueryChange("")} aria-label="مسح البحث">
            <X size={16} />
          </button>
        ) : null}
      </label>

      <div className={styles.topicChips} role="group" aria-label="تصفية حسب الموضوع">
        <button
          type="button"
          data-active={activeTopic === "all"}
          aria-pressed={activeTopic === "all"}
          onClick={() => onTopicChange("all")}
        >
          الكل
        </button>
        {availableTopics.map((topic) => (
          <button
            key={topic}
            type="button"
            data-active={activeTopic === topic}
            aria-pressed={activeTopic === topic}
            onClick={() => onTopicChange(topic)}
          >
            {KIDS_TOPIC_LABELS[topic]}
          </button>
        ))}
      </div>
    </section>
  );
}

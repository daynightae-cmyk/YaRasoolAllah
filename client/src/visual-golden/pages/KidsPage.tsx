import { useState } from "react";
import { Puzzle, Palette, Lightbulb, Star, BookOpen, Users, FileText } from "lucide-react";
import { art } from "@/visual-golden/mock/art";
import { SectionHead } from "@/visual-golden/components/shared/SectionHead";
import { ColoringStudio } from "@/visual-golden/components/unique/ColoringStudio";
import { StoryTheatre } from "@/visual-golden/components/present/StoryTheatre";
import { TvLounge, type StoryItem } from "@/visual-golden/components/ceremony/TvLounge";
import styles from "./KidsPage.module.css";

const stories: StoryItem[] = [
  { title: "قصة مولد النبي ﷺ", en: "The Birth of the Prophet", age: "4-8", img: art.storyReading },
  { title: "رحلة الهجرة", en: "The Journey of Hijrah", age: "6-10", img: art.storyHijrah },
  { title: "الأخلاق مع الأصدقاء", en: "Good Manners with Friends", age: "5-9", img: art.storyCamel },
  { title: "الرحمة بالحيوان", en: "Kindness to Animals", age: "4-8", img: art.storyAnimals },
];

const activities = [
  { label: "ألغاز إسلامية", en: "Islamic Puzzles", icon: Puzzle },
  { label: "تلوين", en: "Coloring", icon: Palette },
  { label: "اصنع بنفسك", en: "DIY Crafts", icon: Lightbulb },
  { label: "تحديات يومية", en: "Daily Challenges", icon: Star },
];

const badges = [
  { title: "باحث صغير", en: "Little Explorer" },
  { title: "محب للقصص", en: "Story Lover" },
  { title: "صاحب قلب طيب", en: "Kind Heart" },
  { title: "رفيق التعلّم", en: "Learning Companion" },
];

const parent = [
  { label: "نصائح تربوية", en: "Parenting Tips", icon: BookOpen },
  { label: "أنشطة عائلية", en: "Family Activities", icon: Users },
  { label: "موارد وقوالب", en: "Resources & Printables", icon: FileText },
];

export function KidsPage() {
  const [current, setCurrent] = useState(stories[0]);
  const [theatre, setTheatre] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [coloring, setColoring] = useState(false);
  const [seen, setSeen] = useState<string[]>([stories[0].title]);
  const [colorSessions, setColorSessions] = useState(0);

  return (
    <div className={styles.page}>
      <TvLounge
        stories={stories}
        current={current}
        playing={playing}
        onSelect={(s) => {
          setCurrent(s);
          setPlaying(false);
          setSeen((prev) => (prev.includes(s.title) ? prev : [...prev, s.title]));
        }}
        onPlay={() => {
          setPlaying(true);
          setTheatre(true);
        }}
      />

      <div className={styles.row}>
        <section className={styles.panel}>
          <SectionHead title="أنشطة وتحديات" en="Activities & Challenges" />
          <div className={styles.actGrid}>
            {activities.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => {
                  if (a.label === "تلوين") {
                    setColoring(true);
                    setColorSessions((n) => n + 1);
                  }
                }}
              >
                <a.icon size={18} />
                <strong>{a.label}</strong>
                <span>{a.en}</span>
              </button>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <SectionHead title="مسارات التعلّم" en="Learning paths" />
          <div className={styles.badges}>
            {badges.map((b) => (
              <div key={b.title}>
                <Star size={18} />
                <strong>{b.title}</strong>
                <span>{b.en}</span>
              </div>
            ))}
          </div>
        </section>
        <section className={styles.panel}>
          <SectionHead title="دليل الوالدين" en="Parental Guidance" />
          <div className={styles.parentGrid}>
            {parent.map((p) => (
              <button key={p.label} type="button">
                <p.icon size={18} />
                <strong>{p.label}</strong>
                <span>{p.en}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <footer className={styles.stats}>
        <span>
          <b>{seen.length}</b> قصص فُتحت على هذا الجهاز
        </span>
        <span>
          <b>{colorSessions}</b> جلسات تلوين محلية
        </span>
        <span>
          <b>{theatre || playing ? 1 : 0}</b> مسرح مفتوح الآن
        </span>
      </footer>
      {theatre ? (
        <StoryTheatre
          title={current.title}
          en={current.en}
          image={current.img}
          onClose={() => {
            setTheatre(false);
            setPlaying(false);
          }}
        />
      ) : null}
      {coloring ? <ColoringStudio onClose={() => setColoring(false)} /> : null}
    </div>
  );
}

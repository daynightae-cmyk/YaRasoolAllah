import { Link } from "wouter";
import { Library, BookOpen, ScrollText, Landmark, Compass, Flag, MapPin, Hourglass, Users } from "lucide-react";
import { art } from "../../mock/art";
import styles from "./HomeReferencePortals.module.css";

const portals = [
  { title: "المكتبة", en: "Library", href: "/library", image: art.shelves, icon: Library },
  { title: "القرآن الكريم", en: "Qur’an", href: "/quran", image: art.mushaf, icon: BookOpen },
  { title: "الحديث الشريف", en: "Hadith", href: "/hadith", image: art.shelves, icon: ScrollText },
  { title: "المدينة المنورة", en: "Madinah", href: "/seerah/world?scene=madinah-walk", image: art.mosque, icon: Landmark },
  { title: "الهجرة", en: "Hijrah", href: "/seerah?chapter=hijra-to-madinah", image: art.desert, icon: Compass },
  { title: "الغزوات", en: "Ghazawat", href: "/seerah?chapter=battles-conquests", image: art.sceneBadr, icon: Flag },
  { title: "الأطلس", en: "Atlas", href: "/atlas", image: art.atlas, icon: MapPin },
  { title: "الخط الزمني", en: "Timeline", href: "/seerah/database", image: art.lantern, icon: Hourglass },
  { title: "المصادر", en: "Sources", href: "/sources", image: art.library, icon: Users },
];

export function HomeReferencePortals() {
  return <div className={styles.worlds}>
    <nav className={styles.portals} aria-label="أبواب عوالم السيرة">
      {portals.map(({ title, en, href, image, icon: Icon }) => <Link href={href} key={href} className={styles.portal}>
        <img src={image} alt="" />
        <span className={styles.shade} aria-hidden="true" />
        <svg className={styles.frame} viewBox="0 0 120 205" preserveAspectRatio="none" aria-hidden="true"><path d="M4 194 V65 Q4 39 32 24 Q51 14 60 3 Q69 14 88 24 Q116 39 116 65 V194 Q116 202 108 202 H12 Q4 202 4 194Z" /><path d="M8 192 V66 Q8 42 35 28 Q52 19 60 9 Q68 19 85 28 Q112 42 112 66 V192 Q112 198 106 198 H14 Q8 198 8 192Z" /></svg>
        <span className={styles.label}><Icon size={26} strokeWidth={1.4} aria-hidden="true" /><strong>{title}</strong><span lang="en">{en}</span></span>
      </Link>)}
    </nav>
    <p className={styles.plaque}>عوالم السيرة التفاعلية<span lang="en">The Worlds of the Seerah</span></p>
  </div>;
}

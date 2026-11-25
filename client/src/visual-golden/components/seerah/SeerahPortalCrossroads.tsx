import type { ReactNode } from "react";
import { Link } from "wouter";
import { art } from "@/visual-golden/mock/art";
import styles from "./SeerahPortalCrossroads.module.css";

const portals = [
  { id: "atlas", ar: "الأطلس", en: "Atlas", href: "/atlas", image: art.atlas },
  { id: "timeline", ar: "الخط الزمني", en: "Timeline", href: "/seerah/database", image: art.lantern },
  { id: "ghazawat", ar: "الغزوات", en: "Ghazawat", href: "/seerah?chapter=badr", image: "/visual-golden/art/badr-portal.webp" },
  { id: "quran", ar: "القرآن الكريم", en: "Qur’an", href: "/quran", image: art.mushafOpen },
  { id: "hadith", ar: "الحديث الشريف", en: "Hadith", href: "/hadith", image: art.shelves },
  { id: "madinah", ar: "المدينة النبوية", en: "Madinah", href: "/seerah/world?scene=madinah-walk", image: "/visual-golden/art/madinah-walk-portal.webp" },
  { id: "hijrah", ar: "الهجرة", en: "Hijrah", href: "/seerah?chapter=hijra-to-madinah", image: "/visual-golden/art/hijrah-night-portal.webp" },
] as const;

export function SeerahPortalCrossroads({ children }: { children: ReactNode }) {
  return (
    <section className={styles.crossroads} data-visual="seerah-crossroads" aria-labelledby="seerah-crossroads-title">
      <Link href="/" className={styles.crossroadsHome} data-visual="seerah-home-link">الرئيسية</Link>
      <div className={styles.arcade}>
        <header className={styles.title}>
          {children}
          <p lang="en">The Living Seerah</p>
        </header>
        <Link href="/seerah/world" className={`${styles.portal} ${styles.center}`} data-visual="seerah-portal-world">
          <img src="/visual-golden/art/worlds/home.webp" alt="" />
          <span>ادخل العالم الحي</span>
          <small lang="en">Enter the Seerah</small>
        </Link>
        {portals.map(({ id, ar, en, href, image }) => (
          <Link href={href} key={id} className={styles.portal} data-visual={`seerah-portal-${id}`}>
            <img src={image} alt="" />
            <span>{ar}</span>
            <small lang="en">{en}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

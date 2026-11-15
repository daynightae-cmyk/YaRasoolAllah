import { Link, useLocation } from "wouter";
import { Home, BookMarked, BookOpen, Moon, Library, type LucideIcon } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import {
  INSTITUTION_WINGS,
  isNavigationWingActive,
  type InstitutionWingId,
} from "@/visual-golden/lib/institution/workspace";
import styles from "./shell.module.css";

const ITEMS: { wing: InstitutionWingId; icon: LucideIcon }[] = [
  { wing: "home", icon: Home },
  { wing: "library", icon: Library },
  { wing: "quran", icon: BookMarked },
  { wing: "seerah", icon: BookOpen },
  { wing: "daily", icon: Moon },
];

export function MobileNav() {
  const [pathname] = useLocation();
  const lang = useInstitution((state) => state.lang);

  return (
    <nav className={styles.mobileNav} aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
      {ITEMS.map(({ wing, icon: Icon }) => {
        const definition = INSTITUTION_WINGS[wing];
        const isActive = isNavigationWingActive(pathname, wing);
        return (
          <Link
            key={definition.id}
            href={definition.path}
            className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} aria-hidden="true" />
            <span>{lang === "ar" ? definition.shortLabelAr : definition.labelEn}</span>
          </Link>
        );
      })}
    </nav>
  );
}

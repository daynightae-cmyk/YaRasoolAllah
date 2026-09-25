import { Link, useLocation } from "wouter";
import { Home, BookMarked, Map, Users, Moon } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import styles from "./shell.module.css";

const items = [
  { to: "/", icon: Home, label: "الرئيسية", en: "Home" },
  { to: "/quran", icon: BookMarked, label: "القرآن", en: "Quran" },
  { to: "/atlas", icon: Map, label: "الأطلس", en: "Atlas" },
  { to: "/kids", icon: Users, label: "الأطفال", en: "Kids" },
  { to: "/daily", icon: Moon, label: "المرصد", en: "Daily" },
] as const;

export function MobileNav() {
  const [pathname] = useLocation();
  const lang = useInstitution((s) => s.lang);

  return (
    <nav className={styles.mobileNav} aria-label={lang === "ar" ? "التنقل الرئيسي" : "Main navigation"}>
      {items.map((item) => {
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            href={item.to}
            className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon size={20} />
            <span>{lang === "ar" ? item.label : item.en}</span>
          </Link>
        );
      })}
    </nav>
  );
}

import { Link, useLocation } from "wouter";
import { Home, BookMarked, Map, Users, Moon } from "lucide-react";
import styles from "./shell.module.css";

const items = [
  { to: "/", icon: Home, label: "الرئيسية" },
  { to: "/quran", icon: BookMarked, label: "القرآن" },
  { to: "/atlas", icon: Map, label: "الأطلس" },
  { to: "/kids", icon: Users, label: "الأطفال" },
  { to: "/daily", icon: Moon, label: "المرصد" },
] as const;

export function MobileNav() {
  const [pathname] = useLocation();

  return (
    <nav className={styles.mobileNav}>
      {items.map((item) => {
        const isActive = pathname === item.to;
        return (
          <Link
            key={item.to}
            href={item.to}
            className={`${styles.mobileNavItem} ${isActive ? styles.mobileNavActive : ""}`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

import { Link, useLocation } from "wouter";
import {
  Home,
  BookOpen,
  BookMarked,
  ScrollText,
  Map,
  Library,
  Users,
  Moon,
  Headphones,
  X,
  Heart,
  StickyNote,
  Route,
  ScanSearch,
} from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { t } from "@/visual-golden/lib/i18n";
import styles from "./shell.module.css";

const navItems = [
  { to: "/", icon: Home, label: "الرئيسية", en: "Home" },
  { to: "/library", icon: BookOpen, label: "المكتبة", en: "Library" },
  { to: "/seerah", icon: BookOpen, label: "السيرة النبوية", en: "Prophetic Biography" },
  { to: "/hadith", icon: Library, label: "الأحاديث النبوية", en: "Hadith Collection" },
  { to: "/quran", icon: BookMarked, label: "القرآن الكريم", en: "Al-Qur'an" },
  { to: "/tafsir", icon: ScrollText, label: "التفسير والتدبر", en: "Tafsir & Tadabbur" },
  { to: "/atlas", icon: Map, label: "الأطلس التاريخي", en: "Historical Atlas" },
  { to: "/kids", icon: Users, label: "الأطفال والعائلة", en: "Kids & Family" },
  { to: "/daily", icon: Moon, label: "مرصد الصلاة", en: "Prayer Observatory" },
  { to: "/audio", icon: Headphones, label: "التلاوات الصوتية", en: "Qur'an Audio" },
  { to: "/basirah", icon: ScanSearch, label: "بصيرة", en: "Basirah" },
] as const;

interface Props {
  open: boolean;
  onClose: () => void;
  onReplaySplash?: () => void;
}

export function InstitutionSidebar({ open, onClose, onReplaySplash }: Props) {
  const [pathname] = useLocation();
  const lang = useInstitution((s) => s.lang);
  const setPanel = useInstitution((s) => s.setPanel);

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`} onClick={onClose} />
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <div className={styles.logoArea}>
          <button type="button" className={styles.logoBtn} onClick={onReplaySplash} aria-label="افتتاح المؤسسة">
            <img src="/visual-golden/art/logo.webp" alt="يا رسول الله" className={styles.logoImg} />
          </button>
          <div className={styles.logoText}>
            <span className={styles.brandAr}>{lang === "ar" ? "بوابة النور" : "Gateway of Light"}</span>
            <span className={styles.brandEn}>GATEWAY OF LIGHT</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="إغلاق">
            <X size={20} />
          </button>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to + item.label}
                href={item.to}
                className={`${styles.navItem} ${isActive ? styles.navActive : ""}`}
                onClick={onClose}
              >
                <item.icon size={18} strokeWidth={1.75} />
                <span className={styles.navLabel}>
                  <span className={styles.navAr}>{lang === "ar" ? item.label : item.en}</span>
                  <span className={styles.navEn}>{lang === "ar" ? item.en : item.label}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.navDivider} />

        <nav className={styles.navBottom}>
          <button type="button" className={`${styles.navItem} ${styles.navItemBtn}`} onClick={() => { setPanel("favorites"); onClose(); }}>
            <Heart size={18} strokeWidth={1.75} />
            <span className={styles.navLabel}>
              <span className={styles.navAr}>{t(lang, "favorites")}</span>
              <span className={styles.navEn}>Favorites</span>
            </span>
          </button>
          <button type="button" className={`${styles.navItem} ${styles.navItemBtn}`} onClick={() => { setPanel("notes"); onClose(); }}>
            <StickyNote size={18} strokeWidth={1.75} />
            <span className={styles.navLabel}>
              <span className={styles.navAr}>{t(lang, "notes")}</span>
              <span className={styles.navEn}>My Notes</span>
            </span>
          </button>
          <button type="button" className={`${styles.navItem} ${styles.navItemBtn}`} onClick={() => { setPanel("journey"); onClose(); }}>
            <Route size={18} strokeWidth={1.75} />
            <span className={styles.navLabel}>
              <span className={styles.navAr}>{t(lang, "journey")}</span>
              <span className={styles.navEn}>{t(lang, "journeyEn")}</span>
            </span>
          </button>
        </nav>

        <Link href="/" className={styles.journeyCard} onClick={onClose}>
          {t(lang, "toLight")}
          <span className={styles.journeyEn}>Your Journey to Light</span>
        </Link>
      </aside>
    </>
  );
}

import { Search, Bell, Menu, Sun, Moon, Globe } from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { t } from "@/visual-golden/lib/i18n";
import styles from "./shell.module.css";

interface Props {
  onMenuClick: () => void;
  onSearch: () => void;
}

export function InstitutionHeader({ onMenuClick, onSearch }: Props) {
  const theme = useInstitution((s) => s.theme);
  const lang = useInstitution((s) => s.lang);
  const setTheme = useInstitution((s) => s.setTheme);
  const setLang = useInstitution((s) => s.setLang);
  const setPanel = useInstitution((s) => s.setPanel);

  return (
    <header className={styles.header}>
      <button className={styles.menuBtn} onClick={onMenuClick} aria-label={t(lang, "menu")}>
        <Menu size={22} />
      </button>

      <button type="button" className={styles.searchWrap} onClick={onSearch} aria-label="اكتشاف الأبواب">
        <Search size={16} className={styles.searchIcon} />
        <span className={styles.searchInput}>{t(lang, "searchPh")}</span>
        <span className={styles.searchFilter}>⌘K</span>
      </button>

      <div className={styles.headerActions}>
        <button className={`${styles.iconBtn} ${styles.bellBtn}`} aria-label={t(lang, "notify")} onClick={() => setPanel("notifications")}>
          <Bell size={18} />
        </button>
        <button
          key={theme}
          className={styles.iconBtn}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={t(lang, "theme")}
        >
          {theme === "dark" ? <Sun size={18} className={styles.themeIcon} /> : <Moon size={18} className={styles.themeIcon} />}
        </button>
        <button
          className={`${styles.langBtn} pressable`}
          type="button"
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          aria-label="Language"
        >
          <Globe size={14} />
          <span className={lang === "ar" ? styles.langOn : styles.langOff}>عربي</span>
          <span className={styles.langSep}>|</span>
          <span className={`${styles.langEn} ${lang === "en" ? styles.langOn : styles.langOff}`}>EN</span>
        </button>
        <div className={styles.userChip}>
          <div className={styles.userAvatar}>{lang === "ar" ? "ز" : "G"}</div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{t(lang, "welcome")}</span>
            <span className={styles.userRole}>{t(lang, "guest")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

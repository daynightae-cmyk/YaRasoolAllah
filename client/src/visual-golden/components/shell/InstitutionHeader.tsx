import { useRef } from "react";
import { useLocation } from "wouter";
import { Search, Bell, Menu, Sun, Moon, Globe, Contrast, ChevronDown, Activity } from "lucide-react";
import { useInstitution, type MotionPreference, type ThemeMode } from "@/visual-golden/lib/institution/store";
import { workspaceContext } from "@/visual-golden/lib/institution/workspace";
import { t } from "@/visual-golden/lib/i18n";
import { WING_STATE_CLASS } from "./shell-state";
import styles from "./shell.module.css";

interface Props {
  onMenuClick: () => void;
  onSearch: () => void;
}

const THEME_OPTIONS: { id: ThemeMode; labelAr: string; labelEn: string }[] = [
  { id: "dark", labelAr: "العتمة الهادئة", labelEn: "Dark sanctuary" },
  { id: "light", labelAr: "ورقية فاتحة", labelEn: "Light manuscript" },
  { id: "contrast", labelAr: "تباين مرتفع", labelEn: "High contrast" },
];

const MOTION_OPTIONS: { id: MotionPreference; labelAr: string; labelEn: string }[] = [
  { id: "system", labelAr: "حسب النظام", labelEn: "System" },
  { id: "reduced", labelAr: "حركة مخفّفة", labelEn: "Reduced" },
  { id: "full", labelAr: "حركة كاملة", labelEn: "Full" },
];

export function InstitutionHeader({ onMenuClick, onSearch }: Props) {
  const theme = useInstitution((state) => state.theme);
  const lang = useInstitution((state) => state.lang);
  const motion = useInstitution((state) => state.motion);
  const setTheme = useInstitution((state) => state.setTheme);
  const setLang = useInstitution((state) => state.setLang);
  const setMotion = useInstitution((state) => state.setMotion);
  const setPanel = useInstitution((state) => state.setPanel);
  const [pathname] = useLocation();
  const workspace = workspaceContext(pathname);
  const preferencesRef = useRef<HTMLDetailsElement>(null);

  const closePreferences = () => preferencesRef.current?.removeAttribute("open");

  return (
    <header className={styles.header}>
      <div className={styles.headerPrimary}>
        <button type="button" className={styles.menuBtn} onClick={onMenuClick} aria-label={t(lang, "menu")}>
          <Menu size={22} aria-hidden="true" />
        </button>

        <div className={styles.wingIdentity}>
          <span className={`${styles.stateDot} ${WING_STATE_CLASS[workspace.wing.state]}`} aria-hidden="true" />
          <span>
            <small>{lang === "ar" ? "الجناح الحالي" : "Current wing"}</small>
            <strong>{lang === "ar" ? workspace.wing.labelAr : workspace.wing.labelEn}</strong>
          </span>
          <em>{lang === "ar" ? workspace.wing.stateLabelAr : workspace.wing.stateLabelEn}</em>
        </div>

        <button
          type="button"
          className={styles.searchWrap}
          onClick={onSearch}
          aria-label={`${t(lang, "searchPh")} — ${lang === "ar" ? "فتح مركز البحث والأوامر" : "Open search and command center"}`}
        >
          <Search size={16} className={styles.searchIcon} aria-hidden="true" />
          <span className={styles.searchInput}>{t(lang, "searchPh")}</span>
          <span className={styles.searchFilter} aria-hidden="true">Ctrl K</span>
        </button>

        <div className={styles.headerActions}>
          <button type="button" className={`${styles.iconBtn} ${styles.bellBtn}`} aria-label={lang === "ar" ? "حالة البيانات" : "Data status"} onClick={() => setPanel("status")}>
            <Bell size={18} aria-hidden="true" />
            <span className={styles.statusBadge} aria-hidden="true" />
          </button>

          <details className={styles.preferences} ref={preferencesRef}>
            <summary className={styles.iconBtn} aria-label={lang === "ar" ? "السمة والحركة" : "Theme and motion"}>
              {theme === "light" ? <Sun size={18} aria-hidden="true" /> : theme === "contrast" ? <Contrast size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
              <ChevronDown size={10} aria-hidden="true" />
            </summary>
            <div className={styles.preferenceMenu} role="group" aria-label={lang === "ar" ? "تفضيلات العرض" : "Display preferences"}>
              <p>{lang === "ar" ? "السمة" : "Theme"}</p>
              {THEME_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={theme === option.id ? styles.preferenceActive : ""}
                  aria-pressed={theme === option.id}
                  onClick={() => {
                    setTheme(option.id);
                    closePreferences();
                  }}
                >
                  <span>{lang === "ar" ? option.labelAr : option.labelEn}</span>
                  {theme === option.id ? <span aria-hidden="true">✓</span> : null}
                </button>
              ))}
              <p>{lang === "ar" ? "الحركة" : "Motion"}</p>
              {MOTION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={motion === option.id ? styles.preferenceActive : ""}
                  aria-pressed={motion === option.id}
                  onClick={() => {
                    setMotion(option.id);
                    closePreferences();
                  }}
                >
                  <span>{lang === "ar" ? option.labelAr : option.labelEn}</span>
                  {motion === option.id ? <span aria-hidden="true">✓</span> : null}
                </button>
              ))}
            </div>
          </details>

          <button
            type="button"
            className={`${styles.langBtn} pressable`}
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            aria-describedby="institution-language-action"
          >
            <Globe size={14} aria-hidden="true" />
            <span className={lang === "ar" ? styles.langOn : styles.langOff}>عربي</span>
            <span className={styles.langSep}>|</span>
            <span className={`${styles.langEn} ${lang === "en" ? styles.langOn : styles.langOff}`}>EN</span>
          </button>
          <span id="institution-language-action" className={styles.srOnly}>
            {lang === "ar" ? "تبديل اللغة إلى الإنجليزية" : "Switch language to Arabic"}
          </span>

          <div className={styles.userChip}>
            <div className={styles.userAvatar} aria-hidden="true">{lang === "ar" ? "ز" : "G"}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{t(lang, "welcome")}</span>
              <span className={styles.userRole}>{t(lang, "guest")}</span>
            </div>
          </div>
        </div>
      </div>

      <nav className={styles.breadcrumb} aria-label={lang === "ar" ? "المسار المكاني" : "Spatial breadcrumb"}>
        <Activity size={13} aria-hidden="true" />
        <span>{lang === "ar" ? "المؤسسة" : "Institution"}</span>
        <i aria-hidden="true">‹</i>
        <span>{lang === "ar" ? workspace.wing.labelAr : workspace.wing.labelEn}</span>
        <i aria-hidden="true">‹</i>
        <span>{lang === "ar" ? workspace.roomAr : workspace.roomEn}</span>
        {workspace.documentAr || workspace.documentEn ? (
          <>
            <i aria-hidden="true">‹</i>
            <span>{lang === "ar" ? workspace.documentAr : workspace.documentEn}</span>
          </>
        ) : null}
      </nav>
    </header>
  );
}

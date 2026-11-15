import { useEffect, useRef } from "react";
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
  Search,
  Archive,
  type LucideIcon,
} from "lucide-react";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import {
  INSTITUTION_NAVIGATION_WINGS,
  INSTITUTION_WINGS,
  isNavigationWingActive,
  workspaceContext,
  type InstitutionWingId,
} from "@/visual-golden/lib/institution/workspace";
import { t } from "@/visual-golden/lib/i18n";
import { WING_STATE_CLASS } from "./shell-state";
import styles from "./shell.module.css";

const WING_ICONS: Record<InstitutionWingId, LucideIcon> = {
  home: Home,
  library: Library,
  seerah: BookOpen,
  hadith: Library,
  quran: BookMarked,
  atlas: Map,
  kids: Users,
  daily: Moon,
  audio: Headphones,
  basirah: Search,
  sources: Archive,
  practice: ScrollText,
  reference: ScrollText,
};

interface Props {
  open: boolean;
  onClose: () => void;
  onReplaySplash?: () => void;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function InstitutionSidebar({ open, onClose, onReplaySplash }: Props) {
  const [pathname] = useLocation();
  const lang = useInstitution((state) => state.lang);
  const setPanel = useInstitution((state) => state.setPanel);
  const workspace = workspaceContext(pathname);
  const sidebarRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const frame = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const sidebar = sidebarRef.current;
      if (!sidebar) return;
      const focusable = [...sidebar.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus();
    };
  }, [onClose, open]);

  return (
    <>
      <div className={`${styles.overlay} ${open ? styles.overlayOpen : ""}`} onClick={onClose} />
      <aside
        ref={sidebarRef}
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}
        aria-label={lang === "ar" ? "أجنحة المؤسسة" : "Institution wings"}
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
      >
        <div className={styles.logoArea}>
          <button type="button" className={styles.logoBtn} onClick={onReplaySplash} aria-label="افتتاح المؤسسة">
            <img src="/visual-golden/art/logo.webp" alt="" className={styles.logoImg} />
          </button>
          <div className={styles.logoText}>
            <span className={styles.brandAr}>{lang === "ar" ? "بوابة النور" : "Gateway of Light"}</span>
            <span className={styles.brandEn}>GATEWAY OF LIGHT</span>
          </div>
          <button ref={closeButtonRef} type="button" className={styles.closeBtn} onClick={onClose} aria-label={lang === "ar" ? "إغلاق القائمة" : "Close menu"}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.currentWing} aria-current="location">
          <span className={`${styles.stateDot} ${WING_STATE_CLASS[workspace.wing.state]}`} aria-hidden="true" />
          <span>
            <small>{lang === "ar" ? "الجناح الحالي" : "Current wing"}</small>
            <strong>{lang === "ar" ? workspace.wing.labelAr : workspace.wing.labelEn}</strong>
          </span>
          <em>{lang === "ar" ? workspace.wing.stateLabelAr : workspace.wing.stateLabelEn}</em>
        </div>

        <nav className={styles.nav} aria-label={lang === "ar" ? "التنقل بين الأجنحة" : "Wing navigation"}>
          {INSTITUTION_NAVIGATION_WINGS.map((wingId) => {
            const wing = INSTITUTION_WINGS[wingId];
            const Icon = WING_ICONS[wingId];
            const isActive = isNavigationWingActive(pathname, wing.id);
            return (
              <Link
                key={wing.id}
                href={wing.path}
                className={`${styles.navItem} ${isActive ? styles.navActive : ""}`}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                <span className={styles.navLabel}>
                  <span className={styles.navAr}>{lang === "ar" ? wing.labelAr : wing.labelEn}</span>
                  <span className={styles.navEn}>{lang === "ar" ? wing.labelEn : wing.labelAr}</span>
                </span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.navDivider} />

        <nav className={styles.navBottom} aria-label={lang === "ar" ? "المساحة الشخصية" : "Personal workspace"}>
          <button type="button" className={`${styles.navItem} ${styles.navItemBtn}`} onClick={() => { setPanel("favorites"); onClose(); }}>
            <Heart size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles.navLabel}>
              <span className={styles.navAr}>{t(lang, "favorites")}</span>
              <span className={styles.navEn}>Favorites</span>
            </span>
          </button>
          <button type="button" className={`${styles.navItem} ${styles.navItemBtn}`} onClick={() => { setPanel("notes"); onClose(); }}>
            <StickyNote size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles.navLabel}>
              <span className={styles.navAr}>{t(lang, "notes")}</span>
              <span className={styles.navEn}>My Notes</span>
            </span>
          </button>
          <button type="button" className={`${styles.navItem} ${styles.navItemBtn}`} onClick={() => { setPanel("journey"); onClose(); }}>
            <Route size={18} strokeWidth={1.75} aria-hidden="true" />
            <span className={styles.navLabel}>
              <span className={styles.navAr}>{t(lang, "journey")}</span>
              <span className={styles.navEn}>{t(lang, "journeyEn")}</span>
            </span>
          </button>
        </nav>

        <div className={styles.localScope} title={lang === "ar" ? "لا يوجد حساب أو مزامنة سحابية في هذه الجلسة" : "No account or cloud sync in this session"}>
          <span>{lang === "ar" ? "حفظ محلي على هذا الجهاز" : "Saved locally on this device"}</span>
          <small>{lang === "ar" ? "لا تُرسل المحفوظات إلى خادم" : "Saved items are not sent to a server"}</small>
        </div>

        <Link href="/" className={styles.journeyCard} onClick={onClose}>
          {t(lang, "toLight")}
          <span className={styles.journeyEn}>Your Journey to Light</span>
        </Link>
      </aside>
    </>
  );
}

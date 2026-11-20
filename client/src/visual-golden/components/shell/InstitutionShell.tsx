import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "wouter";
import { InstitutionSidebar } from "./InstitutionSidebar";
import { InstitutionHeader } from "./InstitutionHeader";
import { MobileNav } from "./MobileNav";
import { ShellDrawer } from "./ShellDrawer";
import { InstitutionActivityRail } from "./InstitutionActivityRail";
import { DiscoveryPalette } from "@/visual-golden/components/present/DiscoveryPalette";
import { Spotlight } from "@/visual-golden/components/present/Spotlight";
import { ContentLanguageNotice } from "./ContentLanguageNotice";
import { SplashCeremony } from "@/visual-golden/components/ceremony/SplashCeremony";
import { AmbientSound } from "@/visual-golden/audio/AmbientSound";
import { WorldBackdrop } from "./WorldBackdrop";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import { useEffectiveMotion } from "@/visual-golden/lib/institution/effective-motion";
import { workspaceContext } from "@/visual-golden/lib/institution/workspace";
import styles from "./shell.module.css";

function shouldShowSplash(): boolean {
  if (typeof window === "undefined") return false;
  const query = new URLSearchParams(window.location.search);
  if (query.get("ceremony") === "0") return false;
  if (query.get("ceremony") === "1") return true;
  try {
    return sessionStorage.getItem("yra-splash") !== "1";
  } catch {
    return true;
  }
}

function isEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.closest(
      'input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"], [role="textbox"]',
    ) !== null
  );
}

export function InstitutionShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [discover, setDiscover] = useState(false);
  const [splash, setSplash] = useState(false);
  const [pathname] = useLocation();
  const contentRef = useRef<HTMLElement>(null);
  const theme = useInstitution((state) => state.theme);
  const lang = useInstitution((state) => state.lang);
  const panel = useInstitution((state) => state.panel);
  const hydrate = useInstitution((state) => state.hydrate);
  const recordVisit = useInstitution((state) => state.recordVisit);
  const setPanel = useInstitution((state) => state.setPanel);
  const workspace = workspaceContext(pathname);
  const effectiveMotion = useEffectiveMotion();
  const reducedMotion = effectiveMotion === "reduced";

  const closeSplash = useCallback(() => {
    try {
      sessionStorage.setItem("yra-splash", "1");
    } catch {
      // Storage can be unavailable; the ceremony may still close.
    }
    setSplash(false);
  }, []);

  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const openMenu = useCallback(() => {
    if (splash) return;
    setDiscover(false);
    setPanel(null);
    setSidebarOpen(true);
  }, [setPanel, splash]);

  const openDiscover = useCallback(() => {
    if (splash) return;
    setSidebarOpen(false);
    setPanel(null);
    setDiscover(true);
  }, [setPanel, splash]);

  const closeDiscover = useCallback(() => setDiscover(false), []);

  const openSplash = useCallback(() => {
    setSidebarOpen(false);
    setDiscover(false);
    setPanel(null);
    setSplash(true);
  }, [setPanel]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (shouldShowSplash()) setSplash(true);
  }, []);

  useEffect(() => {
    recordVisit(pathname, lang === "ar" ? workspace.titleAr : workspace.titleEn);
  }, [lang, pathname, recordVisit, workspace.titleAr, workspace.titleEn]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [pathname]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.lang = lang;
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
    const themeColor = theme === "light" ? "#fffaf0" : theme === "contrast" ? "#000000" : "#0b1f1a";
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
  }, [lang, reducedMotion, theme]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (splash || isEditingTarget(event.target)) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (discover) {
          closeDiscover();
        } else {
          openDiscover();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeDiscover, discover, openDiscover, splash]);

  useEffect(() => {
    if (!panel) return;
    setDiscover(false);
    setSidebarOpen(false);
  }, [panel]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div
      className={`${styles.shell} vg-shell`}
      data-theme={theme}
      data-wing={workspace.wing.id}
      data-lang={lang}
      data-motion={reducedMotion ? "reduced" : "full"}
      dir={lang === "ar" || lang === "ur" ? "rtl" : "ltr"}
    >
      {splash ? <SplashCeremony onDone={closeSplash} reducedMotion={reducedMotion} /> : null}
      <WorldBackdrop wing={workspace.wing.id} />
      <Spotlight />
      <div className={styles.ambient} aria-hidden>
        {Array.from({ length: 18 }, (_, index) => <span key={index} style={{ "--i": index } as CSSProperties} />)}
      </div>
      <AmbientSound />
      <InstitutionSidebar open={sidebarOpen} onClose={closeSidebar} onReplaySplash={openSplash} />
      <div className={styles.mainArea}>
        <InstitutionHeader onMenuClick={openMenu} onSearch={openDiscover} />
        <ContentLanguageNotice pathname={pathname}/>
        <main ref={contentRef} id="main-content" className={styles.content}>
          <div key={pathname} className="vg-page-enter">{children}</div>
        </main>
      </div>
      <InstitutionActivityRail />
      <MobileNav />
      <DiscoveryPalette open={discover} onClose={() => setDiscover(false)} />
      <ShellDrawer />
    </div>
  );
}

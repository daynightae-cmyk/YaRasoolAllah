import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation } from "wouter";
import { InstitutionSidebar } from "./InstitutionSidebar";
import { InstitutionHeader } from "./InstitutionHeader";
import { MobileNav } from "./MobileNav";
import { ShellDrawer } from "./ShellDrawer";
import { DiscoveryPalette } from "@/visual-golden/components/present/DiscoveryPalette";
import { Spotlight } from "@/visual-golden/components/present/Spotlight";
import { ContentLanguageNotice } from "./ContentLanguageNotice";
import { SplashCeremony } from "@/visual-golden/components/ceremony/SplashCeremony";
import { useInstitution } from "@/visual-golden/lib/institution/store";
import styles from "./shell.module.css";

const WING_LABEL: Record<string,string>={"/":"بوابة النور","/library":"المكتبة","/quran":"القرآن","/tafsir":"التفسير","/seerah":"السيرة","/atlas":"الأطلس","/hadith":"الحديث","/sunnah":"الحديث","/kids":"الأطفال","/daily":"مرصد الصلاة","/audio":"التلاوات","/quran-audio":"التلاوات","/basirah":"بصيرة","/sources":"خزانة المصادر","/prophetic-day":"الهدي النبوي","/24-hours":"الهدي النبوي","/daily-verse":"آية اليوم","/prayer-guide":"دليل الصلاة","/islamic-knowledge":"المعرفة الإسلامية","/five-pillars":"أركان الإسلام","/women-in-islam":"المرأة في الإسلام","/calendar":"التقويم","/digital-tasbih":"التسبيح","/qibla-compass":"القبلة","/who-is-muhammad":"من هو محمد ﷺ","/character":"الشمائل"};
function wingFromPath(pathname:string){ if(pathname==="/")return "home"; const key=pathname.replace(/^\//,"").split("/")[0]; return key==="sunnah"?"hadith":key==="quran-audio"?"audio":key||"home"; }
function shouldShowSplash(){ if(typeof window==="undefined")return false; const q=new URLSearchParams(window.location.search); if(q.get("ceremony")==="1")return true; return sessionStorage.getItem("yra-splash")!=="1"; }
export function InstitutionShell({children}:{children:ReactNode}){
 const [sidebarOpen,setSidebarOpen]=useState(false); const [discover,setDiscover]=useState(false); const [splash,setSplash]=useState(false); const [pathname]=useLocation(); const wing=wingFromPath(pathname);
 const contentRef=useRef<HTMLElement>(null);
 const theme=useInstitution(s=>s.theme); const lang=useInstitution(s=>s.lang); const hydrate=useInstitution(s=>s.hydrate); const recordVisit=useInstitution(s=>s.recordVisit);
 const closeSplash=useCallback(()=>{sessionStorage.setItem("yra-splash","1");setSplash(false);},[]);
 useEffect(()=>{hydrate();},[hydrate]); useEffect(()=>{if(shouldShowSplash())setSplash(true);},[]); useEffect(()=>{recordVisit(pathname,WING_LABEL[pathname]??pathname);},[pathname,recordVisit]);
 useEffect(()=>{contentRef.current?.scrollTo({top:0});window.scrollTo({top:0});},[pathname]);
 useEffect(()=>{
   document.documentElement.dataset.initialTheme=theme;
   document.querySelector('meta[name="theme-color"]')?.setAttribute("content",theme==="light"?"#fffaf0":"#0b1f1a");
 },[theme]);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();setDiscover(v=>!v);}};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[]);
 useEffect(()=>{if(!sidebarOpen)return;const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setSidebarOpen(false);};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[sidebarOpen]);
 useEffect(()=>{setSidebarOpen(false);},[pathname]);
 return <div className={`${styles.shell} vg-shell`} data-theme={theme} data-wing={wing} data-lang={lang} dir={lang==="ar"?"rtl":"ltr"}>
   {splash?<SplashCeremony onDone={closeSplash}/>:null}<Spotlight/><div className={styles.ambient} aria-hidden>{Array.from({length:18},(_,i)=><span key={i} style={{"--i":i} as CSSProperties}/>)}</div>
   <InstitutionSidebar open={sidebarOpen} onClose={()=>setSidebarOpen(false)} onReplaySplash={()=>setSplash(true)}/>
    <div className={styles.mainArea}><InstitutionHeader onMenuClick={()=>setSidebarOpen(true)} onSearch={()=>setDiscover(true)}/><ContentLanguageNotice pathname={pathname}/><main ref={contentRef} id="main-content" className={styles.content}><div key={pathname} className="vg-page-enter">{children}</div></main></div>
   <MobileNav/><DiscoveryPalette open={discover} onClose={()=>setDiscover(false)}/><ShellDrawer/>
 </div>;
}

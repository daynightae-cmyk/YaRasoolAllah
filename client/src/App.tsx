import { lazy, Suspense, useState, useEffect, type ReactNode } from "react";
import { Switch, Route, Router, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { BabAlsamaaProvider, useBabAlsamaa } from "./hooks/useBabAlsamaa";
import { DepthProvider } from "./components/Institution/LearningDepthSelector";
import { InstitutionShell as VisualInstitutionShell } from "@/visual-golden/components/shell/InstitutionShell";
import "@/visual-golden/visual-base.css";

const AppLayout = lazy(() => import("./components/Layout/AppLayout"));
const BabAlsamaa = lazy(() => import("./components/BabAlsamaa/BabAlsamaa"));
const BabAlsamaaFAB = lazy(() => import("./components/BabAlsamaa/BabAlsamaaFAB"));
const WelcomeModal = lazy(() => import("./components/WelcomeModal"));
const WhoIsMuhammadPage = lazy(() => import("./pages/WhoIsMuhammadPage"));
const SourcesPage = lazy(() => import("./pages/SourcesPage"));
const PropheticDayPage = lazy(() => import("./pages/PropheticDayPage"));
const PrayerGuidePage = lazy(() => import("./pages/PrayerGuidePage"));
const IslamicKnowledgePage = lazy(() => import("./pages/IslamicKnowledgePage"));
const FivePillarsPage = lazy(() => import("./pages/FivePillarsPage"));
const WomenInIslamPage = lazy(() => import("./pages/WomenInIslamPage"));
const DailyVersePage = lazy(() => import("./pages/DailyVersePage"));
const BabAlsamaaSettingsPage = lazy(() => import("./pages/BabAlsamaaSettingsPage"));
const IslamicAIManagementPage = lazy(() => import("./pages/IslamicAIManagementPage"));
const IslamicCalendarPage = lazy(() => import("./pages/IslamicCalendarPage"));
const DigitalTasbihPage = lazy(() => import("./pages/DigitalTasbihPage"));
const QiblaCompassPage = lazy(() => import("./pages/QiblaCompassPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

const VisualHomePage = lazy(() => import("@/visual-golden/pages/HomePage").then((m) => ({ default: m.HomePage })));
const VisualLibraryPage = lazy(() => import("@/visual-golden/pages/LibraryPage").then((m) => ({ default: m.LibraryPage })));
const VisualQuranPage = lazy(() => import("@/visual-golden/pages/QuranPage").then((m) => ({ default: m.QuranPage })));
const VisualTafsirPage = lazy(() => import("@/visual-golden/pages/TafsirPage").then((m) => ({ default: m.TafsirPage })));
const VisualSeerahPage = lazy(() => import("@/visual-golden/pages/SeerahPage").then((m) => ({ default: m.SeerahPage })));
const VisualAtlasPage = lazy(() => import("@/visual-golden/pages/AtlasPage").then((m) => ({ default: m.AtlasPage })));
const VisualHadithPage = lazy(() => import("@/visual-golden/pages/HadithPage").then((m) => ({ default: m.HadithPage })));
const VisualKidsPage = lazy(() => import("@/visual-golden/pages/KidsPage").then((m) => ({ default: m.KidsPage })));
const VisualDailyPage = lazy(() => import("@/visual-golden/pages/DailyPage").then((m) => ({ default: m.DailyPage })));
const VisualAudioPage = lazy(() => import("@/visual-golden/pages/AudioPage").then((m) => ({ default: m.AudioPage })));
const VisualBasirahPage = lazy(() => import("@/visual-golden/pages/BasirahPage").then((m) => ({ default: m.BasirahPage })));


const VISUAL_PATHS = new Set([
  "/", "/library", "/digital-library", "/books", "/quran", "/tafsir", "/seerah", "/atlas",
  "/sunnah", "/hadith", "/kids", "/children-tv", "/daily", "/quran-audio", "/audio", "/basirah",
  "/ai-assistant", "/al-mufti-al-mubeen"
]);

function VisualRoute({ children }: { children: ReactNode }) {
  return <VisualInstitutionShell><Suspense fallback={<div className="vg-page-loading" role="status">جاري فتح الباب…</div>}>{children}</Suspense></VisualInstitutionShell>;
}

function AppContent() {
  const { isOpen, closeBab, triggerContext } = useBabAlsamaa();
  const [location] = useLocation();
  const isVisualRoute = VISUAL_PATHS.has(location);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    try {
      setShowWelcomeModal(
        localStorage.getItem("institution-welcome-seen") !== "true",
      );
    } catch {
      setShowWelcomeModal(false);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    try {
      localStorage.setItem("institution-welcome-seen", "true");
    } catch {
      // The dialog can still close when storage is unavailable.
    }
  };

  return (
    <>
      <Suspense fallback={<div className="min-h-screen grid place-items-center" role="status">جاري فتح الصفحة…</div>}>
      <Switch>
        <Route path="/">
          {() => <VisualRoute><VisualHomePage /></VisualRoute>}
        </Route>
        <Route path="/who-is-muhammad">
          {() => <WhoIsMuhammadPage />}
        </Route>
        <Route path="/who-is-muhammad/:chapter">
          {() => <WhoIsMuhammadPage />}
        </Route>
        <Route path="/sunnah">
          {() => <VisualRoute><VisualHadithPage /></VisualRoute>}
        </Route>
        <Route path="/hadith">
          {() => <VisualRoute><VisualHadithPage /></VisualRoute>}
        </Route>
        <Route path="/sources">
          {() => <SourcesPage />}
        </Route>
        <Route path="/character">
          {() => <WhoIsMuhammadPage defaultChapterId="family-and-personal-character" />}
        </Route>
        <Route path="/prophetic-day">
          {() => <PropheticDayPage />}
        </Route>
        <Route path="/24-hours">
          {() => <PropheticDayPage />}
        </Route>
        <Route path="/library">
          {() => <VisualRoute><VisualLibraryPage /></VisualRoute>}
        </Route>
        <Route path="/daily">
          {() => <VisualRoute><VisualDailyPage /></VisualRoute>}
        </Route>
        <Route path="/home">
          {() => <Redirect to="/" />}
        </Route>
        <Route path="/quran">
          {() => <VisualRoute><VisualQuranPage /></VisualRoute>}
        </Route>
        <Route path="/tafsir">
          {() => <VisualRoute><VisualTafsirPage /></VisualRoute>}
        </Route>
        <Route path="/quran-audio">
          {() => <VisualRoute><VisualAudioPage /></VisualRoute>}
        </Route>
        <Route path="/audio">
          {() => <VisualRoute><VisualAudioPage /></VisualRoute>}
        </Route>
        <Route path="/daily-verse">
          {() => (
            <AppLayout>
              <DailyVersePage />
            </AppLayout>
          )}
        </Route>
        <Route path="/bab-alsamaa-settings">
          {() => (
            <AppLayout>
              <BabAlsamaaSettingsPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/islamic-ai-management">
          {() => (
            <AppLayout>
              <IslamicAIManagementPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/al-mufti-al-mubeen">
          {() => <Redirect to="/basirah" />}
        </Route>
        <Route path="/basirah">
          {() => <VisualRoute><VisualBasirahPage /></VisualRoute>}
        </Route>
        <Route path="/digital-library">
          {() => <VisualRoute><VisualLibraryPage /></VisualRoute>}
        </Route>
        <Route path="/books">
          {() => <VisualRoute><VisualLibraryPage /></VisualRoute>}
        </Route>
        <Route path="/seerah">
          {() => <VisualRoute><VisualSeerahPage /></VisualRoute>}
        </Route>
        <Route path="/atlas">
          {() => <VisualRoute><VisualAtlasPage /></VisualRoute>}
        </Route>
        <Route path="/prayer-guide">
          {() => (
            <AppLayout>
              <PrayerGuidePage />
            </AppLayout>
          )}
        </Route>
        <Route path="/daily-reminders">
          {() => <Redirect to="/daily" />}
        </Route>
        <Route path="/islamic-knowledge">
          {() => (
            <AppLayout>
              <IslamicKnowledgePage />
            </AppLayout>
          )}
        </Route>
        <Route path="/five-pillars">
          {() => (
            <AppLayout>
              <FivePillarsPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/women-in-islam">
          {() => (
            <AppLayout>
              <WomenInIslamPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/kids">
          {() => <VisualRoute><VisualKidsPage /></VisualRoute>}
        </Route>
        <Route path="/children-tv">
          {() => <VisualRoute><VisualKidsPage /></VisualRoute>}
        </Route>
        <Route path="/ai-assistant">
          {() => <Redirect to="/basirah" />}
        </Route>
        <Route path="/calendar">
          {() => (
            <AppLayout>
              <IslamicCalendarPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/digital-tasbih">
          {() => (
            <AppLayout>
              <DigitalTasbihPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/qibla-compass">
          {() => (
            <AppLayout>
              <QiblaCompassPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/dashboard">
          {() => (
            <AppLayout showSidebar={true}>
              <DashboardPage />
            </AppLayout>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
      </Suspense>

      {!isVisualRoute && (
        <Suspense fallback={null}>
        <>
          <BabAlsamaa
            isOpen={isOpen}
            onClose={closeBab}
            triggeredBy={triggerContext ? "auto" : "manual"}
          />
          <BabAlsamaaFAB />
          <WelcomeModal
            isOpen={showWelcomeModal}
            onClose={handleCloseWelcomeModal}
          />
        </>
        </Suspense>
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <ProgressProvider>
            <BabAlsamaaProvider>
              <DepthProvider>
                <TooltipProvider>
                  <div className="app font-cairo">
                    <a
                      href="#main-content"
                      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:rounded-lg focus:bg-emerald-700 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
                    >
                      تخطَّ إلى المحتوى الرئيسي
                    </a>
                    <Router>
                      <AppContent />
                    </Router>
                    <Toaster />
                  </div>
                </TooltipProvider>
              </DepthProvider>
            </BabAlsamaaProvider>
          </ProgressProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

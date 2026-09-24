import { useState, useEffect, type ReactNode } from "react";
import { Switch, Route, Router, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ProgressProvider } from "./contexts/ProgressContext";
import { BabAlsamaaProvider, useBabAlsamaa } from "./hooks/useBabAlsamaa";
import AppLayout from "./components/Layout/AppLayout";
import BabAlsamaa from "./components/BabAlsamaa/BabAlsamaa";
import BabAlsamaaFAB from "./components/BabAlsamaa/BabAlsamaaFAB";
import WelcomeModal from "./components/WelcomeModal";
import GateOfLightPage from "./pages/GateOfLightPage";
import WhoIsMuhammadPage from "./pages/WhoIsMuhammadPage";
import SunnahPage from "./pages/SunnahPage";
import SourcesPage from "./pages/SourcesPage";
import PropheticDayPage from "./pages/PropheticDayPage";
import HomePage from "./pages/HomePage";
import QuranPage from "./pages/QuranPage";
import SeerahPage from "./pages/SeerahPage";
import PrayerGuidePage from "./pages/PrayerGuidePage";
import DailyRemindersPage from "./pages/DailyRemindersPage";
import IslamicKnowledgePage from "./pages/IslamicKnowledgePage";
import FivePillarsPage from "./pages/FivePillarsPage";
import WomenInIslamPage from "./pages/WomenInIslamPage";
import ChildrenTVPage from "./pages/ChildrenTVPage";
import QuranAudioPage from "./pages/QuranAudioPage";
import DailyVersePage from "./pages/DailyVersePage";
import BabAlsamaaSettingsPage from "./pages/BabAlsamaaSettingsPage";
import { DepthProvider } from "./components/Institution/LearningDepthSelector";
import IslamicAIManagementPage from "./pages/IslamicAIManagementPage";
import AlMubeenBotPage from "./pages/AlMubeenBotPage";
import AlMuftiAlMubeenPage from "./pages/AlMuftiAlMubeenPage";
import IslamicCalendarPage from "./pages/IslamicCalendarPage";
import DigitalLibraryPage from "./pages/DigitalLibraryPage";
import NotFound from "@/pages/not-found";
import DigitalTasbihPage from "./pages/DigitalTasbihPage";
import QiblaCompassPage from "./pages/QiblaCompassPage";
import DashboardPage from "./pages/DashboardPage";
import { InstitutionShell as VisualInstitutionShell } from "@/visual-golden/components/shell/InstitutionShell";
import { HomePage as VisualHomePage } from "@/visual-golden/pages/HomePage";
import { LibraryPage as VisualLibraryPage } from "@/visual-golden/pages/LibraryPage";
import { QuranPage as VisualQuranPage } from "@/visual-golden/pages/QuranPage";
import { TafsirPage as VisualTafsirPage } from "@/visual-golden/pages/TafsirPage";
import { SeerahPage as VisualSeerahPage } from "@/visual-golden/pages/SeerahPage";
import { AtlasPage as VisualAtlasPage } from "@/visual-golden/pages/AtlasPage";
import { HadithPage as VisualHadithPage } from "@/visual-golden/pages/HadithPage";
import { KidsPage as VisualKidsPage } from "@/visual-golden/pages/KidsPage";
import { DailyPage as VisualDailyPage } from "@/visual-golden/pages/DailyPage";
import { AudioPage as VisualAudioPage } from "@/visual-golden/pages/AudioPage";
import { BasirahPage as VisualBasirahPage } from "@/visual-golden/pages/BasirahPage";
import "@/visual-golden/visual-base.css";



const VISUAL_PATHS = new Set([
  "/", "/library", "/digital-library", "/books", "/quran", "/tafsir", "/seerah", "/atlas",
  "/sunnah", "/hadith", "/kids", "/children-tv", "/daily", "/quran-audio", "/audio", "/basirah",
  "/ai-assistant", "/al-mufti-al-mubeen"
]);

function VisualRoute({ children }: { children: ReactNode }) {
  return <VisualInstitutionShell>{children}</VisualInstitutionShell>;
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

      {!isVisualRoute && (
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

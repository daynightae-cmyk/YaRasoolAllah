import { useState, useEffect } from "react";
import { Switch, Route, Router } from "wouter";
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
import BabAlsamaaFAB, {
  BabAlsamaaSmartNotifier,
} from "./components/BabAlsamaa/BabAlsamaaFAB";
import WelcomeModal from "./components/WelcomeModal";
import GateOfLightPage from "./pages/GateOfLightPage";
import WhoIsMuhammadPage from "./pages/WhoIsMuhammadPage";
import SunnahPage from "./pages/SunnahPage";
import PropheticDayPage from "./pages/PropheticDayPage";
import HomePage from "./pages/HomePage";
import QuranPage from "./pages/QuranPage";
import SeerahPage from "./pages/SeerahPage";
import PrayerGuidePage from "./pages/PrayerGuidePage";
import DailyRemindersPage from "./pages/DailyRemindersPage";
import IslamicKnowledgePage from "./pages/IslamicKnowledgePage";
import FivePillarsPage from "./pages/FivePillarsPage";
import WomenInIslamPage from "./pages/WomenInIslamPage";
import SeerahForChildrenPage from "./pages/SeerahForChildrenPage";
import ChildrenTVPage from "./pages/ChildrenTVPage";
import QuranAudioPage from "./pages/QuranAudioPage";
import DailyVersePage from "./pages/DailyVersePage";
import BabAlsamaaSettingsPage from "./pages/BabAlsamaaSettingsPage";
import IslamicAIManagementPage from "./pages/IslamicAIManagementPage";
import AlMubeenBotPage from "./pages/AlMubeenBotPage";
import AlMuftiAlMubeenPage from "./pages/AlMuftiAlMubeenPage";
import IslamicCalendarPage from "./pages/IslamicCalendarPage";
import DigitalLibraryPage from "./pages/DigitalLibraryPage";
import NotFound from "@/pages/not-found";
import DigitalTasbihPage from "./pages/DigitalTasbihPage";
import QiblaCompassPage from "./pages/QiblaCompassPage";
import DashboardPage from "./pages/DashboardPage";

function AppContent() {
  const { isOpen, closeBab, triggerContext } = useBabAlsamaa();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  useEffect(() => {
    // إظهار نافذة الترحيب عند أول زيارة أو بعد فترة من عدم الاستخدام
    const lastVisit = localStorage.getItem("lastVisit");
    const now = Date.now();

    if (!lastVisit || now - parseInt(lastVisit) > 24 * 60 * 60 * 1000) {
      // إذا لم يزر التطبيق من قبل أو انقضى أكثر من 24 ساعة
      setShowWelcomeModal(true);
    }

    localStorage.setItem("lastVisit", now.toString());
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  return (
    <>
      <Switch>
        <Route path="/">
          {() => <GateOfLightPage />}
        </Route>
        <Route path="/who-is-muhammad">
          {() => <WhoIsMuhammadPage />}
        </Route>
        <Route path="/who-is-muhammad/:chapter">
          {() => <WhoIsMuhammadPage />}
        </Route>
        <Route path="/sunnah">
          {() => <SunnahPage />}
        </Route>
        <Route path="/sources">
          {() => <SunnahPage />}
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
          {() => (
            <AppLayout showSidebar={true}>
              <DigitalLibraryPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/daily">
          {() => (
            <AppLayout>
              <DailyRemindersPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/home">
          {() => <GateOfLightPage />}
        </Route>
        <Route path="/quran">
          {() => (
            <AppLayout>
              <QuranPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/quran-audio">
          {() => (
            <AppLayout>
              <QuranAudioPage />
            </AppLayout>
          )}
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
          {() => (
            <AppLayout>
              <AlMuftiAlMubeenPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/digital-library">
          {() => (
            <AppLayout showSidebar={true}>
              <DigitalLibraryPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/books">
          {() => (
            <AppLayout>
              <DigitalLibraryPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/seerah">
          {() => (
            <AppLayout>
              <SeerahPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/prayer-guide">
          {() => (
            <AppLayout>
              <PrayerGuidePage />
            </AppLayout>
          )}
        </Route>
        <Route path="/daily-reminders">
          {() => (
            <AppLayout>
              <DailyRemindersPage />
            </AppLayout>
          )}
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
          {() => (
            <AppLayout>
              <SeerahForChildrenPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/children-tv">
          {() => (
            <AppLayout>
              <ChildrenTVPage />
            </AppLayout>
          )}
        </Route>
        <Route path="/ai-assistant">
          {() => (
            <AppLayout>
              <AlMubeenBotPage />
            </AppLayout>
          )}
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

      {/* Bab Al-Samaa Components */}
      <BabAlsamaa
        isOpen={isOpen}
        onClose={closeBab}
        triggeredBy={triggerContext ? "auto" : "manual"}
      />
      <BabAlsamaaFAB />
      <BabAlsamaaSmartNotifier />

      {/* نافذة الترحيب المنبثقة */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
      />
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
              <TooltipProvider>
                <div className="app font-cairo">
                  <Router>
                    <AppContent />
                  </Router>
                  <Toaster />
                </div>
              </TooltipProvider>
            </BabAlsamaaProvider>
          </ProgressProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

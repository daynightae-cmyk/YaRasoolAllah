import { useState } from "react";
import { Button } from "@/components/ui/button";
import Header from "../Header";
import Footer from "../Footer";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function AppLayout({
  children,
  showSidebar = false,
}: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950 islamic-pattern-enhanced">
      {/* Header */}
      <Header />

      <div className="flex">
        {/* Sidebar Toggle Button (Mobile) */}
        {showSidebar && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "fixed top-24 z-40 transition-all duration-300 lg:hidden",
              isSidebarOpen
                ? "left-72 rtl:right-72 rtl:left-auto"
                : "left-4 rtl:right-4 rtl:left-auto",
            )}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        )}

        {/* Sidebar */}
        {showSidebar && (
          <div
            className={cn(
              "fixed lg:relative top-0 lg:top-auto h-screen lg:h-auto z-30 transition-transform duration-300",
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0",
            )}
          >
            <Sidebar />
          </div>
        )}

        {/* Sidebar Overlay (Mobile) */}
        {showSidebar && isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main
          className={cn(
            "flex-1 min-h-screen transition-all duration-300",
            showSidebar ? "lg:ml-0" : "",
          )}
        >
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

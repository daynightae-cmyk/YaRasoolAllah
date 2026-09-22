import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DivineToggle() {
  const { mode, toggleMode } = useTheme();
  const isDark = mode === "heaven";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleMode}
      className={cn(
        "w-9 h-9 rounded-xl border transition-colors",
        "border-border bg-card hover:bg-muted text-foreground",
        "focus-visible:ring-2 focus-visible:ring-amber-500/60"
      )}
      aria-label={isDark ? "التبديل إلى الوضع النهاري" : "التبديل إلى الوضع الليلي"}
      title={isDark ? "الوضع النهاري" : "الوضع الليلي"}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 rotate-0 hover:-rotate-12" />
      )}
    </Button>
  );
}

import { useTheme } from "../ThemeProvider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleMode}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label={
        mode === "earth" ? "Switch to heaven mode" : "Switch to earth mode"
      }
    >
      {mode === "earth" ? (
        <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      ) : (
        <Sun className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      )}
    </Button>
  );
}

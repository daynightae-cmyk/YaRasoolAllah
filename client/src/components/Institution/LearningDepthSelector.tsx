import React, { createContext, useContext, useState, useEffect } from "react";
import { LEARNING_DEPTHS, LearningDepth } from "@/config/brand";
import { cn } from "@/lib/utils";
import { Compass, GraduationCap, BookOpen, Search } from "lucide-react";

interface DepthContextType {
  depth: LearningDepth;
  setDepth: (depth: LearningDepth) => void;
}

const DepthContext = createContext<DepthContextType>({
  depth: "learn",
  setDepth: () => {},
});

export function useLearningDepth() {
  return useContext(DepthContext);
}

export function DepthProvider({ children }: { children: React.ReactNode }) {
  const [depth, setDepthState] = useState<LearningDepth>("learn");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("institution-learning-depth") as LearningDepth;
      if (saved && LEARNING_DEPTHS.some((d) => d.id === saved)) {
        setDepthState(saved);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const setDepth = (newDepth: LearningDepth) => {
    setDepthState(newDepth);
    try {
      localStorage.setItem("institution-learning-depth", newDepth);
    } catch {
      // Ignore
    }
  };

  return (
    <DepthContext.Provider value={{ depth, setDepth }}>
      {children}
    </DepthContext.Provider>
  );
}

const DEPTH_ICONS = {
  discover: Compass,
  learn: GraduationCap,
  study: BookOpen,
  research: Search,
};

interface SelectorProps {
  className?: string;
  compact?: boolean;
}

export default function LearningDepthSelector({ className, compact = false }: SelectorProps) {
  const { depth, setDepth } = useLearningDepth();

  return (
    <div
      className={cn(
        "inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs",
        className
      )}
      role="radiogroup"
      aria-label="مستوى عمق المعرفة"
    >
      {LEARNING_DEPTHS.map((item) => {
        const Icon = DEPTH_ICONS[item.id];
        const isActive = depth === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setDepth(item.id)}
            title={`${item.nameAr}: ${item.descriptionAr}`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-cairo font-medium transition-all duration-200",
              isActive
                ? "bg-emerald-700 text-white shadow-xs font-bold dark:bg-emerald-600"
                : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-700/50"
            )}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span>{item.nameAr}</span>
            {!compact && isActive && (
              <span className="hidden md:inline-block text-[10px] opacity-80 font-mono">
                ({item.nameEn})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

interface ProgressData {
  lastVisitedPage: string;
  completedLessons: string[];
  currentStreak: number;
  totalPoints: number;
  bookmarks: string[];
  readingProgress: Record<string, number>;
}

interface ProgressContextType {
  progress: ProgressData;
  updateLastVisited: (page: string) => void;
  setLastPage: (page: string) => void;
  completeLesson: (lessonId: string) => void;
  addBookmark: (contentId: string) => void;
  removeBookmark: (contentId: string) => void;
  toggleBookmark: (contentId: string) => void;
  updateReadingProgress: (contentId: string, progress: number) => void;
  updateProgress: (points: number) => void;
  bookmarks: string[];
  getResumeSession: () => { page: string; title: string } | null;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined,
);

const initialProgress: ProgressData = {
  lastVisitedPage: "/",
  completedLessons: [],
  currentStreak: 0,
  totalPoints: 0,
  bookmarks: [],
  readingProgress: {},
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>(() => {
    const saved = localStorage.getItem("alkitab-progress");
    return saved ? JSON.parse(saved) : initialProgress;
  });

  useEffect(() => {
    localStorage.setItem("alkitab-progress", JSON.stringify(progress));
  }, [progress]);

  const updateLastVisited = useCallback((page: string) => {
    setProgress((prev) => ({ ...prev, lastVisitedPage: page }));
  }, []);

  const setLastPage = useCallback(
    (page: string) => updateLastVisited(page),
    [updateLastVisited],
  );

  const completeLesson = useCallback((lessonId: string) => {
    setProgress((prev) => ({
      ...prev,
      completedLessons: [...new Set([...prev.completedLessons, lessonId])],
      totalPoints: prev.totalPoints + 10,
    }));
  }, []);

  const addBookmark = useCallback((contentId: string) => {
    setProgress((prev) => ({
      ...prev,
      bookmarks: [...new Set([...prev.bookmarks, contentId])],
    }));
  }, []);

  const removeBookmark = useCallback((contentId: string) => {
    setProgress((prev) => ({
      ...prev,
      bookmarks: prev.bookmarks.filter((id) => id !== contentId),
    }));
  }, []);

  const toggleBookmark = useCallback((contentId: string) => {
    setProgress((prev) => {
      const exists = prev.bookmarks.includes(contentId);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((id) => id !== contentId)
          : [...prev.bookmarks, contentId],
      };
    });
  }, []);

  const updateReadingProgress = useCallback(
    (contentId: string, progressValue: number) => {
      setProgress((prev) => ({
        ...prev,
        readingProgress: {
          ...prev.readingProgress,
          [contentId]: progressValue,
        },
      }));
    },
    [],
  );

  const updateProgress = useCallback((points: number) => {
    setProgress((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + points,
    }));
  }, []);

  const getResumeSession = useCallback(() => {
    if (progress.lastVisitedPage === "/") return null;

    const pageNames: Record<string, string> = {
      "/quran": "القرآن الكريم",
      "/seerah": "السيرة النبوية",
      "/prayer-guide": "دليل الصلاة",
      "/daily-reminders": "التذكيرات اليومية",
      "/islamic-knowledge": "المعرفة الإسلامية",
      "/five-pillars": "أركان الإسلام",
      "/women-in-islam": "المرأة في الإسلام",
      "/kids": "قسم الأطفال",
      "/ai-assistant": "المساعد الذكي",
      "/calendar": "التقويم الإسلامي",
      "/digital-library": "المكتبة الرقمية",
    };

    return {
      page: progress.lastVisitedPage,
      title: pageNames[progress.lastVisitedPage] || "الصفحة السابقة",
    };
  }, [progress.lastVisitedPage]);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        updateLastVisited,
        setLastPage,
        completeLesson,
        addBookmark,
        removeBookmark,
        toggleBookmark,
        updateReadingProgress,
        updateProgress,
        bookmarks: progress.bookmarks,
        getResumeSession,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}

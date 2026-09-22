import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProgress } from "@/contexts/ProgressContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getDailyVerse } from "@/services/quranService";
import { cn } from "@/lib/utils";

export function DailyVerse() {
  const { t, isRTL } = useLanguage();
  const { bookmarks, toggleBookmark } = useProgress();

  const { data: verse, isLoading } = useQuery({
    queryKey: ["/api/daily-verse"],
    queryFn: getDailyVerse,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });

  if (isLoading) {
    return (
      <Card className="card-islamic animate-pulse">
        <CardContent className="p-8 md:p-12">
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto"></div>
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verse) {
    return null;
  }

  const isBookmarked = bookmarks.includes(`verse-${verse.surah}-${verse.ayah}`);

  return (
    <section className="py-16 bg-gradient-to-br from-background to-accent/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="card-islamic relative overflow-hidden">
          {/* Decorative border */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-primary"></div>
          
          <CardContent className="p-8 md:p-12 text-center">
            <div className="mb-6">
              <Badge 
                variant="secondary" 
                className="px-4 py-2 font-amiri bg-primary/10 text-primary border-primary/20"
              >
                <span className="material-symbols-outlined mr-2 rtl:ml-2">menu_book</span>
                {t("home.dailyVerse")}
              </Badge>
            </div>

            {/* Arabic Verse */}
            <div className="mb-8">
              <p className="text-2xl md:text-3xl font-amiri text-foreground verse-text mb-4 leading-relaxed">
                {verse.arabic}
              </p>
              
              {/* Translation */}
              <p className="text-lg text-muted-foreground font-inter mb-2 leading-relaxed">
                {verse.translation}
              </p>
              
              {/* Reference */}
              <p className="text-sm text-primary font-amiri">
                {t("quran.surah")} {verse.surahName}، {t("quran.ayah")} {verse.ayah}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={isBookmarked ? "default" : "outline"}
                onClick={() => toggleBookmark(`verse-${verse.surah}-${verse.ayah}`)}
                className="transition-all"
              >
                <span className="material-symbols-outlined text-sm mr-2 rtl:ml-2">
                  {isBookmarked ? "bookmark" : "bookmark_add"}
                </span>
                {isBookmarked ? t("common.bookmarked") : t("common.bookmark")}
              </Button>
              
              <Button variant="outline">
                <span className="material-symbols-outlined text-sm mr-2 rtl:ml-2">share</span>
                {t("common.share")}
              </Button>
              
              <Button variant="outline">
                <span className="material-symbols-outlined text-sm mr-2 rtl:ml-2">library_books</span>
                {t("quran.tafsir")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

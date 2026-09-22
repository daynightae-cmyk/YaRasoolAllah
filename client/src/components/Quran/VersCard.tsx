import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Verse {
  arabic: string;
  translation: string;
  reference: string;
  surahName: string;
  verseNumber: number;
}

interface VersCardProps {
  verse: Verse;
  showActions?: boolean;
}

export default function VersCard({ verse, showActions = true }: VersCardProps) {
  const { t, isRTL } = useLanguage();

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-8">
        {/* Decorative top border */}
        <div className="w-full h-1 bg-gradient-to-r from-emerald-500 via-amber-500 to-emerald-500 mb-6"></div>
        
        <div className="mb-6">
          <Badge variant="secondary" className="mb-4">
            <span className="material-symbols-outlined mr-2">menu_book</span>
            {t("quran.verse_of_day")}
          </Badge>
        </div>

        {/* Arabic Verse */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl font-amiri text-foreground verse-text mb-4 leading-relaxed">
            {verse.arabic}
          </p>
          <p className="text-lg text-muted-foreground font-inter mb-2">
            {verse.translation}
          </p>
          <p className="text-sm text-primary font-amiri">
            {verse.reference}
          </p>
        </div>

        {showActions && (
          <div className={`flex flex-wrap gap-3 ${isRTL ? 'justify-start' : 'justify-center'}`}>
            <Button size="sm" className="gradient-emerald text-white">
              <span className="material-symbols-outlined text-sm mr-2">bookmark_add</span>
              {t("actions.save")}
            </Button>
            <Button size="sm" variant="outline">
              <span className="material-symbols-outlined text-sm mr-2">share</span>
              {t("actions.share")}
            </Button>
            <Button size="sm" variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
              <span className="material-symbols-outlined text-sm mr-2">library_books</span>
              {t("quran.tafsir")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

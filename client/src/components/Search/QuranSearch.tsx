import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { searchQuran } from "@/services/quranService";
import { cn } from "@/lib/utils";

export function QuranSearch() {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["/api/quran/search", searchQuery],
    queryFn: () => searchQuran(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const popularSearches = [
    t("search.patience"),
    t("search.paradise"),
    t("search.forgiveness"),
    t("search.faith"),
    t("search.prayer"),
    t("search.charity"),
  ];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setIsSearchActive(true);
  };

  return (
    <Card className="card-islamic">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-amiri font-bold text-foreground">
            {t("search.smartSearch")}
          </h3>
          <div className="gradient-gold p-2 rounded-lg">
            <span className="material-symbols-outlined text-white">search</span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "input-islamic pr-12 font-inter",
              isRTL && "text-right"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          />
          <span className="material-symbols-outlined absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            search
          </span>
        </div>

        {/* Popular Searches */}
        {!isSearchActive && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-3 font-inter">
              {t("search.popularTopics")}
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleSearch(term)}
                >
                  {term}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {isSearchActive && (
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <div
                    key={index}
                    className="p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  >
                    <p className="font-amiri text-foreground mb-1">
                      {result.arabic}
                    </p>
                    <p className="text-sm text-muted-foreground font-inter mb-2">
                      {result.translation}
                    </p>
                    <p className="text-xs text-primary font-amiri">
                      {result.surahName} - {t("quran.ayah")} {result.ayah}
                    </p>
                  </div>
                ))}
              </div>
            ) : searchQuery.length > 2 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-muted-foreground text-4xl mb-2">
                  search_off
                </span>
                <p className="text-muted-foreground font-inter">
                  {t("search.noResults")}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Clear Search */}
        {isSearchActive && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => {
              setSearchQuery("");
              setIsSearchActive(false);
            }}
          >
            <span className="material-symbols-outlined mr-2 rtl:ml-2">clear</span>
            {t("search.clear")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

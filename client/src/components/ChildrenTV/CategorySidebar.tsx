import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { videoCategories } from "@/data/childrenVideos";
import { cn } from "@/lib/utils";

interface CategorySidebarProps {
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
  className?: string;
}

export default function CategorySidebar({
  selectedCategory,
  onCategorySelect,
  className,
}: CategorySidebarProps) {
  const { t, isRTL } = useLanguage();

  return (
    <Card
      className={cn(
        "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 shadow-lg",
        className,
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📺</span>
          </div>
          <h2 className="text-2xl font-bold font-amiri bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            تلفاز الطفل المبين
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-inter">
            اختر التصنيف المفضل لديك
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          {videoCategories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                "w-full h-auto p-4 justify-start text-right rtl:text-right",
                "border-2 transition-all duration-200 hover:scale-105",
                selectedCategory === category.id
                  ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                  : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 bg-white/50 dark:bg-gray-800/50",
              )}
              onClick={() => onCategorySelect(category.id)}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse w-full">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform",
                    selectedCategory === category.id
                      ? "bg-white/20 scale-110"
                      : "bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20",
                  )}
                >
                  {category.icon}
                </div>
                <div className="flex-1 text-right rtl:text-right">
                  <h3
                    className={cn(
                      "font-bold font-amiri text-lg",
                      selectedCategory === category.id
                        ? "text-white"
                        : "text-gray-900 dark:text-white",
                    )}
                  >
                    {category.name}
                  </h3>
                  <p
                    className={cn(
                      "text-sm font-inter mt-1",
                      selectedCategory === category.id
                        ? "text-white/80"
                        : "text-gray-600 dark:text-gray-400",
                    )}
                  >
                    {category.description}
                  </p>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Fun elements */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="flex justify-center space-x-2 rtl:space-x-reverse mb-4">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-200"></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-inter">
              تعلم واستمتع مع الكتاب المبين
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

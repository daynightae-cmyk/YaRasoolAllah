import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { ageGroups } from "@/data/childrenVideos";
import { cn } from "@/lib/utils";
import { Users, Baby, GraduationCap, BookOpen } from "lucide-react";

interface AgeFilterProps {
  selectedAgeGroup: string;
  onAgeGroupChange: (ageGroup: string) => void;
  className?: string;
}

export default function AgeFilter({
  selectedAgeGroup,
  onAgeGroupChange,
  className,
}: AgeFilterProps) {
  const { t, isRTL } = useLanguage();

  const getAgeIcon = (ageId: string) => {
    switch (ageId) {
      case "all":
        return <Users className="w-5 h-5" />;
      case "3-5":
        return <Baby className="w-5 h-5" />;
      case "6-8":
        return <BookOpen className="w-5 h-5" />;
      case "9-12":
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getAgeColor = (ageId: string) => {
    switch (ageId) {
      case "all":
        return "from-blue-400 to-indigo-500";
      case "3-5":
        return "from-pink-400 to-rose-500";
      case "6-8":
        return "from-green-400 to-emerald-500";
      case "9-12":
        return "from-purple-400 to-violet-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  const getAgeEmoji = (ageId: string) => {
    switch (ageId) {
      case "all":
        return "👨‍👩‍👧‍👦";
      case "3-5":
        return "🧸";
      case "6-8":
        return "🎈";
      case "9-12":
        return "📚";
      default:
        return "👶";
    }
  };

  return (
    <Card
      className={cn(
        "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-blue-200 dark:border-blue-700 shadow-lg",
        className,
      )}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold font-amiri text-blue-800 dark:text-blue-200 mb-2">
            اختر الفئة العمرية
          </h2>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-inter">
            محتوى مناسب لكل عمر
          </p>
        </div>

        {/* Age Groups */}
        <div className="space-y-3">
          {ageGroups.map((group) => (
            <Button
              key={group.id}
              variant="ghost"
              className={cn(
                "w-full h-auto p-4 justify-start text-right rtl:text-right",
                "border-2 transition-all duration-200 hover:scale-105",
                selectedAgeGroup === group.id
                  ? `bg-gradient-to-r ${getAgeColor(group.id)} text-white border-transparent shadow-lg`
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 bg-white/50 dark:bg-gray-800/50",
              )}
              onClick={() => onAgeGroupChange(group.id)}
            >
              <div className="flex items-center space-x-3 rtl:space-x-reverse w-full">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform",
                    selectedAgeGroup === group.id
                      ? "bg-white/20 scale-110"
                      : `bg-gradient-to-br ${getAgeColor(group.id)} text-white`,
                  )}
                >
                  {selectedAgeGroup === group.id
                    ? getAgeIcon(group.id)
                    : getAgeEmoji(group.id)}
                </div>
                <div className="flex-1 text-right rtl:text-right">
                  <h3
                    className={cn(
                      "font-bold font-amiri text-lg",
                      selectedAgeGroup === group.id
                        ? "text-white"
                        : "text-gray-900 dark:text-white",
                    )}
                  >
                    {group.name}
                  </h3>
                  <div className="flex items-center justify-end rtl:justify-start mt-1">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs border-0",
                        selectedAgeGroup === group.id
                          ? "bg-white/20 text-white"
                          : "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
                      )}
                    >
                      {group.range} سنوات
                    </Badge>
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>

        {/* Fun Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-3 rounded-lg border border-green-200 dark:border-green-700">
                <div className="text-green-600 dark:text-green-400 text-sm font-inter font-medium">
                  محتوى آمن
                </div>
                <div className="text-green-800 dark:text-green-200 text-lg font-bold font-amiri">
                  ✓
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="text-purple-600 dark:text-purple-400 text-sm font-inter font-medium">
                  تعليمي
                </div>
                <div className="text-purple-800 dark:text-purple-200 text-lg font-bold font-amiri">
                  📚
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-inter">
              جميع المحتويات مراجعة ومناسبة للأطفال
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

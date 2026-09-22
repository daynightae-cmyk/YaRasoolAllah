import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChildrenVideo, ageGroups } from "@/data/childrenVideos";
import VideoCard from "./VideoCard";
import { Search, Filter, Grid3X3, List, Star, Clock, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoGridProps {
  videos: ChildrenVideo[];
  selectedCategory: string;
  selectedAgeGroup: string;
  onVideoPlay: (video: ChildrenVideo) => void;
  onAgeGroupChange: (ageGroup: string) => void;
  className?: string;
}

export default function VideoGrid({
  videos,
  selectedCategory,
  selectedAgeGroup,
  onVideoPlay,
  onAgeGroupChange,
  className,
}: VideoGridProps) {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "rating" | "recent">(
    "popular",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredAndSortedVideos = useMemo(() => {
    let filtered = videos;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          video.producer.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by age group
    if (selectedAgeGroup !== "all") {
      filtered = filtered.filter((video) => {
        const videoAgeRange = video.ageRange
          .replace(/\s+سنوات?/g, "")
          .replace(/\s+years?/g, "");
        return videoAgeRange.includes(selectedAgeGroup);
      });
    }

    // Sort videos
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "popular":
          return (b.views || 0) - (a.views || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "recent":
          return a.title.localeCompare(b.title); // Simple alphabetical sort as proxy for recent
        default:
          return 0;
      }
    });

    return filtered;
  }, [videos, searchTerm, selectedAgeGroup, sortBy]);

  const getCategoryName = () => {
    switch (selectedCategory) {
      case "prophets":
        return "قصص الأنبياء";
      case "prayer":
        return "تعليم الصلاة";
      case "morals":
        return "الأخلاق والآداب";
      case "songs":
        return "أناشيد";
      case "seerah":
        return "السيرة";
      case "bedtime":
        return "قصص قبل النوم";
      case "dhikr":
        return "الأذكار اليومية";
      default:
        return "جميع الفيديوهات";
    }
  };

  const getSortLabel = (sort: string) => {
    switch (sort) {
      case "popular":
        return "الأكثر مشاهدة";
      case "rating":
        return "الأعلى تقييماً";
      case "recent":
        return "الأحدث";
      default:
        return "";
    }
  };

  return (
    <Card
      className={cn(
        "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 shadow-lg",
        className,
      )}
    >
      <CardHeader className="border-b border-purple-100 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold font-amiri text-purple-800 dark:text-purple-200">
            {getCategoryName()}
          </CardTitle>
          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 border-0 px-3 py-1">
            {filteredAndSortedVideos.length} فيديو
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="mt-4 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث في الفيديوهات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rtl:pr-10 rtl:pl-4 bg-white/50 dark:bg-gray-700/50 border-purple-200 dark:border-purple-700 focus:border-purple-400 dark:focus:border-purple-500"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Age Group Filters */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex space-x-2 rtl:space-x-reverse">
                {ageGroups.map((group) => (
                  <Button
                    key={group.id}
                    variant={
                      selectedAgeGroup === group.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => onAgeGroupChange(group.id)}
                    className={cn(
                      "font-amiri",
                      selectedAgeGroup === group.id
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0"
                        : "border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
                    )}
                  >
                    {group.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 rounded-md border border-purple-200 dark:border-purple-700 bg-white/50 dark:bg-gray-700/50 text-sm font-amiri focus:border-purple-400 dark:focus:border-purple-500"
              >
                <option value="popular">الأكثر مشاهدة</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="recent">الأحدث</option>
              </select>

              {/* View Mode Toggle */}
              <div className="flex border border-purple-200 dark:border-purple-700 rounded-md overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-none",
                    viewMode === "grid"
                      ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                      : "text-gray-500 hover:text-purple-600 dark:hover:text-purple-400",
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-none",
                    viewMode === "list"
                      ? "bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                      : "text-gray-500 hover:text-purple-600 dark:hover:text-purple-400",
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {filteredAndSortedVideos.length === 0 ? (
          /* No Videos Found */
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3 font-amiri">
              لم يتم العثور على فيديوهات
            </h3>
            <p className="text-gray-600 dark:text-gray-400 font-inter mb-4">
              جرب تغيير مصطلح البحث أو الفئة العمرية
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                onAgeGroupChange("all");
              }}
              className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-amiri"
            >
              إعادة تعيين البحث
            </Button>
          </div>
        ) : (
          /* Videos Grid/List */
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4",
            )}
          >
            {filteredAndSortedVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onPlay={onVideoPlay}
                className={viewMode === "list" ? "flex-row h-32" : ""}
              />
            ))}
          </div>
        )}

        {/* Load More Button (if needed) */}
        {filteredAndSortedVideos.length > 0 &&
          filteredAndSortedVideos.length % 12 === 0 && (
            <div className="text-center mt-8">
              <Button
                variant="outline"
                className="border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 font-amiri"
              >
                تحميل المزيد
              </Button>
            </div>
          )}
      </CardContent>
    </Card>
  );
}

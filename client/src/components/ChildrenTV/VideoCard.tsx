import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChildrenVideo } from "@/data/childrenVideos";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoCardProps {
  video: ChildrenVideo;
  onPlay: (video: ChildrenVideo) => void;
  className?: string;
}

export default function VideoCard({
  video,
  onPlay,
  className,
}: VideoCardProps) {
  const { t, isRTL } = useLanguage();

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    );
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeVideoId(video.videoUrl);
  const thumbnailUrl = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : video.thumbnailUrl;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "قصص الأنبياء":
        return "from-amber-400 to-orange-500";
      case "تعليم الصلاة":
        return "from-emerald-400 to-teal-500";
      case "الأخلاق والآداب":
        return "from-green-400 to-emerald-500";
      case "أناشيد":
        return "from-purple-400 to-pink-500";
      case "السيرة":
        return "from-blue-400 to-indigo-500";
      case "قصص قبل النوم":
        return "from-indigo-400 to-purple-500";
      case "الأذكار اليومية":
        return "from-rose-400 to-pink-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  return (
    <Card
      className={cn(
        "group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl",
        "bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-100 dark:border-purple-800",
        "hover:border-purple-300 dark:hover:border-purple-600 overflow-hidden",
        className,
      )}
      onClick={() => onPlay(video)}
    >
      {/* Video Thumbnail */}
      <div className="relative h-48 overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
            }}
          />
        ) : (
          <div
            className={cn(
              "w-full h-full bg-gradient-to-br flex items-center justify-center",
              getCategoryColor(video.category),
            )}
          >
            <Play className="w-16 h-16 text-white opacity-80" />
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-8 h-8 text-purple-600 ml-1" />
          </div>
        </div>

        {/* Duration values are producer-side data and unverified locally;
            the badge is omitted until durations are confirmed. */}

        {/* Category Badge */}
        <Badge
          className={cn(
            "absolute top-2 right-2 bg-gradient-to-r text-white border-0 font-bold",
            getCategoryColor(video.category),
          )}
        >
          {video.category}
        </Badge>
      </div>

      <CardContent className="p-4">
        {/* Video Title */}
        <h3 className="text-lg font-bold font-amiri text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight">
          {video.title}
        </h3>

        {/* Video Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 font-inter mb-3 line-clamp-2 leading-relaxed">
          {video.description}
        </p>

        {/* Video Stats: engagement figures are not collected for embeds. */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
          <span>عرض خارجي عبر يوتيوب</span>
          <Badge
            variant="outline"
            className="text-xs border-purple-200 dark:border-purple-700 text-purple-600 dark:text-purple-400"
          >
            {video.ageRange}
          </Badge>
        </div>

        {/* Producer */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-inter">
            {video.producer}
          </p>
          <div className="flex items-center space-x-1 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              متاح الآن
            </span>
          </div>
        </div>

        {/* Play Button */}
        <Button
          className="w-full mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 font-amiri group-hover:scale-105 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(video);
          }}
        >
          <Play className="w-4 h-4 mr-2 rtl:ml-2" />
          مشاهدة الآن
        </Button>
      </CardContent>
    </Card>
  );
}

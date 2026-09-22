import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { ChildrenVideo } from "@/data/childrenVideos";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Star,
  Eye,
  Clock,
} from "lucide-react";

interface VideoPlayerProps {
  video: ChildrenVideo | null;
  onClose?: () => void;
}

export default function VideoPlayer({ video, onClose }: VideoPlayerProps) {
  const { t, isRTL } = useLanguage();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(50);

  if (!video) {
    return (
      <Card className="h-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-blue-300 dark:border-blue-600">
        <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-full flex items-center justify-center mb-6">
            <Play className="w-16 h-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-4 font-amiri">
            مرحباً بك في الطفل المبين
          </h3>
          <p className="text-blue-600 dark:text-blue-400 text-lg font-inter max-w-md">
            اختر فيديو من القائمة الجانبية لبدء المشاهدة والتعلم
          </p>
          <div className="mt-8 flex items-center space-x-4 rtl:space-x-reverse">
            <div className="w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="w-4 h-4 bg-purple-400 rounded-full animate-bounce delay-100"></div>
            <div className="w-4 h-4 bg-pink-400 rounded-full animate-bounce delay-200"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    );
    return match ? match[1] : null;
  };

  const youtubeId = getYouTubeVideoId(video.videoUrl);
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`
    : null;

  return (
    <Card className="h-full bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-2 border-purple-200 dark:border-purple-700 shadow-xl overflow-hidden">
      {/* Video Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold font-amiri mb-2 line-clamp-1">
              {video.title}
            </h2>
            <div className="flex items-center space-x-3 rtl:space-x-reverse text-sm">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-0"
              >
                {video.category}
              </Badge>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Clock className="w-4 h-4" />
                <span>{video.duration}</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Eye className="w-4 h-4" />
                <span>{(video.views || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Star className="w-4 h-4 fill-current" />
                <span>{video.rating}</span>
              </div>
            </div>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 ml-4 rtl:mr-4"
            >
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="text-center text-white">
              <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-amiri">الفيديو غير متاح حالياً</p>
              <p className="text-sm opacity-75 mt-2 font-inter">
                سيتم إضافة الفيديو قريباً
              </p>
            </div>
          </div>
        )}

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-2"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-2"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </Button>

              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-2"
            >
              <Maximize className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-amiri mb-2">
              الوصف
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed font-inter">
              {video.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-bold text-blue-700 dark:text-blue-300 mb-2 font-amiri">
                المنتج
              </h4>
              <p className="text-blue-600 dark:text-blue-400 font-inter">
                {video.producer}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <h4 className="font-bold text-green-700 dark:text-green-300 mb-2 font-amiri">
                الفئة العمرية
              </h4>
              <p className="text-green-600 dark:text-green-400 font-inter">
                {video.ageRange}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300 border-0">
              {video.format}
            </Badge>
            <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border-0">
              {video.language}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

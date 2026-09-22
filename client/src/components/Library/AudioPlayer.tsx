import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

interface AudioTrack {
  id: string;
  title: string;
  url: string;
  duration: string;
  chapter?: string;
}

interface AudioPlayerProps {
  tracks: AudioTrack[];
  title: string;
  description?: string;
  onClose: () => void;
}

export default function AudioPlayer({
  tracks,
  title,
  description,
  onClose,
}: AudioPlayerProps) {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrack < tracks.length - 1) {
        setCurrentTrack((prev) => prev + 1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrack, tracks.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume / 100;
      audio.playbackRate = playbackSpeed;
    }
  }, [volume, playbackSpeed]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTrack = (direction: "prev" | "next") => {
    if (direction === "next" && currentTrack < tracks.length - 1) {
      setCurrentTrack((prev) => prev + 1);
    } else if (direction === "prev" && currentTrack > 0) {
      setCurrentTrack((prev) => prev - 1);
    }
    setIsPlaying(false);
  };

  const seekTo = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && duration) {
      audio.currentTime = (value[0] / 100) * duration;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (tracks.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">
            no_sound
          </span>
          <p className="text-gray-600 dark:text-gray-400">
            لا توجد ملفات صوتية متاحة
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-amiri text-xl">🎧 {title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </Button>
          </div>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
              {description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* معلومات المقطع الحالي */}
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <h3 className="font-amiri font-bold text-lg text-emerald-700 dark:text-emerald-400 mb-2">
              {tracks[currentTrack]?.title}
            </h3>
            {tracks[currentTrack]?.chapter && (
              <Badge variant="outline" className="text-emerald-600">
                {tracks[currentTrack].chapter}
              </Badge>
            )}
          </div>

          {/* شريط التقدم */}
          <div className="space-y-2">
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={seekTo}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => skipTrack("prev")}
              disabled={currentTrack === 0}
            >
              <span className="material-symbols-outlined">skip_previous</span>
            </Button>

            <Button
              size="lg"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-700"
            >
              <span className="material-symbols-outlined text-2xl">
                {isPlaying ? "pause" : "play_arrow"}
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => skipTrack("next")}
              disabled={currentTrack === tracks.length - 1}
            >
              <span className="material-symbols-outlined">skip_next</span>
            </Button>
          </div>

          {/* إعدادات إضافية */}
          <div className="grid grid-cols-2 gap-4">
            {/* التحكم في الصوت */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined">volume_up</span>
                الصوت: {volume}%
              </label>
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={100}
                step={1}
              />
            </div>

            {/* سرعة التشغيل */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <span className="material-symbols-outlined">speed</span>
                السرعة: {playbackSpeed}x
              </label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>

          {/* قائمة المقاطع */}
          <div className="max-h-48 overflow-y-auto">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined">playlist_play</span>
              قائمة التشغيل ({tracks.length} مقطع)
            </h4>
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => {
                    setCurrentTrack(index);
                    setIsPlaying(false);
                  }}
                  className={`w-full text-right p-3 rounded-lg transition-colors ${
                    index === currentTrack
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-amiri text-sm">{track.title}</span>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {index === currentTrack && isPlaying && (
                        <span className="material-symbols-outlined text-sm text-emerald-600 animate-pulse">
                          volume_up
                        </span>
                      )}
                      <span>{track.duration}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* مشغل الصوت المخفي */}
          <audio
            ref={audioRef}
            src={tracks[currentTrack]?.url}
            preload="metadata"
          />
        </CardContent>
      </Card>
    </div>
  );
}

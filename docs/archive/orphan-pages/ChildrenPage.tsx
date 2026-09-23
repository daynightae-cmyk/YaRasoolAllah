import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "../contexts/LanguageContext";
import { useProgress } from "../contexts/ProgressContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ChildrenStory {
  id: string;
  title: string;
  titleEn: string;
  titleFr?: string;
  titleUr?: string;
  description: string;
  ageGroup: string;
  lesson: string;
  imageUrl?: string;
  content?: string;
}

interface LearningActivity {
  id: string;
  title: string;
  type: "quiz" | "game" | "story" | "practice";
  difficulty: "easy" | "medium" | "hard";
  ageGroup: string;
  description: string;
  points: number;
}

export default function ChildrenPage() {
  const { t, language, isRTL } = useLanguage();
  const { updateProgress } = useProgress();
  const [selectedStory, setSelectedStory] = useState<ChildrenStory | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");

  // Fetch children's stories
  const { data: stories = [], isLoading: isLoadingStories } = useQuery<ChildrenStory[]>({
    queryKey: ["/api/children/stories"],
  });

  const getTitle = (story: ChildrenStory) => {
    switch (language) {
      case "en":
        return story.titleEn;
      case "fr":
        return story.titleFr || story.titleEn;
      case "ur":
        return story.titleUr || story.title;
      default:
        return story.title;
    }
  };

  const ageGroups = [
    { id: "all", label: t("children.all_ages") },
    { id: "3-5", label: t("children.ages_3_5") },
    { id: "5-8", label: t("children.ages_5_8") },
    { id: "8-12", label: t("children.ages_8_12") }
  ];

  const learningActivities: LearningActivity[] = [
    {
      id: "prayer-quiz",
      title: t("children.activities.prayer_quiz"),
      type: "quiz",
      difficulty: "easy",
      ageGroup: "5-8",
      description: t("children.activities.prayer_quiz_desc"),
      points: 50
    },
    {
      id: "arabic-letters",
      title: t("children.activities.arabic_letters"),
      type: "practice",
      difficulty: "easy",
      ageGroup: "3-5",
      description: t("children.activities.arabic_letters_desc"),
      points: 30
    },
    {
      id: "quran-memory",
      title: t("children.activities.quran_memory"),
      type: "game",
      difficulty: "medium",
      ageGroup: "8-12",
      description: t("children.activities.quran_memory_desc"),
      points: 75
    }
  ];

  const filteredStories = selectedAgeGroup === "all" 
    ? stories 
    : stories.filter(story => story.ageGroup === selectedAgeGroup);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "quiz": return "quiz";
      case "game": return "sports_esports";
      case "story": return "auto_stories";
      case "practice": return "edit";
      default: return "child_care";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "medium": return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "hard": return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default: return "bg-gray-100 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-pink-900/20">
      {/* Playful background elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-32 right-20 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
      <div className="absolute bottom-20 left-32 w-24 h-24 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 px-6 py-3 rounded-full mb-4">
            <span className="material-symbols-outlined text-pink-600 dark:text-pink-400 text-lg">child_care</span>
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">
              {t("children.welcome_message")}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            {t("children.title")}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            {t("children.description")}
          </p>
        </div>

        <Tabs defaultValue="stories" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/50 dark:bg-gray-800/50">
            <TabsTrigger value="stories" className="font-amiri text-pink-700 dark:text-pink-300">
              <span className="material-symbols-outlined mr-2 rtl:ml-2">auto_stories</span>
              {t("children.stories")}
            </TabsTrigger>
            <TabsTrigger value="activities" className="font-amiri text-purple-700 dark:text-purple-300">
              <span className="material-symbols-outlined mr-2 rtl:ml-2">sports_esports</span>
              {t("children.activities")}
            </TabsTrigger>
            <TabsTrigger value="progress" className="font-amiri text-blue-700 dark:text-blue-300">
              <span className="material-symbols-outlined mr-2 rtl:ml-2">trending_up</span>
              {t("children.progress")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-6">
            {/* Age Group Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {ageGroups.map((group) => (
                <Button
                  key={group.id}
                  variant={selectedAgeGroup === group.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedAgeGroup(group.id)}
                  className={
                    selectedAgeGroup === group.id
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-amiri border-0"
                      : "border-pink-200 dark:border-pink-700 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 font-amiri"
                  }
                >
                  {group.label}
                </Button>
              ))}
            </div>

            {/* Stories Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingStories ? (
                // Loading skeletons
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <Skeleton className="h-40 w-full mb-4 rounded-lg" />
                      <Skeleton className="h-6 w-20 mb-2" />
                      <Skeleton className="h-8 w-full mb-3" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))
              ) : (
                filteredStories.map((story) => (
                  <Card
                    key={story.id}
                    className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-pink-100 dark:border-pink-800 hover:border-pink-300 dark:hover:border-pink-600 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => setSelectedStory(story)}
                  >
                    {/* Story illustration */}
                    <div className="h-40 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 dark:from-pink-800 dark:via-purple-800 dark:to-blue-800 relative overflow-hidden">
                      {story.imageUrl ? (
                        <img
                          src={story.imageUrl}
                          alt={getTitle(story)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-6xl">auto_stories</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/90 text-pink-700 border-0 font-bold">
                          {story.ageGroup}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-amiri font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
                        {getTitle(story)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 font-inter mb-4 line-clamp-3 text-sm">
                        {story.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20 text-emerald-700 dark:text-emerald-400 border-0">
                          {story.lesson}
                        </Badge>
                      </div>
                      
                      <Button size="sm" className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0 font-amiri group-hover:scale-105 transition-transform">
                        <span className="material-symbols-outlined mr-2 rtl:ml-2">play_arrow</span>
                        {t("children.read_story")}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* No stories found */}
            {!isLoadingStories && filteredStories.length === 0 && (
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-pink-100 dark:border-pink-800">
                <CardContent className="p-8 text-center">
                  <span className="material-symbols-outlined text-pink-400 text-6xl mb-4 block">search_off</span>
                  <h3 className="text-xl font-amiri font-bold text-pink-600 dark:text-pink-400 mb-2">
                    {t("children.no_stories_found")}
                  </h3>
                  <p className="text-pink-500 dark:text-pink-400 font-inter">
                    {t("children.try_different_age_group")}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="activities" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningActivities.map((activity) => (
                <Card key={activity.id} className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-xl transition-all duration-300 cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-blue-500 w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white text-2xl">
                          {getActivityIcon(activity.type)}
                        </span>
                      </div>
                      <Badge className={getDifficultyColor(activity.difficulty)}>
                        {t(`children.difficulty.${activity.difficulty}`)}
                      </Badge>
                    </div>
                    
                    <h3 className="text-xl font-amiri font-bold text-gray-900 dark:text-white mb-3">
                      {activity.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 font-inter mb-4 text-sm leading-relaxed">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <Badge className="bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-0">
                        {activity.ageGroup}
                      </Badge>
                      <div className="flex items-center space-x-1 rtl:space-x-reverse text-yellow-500">
                        <span className="material-symbols-outlined text-sm">star</span>
                        <span className="font-bold text-sm">{activity.points}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 font-amiri">
                      <span className="material-symbols-outlined mr-2 rtl:ml-2">play_arrow</span>
                      {t("children.start_activity")}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {/* Progress Overview */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700">
                <CardContent className="p-6 text-center">
                  <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-white text-2xl">auto_stories</span>
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">12</h3>
                  <p className="text-green-600 dark:text-green-400 font-amiri font-medium">
                    {t("children.stories_read")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700">
                <CardContent className="p-6 text-center">
                  <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-white text-2xl">sports_esports</span>
                  </div>
                  <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-2">8</h3>
                  <p className="text-blue-600 dark:text-blue-400 font-amiri font-medium">
                    {t("children.activities_completed")}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-700">
                <CardContent className="p-6 text-center">
                  <div className="bg-yellow-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-white text-2xl">star</span>
                  </div>
                  <h3 className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mb-2">450</h3>
                  <p className="text-yellow-600 dark:text-yellow-400 font-amiri font-medium">
                    {t("children.points_earned")}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gold-200 dark:border-gold-700">
              <CardHeader>
                <CardTitle className="font-amiri text-gold-800 dark:text-gold-200 flex items-center">
                  <span className="material-symbols-outlined mr-2 rtl:ml-2">emoji_events</span>
                  {t("children.recent_achievements")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: t("children.achievements.first_story"), description: t("children.achievements.first_story_desc"), icon: "auto_stories", color: "emerald" },
                  { title: t("children.achievements.quiz_master"), description: t("children.achievements.quiz_master_desc"), icon: "quiz", color: "blue" },
                  { title: t("children.achievements.daily_learner"), description: t("children.achievements.daily_learner_desc"), icon: "calendar_today", color: "purple" }
                ].map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-4 rtl:space-x-reverse p-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className={`bg-${achievement.color}-500 w-12 h-12 rounded-full flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white">{achievement.icon}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-amiri font-bold text-gray-900 dark:text-white">
                        {achievement.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300 font-inter text-sm">
                        {achievement.description}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-gold-500">star</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Story Detail Modal */}
        {selectedStory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="bg-white dark:bg-gray-800 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-amiri text-pink-800 dark:text-pink-200 text-2xl">
                    {getTitle(selectedStory)}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedStory(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <Badge className="bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400">
                      {selectedStory.ageGroup}
                    </Badge>
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                      {selectedStory.lesson}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 font-inter leading-relaxed">
                    {selectedStory.description}
                  </p>
                  
                  {selectedStory.content && (
                    <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-pink-200 dark:border-pink-700">
                      <p className="font-inter text-gray-800 dark:text-gray-200 leading-relaxed">
                        {selectedStory.content}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

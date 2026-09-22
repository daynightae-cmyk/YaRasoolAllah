import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";
import { AZKAR_DATA } from "../data/azkarData";

interface AzkarItem {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reward: string;
  count: number;
  category: "morning" | "evening" | "general" | "sleep" | "food";
}

export default function DailyRemindersPage() {
  const { updateLastVisited } = useProgress();
  const { direction } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("morning");
  const [tasbihCount, setTasbihCount] = useState(0);
  const [completedAzkar, setCompletedAzkar] = useState<Set<string>>(new Set());

  useEffect(() => {
    updateLastVisited("/daily-reminders");
  }, [updateLastVisited]);

  const categories = [
    { id: "morning", name: "أذكار الصباح", icon: "wb_sunny", color: "yellow" },
    { id: "evening", name: "أذكار المساء", icon: "nights_stay", color: "purple" },
    { id: "general", name: "أذكار عامة", icon: "favorite", color: "emerald" },
    { id: "sleep", name: "أذكار النوم", icon: "bedtime", color: "blue" },
    { id: "food", name: "أذكار الطعام", icon: "restaurant", color: "orange" }
  ];

  const filteredAzkar = AZKAR_DATA.filter(azkar => azkar.category === selectedCategory);

  const handleTasbihIncrement = () => {
    setTasbihCount(prev => prev + 1);
  };

  const resetTasbih = () => {
    setTasbihCount(0);
  };

  const markAzkarComplete = (azkarId: string) => {
    setCompletedAzkar(prev => new Set([...prev, azkarId]));
  };

  const currentCategory = categories.find(cat => cat.id === selectedCategory);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">auto_stories</span>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">التذكيرات اليومية</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gray-900 dark:text-white mb-4">
            الأذكار والتذكيرات اليومية
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            احرص على أذكارك اليومية وابق على صلة دائمة مع الله عز وجل
          </p>
        </div>

        {/* Digital Tasbih */}
        <Card className="mb-8 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="islamic-pattern w-full h-full"></div>
          </div>
          
          <CardContent className="p-8 text-center relative">
            <h3 className="text-2xl font-amiri font-bold mb-6">السبحة الرقمية</h3>
            
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">{tasbihCount}</div>
                <p className="text-emerald-100">العدد الحالي</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">
                  {Math.floor(tasbihCount / 33)}
                </div>
                <p className="text-emerald-100">التسابيح المكتملة</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gold-400 mb-2">
                  {33 - (tasbihCount % 33)}
                </div>
                <p className="text-emerald-100">باقي للإكمال</p>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4 rtl:space-x-reverse">
              <Button
                onClick={handleTasbihIncrement}
                className="bg-gold-500 hover:bg-gold-600 text-white px-8 py-4 rounded-xl font-medium text-lg shadow-lg"
              >
                <span className="material-symbols-outlined mr-2 rtl:ml-2">add_circle</span>
                سبحان الله
              </Button>
              <Button
                onClick={resetTasbih}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-emerald-800 px-6 py-4 rounded-xl"
              >
                <span className="material-symbols-outlined mr-2 rtl:ml-2">refresh</span>
                إعادة تعيين
              </Button>
            </div>
            
            {tasbihCount > 0 && tasbihCount % 33 === 0 && (
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-gold-300 font-amiri">🤲 مبارك! أكملت {Math.floor(tasbihCount / 33)} من التسابيح</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 rtl:space-x-reverse ${
                selectedCategory === category.id 
                  ? "bg-emerald-600 text-white" 
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <span className="material-symbols-outlined">{category.icon}</span>
              <span className="font-amiri">{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Current Time Display */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white mb-2">
              {currentCategory?.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 font-inter">
              {selectedCategory === "morning" && "ابدأ يومك بذكر الله"}
              {selectedCategory === "evening" && "اختتم يومك بالذكر والدعاء"}
              {selectedCategory === "general" && "أذكار لجميع أوقات اليوم"}
              {selectedCategory === "sleep" && "أذكار ما قبل النوم"}
              {selectedCategory === "food" && "أذكار الطعام والشراب"}
            </p>
          </CardContent>
        </Card>

        {/* Azkar List */}
        <div className="space-y-6">
          {filteredAzkar.map((azkar, index) => (
            <Card key={azkar.id} className="card-hover">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 dark:text-emerald-300 font-bold">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <Badge variant="outline" className="text-emerald-600">
                          {azkar.count}x
                        </Badge>
                        {completedAzkar.has(azkar.id) && (
                          <Badge className="bg-green-100 text-green-700">
                            <span className="material-symbols-outlined text-sm mr-1">check</span>
                            مكتمل
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant={completedAzkar.has(azkar.id) ? "outline" : "default"}
                    onClick={() => markAzkarComplete(azkar.id)}
                    disabled={completedAzkar.has(azkar.id)}
                    className={completedAzkar.has(azkar.id) ? "text-green-600" : "bg-emerald-600 hover:bg-emerald-700"}
                  >
                    {completedAzkar.has(azkar.id) ? (
                      <>
                        <span className="material-symbols-outlined mr-2 rtl:ml-2">check_circle</span>
                        مكتمل
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined mr-2 rtl:ml-2">radio_button_unchecked</span>
                        تم القراءة
                      </>
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {/* Arabic Text */}
                <div className="mb-6 p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                  <p className="text-2xl md:text-3xl font-amiri leading-loose text-gray-900 dark:text-white verse-text">
                    {azkar.arabic}
                  </p>
                </div>
                
                {/* Transliteration */}
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="text-sm font-amiri font-bold text-blue-700 dark:text-blue-400 mb-2">
                    النطق بالحروف الإنجليزية:
                  </h4>
                  <p className="text-lg font-inter italic text-gray-700 dark:text-gray-300">
                    {azkar.transliteration}
                  </p>
                </div>
                
                {/* Translation */}
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h4 className="text-sm font-amiri font-bold text-gray-700 dark:text-gray-300 mb-2">
                    المعنى:
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 font-inter leading-relaxed">
                    {azkar.translation}
                  </p>
                </div>
                
                {/* Reward */}
                <div className="p-4 bg-gold-50 dark:bg-gold-900/20 rounded-lg">
                  <h4 className="text-sm font-amiri font-bold text-gold-700 dark:text-gold-400 mb-2">
                    الفضل والثواب:
                  </h4>
                  <p className="text-gold-700 dark:text-gold-300 font-inter leading-relaxed">
                    {azkar.reward}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button size="sm" variant="outline" className="text-emerald-600">
                    <span className="material-symbols-outlined text-sm mr-2 rtl:ml-2">bookmark_add</span>
                    حفظ
                  </Button>
                  <Button size="sm" variant="outline">
                    <span className="material-symbols-outlined text-sm mr-2 rtl:ml-2">volume_up</span>
                    استماع
                  </Button>
                  <Button size="sm" variant="outline">
                    <span className="material-symbols-outlined text-sm mr-2 rtl:ml-2">share</span>
                    مشاركة
                  </Button>
                  <Button size="sm" variant="outline" className="text-purple-600">
                    <span className="material-symbols-outlined text-sm mr-2 rtl:ml-2">content_copy</span>
                    نسخ
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress Summary */}
        <Card className="mt-8 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900/30 dark:to-green-900/30">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white mb-4">
              إحصائياتك اليومية
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {completedAzkar.size}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">أذكار مكتملة اليوم</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-gold-600">
                  {tasbihCount}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي التسبيحات</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.floor(tasbihCount / 33)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">دورات تسبيح مكتملة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

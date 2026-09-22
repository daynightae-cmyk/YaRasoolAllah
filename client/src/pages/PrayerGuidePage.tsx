import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";
import { PRAYER_GUIDE_STEPS } from "../data/prayerGuideData";

interface PrayerStep {
  id: string;
  title: string;
  description: string;
  arabicText?: string;
  transliteration?: string;
  category: "preparation" | "positions" | "recitations" | "completion";
  order: number;
  isRequired: boolean;
}

export default function PrayerGuidePage() {
  const { updateLastVisited, completeLesson } = useProgress();
  const { direction } = useLanguage();
  const [selectedStep, setSelectedStep] = useState<PrayerStep | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("preparation");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    updateLastVisited("/prayer-guide");
  }, [updateLastVisited]);

  const categories = [
    { id: "preparation", name: "التحضير والطهارة", icon: "clean_hands", color: "emerald" },
    { id: "positions", name: "المواضع والحركات", icon: "self_improvement", color: "blue" },
    { id: "recitations", name: "القراءات والأذكار", icon: "record_voice_over", color: "purple" },
    { id: "completion", name: "إتمام الصلاة", icon: "check_circle", color: "green" }
  ];

  const filteredSteps = PRAYER_GUIDE_STEPS.filter(step => step.category === activeCategory);

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    completeLesson(`prayer-step-${stepId}`);
  };

  const currentCategory = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">self_improvement</span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">دليل شامل للصلاة</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gray-900 dark:text-white mb-4">
            دليل الصلاة الشامل
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            تعلم كيفية أداء الصلاة خطوة بخطوة مع الأحكام والآداب والأدعية المستحبة
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white mb-2">
                  تقدمك في تعلم الصلاة
                </h3>
                <p className="text-gray-600 dark:text-gray-300 font-inter">
                  أكملت {completedSteps.size} من {PRAYER_GUIDE_STEPS.length} خطوة
                </p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center mb-2">
                  <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                    {Math.round((completedSteps.size / PRAYER_GUIDE_STEPS.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(completedSteps.size / PRAYER_GUIDE_STEPS.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={`h-auto p-4 ${
                activeCategory === category.id 
                  ? "bg-emerald-600 text-white" 
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              <div className="text-center">
                <span className="material-symbols-outlined text-2xl mb-2 block">{category.icon}</span>
                <span className="font-amiri text-sm">{category.name}</span>
              </div>
            </Button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Steps List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 rtl:space-x-reverse font-amiri">
                  <span className="material-symbols-outlined text-emerald-600">
                    {currentCategory?.icon}
                  </span>
                  <span>{currentCategory?.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-2">
                  {filteredSteps.map((step) => (
                    <button
                      key={step.id}
                      onClick={() => setSelectedStep(step)}
                      className={`w-full p-4 text-right border-b border-gray-100 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors ${
                        selectedStep?.id === step.id 
                          ? "bg-emerald-100 dark:bg-emerald-900/30" 
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className={`flex-1 ${direction === "rtl" ? "text-right" : "text-left"}`}>
                          <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
                            <h3 className="font-amiri font-bold text-gray-900 dark:text-white">
                              {step.order}. {step.title}
                            </h3>
                            {step.isRequired && (
                              <Badge variant="destructive" className="text-xs">واجب</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-inter">
                            {step.description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                          {completedSteps.has(step.id) && (
                            <span className="material-symbols-outlined text-green-500">check_circle</span>
                          )}
                          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-300 font-bold text-sm">
                              {step.order}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Step Details */}
          <div className="lg:col-span-2">
            {selectedStep ? (
              <Card>
                <CardHeader>
                  <CardTitle className="font-amiri text-center">
                    <div className="mb-4">
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-emerald-100 dark:from-blue-900/30 dark:to-emerald-900/30 rounded-lg mb-6 flex items-center justify-center">
                        <div className="text-center text-blue-700 dark:text-blue-400">
                          <span className="material-symbols-outlined text-6xl mb-2">self_improvement</span>
                          <p className="text-sm font-inter">تمثيل بصري لحركة الصلاة</p>
                        </div>
                      </div>
                      
                      <h2 className="text-2xl text-emerald-700 dark:text-emerald-400 mb-2">
                        {selectedStep.order}. {selectedStep.title}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 font-inter">
                        {selectedStep.description}
                      </p>
                      
                      <div className="flex items-center justify-center space-x-4 rtl:space-x-reverse mt-4">
                        {selectedStep.isRequired && (
                          <Badge variant="destructive">واجب</Badge>
                        )}
                        <Badge variant="outline">
                          {currentCategory?.name}
                        </Badge>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-6">
                    {/* Arabic Text */}
                    {selectedStep.arabicText && (
                      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6 text-center">
                        <h3 className="text-sm font-amiri font-bold text-emerald-700 dark:text-emerald-400 mb-3">
                          النص العربي
                        </h3>
                        <p className="text-2xl font-amiri leading-loose text-gray-900 dark:text-white verse-text">
                          {selectedStep.arabicText}
                        </p>
                      </div>
                    )}
                    
                    {/* Transliteration */}
                    {selectedStep.transliteration && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h3 className="text-sm font-amiri font-bold text-blue-700 dark:text-blue-400 mb-2">
                          النطق بالحروف الإنجليزية
                        </h3>
                        <p className="text-lg font-inter italic text-gray-700 dark:text-gray-300">
                          {selectedStep.transliteration}
                        </p>
                      </div>
                    )}
                    
                    {/* Detailed Description */}
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <div className="font-amiri text-lg leading-relaxed text-gray-900 dark:text-white">
                        تفاصيل إضافية حول هذه الخطوة ستكون متوفرة قريباً، بما في ذلك الأحكام الفقهية والآداب المستحبة.
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {!completedSteps.has(selectedStep.id) && (
                      <Button 
                        onClick={() => handleStepComplete(selectedStep.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <span className="material-symbols-outlined mr-2 rtl:ml-2">check_circle</span>
                        أتممت هذه الخطوة
                      </Button>
                    )}
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <span className="material-symbols-outlined mr-2 rtl:ml-2">bookmark_add</span>
                      حفظ
                    </Button>
                    <Button variant="outline">
                      <span className="material-symbols-outlined mr-2 rtl:ml-2">volume_up</span>
                      استماع للنطق
                    </Button>
                    <Button variant="outline">
                      <span className="material-symbols-outlined mr-2 rtl:ml-2">share</span>
                      مشاركة
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">self_improvement</span>
                  <h3 className="text-xl font-amiri font-bold text-gray-600 dark:text-gray-400 mb-2">
                    اختر خطوة لتتعلمها
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 font-inter">
                    اختر خطوة من خطوات الصلاة من القائمة على اليسار لتتعلم كيفية أدائها بالطريقة الصحيحة
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";

interface ChildStory {
  id: string;
  title: string;
  description: string;
  content: string;
  ageGroup: "3-6" | "7-10" | "11-14";
  category: "character" | "miracle" | "kindness" | "wisdom";
  readTime: number;
  moralLesson: string;
  imageDescription: string;
}

export default function SeerahForChildrenPage() {
  const { updateLastVisited, completeLesson } = useProgress();
  const { direction } = useLanguage();
  const [selectedStory, setSelectedStory] = useState<ChildStory | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("all");

  useEffect(() => {
    updateLastVisited("/kids");
  }, [updateLastVisited]);

  const childrenStories: ChildStory[] = [
    {
      id: "prophet-birth",
      title: "ولادة النبي محمد ﷺ",
      description: "قصة ولادة خير البشر للأطفال",
      ageGroup: "3-6",
      category: "miracle",
      readTime: 3,
      moralLesson: "الله يختار أفضل الناس لحمل رسالته",
      imageDescription: "Peaceful scene of ancient Mecca with gentle lighting",
      content: `في مكة المكرمة، في يوم جميل مبارك، وُلد طفل صغير سيصبح أعظم الناس.

كان اسمه محمد، وكان طفلاً مميزاً جداً. حتى قبل أن يكبر، كان الناس يحبونه ويقولون عنه أنه صادق وأمين.

عندما وُلد النبي محمد ﷺ، حدثت أشياء عجيبة! 
- أضاءت النجوم في السماء أكثر من المعتاد
- شعر الناس بالفرح والسعادة
- حتى الحيوانات كانت هادئة وسعيدة

جده عبد المطلب أحبه كثيراً وكان يحمله ويلعب معه. وعمه أبو طالب اعتنى به عندما كان صغيراً.

الدرس المهم: الله سبحانه وتعالى يختار أفضل الناس ليكونوا رسله، والنبي محمد ﷺ كان أفضل الناس على الإطلاق.`
    },
    {
      id: "honest-merchant",
      title: "التاجر الأمين",
      description: "كيف كان النبي ﷺ صادقاً في تجارته",
      ageGroup: "7-10",
      category: "character",
      readTime: 4,
      moralLesson: "الصدق والأمانة من أهم الصفات",
      imageDescription: "Ancient marketplace with honest merchants and fair trade",
      content: `عندما كان النبي محمد ﷺ شاباً، كان يعمل في التجارة. وكان مشهوراً بين الناس بأنه "الصادق الأمين".

لماذا أطلقوا عليه هذا اللقب؟

الصدق في البيع والشراء:
- كان يخبر الناس بعيوب البضاعة إن وجدت
- لم يكن يكذب أبداً لبيع شيء
- كان يعطي الناس حقهم كاملاً
- إذا وعد بشيء، فعله بالضبط

الأمانة مع الأموال:
- عندما كان يسافر للتجارة، كان الناس يعطونه أموالهم ليتاجر بها
- كان يحافظ على أموال الناس أكثر من أمواله
- لم يخن أمانة أحد أبداً
- كان يقسم الأرباح بعدل

حتى الذين لا يؤمنون به كانوا يتركون عنده أموالهم وأشياءهم الثمينة، لأنهم يعرفون أنه أمين.

الدرس المهم: الصدق والأمانة يجعلان الناس يحبونك ويثقون بك، وهذا أهم من المال.`
    },
    {
      id: "kind-to-animals",
      title: "رحمة النبي ﷺ بالحيوانات",
      description: "قصص عن رحمة النبي بالحيوانات",
      ageGroup: "3-6",
      category: "kindness",
      readTime: 5,
      moralLesson: "يجب أن نكون رحماء مع جميع المخلوقات",
      imageDescription: "Gentle scene of the Prophet being kind to various animals",
      content: `النبي محمد ﷺ كان رحيماً جداً، ليس فقط مع الناس، بل مع الحيوانات أيضاً!

قصة القطة:
كان للنبي ﷺ قطة صغيرة اسمها "مُؤيزة". في يوم من الأيام، نامت القطة على كُم ثوب النبي ﷺ. عندما أراد أن يقوم للصلاة، قطع جزءاً من كُمه حتى لا يوقظ القطة الصغيرة!

قصة الجمل المتعب:
رأى النبي ﷺ جملاً يبكي لأن صاحبه كان يحمّله أكثر من طاقته ولا يطعمه جيداً. فنصح النبي ﷺ صاحب الجمل أن يكون لطيفاً معه ويطعمه ويسقيه.

قصة العصفور:
مرة رأى النبي ﷺ رجلاً أخذ بيض عصفور صغير، فكانت أمه العصفورة تطير حوله وتبكي. فقال النبي ﷺ: "ارجعوا البيض لأمه، لا تحزنوها".

ماذا نتعلم؟
- نطعم الحيوانات ونسقيها
- لا نؤذي الحيوانات أبداً
- نساعد الحيوانات المتعبة
- نحافظ على بيوت الطيور والحيوانات

الدرس المهم: الرحمة مع الحيوانات تدل على القلب الطيب، والله يحب الرحماء.`
    },
    {
      id: "cave-hira",
      title: "النبي ﷺ في غار حراء",
      description: "قصة تعبد النبي في الغار",
      ageGroup: "7-10",
      category: "wisdom",
      readTime: 6,
      moralLesson: "التفكر في خلق الله مهم جداً",
      imageDescription: "Peaceful cave with soft divine light representing contemplation",
      content: `قبل أن يصبح النبي محمد ﷺ رسولاً، كان يحب أن يجلس وحده ليفكر في خلق الله العظيم.

مكان التفكر:
كان يذهب إلى غار صغير في جبل قريب من مكة اسمه "غار حراء". هذا الغار هادئ وبعيد عن ضوضاء الناس.

ماذا كان يفعل في الغار؟
- ينظر إلى السماء ويفكر: من خلق هذه النجوم الجميلة؟
- يشاهد الجبال ويسأل: من جعلها قوية وثابتة؟
- يرى الطيور تطير ويتعجب: من علّمها الطيران؟
- كان يعرف أن الله هو الذي خلق كل شيء

لماذا كان يفعل ذلك؟
- ليكون قريباً من الله
- ليفهم الحياة أكثر
- ليصبح قلبه نظيفاً وصافياً
- ليستعد لمهمة عظيمة

في الغار نزل عليه الوحي:
في يوم مبارك، وهو في الغار، جاءه الملك جبريل عليه السلام وقال له: "اقرأ"، وهكذا بدأت الرسالة.

ماذا نتعلم نحن؟
- نخصص وقتاً للتفكر في خلق الله
- ننظر للسماء والأرض ونحمد الله
- نحب الهدوء أحياناً لنفكر
- نستعد لعمل الخير دائماً

الدرس المهم: التفكر في خلق الله يجعل قلوبنا قريبة منه ويساعدنا نكون أشخاصاً أفضل.`
    },
    {
      id: "hijra-story",
      title: "رحلة الهجرة المباركة",
      description: "قصة هجرة النبي ﷺ من مكة إلى المدينة للأطفال",
      ageGroup: "11-14",
      category: "wisdom",
      readTime: 8,
      moralLesson: "الصبر والثقة بالله يؤديان إلى النجاح",
      imageDescription: "Desert journey with gentle guidance and protection",
      content: `كان النبي محمد ﷺ وأصحابه في مكة يعانون من إيذاء الكفار، فقرر الهجرة إلى المدينة المنورة.

التخطيط الذكي:
- اختار النبي ﷺ أبا بكر ليكون رفيقه في الرحلة
- خرجا ليلاً حتى لا يراهما أحد
- سلكا طريقاً غير الطريق المعتاد
- استأجرا دليلاً يعرف الطرق الصحراوية

في غار ثور:
اختبأ النبي ﷺ وأبو بكر في غار ثور لثلاثة أيام:
- جاء المشركون يبحثون عنهما
- وصلوا إلى الغار ووقفوا أمامه
- خاف أبو بكر وقال: "يا رسول الله، لو نظر أحدهم تحت قدميه لرآنا"
- فقال النبي ﷺ: "يا أبا بكر، ما ظنك باثنين الله ثالثهما؟"

حماية الله:
- نسج العنكبوت خيوطه على باب الغار
- بنت الحمامة عشها أمام الغار
- فظن المشركون أنه لا يوجد أحد بالداخل
- انصرفوا دون أن يدخلوا الغار

الوصول إلى المدينة:
- استكملا الرحلة بأمان
- استقبلهما أهل المدينة بفرح عظيم
- أنشدوا: "طلع البدر علينا من ثنيات الوداع"
- بدأت حياة جديدة للمسلمين

الدروس المستفادة:
- التخطيط الجيد مهم مع التوكل على الله
- الصبر في الشدائد يؤدي إلى الفرج
- الله يحمي من يثق به
- الأصدقاء الصالحون نعمة عظيمة
- النجاح يأتي بعد التعب والجهد

الدرس المهم: عندما نثق بالله ونصبر على الصعوبات، فإن الله سيساعدنا ويوفقنا.`
    }
  ];

  const ageGroups = [
    { id: "all", name: "جميع الأعمار", icon: "groups", color: "gray" },
    { id: "3-6", name: "3-6 سنوات", icon: "child_care", color: "pink" },
    { id: "7-10", name: "7-10 سنوات", icon: "school", color: "blue" },
    { id: "11-14", name: "11-14 سنة", icon: "psychology", color: "purple" }
  ];

  const categories = [
    { id: "character", name: "الأخلاق", icon: "star", color: "emerald" },
    { id: "miracle", name: "المعجزات", icon: "auto_awesome", color: "gold" },
    { id: "kindness", name: "الرحمة", icon: "favorite", color: "pink" },
    { id: "wisdom", name: "الحكمة", icon: "lightbulb", color: "blue" }
  ];

  const filteredStories = selectedAgeGroup === "all" 
    ? childrenStories 
    : childrenStories.filter(story => story.ageGroup === selectedAgeGroup);

  const handleStoryComplete = (storyId: string) => {
    completeLesson(`kids-story-${storyId}`);
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId);
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/10 dark:to-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-gradient-to-r from-pink-100 to-blue-100 dark:from-pink-900/30 dark:to-blue-900/30 px-6 py-3 rounded-full mb-6">
            <span className="text-2xl">🌟</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">قصص الأنبياء للأطفال</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            السيرة النبوية للأطفال
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            تعلموا قصص النبي محمد ﷺ الجميلة بطريقة ممتعة ومناسبة لأعماركم
          </p>
        </div>

        {/* Fun Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-pink-100 to-pink-200 dark:from-pink-900/30 dark:to-pink-800/30 text-center">
            <CardContent className="p-4">
              <div className="text-3xl mb-2">📚</div>
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {childrenStories.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">قصة جميلة</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 text-center">
            <CardContent className="p-4">
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">4</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">أنواع مختلفة</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 text-center">
            <CardContent className="p-4">
              <div className="text-3xl mb-2">⏰</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {Math.round(childrenStories.reduce((acc, story) => acc + story.readTime, 0) / childrenStories.length)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">دقائق للقصة</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 text-center">
            <CardContent className="p-4">
              <div className="text-3xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">100%</div>
              <p className="text-sm text-gray-600 dark:text-gray-400">دروس مفيدة</p>
            </CardContent>
          </Card>
        </div>

        {/* Age Group Selection */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {ageGroups.map((group) => (
            <Button
              key={group.id}
              variant={selectedAgeGroup === group.id ? "default" : "outline"}
              onClick={() => setSelectedAgeGroup(group.id)}
              className={`flex items-center space-x-2 rtl:space-x-reverse ${
                selectedAgeGroup === group.id 
                  ? "bg-gradient-to-r from-pink-500 to-blue-500 text-white" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-pink-50 hover:to-blue-50"
              }`}
            >
              <span className="material-symbols-outlined">{group.icon}</span>
              <span className="font-amiri">{group.name}</span>
            </Button>
          ))}
        </div>

        {/* Stories Grid */}
        {!selectedStory ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => {
              const categoryInfo = getCategoryInfo(story.category);
              return (
                <Card 
                  key={story.id} 
                  className="cursor-pointer card-hover bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-2 border-transparent hover:border-gradient-to-r hover:from-pink-200 hover:to-blue-200"
                  onClick={() => setSelectedStory(story)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`bg-${categoryInfo?.color}-100 text-${categoryInfo?.color}-700 dark:bg-${categoryInfo?.color}-900/30 dark:text-${categoryInfo?.color}-400`}>
                        <span className="material-symbols-outlined text-sm mr-1 rtl:ml-1">
                          {categoryInfo?.icon}
                        </span>
                        {categoryInfo?.name}
                      </Badge>
                      <Badge variant="outline" className="text-purple-600">
                        {story.ageGroup}
                      </Badge>
                    </div>
                    
                    <div className="h-32 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-center text-emerald-700 dark:text-emerald-400">
                        <span className="text-4xl mb-2 block">📖</span>
                        <p className="text-xs font-inter opacity-75">{story.imageDescription}</p>
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg font-amiri text-gray-900 dark:text-white mb-2">
                      {story.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
                      {story.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-500">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{story.readTime} دقائق</span>
                      </div>
                      <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">
                        arrow_forward
                      </span>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gold-50 to-yellow-50 dark:from-gold-900/20 dark:to-yellow-900/20 rounded-lg p-3">
                      <p className="text-xs font-amiri text-gold-700 dark:text-gold-400 font-medium">
                        💡 الدرس: {story.moralLesson}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Selected Story Detail View */
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedStory(null)}
                    className="text-pink-600 border-pink-200 hover:bg-pink-50"
                  >
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">arrow_back</span>
                    العودة للقصص
                  </Button>
                  
                  <Button
                    onClick={() => handleStoryComplete(selectedStory.id)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                  >
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">check_circle</span>
                    أنهيت القصة
                  </Button>
                </div>
                
                <div className="text-center mb-6">
                  <div className="h-48 bg-gradient-to-br from-emerald-100 to-blue-100 dark:from-emerald-900/30 dark:to-blue-900/30 rounded-xl mb-6 flex items-center justify-center">
                    <div className="text-center text-emerald-700 dark:text-emerald-400">
                      <span className="text-6xl mb-2 block">📚</span>
                      <p className="text-sm font-inter">{selectedStory.imageDescription}</p>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-amiri font-bold bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
                    {selectedStory.title}
                  </h2>
                  
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    <Badge className="bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400">
                      {selectedStory.ageGroup}
                    </Badge>
                    <Badge className={`bg-${getCategoryInfo(selectedStory.category)?.color}-100 text-${getCategoryInfo(selectedStory.category)?.color}-700`}>
                      {getCategoryInfo(selectedStory.category)?.name}
                    </Badge>
                    <Badge variant="outline" className="text-purple-600">
                      {selectedStory.readTime} دقائق
                    </Badge>
                  </div>
                  
                  <p className="text-lg text-gray-600 dark:text-gray-300 font-inter">
                    {selectedStory.description}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Story Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div className="font-amiri text-xl leading-relaxed text-gray-900 dark:text-white whitespace-pre-line p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                    {selectedStory.content}
                  </div>
                </div>
                
                {/* Moral Lesson */}
                <div className="mt-8 p-6 bg-gradient-to-r from-gold-100 to-yellow-100 dark:from-gold-900/30 dark:to-yellow-900/30 rounded-xl">
                  <h3 className="text-lg font-amiri font-bold text-gold-700 dark:text-gold-400 mb-3 flex items-center">
                    <span className="text-2xl mr-2 rtl:ml-2">💡</span>
                    الدرس المستفاد
                  </h3>
                  <p className="text-lg font-amiri text-gold-700 dark:text-gold-300 font-medium">
                    {selectedStory.moralLesson}
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">bookmark_add</span>
                    حفظ القصة
                  </Button>
                  <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">volume_up</span>
                    استماع للقصة
                  </Button>
                  <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">quiz</span>
                    أسئلة ممتعة
                  </Button>
                  <Button variant="outline" className="border-pink-200 text-pink-600 hover:bg-pink-50">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">share</span>
                    شارك مع الأصدقاء
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fun Activities Section */}
        <Card className="mt-8 bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-blue-900/30">
          <CardContent className="p-6">
            <h3 className="text-xl font-amiri font-bold text-gray-900 dark:text-white mb-6 text-center">
              أنشطة ممتعة للأطفال 🎨
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                <div className="text-4xl mb-3">🎨</div>
                <h4 className="font-amiri font-bold mb-2">تلوين القصص</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  صور جميلة للتلوين مع كل قصة
                </p>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                <div className="text-4xl mb-3">🧩</div>
                <h4 className="font-amiri font-bold mb-2">ألعاب تفاعلية</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ألغاز وألعاب مرتبطة بالقصص
                </p>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-xl">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="font-amiri font-bold mb-2">شهادات تقدير</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  احصل على شهادة بعد كل قصة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

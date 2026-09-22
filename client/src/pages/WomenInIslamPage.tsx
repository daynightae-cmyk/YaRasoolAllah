import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "rights" | "worship" | "family" | "work" | "education" | "social";
  tags: string[];
  difficulty: "basic" | "intermediate" | "advanced";
}

export default function WomenInIslamPage() {
  const { updateLastVisited } = useProgress();
  const { direction } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);

  useEffect(() => {
    updateLastVisited("/women-in-islam");
  }, [updateLastVisited]);

  const faqItems: FAQItem[] = [
    {
      id: "rights-1",
      question: "ما هي حقوق المرأة في الإسلام؟",
      answer: `الإسلام كرم المرأة وأعطاها حقوقاً شاملة في جميع جوانب الحياة:

الحقوق الدينية:
- حق التعبد والتقرب إلى الله
- حق طلب العلم الشرعي
- حق أداء فريضة الحج
- المساواة في الثواب والعقاب

الحقوق الاجتماعية:
- حق الاحترام والتكريم
- حق العدل والمساواة في المعاملة
- حق الحماية والأمان
- حق التعبير عن الرأي

الحقوق الاقتصادية:
- حق الملكية والتصرف في المال
- حق العمل والكسب الحلال
- حق الميراث
- حق المهر والنفقة

الحقوق الأسرية:
- حق اختيار الزوج
- حق المعاملة بالمعروف
- حق التربية والتعليم
- حق الرعاية والحماية`,
      category: "rights",
      tags: ["حقوق", "كرامة", "مساواة"],
      difficulty: "basic"
    },
    {
      id: "worship-1",
      question: "هل تختلف العبادات للمرأة عن الرجل؟",
      answer: `أصل العبادات واحد للرجل والمرأة، مع بعض الاختلافات المراعية لطبيعة المرأة:

الصلاة:
- نفس الأحكام مع مراعاة أحوال الحيض والنفاس
- يسن للمرأة الصلاة في بيتها أفضل من المسجد
- يجوز لها إمامة النساء فقط

الصوم:
- نفس أحكام الرجل مع الإعفاء أثناء الحيض والنفاس
- تقضي الأيام المفطرة بعد الطهر
- يسن لها الإكثار من الصوم المستحب

الحج:
- نفس المناسك مع وجوب المحرم للسفر
- الاشتراط في الإحرام جائز عند الحاجة
- لا تكشف وجهها أثناء الإحرام أمام الأجانب

الزكاة:
- نفس الأحكام، وتخرج زكاة مالها بنفسها
- يجوز إخراجها عن طريق وليها أو زوجها بإذنها`,
      category: "worship",
      tags: ["عبادة", "صلاة", "صوم", "حج"],
      difficulty: "intermediate"
    },
    {
      id: "family-1",
      question: "ما هو دور المرأة في الأسرة المسلمة؟",
      answer: `المرأة لها دور محوري في بناء الأسرة المسلمة:

كزوجة:
- شريكة في بناء البيت المسلم
- مؤتمنة على راحة الزوج وسعادته
- محافظة على عرض الزوج وماله
- مطيعة في المعروف غير العاصي

كأم:
- مربية الأجيال ومدرستهم الأولى
- مسؤولة عن التربية الدينية والأخلاقية
- قدوة في السلوك والأخلاق
- الجنة تحت أقدامها كما قال الرسول ﷺ

كابنة:
- برة بوالديها ومطيعة لهما
- معينة لأسرتها في الخير
- محافظة على سمعة العائلة
- قدوة لإخوتها الصغار

في إدارة البيت:
- تنظيم شؤون المنزل
- تربية الأطفال وتعليمهم
- إدارة الميزانية بحكمة
- خلق جو من السكينة والمودة`,
      category: "family",
      tags: ["أسرة", "زوجة", "أم", "تربية"],
      difficulty: "basic"
    },
    {
      id: "work-1",
      question: "هل يحق للمرأة العمل في الإسلام؟",
      answer: `نعم، يحق للمرأة العمل في الإسلام بضوابط شرعية:

المبدأ العام:
- الأصل جواز عمل المرأة إذا احتاجت أو أرادت
- بشرط عدم إهمال واجباتها الأساسية
- مع مراعاة الضوابط الشرعية

الضوابط المطلوبة:
- العمل في مجال مناسب لطبيعتها
- الالتزام بالحجاب والآداب الإسلامية
- تجنب الخلوة والاختلاط المحرم
- عدم السفر بدون محرم للمسافات الطويلة

الأعمال المناسبة:
- التعليم والتربية
- الطب وخاصة للنساء والأطفال
- العمل الخيري والاجتماعي
- الأعمال المنزلية والحرفية
- الأعمال الإدارية المناسبة

حقوقها في العمل:
- المساواة في الأجر عند تساوي العمل
- الحصول على إجازة الأمومة
- توفير بيئة عمل مناسبة
- احترام خصوصيتها وكرامتها`,
      category: "work",
      tags: ["عمل", "مهنة", "ضوابط"],
      difficulty: "intermediate"
    },
    {
      id: "education-1",
      question: "ما هو موقف الإسلام من تعليم المرأة؟",
      answer: `الإسلام يحث على تعليم المرأة ويعتبره حقاً وواجباً:

الأدلة الشرعية:
- "طلب العلم فريضة على كل مسلم ومسلمة"
- القرآن لم يفرق بين الرجل والمرأة في طلب العلم
- الصحابيات كن يتعلمن ويعلمن

أنواع العلوم المطلوبة:
- العلوم الشرعية (فرض عين)
- علوم الحياة والطب والتربية
- المهارات النافعة للمجتمع
- العلوم التي تحتاجها في دورها

حقها في التعليم:
- من الطفولة حتى الكبر
- في جميع مراحل التعليم
- بالطريقة المناسبة لطبيعتها
- مع مراعاة الضوابط الشرعية

دورها في التعليم:
- تعليم أطفالها وتربيتهم
- تعليم النساء الأخريات
- نشر العلم النافع في المجتمع
- القدوة في السلوك العلمي`,
      category: "education",
      tags: ["تعليم", "علم", "تربية"],
      difficulty: "basic"
    },
    {
      id: "social-1",
      question: "كيف تشارك المرأة في المجتمع إسلامياً؟",
      answer: `المرأة شريك فعال في بناء المجتمع المسلم:

المشاركة الاجتماعية:
- الأمر بالمعروف والنهي عن المنكر
- المشاركة في الأعمال الخيرية
- رعاية الأيتام والأرامل
- خدمة الجاليات المسلمة

المشاركة الاقتصادية:
- الاستثمار والتجارة الحلال
- دعم المشاريع النافعة
- المساهمة في التنمية
- إدارة الأوقاف النسائية

المشاركة التعليمية:
- تعليم النساء والفتيات
- نشر الوعي الديني
- التدريب على المهارات
- الإشراف على البرامج التربوية

المشاركة الدعوية:
- دعوة النساء إلى الإسلام
- إعداد البرامج النسائية
- المشاركة في المؤتمرات
- الكتابة والتأليف النافع

ضوابط المشاركة:
- عدم إهمال الواجبات الأساسية
- الالتزام بالآداب الشرعية
- التوازن بين الأدوار المختلفة
- التعاون مع الرجل لا التنافس معه`,
      category: "social",
      tags: ["مجتمع", "مشاركة", "دور اجتماعي"],
      difficulty: "advanced"
    }
  ];

  const categories = [
    { id: "all", name: "الكل", icon: "category", color: "gray" },
    { id: "rights", name: "الحقوق والكرامة", icon: "balance", color: "emerald" },
    { id: "worship", name: "العبادات", icon: "self_improvement", color: "blue" },
    { id: "family", name: "الأسرة والزواج", icon: "family_restroom", color: "pink" },
    { id: "work", name: "العمل والمهنة", icon: "work", color: "purple" },
    { id: "education", name: "التعليم والعلم", icon: "school", color: "orange" },
    { id: "social", name: "الدور الاجتماعي", icon: "groups", color: "teal" }
  ];

  const filteredFAQs = faqItems.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "basic": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "basic": return "أساسي";
      case "intermediate": return "متوسط";
      case "advanced": return "متقدم";
      default: return difficulty;
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-pink-100 dark:bg-pink-900/30 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">female</span>
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">مكانة المرأة المؤمنة</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gray-900 dark:text-white mb-4">
            المرأة في الإسلام
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            تعرفي على مكانة المرأة وحقوقها ودورها في الإسلام من خلال أسئلة وأجوبة شاملة
          </p>
        </div>

        {/* Inspirational Quote */}
        <Card className="mb-8 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <span className="text-4xl">🌹</span>
            </div>
            <blockquote className="text-xl font-amiri text-gray-900 dark:text-white mb-2">
              "الجنة تحت أقدام الأمهات"
            </blockquote>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-inter">
              حديث شريف يُبين مكانة المرأة الأم في الإسلام
            </p>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Input
                  placeholder="ابحثي في الأسئلة والأجوبة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${direction === "rtl" ? "text-right pr-12" : "text-left pl-12"}`}
                />
                <span className={`material-symbols-outlined absolute ${direction === "rtl" ? "right-4" : "left-4"} top-1/2 transform -translate-y-1/2 text-gray-400`}>
                  search
                </span>
              </div>
              <Button className="bg-pink-600 hover:bg-pink-700 shrink-0">
                <span className="material-symbols-outlined mr-2 rtl:ml-2">search</span>
                بحث
              </Button>
            </div>

            {/* Quick Search Tags */}
            <div className="flex flex-wrap gap-2">
              {["الحقوق", "الحجاب", "العمل", "الزواج", "التربية", "التعليم"].map((tag) => (
                <Button
                  key={tag}
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery(tag)}
                  className="text-pink-600 dark:text-pink-400"
                >
                  {tag}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`h-auto p-4 ${
                selectedCategory === category.id 
                  ? "bg-pink-600 text-white" 
                  : "text-pink-600 dark:text-pink-400"
              }`}
            >
              <div className="text-center w-full">
                <span className="material-symbols-outlined text-2xl mb-2 block">{category.icon}</span>
                <span className="font-amiri text-sm block">{category.name}</span>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {category.id === "all" ? faqItems.length : faqItems.filter(item => item.category === category.id).length}
                </Badge>
              </div>
            </Button>
          ))}
        </div>

        {/* FAQ Items */}
        {!selectedFAQ ? (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <Card 
                key={faq.id} 
                className="cursor-pointer card-hover"
                onClick={() => setSelectedFAQ(faq)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-amiri text-gray-900 dark:text-white mb-2">
                        {faq.question}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={getDifficultyColor(faq.difficulty)}>
                          {getDifficultyText(faq.difficulty)}
                        </Badge>
                        {faq.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-pink-600 dark:text-pink-400">
                      arrow_forward
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 font-inter line-clamp-3">
                    {faq.answer.split('\n')[0]}...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Selected FAQ Detail View */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedFAQ(null)}
                    className="text-pink-600"
                  >
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">arrow_back</span>
                    العودة للأسئلة
                  </Button>
                  
                  <div className="flex gap-2">
                    <Badge className={getDifficultyColor(selectedFAQ.difficulty)}>
                      {getDifficultyText(selectedFAQ.difficulty)}
                    </Badge>
                  </div>
                </div>
                
                <CardTitle className="text-2xl md:text-3xl font-amiri text-pink-700 dark:text-pink-400 mb-4">
                  {selectedFAQ.question}
                </CardTitle>
                
                <div className="flex flex-wrap gap-2">
                  {selectedFAQ.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div className="font-amiri text-lg leading-relaxed text-gray-900 dark:text-white whitespace-pre-line">
                    {selectedFAQ.answer}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button className="bg-pink-600 hover:bg-pink-700">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">bookmark_add</span>
                    حفظ
                  </Button>
                  <Button variant="outline">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">share</span>
                    مشاركة
                  </Button>
                  <Button variant="outline" className="text-purple-600 border-purple-200">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">thumb_up</span>
                    مفيد
                  </Button>
                  <Button variant="outline">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">print</span>
                    طباعة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Resources */}
        <Card className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
          <CardContent className="p-6">
            <h3 className="text-lg font-amiri font-bold text-gray-900 dark:text-white mb-4 text-center">
              مصادر إضافية للمرأة المسلمة
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <span className="material-symbols-outlined text-3xl text-pink-600 mb-2 block">menu_book</span>
                <h4 className="font-amiri font-bold mb-2">كتب متخصصة</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">مكتبة متنوعة من الكتب عن المرأة في الإسلام</p>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <span className="material-symbols-outlined text-3xl text-purple-600 mb-2 block">video_library</span>
                <h4 className="font-amiri font-bold mb-2">محاضرات ودروس</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">محاضرات علمية متخصصة للمرأة المسلمة</p>
              </div>
              
              <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
                <span className="material-symbols-outlined text-3xl text-emerald-600 mb-2 block">groups</span>
                <h4 className="font-amiri font-bold mb-2">مجتمع نسائي</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">تواصلي مع أخواتك المسلمات وتبادلي الخبرات</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

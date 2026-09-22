import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "../contexts/ProgressContext";
import { useLanguage } from "../contexts/LanguageContext";

interface Pillar {
  id: string;
  title: string;
  arabicName: string;
  description: string;
  importance: string;
  conditions: string[];
  benefits: string[];
  commonMistakes: string[];
  detailedContent: string;
  icon: string;
  color: string;
}

export default function FivePillarsPage() {
  const { updateLastVisited, completeLesson } = useProgress();
  const { direction } = useLanguage();
  const [selectedPillar, setSelectedPillar] = useState<Pillar | null>(null);

  useEffect(() => {
    updateLastVisited("/five-pillars");
  }, [updateLastVisited]);

  const pillars: Pillar[] = [
    {
      id: "shahada",
      title: "الشهادة",
      arabicName: "لا إله إلا الله محمد رسول الله",
      description: "شهادة أن لا إله إلا الله وأن محمداً رسول الله",
      importance: "الشهادة هي أساس الإسلام وبوابة الدخول فيه، وهي إقرار بوحدانية الله وبرسالة محمد صلى الله عليه وسلم",
      conditions: [
        "العلم بمعناها",
        "اليقين التام",
        "القبول والانقياد",
        "الإخلاص في النطق بها",
        "الصدق",
        "المحبة لها ولمقتضاها",
        "الانقياد لمدلولها"
      ],
      benefits: [
        "تحقيق التوحيد الخالص لله",
        "الخروج من الشرك إلى التوحيد",
        "دخول الإسلام والجنة",
        "تكفير الذنوب السابقة",
        "الأمان من النار"
      ],
      commonMistakes: [
        "النطق بها دون فهم معناها",
        "عدم العمل بمقتضاها",
        "الشرك الأصغر في الأعمال",
        "التساهل في التوحيد"
      ],
      detailedContent: `الشهادة هي الركن الأول من أركان الإسلام، وهي قول: "لا إله إلا الله، محمد رسول الله". 

معنى "لا إله إلا الله":
نفي الألوهية عن كل ما سوى الله، وإثباتها لله وحده لا شريك له. فالله وحده المستحق للعبادة، وكل معبود سواه باطل.

معنى "محمد رسول الله":
الإقرار بأن محمداً صلى الله عليه وسلم عبد الله ورسوله إلى الناس كافة، وأنه خاتم النبيين، ووجوب طاعته فيما أمر، وتصديقه فيما أخبر، واجتناب ما نهى عنه وزجر، وأن لا يُعبد الله إلا بما شرع.

هذه الشهادة هي مفتاح الجنة، ولكن للمفتاح أسنان، فإن كان المفتاح له أسنان فتح، وإلا فلا. وأسنان هذا المفتاح هي شروط الشهادة وأعمال الإسلام.`,
      icon: "star",
      color: "emerald"
    },
    {
      id: "salah",
      title: "الصلاة",
      arabicName: "إقامة الصلاة",
      description: "أداء الصلوات الخمس في أوقاتها المحددة",
      importance: "الصلاة عماد الدين وهي الصلة بين العبد وربه، وأول ما يحاسب عليه العبد يوم القيامة",
      conditions: [
        "الطهارة من الحدث",
        "طهارة البدن والثوب والمكان",
        "ستر العورة",
        "دخول الوقت",
        "استقبال القبلة",
        "النية"
      ],
      benefits: [
        "تطهير النفس من الذنوب",
        "الصلة المباشرة مع الله",
        "تنمية الخشوع والتقوى",
        "النهي عن الفحشاء والمنكر",
        "السكينة والطمأنينة"
      ],
      commonMistakes: [
        "التساهل في أوقات الصلاة",
        "عدم إتقان الوضوء",
        "السرعة المفرطة في الأداء",
        "عدم الخشوع والحضور",
        "ترك السنن والآداب"
      ],
      detailedContent: `الصلاة هي الركن الثاني من أركان الإسلام، وهي أهم الأعمال بعد الشهادتين.

فرضت الصلاة في ليلة الإسراء والمعراج، وهي خمس صلوات في اليوم والليلة: الفجر والظهر والعصر والمغرب والعشاء.

أهمية الصلاة:
- قال رسول الله ﷺ: "العهد الذي بيننا وبينهم الصلاة، فمن تركها فقد كفر"
- هي أول ما يحاسب عليه العبد يوم القيامة
- إذا صلحت صلح سائر العمل، وإذا فسدت فسد سائر العمل

آداب الصلاة:
- التبكير إلى الصلاة
- الطهارة الكاملة
- التوجه للقبلة
- الخشوع والحضور مع الله
- قراءة القرآن بتدبر
- الدعاء في السجود والتشهد`,
      icon: "self_improvement",
      color: "blue"
    },
    {
      id: "zakat",
      title: "الزكاة",
      arabicName: "إيتاء الزكاة",
      description: "إخراج حق الله في المال للمستحقين",
      importance: "الزكاة طهارة للمال والنفس، وهي حق الفقراء في أموال الأغنياء",
      conditions: [
        "بلوغ النصاب",
        "حولان الحول",
        "كون المال فاضلاً عن الحاجة الأساسية",
        "كون المال نامياً أو قابلاً للنماء",
        "تمام الملك"
      ],
      benefits: [
        "تطهير المال والنفس",
        "تحقيق التكافل الاجتماعي",
        "محو البركة في المال",
        "علاج أمراض القلوب كالبخل",
        "تقوية الروابط الاجتماعية"
      ],
      commonMistakes: [
        "عدم معرفة النصاب الصحيح",
        "التأخير في الإخراج",
        "إخراج الرديء من المال",
        "عدم التحقق من استحقاق المتلقي",
        "المن والأذى بعد الإعطاء"
      ],
      detailedContent: `الزكاة هي الركن الثالث من أركان الإسلام، وهي حق مقدر شرعاً في أموال مخصوصة لطائفة مخصوصة في وقت مخصوص.

أنواع الأموال التي تجب فيها الزكاة:
1. النقود (الذهب والفضة والعملات الورقية)
2. عروض التجارة
3. الزروع والثمار
4. الأنعام (الإبل والبقر والغنم)
5. الركاز والمعادن

مقدار الزكاة:
- في النقود وعروض التجارة: 2.5%
- في الزروع والثمار: 10% أو 5% حسب نوع الري
- في الأنعام: مقادير مختلفة حسب العدد والنوع

مصارف الزكاة الثمانية:
1. الفقراء
2. المساكين  
3. العاملين عليها
4. المؤلفة قلوبهم
5. في الرقاب
6. الغارمين
7. في سبيل الله
8. ابن السبيل

الحكمة من الزكاة:
- تطهير المال من الشبهات
- تطهير النفس من البخل والشح
- تحقيق العدالة الاجتماعية
- تقوية أواصر المحبة بين المسلمين`,
      icon: "volunteer_activism",
      color: "green"
    },
    {
      id: "hajj",
      title: "الحج",
      arabicName: "حج البيت",
      description: "قصد مكة المكرمة لأداء المناسك في وقت مخصوص",
      importance: "الحج فريضة العمر على من استطاع إليه سبيلاً، وهو جهاد لكل ضعيف",
      conditions: [
        "الإسلام",
        "البلوغ",
        "العقل",
        "الاستطاعة المالية والبدنية",
        "أمن الطريق",
        "وجود المحرم للمرأة"
      ],
      benefits: [
        "مغفرة الذنوب",
        "العودة كيوم ولدته أمه",
        "الجزاء الجنة",
        "تعلم الصبر والتحمل",
        "الوحدة بين المسلمين"
      ],
      commonMistakes: [
        "عدم تعلم أحكام الحج قبل السفر",
        "التركيز على السياحة أكثر من العبادة",
        "ترك السنن والآداب",
        "الإكثار من الجدال والمشاحنات",
        "عدم الاستفادة الروحية"
      ],
      detailedContent: `الحج هو الركن الخامس من أركان الإسلام، وهو قصد البيت الحرام لأداء أعمال مخصوصة في وقت مخصوص.

أشهر الحج: شوال وذو القعدة وعشر من ذي الحجة.

أعمال الحج:
1. الإحرام من الميقات
2. التلبية
3. طواف القدوم للمفرد والقارن
4. الوقوف بعرفة (الركن الأعظم)
5. المبيت بمزدلفة
6. رمي جمرة العقبة
7. النحر
8. الحلق أو التقصير
9. طواف الإفاضة
10. السعي بين الصفا والمروة
11. رمي الجمرات في أيام التشريق
12. طواف الوداع

الحكمة من الحج:
- تعظيم شعائر الله
- تذكر الآخرة والوقوف بين يدي الله
- تحقيق الوحدة بين المسلمين
- التدريب على الصبر والتحمل
- التوبة النصوح والعودة إلى الله

فضل الحج:
قال رسول الله ﷺ: "من حج فلم يرفث ولم يفسق رجع كيوم ولدته أمه"`,
      icon: "temple_buddhist",
      color: "purple"
    },
    {
      id: "sawm",
      title: "الصوم",
      arabicName: "صوم رمضان",
      description: "الإمساك عن المفطرات من طلوع الفجر إلى غروب الشمس",
      importance: "الصوم تربية للنفس وتقوية للإرادة وتحقيق للتقوى",
      conditions: [
        "الإسلام",
        "التكليف (البلوغ والعقل)",
        "القدرة على الصوم",
        "الإقامة (عدم السفر)",
        "السلامة من الموانع للمرأة"
      ],
      benefits: [
        "تحقيق التقوى",
        "تهذيب النفس وتزكيتها",
        "الشعور مع الفقراء",
        "تقوية الإرادة والصبر",
        "الصحة البدنية والنفسية"
      ],
      commonMistakes: [
        "عدم تحديد نية الصوم",
        "الإفراط في الطعام عند الإفطار",
        "السهر المفرط وتضييع الصلوات",
        "الغفلة عن الأعمال الصالحة",
        "سوء الخلق وعدم كظم الغيظ"
      ],
      detailedContent: `الصوم هو الركن الرابع من أركان الإسلام، وهو الإمساك عن جميع المفطرات من طلوع الفجر الصادق إلى غروب الشمس بنية.

أنواع الصوم:
1. صوم رمضان (فرض)
2. صوم الكفارات (فرض)
3. صوم النذر (فرض)
4. صوم التطوع (سنة)

المفطرات:
1. الأكل والشرب عمداً
2. الجماع
3. إنزال المني بشهوة
4. إخراج القيء عمداً
5. خروج دم الحيض والنفاس
6. إدخال شيء إلى الجوف عمداً

سنن الصوم:
- تأخير السحور
- تعجيل الفطور
- الفطر على رطب أو تمر أو ماء
- الدعاء عند الفطر
- الإكثار من قراءة القرآن
- العطف على الفقراء والمساكين

الحكمة من الصوم:
- تحقيق التقوى كما قال تعالى: "لعلكم تتقون"
- تربية النفس على الصبر والتحمل
- الشعور مع الفقراء والمحتاجين
- تقوية الروابط الاجتماعية
- تطهير البدن والروح

فضل صوم رمضان:
قال رسول الله ﷺ: "من صام رمضان إيماناً واحتساباً غفر له ما تقدم من ذنبه"`,
      icon: "schedule",
      color: "orange"
    }
  ];

  const handlePillarComplete = (pillarId: string) => {
    completeLesson(`pillar-${pillarId}`);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 rtl:space-x-reverse bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 rounded-full mb-6">
            <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400">temple_buddhist</span>
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">أسس الدين الحنيف</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-amiri font-bold text-gray-900 dark:text-white mb-4">
            أركان الإسلام الخمسة
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 font-inter max-w-2xl mx-auto">
            تعرف على الأسس الخمسة للإسلام التي بني عليها الدين الحنيف
          </p>
        </div>

        {/* Pillars Grid */}
        {!selectedPillar ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {pillars.map((pillar, index) => (
              <Card 
                key={pillar.id} 
                className={`cursor-pointer card-hover bg-gradient-to-br from-${pillar.color}-50 to-${pillar.color}-100 dark:from-${pillar.color}-900/20 dark:to-${pillar.color}-800/20`}
                onClick={() => setSelectedPillar(pillar)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className={`w-12 h-12 bg-${pillar.color}-600 rounded-xl flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-white text-2xl">{pillar.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                        <span className="text-lg font-amiri font-bold text-gray-900 dark:text-white">
                          {index + 1}. {pillar.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-amiri">
                        {pillar.arabicName}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 font-inter mb-4 leading-relaxed">
                    {pillar.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Badge className={`bg-${pillar.color}-100 text-${pillar.color}-700 dark:bg-${pillar.color}-900/30 dark:text-${pillar.color}-400`}>
                      ركن أساسي
                    </Badge>
                    <span className={`material-symbols-outlined text-${pillar.color}-600 dark:text-${pillar.color}-400`}>
                      arrow_forward
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Selected Pillar Detail View */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPillar(null)}
                    className="text-emerald-600"
                  >
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">arrow_back</span>
                    العودة للأركان
                  </Button>
                  
                  <Button
                    onClick={() => handlePillarComplete(selectedPillar.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">check_circle</span>
                    أتممت دراسة هذا الركن
                  </Button>
                </div>
                
                <div className="text-center mb-6">
                  <div className={`w-24 h-24 bg-gradient-to-br from-${selectedPillar.color}-500 to-${selectedPillar.color}-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="material-symbols-outlined text-white text-4xl">{selectedPillar.icon}</span>
                  </div>
                  
                  <h2 className="text-3xl font-amiri font-bold text-gray-900 dark:text-white mb-2">
                    {selectedPillar.title}
                  </h2>
                  <p className="text-xl font-amiri text-emerald-600 dark:text-emerald-400 mb-4">
                    {selectedPillar.arabicName}
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-300 font-inter">
                    {selectedPillar.description}
                  </p>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Importance */}
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-amiri font-bold text-emerald-700 dark:text-emerald-400 mb-3">
                    الأهمية والفضل
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-inter leading-relaxed">
                    {selectedPillar.importance}
                  </p>
                </div>

                {/* Detailed Content */}
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <div className="font-amiri text-lg leading-relaxed text-gray-900 dark:text-white whitespace-pre-line">
                    {selectedPillar.detailedContent}
                  </div>
                </div>

                {/* Conditions */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-amiri font-bold text-blue-700 dark:text-blue-400 mb-3">
                    الشروط والأحكام
                  </h3>
                  <ul className="space-y-2">
                    {selectedPillar.conditions.map((condition, index) => (
                      <li key={index} className="flex items-start space-x-2 rtl:space-x-reverse">
                        <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm mt-1">check_circle</span>
                        <span className="text-gray-700 dark:text-gray-300 font-inter">{condition}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-amiri font-bold text-green-700 dark:text-green-400 mb-3">
                    الفوائد والثمرات
                  </h3>
                  <ul className="space-y-2">
                    {selectedPillar.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start space-x-2 rtl:space-x-reverse">
                        <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm mt-1">star</span>
                        <span className="text-gray-700 dark:text-gray-300 font-inter">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Common Mistakes */}
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
                  <h3 className="text-lg font-amiri font-bold text-red-700 dark:text-red-400 mb-3">
                    أخطاء شائعة يجب تجنبها
                  </h3>
                  <ul className="space-y-2">
                    {selectedPillar.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start space-x-2 rtl:space-x-reverse">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-sm mt-1">warning</span>
                        <span className="text-gray-700 dark:text-gray-300 font-inter">{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 justify-center pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">bookmark_add</span>
                    حفظ
                  </Button>
                  <Button variant="outline">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">share</span>
                    مشاركة
                  </Button>
                  <Button variant="outline" className="text-purple-600 border-purple-200">
                    <span className="material-symbols-outlined mr-2 rtl:ml-2">quiz</span>
                    اختبار الفهم
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
      </div>
    </div>
  );
}

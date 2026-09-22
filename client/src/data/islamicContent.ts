// Islamic content data - authentic sources only

export interface QuranVerse {
  id: string;
  surahNumber: number;
  verseNumber: number;
  arabicText: string;
  translationEn: string;
  translationFr: string;
  translationUr: string;
  tafsir: {
    source: string;
    text: string;
  }[];
}

export interface SeerahTopic {
  id: string;
  title: string;
  titleEn: string;
  titleFr: string;
  titleUr: string;
  description: string;
  content: string;
  imagePrompt: string;
  category: "early_life" | "prophethood" | "hijra" | "medina" | "final_years";
}

export interface PrayerStep {
  id: string;
  title: string;
  description: string;
  arabicText?: string;
  transliteration?: string;
  imagePrompt: string;
}

export interface DhikrItem {
  id: string;
  category: "morning" | "evening" | "general" | "sleep" | "food" | "travel";
  arabicText: string;
  transliteration: string;
  translation: string;
  repetitions?: number;
  source: string;
  benefits: string;
}

// Daily verses for inspiration
export const DAILY_VERSES: QuranVerse[] = [
  {
    id: "2-2-3",
    surahNumber: 2,
    verseNumber: 2,
    arabicText: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ",
    translationEn: "This is the Book about which there is no doubt, a guidance for those conscious of Allah.",
    translationFr: "C'est le Livre au sujet duquel il n'y a aucun doute, c'est un guide pour les pieux.",
    translationUr: "یہ وہ کتاب ہے جس میں کوئی شک نہیں، یہ متقیوں کے لیے ہدایت ہے۔",
    tafsir: [
      {
        source: "ابن كثير",
        text: "هذا ثناء على القرآن، وذلك أنه لا شك فيه أنه من عند الله"
      }
    ]
  },
  {
    id: "65-2-3",
    surahNumber: 65,
    verseNumber: 2,
    arabicText: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا ۝ وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ",
    translationEn: "And whoever fears Allah, He will make for him a way out. And will provide for him from where he does not expect.",
    translationFr: "Et quiconque craint Allah, Il lui donnera une issue favorable. Et Il lui accordera Ses dons par [des moyens] sur lesquels il ne comptait pas.",
    translationUr: "اور جو اللہ سے ڈرتا ہے، اللہ اس کے لیے نکلنے کا راستہ بنا دیتا ہے۔ اور اسے وہاں سے رزق دیتا ہے جہاں سے اس کا گمان بھی نہیں ہوتا۔",
    tafsir: [
      {
        source: "السعدي",
        text: "أي: ومن اتقى الله في جميع أموره، بأن امتثل أوامره واجتنب نواهيه، يجعل له من كل هم وغم وضيق مخرجاً"
      }
    ]
  }
];

// Seerah topics with detailed content
export const ALL_SEERAH_TOPICS: SeerahTopic[] = [
  {
    id: "birth",
    title: "ولادة النبي ﷺ",
    titleEn: "Birth of the Prophet ﷺ",
    titleFr: "Naissance du Prophète ﷺ",
    titleUr: "نبی ﷺ کی ولادت",
    description: "ولادة خاتم الأنبياء والمرسلين في مكة المكرمة",
    content: "وُلد النبي محمد صلى الله عليه وسلم في مكة المكرمة في عام الفيل، الموافق لعام 571 ميلادية. كان ولادته صباح يوم الاثنين في شهر ربيع الأول، وقد أجمع أهل السير على أنه وُلد يتيم الأب، حيث توفي عبد الله بن عبد المطلب والده قبل ولادته.",
    imagePrompt: "Serene desert landscape at dawn with gentle golden light, representing the blessed birth in Mecca, with ancient Arabian architecture silhouettes",
    category: "early_life"
  },
  {
    id: "hijra",
    title: "الهجرة النبوية",
    titleEn: "The Prophet's Migration",
    titleFr: "L'Hégire du Prophète",
    titleUr: "نبوی ہجرت",
    description: "هجرة النبي ﷺ من مكة إلى المدينة المنورة",
    content: "الهجرة النبوية من أعظم الأحداث في تاريخ الإسلام، حيث هاجر النبي صلى الله عليه وسلم مع صاحبه أبي بكر الصديق رضي الله عنه من مكة إلى المدينة المنورة في شهر صفر من السنة الأولى للهجرة. وقد كانت هذه الهجرة بداية تأسيس الدولة الإسلامية الأولى.",
    imagePrompt: "Ancient desert path with two travelers on camels silhouetted against a starlit sky, representing the sacred journey from Mecca to Medina",
    category: "hijra"
  }
];

// Prayer guide steps
export const ALL_PRAYER_STEPS: PrayerStep[] = [
  {
    id: "wudu",
    title: "الوضوء",
    description: "الطهارة شرط من شروط صحة الصلاة، ويجب على المسلم أن يتوضأ قبل كل صلاة",
    arabicText: "بِسْمِ اللَّهِ",
    transliteration: "Bismillah",
    imagePrompt: "Clean hands washing with clear water, representing purification and cleanliness in Islamic tradition"
  },
  {
    id: "qibla",
    title: "استقبال القبلة",
    description: "التوجه نحو الكعبة المشرفة في مكة المكرمة",
    imagePrompt: "Compass pointing towards Mecca with subtle Islamic geometric patterns in the background"
  },
  {
    id: "takbir",
    title: "تكبيرة الإحرام",
    description: "رفع اليدين وقول الله أكبر لبدء الصلاة",
    arabicText: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    imagePrompt: "Raised hands in prayer position with soft golden lighting representing spiritual connection"
  }
];

// Dhikr and remembrance collections
export const ALL_AZKAR_DATA: DhikrItem[] = [
  {
    id: "morning-1",
    category: "morning",
    arabicText: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Asbahnaa wa asbahal-mulku lillah, walhamdu lillah",
    translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah",
    repetitions: 1,
    source: "مسلم",
    benefits: "حماية وبركة في بداية اليوم",
  },
  {
    id: "evening-1", 
    category: "evening",
    arabicText: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Amsaynaa wa amsal-mulku lillah, walhamdu lillah",
    translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah",
    repetitions: 1,
    source: "مسلم",
    benefits: "حماية وطمأنينة في نهاية اليوم",
  },
  {
    id: "general-1",
    category: "general",
    arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliteration: "Subhanallahi wa bihamdihi",
    translation: "Glory is to Allah and praise is to Him",
    repetitions: 100,
    source: "البخاري ومسلم",
    benefits: "محو الذنوب وزيادة الحسنات",
  }
];

// Islamic knowledge topics
export const ISLAMIC_KNOWLEDGE_TOPICS = [
  {
    id: "five-pillars",
    title: "أركان الإسلام الخمسة",
    description: "الأسس الخمسة التي يقوم عليها الإسلام",
    content: `
# أركان الإسلام الخمسة

## الركن الأول: الشهادتان
شهادة أن لا إله إلا الله وأن محمداً رسول الله

## الركن الثاني: الصلاة
إقام الصلوات الخمس في أوقاتها

## الركن الثالث: الزكاة
إخراج الزكاة للمستحقين

## الركن الfourth: الصوم
صوم شهر رمضان

## الركن الخامس: الحج
حج البيت لمن استطاع إليه سبيلاً
    `
  },
  {
    id: "women-in-islam",
    title: "المرأة في الإسلام",
    description: "مكانة المرأة وحقوقها في الشريعة الإسلامية",
    content: `
# المرأة في الإسلام

أكرم الإسلام المرأة وأعطاها حقوقها كاملة، وجعل لها مكانة عظيمة في المجتمع.

## حقوق المرأة في الإسلام
- حق التعليم والتعلم
- حق العمل والكسب
- حق الملكية
- حق اختيار الزوج
- حق المشاركة في المجتمع

## واجبات المرأة
- طاعة الله ورسوله
- بر الوالدين
- حسن معاشرة الزوج
- تربية الأطفال
- المشاركة في خدمة المجتمع
    `
  }
];

// Children's Islamic stories
export const ALL_KIDS_STORIES = [
  {
    id: "kindness-story",
    title: "قصة الرفق بالحيوان",
    description: "تعليم الأطفال الرحمة والرفق",
    content: "قصة جميلة عن أهمية الرفق بالحيوانات في الإسلام",
    ageGroup: "5-10",
    lesson: "الرفق والرحمة"
  },
  {
    id: "honesty-story", 
    title: "قصة الصدق",
    description: "أهمية الصدق في حياة المسلم",
    content: "قصة تعلم الأطفال قيمة الصدق وعواقب الكذب",
    ageGroup: "6-12",
    lesson: "الصدق والأمانة"
  }
];

// Helper functions
export function getDailyVerse(): QuranVerse {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

export function getRandomAzkar(category: DhikrItem['category'], count: number = 3): DhikrItem[] {
  const categoryAzkar = ALL_AZKAR_DATA.filter(item => item.category === category);
  return categoryAzkar.slice(0, count);
}

export function getSeerahTopicsByCategory(category: SeerahTopic['category']): SeerahTopic[] {
  return ALL_SEERAH_TOPICS.filter(topic => topic.category === category);
}

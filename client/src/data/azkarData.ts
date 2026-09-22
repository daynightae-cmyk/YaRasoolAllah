export interface AzkarItem {
  id: string;
  text: string;
  category: string;
  count: number;
  arabic: string;
  transliteration: string;
  translation: string;
  reward: string;
  reference?: string;
  title?: string;
  content?: string;
  description?: string;
}

export const AZKAR_DATA: AzkarItem[] = [
  {
    id: "1",
    text: "سبحان الله",
    title: "التسبيح والتحميد",
    category: "morning",
    count: 33,
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhan Allah",
    translation: "Glory be to Allah",
    reward: "محو الذنوب وزيادة الحسنات",
    reference: "صحيح مسلم",
    content: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    description: "تسبيح مأثور في الصباح والمساء",
  },
  {
    id: "2",
    text: "الحمد لله",
    title: "الحمد والثناء",
    category: "morning",
    count: 33,
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    reward: "ملء الميزان يوم القيامة",
    reference: "صحيح مسلم",
    content: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    description: "حمد الله وشكره على نعمه",
  },
  {
    id: "3",
    text: "الله أكبر",
    title: "التكبير والتعظيم",
    category: "morning",
    count: 34,
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    reward: "رفع الدرجات في الجنة",
    reference: "صحيح البخاري ومسلم",
    content: "اللَّهُ أَكْبَرُ كَبِيرًا",
    description: "تعظيم الله وإجلاله",
  },
  {
    id: "4",
    text: "أستغفر الله",
    title: "سيد الاستغفار",
    category: "evening",
    count: 100,
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullah wa atubu ilayh",
    translation: "I seek forgiveness from Allah and repent to Him",
    reward: "غفران الذنوب وتفريج الهموم",
    reference: "صحيح البخاري",
    content: "أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    description: "الاستغفار اليومي المأثور عن النبي ﷺ",
  },
  {
    id: "5",
    text: "لا إله إلا الله",
    title: "كلمة الإخلاص والتوحيد",
    category: "evening",
    count: 100,
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliteration: "La ilaha illa Allah wahdahu la shareeka lah...",
    translation: "There is no god but Allah alone, without partner...",
    reward: "أعظم الذكر وأجله وحرز من الشيطان",
    reference: "صحيح البخاري ومسلم",
    content: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    description: "حرز من الشيطان وعتق عشر رقاب",
  },
];

export const azkarData = AZKAR_DATA;

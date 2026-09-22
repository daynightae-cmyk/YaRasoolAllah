export interface AzkarItem {
  id: string;
  text: string;
  category: string;
  count: number;
  arabic: string;
  transliteration: string;
  translation: string;
  reward: string;
}

export const AZKAR_DATA: AzkarItem[] = [
  {
    id: "1",
    text: "سبحان الله",
    category: "morning",
    count: 33,
    arabic: "سُبْحَانَ اللَّهِ",
    transliteration: "Subhan Allah",
    translation: "Glory be to Allah",
    reward: "محو الذنوب وزيادة الحسنات",
  },
  {
    id: "2",
    text: "الحمد لله",
    category: "morning",
    count: 33,
    arabic: "الْحَمْدُ لِلَّهِ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    reward: "ملء الميزان يوم القي��مة",
  },
  {
    id: "3",
    text: "الله أكبر",
    category: "morning",
    count: 34,
    arabic: "اللَّهُ أَكْبَرُ",
    transliteration: "Allahu Akbar",
    translation: "Allah is the Greatest",
    reward: "رفع الدرجات في الجنة",
  },
  {
    id: "4",
    text: "أستغفر الله",
    category: "evening",
    count: 100,
    arabic: "أَسْتَغْفِرُ اللَّهَ",
    transliteration: "Astaghfirullah",
    translation: "I seek forgiveness from Allah",
    reward: "غفران الذنوب وتفريج الهموم",
  },
  {
    id: "5",
    text: "لا إله إلا الله",
    category: "evening",
    count: 100,
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ",
    transliteration: "La ilaha illa Allah",
    translation: "There is no god but Allah",
    reward: "أعظم الذكر وأجله",
  },
];

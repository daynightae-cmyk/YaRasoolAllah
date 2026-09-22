export interface PrayerStep {
  id: string;
  title: string;
  description: string;
  category: "preparation" | "positions" | "recitations" | "completion";
  order: number;
  isRequired: boolean;
}

export const PRAYER_GUIDE_STEPS: PrayerStep[] = [
  {
    id: "1",
    title: "الوضوء",
    description: "أداء الوضوء بالطريقة الصحيحة كشرط لصحة الصلاة",
    category: "preparation",
    order: 1,
    isRequired: true,
  },
  {
    id: "2",
    title: "استقبال القبلة",
    description: "التوجه نحو الكعبة المشرفة في مكة المكرمة",
    category: "preparation",
    order: 2,
    isRequired: true,
  },
  {
    id: "3",
    title: "النية",
    description: "استحضار نية الصلاة في القلب",
    category: "preparation",
    order: 3,
    isRequired: true,
  },
  {
    id: "4",
    title: "تكبيرة الإحرام",
    description: "قول 'الله أكبر' مع رفع اليدين لبدء الصلاة",
    category: "positions",
    order: 4,
    isRequired: true,
  },
  {
    id: "5",
    title: "دعاء الاستفتاح",
    description: "قراءة دعاء الاستفتاح بعد تكبيرة الإحرام",
    category: "recitations",
    order: 5,
    isRequired: false,
  },
  {
    id: "6",
    title: "سورة الفاتحة",
    description: "قراءة سورة الفاتحة في كل ركعة",
    category: "recitations",
    order: 6,
    isRequired: true,
  },
  {
    id: "7",
    title: "الركوع",
    description: "الانحناء مع وضع اليدين على الركبتين",
    category: "positions",
    order: 7,
    isRequired: true,
  },
  {
    id: "8",
    title: "السجود",
    description: "وضع الجبهة والأنف على الأرض مع الركبتين واليدين والقدمين",
    category: "positions",
    order: 8,
    isRequired: true,
  },
  {
    id: "9",
    title: "التشهد",
    description: "قراءة التشهد في الجلوس الأخير",
    category: "recitations",
    order: 9,
    isRequired: true,
  },
  {
    id: "10",
    title: "التسليم",
    description: "إنهاء الصلاة بقول 'السلام عليكم ورحمة الله' يميناً ويساراً",
    category: "completion",
    order: 10,
    isRequired: true,
  },
];

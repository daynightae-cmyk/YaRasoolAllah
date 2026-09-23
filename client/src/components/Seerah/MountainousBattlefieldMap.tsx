import React, { useState } from "react";
import {
  Shield,
  MapPin,
  Compass,
  Layers,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Info,
  Maximize2,
  Calendar,
  Users,
  Award,
  Mountain,
  Footprints,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface BattleCampaign {
  id: string;
  nameAr: string;
  nameEn: string;
  dateAr: string;
  dateEn: string;
  locationAr: string;
  locationEn: string;
  terrainTypeAr: string;
  distanceFromMadinah: string;
  muslimStrength: string;
  opponentStrength: string;
  commanders: string[];
  strategicObjectiveAr: string;
  terrainDescriptionAr: string;
  phases: {
    phaseNumber: number;
    titleAr: string;
    descriptionAr: string;
    historicalSource: string;
    activeMarkers: string[];
  }[];
  mapData: {
    viewBox: string;
    terrainContours: {
      type: "mountain" | "wadi" | "harrah" | "trench" | "well";
      nameAr: string;
      pathD: string;
      fill?: string;
      stroke?: string;
      labelPos: { x: number; y: number };
    }[];
    tacticalPaths: {
      id: string;
      labelAr: string;
      pathD: string;
      color: string;
      dashArray?: string;
      animated?: boolean;
    }[];
    positions: {
      id: string;
      labelAr: string;
      faction: "muslim" | "opponent" | "neutral";
      x: number;
      y: number;
      descriptionAr: string;
    }[];
  };
}

export const CANONICAL_BATTLES: BattleCampaign[] = [
  {
    id: "badr",
    nameAr: "غزوة بدر الكبرى (يوم الفرقان)",
    nameEn: "The Great Battle of Badr",
    dateAr: "17 رمضان 2 هـ (مارس 624م)",
    dateEn: "17 Ramadan 2 AH (March 624 CE)",
    locationAr: "وادي بدر بين مكة والمدينة",
    locationEn: "Badr Valley (150 km SW of Medina)",
    terrainTypeAr: "وادي رملي، تلال كثبان (رملة عالج)، آبار مياه، مرتفعات محيطة",
    distanceFromMadinah: "نحو 150 كم جنوب غرب المدينة",
    muslimStrength: "313 إلى 317 رجلاً، وفرسان فقط، و70 بعيراً",
    opponentStrength: "نحو 1,000 مقاتل، و100 فرس، و700 بعير",
    commanders: ["رسول الله محمد ﷺ (القيادة العليا)", "حمزة بن عبد المطلب", "علي بن أبي طالب"],
    strategicObjectiveAr: "حماية أمن الدولة الوليدة واسترداد أموال المهاجرين المصادرة وردع هيمنة قريش العدوانية.",
    terrainDescriptionAr: "وادي بدر محاط بكثبان رملية؛ نزل المسلمون بالعدوة الدنيا (الأقرب للمدينة) بحسب مشورة الحباب بن المنذر للسيطرة على أدنى ماء لقريش وتغوير سائر الآبار.",
    phases: [
      {
        phaseNumber: 1,
        titleAr: "التموضع عند أدنى ماء ومشورة الحباب بن المنذر",
        descriptionAr: "سبق المسلمون قريشاً إلى آبار بدر بعد نزول المطر وتثبيت الرمل تحت أقدامهم، وبناء العريش النيوي على تل مرتفع مشرف على ساحة القتال للدعاء والقيادة.",
        historicalSource: "سيرة ابن هشام، صحيح البخاري كتاب المغازي",
        activeMarkers: ["pos-muslim-wells", "pos-arish"],
      },
      {
        phaseNumber: 2,
        titleAr: "المبارزات الفردية واندلاع المعركة الكبرى",
        descriptionAr: "خرج عتبة وشيبة ابنا ربيعة والوليد بن عتبة للمبارزة، فبرز لهم عبيدة بن الحارث وحمزة بن عبد المطلب وعلي بن أبي طالب رضي الله عنهم فقتلوهم.",
        historicalSource: "سنن أبي داود، تاريخ الطبري",
        activeMarkers: ["pos-mubaraza"],
      },
      {
        phaseNumber: 3,
        titleAr: "تضرع النبي ﷺ ونزول المدد والانتصار الحاسم",
        descriptionAr: "واصل النبي ﷺ الابتهال حتى سقط رداؤه قائلاً: «اللَّهُمَّ إِنْ تَهْلِكْ هَذِهِ الْعِصَابَةَ لَا تُعْبَدْ فِي الأَرْضِ»، وتلا قوله تعالى: «سَيُهْزَمُ الْجَمْعُ وَيُوَلُّونَ الدُّبُرَ»، فانهزمت قريش وقتل 70 من صناديدهم.",
        historicalSource: "سورة الأنفال، صحيح مسلم",
        activeMarkers: ["pos-muslim-wells", "pos-quraysh-defeat"],
      },
    ],
    mapData: {
      viewBox: "0 0 800 520",
      terrainContours: [
        {
          type: "mountain",
          nameAr: "العدوة الدنيا (جهة المدينة)",
          pathD: "M 50 120 Q 200 40 400 90 T 750 80 L 750 160 Q 500 130 50 180 Z",
          fill: "rgba(180, 83, 9, 0.15)",
          stroke: "rgba(217, 119, 6, 0.4)",
          labelPos: { x: 220, y: 110 },
        },
        {
          type: "mountain",
          nameAr: "العدوة القصوى (جهة مكة)",
          pathD: "M 50 420 Q 250 460 500 410 T 750 440 L 750 370 Q 400 360 50 380 Z",
          fill: "rgba(120, 53, 15, 0.2)",
          stroke: "rgba(180, 83, 9, 0.4)",
          labelPos: { x: 520, y: 440 },
        },
        {
          type: "wadi",
          nameAr: "بطن وادي بدر (ميدان المواجهة)",
          pathD: "M 40 220 C 250 200 550 280 760 250",
          stroke: "rgba(217, 119, 6, 0.25)",
          labelPos: { x: 380, y: 245 },
        },
        {
          type: "well",
          nameAr: "آبار بدر المائية",
          pathD: "M 280 230 A 15 15 0 1 0 310 230 A 15 15 0 1 0 280 230 Z",
          fill: "rgba(2, 132, 199, 0.3)",
          stroke: "rgba(56, 189, 248, 0.7)",
          labelPos: { x: 300, y: 220 },
        },
      ],
      tacticalPaths: [
        {
          id: "path-muslim-march",
          labelAr: "مسار تقدم جيش المسلمين من الروحاء",
          pathD: "M 100 80 Q 220 120 310 210",
          color: "#10b981",
          animated: true,
        },
        {
          id: "path-quraysh-march",
          labelAr: "مسار زحف جيش قريش من العدوة القصوى",
          pathD: "M 650 430 Q 500 350 380 270",
          color: "#ef4444",
          dashArray: "6,6",
        },
      ],
      positions: [
        {
          id: "pos-arish",
          labelAr: "العريش النبوي (مقر القيادة والدعاء)",
          faction: "muslim",
          x: 230,
          y: 150,
          descriptionAr: "عريش شُيِّد للنبي ﷺ وأبي بكر على تل مرتفع مشرف على الوادي.",
        },
        {
          id: "pos-muslim-wells",
          labelAr: "معسكر المسلمين عند أدنى بئر",
          faction: "muslim",
          x: 310,
          y: 220,
          descriptionAr: "تمركز جيش المسلمين بعد السيطرة على آبار المياه وتغوير سائر الآبار خلفهم.",
        },
        {
          id: "pos-mubaraza",
          labelAr: "موقع المبارزات وسقوط فرسان قريش",
          faction: "neutral",
          x: 370,
          y: 260,
          descriptionAr: "مصرع عتبة وشيبة والوليد على يد حمزة وعلي وعبيدة رضي الله عنهم.",
        },
        {
          id: "pos-quraysh-defeat",
          labelAr: "معسكر قريش وخط التقهقر والفرار",
          faction: "opponent",
          x: 520,
          y: 350,
          descriptionAr: "انهيار صفوف المشركين ومقتل أبي جهل وأمية بن خلف وتشتت فلولهم.",
        },
      ],
    },
  },
  {
    id: "uhud",
    nameAr: "غزوة أحد (الثبات والتمحيص)",
    nameEn: "The Battle of Mount Uhud",
    dateAr: "7 شوال 3 هـ (مارس 625م)",
    dateEn: "7 Shawwal 3 AH (March 625 CE)",
    locationAr: "سفح جبل أحد شمال المدينة المنورة",
    locationEn: "Foot of Mount Uhud, Medina",
    terrainTypeAr: "جبل جرانيتي ضخم، وادي قناة، جبل الرماة (عينين)، شِعب صخري",
    distanceFromMadinah: "نحو 5 كم شمال المسجد النبوي الشريف",
    muslimStrength: "700 مقاتل (بعد انسحاب 300 من المنافقين بقيادة ابن سلول)",
    opponentStrength: "3,000 مقاتل، و200 فرس يقودهم خالد بن الوليد وعكرمة بن أبي جهل",
    commanders: ["رسول الله محمد ﷺ", "حمزة بن عبد المطلب (سيد الشهداء)", "عبد الله بن جبير (قائد الرماة)"],
    strategicObjectiveAr: "الدفاع عن المدينة وحرمة الإسلام بعد خروج قريش للثأر من هزيمة بدر.",
    terrainDescriptionAr: "جبل أحد سور طبيعي مهيب؛ أقام النبي ﷺ خط الدفاع بحيث يكون ظهره لجبل أحد، ووضع 50 رامياً على جبل عينين لحماية الميسرة من خيل المشركين.",
    phases: [
      {
        phaseNumber: 1,
        titleAr: "خطة التموضع النبوي وأمر الرماة الحازم",
        descriptionAr: "أسند النبي ﷺ ظهر الجيش لجبل أحد وأمر 50 من الرماة بالتمركز على جبل عينين وقال: «احْمُوا ظُهُورَنَا، فَإِنْ رَأَيْتُمُونَا تُخْطَفُ الطَّيْرُ فَلَا تَبْرَحُوا» سديد التوجيه.",
        historicalSource: "صحيح البخاري، مسند أحمد",
        activeMarkers: ["pos-uhud-mountain", "pos-archers-mount"],
      },
      {
        phaseNumber: 2,
        titleAr: "الهجوم الأولي وتقهقر جيش قريش",
        descriptionAr: "قاتل المسلمون ببسالة منقطعة النظير، واستبسل حمزة وعلي ومصعب وأبو دجانة، فتداعت صفوف قريش وفرت نساؤهم وحُماتهم.",
        historicalSource: "سيرة ابن هشام، المغازي للواقدي",
        activeMarkers: ["pos-muslim-front"],
      },
      {
        phaseNumber: 3,
        titleAr: "نزول أكثر الرماة والتفاف فرسان قريش واستبسال الحماية النبوية",
        descriptionAr: "ظن 40 رامياً أن المعركة انتهت فنزلوا لجمع الغنائم رغم نهي أميرهم ابن جبير، فالتف خالد بن الوليد بفرسانه وطوق المسلمين، واستشهد حمزة وجُرح النبي ﷺ في وجهه الشريف ودخلت حلقتان من المغفر في وجنته وحماه صفوة الصحابة بأنفسهم.",
        historicalSource: "سورة آل عمران، صحيح البخاري",
        activeMarkers: ["pos-archers-mount", "pos-flank-attack", "pos-prophet-defense"],
      },
    ],
    mapData: {
      viewBox: "0 0 800 520",
      terrainContours: [
        {
          type: "mountain",
          nameAr: "سلسلة جبل أحد الشمالية العظيمة",
          pathD: "M 30 110 C 220 30 500 40 760 90 L 760 160 C 500 120 220 110 30 170 Z",
          fill: "rgba(120, 53, 15, 0.35)",
          stroke: "rgba(217, 119, 6, 0.6)",
          labelPos: { x: 380, y: 100 },
        },
        {
          type: "mountain",
          nameAr: "جبل الرماة (جبل عينين)",
          pathD: "M 220 290 Q 280 260 340 290 T 400 310 L 380 340 Q 300 340 230 330 Z",
          fill: "rgba(180, 83, 9, 0.3)",
          stroke: "rgba(245, 158, 11, 0.7)",
          labelPos: { x: 310, y: 300 },
        },
        {
          type: "wadi",
          nameAr: "وادي قَنَاة",
          pathD: "M 40 420 C 300 380 500 420 760 390",
          stroke: "rgba(56, 189, 248, 0.3)",
          labelPos: { x: 420, y: 405 },
        },
      ],
      tacticalPaths: [
        {
          id: "path-flank-attack",
          labelAr: "مسار التفاف فرسان خالد عبر وادي قناة",
          pathD: "M 650 360 Q 520 440 370 330",
          color: "#ef4444",
          dashArray: "5,5",
          animated: true,
        },
        {
          id: "path-muslim-retreat-to-sheb",
          labelAr: "انحياز المسلمين إلى شِعب أحد الحصين",
          pathD: "M 400 230 L 460 140",
          color: "#10b981",
        },
      ],
      positions: [
        {
          id: "pos-uhud-mountain",
          labelAr: "ظهر جيش المسلمين مسنداً لجبل أحد",
          faction: "muslim",
          x: 430,
          y: 160,
          descriptionAr: "التموضع المحكم الذي حظر تطويق المسلمين من الخلف.",
        },
        {
          id: "pos-archers-mount",
          labelAr: "موقع 50 رامياً بقيادة عبد الله بن جبير",
          faction: "muslim",
          x: 310,
          y: 290,
          descriptionAr: "الموقع الاستراتيجي الفاصل لحماية ميسرة الجيش من خيالة المشركين.",
        },
        {
          id: "pos-muslim-front",
          labelAr: "قلب الجيش وراية مصعب بن عمير وبسالة علي وحمزة",
          faction: "muslim",
          x: 430,
          y: 230,
          descriptionAr: "ميدان المعركة الأولي حيث تراجعت قريش قبل نزول الرماة.",
        },
        {
          id: "pos-prophet-defense",
          labelAr: "شِعب أحد وموضع الدفاع المستميت عن النبي ﷺ",
          faction: "muslim",
          x: 470,
          y: 140,
          descriptionAr: "افتداء طلحة بن عبيد الله وسعد بن أبي وقاص وأم عمارة نسيبة المازنية لرسول الله ﷺ.",
        },
      ],
    },
  },
  {
    id: "khandaq",
    nameAr: "غزوة الخندق / الأحزاب (الحصار والريح)",
    nameEn: "The Battle of the Trench (Al-Ahzab)",
    dateAr: "شوال 5 هـ (فبراير 627م)",
    dateEn: "Shawwal 5 AH (February 627 CE)",
    locationAr: "الجهة الشمالية للمدينة المنورة",
    locationEn: "Northern Frontier of Medina",
    terrainTypeAr: "حرات بركانية بازلتية سوداء (واقم والوبرة)، جبل سلع، خندق صناعي ممتد",
    distanceFromMadinah: "الحد الشمالي للمدينة المنورة",
    muslimStrength: "3,000 مقاتل مرابطون على طول الخندق",
    opponentStrength: "10,000 مقاتل من قريش وغطفان وكنانة وهوازن وأحزاب العرب",
    commanders: ["رسول الله محمد ﷺ", "سلمان الفارسي (صاحب مشورة حفر الخندق)", "علي بن أبي طالب"],
    strategicObjectiveAr: "صد تحالف استئصالي ضخم أراد إبادة المسلمين واقتلاع دولتهم من الجذور.",
    terrainDescriptionAr: "المدينة محصنة طبيعياً من الشرق بحرة واقم ومن الغرب بحرة الوبرة ومن الجنوب ببساتين وبني قريظة، فالجهة الشمالية كانت الوحيدة المكشوفة فتم حفر خندق يبلغ طوله قرابة 5 كم.",
    phases: [
      {
        phaseNumber: 1,
        titleAr: "مشورة سلمان الفارسي وحفر الخندق في صقيع الشتاء",
        descriptionAr: "أشار سلمان الفارسي بحفر الخندق قائلاً: «يا رسول الله، إنا كنا بفارس إذا حُوصِرنا خَنْدَقْنا علينا»، فبادر النبي ﷺ بحمل المعول مع أصحابه وربط الحجر على بطنه من شدة الجوع.",
        historicalSource: "صحيح البخاري، سيرة ابن إسحاق",
        activeMarkers: ["pos-trench-line", "pos-sala-mount"],
      },
      {
        phaseNumber: 2,
        titleAr: "مفاجأة الأحزاب ومحاولات الاقتحام ومبارزة عمرو بن عبد ود",
        descriptionAr: "فوجئت قريش بالخندق وقالوا: «إن هذه لمكيدة ما كانت العرب تكيدها!»، وحاول عمرو بن عبد ود وعكرمة اقتحام نقطة ضيقة، فبرز علي بن أبي طالب لعمرو فصرعه وكبّر المسلمون.",
        historicalSource: "تاريخ الطبري، البداية والنهاية",
        activeMarkers: ["pos-breach-attempt"],
      },
      {
        phaseNumber: 3,
        titleAr: "حيلة نعيم بن مسعود وإرسال الريح العاتية",
        descriptionAr: "أسلم نعيم بن مسعود وخذّل بين قريش وغطفان واليهود بحكمة، ثم أرسل الله ريحاً صرصراً باردة في ليلة شاتية كفأت قدورهم واقتلعت خيامهم، فصاح أبو سفيان: «يا معشر قريش، إنكم والله ما أصبحتم بدار مُقام، فارتحلوا فإني مرتحل».",
        historicalSource: "سورة الأحزاب، صحيح مسلم",
        activeMarkers: ["pos-trench-line", "pos-ahzab-camp"],
      },
    ],
    mapData: {
      viewBox: "0 0 800 520",
      terrainContours: [
        {
          type: "harrah",
          nameAr: "حَرَّة واقم البركانية (الشرقية)",
          pathD: "M 30 60 L 180 60 L 160 480 L 30 480 Z",
          fill: "rgba(30, 41, 59, 0.4)",
          stroke: "rgba(100, 116, 139, 0.6)",
          labelPos: { x: 100, y: 260 },
        },
        {
          type: "harrah",
          nameAr: "حَرَّة الوَبَرَة البركانية (الغربية)",
          pathD: "M 620 60 L 770 60 L 770 480 L 640 480 Z",
          fill: "rgba(30, 41, 59, 0.4)",
          stroke: "rgba(100, 116, 139, 0.6)",
          labelPos: { x: 690, y: 260 },
        },
        {
          type: "mountain",
          nameAr: "جبل سَلْع (مقر القيادة النبوية ومسجد الفتح)",
          pathD: "M 330 330 Q 400 280 470 330 L 450 380 Q 400 360 350 380 Z",
          fill: "rgba(120, 53, 15, 0.3)",
          stroke: "rgba(217, 119, 6, 0.6)",
          labelPos: { x: 400, y: 340 },
        },
        {
          type: "trench",
          nameAr: "مسار الخندق المحفور (حاجز الخيول)",
          pathD: "M 180 180 Q 400 210 620 180",
          stroke: "#38bdf8",
          labelPos: { x: 400, y: 195 },
        },
      ],
      tacticalPaths: [
        {
          id: "path-ahzab-approach",
          labelAr: "زحف تحالف الأحزاب من الشمال",
          pathD: "M 400 50 L 400 150",
          color: "#ef4444",
          dashArray: "6,6",
        },
      ],
      positions: [
        {
          id: "pos-sala-mount",
          labelAr: "جبل سلع وموضع دعاء النبي ﷺ المستجاب",
          faction: "muslim",
          x: 400,
          y: 330,
          descriptionAr: "مقر القيادة النبوية حيث دعا النبي ﷺ ثلاثة أيام فاستجيب له يوم الأربعاء.",
        },
        {
          id: "pos-trench-line",
          labelAr: "مرابطة 3,000 صحابي على امتداد الخندق",
          faction: "muslim",
          x: 400,
          y: 200,
          descriptionAr: "الحراسة المشددة ليل نهار في البرد الشديد لمنع أي تسلل أو ردم للخندق.",
        },
        {
          id: "pos-breach-attempt",
          labelAr: "موقع اقتحام عمرو بن عبد ود ومقتله",
          faction: "neutral",
          x: 470,
          y: 200,
          descriptionAr: "الثغرة الضيقة التي وثب منها فرسان المشركين فبارزهم علي بن أبي طالب رضي الله عنه.",
        },
        {
          id: "pos-ahzab-camp",
          labelAr: "معسكر الأحزاب المفكك وموطن الريح العاتية",
          faction: "opponent",
          x: 400,
          y: 110,
          descriptionAr: "خيام 10,000 مقاتل التي أرسل الله عليها جنوداً لم يروها من الريح والملائكة.",
        },
      ],
    },
  },
  {
    id: "mecca-conquest",
    nameAr: "فتح مكة المبارك (جاء الحق وزهق الباطل)",
    nameEn: "The Peaceful Conquest of Mecca",
    dateAr: "20 رمضان 8 هـ (يناير 630م)",
    dateEn: "20 Ramadan 8 AH (January 630 CE)",
    locationAr: "مكة المكرمة والحرم الآمن",
    locationEn: "Mecca and the Sacred Sanctuary",
    terrainTypeAr: "جبال مكة الشاهقة (أبو قبيس، قعيقعان)، ثنايا وأودية ضيقة، بطن مكة",
    distanceFromMadinah: "450 كم جنوب المدينة",
    muslimStrength: "10,000 مقاتل بكامل عتادهم ونظامهم",
    opponentStrength: "قريش وأحلافها (أذعنوا ودخلوا في الأمان)",
    commanders: ["رسول الله محمد ﷺ (القيادة العليا)", "خالد بن الوليد", "الزبير بن العوام", "أبو عبيدة بن الجراح", "سعد بن عبادة"],
    strategicObjectiveAr: "تطهير البيت الحرام من الأصنام وتأمين حرية الإيمان بعد نقض قريش لصلح الحديبية.",
    terrainDescriptionAr: "مكة وادٍ غير ذي زرع تحيط به الجبال الصخرية من كل جهة؛ قسّم النبي ﷺ الجيش إلى أربعة ألوية لدخول مكة من جميع مداخلها وممراتها الجبلية دون قتال.",
    phases: [
      {
        phaseNumber: 1,
        titleAr: "إيقاد النيران بمر الظهران وإعلان الأمان النبوي الشامل",
        descriptionAr: "نزل الجيش بمر الظهران وأمر النبي ﷺ بإيقاد 10,000 شعلة نار، وجاء أبو سفيان فأسلم، وأعلن النبي ﷺ ميثاق الأمان التاريخي: «مَنْ دَخَلَ دَارَ أَبِي سُفْيَانَ فَهُوَ آمِنٌ، وَمَنْ أَلْقَى السِّلَاحَ فَهُوَ آمِنٌ، وَمَنْ أَغْلَقَ بَابَهُ فَهُوَ آمِنٌ».",
        historicalSource: "صحيح مسلم، سيرة ابن هشام",
        activeMarkers: ["pos-marr-dhahran"],
      },
      {
        phaseNumber: 2,
        titleAr: "دخول مكة من المحاور الأربعة بتواضع مهيب",
        descriptionAr: "دخل النبي ﷺ مكة من كداء وثنيتها مطأطئاً رأسه تواضعاً لله حتى كادت لحيته الشريفة تمس واسطة رحله شكراً لله على هذا الفتح المبين.",
        historicalSource: "صحيح البخاري",
        activeMarkers: ["pos-kuda-entrance", "pos-kuday-entrance"],
      },
      {
        phaseNumber: 3,
        titleAr: "تطهير الكعبة الشريفة والعفو العام الخالد",
        descriptionAr: "طاف النبي ﷺ بالبيت وأخذ يشير إلى 360 صنماً بقضيب في يده ويقول: «جَاءَ الْحَقُّ وَزَهَقَ الْبَاطِلُ إِنَّ الْبَاطِلَ كَانَ زَهُوقًا»، ثم خطب في أهل مكة وقال: «مَا تَرَوْنَ أَنِّي فَاعِلٌ بِكُمْ؟ قَالُوا: خَيْرًا، أَخٌ كَرِيمٌ وَابْنُ أَخٍ كَرِيمٍ، قَالَ: اذْهَبُوا فَأَنْتُمُ الطُّلَقَاءُ».",
        historicalSource: "تاريخ الطبري، السنن الكبرى للبيهقي",
        activeMarkers: ["pos-kabah-cleansing"],
      },
    ],
    mapData: {
      viewBox: "0 0 800 520",
      terrainContours: [
        {
          type: "mountain",
          nameAr: "جبل قعيقعان (الشمال الغربي)",
          pathD: "M 40 80 Q 200 40 380 90 L 360 160 Q 180 120 40 150 Z",
          fill: "rgba(120, 53, 15, 0.35)",
          stroke: "rgba(217, 119, 6, 0.5)",
          labelPos: { x: 200, y: 90 },
        },
        {
          type: "mountain",
          nameAr: "جبل أبو قبيس (الشرق)",
          pathD: "M 450 160 Q 650 140 760 190 L 760 270 Q 620 230 450 240 Z",
          fill: "rgba(120, 53, 15, 0.35)",
          stroke: "rgba(217, 119, 6, 0.5)",
          labelPos: { x: 620, y: 200 },
        },
        {
          type: "wadi",
          nameAr: "بطن مكة ووادي إبراهيم",
          pathD: "M 100 450 C 350 350 480 280 700 120",
          stroke: "rgba(245, 158, 11, 0.2)",
          labelPos: { x: 420, y: 320 },
        },
      ],
      tacticalPaths: [
        {
          id: "path-prophet-entrance",
          labelAr: "محور دخول النبي ﷺ والزبير من ثنية كداء (الشمال)",
          pathD: "M 380 60 Q 400 150 400 240",
          color: "#10b981",
          animated: true,
        },
        {
          id: "path-khalid-entrance",
          labelAr: "محور دخول خالد بن الوليد من أسفل مكة (كُدَى)",
          pathD: "M 120 450 Q 250 360 380 270",
          color: "#38bdf8",
        },
      ],
      positions: [
        {
          id: "pos-marr-dhahran",
          labelAr: "مر الظهران (إيقاد 10,000 شعلة نار وإسلام أبي سفيان)",
          faction: "muslim",
          x: 200,
          y: 70,
          descriptionAr: "المعسكر النبوي شمال مكة حيث شوهدت مشاعل الجيش وأعلن ميثاق الأمان.",
        },
        {
          id: "pos-kuda-entrance",
          labelAr: "ثنية كداء (مدخل لواء القيادة النبوية)",
          faction: "muslim",
          x: 400,
          y: 150,
          descriptionAr: "الثنية العليا التي دخل منها رسول الله ﷺ راكباً ناقته القصواء خاشعاً لله.",
        },
        {
          id: "pos-kabah-cleansing",
          labelAr: "المسجد الحرام والكعبة الشريفة وتطهير الأصنام",
          faction: "muslim",
          x: 400,
          y: 260,
          descriptionAr: "إعلان التوحيد، تحطيم 360 صنماً، وأذان بلال بن رباح فوق ظهر الكعبة الشريفة.",
        },
      ],
    },
  },
];

const ATLAS_EVIDENCE: Record<string, {
  sourceIds: string[];
  confidence: "متوسط" | "منخفض";
  dispute: string;
  mapType: string;
  geographicBasis: string;
}> = {
  badr: { sourceIds: ["work-ibn-hisham-sira", "work-tabari-tarikh", "work-waqidi-maghazi"], confidence: "منخفض", dispute: "المعسكرات والمسارات تقريبية وليست نتيجة مسح أثري.", mapType: "إعادة بناء تفسيرية غير ملاحية", geographicBasis: "سياق تاريخي وصفي بلا basemap حديث مضمّن." },
  uhud: { sourceIds: ["work-ibn-hisham-sira", "work-ibn-kathir-bidaya"], confidence: "متوسط", dispute: "المعالم العامة معروفة؛ الخطوط والمواضع التفصيلية تعليمية تقريبية.", mapType: "مخطط تضاريس تاريخي تفسيري", geographicBasis: "تمييز صريح بين المعلم الحديث والرواية التاريخية." },
  khandaq: { sourceIds: ["work-ibn-hisham-sira", "work-tabari-tarikh", "work-ibn-kathir-bidaya"], confidence: "منخفض", dispute: "امتداد الخندق ومواضع المخيمات محل نقاش؛ لا دقة مترية مدعاة.", mapType: "مخطط حصار تفسيري غير ملاحّي", geographicBasis: "طبقات وصفية بلا تنزيل تلقائي لخريطة حديثة." },
  "mecca-conquest": { sourceIds: ["work-ibn-hisham-sira", "work-ibn-sad-tabaqat", "work-ibn-kathir-bidaya"], confidence: "منخفض", dispute: "مسارات الدخول تمثيل سردي تقريبي لا تحديد ميداني دقيق.", mapType: "مخطط رحلة تاريخي تفسيري", geographicBasis: "اتجاهات عامة مستفادة من الروايات، لا بيانات قوات حديثة." },
};

export default function MountainousBattlefieldMap() {
  const [selectedBattleId, setSelectedBattleId] = useState<string>("badr");
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState<number>(0);
  const [showTerrainContours, setShowTerrainContours] = useState<boolean>(true);
  const [showTacticalPaths, setShowTacticalPaths] = useState<boolean>(true);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);

  const activeBattle = CANONICAL_BATTLES.find((b) => b.id === selectedBattleId) || CANONICAL_BATTLES[0];
  const activePhase = activeBattle.phases[currentPhaseIndex] || activeBattle.phases[0];
  const evidence = ATLAS_EVIDENCE[activeBattle.id];

  const handleSelectBattle = (id: string) => {
    setSelectedBattleId(id);
    setCurrentPhaseIndex(0);
    setSelectedMarker(null);
  };

  const handleNextPhase = () => {
    if (currentPhaseIndex < activeBattle.phases.length - 1) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
    }
  };

  const handlePrevPhase = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex(currentPhaseIndex - 1);
    }
  };

  return (
    <div className="space-y-6 text-right">
      <section className="atlas-evidence-strip" aria-label="بيان دليل الخريطة">
        <div><span>نوع الخريطة</span><strong>{evidence.mapType}</strong></div>
        <div><span>الثقة المكانية</span><strong>{evidence.confidence}</strong></div>
        <div><span>المصادر</span><strong dir="ltr">{evidence.sourceIds.join(" · ")}</strong></div>
        <div><span>موضع الخلاف</span><strong>{evidence.dispute}</strong></div>
        <p>{evidence.geographicBasis}</p>
      </section>
      {/* Top Selector Ribbon of Canonical Campaigns */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CANONICAL_BATTLES.map((battle) => {
          const isActive = battle.id === activeBattle.id;
          return (
            <button
              key={battle.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => handleSelectBattle(battle.id)}
              className={cn(
                "px-4 py-2.5 rounded-xl text-xs sm:text-sm font-cairo font-bold whitespace-nowrap transition-all duration-200 border flex items-center gap-2",
                isActive
                  ? "bg-amber-700 text-white border-amber-600 shadow-md shadow-amber-950/30 scale-[1.02]"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Mountain className="w-3.5 h-3.5 text-amber-300" />
              <span>{battle.nameAr.split(" (")[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Main Cartographic Box */}
      <div className="atlas-documentary border border-stone-700/70 bg-gradient-to-b from-[#262219] via-[#181710] to-[#11120f] text-amber-50 shadow-2xl overflow-hidden relative">
        {/* Cartographic Header Bar */}
        <div className="p-6 sm:p-8 border-b border-stone-700/70 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#242018]/90">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-mono text-amber-300 uppercase tracking-wider">
                {activeBattle.nameEn}
              </span>
              <span className="text-stone-500 text-xs">·</span>
              <span className="text-xs font-tajawal text-stone-300">{activeBattle.dateAr}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-amiri font-bold text-white tracking-tight">
              {activeBattle.nameAr}
            </h2>
            <p className="text-xs sm:text-sm font-tajawal text-stone-300 leading-relaxed">
              {activeBattle.terrainDescriptionAr}
            </p>
          </div>

          {/* Documentary layer controls */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              aria-pressed={showTerrainContours}
              onClick={() => setShowTerrainContours(!showTerrainContours)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-tajawal border transition-colors flex items-center gap-1.5",
                showTerrainContours
                  ? "bg-amber-700/20 border-amber-500/45 text-amber-100"
                  : "bg-stone-900 border-stone-800 text-stone-400"
              )}
            >
              <Mountain className="w-3.5 h-3.5" />
              <span>طبقة التضاريس والجبال</span>
            </button>
            <button
              type="button"
              aria-pressed={showTacticalPaths}
              onClick={() => setShowTacticalPaths(!showTacticalPaths)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-tajawal border transition-colors flex items-center gap-1.5",
                showTacticalPaths
                  ? "bg-stone-700/50 border-stone-500/60 text-stone-100"
                  : "bg-stone-900 border-stone-800 text-stone-400"
              )}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>مسارات التحرك</span>
            </button>
          </div>
        </div>

        {/* The Mountainous Cartographic Map Viewport */}
        <div className="atlas-documentary__map relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[580px] bg-[#cbb78e] overflow-hidden select-none">
          {/* Ancient Parchment Texture Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="carto-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5d4b35" strokeWidth="0.45" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#carto-grid)" />
          </svg>

          {/* SVG Map Core: illustrative teaching diagram, not surveyed geography */}
          <svg
            className="w-full h-full"
            viewBox={activeBattle.mapData.viewBox}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`رسم توضيحي تقريبي لموقعة ${activeBattle.nameAr}: التضاريس والمسارات رمزية تعليمية، والتفاصيل التاريخية مذكورة نصًا في وصف المراحل.`}
          >
            {/* Shaded Terrain Contours */}
            {showTerrainContours && (
              <g className="transition-opacity duration-300">
                {activeBattle.mapData.terrainContours.map((contour, i) => (
                  <g key={`contour-${i}`}>
                    {contour.fill && (
                      <path
                        d={contour.pathD}
                        fill={contour.fill}
                        stroke={contour.stroke || "none"}
                        strokeWidth={contour.stroke ? "1.5" : "0"}
                      />
                    )}
                    {!contour.fill && contour.stroke && (
                      <path
                        d={contour.pathD}
                        fill="none"
                        stroke={contour.stroke}
                        strokeWidth="3"
                        strokeDasharray={contour.type === "trench" ? "6,4" : undefined}
                      />
                    )}
                    {/* Elevation Label */}
                    <text
                      x={contour.labelPos.x}
                      y={contour.labelPos.y}
                      fill="#3f3326"
                      fontSize="12"
                      fontFamily="Amiri, serif"
                      textAnchor="middle"
                      className="opacity-70 font-bold select-none pointer-events-none"
                    >
                      {contour.nameAr}
                    </text>
                  </g>
                ))}
              </g>
            )}

            {/* Interpretive routes: static, neutral, non-directional, and non-navigational. */}
            {showTacticalPaths && (
              <g className="transition-opacity duration-300">
                {activeBattle.mapData.tacticalPaths.map((tacticalPath) => (
                  <g key={tacticalPath.id}>
                    <path
                      d={tacticalPath.pathD}
                      fill="none"
                      stroke="#655844"
                      strokeWidth="1.65"
                      strokeDasharray="8,7"
                      className="atlas-interpretive-path"
                    />
                  </g>
                ))}
              </g>
            )}

            {/* Approximate evidence markers; color does not encode combat teams. */}
            {activeBattle.mapData.positions.map((pos, positionIndex) => {
              const isSelected = selectedMarker === pos.id;
              const isPhaseActive = activePhase.activeMarkers.includes(pos.id);

              return (
                <g
                  key={pos.id}
                  className="cursor-pointer transition-transform duration-200"
                  role="button"
                  tabIndex={0}
                  aria-label={`${pos.labelAr} — موضع تفسيري تقريبي`}
                  onClick={() => setSelectedMarker(isSelected ? null : pos.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedMarker(isSelected ? null : pos.id);
                    }
                  }}
                >
                  {/* Static focus ring for the selected narrative phase. */}
                  {isPhaseActive && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r="16"
                      fill="#8b7047"
                      opacity="0.18"
                      className="atlas-active-marker-ring"
                    />
                  )}

                  {/* Marker Pin Base */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "9" : "7"}
                    fill="#765c38"
                    stroke="#f3e6c8"
                    strokeWidth="2"
                    className="shadow-lg"
                  />

                  {/* Marker Text Label */}
                  <text
                    x={pos.x + (positionIndex % 2 === 0 ? -10 : 10)}
                    y={pos.y - 14 - (positionIndex % 3) * 13}
                    fill="#2d251c"
                    fontSize="11"
                    fontFamily="Cairo, sans-serif"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {pos.labelAr.split(" (")[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Selected Marker Detail Card (Pop-up on map click) */}
          {selectedMarker && (
            <div className="absolute bottom-4 right-4 max-w-sm p-4 bg-[#eee2c8]/95 border border-[#7c633f]/55 text-[#30271d] shadow-2xl animate-fade-in text-right">
              {(() => {
                const marker = activeBattle.mapData.positions.find((p) => p.id === selectedMarker);
                if (!marker) return null;
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#765c38]">موضع تفسيري تقريبي</span>
                      <button
                        type="button"
                        onClick={() => setSelectedMarker(null)}
                        className="text-[#765c38] hover:text-[#30271d] text-xs px-1"
                        aria-label="إغلاق بطاقة الموضع"
                      >
                        ✕
                      </button>
                    </div>
                    <h4 className="text-sm font-bold font-cairo text-[#30271d]">{marker.labelAr}</h4>
                    <p className="text-xs font-tajawal text-[#5b4934] leading-relaxed">
                      {marker.descriptionAr}
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Compass Rose Ornament (Top Left) */}
          <div className="absolute top-4 left-4 p-2 bg-[#eee2c8]/90 border border-[#765c38]/45 text-[#765c38] flex flex-col items-center pointer-events-none">
            <span className="text-[10px] font-mono font-bold">شمال (N)</span>
            <Compass className="w-5 h-5 my-0.5" />
            <span className="text-[9px] font-mono text-[#5b4934]">الحجاز</span>
          </div>
        </div>

        {/* Chronological Phase Controller Bar */}
        <div className="p-6 bg-stone-950/90 border-t border-stone-800/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-cairo text-amber-400">
                المرحلة السردية {activePhase.phaseNumber} من {activeBattle.phases.length}:
              </span>
              <h3 className="text-base font-bold font-amiri text-white">
                {activePhase.titleAr}
              </h3>
            </div>

            {/* Stepper Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPhase}
                disabled={currentPhaseIndex === 0}
                className="h-8 text-xs font-tajawal gap-1 border-stone-700 bg-stone-900 text-stone-200 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>المرحلة السابقة</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPhase}
                disabled={currentPhaseIndex === activeBattle.phases.length - 1}
                className="h-8 text-xs font-tajawal gap-1 border-stone-700 bg-stone-900 text-stone-200 disabled:opacity-40"
              >
                <span>المرحلة التالية</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-tajawal text-stone-300 leading-relaxed bg-black/40 p-4 rounded-xl border border-stone-800/60">
            {activePhase.descriptionAr}
          </p>

          <div className="flex items-center justify-between text-[11px] font-tajawal text-stone-400 pt-1">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>المصدر التوثيقي: {activePhase.historicalSource}</span>
            </div>
            <span>صرح يا رسول الله ﷺ · الأطلس التضاريسي المعتمد</span>
          </div>
        </div>
      </div>
    </div>
  );
}

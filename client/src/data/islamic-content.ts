// Authentic Islamic content data

export interface QuranVerse {
  surah: number;
  verse: number;
  arabic: string;
  translation: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  tafsir: {
    ibn_kathir: string;
    qurtubi: string;
    saadi: string;
  };
}

export interface SeerahTopic {
  id: string;
  title: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  content: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  category: "early_life" | "prophethood" | "migration" | "final_years";
  imagePrompt?: string;
}

export interface PrayerStep {
  id: string;
  title: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  description: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  arabicText?: string;
  transliteration?: string;
}

export interface Zikr {
  id: string;
  arabic: string;
  translation: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
  transliteration: string;
  count?: number;
  time: "morning" | "evening" | "general" | "sleep" | "food";
  virtue: {
    ar: string;
    en: string;
    fr: string;
    ur: string;
  };
}

// Sample authentic data - In production, this would come from verified Islamic sources
export const SAMPLE_QURAN_VERSES: QuranVerse[] = [
  {
    surah: 65,
    verse: 2,
    arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا",
    translation: {
      ar: "ومن يخف الله يجعل له من أمره يسراً",
      en: "And whoever fears Allah, He will make for him a way out",
      fr: "Et quiconque craint Allah, Il lui donnera une issue",
      ur: "اور جو اللہ سے ڈرتا ہے، اللہ اس کے لیے نکلنے کا راستہ بنا دیتا ہے"
    },
    tafsir: {
      ibn_kathir: "من اتقى الله فيما أمره به ونهاه عنه، جعل له من أمره مخرجاً",
      qurtubi: "أي من أمره الذي ضاق عليه، ومن كل غم وهم وحزن",
      saadi: "ومن يتق الله بفعل أوامره واجتناب نواهيه، يجعل له من كل ضيق مخرجاً"
    }
  }
];

export const ALL_SEERAH_TOPICS: SeerahTopic[] = [
  {
    id: "birth-early-life",
    title: {
      ar: "المولد والنشأة",
      en: "Birth and Early Life",
      fr: "Naissance et Jeunesse",
      ur: "پیدائش اور ابتدائی زندگی"
    },
    content: {
      ar: "وُلد النبي محمد صلى الله عليه وسلم في مكة المكرمة في عام الفيل...",
      en: "Prophet Muhammad (peace be upon him) was born in Mecca in the Year of the Elephant...",
      fr: "Le Prophète Muhammad (paix soit sur lui) est né à La Mecque durant l'année de l'Éléphant...",
      ur: "نبی کریم صلی اللہ علیہ وسلم عام الفیل میں مکہ مکرمہ میں پیدا ہوئے..."
    },
    category: "early_life",
    imagePrompt: "Peaceful Arabian landscape at dawn with traditional architecture, representing the blessed birth"
  },
  {
    id: "first-revelation",
    title: {
      ar: "الوحي الأول",
      en: "First Revelation",
      fr: "Première Révélation",
      ur: "پہلی وحی"
    },
    content: {
      ar: "في غار حراء، نزل الوحي الأول على النبي محمد صلى الله عليه وسلم...",
      en: "In the cave of Hira, the first revelation came to Prophet Muhammad...",
      fr: "Dans la grotte de Hira, la première révélation est venue au Prophète Muhammad...",
      ur: "غار حرا میں نبی کریم پر پہلی وحی نازل ہوئی..."
    },
    category: "prophethood"
  }
];

export const ALL_PRAYER_STEPS: PrayerStep[] = [
  {
    id: "wudu",
    title: {
      ar: "الوضوء",
      en: "Ablution (Wudu)",
      fr: "Ablution (Wudu)",
      ur: "وضو"
    },
    description: {
      ar: "الطهارة شرط من شروط صحة الصلاة",
      en: "Purification is a condition for valid prayer",
      fr: "La purification est une condition pour une prière valide",
      ur: "طہارت نماز کی صحت کے لیے شرط ہے"
    }
  },
  {
    id: "qibla",
    title: {
      ar: "استقبال القبلة",
      en: "Facing the Qibla",
      fr: "Se tourner vers la Qibla",
      ur: "قبلہ رخ ہونا"
    },
    description: {
      ar: "التوجه نحو الكعبة المشرفة في مكة المكرمة",
      en: "Facing towards the Holy Kaaba in Mecca",
      fr: "Se tourner vers la Sainte Kaaba à La Mecque",
      ur: "مکہ مکرمہ میں خانہ کعبہ کی طرف رخ کرنا"
    }
  }
];

export const ALL_AZKAR_DATA: Zikr[] = [
  {
    id: "morning-1",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    translation: {
      ar: "دخلنا في الصباح وأصبح الملك لله والحمد لله",
      en: "We have entered the morning and the dominion belongs to Allah, and praise be to Allah",
      fr: "Nous sommes entrés dans le matin et la domination appartient à Allah, et louange à Allah",
      ur: "ہم نے صبح میں داخل ہونے پر اللہ کا شکر ادا کیا"
    },
    transliteration: "Asbahna wa asbaha al-mulku lillah, wal-hamdu lillah",
    time: "morning",
    count: 1,
    virtue: {
      ar: "من قالها حين يصبح حفظه الله من الشياطين",
      en: "Whoever says this in the morning, Allah protects them from devils",
      fr: "Quiconque dit cela le matin, Allah le protège des démons",
      ur: "جو شخص صبح یہ پڑھے، اللہ اسے شیاطین سے محفوظ رکھتا ہے"
    }
  }
];

export const ALL_WOMEN_FAQ_ITEMS = [
  {
    id: "women-rights-1",
    question: {
      ar: "ما هي حقوق المرأة في الإسلام؟",
      en: "What are women's rights in Islam?",
      fr: "Quels sont les droits des femmes en Islam?",
      ur: "اسلام میں عورت کے کیا حقوق ہیں؟"
    },
    answer: {
      ar: "الإسلام كرّم المرأة وأعطاها حقوقاً متساوية مع الرجل في الثواب والعقاب...",
      en: "Islam honored women and gave them equal rights with men in reward and punishment...",
      fr: "L'Islam a honoré les femmes et leur a donné des droits égaux avec les hommes...",
      ur: "اسلام نے عورت کو عزت دی اور ثواب و عقاب میں مرد کے برابر حقوق دیے..."
    }
  }
];

export const ALL_QUIZ_LEVELS = [
  {
    id: "basic-islam",
    title: {
      ar: "أساسيات الإسلام",
      en: "Islamic Basics",
      fr: "Bases de l'Islam",
      ur: "اسلام کی بنیادی باتیں"
    },
    questions: [
      {
        question: {
          ar: "كم عدد أركان الإسلام؟",
          en: "How many pillars are there in Islam?",
          fr: "Combien de piliers y a-t-il en Islam?",
          ur: "اسلام کے کتنے رکن ہیں؟"
        },
        options: ["3", "4", "5", "6"],
        correct: 2,
        explanation: {
          ar: "أركان الإسلام خمسة: الشهادتان، الصلاة، الزكاة، الصوم، الحج",
          en: "The five pillars of Islam are: Shahada, Prayer, Zakat, Fasting, Hajj",
          fr: "Les cinq piliers de l'Islam sont: Shahada, Prière, Zakat, Jeûne, Hajj",
          ur: "اسلام کے پانچ رکن ہیں: کلمہ، نماز، زکات، روزہ، حج"
        }
      }
    ]
  }
];

export const ALL_KIDS_STORIES = [
  {
    id: "honesty-story",
    title: {
      ar: "قصة الصدق",
      en: "The Story of Honesty",
      fr: "L'Histoire de l'Honnêteté",
      ur: "سچائی کی کہانی"
    },
    content: {
      ar: "كان هناك طفل صغير اسمه أحمد، وكان دائماً يقول الصدق...",
      en: "There was a little boy named Ahmad who always told the truth...",
      fr: "Il y avait un petit garçon nommé Ahmad qui disait toujours la vérité...",
      ur: "احمد نام کا ایک چھوٹا بچہ تھا جو ہمیشہ سچ بولتا تھا..."
    },
    lesson: {
      ar: "الصدق من صفات المؤمنين",
      en: "Honesty is a trait of believers",
      fr: "L'honnêteté est un trait des croyants",
      ur: "سچائی مومنوں کی صفت ہے"
    },
    ageGroup: "6-10"
  }
];

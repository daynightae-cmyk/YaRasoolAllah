export interface HadithCollection {
  id: string;
  nameAr: string;
  nameEn: string;
  compiler: string;
  deathHijri: number;
  totalHadithCount: number;
  descriptionAr: string;
  descriptionEn: string;
  isAvailable: boolean;
}

export interface HadithRecord {
  id: string;
  collectionId: string;
  bookNumber: number;
  bookNameAr: string;
  chapterNameAr: string;
  hadithNumber: number;
  narratorAr: string;
  narratorEn?: string;
  textAr: string;
  textEn: string;
  gradeAr: string;
  gradeEn: string;
  gradeSource: string;
  relatedSeerahTopic?: string;
  relatedQuranAyah?: string;
  provenance: string;
}

export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: "bukhari",
    nameAr: "صحيح البخاري",
    nameEn: "Sahih al-Bukhari",
    compiler: "الإمام محمد بن إسماعيل البخاري",
    deathHijri: 256,
    totalHadithCount: 7563,
    descriptionAr: "الجامع المسند الصحيح المختصر من أمور رسول الله ﷺ وسننه وأيامه. أصح كتاب بعد كتاب الله بإجماع الأمة.",
    descriptionEn: "The most authoritative collection of prophetic traditions, rigorously compiled by Imam al-Bukhari.",
    isAvailable: true,
  },
  {
    id: "muslim",
    nameAr: "صحيح مسلم",
    nameEn: "Sahih Muslim",
    compiler: "الإمام مسلم بن الحجاج النيسابوري",
    deathHijri: 261,
    totalHadithCount: 3033,
    descriptionAr: "المسند الصحيح المختصر بنقل العدل عن العدل إلى رسول الله ﷺ. امتاز بدقة التبويب وجمع طرق الحديث في موضع واحد.",
    descriptionEn: "Second only to Bukhari in authenticity, renowned for thematic organization and precise isnad clustering.",
    isAvailable: true,
  },
  {
    id: "abu-dawud",
    nameAr: "سنن أبي داود",
    nameEn: "Sunan Abu Dawud",
    compiler: "الإمام سليمان بن الأشعث السجستاني",
    deathHijri: 275,
    totalHadithCount: 5274,
    descriptionAr: "أحد أصول كتب السنة، عُني خصوصاً بأحاديث الأحكام الفقهية وتفريعها.",
    descriptionEn: "A foundational Sunan collection specializing in legal rulings (ahkam) and prophetic jurisprudence.",
    isAvailable: true,
  },
  {
    id: "tirmidhi",
    nameAr: "جامع الترمذي",
    nameEn: "Jami' al-Tirmidhi",
    compiler: "الإمام محمد بن عيسى الترمذي",
    deathHijri: 279,
    totalHadithCount: 3956,
    descriptionAr: "الجامع المختصر الذي امتاز ببيان درجات الأحاديث (صحيح، حسن، غريب) ومذاهب فقهاء الصحابة والتابعين.",
    descriptionEn: "Celebrated for explicit hadith grading terminology and recording comparative scholarly viewpoints.",
    isAvailable: true,
  },
  {
    id: "nasai",
    nameAr: "سنن النسائي (المجتبى)",
    nameEn: "Sunan al-Nasa'i (Al-Mujtaba)",
    compiler: "الإمام أحمد بن شعيب النسائي",
    deathHijri: 303,
    totalHadithCount: 5758,
    descriptionAr: "من أدق كتب السنن شرطاً في نقد الرواة وبيان علل الأسانيد والاختلاف في ألفاظ الروايات.",
    descriptionEn: "Renowned for its rigorous transmission standards and deep critique of hidden narrational defects (ilal).",
    isAvailable: true,
  },
  {
    id: "ibn-majah",
    nameAr: "سنن ابن ماجه",
    nameEn: "Sunan Ibn Majah",
    compiler: "الإمام محمد بن يزيد بن ماجه القزويني",
    deathHijri: 273,
    totalHadithCount: 4341,
    descriptionAr: "سادس الكتب الستة المعتمدة، تميز بحسن الترتيب وكثرة الأبواب الفقهية والزوائد.",
    descriptionEn: "The sixth of the canonical Six Books, distinguished by excellent chaptering and unique supplementary narrations.",
    isAvailable: true,
  },
];

export const INITIAL_VERIFIED_HADITHS: HadithRecord[] = [
  {
    id: "bukhari-1",
    collectionId: "bukhari",
    bookNumber: 1,
    bookNameAr: "كتاب بدء الوحي",
    chapterNameAr: "باب كيف كان بدء الوحي إلى رسول الله ﷺ",
    hadithNumber: 1,
    narratorAr: "أمير المؤمنين عمر بن الخطاب رضي الله عنه",
    narratorEn: "Umar ibn al-Khattab (may Allah be pleased with him)",
    textAr: "«إنما الأعمال بالنيات، وإنما لكل امرئ ما نوى، فمن كانت هجرته إلى دنيا يصيبها، أو إلى امرأة ينكحها، فهجرته إلى ما هاجر إليه».",
    textEn: "Actions are but by intentions, and every person will have only what they intended. So whoever emigrated for worldly gain or to marry a woman, his emigration is for that to which he emigrated.",
    gradeAr: "صحيح متفق عليه",
    gradeEn: "Sahih (Muttafaq Alayh)",
    gradeSource: "أخرجه البخاري (1) ومسلم (1907)",
    relatedSeerahTopic: "الهجرة النبوية إلى المدينة وإخلاص العمل",
    provenance: "الجامع الصحيح للبخاري — طبعة دار التأصيل المحققة",
  },
  {
    id: "bukhari-13",
    collectionId: "bukhari",
    bookNumber: 2,
    bookNameAr: "كتاب الإيمان",
    chapterNameAr: "باب من الإيمان أن يحب لأخيه ما يحب لنفسه",
    hadithNumber: 13,
    narratorAr: "أنس بن مالك رضي الله عنه",
    narratorEn: "Anas ibn Malik",
    textAr: "«لا يؤمن أحدكم حتى يحب لأخيه ما يحب لنفسه».",
    textEn: "None of you truly believes until he loves for his brother what he loves for himself.",
    gradeAr: "صحيح متفق عليه",
    gradeEn: "Sahih (Muttafaq Alayh)",
    gradeSource: "البخاري (13) ومسلم (45)",
    relatedSeerahTopic: "المؤاخاة بين المهاجرين والأنصار",
    provenance: "الجامع الصحيح للبخاري — طبعة دار التأصيل",
  },
  {
    id: "muslim-2564",
    collectionId: "muslim",
    bookNumber: 45,
    bookNameAr: "كتاب البر والصلة والآداب",
    chapterNameAr: "باب تحريم الظلم",
    hadithNumber: 2564,
    narratorAr: "أبو ذر الغفاري رضي الله عنه عن النبي ﷺ فيما يروي عن ربه تبارك وتعالى",
    narratorEn: "Abu Dharr al-Ghifari from the Prophet narrating from his Lord",
    textAr: "«يا عبادي إني حرمت الظلم على نفسي، وجعلته بينكم محرماً، فلا تظالموا، يا عبادي كلكم ضال إلا من هديته، فاستهدوني أهدكم...».",
    textEn: "O My servants, I have forbidden injustice for Myself and made it forbidden among you, so do not oppress one another...",
    gradeAr: "حديث قدسي صحيح",
    gradeEn: "Hadith Qudsi - Sahih",
    gradeSource: "أخرجه مسلم في صحيحه برقم (2577)",
    relatedSeerahTopic: "إقامة العدل ونبذ الظلم",
    provenance: "صحيح مسلم — طبعة دار المنهاج",
  },
  {
    id: "tirmidhi-1924",
    collectionId: "tirmidhi",
    bookNumber: 27,
    bookNameAr: "كتاب البر والصلة",
    chapterNameAr: "باب ما جاء في رحمة الناس",
    hadithNumber: 1924,
    narratorAr: "عبد الله بن عمرو بن العاص رضي الله عنهما",
    narratorEn: "Abdullah ibn Amr ibn al-Aas",
    textAr: "«الراحمون يرحمهم الرحمن، ارحموا من في الأرض يرحمكم من في السماء، الرَّحِمُ شُجْنَةٌ مِنَ الرَّحْمَنِ، فَمَنْ وَصَلَهَا وَصَلَهُ اللَّهُ وَمَنْ قَطَعَهَا قَطَعَهُ اللَّهُ».",
    textEn: "The merciful are shown mercy by the All-Merciful. Show mercy to those on earth, and the One in the heavens will show mercy to you.",
    gradeAr: "حسن صحيح",
    gradeEn: "Hasan Sahih",
    gradeSource: "جامع الترمذي برقم (1924)",
    relatedSeerahTopic: "الرحمة المهداة للعالمين",
    provenance: "جامع الترمذي — تحقيق أحمد شاكر",
  },
];

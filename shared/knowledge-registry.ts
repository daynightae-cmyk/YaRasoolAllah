export const OPENITI_RELEASE_COMMIT =
  "cfc4157a3cf2054c0888f133970a4eaa3e22e58c";
export const KNOWLEDGE_CHECKED_AT = "2026-09-23T16:30:00+04:00";

export type WorkCategory =
  | "seerah"
  | "history"
  | "tafsir"
  | "hadith"
  | "adab";

export type ContentAvailability =
  | "catalog_only"
  | "external_link_only"
  | "full_text_cleared"
  | "streaming_cleared";

export type ReviewState =
  | "verified_bibliographic"
  | "editorial_review_pending"
  | "scholarly_review_pending";

export interface WorkRecord {
  workId: string;
  titleAr: string;
  titleEn: string;
  authorAr: string;
  authorEn: string;
  category: WorkCategory;
  openitiWorkUri: string | null;
  sourceIds: string[];
  bibliographicStatus: ReviewState;
  scholarlyReviewStatus: ReviewState;
  attributionCaveat: string;
}

export interface DigitalVersionRecord {
  versionId: string;
  workId: string;
  openitiUri: string;
  provider: "OpenITI";
  releaseCommit: string;
  artifactPath: string;
  artifactGitSha: string | null;
  /**
   * Decoded UTF-8 byte length of the pinned artifact, measured on 2026-11-15
   * against the immutable RELEASE commit with `Accept-Encoding: identity`.
   * The reader uses this to fail closed before downloading an oversized file.
   */
  artifactBytes: number;
  sourceUrl: string;
  versionMetadataUrl: string;
  editionStatement: string;
  editor: null;
  translator: null;
  contentAvailability: ContentAvailability;
  rightsState:
    | "catalog_metadata_only_full_text_needs_version_review"
    | "cleared_public_domain_openiti_historical_text";
  checkedAt: string;
}

export interface ProviderPolicyRecord {
  providerId: string;
  provider: string;
  domain: "books" | "quran" | "hadith" | "maps" | "audio" | "daily" | "media";
  canonicalUrl: string;
  rightsUrl: string | null;
  rightsState:
    | "cleared_with_attribution"
    | "api_only"
    | "external_link_only"
    | "needs_license_review"
    | "needs_credential"
    | "item_by_item_review";
  contentAvailability: ContentAvailability;
  credentialsRequired: boolean;
  productionUse: string;
  attribution: string | null;
  checkedAt: string;
}

export interface ChildrenAdaptationRecord {
  adaptationId: string;
  titleAr: string;
  summaryAr: string;
  ageBand: "6-8" | "9-12" | "13-15";
  sourceIds: string[];
  adaptationLabel: "platform_original_not_a_direct_quote";
  editorialStatus: "draft" | "editorial_review_pending";
  reviewStatus: "scholarly_review_pending";
  depictionPolicy: "no_prophetic_depiction";
}

export const workRegistry: WorkRecord[] = [
  {
    workId: "work-ibn-hisham-sira",
    titleAr: "السيرة النبوية",
    titleEn: "Al-Sirah al-Nabawiyyah",
    authorAr: "عبد الملك بن هشام (ت 213هـ)",
    authorEn: "Ibn Hisham (d. 213 AH)",
    category: "seerah",
    openitiWorkUri: "0213IbnHisham.SiraNabawiyya",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibn-sad-tabaqat",
    titleAr: "الطبقات الكبرى",
    titleEn: "Al-Tabaqat al-Kubra",
    authorAr: "محمد بن سعد (ت 230هـ)",
    authorEn: "Ibn Sa'd (d. 230 AH)",
    category: "seerah",
    openitiWorkUri: "0230IbnSacd.TabaqatKubra",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "كل نسخة رقمية مسجلة على حدة؛ السجل لا يثبت محققاً أو ناشراً غير موجود في بيانات النسخة.",
  },
  {
    workId: "work-waqidi-maghazi",
    titleAr: "المغازي",
    titleEn: "Al-Maghazi",
    authorAr: "منسوب إلى محمد بن عمر الواقدي (ت 207هـ)",
    authorEn: "Attributed to al-Waqidi (d. 207 AH)",
    category: "seerah",
    openitiWorkUri: "0207Waqidi.Maghazi",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "مصدر تاريخي منسوب؛ لا تُحوّل رواياته إلى يقين غير متنازع عليه.",
  },
  {
    workId: "work-tabari-tarikh",
    titleAr: "تاريخ الرسل والملوك",
    titleEn: "History of Prophets and Kings",
    authorAr: "محمد بن جرير الطبري (ت 310هـ)",
    authorEn: "Al-Tabari (d. 310 AH)",
    category: "history",
    openitiWorkUri: "0310Tabari.Tarikh",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل فهرسي تاريخي؛ الروايات تحتاج تقويماً علمياً في سياقها.",
  },
  {
    workId: "work-bayhaqi-dalail",
    titleAr: "دلائل النبوة",
    titleEn: "Dala'il al-Nubuwwah",
    authorAr: "أحمد بن الحسين البيهقي (ت 458هـ)",
    authorEn: "Al-Bayhaqi (d. 458 AH)",
    category: "seerah",
    openitiWorkUri: "0458Bayhaqi.DalailNubuwwa",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "فهرسة نسخة رقمية لا تمثل حكماً على الأسانيد ولا اعتماد طبعة.",
  },
  {
    workId: "work-ibn-kathir-bidaya",
    titleAr: "البداية والنهاية",
    titleEn: "Al-Bidayah wa al-Nihayah",
    authorAr: "إسماعيل بن كثير (ت 774هـ)",
    authorEn: "Ibn Kathir (d. 774 AH)",
    category: "history",
    openitiWorkUri: "0774IbnKathir.Bidaya",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "المادة التاريخية والسيرية تحتاج ربطاً بالموضع والجزء والنسخة.",
  },
  {
    workId: "work-ibn-kathir-fusul-sira",
    titleAr: "الفصول في سيرة الرسول",
    titleEn: "Fusul min Sirat al-Rasul",
    authorAr: "إسماعيل بن كثير (ت 774هـ)",
    authorEn: "Ibn Kathir (d. 774 AH)",
    category: "seerah",
    openitiWorkUri: "0774IbnKathir.FusulMinSira",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل ببليوغرافي للنسخة الرقمية، لا إثبات لطبعة نقدية.",
  },
  {
    workId: "work-tabari-tafsir",
    titleAr: "جامع البيان عن تأويل آي القرآن",
    titleEn: "Jami' al-Bayan",
    authorAr: "محمد بن جرير الطبري (ت 310هـ)",
    authorEn: "Al-Tabari (d. 310 AH)",
    category: "tafsir",
    openitiWorkUri: "0310Tabari.JamicBayan",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "نسخة رقمية مؤهلة للقراءة داخل المنصة؛ ولا تُعد طبعة نقدية، والمراجعة العلمية ما زالت معلقة.",
  },
  {
    workId: "work-qurtubi-tafsir",
    titleAr: "الجامع لأحكام القرآن",
    titleEn: "Al-Jami' li-Ahkam al-Qur'an",
    authorAr: "محمد بن أحمد القرطبي (ت 671هـ)",
    authorEn: "Al-Qurtubi (d. 671 AH)",
    category: "tafsir",
    openitiWorkUri: "0671AbuCabdAllahQurtubi.JamicLiAhkamQuran",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "نسخة رقمية مؤهلة للقراءة داخل المنصة؛ لا تمنح الفهرسة وحدها أي حكم على الطبعة.",
  },
  {
    workId: "work-baghawi-tafsir",
    titleAr: "معالم التنزيل",
    titleEn: "Ma'alim al-Tanzil",
    authorAr: "الحسين بن مسعود البغوي (ت 510هـ)",
    authorEn: "Al-Baghawi (d. 510 AH)",
    category: "tafsir",
    openitiWorkUri: "0510IbnMascudBaghawi.Tafsir",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "نسخة رقمية مؤهلة للقراءة داخل المنصة؛ فهرستها لا تثبت طبعة نقدية.",
  },
  {
    workId: "work-ibn-kathir-tafsir",
    titleAr: "تفسير القرآن العظيم",
    titleEn: "Tafsir al-Qur'an al-'Azim",
    authorAr: "إسماعيل بن كثير (ت 774هـ)",
    authorEn: "Ibn Kathir (d. 774 AH)",
    category: "tafsir",
    openitiWorkUri: "0774IbnKathir.TafsirQuran",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "نسخة رقمية مؤهلة للقراءة داخل المنصة؛ والمراجعة العلمية للطبعة ما زالت معلقة.",
  },
  {
    workId: "work-sadi-tafsir",
    titleAr: "تيسير الكريم الرحمن في تفسير كلام المنان",
    titleEn: "Taysir al-Karim al-Rahman",
    authorAr: "عبد الرحمن السعدي (ت 1376هـ)",
    authorEn: "Abd al-Rahman al-Sa'di (d. 1376 AH)",
    category: "tafsir",
    openitiWorkUri: null,
    sourceIds: ["src-library-bibliographic-registry"],
    bibliographicStatus: "editorial_review_pending",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل فقط؛ لم تُثبت نسخة رقمية أو طبعة أو حقوق في هذا الإصدار.",
  },
  {
    workId: "work-bukhari-sahih",
    titleAr: "الجامع الصحيح",
    titleEn: "Sahih al-Bukhari",
    authorAr: "محمد بن إسماعيل البخاري (ت 256هـ)",
    authorEn: "Al-Bukhari (d. 256 AH)",
    category: "hadith",
    openitiWorkUri: "0256Bukhari.Sahih",
    sourceIds: ["src-openiti-release-pinned", "src-sunnah-api"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "العمل موثق ببليوغرافياً؛ درجات الأحاديث ومصادر الحكم تبقى حقولاً مستقلة.",
  },
  {
    workId: "work-muslim-sahih",
    titleAr: "صحيح مسلم",
    titleEn: "Sahih Muslim",
    authorAr: "مسلم بن الحجاج (ت 261هـ)",
    authorEn: "Muslim ibn al-Hajjaj (d. 261 AH)",
    category: "hadith",
    openitiWorkUri: "0261Muslim.Sahih",
    sourceIds: ["src-openiti-release-pinned", "src-sunnah-api"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "النسخة الرقمية مؤهلة للعرض داخل المنصة، لكن اعتمادها النصي ينتظر المراجعة العلمية المنفصلة.",
  },
  {
    workId: "work-bukhari-adab",
    titleAr: "الأدب المفرد",
    titleEn: "Al-Adab al-Mufrad",
    authorAr: "محمد بن إسماعيل البخاري (ت 256هـ)",
    authorEn: "Al-Bukhari (d. 256 AH)",
    category: "adab",
    openitiWorkUri: "0256Bukhari.AdabMufrad",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "لا يُفترض حكم واحد على جميع مرويات العمل؛ الدرجة ومصدرها منفصلان.",
  },
  {
    workId: "work-tirmidhi-shamail",
    titleAr: "الشمائل المحمدية",
    titleEn: "Al-Shama'il al-Muhammadiyyah",
    authorAr: "محمد بن عيسى الترمذي (ت 279هـ)",
    authorEn: "Al-Tirmidhi (d. 279 AH)",
    category: "hadith",
    openitiWorkUri: "0279Tirmidhi.ShamailMuhammadiyya",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "لا تجسيد للنبي ﷺ؛ النصوص تحتاج تخريجاً ودرجة ومصدر حكم ظاهرين.",
  },
  {
    workId: "work-nawawi-riyad",
    titleAr: "رياض الصالحين",
    titleEn: "Riyad al-Salihin",
    authorAr: "يحيى بن شرف النووي (ت 676هـ)",
    authorEn: "Al-Nawawi (d. 676 AH)",
    category: "adab",
    openitiWorkUri: "0676Nawawi.RiyadSalihin",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل العمل لا يغني عن توثيق كل حديث ودرجته ومصدر الحكم.",
  },
  {
    workId: "work-quran-mushaf",
    titleAr: "القران",
    titleEn: "al-Qurān",
    authorAr: "القرآن",
    authorEn: "Quran",
    category: "tafsir",
    openitiWorkUri: "0001Quran.Mushaf",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-abucamrdani-tahdidfiitqan",
    titleAr: "التحديد في الإتقان والتجويد",
    titleEn: "Tahdid Fi Itqan",
    authorAr: "عثمان بن سعيد بن عثمان بن عمر أبو عمرو الداني (المتوفى: 444هـ)",
    authorEn: "Abu Camr Dani",
    category: "tafsir",
    openitiWorkUri: "0444AbuCamrDani.TahdidFiItqan",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-suyuti-itqan",
    titleAr: "الإتقان في علوم القرآن",
    titleEn: "Itqan",
    authorAr: "جلال الدين السيوطي",
    authorEn: "Suyuti",
    category: "tafsir",
    openitiWorkUri: "0911Suyuti.Itqan",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-suyuti-tafsirjalalayn",
    titleAr: "تفسير الجلالين",
    titleEn: "Tafsir Jalalayn",
    authorAr: "جلال الدين السيوطي",
    authorEn: "Suyuti",
    category: "tafsir",
    openitiWorkUri: "0911Suyuti.TafsirJalalayn",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibnahmadhafizdinnasafi-tafsir",
    titleAr: "تفسير النسفي",
    titleEn: "Tafsir",
    authorAr: "النسفي",
    authorEn: "Ibn Ahmad Hafiz Din Nasafi",
    category: "tafsir",
    openitiWorkUri: "0710IbnAhmadHafizDinNasafi.Tafsir",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-abuishaqthaclabi-kashfwabayan",
    titleAr: "الكشف والبيان",
    titleEn: "al-Kašf wa-l-bayān",
    authorAr: "أبو اسحاق الثعلبي",
    authorEn: "Abu Ishaq Thaclabi",
    category: "tafsir",
    openitiWorkUri: "0427AbuIshaqThaclabi.KashfWaBayan",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-malikibnanas-muwatta",
    titleAr: "الموطأ",
    titleEn: "Muwatta",
    authorAr: "مالك بن أنس",
    authorEn: "Malik Ibn Anas",
    category: "hadith",
    openitiWorkUri: "0179MalikIbnAnas.Muwatta",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-abudawudsijistani-sunan",
    titleAr: "سنن أبي داود",
    titleEn: "Sunan",
    authorAr: "أبو داود السجستاني",
    authorEn: "Abu Dawud Sijistani",
    category: "hadith",
    openitiWorkUri: "0275AbuDawudSijistani.Sunan",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibnmaja-sunan",
    titleAr: "سنن ابن ماجه",
    titleEn: "Sunan",
    authorAr: "محمد بن يزيد أبو عبدالله القزويني",
    authorEn: "Ibn Maja",
    category: "hadith",
    openitiWorkUri: "0273IbnMaja.Sunan",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-khatibtabrizi-mishkatmasabih",
    titleAr: "مشكاة المصابيح",
    titleEn: "Mishkat Masabih",
    authorAr: "محمد بن عبد الله الخطيب التبريزي",
    authorEn: "Khatib Tabrizi",
    category: "hadith",
    openitiWorkUri: "0741KhatibTabrizi.MishkatMasabih",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibnsalahshahrazuri-muqaddimatculumhadith",
    titleAr: "مقدمة ابن الصلاح",
    titleEn: "Muqaddimat Culum Hadith",
    authorAr: "ابن صلاح",
    authorEn: "Ibn Salah Shahrazuri",
    category: "hadith",
    openitiWorkUri: "0643IbnSalahShahrazuri.MuqaddimatCulumHadith",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibnaslamtusi-arbacun",
    titleAr: "الأربعون",
    titleEn: "Arbacun",
    authorAr: "الإمام الحافظ أبي الحسن محمد بن أسلم الطوسي",
    authorEn: "Ibn Aslam Tusi",
    category: "hadith",
    openitiWorkUri: "0242IbnAslamTusi.Arbacun",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibnishaq-sira",
    titleAr: "سيرة  ابن اسحاق",
    titleEn: "Sīraŧ  åbn Isḥāq",
    authorAr: "ابن اسحاق",
    authorEn: "Ibn Ishaq",
    category: "seerah",
    openitiWorkUri: "0151IbnIshaq.Sira",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibnhazm-jawamicsira",
    titleAr: "جوامع السيرة النبوية",
    titleEn: "Jawamic Sira",
    authorAr: "ابن حزم",
    authorEn: "Ibn Hazm",
    category: "seerah",
    openitiWorkUri: "0456IbnHazm.JawamicSira",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-cizzdinibnjamaca-mukhtasarkabir",
    titleAr: "المختصر الكبير في سيرة الرسول صلى الله عليه وسلم",
    titleEn: "Mukhtasar Kabir",
    authorAr: "عز الدين بن جماعة الكتاني",
    authorEn: "Cizz Din Ibn Jamaca",
    category: "seerah",
    openitiWorkUri: "0767CizzDinIbnJamaca.MukhtasarKabir",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibnhibbanbusti-sira",
    titleAr: "السيرة النبوية وأخبار الخلفاء",
    titleEn: "Sira",
    authorAr: "ابن حبان البستي",
    authorEn: "Ibn Hibban Busti",
    category: "seerah",
    openitiWorkUri: "0354IbnHibbanBusti.Sira",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibnyahyamuzani-mukhtasar",
    titleAr: "مختصر المزني",
    titleEn: "Mukhtasar",
    authorAr: "المزني",
    authorEn: "Ibn Yahya Muzani",
    category: "hadith",
    openitiWorkUri: "0264IbnYahyaMuzani.Mukhtasar",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ghazali-wasit",
    titleAr: "الوسيط في المذهب",
    titleEn: "al-Wasīṭ fī al-maḏhab",
    authorAr: "الغزالي",
    authorEn: "Ghazali",
    category: "hadith",
    openitiWorkUri: "0505Ghazali.Wasit",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-nawawi-majmuc",
    titleAr: "المجموع",
    titleEn: "Majmuc",
    authorAr: "النووي",
    authorEn: "Nawawi",
    category: "hadith",
    openitiWorkUri: "0676Nawawi.Majmuc",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-nawawi-rawdattalibin",
    titleAr: "روضة الطالبين وعمدة المفتين",
    titleEn: "Rawdat Talibin",
    authorAr: "النووي",
    authorEn: "Nawawi",
    category: "hadith",
    openitiWorkUri: "0676Nawawi.RawdatTalibin",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-burhandinfarghanimarghinani-bidaya",
    titleAr: "بداية المبتدي",
    titleEn: "Bidaya",
    authorAr: "برهان الدين علي بن أبي بكر بن عبد الجليل الفرغاني المرغيناني",
    authorEn: "Burhan Din Farghani Marghinani",
    category: "hadith",
    openitiWorkUri: "0593BurhanDinFarghaniMarghinani.Bidaya",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-abuishaqshirazi-lumacfiusulfiqh",
    titleAr: "اللمع في أصول الفقه",
    titleEn: "Lumac Fi Usul Fiqh",
    authorAr: "الشيرازي",
    authorEn: "Abu Ishaq Shirazi",
    category: "hadith",
    openitiWorkUri: "0476AbuIshaqShirazi.LumacFiUsulFiqh",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-imamharamaynjuwayni-burhanfiusulfiqh",
    titleAr: "البرهان في أصول الفقه",
    titleEn: "Burhan Fi Usul Fiqh",
    authorAr: "امام الحرمين الجويني",
    authorEn: "Imam Haramayn Juwayni",
    category: "hadith",
    openitiWorkUri: "0478ImamHaramaynJuwayni.BurhanFiUsulFiqh",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ghazali-mustasfa",
    titleAr: "المستصفى",
    titleEn: "Mustasfa",
    authorAr: "الغزالي",
    authorEn: "Ghazali",
    category: "hadith",
    openitiWorkUri: "0505Ghazali.Mustasfa",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-shaykhtusi-ciddatusul",
    titleAr: "عدة الأصول (ط.ج)",
    titleEn: "Ciddat Usul",
    authorAr: "الشيخ الطوسي",
    authorEn: "Shaykh Tusi",
    category: "hadith",
    openitiWorkUri: "0460ShaykhTusi.CiddatUsul",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-tahawi-matncaqida",
    titleAr: "متن العقيدة الطحاوية",
    titleEn: "Matn Caqida",
    authorAr: "الطحاوي",
    authorEn: "Tahawi",
    category: "adab",
    openitiWorkUri: "0321Tahawi.MatnCaqida",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ibntaymiyya-caqidawasitiyya",
    titleAr: "العقيدة الواسطية",
    titleEn: "Caqida Wasitiyya",
    authorAr: "ابن تيمية",
    authorEn: "Ibn Taymiyya",
    category: "adab",
    openitiWorkUri: "0728IbnTaymiyya.CaqidaWasitiyya",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-imamharamaynjuwayni-lamcadilla",
    titleAr: "لمع الأدلة في قواعد عقائد أهل السنة والجماعة",
    titleEn: "Lamc Adilla",
    authorAr: "امام الحرمين الجويني",
    authorEn: "Imam Haramayn Juwayni",
    category: "adab",
    openitiWorkUri: "0478ImamHaramaynJuwayni.LamcAdilla",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-sibawayhi-kitabsibawayhi",
    titleAr: "كتاب سيبويه",
    titleEn: "Kitāb Sībawayhi",
    authorAr: "سيبويه",
    authorEn: "Sibawayhi",
    category: "adab",
    openitiWorkUri: "0180Sibawayhi.KitabSibawayhi",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-qalqashandi-subhacsha",
    titleAr: "صبح الأعشى في صناعة الانشاء",
    titleEn: "Ṣubḥ al-aʿšá fī ṣināʿaŧ al-inšāʾ",
    authorAr: "القلقشندي، الفزاريو الشافعي",
    authorEn: "Qalqashandi",
    category: "adab",
    openitiWorkUri: "0821Qalqashandi.SubhAcsha",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-suyuti-cuqudjuman",
    titleAr: "عقود الجمان في علم المعاني والبيان",
    titleEn: "Cuqud Juman",
    authorAr: "جلال الدين السيوطي",
    authorEn: "Suyuti",
    category: "adab",
    openitiWorkUri: "0911Suyuti.CuqudJuman",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-jahiz-bayanwatabyin",
    titleAr: "البيان والتبيين",
    titleEn: "Bayan Wa Tabyin",
    authorAr: "الجاحظ",
    authorEn: "Jahiz",
    category: "adab",
    openitiWorkUri: "0255Jahiz.BayanWaTabyin",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
  {
    workId: "work-ghazali-ihyaculumdin",
    titleAr: "إحياء علوم الدين",
    titleEn: "Ihya Culum Din",
    authorAr: "الغزالي",
    authorEn: "Ghazali",
    category: "adab",
    openitiWorkUri: "0505Ghazali.IhyaCulumDin",
    sourceIds: ["src-openiti-release-pinned"],
    bibliographicStatus: "verified_bibliographic",
    scholarlyReviewStatus: "scholarly_review_pending",
    attributionCaveat: "سجل عمل ونسخ رقمية OpenITI مثبتة على Release ثابت؛ لا تُوصف أي نسخة بأنها طبعة نقدية دون دليل مستقل.",
  },
];

type VersionRow = readonly [string, string, string | null, string, number];

const versionRows: VersionRow[] = [
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.JK000797-ara1", "8ef262e181ea86a66fbf199a042bda8ded6e6146", "plain", 2534280],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.Masaha003361Vols-ara1", "7c86be5ad1be445cf69076785a8662eaad416a31", "plain", 4198673],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.ShamAY0034440-ara1", "23e193ad107593a6ac6217027bde7d831ff425d4", "plain", 2565831],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.Shamela0007450-ara1", "b6f801433e9dca1ffd460472a60bf7960e6b4e92", "plain", 1398814],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.Shamela0023833-ara1", "dd56bd3ac0fcf69f74bdce8034fb60865698c85d", "completed", 2654027],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.Shia003667Vols-ara1", "7dd974a2d885371ba802d01c11feb33505cb8fa6", "plain", 2569775],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.JK000530-ara2", "f5fb6fc1313582f4d098f9da23a28a73519286f2", "plain", 7837123],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.JK000744-ara5", "7ff53945ae1f6d5bfb9f2b7e288a018cb25ba49f", "plain", 349773],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.ShamAY0034595-ara1", "39dc0f2ded511b5599a47ff85a898fe07f3445c8", "plain", 10850846],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.ShamAY0035884-ara1", "6a6a193e01e933b42217565323f491e606e3e7b6", "mARkdown", 11007272],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0001686-ara1", "d33aaa10fa2bb18e3b24d6eff805218b33843351", "mARkdown", 8384540],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0001689-ara4", "56e0dce0be9b78c6f6e720c03f14105683d9717d", "plain", 613805],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0007666-ara5", "2b5fd1f28bd7b281c832dc644d328c74fdc01c99", "plain", 528683],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0009351-ara2", "40bb8cf8f6a388dce3a81b2a9a4f48a3f994271a", "plain", 8389713],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0009352-ara5", "4d926a5cec6f442790c2fb3b4c402b6a978c0981", "plain", 364287],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0012416-ara3", "edfd5d42734f2a3f6d832948544959d0d7999167", "plain", 668622],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shia003044Vols-ara2", "4289c8ad52c01e4914259ceaf9b09e15f6fa7309", "plain", 7869497],
  ["work-waqidi-maghazi", "0207Waqidi.Maghazi.JK009232-ara1", "fcbb509b7a43622b718446d94379d7f23e469b40", "plain", 2458005],
  ["work-waqidi-maghazi", "0207Waqidi.Maghazi.Masaha003023Vols-ara1", "f7db519e93c955a480de27cd629f14b2eb67f2be", "plain", 2867210],
  ["work-waqidi-maghazi", "0207Waqidi.Maghazi.Shamela0023680-ara1", "f1407d3a3213d5c0d09f5d02e8c9b3b577a2ef38", "mARkdown", 2409107],
  ["work-tabari-tarikh", "0310Tabari.Tarikh.JK000157-ara2", "ba0ec167b36a4784fcdf37d5144ceaea6a59e392", "plain", 13019201],
  ["work-bayhaqi-dalail", "0458Bayhaqi.DalailNubuwwa.JK006838-ara1", "01b35303dfdda2033e8995677bd1a9669a92e341", "mARkdown", 4825900],
  ["work-ibn-kathir-bidaya", "0774IbnKathir.Bidaya.JK000158-ara3", "d3e44018715ce357742f429a63aac0999a6dce50", "plain", 18794894],
  ["work-ibn-kathir-fusul-sira", "0774IbnKathir.FusulMinSira.JK000796-ara1", "608f75f375b55d6289fb4972e5ab1fa95fb74012", "plain", 364265],
  ["work-tabari-tafsir", "0310Tabari.JamicBayan.JK000164-ara1", "b6e75276e484314a87d4a3fc59879f3a8112c453", "plain", 26360746],
  ["work-qurtubi-tafsir", "0671AbuCabdAllahQurtubi.JamicLiAhkamQuran.JK000160-ara1", "e99137ca476a3e7c75e5748cddca47ed979a7524", "plain", 19352765],
  ["work-baghawi-tafsir", "0510IbnMascudBaghawi.Tafsir.JK000464-ara1", "419d22421c275d9e7ae1679df72d8d35d60073eb", "plain", 7908952],
  ["work-ibn-kathir-tafsir", "0774IbnKathir.TafsirQuran.JK000161-ara2", "2cc04d4967440882ab6254a131e0b9c204fb0d7f", "plain", 13935380],
  ["work-bukhari-sahih", "0256Bukhari.Sahih.JK000110-ara1", "945cd388b14ad8235e429bf66369a84847e56e0c", "completed", 5524762],
  ["work-muslim-sahih", "0261Muslim.Sahih.JK000109-ara1", "19b3063663fa8991a0d2d907b81f449f92964bdb", "plain", 4560879],
  ["work-bukhari-adab", "0256Bukhari.AdabMufrad.JK000011-ara1", "c76adbd5b9fc53a41f76022af90d6bf1d8e1d7ba", "plain", 704485],
  ["work-tirmidhi-shamail", "0279Tirmidhi.ShamailMuhammadiyya.JK000139-ara1", "5a4ba7fd636b9144c607819965a9296ecc8915f1", "plain", 217722],
  ["work-nawawi-riyad", "0676Nawawi.RiyadSalihin.JK000073-ara2", "cc403bf610b74ac895f771fe7c602d03436fb2df", "plain", 1131289],
  ["work-quran-mushaf", "0001Quran.Mushaf.QuranAnalysis001-ara1", "196c6d79489d7b161228100e12a8be6e0a3f1d19", "mARkdown", 798797],
  ["work-quran-mushaf", "0001Quran.Mushaf.Shia000001-ara1", "3969f39a9b2b105624bef734b454b1adc1aeb76f", "mARkdown", 798714],
  ["work-quran-mushaf", "0001Quran.Mushaf.Tanzil001-ara1", "8d0a6c806598d6c6afe6b7f9b20940ab1baeddee", "mARkdown", 810476],
  ["work-abucamrdani-tahdidfiitqan", "0444AbuCamrDani.TahdidFiItqan.Shamela0026458-ara1", "2ccecc75e24a05038030922284a11b84fce411ab", "plain", 152963],
  ["work-suyuti-itqan", "0911Suyuti.Itqan.JK001295-ara1", "1e07cefe7f2ff9f0a212f3b0a9bcfd3c7bdabc31", "plain", 2454673],
  ["work-suyuti-itqan", "0911Suyuti.Itqan.Shamela0011728-ara1", "96813a3bfff1fda0a375c94dadee9027a6af6fda", "plain", 2404336],
  ["work-suyuti-itqan", "0911Suyuti.Itqan.Shia002675Vols-ara1", "2b03be85cf244f2a1e26cb01f5b1c9029aa90861", "plain", 2405923],
  ["work-suyuti-tafsirjalalayn", "0911Suyuti.TafsirJalalayn.JK000818-ara1", "151a47183e57e30c66213d30570482a864472ed2", "plain", 2413045],
  ["work-suyuti-tafsirjalalayn", "0911Suyuti.TafsirJalalayn.Shamela0012876-ara1", "bb2dd7f548e3a0b3a29037480c171983709172af", "plain", 2040795],
  ["work-suyuti-tafsirjalalayn", "0911Suyuti.TafsirJalalayn.Shia002669-ara1", "f413219e68a00d18387263ad3d2f18453aaf9038", "plain", 2711944],
  ["work-suyuti-tafsirjalalayn", "0911Suyuti.TafsirJalalayn.Tafsir01008-ara1", "fccaf63db5faa80adc46beb6b2725f038e4b17f5", "plain", 2051215],
  ["work-ibnahmadhafizdinnasafi-tafsir", "0710IbnAhmadHafizDinNasafi.Tafsir.JK000876-ara1", "ab257a411aa83b2dc203eccf2e6fabc830040e4e", "plain", 5367630],
  ["work-ibnahmadhafizdinnasafi-tafsir", "0710IbnAhmadHafizDinNasafi.Tafsir.ShamAY0034061-ara1", "81bfc75bd69e5dd9ca548ff8e504ca7c8287ad95", "plain", 5326979],
  ["work-ibnahmadhafizdinnasafi-tafsir", "0710IbnAhmadHafizDinNasafi.Tafsir.Shamela0001394-ara1", "8c7d376796188e4941c11012da2a4db4cb9e61ba", "plain", 5617922],
  ["work-ibnahmadhafizdinnasafi-tafsir", "0710IbnAhmadHafizDinNasafi.Tafsir.Shia002557Vols-ara1", "30ebcfc326ba77da99b97085cb00b091b4b81861", "plain", 4810866],
  ["work-ibnahmadhafizdinnasafi-tafsir", "0710IbnAhmadHafizDinNasafi.Tafsir.Tafsir02017-ara1", "9bf6db4831684aaad44242be50bc2c695439415b", "plain", 4853060],
  ["work-abuishaqthaclabi-kashfwabayan", "0427AbuIshaqThaclabi.KashfWaBayan.JK000449-ara1", "de814ec4b563078c458e941d41105da5294b9b5b", "plain", 11127182],
  ["work-abuishaqthaclabi-kashfwabayan", "0427AbuIshaqThaclabi.KashfWaBayan.JK007093-ara1", "a8a0d9e674af95a8f454eaa09cb1ad012c0cdb71", "plain", 11175644],
  ["work-abuishaqthaclabi-kashfwabayan", "0427AbuIshaqThaclabi.KashfWaBayan.Rafed0001643Vols-ara1", "55b7aa0a05e354d5cddfe93831bcb03c14fe2f37", "plain", 11568934],
  ["work-abuishaqthaclabi-kashfwabayan", "0427AbuIshaqThaclabi.KashfWaBayan.Sham19Y0018686-ara1", "819006514da40f3e082a66e585cbd5abe8c2b85f", "plain", 33451839],
  ["work-abuishaqthaclabi-kashfwabayan", "0427AbuIshaqThaclabi.KashfWaBayan.Shamela0023578-ara1", "8a36dff7c8d673a063b9fe7f94b4007c0282917e", "mARkdown", 10484602],
  ["work-abuishaqthaclabi-kashfwabayan", "0427AbuIshaqThaclabi.KashfWaBayan.Shia002529Vols-ara1", "055915952dd7933b807e41d17310619a86e9293e", "plain", 10597792],
  ["work-abuishaqthaclabi-kashfwabayan", "0427AbuIshaqThaclabi.KashfWaBayan.Tafsir02075-ara1", "0c98b88a1c011e125f7a08b1f9f43ff128e3a0be", "plain", 9578834],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.JK000466-ara1", "d9592fafe0ff0d0043d70d19d87d4d2a932fe37f", "plain", 1344119],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.ShamAY0033921-ara1", "d7a7eca343cae43b3840d5e7869f2a18b4742747", "plain", 322420],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.ShamAY0033922-ara1", "1f6e4b92bcfc8deb2764239d3e7fca08569d102d", "plain", 62050],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.ShamAY0033923-ara1", "e4530c5664fbe68918ad21bc89ac2fef110701d1", "plain", 819649],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.ShamAY0033991-ara1", "9406530de91bec2ce24695ccc0f0dc23a1a5d54d", "plain", 133713],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.Shamela0001699-ara1", "a8ce4cf6fe5e2ca05d7e7f933cc197ac6bf596af", "completed", 1397896],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.Shamela0008140-ara1", "f0277baf5a99b8f1c95c17895245ea8a66cdba5d", "completed", 1511089],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.Shamela0016050-ara1", "7e7b933285aee843b2b6ae2b89c621bceae7e75e", "completed", 627361],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.Shamela0028107-ara1", "081fa907b9c1e1fa39db66ce874db543193099d3", "completed", 2400174],
  ["work-malikibnanas-muwatta", "0179MalikIbnAnas.Muwatta.Shia000901Vols-ara1", "8d841dceb8abaf08428abbf93d0d84ba4f21703f", "plain", 2054658],
  ["work-abudawudsijistani-sunan", "0275AbuDawudSijistani.Sunan.JK000142-ara1", "a3f54c9912a04665a295a6dbb94003d90ad72a23", "plain", 3123002],
  ["work-abudawudsijistani-sunan", "0275AbuDawudSijistani.Sunan.ShamAY0033960-ara1", "6824cdbb3d198cd7550598342eb720af6df13708", "plain", 3478131],
  ["work-abudawudsijistani-sunan", "0275AbuDawudSijistani.Sunan.Shamela0001726-ara1", "cac9781b0308dae1aa920b8d007753cc060dcbf4", "plain", 3398133],
  ["work-abudawudsijistani-sunan", "0275AbuDawudSijistani.Sunan.Shamela0117359-ara1", "6d54c91199fe0e18cd9437b834e4c1d540edf87f", "plain", 3753828],
  ["work-abudawudsijistani-sunan", "0275AbuDawudSijistani.Sunan.Shia001733Vols-ara1", "05e400e358936ee55d009fcf6c9645712ce1ef90", "plain", 3373563],
  ["work-ibnmaja-sunan", "0273IbnMaja.Sunan.JK000141-ara1", "632ef8cce8b0868c213ea8e6930b724bae271f00", "plain", 2289442],
  ["work-ibnmaja-sunan", "0273IbnMaja.Sunan.ShamAY0033959-ara1", "c14bde4a59b1f75416019acd8b3e5b7e59d51105", "plain", 2525013],
  ["work-ibnmaja-sunan", "0273IbnMaja.Sunan.Shamela0001198-ara1", "06362689ca55bacb90a6b7da2cb3bda766297a14", "plain", 2535073],
  ["work-ibnmaja-sunan", "0273IbnMaja.Sunan.Shamela0098138-ara1", "b2c52c64d41a158a670cbeb2d0466cafdd8a9a2d", "plain", 2678249],
  ["work-ibnmaja-sunan", "0273IbnMaja.Sunan.Shia001731Vols-ara1", "00dfa78b2d7a0346a01706964033af2b06cad6e3", "plain", 2663374],
  ["work-khatibtabrizi-mishkatmasabih", "0741KhatibTabrizi.MishkatMasabih.JK007045-ara1", "020bc6253ba7af620afd65a54e2c7953e5c04934", "plain", 2750460],
  ["work-khatibtabrizi-mishkatmasabih", "0741KhatibTabrizi.MishkatMasabih.Shamela0008360-ara1", "616cf07fa96115307407410511dbaa46fd043ef4", "plain", 2980108],
  ["work-ibnsalahshahrazuri-muqaddimatculumhadith", "0643IbnSalahShahrazuri.MuqaddimatCulumHadith.JK000537-ara1", "50caa7f0dd49fe834b88f73412961e42fcb612af", "completed", 543311],
  ["work-ibnsalahshahrazuri-muqaddimatculumhadith", "0643IbnSalahShahrazuri.MuqaddimatCulumHadith.Shamela0022870-ara1", "31a94e266545cab527a67965b0b43de6caa5d8db", "plain", 567854],
  ["work-ibnsalahshahrazuri-muqaddimatculumhadith", "0643IbnSalahShahrazuri.MuqaddimatCulumHadith.Shamela0023799-ara1", "aee2397fe72c9585ed9eaf6111a7c33a1c5f1a3a", "plain", 677507],
  ["work-ibnsalahshahrazuri-muqaddimatculumhadith", "0643IbnSalahShahrazuri.MuqaddimatCulumHadith.Shamela0029878BK1-ara1", "944f247adbb5e11a08c4244f6d112e86bb269853", "completed", 1397852],
  ["work-ibnsalahshahrazuri-muqaddimatculumhadith", "0643IbnSalahShahrazuri.MuqaddimatCulumHadith.Shia002184-ara1", "aeb0c9a6ad1c766deae1fa803f3a09d374cd3ffe", "plain", 548221],
  ["work-ibnaslamtusi-arbacun", "0242IbnAslamTusi.Arbacun.Shamela0010620-ara1", "113c79e90507830829453209456a4ca443083b4a", "plain", 28920],
  ["work-ibnishaq-sira", "0151IbnIshaq.Sira.JK001038-ara1", "6a56ab178fbe7b8ed4013c549ca72f9b53a62479", "plain", 416476],
  ["work-ibnishaq-sira", "0151IbnIshaq.Sira.Masaha002221-ara1", "2c34f000c04536375c5d21b591ecc3867a08fe42", "plain", 835264],
  ["work-ibnishaq-sira", "0151IbnIshaq.Sira.Shamela0009862-ara2", "5f011b9592310db6f65575467c07b9afd26d0406", "mARkdown", 659564],
  ["work-ibnishaq-sira", "0151IbnIshaq.Sira.Shia003660Vols-ara1", "de5fe6d4356ed2417218685a46979cc78aa29f82", "plain", 643883],
  ["work-ibnhazm-jawamicsira", "0456IbnHazm.JawamicSira.JK011036-ara1", "6553e14ab405359368010a402a22e67fec04c801", "plain", 597250],
  ["work-ibnhazm-jawamicsira", "0456IbnHazm.JawamicSira.Shamela0001036-ara1", "55c3de49fe7f53d74cc4444435c61a0a73bc6f2a", "plain", 598465],
  ["work-ibnhazm-jawamicsira", "0456IbnHazm.JawamicSira.Shamela0009728-ara1", "43b75df5983487869097c231df43fbbd7893af34", "completed", 413807],
  ["work-cizzdinibnjamaca-mukhtasarkabir", "0767CizzDinIbnJamaca.MukhtasarKabir.JK007037-ara1", "e32708cc3643d674409b94765fdd7c04c506fbf3", "plain", 209345],
  ["work-cizzdinibnjamaca-mukhtasarkabir", "0767CizzDinIbnJamaca.MukhtasarKabir.Masaha002867-ara1", "1c0df83a0922514b4279ceae32d825b40b251061", "plain", 563755],
  ["work-cizzdinibnjamaca-mukhtasarkabir", "0767CizzDinIbnJamaca.MukhtasarKabir.Shamela0006593-ara1", "f33c1fc5f61f570e0f7294c13910ccbe903137b0", "plain", 201714],
  ["work-ibnhibbanbusti-sira", "0354IbnHibbanBusti.Sira.Shamela0009898-ara1", "bc8b64e5b881e69acb0bf9c73d5574c28363c4c8", "plain", 962462],
  ["work-ibnyahyamuzani-mukhtasar", "0264IbnYahyaMuzani.Mukhtasar.JK001504-ara1", "ae33212d408e1523c72fc175d8e8f8d65b10ba80", "plain", 1594063],
  ["work-ibnyahyamuzani-mukhtasar", "0264IbnYahyaMuzani.Mukhtasar.Shamela0001661-ara1", "fbbfa2b3168c7c14fe391ad779175b1e4ad85833", "plain", 1665467],
  ["work-ibnyahyamuzani-mukhtasar", "0264IbnYahyaMuzani.Mukhtasar.Shia000828-ara1", "8b86b4f70cceaf9c6dad55b11aa0983ada75bc41", "plain", 1637971],
  ["work-ghazali-wasit", "0505Ghazali.Wasit.JK000309-ara1", "d1fba7aeef4d78f90be32d35976be9dccd33ac11", "plain", 3897721],
  ["work-ghazali-wasit", "0505Ghazali.Wasit.Shamela0006128-ara1", "15dbf69680c2da4398f77d91052d0b2f7f23f1c6", "plain", 3918154],
  ["work-nawawi-majmuc", "0676Nawawi.Majmuc.JK000913-ara1", "3844be34f8e2d8fd6ff14a0b662bf1612e34ae7a", "plain", 13395822],
  ["work-nawawi-majmuc", "0676Nawawi.Majmuc.Shamela0002186-ara1", "d21d29d23809c52572076b51f380850cc78fbae4", "plain", 27020543],
  ["work-nawawi-majmuc", "0676Nawawi.Majmuc.Shia000841Vols-ara1", "1b79fcf252a2520716fbda7500d32b3d12551adf", "plain", 27098140],
  ["work-nawawi-rawdattalibin", "0676Nawawi.RawdatTalibin.JK000192-ara1", "c971d92c3215c3a10da9fd17144b169c327a54c8", "plain", 10455957],
  ["work-nawawi-rawdattalibin", "0676Nawawi.RawdatTalibin.ShamAY0034251BK3-ara1", "4a528acb098b23f75219e629742869ffabcbf8b0", "plain", 10988981],
  ["work-nawawi-rawdattalibin", "0676Nawawi.RawdatTalibin.Shamela0000499-ara1", "6367ff216807d6e48b6e286cfbe5ff1355f87b1c", "plain", 10960478],
  ["work-nawawi-rawdattalibin", "0676Nawawi.RawdatTalibin.Shia000861VolsBK3-ara1", "3e300bdefefd717bc075a373554c746b0448e0c0", "plain", 10956689],
  ["work-burhandinfarghanimarghinani-bidaya", "0593BurhanDinFarghaniMarghinani.Bidaya.JK000278-ara1", "813fcaa051090c9f1d279889c256fff019e3eef0", "plain", 720499],
  ["work-burhandinfarghanimarghinani-bidaya", "0593BurhanDinFarghaniMarghinani.Bidaya.Shamela0006170-ara1", "a6e00d49c4cd2e6021b16e62ca18a8e072fa37b3", "plain", 722328],
  ["work-abuishaqshirazi-lumacfiusulfiqh", "0476AbuIshaqShirazi.LumacFiUsulFiqh.JK000427-ara1", "cb039182262810214fef499b04a5190ca058558e", "plain", 304609],
  ["work-abuishaqshirazi-lumacfiusulfiqh", "0476AbuIshaqShirazi.LumacFiUsulFiqh.Shamela0008536-ara1", "c8ed272ff3be177314f37c136c24b910798efc1a", "plain", 307208],
  ["work-abuishaqshirazi-lumacfiusulfiqh", "0476AbuIshaqShirazi.LumacFiUsulFiqh.Shia002913-ara1", "bb6b0ea12900ea8445ce789918298ad1ed4b159d", "plain", 308853],
  ["work-imamharamaynjuwayni-burhanfiusulfiqh", "0478ImamHaramaynJuwayni.BurhanFiUsulFiqh.JK000781-ara1", "04139d903d16c4dc266303efe250519db490b3de", "plain", 1535653],
  ["work-imamharamaynjuwayni-burhanfiusulfiqh", "0478ImamHaramaynJuwayni.BurhanFiUsulFiqh.ShamAY0034188-ara1", "7ce340c4fbe096112031edd2988a79a7aa8b46a5", "plain", 1539761],
  ["work-imamharamaynjuwayni-burhanfiusulfiqh", "0478ImamHaramaynJuwayni.BurhanFiUsulFiqh.Shamela0007439-ara1", "0533622499f9f6ab3c1b614bb0311ed50cdc109b", "plain", 1478691],
  ["work-ghazali-mustasfa", "0505Ghazali.Mustasfa.JK000276-ara1", "1a26ef8a81ec4ee0dec540aacc4ddbcae2243295", "plain", 1762220],
  ["work-ghazali-mustasfa", "0505Ghazali.Mustasfa.ShamAY0034180-ara1", "509c6fd941a5bf276bafc519b732ac5682ce39cd", "plain", 1797789],
  ["work-ghazali-mustasfa", "0505Ghazali.Mustasfa.Shamela0005459-ara1", "6c29223e63add89e4e25267986c0633e883ecfb9", "plain", 1807610],
  ["work-ghazali-mustasfa", "0505Ghazali.Mustasfa.Shia002916-ara1", "23193bce48043f9cf5098f8be9eae68424b373ad", "plain", 1793973],
  ["work-shaykhtusi-ciddatusul", "0460ShaykhTusi.CiddatUsul.Shia002748Vols-ara1", "512c0e970f7f5beeb1de86a05fc84dce2de8977d", "plain", 1253365],
  ["work-shaykhtusi-ciddatusul", "0460ShaykhTusi.CiddatUsul.Shia002750Vols-ara1", "9729a115dbef12bcb8299890906c96f00d437a67", "plain", 1715760],
  ["work-tahawi-matncaqida", "0321Tahawi.MatnCaqida.JK000126-ara1", "802014164422903f08566ca079fbe16c69355249", "plain", 23374],
  ["work-ibntaymiyya-caqidawasitiyya", "0728IbnTaymiyya.CaqidaWasitiyya.JK000359-ara1", "e8e87a898e637f72b5da9d71cdca968c219a7af6", "plain", 48960],
  ["work-ibntaymiyya-caqidawasitiyya", "0728IbnTaymiyya.CaqidaWasitiyya.Sham19Y0018098-ara1", "2aef86adceb47de32491e6018da6c88c59e63b7c", "plain", 90700],
  ["work-ibntaymiyya-caqidawasitiyya", "0728IbnTaymiyya.CaqidaWasitiyya.Shamela0022665-ara1", "febd09681171805896d1e4a7807985a046af5477", "plain", 69483],
  ["work-imamharamaynjuwayni-lamcadilla", "0478ImamHaramaynJuwayni.LamcAdilla.JK001133-ara1", "b598ec55a2b3270b58c07de2022bf07af312fda0", "plain", 38931],
  ["work-imamharamaynjuwayni-lamcadilla", "0478ImamHaramaynJuwayni.LamcAdilla.Shamela0006398-ara1", "0264eb6466fb8ac24b8cd8a017f4cda823a46fe3", "plain", 39035],
  ["work-imamharamaynjuwayni-lamcadilla", "0478ImamHaramaynJuwayni.LamcAdilla.Shia004493-ara1", "6fd5e3b8bbadf8bfd5ac7ae89ef1394cb1031d07", "plain", 39668],
  ["work-sibawayhi-kitabsibawayhi", "0180Sibawayhi.KitabSibawayhi.JK006989-ara1", "5252a722c3ec1ebb6839911ae492d9c3912f948c", "plain", 2639395],
  ["work-sibawayhi-kitabsibawayhi", "0180Sibawayhi.KitabSibawayhi.Shamela0023018-ara1", "acb4c12204ae661d26b2309f00986938afa796d8", "mARkdown", 2692552],
  ["work-qalqashandi-subhacsha", "0821Qalqashandi.SubhAcsha.JK000958-ara1", "2c41e989627abb12084e4a0ac16fdae24479138e", "plain", 14129746],
  ["work-qalqashandi-subhacsha", "0821Qalqashandi.SubhAcsha.Shamela0009429-ara1", "0e306732936a25efbe85a886393a58187a600f22", "mARkdown", 14615830],
  ["work-suyuti-cuqudjuman", "0911Suyuti.CuqudJuman.Shamela0097803-ara1", "1fa7e34fce82ba84c7783fd077715310baa87692", "plain", 111001],
  ["work-jahiz-bayanwatabyin", "0255Jahiz.BayanWaTabyin.JK001009-ara1", "873785f40f71107a2a93bcf296612c123fbc1f14", "plain", 1527598],
  ["work-jahiz-bayanwatabyin", "0255Jahiz.BayanWaTabyin.Masaha003365Vols-ara1", "add8f65de43923d504334c99e9dd3b4d2ab27c8d", "plain", 1828477],
  ["work-jahiz-bayanwatabyin", "0255Jahiz.BayanWaTabyin.ShamAY0033779-ara1", "b18759d48b6b6d6a5fac80a4387f46915f504770", "plain", 1531754],
  ["work-jahiz-bayanwatabyin", "0255Jahiz.BayanWaTabyin.ShamAY0033801-ara1", "601bdae6b7830cb4704eac63a690d21322c452b3", "plain", 1540252],
  ["work-jahiz-bayanwatabyin", "0255Jahiz.BayanWaTabyin.Shamela0010614-ara1", "3065c54b79062dfc6459c7912713efd4de61e450", "completed", 1620199],
  ["work-jahiz-bayanwatabyin", "0255Jahiz.BayanWaTabyin.Zaydiyya0000478-ara1", "afe9b657c569ffb2103a2b1906aeefffabdbe876", "plain", 1541800],
  ["work-ghazali-ihyaculumdin", "0505Ghazali.IhyaCulumDin.JK000001-ara1", "eb5a979a12570ce5f554a61d48d8f508288ce8c5", "plain", 9470821],
  ["work-ghazali-ihyaculumdin", "0505Ghazali.IhyaCulumDin.Shamela0009472-ara1", "e1798f789384b5e987cac279ce95de474005607d", "completed", 7968487],
];

function workDirectory(workId: string) {
  const work = workRegistry.find((item) => item.workId === workId);
  if (!work?.openitiWorkUri) throw new Error(`Missing OpenITI work URI for ${workId}`);
  const author = work.openitiWorkUri.split(".")[0];
  return `data/${author}/${work.openitiWorkUri}`;
}

export const digitalVersionRegistry: DigitalVersionRecord[] = versionRows.map(
  ([workId, openitiUri, artifactGitSha, suffix, artifactBytes]) => {
    const directory = workDirectory(workId);
    const artifactName = suffix === "mARkdown" ? `${openitiUri}.mARkdown` : suffix === "completed" ? `${openitiUri}.completed` : openitiUri;
    const artifactPath = `${directory}/${artifactName}`;
    return {
      versionId: `version-${openitiUri}`,
      workId,
      openitiUri,
      provider: "OpenITI",
      releaseCommit: OPENITI_RELEASE_COMMIT,
      artifactPath,
      artifactGitSha,
      artifactBytes,
      sourceUrl: `https://github.com/OpenITI/RELEASE/blob/${OPENITI_RELEASE_COMMIT}/${artifactPath}`,
      versionMetadataUrl: `https://github.com/OpenITI/RELEASE/blob/${OPENITI_RELEASE_COMMIT}/${directory}/${openitiUri}.yml`,
      editionStatement: "نسخة رقمية في OpenITI؛ بيانات الطبعة/المحقق غير مثبتة في سجل المنصة بعد.",
      editor: null,
      translator: null,
      contentAvailability: "full_text_cleared",
      rightsState: "cleared_public_domain_openiti_historical_text",
      checkedAt: KNOWLEDGE_CHECKED_AT,
    };
  },
);

export const providerPolicyRegistry: ProviderPolicyRecord[] = [
  { providerId: "provider-openiti", provider: "OpenITI", domain: "books", canonicalUrl: "https://openiti.org/", rightsUrl: "https://openiti.org/docs/Copyright_Questions.html", rightsState: "cleared_with_attribution", contentAvailability: "full_text_cleared", credentialsRequired: false, productionUse: "Pinned historical OpenITI texts dated 1900 or earlier may be rendered in-app under OpenITI's published public-domain policy; scholarly review and edition claims remain separate.", attribution: "OpenITI RELEASE · pinned commit", checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-quranenc", provider: "QuranEnc.com", domain: "quran", canonicalUrl: "https://quranenc.com/en/home/api", rightsUrl: "https://quranenc.com/en/home/api", rightsState: "cleared_with_attribution", contentAvailability: "full_text_cleared", credentialsRequired: false, productionUse: "Internal display and cached API consumption of translation contents are allowed under QuranEnc's published republication terms when text is unmodified, source/publisher/version are shown, and the edition is kept current.", attribution: "Translation source: QuranEnc.com", checkedAt: "2026-09-25T12:00:00+04:00" },
  { providerId: "provider-quran-foundation", provider: "Quran Foundation", domain: "quran", canonicalUrl: "https://api-docs.quran.com/", rightsUrl: "https://quran.com/terms-and-conditions", rightsState: "needs_credential", contentAvailability: "catalog_only", credentialsRequired: true, productionUse: "Not connected; API availability is not redistribution permission.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-sunnah", provider: "Sunnah.com", domain: "hadith", canonicalUrl: "https://sunnah.com/developers", rightsUrl: null, rightsState: "needs_credential", contentAvailability: "catalog_only", credentialsRequired: true, productionUse: "No scraping. API adapter remains closed until credentials and reuse terms are established.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-dorar", provider: "Dorar", domain: "hadith", canonicalUrl: "https://dorar.net/hadith", rightsUrl: null, rightsState: "external_link_only", contentAvailability: "external_link_only", credentialsRequired: false, productionUse: "Editorial/reference lookup only; no corpus ingestion contract established.", attribution: "Dorar reference link", checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-osm", provider: "OpenStreetMap", domain: "maps", canonicalUrl: "https://www.openstreetmap.org/copyright", rightsUrl: "https://operations.osmfoundation.org/policies/tiles/", rightsState: "cleared_with_attribution", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "ODbL data may support modern geographic context with attribution/share-alike compliance; no dataset is bundled, and public tile servers are not a production basemap entitlement.", attribution: "© OpenStreetMap contributors if data is acquired and used", checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-natural-earth", provider: "Natural Earth", domain: "maps", canonicalUrl: "https://www.naturalearthdata.com/downloads/", rightsUrl: "https://www.naturalearthdata.com/about/terms-of-use/", rightsState: "cleared_with_attribution", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "Candidate physical context; no dataset bundled in this release.", attribution: "Made with Natural Earth if acquired and used", checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-geonames", provider: "GeoNames", domain: "maps", canonicalUrl: "https://download.geonames.org/export/dump/", rightsUrl: "https://www.geonames.org/export/", rightsState: "cleared_with_attribution", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "CC BY modern place-name data may be acquired with attribution; none is bundled, and it is not evidence of historical military positions.", attribution: "GeoNames if acquired and used", checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-nasadem", provider: "NASA Earthdata / NASADEM", domain: "maps", canonicalUrl: "https://www.earthdata.nasa.gov/data/catalog/lpcloud-nasadem-hgt-001", rightsUrl: null, rightsState: "needs_license_review", contentAvailability: "catalog_only", credentialsRequired: true, productionUse: "Candidate terrain relief; not acquired or bundled.", attribution: "NASA Earthdata if acquired and used", checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-quranic-audio", provider: "QuranicAudio", domain: "audio", canonicalUrl: "https://quranicaudio.com/", rightsUrl: null, rightsState: "external_link_only", contentAvailability: "external_link_only", credentialsRequired: false, productionUse: "External discovery link only pending recording-level permission.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-everyayah", provider: "EveryAyah", domain: "audio", canonicalUrl: "https://everyayah.com/data/", rightsUrl: null, rightsState: "needs_license_review", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "No recordings bundled; license review required per recitation/resource.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-mp3quran", provider: "MP3Quran.net", domain: "audio", canonicalUrl: "https://www.mp3quran.net/ar/api/2", rightsUrl: "https://www.mp3quran.net/ar/privacy", rightsState: "cleared_with_attribution", contentAvailability: "streaming_cleared", credentialsRequired: false, productionUse: "Direct in-platform streaming from MP3Quran provider servers is permitted by the provider's published policy allowing visitors and developers to copy site material or use site links. Audio remains hosted by MP3Quran; YaRasoolAllah does not re-host or fabricate recordings.", attribution: "Audio stream: MP3Quran.net", checkedAt: "2026-09-25T11:35:00+04:00" },
  { providerId: "provider-aladhan", provider: "AlAdhan", domain: "daily", canonicalUrl: "https://aladhan.com/prayer-times-api", rightsUrl: "https://aladhan.com/calculation-methods", rightsState: "api_only", contentAvailability: "external_link_only", credentialsRequired: false, productionUse: "Live prayer-time calculation with visible method attribution; no claim of universal single-method correctness.", attribution: "Prayer calculations: AlAdhan API", checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-qdl", provider: "Qatar Digital Library", domain: "media", canonicalUrl: "https://www.qdl.qa/", rightsUrl: null, rightsState: "item_by_item_review", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "Candidate institution only; zero production assets registered.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-gallica", provider: "BnF Gallica", domain: "media", canonicalUrl: "https://gallica.bnf.fr/", rightsUrl: null, rightsState: "item_by_item_review", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "Candidate institution only; zero production assets registered.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-loc", provider: "Library of Congress", domain: "media", canonicalUrl: "https://www.loc.gov/", rightsUrl: "https://www.loc.gov/legal/", rightsState: "item_by_item_review", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "Candidate institution only; zero production assets registered.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-ia", provider: "Internet Archive", domain: "media", canonicalUrl: "https://archive.org/", rightsUrl: null, rightsState: "item_by_item_review", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "No random PDFs or media are treated as cleared; item-level evidence is mandatory.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-commons", provider: "Wikimedia Commons", domain: "media", canonicalUrl: "https://commons.wikimedia.org/", rightsUrl: "https://commons.wikimedia.org/wiki/Commons:Licensing", rightsState: "item_by_item_review", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "Candidate institution only; zero production assets registered.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-british-library", provider: "British Library", domain: "media", canonicalUrl: "https://www.bl.uk/", rightsUrl: null, rightsState: "item_by_item_review", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "Candidate institution only; zero production assets registered.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
  { providerId: "provider-nypl", provider: "NYPL Digital Collections", domain: "media", canonicalUrl: "https://digitalcollections.nypl.org/", rightsUrl: null, rightsState: "item_by_item_review", contentAvailability: "catalog_only", credentialsRequired: false, productionUse: "Candidate institution only; zero production assets registered.", attribution: null, checkedAt: KNOWLEDGE_CHECKED_AT },
];

export interface ProviderAvailabilityMetrics {
  totalProviders: number;
  fullTextCleared: number;
  streamingCleared: number;
  catalogOnly: number;
  externalLinkOnly: number;
  apiOnly: number;
  credentialsRequired: number;
  rightsReviewPending: number;
}

/**
 * Availability buckets are mutually exclusive: every provider policy is
 * counted once according to its actual content state. Credential and
 * rights-review counts are deliberately independent overlays because a
 * provider can appear in an availability bucket while still needing review.
 */
export function getProviderAvailabilityMetrics(
  providers: readonly ProviderPolicyRecord[] = providerPolicyRegistry,
): ProviderAvailabilityMetrics {
  const metrics: ProviderAvailabilityMetrics = {
    totalProviders: providers.length,
    fullTextCleared: 0,
    streamingCleared: 0,
    catalogOnly: 0,
    externalLinkOnly: 0,
    apiOnly: 0,
    credentialsRequired: 0,
    rightsReviewPending: 0,
  };

  for (const provider of providers) {
    if (provider.rightsState === "api_only") {
      metrics.apiOnly += 1;
    } else {
      switch (provider.contentAvailability) {
        case "full_text_cleared":
          metrics.fullTextCleared += 1;
          break;
        case "streaming_cleared":
          metrics.streamingCleared += 1;
          break;
        case "catalog_only":
          metrics.catalogOnly += 1;
          break;
        case "external_link_only":
          metrics.externalLinkOnly += 1;
          break;
      }
    }

    if (provider.credentialsRequired) metrics.credentialsRequired += 1;
    if (
      provider.rightsState === "needs_license_review" ||
      provider.rightsState === "item_by_item_review"
    ) {
      metrics.rightsReviewPending += 1;
    }
  }

  return metrics;
}

export const childrenAdaptationRegistry: ChildrenAdaptationRecord[] = [
  { adaptationId: "adaptation-mercy-at-home", titleAr: "الرحمة تبدأ من البيت", summaryAr: "موقف قصير يساعد الطفل على تحويل معنى الرحمة إلى فعل يومي مع الأسرة والحيوان والضعيف.", ageBand: "6-8", sourceIds: ["work-bukhari-adab", "work-nawawi-riyad"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-truthful-promise", titleAr: "وعدٌ لا ننساه", summaryAr: "قصة أصلية عن الصدق وحفظ الوعد، مع فصل واضح بين القصة التعليمية والنص المنقول.", ageBand: "6-8", sourceIds: ["work-bukhari-adab"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-hijrah-planning", titleAr: "الهجرة: ثقةٌ وتخطيط", summaryAr: "نشاط يوازن بين التوكل والأخذ بالأسباب دون ادعاء تمثيل بصري للأحداث المقدسة.", ageBand: "9-12", sourceIds: ["work-ibn-hisham-sira", "work-ibn-kathir-fusul-sira"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-source-detective", titleAr: "محقق المصدر الصغير", summaryAr: "تمرين يعلّم الفرق بين العمل والنسخة والمصدر والرابط، ولماذا لا يعني وجود ملف أنه صالح للنشر.", ageBand: "9-12", sourceIds: ["src-openiti-release-pinned"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-report-confidence", titleAr: "كيف نقرأ رواية تاريخية؟", summaryAr: "مدخل للمراهقين إلى الثقة والخلاف والسياق، مع مثال على نسبة الأخبار وعدم تحويل الرواية إلى يقين.", ageBand: "13-15", sourceIds: ["work-waqidi-maghazi", "work-tabari-tarikh"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-prayer-for-child", titleAr: "الصلاة خطوة بخطوة", summaryAr: "تكييف تعليمي أصلي يقدم للطفل خطوات الصلاة وأوقات phépها بطريقة مبسطة، مع التأكيد على مراجعة ولي الأمر لكل خطوة.", ageBand: "6-8", sourceIds: ["work-bukhari-adab"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-wudu-for-child", titleAr: "الوضوء قبل الصلاة", summaryAr: "تكييف تعليمي أصلي يشرح الوضوء كطهارة قبل الصلاة، بحركات مرئية توضيحية لا تمثل أي شخصية دينية.", ageBand: "6-8", sourceIds: ["work-bukhari-adab"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-prophet-nuh-child", titleAr: "نوح والسفينة", summaryAr: "حكي أصلي عن نوح عليه السلام وبنائه السفينة، مع التركيز على العبرة والعظة بعيدًا عن أي تمثيل بصري لأي نبي.", ageBand: "9-12", sourceIds: ["work-ibn-kathir-bidaya"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-prophet-yunus-child", titleAr: "يونس والحوت", summaryAr: "حكي أصلي عن يونس عليه السلام في بطن الحوت، مع التأكيد على التوبة والاستغفار بعيدًا عن أي تمثيل بصري.", ageBand: "9-12", sourceIds: ["work-ibn-kathir-bidaya"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-honesty-tale", titleAr: "الصدق ينجي", summaryAr: "حكاية إسلامية أصلية عن أجر الصدق وعاقبة الكذب، مصممة للأطفال مع مثال حياتي قريب من الواقع.", ageBand: "9-12", sourceIds: ["work-bukhari-adab", "work-nawawi-riyad"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-hospitality-tale", titleAr: "إكرام الضيف", summaryAr: "تكييف أصلي عن آداب الضيافة وإكرام الزائر في الإسلام، موجه للمراهقين مع نصوص إرشادية غير منسوبة.", ageBand: "13-15", sourceIds: ["work-bukhari-adab"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
];

export const mediaAssetRegistry: never[] = [];

/**
 * Verified external file/reader resources (V3 acquisition).
 *
 * Separate from digitalVersionRegistry ON PURPOSE: those rows are pinned
 * OpenITI historical texts with cleared in-app reading rights. The rows below
 * are item-level verified files/pages on other providers whose scan/edition
 * rights remain unclear. They must surface as source evidence with an item
 * link — never as in-app reading, downloads, or approval.
 */
export type ExternalResourceProvider = "InternetArchive" | "Perseus" | "OPenn";

export type ExternalResourceFormat = "PDF" | "EPUB" | "TXT" | "TEI" | "SCAN" | "ITEM_PAGE";

export type ExternalResourceRights = "RIGHTS_UNCLEAR" | "UNKNOWN" | "OPEN_LICENSE";

export interface ExternalResourceRecord {
  resourceId: string;
  workId: string;
  provider: ExternalResourceProvider;
  format: ExternalResourceFormat;
  itemUrl: string;
  fileUrl: string | null;
  fileSize: number | null;
  editionStatement: string;
  rightsState: ExternalResourceRights;
  rightsNote: string;
  attribution: string;
  checkedAt: string;
}

export const externalResourceRegistry: ExternalResourceRecord[] = [
  {
    resourceId: "ext-ia-sirat-hisham-01-pdf",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "PDF",
    itemUrl: "https://archive.org/details/Sirat_Ibn_Hisham",
    fileUrl: "https://archive.org/download/Sirat_Ibn_Hisham/01_94563.pdf",
    fileSize: 7214144,
    editionStatement: "Scan set edition not established; do not present as a named print edition.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Author death does not clear modern scan/OCR rights.",
    attribution: "Internet Archive item Sirat_Ibn_Hisham (Yedali upload)",
    checkedAt: "2026-09-25T01:38:46.563Z",
  },
  {
    resourceId: "ext-ia-sirat-hisham-01-epub",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "EPUB",
    itemUrl: "https://archive.org/details/Sirat_Ibn_Hisham",
    fileUrl: "https://archive.org/download/Sirat_Ibn_Hisham/01_94563.epub",
    fileSize: 627216,
    editionStatement: "OCR-derived EPUB; text not reviewed.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Author death does not clear modern scan/OCR rights.",
    attribution: "Internet Archive item Sirat_Ibn_Hisham (Yedali upload)",
    checkedAt: "2026-09-25T01:38:49.263Z",
  },
  {
    resourceId: "ext-ia-sirat-hisham-01-txt",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "TXT",
    itemUrl: "https://archive.org/details/Sirat_Ibn_Hisham",
    fileUrl: "https://archive.org/download/Sirat_Ibn_Hisham/01_94563_djvu.txt",
    fileSize: 1076852,
    editionStatement: "Uncorrected OCR text; OCR_NEEDS_REVIEW.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Author death does not clear modern scan/OCR rights.",
    attribution: "Internet Archive item Sirat_Ibn_Hisham (Yedali upload)",
    checkedAt: "2026-09-25T01:38:51.297Z",
  },
  {
    resourceId: "ext-ia-asseirah-01-pdf",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "PDF",
    itemUrl: "https://archive.org/details/asseirah",
    fileUrl: "https://archive.org/download/asseirah/Asseirah_01.pdf",
    fileSize: 187189807,
    editionStatement: "Matba'at Hijazi, Cairo 1356/1937; ed. Muhammad Muhyi al-Din 'Abd al-Hamid. Vol 1 of 4-volume set.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "1937 print edition metadata verified from item description; scan/OCR rights not established.",
    attribution: "Internet Archive item asseirah",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-ia-asseirah-01-epub",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "EPUB",
    itemUrl: "https://archive.org/details/asseirah",
    fileUrl: "https://archive.org/download/asseirah/Asseirah_01.epub",
    fileSize: 515728,
    editionStatement: "OCR-derived EPUB of the 1937 set; text not reviewed.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Scan/OCR rights not established.",
    attribution: "Internet Archive item asseirah",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-ia-asseirah-01-txt",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "TXT",
    itemUrl: "https://archive.org/details/asseirah",
    fileUrl: "https://archive.org/download/asseirah/Asseirah_01_djvu.txt",
    fileSize: 689994,
    editionStatement: "Uncorrected OCR text; OCR_NEEDS_REVIEW.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Scan/OCR rights not established.",
    attribution: "Internet Archive item asseirah",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-ia-sert-ibnkatheer-pdf",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "PDF",
    itemUrl: "https://archive.org/details/sert-ibn-hesham-ibnkatheer-hq",
    fileUrl: "https://archive.org/download/sert-ibn-hesham-ibnkatheer-hq/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1%D8%A9%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A%D8%A9%20%D9%84%D8%A7%D8%A8%D9%86%20%D9%87%D8%B4%D8%A7%D9%85%20-%D8%B75%20%D8%AF%D8%A7%D8%B1%20%D8%A7%D8%A8%D9%86%20%D9%83%D8%AB%D9%8A%D8%B1%20(%D9%86%D8%B3%D8%AE%D8%A9%20%D9%85%D9%84%D9%88%D9%86%D8%A9).pdf",
    fileSize: 370268995,
    editionStatement: "Dar Ibn Kathir, 5th colorful edition; publication year not established.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Modern edition and scan rights not established in any form.",
    attribution: "Internet Archive item sert-ibn-hesham-ibnkatheer-hq",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-ia-sert-ibnkatheer-epub",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "EPUB",
    itemUrl: "https://archive.org/details/sert-ibn-hesham-ibnkatheer-hq",
    fileUrl: "https://archive.org/download/sert-ibn-hesham-ibnkatheer-hq/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1%D8%A9%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A%D8%A9%20%D9%84%D8%A7%D8%A8%D9%86%20%D9%87%D8%B4%D8%A7%D9%85%20-%D8%B75%20%D8%AF%D8%A7%D8%B1%20%D8%A7%D8%A8%D9%86%20%D9%83%D8%AB%D9%8A%D8%B1%20(%D9%86%D8%B3%D8%AE%D8%A9%20%D9%85%D9%84%D9%88%D9%86%D8%A9).epub",
    fileSize: 2357121,
    editionStatement: "OCR-derived EPUB; text not reviewed.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Modern edition and scan rights not established in any form.",
    attribution: "Internet Archive item sert-ibn-hesham-ibnkatheer-hq",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-ia-sert-ibnkatheer-txt",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "TXT",
    itemUrl: "https://archive.org/details/sert-ibn-hesham-ibnkatheer-hq",
    fileUrl: "https://archive.org/download/sert-ibn-hesham-ibnkatheer-hq/%D8%A7%D9%84%D8%B3%D9%8A%D8%B1%D8%A9%20%D8%A7%D9%84%D9%86%D8%A8%D9%88%D9%8A%D8%A9%20%D9%84%D8%A7%D8%A8%D9%86%20%D9%87%D8%B4%D8%A7%D9%85%20-%D8%B75%20%D8%AF%D8%A7%D8%B1%20%D8%A7%D8%A8%D9%86%20%D9%83%D8%AB%D9%8A%D8%B1%20(%D9%86%D8%B3%D8%AE%D8%A9%20%D9%85%D9%84%D9%88%D9%86%D8%A9)_djvu.txt",
    fileSize: 3880939,
    editionStatement: "Uncorrected OCR text; OCR_NEEDS_REVIEW.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Modern edition and scan rights not established in any form.",
    attribution: "Internet Archive item sert-ibn-hesham-ibnkatheer-hq",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-ia-vols34-pdf",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "PDF",
    itemUrl: "https://archive.org/details/IbnHishamSiratVols3And4Arabic",
    fileUrl: "https://archive.org/download/IbnHishamSiratVols3And4Arabic/Ibn%20Hisham%20Sirat%20vols%203%20and%204%20Arabic.pdf",
    fileSize: 5608192,
    editionStatement: "2016 user-upload scan set (vols 1-6); underlying print edition not established.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Print, scan, and OCR rights not established.",
    attribution: "Internet Archive item IbnHishamSiratVols3And4Arabic",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-ia-vols34-epub",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "EPUB",
    itemUrl: "https://archive.org/details/IbnHishamSiratVols3And4Arabic",
    fileUrl: "https://archive.org/download/IbnHishamSiratVols3And4Arabic/Ibn%20Hisham%20Sirat%20vols%203%20and%204%20Arabic.epub",
    fileSize: 734857,
    editionStatement: "OCR-derived EPUB; text not reviewed.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Print, scan, and OCR rights not established.",
    attribution: "Internet Archive item IbnHishamSiratVols3And4Arabic",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-ia-vols34-txt",
    workId: "work-ibn-hisham-sira",
    provider: "InternetArchive",
    format: "TXT",
    itemUrl: "https://archive.org/details/IbnHishamSiratVols3And4Arabic",
    fileUrl: "https://archive.org/download/IbnHishamSiratVols3And4Arabic/Ibn%20Hisham%20Sirat%20vols%203%20and%204%20Arabic_djvu.txt",
    fileSize: 1200952,
    editionStatement: "Uncorrected OCR text; OCR_NEEDS_REVIEW.",
    rightsState: "RIGHTS_UNCLEAR",
    rightsNote: "Print, scan, and OCR rights not established.",
    attribution: "Internet Archive item IbnHishamSiratVols3And4Arabic",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
  {
    resourceId: "ext-perseus-ibn-hisham-shamela-ara2",
    workId: "work-ibn-hisham-sira",
    provider: "Perseus",
    format: "ITEM_PAGE",
    itemUrl: "https://catalog.perseus.org/catalog/urn:cts:arabicLit:0213IbnHisham.SiraNabawiyya.Shamela-ara2",
    fileUrl: null,
    fileSize: null,
    editionStatement: "Mustafa al-Babi al-Halabi 2nd ed., 1375/1955; eds. al-Saqqa, al-Abyari, al-Shalabi. Catalog page only; raw text not acquired.",
    rightsState: "UNKNOWN",
    rightsNote: "Edition metadata verified; text bytes and rights not established.",
    attribution: "Perseus Catalog; OpenITI book URI 0213IbnHisham.SiraNabawiyya",
    checkedAt: "2026-09-25T05:10:00.000Z",
  },
];

export function getExternalResourcesForWork(workId: string): ExternalResourceRecord[] {
  return externalResourceRegistry.filter((resource) => resource.workId === workId);
}

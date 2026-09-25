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
    attributionCaveat: "لا يُعرض النص الكامل حتى تُراجع النسخة والحقوق على مستوى المورد.",
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
    attributionCaveat: "بيانات الفهرسة لا تمنح حق إعادة نشر النص.",
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
    attributionCaveat: "فهرسة فقط إلى أن تُراجع النسخة الرقمية وحقوقها.",
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
    attributionCaveat: "لا تُعرض قراءة داخلية قبل تحقق النسخة والحقوق.",
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
    attributionCaveat: "النسخة الرقمية لا تُعتمد نصياً قبل المراجعة المنفصلة.",
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
];

type VersionRow = readonly [string, string, string | null, string];

const versionRows: VersionRow[] = [
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.JK000797-ara1", "8ef262e181ea86a66fbf199a042bda8ded6e6146", "plain"],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.Masaha003361Vols-ara1", "7c86be5ad1be445cf69076785a8662eaad416a31", "plain"],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.ShamAY0034440-ara1", "23e193ad107593a6ac6217027bde7d831ff425d4", "plain"],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.Shamela0007450-ara1", "b6f801433e9dca1ffd460472a60bf7960e6b4e92", "plain"],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.Shamela0023833-ara1", "dd56bd3ac0fcf69f74bdce8034fb60865698c85d", "completed"],
  ["work-ibn-hisham-sira", "0213IbnHisham.SiraNabawiyya.Shia003667Vols-ara1", "7dd974a2d885371ba802d01c11feb33505cb8fa6", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.JK000530-ara2", "f5fb6fc1313582f4d098f9da23a28a73519286f2", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.JK000744-ara5", "7ff53945ae1f6d5bfb9f2b7e288a018cb25ba49f", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.ShamAY0034595-ara1", "39dc0f2ded511b5599a47ff85a898fe07f3445c8", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.ShamAY0035884-ara1", "6a6a193e01e933b42217565323f491e606e3e7b6", "mARkdown"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0001686-ara1", "d33aaa10fa2bb18e3b24d6eff805218b33843351", "mARkdown"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0001689-ara4", "56e0dce0be9b78c6f6e720c03f14105683d9717d", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0007666-ara5", "2b5fd1f28bd7b281c832dc644d328c74fdc01c99", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0009351-ara2", "40bb8cf8f6a388dce3a81b2a9a4f48a3f994271a", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0009352-ara5", "4d926a5cec6f442790c2fb3b4c402b6a978c0981", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shamela0012416-ara3", "edfd5d42734f2a3f6d832948544959d0d7999167", "plain"],
  ["work-ibn-sad-tabaqat", "0230IbnSacd.TabaqatKubra.Shia003044Vols-ara2", "4289c8ad52c01e4914259ceaf9b09e15f6fa7309", "plain"],
  ["work-waqidi-maghazi", "0207Waqidi.Maghazi.JK009232-ara1", "fcbb509b7a43622b718446d94379d7f23e469b40", "plain"],
  ["work-waqidi-maghazi", "0207Waqidi.Maghazi.Masaha003023Vols-ara1", "f7db519e93c955a480de27cd629f14b2eb67f2be", "plain"],
  ["work-waqidi-maghazi", "0207Waqidi.Maghazi.Shamela0023680-ara1", "f1407d3a3213d5c0d09f5d02e8c9b3b577a2ef38", "mARkdown"],
  ["work-tabari-tarikh", "0310Tabari.Tarikh.JK000157-ara2", null, "plain"],
  ["work-bayhaqi-dalail", "0458Bayhaqi.DalailNubuwwa.JK006838-ara1", null, "plain"],
  ["work-ibn-kathir-bidaya", "0774IbnKathir.Bidaya.JK000158-ara3", null, "plain"],
  ["work-ibn-kathir-fusul-sira", "0774IbnKathir.FusulMinSira.JK000796-ara1", null, "plain"],
  ["work-tabari-tafsir", "0310Tabari.JamicBayan.JK000164-ara1", null, "plain"],
  ["work-qurtubi-tafsir", "0671AbuCabdAllahQurtubi.JamicLiAhkamQuran.JK000160-ara1", null, "plain"],
  ["work-baghawi-tafsir", "0510IbnMascudBaghawi.Tafsir.JK000464-ara1", null, "plain"],
  ["work-ibn-kathir-tafsir", "0774IbnKathir.TafsirQuran.JK000161-ara2", null, "plain"],
  ["work-bukhari-sahih", "0256Bukhari.Sahih.JK000110-ara1", null, "plain"],
  ["work-muslim-sahih", "0261Muslim.Sahih.JK000109-ara1", null, "plain"],
  ["work-bukhari-adab", "0256Bukhari.AdabMufrad.JK000011-ara1", null, "plain"],
  ["work-tirmidhi-shamail", "0279Tirmidhi.ShamailMuhammadiyya.JK000139-ara1", null, "plain"],
  ["work-nawawi-riyad", "0676Nawawi.RiyadSalihin.JK000073-ara2", null, "plain"],
];

function workDirectory(workId: string) {
  const work = workRegistry.find((item) => item.workId === workId);
  if (!work?.openitiWorkUri) throw new Error(`Missing OpenITI work URI for ${workId}`);
  const author = work.openitiWorkUri.split(".")[0];
  return `data/${author}/${work.openitiWorkUri}`;
}

export const digitalVersionRegistry: DigitalVersionRecord[] = versionRows.map(
  ([workId, openitiUri, artifactGitSha, suffix]) => {
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

export const childrenAdaptationRegistry: ChildrenAdaptationRecord[] = [
  { adaptationId: "adaptation-mercy-at-home", titleAr: "الرحمة تبدأ من البيت", summaryAr: "موقف قصير يساعد الطفل على تحويل معنى الرحمة إلى فعل يومي مع الأسرة والحيوان والضعيف.", ageBand: "6-8", sourceIds: ["work-bukhari-adab", "work-nawawi-riyad"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-truthful-promise", titleAr: "وعدٌ لا ننساه", summaryAr: "قصة أصلية عن الصدق وحفظ الوعد، مع فصل واضح بين القصة التعليمية والنص المنقول.", ageBand: "6-8", sourceIds: ["work-bukhari-adab"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-hijrah-planning", titleAr: "الهجرة: ثقةٌ وتخطيط", summaryAr: "نشاط يوازن بين التوكل والأخذ بالأسباب دون ادعاء تمثيل بصري للأحداث المقدسة.", ageBand: "9-12", sourceIds: ["work-ibn-hisham-sira", "work-ibn-kathir-fusul-sira"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-source-detective", titleAr: "محقق المصدر الصغير", summaryAr: "تمرين يعلّم الفرق بين العمل والنسخة والمصدر والرابط، ولماذا لا يعني وجود ملف أنه صالح للنشر.", ageBand: "9-12", sourceIds: ["src-openiti-release-pinned"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
  { adaptationId: "adaptation-report-confidence", titleAr: "كيف نقرأ رواية تاريخية؟", summaryAr: "مدخل للمراهقين إلى الثقة والخلاف والسياق، مع مثال على نسبة الأخبار وعدم تحويل الرواية إلى يقين.", ageBand: "13-15", sourceIds: ["work-waqidi-maghazi", "work-tabari-tarikh"], adaptationLabel: "platform_original_not_a_direct_quote", editorialStatus: "editorial_review_pending", reviewStatus: "scholarly_review_pending", depictionPolicy: "no_prophetic_depiction" },
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

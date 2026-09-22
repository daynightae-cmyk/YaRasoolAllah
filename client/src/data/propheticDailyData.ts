export interface DailyStation {
  id: string;
  timeframeAr: string;
  timeframeEn: string;
  period: "fajr" | "morning" | "noon" | "afternoon" | "maghrib" | "night";
  titleAr: string;
  titleEn: string;
  hadithTextAr: string;
  hadithTextEn: string;
  sourceReference: string;
  ethicalPrincipleAr: string;
  modernApplicationAr: string;
  reflectivePromptAr: string;
}

export const PROPHETIC_DAY_STATIONS: DailyStation[] = [
  {
    id: "station-fajr",
    timeframeAr: "الفجر وانبلاج الصبح",
    timeframeEn: "Dawn & Morning Awakening",
    period: "fajr",
    titleAr: "استفتاح اليوم بالحمد والذكر والبكور",
    titleEn: "Opening the Day with Gratitude and Remembrance",
    hadithTextAr: "«اللهم بارك لأمتي في بكورها» وكان إذا صلى الفجر استقبل أصحابه بوجهه الشريف وسأل عن حالهم، ثم يذكر الله حتى تطلع الشمس.",
    hadithTextEn: "O Allah, bless my nation in their early mornings. After praying Fajr, he would face his companions, inquire after them, and remember Allah until sunrise.",
    sourceReference: "سنن أبي داود (2606) وصحيح مسلم",
    ethicalPrincipleAr: "قيمة البكور، وربط البدايات بالحمد والوعي والاستبشار الروحي.",
    modernApplicationAr: "استثمار الساعات الأولى من اليوم قبل صخب الإشعارات والعمل في السكينة، والقراءة، والتخطيط الواعي ليومك.",
    reflectivePromptAr: "كيف تستفتح أول نصف ساعة من يومك؟ هل تبدأ بالامتنان والسكينة أم بالاستغراق في التوتر الرقمي؟",
  },
  {
    id: "station-family",
    timeframeAr: "ضحى اليوم — في بيته",
    timeframeEn: "Mid-Morning — In the Household",
    period: "morning",
    titleAr: "خِدمة الأهل والبشاشة في البيت",
    titleEn: "Serving Family with Cheerful Gentleness",
    hadithTextAr: "سُئلت السيدة عائشة رضي الله عنها: ما كان النبي ﷺ يصنع في بيته؟ قالت: «كان يكون في مِهْنةِ أهله، فإذا حضرت الصلاة خرج إلى الصلاة».",
    hadithTextEn: "Aisha was asked: What did the Prophet ﷺ do at home? She said: He was in the service of his family, and when the prayer was called, he went out to pray.",
    sourceReference: "صحيح البخاري (676)",
    ethicalPrincipleAr: "التواضع التام ونزع التسلط الذكوري، والمشاركة الحقيقية في الأعباء المنزلية.",
    modernApplicationAr: "مساعدة الشريك في واجبات المنزل دون انتظار طلب، وإدخال السرور على أفراد الأسرة بالكلمة الطيبة والابتسامة.",
    reflectivePromptAr: "هل يجد أهلك منك عوناً حقيقياً في أعباء اليوم، أم يرون فيك متطلباً يثقل كواهلهم؟",
  },
  {
    id: "station-market",
    timeframeAr: "الظهيرة — السوق والمجتمع",
    timeframeEn: "Noon — In the Marketplace & Civic Life",
    period: "noon",
    titleAr: "أمانة المعاملات والشفافية ونصرة الضعيف",
    titleEn: "Marketplace Integrity, Transparency, and Protecting the Vulnerable",
    hadithTextAr: "مر النبي ﷺ على صُبْرَةِ طعام، فأدخل يده فيها، فنالت أصابعه بللاً، فقال: «ما هذا يا صاحب الطعام؟» قال: أصابته السماء يا رسول الله، قال: «أفلا جعلته فوق الطعام كي يراه الناس؟ من غش فليس مني».",
    hadithTextEn: "He passed by a pile of food, placed his hand into it and found dampness underneath. He said: Why is this? The seller said: Rain fell on it. He said: Why didn't you put it on top so people could see? Whoever cheats is not of us.",
    sourceReference: "صحيح مسلم (102)",
    ethicalPrincipleAr: "الوضوح التام في المعاملات المالية، والنزاهة المؤسسية، ومحاربة التدليس.",
    modernApplicationAr: "الالتزام بالصدق في عروض العمل، والتصريح بالعيوب والمحددات في المنتجات أو الخدمات، والوفاء بالعقود دون مواربة.",
    reflectivePromptAr: "في تعاملاتك المهنية والمالية، هل تتحرى الشفافية المطلقة حتى وإن قللت ربحك العاجل؟",
  },
  {
    id: "station-consultation",
    timeframeAr: "العصر — الشورى والاجتماع",
    timeframeEn: "Afternoon — Consultation & Public Governance",
    period: "afternoon",
    titleAr: "الشورى والاستماع للآخرين والإنصاف",
    titleEn: "Consultation, Deep Listening, and Fairness",
    hadithTextAr: "قال أبو هريرة رضي الله عنه: «ما رأيت أحداً قط كان أكثر مشورة لأصحابه من رسول الله ﷺ». وكان يستمع للصغير والكبير والمرأة والرجل ويأخذ بآرائهم الصائبة.",
    hadithTextEn: "Abu Hurairah said: I never saw anyone consult his companions more frequently than the Messenger of Allah ﷺ.",
    sourceReference: "سنن الترمذي (1714)",
    ethicalPrincipleAr: "القيادة الخادمة، نبذ الاستبداد بالرأي، وإعلاء كرامة الفريق وعقولهم.",
    modernApplicationAr: "الاستماع للمرؤوسين والزملاء في الاجتماعات باهتمام حقيقي، وتقدير المساهمات الفكرية وتشجيع المبادرة.",
    reflectivePromptAr: "حين تدير نقاشاً أو تتخذ قراراً يؤثر على غيرك، هل تستمع بصدق أم تبحث فقط عمن يوافق رأيك المسبق؟",
  },
  {
    id: "station-neighbors",
    timeframeAr: "الغروب — حق الجوار والمساء",
    timeframeEn: "Evening — Neighborhood Care & Generosity",
    period: "maghrib",
    titleAr: "تفقد الجار، وإطعام الطعام، وحفظ الأعراض",
    titleEn: "Caring for Neighbors and Spreading Peace",
    hadithTextAr: "«ما زال جبريل يوصيني بالجار حتى ظننت أنه سيورثه» وقال ﷺ: «ليس المؤمن الذي يشبع وجاره جائع إلى جنبه».",
    hadithTextEn: "Jibreel kept advising me concerning the neighbor until I thought he would grant him inheritance rights. He also said: He is not a believer whose stomach is filled while his neighbor goes hungry.",
    sourceReference: "صحيح البخاري ومسلم، وشعب الإيمان للبيهقي",
    ethicalPrincipleAr: "التكافل الاجتماعي العضوي، وبناء أواصر المحبة الحقيقية بين أهل الحي.",
    modernApplicationAr: "السؤال عن الجيران، ومشاركتهم الطعام والمناسبات، وتفقد كبار السن والمحتاجين في محيط السكن.",
    reflectivePromptAr: "هل تعرف أحوال جيرانك الأقربين؟ متى كانت آخر مرة أهديت لهم فيها أو اطمأننت على أحوالهم؟",
  },
  {
    id: "station-night",
    timeframeAr: "الليل وسكون الكون",
    timeframeEn: "Nightfall & Solitary Devotion",
    period: "night",
    titleAr: "التفكر، وسلامة الصدر، ومناجاة الخالق",
    titleEn: "Contemplation, A Clean Heart, and Nightly Devotion",
    hadithTextAr: "كان النبي ﷺ إذا أوى إلى فراشه نفث وقرأ المعوذات وذكر ربه، وسامح الناس وقال: «اللهم أسلمت نفسي إليك...». وكان يقوم الليل شاكراً لربه قائلاً: «أفلا أكون عبداً شكوراً».",
    hadithTextEn: "When retiring to sleep, he would invoke his Lord with a heart free of grudges against any soul. And he would stand in night vigil, saying: Shall I not be a grateful servant?",
    sourceReference: "صحيح البخاري (4837) ومسلم",
    ethicalPrincipleAr: "سلامة الصدر من الغل والحقد قبل النوم، ومحاسبة النفس، وشكر نعم الله.",
    modernApplicationAr: "إنهاء اليوم بقلب سليم معافى من الضغائن، وإغلاق الأجهزة، والوقوف لدقائق في صلاة خاشعة أو تفكر عميق.",
    reflectivePromptAr: "هل تنام الليلة وأنت مسامح لكل من أخطأ في حقك، ممتناً لنعم لم تحصها طوال ساعات النهار؟",
  },
];

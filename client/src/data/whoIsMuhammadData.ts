export interface HumanityChapter {
  id: string;
  order: number;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  summaryAr: string;
  summaryEn: string;
  fullNarrativeAr: string;
  fullNarrativeEn: string;
  historicalContextAr: string;
  coreEvidence: {
    source: string;
    compilerOrWork: string;
    textAr: string;
    textEn: string;
    reference: string;
    status: "verified" | "multiple_sourced" | "historically_approximate";
  }[];
  quranConnections?: {
    surahNameAr: string;
    surahNumber: number;
    ayahNumber: number;
    textAr: string;
    translationEn: string;
  }[];
  valuesHighlighted: string[];
}

export const WHO_IS_MUHAMMAD_CHAPTERS: HumanityChapter[] = [
  {
    id: "human-before-mission",
    order: 1,
    titleAr: "الإنسان قبل الرسالة",
    titleEn: "The Human Being Before the Mission",
    subtitleAr: "أربعون عاماً من الصدق، والتأمل، ورعي الغنم، ومخالطة الناس بلا زيف",
    subtitleEn: "Forty years of honesty, reflection, labor, and ethical standing in Mecca",
    summaryAr: "لم يبدأ محمد ﷺ حياته كقائد سياسي أو ثائر، بل عاش أربعين سنة إنساناً بين قومه، لم يسجد لصنم، ولم يظلم أحداً، وعُرف بالأمانة المطلقة حتى لقّبوه بالصادق الأمين.",
    summaryEn: "Muhammad did not begin as a political leader or militant revolutionary. He lived forty years in Mecca as an ordinary, respected citizen who never worshipped idols, never wronged anyone, and earned universal acclaim as 'The Trustworthy'.",
    fullNarrativeAr: `وُلد محمد بن عبد الله ﷺ في بيئة صحراوية قاسية تحكمها القبلية وعصبية الدم. فقد والده عبد الله قبل أن يرى النور، ثم فقد والدته آمنة وهو في السادسة من عمره، ثم جده عبد المطلب وهو في الثامنة. هذا اليتم المبكر جعله رقيق القلب يشعر بألم الضعفاء والمحرومين.

عمل في مطلع حياته برعي الغنم لأهل مكة، وهي مهنة علمته الصبر والحلم والرعاية الهادئة، ثم اشتغل بالتجارة مع عمه أبي طالب. تميز في تجارته بصدق القول وأداء الأمانات دون غش أو احتكار، فكان أهل مكة يودعون عنده نفائس أموالهم حين يسافرون، وأجمعوا على تسميته «الأمين».

وعندما تصدعت الكعبة واختلفت قبائل قريش وكادت تقع حرب دموية حول من يحوز شرف وضع الحجر الأسود في مكانه، ارتضوا بحكم أول داخل عليهم، فكان هو. بحكمته الإنسانية، وضع رداءه ووضع الحجر عليه، وأمر رؤساء القبائل جميعاً بحمل أطراف الرداء معاً، ثم تناوله بيده الشريفة ووضعه في مكانه، فأنقذ بلده من حرب محققة.`,
    fullNarrativeEn: `Muhammad was born into a harsh tribal desert society. He lost his father before birth, his mother at age six, and his grandfather at age eight. Experiencing orphanhood firsthand cultivated deep empathy for the vulnerable and marginalized.

In early life, he shepherded flocks across the Meccan hills—a vocation fostering patience, contemplation, and gentleness—before entering commerce. His commercial integrity earned him the title 'Al-Ameen' (The Trustworthy). Meccans entrusted their valuables to him for safekeeping. When tribal rivalry over repositioning the Black Stone nearly sparked civil war, his mediation united all clan leaders, demonstrating early conflict resolution.`,
    historicalContextAr: "شبه الجزيرة العربية في القرن السادس الميلادي، مكة المكرمة كمركز تجاري ووثني تحكمه الأعراف العشائرية.",
    coreEvidence: [
      {
        source: "صحيح البخاري",
        compilerOrWork: "صحيح البخاري — كتاب الإجارة",
        textAr: "«ما بعث الله نبياً إلا رعى الغنم»، فقال أصحابه: وأنت؟ فقال: «نعم، كنت أرعاها على قراريط لأهل مكة».",
        textEn: "Allah did not send any prophet who did not graze sheep. His companions asked, 'And you?' He replied, 'Yes, I used to graze them for modest wages for the people of Mecca.'",
        reference: "رقم 2262",
        status: "verified",
      },
    ],
    quranConnections: [
      {
        surahNameAr: "الضحى",
        surahNumber: 93,
        ayahNumber: 6,
        textAr: "أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ ۝ وَوَجَدَكَ ضَالًّا فَهَدَىٰ ۝ وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ",
        translationEn: "Did He not find you an orphan and give you shelter? And He found you lost and guided you, and He found you in need and enriched you.",
      },
    ],
    valuesHighlighted: ["الأمانة", "الصدق", "التواضع", "فض النزاعات بالحكمة"],
  },
  {
    id: "lineage-and-context",
    order: 2,
    titleAr: "النسب والبيئة الاجتماعية",
    titleEn: "Lineage, Family, and Social Context",
    subtitleAr: "قبيلة قريش، دار الندوة، وحلف الفضول لنصرة المظلوم",
    subtitleEn: "Quraysh, pre-Islamic Arabia, and the League of the Virtuous to defend the oppressed",
    summaryAr: "انحدر من أشرف بيوت قريش في بني هاشم، لكنه عارض أعراف الجاهلية الظالمة وشارك في شبابه بحلف الفضول لنصرة أي غريب مظلوم في مكة.",
    summaryEn: "Descended from the noble Banu Hashim clan, he nonetheless rejected the unjust customs of pre-Islamic Arabia, actively joining the Alliance of the Virtuous (Hilf al-Fudul) to protect any oppressed stranger.",
    fullNarrativeAr: `ينتسب محمد ﷺ إلى إسماعيل بن إبراهيم عليهما السلام، وهو من بني هاشم من قبيلة قريش. ورغم مكانة أسرته، إلا أنه لم يكن من أصحاب الثروات الطائلة.

في شبابه الباكر، شهد حدثاً إنسانياً فاصلاً هو «حلف الفضول»، حيث تعاهدت بطون من قريش في دار عبد الله بن جدعان على ألا يجدوا بمكة مظلوماً من أهلها أو ممن دخلها من غيرهم إلا قاموا معه وكانوا على من ظلمه حتى تُردّ إليه مظلمته. وقد قال النبي ﷺ عن هذا الحلف بعد بعثته بسنوات طويلة: «لقد شهدتُ في دار عبد الله بن جدعان حِلفاً ما أُحِبُّ أنَّ لي به حُمْرَ النَّعَم، ولو أُدْعَى به في الإسلام لأجَبْت»، مما يؤكد أن نصرة المظلوم قيمة إنسانية جامعة تعلو فوق كل عصبية.`,
    fullNarrativeEn: `Muhammad's lineage traced back to Ishmael, son of Abraham. Despite his respected ancestry in the Banu Hashim clan, he inherited no great wealth. In his twenties, he participated in the historic 'Hilf al-Fudul' (The League of the Virtuous). Clan leaders pledged that no stranger or resident would suffer injustice in Mecca without collective defense. Years after receiving his prophetic mission, Muhammad affirmed: 'I witnessed in the house of Ibn Jud'an an oath more beloved to me than red camels; had I been invited to it in Islam, I would have answered.'`,
    historicalContextAr: "حلف الفضول في مكة بعد حرب الفجار، كرد فعل على سلب تاجر يمني حقه.",
    coreEvidence: [
      {
        source: "دلائل النبوة للبيهقي والسيرة النبوية لابن هشام",
        compilerOrWork: "السيرة النبوية لابن هشام",
        textAr: "«لو دُعيتُ به في الإسلام لأجبتُ، تحالفوا أن ترد الفضول على أهلها وألا يعز ظالم مظلوماً».",
        textEn: "If I were called to it in Islam, I would respond. They covenanted to return rights to their owners and ensure no oppressor prevailed over the wronged.",
        reference: "إسناد حسن مخرج في السنن الكبرى",
        status: "verified",
      },
    ],
    valuesHighlighted: ["العدالة الإنسانية", "نصرة الضعيف", "مقاومة الظلم"],
  },
  {
    id: "youth-marriage-khadijah",
    order: 3,
    titleAr: "الشباب، العمل، والزواج بخديجة",
    titleEn: "Youth, Work, and Marriage to Khadijah",
    subtitleAr: "شراكة روحية وإنسانية مع سيدة أعمال فاضلة كانت له السند والملاذ",
    subtitleEn: "A profound life partnership with an esteemed businesswoman who became his steadfast sanctuary",
    summaryAr: "تزوج خديجة بنت خويلد رضي الله عنها وهو في الخامسة والعشرين وهي تكبره سناً، فكانت له نعم الزوجة والسكن، ولم يتزوج عليها طيلة حياتها حباً ووفاءً لها.",
    summaryEn: "At twenty-five, he married Khadijah bint Khuwaylid. She was an accomplished entrepreneur who admired his incorruptible honesty. For twenty-five years until her death, he remained devoted solely to her in an enduring monogamous bond.",
    fullNarrativeAr: `استأجرته خديجة بنت خويلد—وكانت سيدة أعمال قرشية مرموقة—ليقود قافلتها التجارية إلى بلاد الشام بعدما سمعت عن أمانته وسمو خلقه. وعاد من رحلته بأرباح وفيرة، وشهد غلامها ميسرة بما رآه من كرم أخلاقه وصدق تعامله.

عرضت خديجة عليه الزواج فرضي، وبدأت أروع رحلة وفاء ومودة زوجية في التاريخ. عاشا ربع قرن في استقرار وسكينة، ورزقا بأولادهما القاسم وعبد الله وزينب ورقية وأم كلثوم وفاطمة. وحين نزل عليه الوحي مرتجفاً، كانت خديجة هي الملاذ الأول الذي احتواه وقال له كلماتها الخالدة: «كلا والله ما يخزيك الله أبداً، إنك لتصل الرحم، وتحمل الكل، وتكسب المعدوم، وتقري الضيف، وتعين على نوائب الحق».`,
    fullNarrativeEn: `Khadijah hired Muhammad to manage her trade caravan to the Levant after hearing of his uncompromising reputation. Her assistant Maysarah observed his dignified conduct, fairness, and generosity. Impressed by his character, she proposed marriage.

For twenty-five years until her passing, Muhammad married no other. Their union produced six children. When the overwhelming weight of the first divine revelation caused him to tremble, Khadijah was his refuge, uttering her timeless testament: 'Never! By Allah, God will never disgrace you. You uphold family ties, bear the burdens of the weary, provide for the destitute, honor guests, and support every righteous cause.'`,
    historicalContextAr: "مكة المكرمة بين 595م و 610م.",
    coreEvidence: [
      {
        source: "صحيح البخاري ومسلم",
        compilerOrWork: "صحيح البخاري — بدء الوحي",
        textAr: "«كلا والله لا يخزيك الله أبداً؛ إنك لتصل الرحم، وتصدق الحديث، وتحمل الكَلّ، وتكسب المعدوم، وتقري الضيف، وتعين على نوائب الحق».",
        textEn: "Never! By God, Allah will never forsake you. You keep good relations with kith and kin, speak the truth, help the poor, earn for the destitute, serve guests generously, and assist the afflicted.",
        reference: "حديث رقم 3 في البخاري",
        status: "verified",
      },
    ],
    valuesHighlighted: ["الوفاء الزوجي", "إعانة المنكوب", "إكرام الضيف"],
  },
  {
    id: "first-revelation-hira",
    order: 4,
    titleAr: "بدء الوحي في غار حراء",
    titleEn: "The First Revelation in Cave Hira",
    subtitleAr: "«اقرأ» — عندما تحولت الكلمة إلى منطلق لعصر المعرفة والنور",
    subtitleEn: "'Read!' — When the word became the dawn of knowledge, literacy, and conscience",
    summaryAr: "في غار حراء المنعزل، نزل عليه الملك جبريل بأول كلمة من القرآن العظيم: «اقْرَأْ». لم تكن الدعوة دعوة حرب، بل نداءً للقراءة والعلم والإيمان برب رحيم.",
    summaryEn: "In the secluded Mount Hira, Gabriel descended with the inaugural divine commandment: 'Read!' The inception of Islam was not conquest or royal decree, but an imperative of literacy, divine knowledge, and ethical consciousness.",
    fullNarrativeAr: `مع اقتراب سن الأربعين، حبّب الله إلى محمد ﷺ الخلوة في غار حراء في جبل النور بمكة، متأملاً في ملكوت السماوات والأرض، متعبداً على ملة إبراهيم حنيفاً، مبتعداً عن وثنية مجتمعه وعبادة الأصنام.

وفي إحدى ليالي شهر رمضان المبارك، فوجئ بهبوط الملك جبريل عليه السلام قائلاً له: «اقرأ»، فقال محمد مرعوباً بحقيقته الإنسانية: «ما أنا بقارئ»، فغطه الملك حتى بلغ منه الجهد ثم أرسله وقال ثانية وثالثة، حتى قال له: «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ۝ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ ۝ اقْرَأْ وَرَبُّكَ الْأَكْرَمُ ۝ الَّذِي عَلَّمَ بِالْقَلَمِ ۝ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ». رجع بها رسول الله يرجف فؤاده، فكانت البداية لكتاب غيّر وجه الحضارة الإنسانية.`,
    fullNarrativeEn: `Approaching forty, Muhammad retreated periodically to Cave Hira atop the Mountain of Light (Jabal al-Nur), contemplating the creation and lamenting Mecca's idol worship and social decay.

One night during Ramadan, the Angel Gabriel appeared, commanding: 'Read!' Shaken, Muhammad replied: 'I am not a reader.' Gabriel embraced him firmly until he reached his limit, releasing him with the repeating imperative, culminating in: 'Read in the name of your Lord who created—created humankind from a clinging clot. Read! And your Lord is the Most Generous—Who taught by the pen, taught humanity what they did not know.' Trembling, Muhammad hurried home to Khadijah.`,
    historicalContextAr: "غار حراء بجبل النور، مكة المكرمة، سنة 610 ميلادية.",
    coreEvidence: [
      {
        source: "صحيح البخاري",
        compilerOrWork: "صحيح البخاري — كتاب بدء الوحي",
        textAr: "«فرجع بها رسول الله ﷺ يرجف فؤاده حتى دخل على خديجة بنت خويلد فقال: زملوني زملوني! فزملوه حتى ذهب عنه الروع».",
        textEn: "The Messenger of Allah returned with the revelation, his heart beating violently. He came to Khadijah and said: 'Cover me! Cover me!' She covered him until his fear subsided.",
        reference: "رقم 3",
        status: "verified",
      },
    ],
    quranConnections: [
      {
        surahNameAr: "العلق",
        surahNumber: 96,
        ayahNumber: 1,
        textAr: "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ ۝ خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ",
        translationEn: "Read in the name of your Lord who created, created humankind from a clinging entity.",
      },
    ],
    valuesHighlighted: ["طلب العلم", "التأمل والتفكر", "القراءة بالقلم"],
  },
  {
    id: "core-message",
    order: 5,
    titleAr: "ما هي الرسالة التي جاء بها؟",
    titleEn: "What Was the Message?",
    subtitleAr: "توحيد الخالق، وكرامة الإنسان، وإقامة العدل، والإحسان للخلق",
    subtitleEn: "Oneness of God, inherent human dignity, universal justice, and active compassion",
    summaryAr: "جوهر رسالته: لا إله إلا الله، تحرير الإنسان من عبودية الخرافة والبشر، والمساواة بين جميع البشر فلا فضل لأحد إلا بالتقوى والعمل الصالح.",
    summaryEn: "The core of his proclamation: Monotheism (Tawhid)—liberating human conscience from subjugation to idols or human tyrants—and the absolute moral equality of all people regardless of race, caste, or wealth.",
    fullNarrativeAr: `لم تكن رسالة محمد ﷺ مجرد طقوس وشعائر، بل كانت ثورة روحية وأخلاقية شاملة. أعلنت أن الإله واحد أحد، لا شريك له، خالق كل شيء، رحمن رحيم.

وفي الجانب الإنساني والاجتماعي، أعلنت الرسالة:
1. كرامة كل نفس بشرية: «وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ».
2. إلغاء التمييز العرقي والطبقي: ساوى بين سادة قريش والعبيد المستضعفين كبلال الحبشي وصهيب الرومي وسلمان الفارسي.
3. تجريم وأد البنات وحماية حقوق المرأة المالية والزوجية والإنسانية في عصر كانت المرأة تُورث فيه كالمتاع.
4. إرساء العدالة المطلقة حتى مع الخصوم: «وَلَا يَجْرِمَنَّكُمْ شَنَآنُ قَوْمٍ عَلَىٰ أَلَّا تَعْدِلُوا ۚ اعْدِلُوا هُوَ أَقْرَبُ لِلتَّقْوَىٰ».`,
    fullNarrativeEn: `The message Muhammad conveyed transformed both theology and society. Spiritually, it reaffirmed pure Abrahamic monotheism: One Transcendent Creator, boundless in mercy.

Socially, it dismantled hereditary privilege:
1. Inherent dignity for all human beings ('We have honored the children of Adam').
2. Racial equality: It united Arab elites with formerly enslaved Africans (Bilal), Romans (Suhayb), and Persians (Salman) as brothers.
3. Eradication of female infanticide and establishment of female legal, financial, and marital rights.
4. Universal justice even toward opponents ('Do not let hatred of a people prevent you from being just; be just, that is nearer to righteousness').`,
    historicalContextAr: "الدعوة الجهرية في مكة المكرمة في مواجهة ملأ قريش وأشرافها.",
    coreEvidence: [
      {
        source: "مسند الإمام أحمد",
        compilerOrWork: "خطبة الوداع",
        textAr: "«يا أيها الناس، إن ربكم واحد وإن أباكم واحد، ألا لا فضل لعربي على أعجمي ولا لعجمي على عربي ولا لأحمر على أسود ولا لأسود على أحمر إلا بالتقوى».",
        textEn: "O people! Your Lord is One and your father is one. An Arab has no superiority over a non-Arab, nor a non-Arab over an Arab; nor does a white person have superiority over a black person, nor a black person over a white person, except by piety.",
        reference: "إسناد صحيح",
        status: "verified",
      },
    ],
    quranConnections: [
      {
        surahNameAr: "الحجرات",
        surahNumber: 49,
        ayahNumber: 13,
        textAr: "يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَىٰ وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا",
        translationEn: "O humanity, indeed We have created you from male and female and made you peoples and tribes that you may know one another.",
      },
    ],
    valuesHighlighted: ["المساواة الإنسانية", "تحرير العبيد", "حقوق المرأة", "العدل المطلق"],
  },
  {
    id: "meccan-persecution",
    order: 6,
    titleAr: "السنوات المكية والمظالم",
    titleEn: "The Meccan Years & Persecution",
    subtitleAr: "ثلاثة عشر عاماً من المقاومة السلمية، والحصار، والتضحية بلا انتقام",
    subtitleEn: "Thirteen years of peaceful steadfastness, economic boycott, and forbearance under severe torment",
    summaryAr: "واجهت قريش دعوة التوحيد والمساواة بالتعذيب والمقاطعة الاقتصادية الشاملة. ورغم كل العذاب، لم يأمر النبي ﷺ أتباعه بأي عمل انتقامي أو عنف مضاد.",
    summaryEn: "Meccan elites perceived egalitarian monotheism as a threat to their commerce and caste system. They subjected Muslims to torture, expulsion, and a brutal three-year starvation boycott. Throughout this period, Muhammad prohibited violent retaliation.",
    fullNarrativeAr: `استمرت المرحلة المكية ثلاثة عشر عاماً كاملة. كان أتباع النبي ﷺ الأوائل من الشباب، والنساء، والفقراء، والعبيد المستضعفين. رأت قريش في دعوة المساواة تهديداً لمصالحها الاقتصادية ومكانة أصنامها، فعذبت المستضعفين كبلال بن رباح، وآل ياسر الذين استشهدت سمية وأبوها تحت وطأة التعذيب.

ثم فرضت قريش حصاراً اقتصادياً واجتماعياً ظالماً في شِعْب أبي طالب دام ثلاث سنوات كاملة، منعوا عنهم الطعام حتى أكل المسلمون وأطفالهم ورق الشجر من شدة الجوع. ولما خرجوا من الحصار، توفي عم النبي أبو طالب وسنده، ثم توفيت زوجته الحبيبة خديجة رضي الله عنها، فسُمي ذلك العام «عام الحزن».

ورغم كل هذه المحن، ظل النبي ﷺ يدعو بالرحمة والمغفرة لقومه دون أن يدعو عليهم بالهلاك أو يأمر أصحابه بأي رد انتقامي.`,
    fullNarrativeEn: `For thirteen long years in Mecca, early Muslims endured systematic persecution. Because the early community consisted largely of disenfranchised youth, women, and slaves, Meccan aristocrats applied brutal pressure. Sumayyah bint Khayyat and her husband Yasir were tortured to death, becoming the first martyrs.

Quraysh then imposed a devastating three-year economic blockade in the valley of Abu Talib, starving families until they ate tree leaves. Shortly after the embargo collapsed, Muhammad lost both his protective uncle Abu Talib and his beloved wife Khadijah in what became known as the 'Year of Grief.' Through all this brutality, Muhammad maintained a strictly non-violent posture, forbidding retaliatory vigilantism.`,
    historicalContextAr: "مكة المكرمة بين 610م و 622م، شِعب أبي طالب، والهجرة الأولى إلى الحبشة.",
    coreEvidence: [
      {
        source: "صحيح البخاري ومسلم",
        compilerOrWork: "صحيح البخاري — كتاب مناقب الأنصار",
        textAr: "«شكونا إلى رسول الله ﷺ وهو متوسد بردة له في ظل الكعبة، فقلنا: ألا تستنصر لنا؟ ألا تدعو لنا؟ فقال: قد كان من قبلكم يؤخذ الرجل فيحفر له في الأرض... والله ليتمن هذا الأمر حتى يسير الراكب من صنعاء إلى حضرموت لا يخاف إلا الله والذئب على غنمه، ولكنكم تستعجلون».",
        textEn: "We complained to Allah's Messenger while he was leaning against the Kaaba. We said: 'Will you not ask help for us? Will you not pray for us?' He replied: 'Among those before you, a person would be placed in a trench... By Allah, this matter will be completed until a rider travels from Sana'a to Hadramawt fearing none but Allah and the wolf for his sheep, but you are impatient.'",
        reference: "رقم 3612",
        status: "verified",
      },
    ],
    valuesHighlighted: ["الصبر والمثابرة", "السلمية في مواجهة الظلم", "اليقين بالمستقبل"],
  },
  {
    id: "hijrah-and-society",
    order: 7,
    titleAr: "الهجرة وبناء المجتمع المدني",
    titleEn: "The Migration (Hijrah) & Building a New Society",
    subtitleAr: "وثيقة المدينة: أول دستور مكتوب للمواطنة، والتعايش السلمي، وحرية المعتقد",
    subtitleEn: "The Constitution of Medina: Humanity's earliest written compact of pluralism and equal citizenship",
    summaryAr: "هاجر إلى يثرب (المدينة المنورة) عام 622م ليؤسس دولة مدنية قوامها المؤاخاة بين المهاجرين والأنصار، وكتب «وثيقة المدينة» التي اعتبرت المسلمين واليهود أمة واحدة متكافئة الحقوق.",
    summaryEn: "Migrating to Medina in 622 CE, Muhammad established a pluralistic society. He drafted the historic Charter of Medina, legally binding Muslims, Jews, and polytheistic tribes into a mutual civic community ('one nation') with guaranteed religious freedom and shared defense duties.",
    fullNarrativeAr: `بعد أن تآمرت قريش على اغتياله في فراشه، نجا النبي ﷺ بصحبة أبي بكر الصديق في رحلة الهجرة المعجزة إلى المدينة المنورة (سنة 622م)، وهو الحدث الذي اتخذه المسلمون بداية لتاريخهم وتقويمهم الهجري.

وفي المدينة المنورة، قام بثلاث خطوات تاريخية:
1. بناء المسجد النبوي: ليس مكاناً للعبادة فحسب، بل مركزاً للشورى والتعليم والضيافة ومأوى للفقراء (أهل الصفة).
2. المؤاخاة: تقاسم أهل المدينة (الأنصار) بيوتهم وأموالهم مع المهاجرين الذين تركوا كل أموالهم في مكة، في أعظم تضامن إنساني عرفته البشرية.
3. وثيقة المدينة: أول دستور مكتوب في العالم ينص على المواطنة والتعددية الدينية. نصت الوثيقة بصراحة على أن: «يهود بني عوف أمة مع المؤمنين، لليهود دينهم وللمسلمين دينهم، مواليهم وأنفسهم»، وأن على الجميع الدفاع المشترك عن المدينة دون ظلم أو إكراه.`,
    fullNarrativeEn: `Narrowly escaping an assassination plot in Mecca, Muhammad and Abu Bakr journeyed across the desert to Yathrib (Medina) in 622 CE—the watershed migration marking Year 1 of the Islamic calendar.

Upon arrival, he executed three foundational acts:
1. Building the Prophet's Mosque as an open community center, civic assembly, and shelter for the homeless poor (Ahl al-Suffah).
2. Fraternization (Mu'akhat): Medina's residents (Ansar) embraced Meccan refugees (Muhajirun), sharing homes, livelihoods, and dignity.
3. The Constitution of Medina: A revolutionary legal document instituting equal civic status. It explicitly declared: 'The Jews of Banu Awf are a community alongside the believers; the Jews have their religion and the Muslims have their religion.' It enshrined freedom of faith, collective security, and due process.`,
    historicalContextAr: "المدينة المنورة، 1 هجرية (622م)، صياغة دستور المدينة ومسجد قباء والمسجد النبوي.",
    coreEvidence: [
      {
        source: "سيرة ابن هشام ومصنف ابن أبي شيبة",
        compilerOrWork: "وثيقة المدينة المنورة — البند 25",
        textAr: "«وإن يهود بني عوف أمة مع المؤمنين، لليهود دينهم وللمسلمين دينهم، مواليهم وأنفسهم، إلا من ظلم وأثم فإنه لا يوتغ إلا نفسه وأهل بيته».",
        textEn: "And the Jews of Banu Awf are one community with the believers; the Jews have their religion and the Muslims have their religion, their allies and their persons, except whoever acts unjustly or sinfully, for he destroys none but himself and his household.",
        reference: "وثيقة معتمدة في كتب السير",
        status: "verified",
      },
    ],
    valuesHighlighted: ["المواطنة المتساوية", "حرية المعتقد", "التضامن المجتمعي", "سيادة العقد الدستوري"],
  },
  {
    id: "family-and-personal-character",
    order: 8,
    titleAr: "الحياة الأسرية والشمائل الشخصية",
    titleEn: "Family Life and Personal Character",
    subtitleAr: "«خيركم خيركم لأهله» — البساطة، التبسم، ملاعبة الصغار، وخدمة النفس",
    subtitleEn: "'The best of you is best to his family' — Humility, laughter, domestic participation, and empathy",
    summaryAr: "في بيته لم يكن طاغية ولا متعالياً، بل كان يخسف نعله ويرقع ثوبه ويكون في مهنة أهله، يمازح الأطفال، ولا يضرب امرأة ولا خادماً قط.",
    summaryEn: "In his domestic life, he rejected patriarchal tyranny. He mended his own clothes and shoes, assisted in daily chores, played joyfully with children, and never struck a woman, servant, or child in his entire life.",
    fullNarrativeAr: `سُئلت السيدة عائشة رضي الله عنها: ما كان النبي ﷺ يصنع في بيته؟ قالت: «كان في مهنة أهله، فإذا حضرت الصلاة قام إلى الصلاة». وكان أبعد الناس عن الكبر، يرقع ثوبه ويخصف نعله ويحلب شاته.

وكان ﷺ يحب الأطفال حباً جماً، يمر بالصبيان فيسلم عليهم، ويحمل حفيديه الحسن والحسين على كتفيه، ويطيل سجوده في الصلاة إذا ركب الحسن على ظهره خشية أن يعجله قبل أن يقضي حاجته من اللعب.

وعن خلقه مع الخدم، قال أنس بن مالك رضي الله عنه: «خدمتُ النبي ﷺ عشر سنين، فما قال لي أفٍّ قط، وما قال لشيء صنعته لمَ صنعته؟ ولا لشيء لم أصنعه لمَ لم تصنعه؟»، وقالت عائشة: «ما ضرب رسول الله ﷺ شيئاً قط بيده، ولا امرأة، ولا خادماً، إلا أن يجاهد في سبيل الله».`,
    fullNarrativeEn: `When Aisha was asked how the Prophet behaved at home, she replied: 'He was at the service of his family, assisting in household chores, and when the call to prayer came, he left for prayer.' He repaired his own garments and shoes, milked his goats, and served himself.

His affection for children was legendary. He greeted children on the streets, carried his grandchildren Hasan and Husayn on his shoulders, and famously prolonged prostration during communal prayer because his young grandson climbed onto his back.

His young attendant, Anas ibn Malik, recounted: 'I served the Prophet for ten years, and he never once said to me 'Uff' (an expression of exasperation), nor did he ever question why I did or did not do something.' Aisha noted: 'The Messenger of Allah never struck anything with his hand—neither a woman nor a servant.'`,
    historicalContextAr: "بيوت النبي ﷺ المتواضعة المجاورة للمسجد النبوي الشريف.",
    coreEvidence: [
      {
        source: "صحيح مسلم",
        compilerOrWork: "صحيح مسلم — كتاب الفضائل",
        textAr: "«ما ضرب رسول الله ﷺ شيئاً قط بيده، ولا امرأة، ولا خادماً، إلا أن يجاهد في سبيل الله، وما نيل منه شيء قط فينتقم من صاحبه إلا أن ينتهك شيء من محارم الله».",
        textEn: "The Messenger of Allah never struck anything with his hand, neither a woman nor a servant, except when striving in the cause of Allah. Nor did he ever take revenge on anyone for personal harm.",
        reference: "رقم 2328",
        status: "verified",
      },
    ],
    valuesHighlighted: ["التواضع المنزلي", "الرحمة بالأطفال", "حسن معاملة الخدم", "نبذ العنف الأسري"],
  },
  {
    id: "mercy-conflict-treaties",
    order: 9,
    titleAr: "الرحمة، المعاهدات، ومواقف النزاع",
    titleEn: "Mercy, Treaties, and Conduct in Conflict",
    subtitleAr: "قواعد الاشتباك الأخلاقية، صلح الحديبية، وفتح مكة: «اذهبوا فأنتم الطلقاء»",
    subtitleEn: "Ethical rules of engagement, the Treaty of Hudaybiyyah, and the Pardon of Mecca: 'Go, you are free'",
    summaryAr: "لم تكن حروبه للغزو أو النهب، بل للدفاع ورد العدوان. وضع أول قواعد حرب تحرم قتل النساء والأطفال والرهبان وقطع الأشجار. وحين عاد لمكة فاتحاً منتصراً، عفا عن كل من عذبوه وقال: «اذهبوا فأنتم الطلقاء».",
    summaryEn: "His engagements were strictly regulated by the world's first comprehensive laws of armed conflict: strictly forbidding the killing of non-combatants, monks, children, women, or destroying crops. When he returned to conquer Mecca, instead of revenge, he issued a universal unconditional pardon: 'Go, for you are free.'",
    fullNarrativeAr: `حين اضطر المسلمون لحمل السلاح دفاعاً عن أنفسهم بعد عشرات السنين من الطرد وسلب الأموال، وضع النبي ﷺ قواعد حرب إنسانية صارمة كان يوصي بها قادته:
- «لا تقتلوا وليداً، ولا امرأة، ولا كبيراً فانياً، ولا راهباً في صومعة».
- «لا تقطعوا شجرة مثمرة، ولا تذبحوا شاة إلا لمأكلة، ولا تغرقوا نخلاً ولا تحرقوه».
- النهي الصارم عن التمثيل بجثث القتلى أو تعذيب الأسرى.

وفي صلح الحديبية، قبل بشروط قاسية من أجل إيقاف الحرب وتحقيق السلام، رغم اعتراض بعض أصحابه لشدة حرصه على حقن الدماء.

وعندما دخل مكة المكرمة فاتحاً في العام الثامن للهجرة ومعه عشرة آلاف مقاتل، دخلها مطأطئاً رأسه على راحلته تواضعاً لله حتى كادت لحيته تلامس واسطة الرحل. وقف أمامه زعماء قريش الذين قتلوا أصحابه، وطردوه، وشجوا وجهه، وتآمروا على قتله، فخافوا من الانتقام، فسألهم: «ما تظنون أني فاعل بكم؟»، قالوا: أخ كريم وابن أخ كريم، فقال كلمته التي لا ينساها التاريخ: «لا تَثْرِيبَ عَلَيْكُمُ الْيَوْمَ، يَغْفِرُ اللَّهُ لَكُمْ، اذهبوا فأنتم الطلقاء».`,
    fullNarrativeEn: `When compelled to take up arms after decades of dispossession, Muhammad codified strict rules of warfare:
- Never kill children, women, the elderly, or monks at worship.
- Never destroy fruitful trees, slaughter cattle except for food, or burn habitable infrastructure.
- Complete prohibition of mutilation and prisoner abuse.

At the Treaty of Hudaybiyyah, he accepted seemingly disadvantageous terms to secure a ten-year non-aggression pact, prioritizing peaceful reconciliation over military triumph.

His crowning moment occurred at the Conquest of Mecca (630 CE). Entering his hometown at the head of ten thousand men, he rode with his head bowed so low in humility that his beard nearly touched the saddle. Before him stood the oligarchs who had boycotted his family, assassinated his companions, and driven him into exile. When asked what they anticipated, they pleaded for mercy. Muhammad echoed Joseph's words: 'No reproach upon you today. May God forgive you. Go, for you are free.'`,
    historicalContextAr: "الحديبية (6 هـ) وفتح مكة (8 هـ) وحنين والطائف.",
    coreEvidence: [
      {
        source: "السنن الكبرى للبيهقي ومصنف عبد الرزاق",
        compilerOrWork: "السيرة النبوية لابن كثير — فتح مكة",
        textAr: "«ما ترون أني فاعل بكم؟ قالوا: خيراً، أخ كريم وابن أخ كريم، فقال: أقول كما قال يوسف لإخوته: لا تثريب عليكم اليوم، اذهبوا فأنتم الطلقاء».",
        textEn: "What do you think I will do to you? They replied: 'Good, a noble brother and son of a noble brother.' He said: 'I say as Joseph said to his brothers: No blame upon you today. Go, for you are free.'",
        reference: "إسناد حسن معتمد عند المحققين",
        status: "verified",
      },
    ],
    valuesHighlighted: ["العفو عند المقدرة", "أخلاقيات الحرب", "الوفاء بالعهود", "حقن الدماء"],
  },
  {
    id: "farewell-pilgrimage",
    order: 10,
    titleAr: "حجة الوداع وإعلان حقوق الإنسان",
    titleEn: "The Farewell Pilgrimage & Universal Declaration",
    subtitleAr: "خطبة عرفات الخالدة: حرمة الدماء، الأموال، حقوق المرأة، وإبطال الربا والاستغلال",
    subtitleEn: "The Mount Arafat Sermon: Sanctity of human life, property, women's rights, and economic justice",
    summaryAr: "في عام 10 هـ، ألقى النبي ﷺ خطبته الجامعة أمام أكثر من مائة ألف من أصحابه، فقرر حرمة الدماء والأعراض والأموال، وأوصى بالنساء خيراً، وأبطل الفوارق الطبقية والربا.",
    summaryEn: "In 632 CE, before a gathering of over one hundred thousand pilgrims, Muhammad delivered his final sermon atop Mount Arafat. It constitutes a universal charter of civil liberties: declaring human life and property inviolable, abolishing usurious exploitation, and defending women's dignity.",
    fullNarrativeAr: `في ذي الحجة من السنة العاشرة للهجرة، أدى النبي ﷺ حجته الوحيدة في الإسلام، ووقف على جبل الرحمة في عرفات ليخاطب الأمة الإنسانية بكلمات جامعة لا تبلى.

أبرز ما أعلنه في خطبة الوداع:
1. حرمة الدم والمال والعرض: «فإن دماءكم وأموالكم وأعراضكم عليكم حرام كحرمة يومكم هذا في شهركم هذا في بلدكم هذا».
2. حقوق المرأة وكرامتها: «استوصوا بالنساء خيراً، فإنهن عندكم عوان لا يملكن لأنفسهن شيئاً، وإنكم إنما أخذتموهن بأمانة الله، واستحللتم فروجهن بكلمة الله».
3. المساواة البشرية الشاملة ونبذ العنصرية: «كلكم لآدم وآدم من تراب».
4. تحريم الربا والاستغلال الاقتصادي: أعلن إسقاط كل ربا الجاهلية وبدأ بربا عمه العباس ليقدم أسرته أولاً في الالتزام بالقانون.
5. الأمانة والشهادة: رفع إصبعه إلى السماء وقال: «ألا هل بلغت؟ اللهم فاشهد».`,
    fullNarrativeEn: `During the tenth year of the Hijrah (632 CE), Muhammad performed his solitary pilgrimage, addressing over one hundred thousand listeners at the Plains of Arafat in a seminal discourse.

Key proclamations of the Farewell Sermon:
1. Absolute inviolability of human life, dignity, and private property: 'Your lives, wealth, and honor are sacred until you meet your Lord, just as this day, this month, and this city are sacred.'
2. Protection of women's rights: 'Treat women with kindness and equity. You have taken them as a trust from God.'
3. Complete eradication of racial supremacy: 'All of you descend from Adam, and Adam was made of earth.'
4. Prohibition of usury and exploitative financial contracts, beginning with the debts owed to his own family.
5. Raising his finger heavenward, he concluded: 'Have I conveyed the message? O God, bear witness!'`,
    historicalContextAr: "صعيد عرفات، مكة المكرمة، 9 ذو الحجة 10 هـ (632م).",
    coreEvidence: [
      {
        source: "صحيح مسلم",
        compilerOrWork: "صحيح مسلم — كتاب الحج (حديث جابر بن عبد الله)",
        textAr: "«إن دماءكم وأموالكم حرام عليكم، كحرمة يومكم هذا في شهركم هذا في بلدكم هذا... واستوصوا بالنساء خيراً... وقد تركت فيكم ما لن تضلوا بعده إن اعتصمتم به: كتاب الله».",
        textEn: "Indeed, your blood and your wealth are sacred to you, as the sacredness of this day of yours, in this month of yours, in this city of yours... And treat women with kindness... I have left among you what, if you hold fast to it, you will never go astray: the Book of Allah.",
        reference: "رقم 1218",
        status: "verified",
      },
    ],
    valuesHighlighted: ["حرمة الحياة الإنسانية", "حقوق المرأة", "العدالة الاقتصادية", "إلغاء العنصرية"],
  },
  {
    id: "final-days-and-passing",
    order: 11,
    titleAr: "الأيام الأخيرة والوفاة",
    titleEn: "Final Days and Passing",
    subtitleAr: "«إلى الرفيق الأعلى» — رحيل النبي الإنسان تاركاً أمة قائمة على المبدأ لا الشخص",
    subtitleEn: "'To the Highest Companion' — The passing of a prophet, cementing a faith anchored in truth, not personality cult",
    summaryAr: "توفي النبي ﷺ في ربيع الأول عام 11 هـ في حجرة عائشة بالمدينة المنورة. كانت وصيته الأخيرة: الصلاة ورعاية الضعفاء والمماليك. لم يترك درهماً ولا ديناراً ولا إرثاً مادياً، بل كتاب الله وسنته.",
    summaryEn: "Muhammad passed away in June 632 CE in Medina. His final dying whispers urged: 'Guard prayer, and care for those under your guardianship.' He left behind no palaces, silver, gold, or dynasty—only the Quran, his lived example, and an unshakeable ethical tradition.",
    fullNarrativeAr: `في أواخر صفر وأوائل ربيع الأول من العام الحادي عشر للهجرة، اشتد المرض على رسول الله ﷺ. ولما شعر بدنو أجله، خرج إلى المسجد متكئاً على الفضل بن العباس وعلي بن أبي طالب، وخطب في الناس قائلاً: «من كنت جلدتُ له ظهراً فهذا ظهري فليستقد منه، ومن كنت أخذتُ له مالاً فهذا مالي فليأخذ منه». أراد أن يلقى ربه وليس لأحد من رعيته عنده مظلمة قيد شعرة.

وفي بيته، كانت أنفاسه الأخيرة تهمس بالوصية بالصلاة وبالضعفاء، ثم شخص بصره إلى سقف الغرفة وقال كلماته الأخيرة: «بل الرفيق الأعلى، بل الرفيق الأعلى».

وعندما توفي، صُدم المسلمون ولم يصدق عمر بن الخطاب من هول الفاجعة، فوقف أبو بكر الصديق رضي الله عنه معلناً الحقيقة الخالدة التي رسخت أن الإسلام دين إلهي لا يتمحور حول عبادة الأشخاص: «ألا مَن كان يعبد محمداً فإن محمداً قد مات، ومَن كان يعبد الله فإن الله حيٌّ لا يموت»، ثم تلا قول الله تعالى: ﴿وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ قَدْ خَلَتْ مِن قَبْلِهِ الرُّسُلُ ۚ أَفَإِن مَّاتَ أَوْ قُتِلَ انقَلَبْتُمْ عَلَىٰ أَعْقَابِكُمْ﴾.`,
    fullNarrativeEn: `In June 632 CE, fever overtook Muhammad. Realizing his life was ending, he walked supported to the mosque, publicly offering restitution: 'If I have struck anyone's back, here is my back; take retribution. If I have taken anyone's property, here is my property; take from it.'

His dying breaths whispered concern for spiritual discipline and societal vulnerable: 'Prayer, and those your right hands possess.' Looking upward, he uttered his final phrase: 'Rather, the Highest Companion.'

Grief overwhelmed the community. Abu Bakr restored composure with his immortal statement, establishing that Islam is not a personality cult: 'Whoever worshipped Muhammad, know that Muhammad has died. But whoever worships God, God is Living and never dies.' He then recited: 'Muhammad is no more than a messenger; other messengers have passed away before him. If he dies or is killed, will you turn back on your heels?'`,
    historicalContextAr: "حجرة عائشة رضي الله عنها، المسجد النبوي، المدينة المنورة، 12 ربيع الأول 11 هـ.",
    coreEvidence: [
      {
        source: "صحيح البخاري",
        compilerOrWork: "صحيح البخاري — كتاب الجنائز ومغازي رسول الله",
        textAr: "«فحمد الله أبو بكر وأثنى عليه وقال: ألا من كان يعبد محمداً ﷺ فإن محمداً قد مات، ومن كان يعبد الله فإن الله حي لا يموت».",
        textEn: "Abu Bakr praised Allah and said: 'Behold! Whosoever worshipped Muhammad, Muhammad is dead. But whosoever worships Allah, Allah is alive and never dies.'",
        reference: "رقم 1241 و 4454",
        status: "verified",
      },
    ],
    quranConnections: [
      {
        surahNameAr: "آل عمران",
        surahNumber: 3,
        ayahNumber: 144,
        textAr: "وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ قَدْ خَلَتْ مِن قَبْلِهِ الرُّسُلُ ۚ أَفَإِن مَّاتَ أَوْ قُتِلَ انقَلَبْتُمْ عَلَىٰ أَعْقَابِكُمْ",
        translationEn: "Muhammad is no more than a messenger; messengers have passed away before him. If he dies or is killed, will you turn back on your heels?",
      },
    ],
    valuesHighlighted: ["الخضوع للمساءلة والمحاسبة", "نبذ تقديس الأشخاص", "استمرار المبدأ والرسالة"],
  },
  {
    id: "legacy-and-primary-evidence",
    order: 12,
    titleAr: "ماذا ترك بعده؟ واقرأ المصادر بنفسك",
    titleEn: "What Remained After Him? Read the Evidence Yourself",
    subtitleAr: "أثر حضاري خالد، ودعوة مفتوحة لكل باحث لمراجعة المصادر الأصلية دون وساطة",
    subtitleEn: "An enduring moral civilization and an open invitation to inspect primary source records directly",
    summaryAr: "لم يترك النبي ﷺ مالاً ولا سلاسل نسب للملك، بل ترك قرآناً محفوظاً بحروفه ونقطه، وسيرة دقيقة دوّن فيها المحدثون كل كلمة وحركة وسكنة، داعياً العقل البشري للتدبر الحر.",
    summaryEn: "Muhammad left no monetary inheritance, palaces, or dynasty. He left the meticulously preserved Quran and a comprehensive biographical tradition recording his public and private conduct, inviting every seeker to verify the primary records independently.",
    fullNarrativeAr: `حين توفي النبي ﷺ، لم يترك وراءه ديناراً ولا درهماً ولا شاة ولا بعيراً، إلا بغلته البيضاء وسلاحه وأرضاً جعلها صدقة للمسلمين.

أما الإرث الحقيقي الذي تركه فهو:
1. القرآن الكريم: محفوظاً نصاً ولفظاً كما نزل، يقرؤه اليوم أكثر من مليار ونصف إنسان بنفس الكلمات التي تلاها هو ﷺ في مكة والمدينة.
2. السنة النبوية المطهرة: أعظم سجل تاريخي موثق لحياة إنسان، نقله آلاف الرواة بأسماء محددة خضعت لعلم الجرح والتعديل الصارم.
3. حضارة عالمية: امتدت من المحيط الأطلسي إلى حدود الصين، قامت على العلم والمستشفيات والجامعات والتسامح مع أهل الأديان الأخرى.

ندعوك في هذا الصرح الرقمي، سواء كنت مسلماً أو باحثاً أو قارئاً فضولياً، ألا تكتفي بما تسمعه، بل ادخل معنا إلى «خزانة المصادر»، واقرأ الأحاديث، وتفحص نصوص السيرة، وعش مع رحلة أعظم وأرحم إنسان مشى على الأرض ﷺ.`,
    fullNarrativeEn: `At his death, Muhammad owned neither a coin nor a flock; he left only his white mule, personal armor, and a plot of land deeded as a public charitable trust.

His true legacy comprises:
1. The Holy Quran: Preserved verbatim across centuries without alteration.
2. The Sunnah and Hadith: The most comprehensively documented biographical record of any ancient figure, scrutinized by rigorous chains of transmission (isnad).
3. A transformative civilization: Catalyzing scientific inquiry, public hospitals, universities, and religious coexistence.

We invite you—Muslim or non-Muslim, believer, skeptic, or student of history—to explore our Source Registry, examine the authenticated narrations, and witness for yourself the authentic life of Muhammad ibn Abdullah ﷺ.`,
    historicalContextAr: "العالم الإسلامي والإنساني من القرن السابع الميلادي حتى عصرنا الحاضر.",
    coreEvidence: [
      {
        source: "صحيح البخاري",
        compilerOrWork: "صحيح البخاري — كتاب الوصايا",
        textAr: "«ما ترك رسول الله ﷺ عند موته درهماً ولا ديناراً ولا عبداً ولا أمة ولا شيئاً إلا بغلته البيضاء وسلاحه وأرضاً جعلها صدقة».",
        textEn: "At his death, the Messenger of Allah did not leave behind a single dirham, dinar, enslaved man, enslaved woman, or anything else except his white mule, his weapons, and a piece of land which he declared as a charitable trust.",
        reference: "رقم 2739",
        status: "verified",
      },
    ],
    valuesHighlighted: ["النزاهة والزهد", "الشفافية العلمية", "البحث المباشر في المصادر"],
  },
];

// خدمة الذكاء الاصطناعي الإسلامي المتقدمة مع Phi-3 Mini
export interface IslamicKnowledgeEntry {
  id: string;
  type: "quran" | "hadith" | "seerah" | "fiqh" | "aqidah" | "akhlaq" | "tafsir";
  category: string;
  question: string;
  answer: string;
  source: string;
  authenticity?: "sahih" | "hasan" | "daif" | "mawdu";
  keywords: string[];
  embeddings?: number[];
  metadata: {
    scholar?: string;
    book?: string;
    chapter?: string;
    verse?: string;
    narrator?: string;
    grade?: string;
  };
}

export interface AIResponse {
  answer: string;
  sources: IslamicKnowledgeEntry[];
  confidence: number;
  type: "direct" | "inference" | "general";
  warnings?: string[];
  followUpQuestions?: string[];
}

export interface TrainingData {
  instruction: string;
  input?: string;
  output: string;
  category: string;
  source: string;
}

export class IslamicAIService {
  private static instance: IslamicAIService;
  private knowledgeBase: Map<string, IslamicKnowledgeEntry> = new Map();
  private vectorStore: Map<string, number[]> = new Map();
  private modelEndpoint: string = "";
  private isModelLoaded: boolean = false;

  private constructor() {
    this.initializeKnowledgeBase();
  }

  public static getInstance(): IslamicAIService {
    if (!IslamicAIService.instance) {
      IslamicAIService.instance = new IslamicAIService();
    }
    return IslamicAIService.instance;
  }

  private async initializeKnowledgeBase(): Promise<void> {
    try {
      // تحميل قاعدة المعرفة الإسلامية من الملفات المحلية أو API
      const knowledgeData = await this.loadIslamicKnowledge();

      knowledgeData.forEach((entry) => {
        this.knowledgeBase.set(entry.id, entry);
      });

      console.log(
        `📚 تم تحميل ${knowledgeData.length} مدخل في قاعدة المعرفة الإسلامية`,
      );

      // إنشاء الـ embeddings للبحث الدلالي
      await this.generateEmbeddings();
    } catch (error) {
      console.error("خطأ في تحميل قاعدة المعرفة:", error);
    }
  }

  private async loadIslamicKnowledge(): Promise<IslamicKnowledgeEntry[]> {
    // قاعدة بيانات شاملة للمعرفة الإسلامية
    return [
      // القرآن الكريم والتفسير
      {
        id: "quran-1",
        type: "quran",
        category: "تفسير",
        question: 'ما تفسير قوله تعالى "واذكر ربك إذا نسيت"؟',
        answer:
          "قال ابن كثير رحمه الله: أي اذكره عند النسيان، فإن ذكر الله سبب لتذكر ما فات من العلم والعمل. وقال القرطبي: هذا أمر بالذكر عند النسيان، وهو من أعظم الأدوية للقلب.",
        source: "تفسير ابن كثير وتفسير القرطبي",
        keywords: ["ذكر", "نسيان", "ابن كثير", "القرطبي", "تفسير"],
        metadata: {
          scholar: "ابن كثير، القرطبي",
          book: "تفسير القرآن العظيم، الجامع لأحكام القرآن",
          verse: "الكهف:24",
        },
      },
      {
        id: "quran-2",
        type: "quran",
        category: "تفسير",
        question: 'ما معنى "الم" في بداية سورة البقرة؟',
        answer:
          "الحروف المقطعة في أوائل السور من المتشابه الذي لا يعلم تأويله إلا الله. وقيل: هي أسماء للقرآن، وقيل: هي للتنبيه على إعجاز القرآن، فهو مؤلف من هذه الحروف التي يعرفها العرب ولكنهم عاجزون عن الإتيان بمثله.",
        source: "تفسير ابن كثير وتفسير الطبري",
        keywords: ["الم", "حروف مقطعة", "متشابه", "إعجاز", "البقرة"],
        metadata: {
          scholar: "ابن كثير، الطبري",
          verse: "البقرة:1",
        },
      },

      // الحديث الشريف
      {
        id: "hadith-1",
        type: "hadith",
        category: "عبادة",
        question: "ما فضل قراءة آية الكرسي؟",
        answer:
          'عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: "من قرأ آية الكرسي دبر كل صلاة مكتوبة لم يمنعه من دخول الجنة إلا أن يموت". وفي رواية أخرى: "من قرأها عند نومه لم يزل عليه من الله حافظ ولا يقربه شيطان حتى يصبح".',
        source: "صحيح البخاري ومسلم",
        authenticity: "sahih",
        keywords: ["آية الكرسي", "فضل", "صلاة", "جنة", "حافظ"],
        metadata: {
          narrator: "أبو هريرة",
          book: "صحيح البخاري",
          grade: "صحيح",
        },
      },
      {
        id: "hadith-2",
        type: "hadith",
        category: "أخلاق",
        question: "ما حكم الصدق في الإسلام؟",
        answer:
          'عن عبد الله بن مسعود رضي الله عنه قال: قال رسول الله ﷺ: "إن الصدق يهدي إلى البر، وإن البر يهدي إلى الجنة، وإن الرجل ليصدق حتى يكتب عند الله صديقا. وإن الكذب يهدي إلى الفجور، وإن الفجور يهدي إلى النار، وإن الرجل ليكذب حتى يكتب عند الله كذابا".',
        source: "صحيح البخاري ومسلم",
        authenticity: "sahih",
        keywords: ["صدق", "كذب", "بر", "جنة", "أخلاق"],
        metadata: {
          narrator: "عبد الله بن مسعود",
          book: "صحيح البخاري ومسلم",
          grade: "متفق عليه",
        },
      },

      // السيرة النبوية
      {
        id: "seerah-1",
        type: "seerah",
        category: "غزوات",
        question: "ما أهم دروس غزوة بدر؟",
        answer:
          "غزوة بدر الكبرى (17 رمضان 2 هـ) كانت أول انتصار حاسم للمسلمين. من أهم دروسها: 1) أهمية الشورى - استشار النبي ﷺ أصحابه 2) التوكل على الله مع الأخذ بالأسباب 3) النصر من عند الله وليس بالعدد والعدة 4) أهمية الوحدة والطاعة 5) العدل حتى مع الأعداء في توزيع الغنائم.",
        source: "سيرة ابن هشام والطبري",
        keywords: ["بدر", "غزوة", "شورى", "توكل", "نصر"],
        metadata: {
          scholar: "ابن هشام، الطبري",
          book: "السيرة النبوية",
        },
      },

      // الفقه الإسلامي
      {
        id: "fiqh-1",
        type: "fiqh",
        category: "طهارة",
        question: "ما شروط الوضوء؟",
        answer:
          "شروط صحة الوضوء: 1) النية 2) استعمال الماء الطهور 3) إزالة ما يمنع وصول الماء للبشرة 4) دخول الوقت للحدث الدائم 5) الإسلام والعقل والتمييز. وفروضه: غسل الوجه، واليدين إلى المرفقين، ومسح الرأس، وغسل الرجلين إلى الكعبين، والترتيب والموالاة.",
        source: "الفقه الإسلامي وأدلته",
        keywords: ["وضوء", "طهارة", "شروط", "فروض", "فقه"],
        metadata: {
          scholar: "وهبة الزحيلي",
          book: "الفقه الإسلامي وأدلته",
        },
      },

      // العقيدة الإسلامية
      {
        id: "aqidah-1",
        type: "aqidah",
        category: "توحيد",
        question: "ما أقسام التوحيد؟",
        answer:
          "التوحيد ينقسم إلى ثلاثة أقسام: 1) توحيد الربوبية: الإيمان بأن الله وحده هو الرب الخالق الرازق المدبر لأمور الكون 2) توحيد الألوهية: إفراد الله بالعبادة فلا يعبد معه غيره 3) توحيد الأسماء والصفات: إثبات ما أثبته الله لنفسه من الأسماء والصفات بلا تحريف ولا تعطيل ولا تكييف ولا تمثيل.",
        source: "كتب العقيدة السلفية",
        keywords: ["توحيد", "ربوبية", "ألوهية", "أسماء", "صفات"],
        metadata: {
          scholar: "ابن تيمية، ابن القيم",
          book: "مجموع الفتاوى",
        },
      },
    ];
  }

  private async generateEmbeddings(): Promise<void> {
    // في بيئة الإنتاج، هنا سنستخدم نموذج embedding محلي
    // الآن سنحاكي الـ embeddings
    for (const [id, entry] of this.knowledgeBase) {
      const embedding = this.createSimpleEmbedding(
        entry.question + " " + entry.answer,
      );
      this.vectorStore.set(id, embedding);
    }
  }

  private createSimpleEmbedding(text: string): number[] {
    // محاكاة بسيطة للـ embeddings - في الإنتاج سنستخدم نموذج حقيقي
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(384).fill(0); // حجم شائع للـ embeddings

    words.forEach((word, index) => {
      const hash = this.simpleHash(word);
      embedding[hash % 384] = Math.sin(hash) * 0.1;
    });

    return embedding;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private calculateSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  public async searchKnowledge(
    query: string,
    limit: number = 5,
  ): Promise<IslamicKnowledgeEntry[]> {
    const queryEmbedding = this.createSimpleEmbedding(query);
    const similarities: Array<{ id: string; similarity: number }> = [];

    // حساب التشابه مع جميع المدخلات
    for (const [id, embedding] of this.vectorStore) {
      const similarity = this.calculateSimilarity(queryEmbedding, embedding);
      similarities.push({ id, similarity });
    }

    // ترتيب حسب التشابه
    similarities.sort((a, b) => b.similarity - a.similarity);

    // إرجاع أفضل النتائج
    return similarities
      .slice(0, limit)
      .map((item) => this.knowledgeBase.get(item.id)!)
      .filter(Boolean);
  }

  public async generateResponse(
    question: string,
    context?: string,
  ): Promise<AIResponse> {
    try {
      // البحث في قاعدة المعرفة
      const relevantEntries = await this.searchKnowledge(question, 3);

      // بناء السياق للنموذج
      const contextText = relevantEntries
        .map(
          (entry) =>
            `${entry.question}\n${entry.answer}\nالمصدر: ${entry.source}`,
        )
        .join("\n\n");

      // في بيئة الإنتاج، هنا سنرسل للنموذج الحقيقي
      const response = await this.callPhiModel(question, contextText);
      const baseWarnings = this.generateWarnings(question, relevantEntries);

      return {
        answer: response.answer,
        sources: relevantEntries,
        confidence: response.confidence,
        type: "general",
        warnings: [
          "المزود الخادمي المعتمد غير مهيأ في شريحة الأساس؛ لا توجد إجابة مولدة موثقة.",
          ...baseWarnings,
        ],
        followUpQuestions: this.generateFollowUpQuestions(
          question,
          relevantEntries,
        ),
      };
    } catch (error) {
      console.error("خطأ في توليد الإجابة:", error);
      throw new Error("حدث خطأ في النظام. حاول مرة أخرى.");
    }
  }

  private async callPhiModel(
    _question: string,
    _context: string,
  ): Promise<{ answer: string; confidence: number }> {
    // Foundation gate: no local model endpoint and no approved server-side
    // cited provider exist in this slice. Never return a simulated answer
    // as if it were generated knowledge.
    return {
      answer:
        "خدمة الإجابة المعرفية غير متاحة في شريحة الأساس: لا يوجد مزود خادمي معتمد مع إسناد قابل للتتبع ومراجعة تحريرية. المعروض أدناه فهرس قاعدة المعرفة المحلية فقط.",
      confidence: 0,
    };
  }

  private buildIslamicPrompt(question: string, context: string): string {
    return `أنت مساعد ذكي متخصص في الشريعة الإسلامية والعلوم الشرعية. أجب على الأسئلة بدقة وأمانة علمية.

القواعد المهمة:
1. اعتمد على المصادر الموثوقة فقط (القرآن، السنة الصحيحة، أقوال العلماء المعتبرين)
2. اذكر المصدر لكل معلومة
3. إذا لم تكن متأكداً، قل "الله أعلم" أو "يحتاج لمراجعة أهل العلم"
4. تجنب الفتوى في المسائل الخلافية المعقدة
5. أشر للاختلافات العلمية عند وجودها

السياق المتاح:
${context}

السؤال: ${question}

الإجابة:`;
  }

  /**
   * @deprecated Foundation gate: retained for reference only. It is no longer
   * routed from any active response path (callPhiModel is blocked).
   */
  private generateMockResponse(question: string, context: string): string {
    // محاكاة إجابات ذكية حسب نوع السؤال
    const questionLower = question.toLowerCase();

    if (questionLower.includes("صلاة") || questionLower.includes("صوم")) {
      return `بناءً على المصادر الشرعية الموثوقة، ${this.extractMainPoint(context)}. 

وقد ورد في الحديث الشريف ما يؤكد هذا المعنى، والله أعلم.

ننصح بمراجعة أهل العلم المختصين للتفصيل أكثر في هذه المسألة.`;
    }

    if (questionLower.includes("تفسير") || questionLower.includes("آية")) {
      return `في تفسير هذه الآية الكريمة، ${this.extractMainPoint(context)}.

قال المفسرون: هذا المعنى يتضح من خلال السياق القرآني والسنة النبوية المطهرة.

والله تعالى أعلم بمراده من كلامه.`;
    }

    return `${this.extractMainPoint(context)}

هذا ما يظهر من المصادر المتاحة، والله أعلم. لمزيد من التفصيل، يُنصح بمراجعة المصادر الأصلية وأهل الاختصاص.`;
  }

  private extractMainPoint(context: string): string {
    if (!context)
      return "لم تتوفر معلومات كافية في قاعدة البيانات حول هذا الموضوع";

    const sentences = context.split(".").filter((s) => s.length > 20);
    return sentences[0] || context.substring(0, 200) + "...";
  }

  private generateWarnings(
    question: string,
    entries: IslamicKnowledgeEntry[],
  ): string[] {
    const warnings: string[] = [];

    if (entries.length === 0) {
      warnings.push("لم توجد مصادر مباشرة لهذا السؤال في قاعدة البيانات");
    }

    if (question.includes("حرام") || question.includes("حلال")) {
      warnings.push(
        "هذا السؤال يتعلق بالحكم الشرعي، يُنصح بمراجعة أهل العلم المختصين",
      );
    }

    if (question.includes("فتوى") || question.includes("حكم")) {
      warnings.push("الفتوى تحتاج لفهم الواقع والظروف، راجع مفتي معتمد");
    }

    return warnings;
  }

  private generateFollowUpQuestions(
    question: string,
    entries: IslamicKnowledgeEntry[],
  ): string[] {
    const questions: string[] = [];

    if (entries.length > 0) {
      const categories = [...new Set(entries.map((e) => e.category))];

      if (categories.includes("تفسير")) {
        questions.push("هل تريد معرفة المزيد عن سياق نزول الآية؟");
      }

      if (categories.includes("عبادة")) {
        questions.push("ما الحكمة من هذ�� العبادة؟");
      }

      if (categories.includes("أخلاق")) {
        questions.push("كيف يمكن تطبيق هذا في الحياة العملية؟");
      }
    }

    questions.push("هل تريد أمثلة عملية؟");
    questions.push("هل لديك سؤال متعلق؟");

    return questions.slice(0, 3);
  }

  // إعداد نموذج التدريب
  public generateTrainingData(): TrainingData[] {
    const trainingData: TrainingData[] = [];

    for (const entry of this.knowledgeBase.values()) {
      trainingData.push({
        instruction:
          "أجب على السؤال التالي بناءً على المصادر الإسلامية الموثوقة:",
        input: entry.question,
        output: `${entry.answer}\n\nالمصدر: ${entry.source}`,
        category: entry.category,
        source: entry.source,
      });
    }

    return trainingData;
  }

  // تحديث قاعدة المعرفة
  public async addKnowledgeEntry(entry: IslamicKnowledgeEntry): Promise<void> {
    this.knowledgeBase.set(entry.id, entry);
    const embedding = this.createSimpleEmbedding(
      entry.question + " " + entry.answer,
    );
    this.vectorStore.set(entry.id, embedding);
  }

  // إحصائيات النظام
  public getSystemStats(): any {
    const typeDistribution: Record<string, number> = {};
    const categoryDistribution: Record<string, number> = {};

    for (const entry of this.knowledgeBase.values()) {
      typeDistribution[entry.type] = (typeDistribution[entry.type] || 0) + 1;
      categoryDistribution[entry.category] =
        (categoryDistribution[entry.category] || 0) + 1;
    }

    return {
      totalEntries: this.knowledgeBase.size,
      typeDistribution,
      categoryDistribution,
      vectorStoreSize: this.vectorStore.size,
      isModelLoaded: this.isModelLoaded,
    };
  }

  // تصدير البيانات للتدريب
  public exportForTraining(format: "json" | "alpaca" = "json"): string {
    const trainingData = this.generateTrainingData();

    if (format === "alpaca") {
      return trainingData
        .map((item) => ({
          instruction: item.instruction,
          input: item.input,
          output: item.output,
        }))
        .map((item) => JSON.stringify(item))
        .join("\n");
    }

    return JSON.stringify(trainingData, null, 2);
  }
}

// تصدير instance واحد
export const islamicAI = IslamicAIService.getInstance();

// Hook للاستخدام في المكونات
export function useIslamicAI() {
  return {
    searchKnowledge: (query: string, limit?: number) =>
      islamicAI.searchKnowledge(query, limit),
    generateResponse: (question: string, context?: string) =>
      islamicAI.generateResponse(question, context),
    getStats: () => islamicAI.getSystemStats(),
    addKnowledge: (entry: IslamicKnowledgeEntry) =>
      islamicAI.addKnowledgeEntry(entry),
    exportTrainingData: (format?: "json" | "alpaca") =>
      islamicAI.exportForTraining(format),
  };
}

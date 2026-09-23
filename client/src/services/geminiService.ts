interface GeminiResponse {
  response: string;
  error?: string;
}

class GeminiService {
  async askQuestion(
    _question: string,
    _context = "Islamic",
  ): Promise<GeminiResponse> {
    // Deliberately disabled until a server-side proxy, citation contract and
    // editorial review path exist. Client-side provider keys would be exposed
    // in the browser bundle and an uncited answer must not masquerade as a
    // scholarly response.
    return {
      response:
        "خدمة المساعد الذكي غير متاحة حاليًا. يلزم قبل تشغيلها وسيط خادمي آمن، وإسناد قابل للتتبع، ومسار مراجعة تحريرية.",
      error: "AI provider is not configured through an approved server adapter",
    };
  }

  async generateTafsir(verse: string): Promise<GeminiResponse> {
    const question = `فسر لي هذه الآية الكريمة: "${verse}" مع ذكر سبب النزول إن أمكن وتفسير مبسط للمعنى.`;
    return this.askQuestion(question, "Tafsir");
  }

  async generateSeerahContent(topic: string): Promise<GeminiResponse> {
    const question = `أخبرني عن ${topic} في السيرة النبوية الشريفة بشكل مفصل ومناسب للمسلمين.`;
    return this.askQuestion(question, "Seerah");
  }
}

export const geminiService = new GeminiService();

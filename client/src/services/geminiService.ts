interface GeminiResponse {
  response: string;
  error?: string;
}

class GeminiService {
  private apiKey: string;
  private baseUrl =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  constructor() {
    // In production, this should come from a backend proxy
    this.apiKey = this.getApiKey();

    if (!this.apiKey) {
      console.warn("Gemini API key not found. AI features will be limited.");
    }
  }

  private getApiKey(): string {
    // Safe way to get environment variables in browser
    try {
      return import.meta.env.VITE_GEMINI_API_KEY || "";
    } catch (error) {
      console.warn("Could not access environment variables:", error);
      return "";
    }
  }

  async askQuestion(
    question: string,
    context = "Islamic",
  ): Promise<GeminiResponse> {
    if (!this.apiKey) {
      return {
        response:
          "عذراً، خدمة المساعد الذكي غير متوفرة حالياً. يرجى المحاولة لاحقاً.",
        error: "API key not configured",
      };
    }

    try {
      const prompt = `
        أنت مساعد إسلامي ذكي متخصص في الإجابة على الأسئلة الإسلامية بناءً على القرآن الكريم والسنة النبوية الشريفة.
        يرجى الإجابة باللغة العربية بطريقة واضحة ومفهومة، مع ذكر المصادر عند الإمكان.

        السؤال: ${question}

        يرجى تقديم إجابة دقيقة وموثوقة.
      `;

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        return {
          response: data.candidates[0].content.parts[0].text,
        };
      } else {
        throw new Error("Invalid response format from Gemini API");
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return {
        response: "عذراً، حدث خطأ أثناء معالجة سؤالك. يرجى المحاولة مرة أخرى.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
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

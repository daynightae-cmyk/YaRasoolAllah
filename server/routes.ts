import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertUserSchema,
  insertProgressSchema,
  insertBookmarkSchema,
  insertPrayerTimesSchema,
} from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || "al-kitab-al-mubeen-secret-key";

// Simple authentication middleware for demo
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Simple token validation for demo - in production use proper JWT verification
  if (token === 'demo-token') {
    req.user = { userId: 1, username: 'demo' };
    next();
  } else {
    res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = "demo-token"; // Simple demo token
      const { password: _, ...userResponse } = user;
      res.json({ token, user: userResponse });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // User profile routes
  app.get("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/user/profile", authenticateToken, async (req: any, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.user.userId, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Progress tracking routes
  app.get("/api/progress", authenticateToken, async (req: any, res) => {
    try {
      const progress = await storage.getUserProgress(req.user.userId);
      res.json(progress);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/progress", authenticateToken, async (req: any, res) => {
    try {
      const progressData = insertProgressSchema.parse({
        ...req.body,
        userId: req.user.userId
      });

      const existing = await storage.getProgress(
        req.user.userId,
        progressData.contentType,
        progressData.contentId
      );

      if (existing) {
        const updated = await storage.updateProgress(existing.id, progressData);
        return res.json(updated);
      }

      const progress = await storage.createProgress(progressData);
      res.status(201).json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Bookmarks routes
  app.get("/api/bookmarks", authenticateToken, async (req: any, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.user.userId);
      res.json(bookmarks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/bookmarks", authenticateToken, async (req: any, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        userId: req.user.userId
      });

      const bookmark = await storage.createBookmark(bookmarkData);
      res.status(201).json(bookmark);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/bookmarks/:id", authenticateToken, async (req: any, res) => {
    try {
      const deleted = await storage.deleteBookmark(
        parseInt(req.params.id),
        req.user.userId
      );
      
      if (!deleted) {
        return res.status(404).json({ message: "Bookmark not found" });
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Prayer settings routes
  app.get("/api/prayer-settings", authenticateToken, async (req: any, res) => {
    try {
      const settings = await storage.getPrayerSettings(req.user.userId);
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/prayer-settings", authenticateToken, async (req: any, res) => {
    try {
      const settingsData = insertPrayerTimesSchema.parse({
        ...req.body,
        userId: req.user.userId
      });

      const existing = await storage.getPrayerSettings(req.user.userId);
      if (existing) {
        const updated = await storage.updatePrayerSettings(req.user.userId, settingsData);
        return res.json(updated);
      }

      const settings = await storage.createPrayerSettings(settingsData);
      res.status(201).json(settings);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Islamic content routes
  app.get("/api/quran/surahs", (req, res) => {
    const surahs = [
      { id: 1, name: "الفاتحة", nameTranslated: "Al-Fatiha", verses: 7, revelation: "meccan" },
      { id: 2, name: "البقرة", nameTranslated: "Al-Baqarah", verses: 286, revelation: "medinan" },
      { id: 3, name: "آل عمران", nameTranslated: "Aal-E-Imran", verses: 200, revelation: "medinan" },
      { id: 4, name: "النساء", nameTranslated: "An-Nisa", verses: 176, revelation: "medinan" },
      { id: 5, name: "المائدة", nameTranslated: "Al-Maida", verses: 120, revelation: "medinan" },
      { id: 6, name: "الأنعام", nameTranslated: "Al-An'am", verses: 165, revelation: "meccan" },
      { id: 7, name: "الأعراف", nameTranslated: "Al-A'raf", verses: 206, revelation: "meccan" },
      { id: 8, name: "الأنفال", nameTranslated: "Al-Anfal", verses: 75, revelation: "medinan" },
      { id: 9, name: "التوبة", nameTranslated: "At-Tawbah", verses: 129, revelation: "medinan" },
      { id: 10, name: "يونس", nameTranslated: "Yunus", verses: 109, revelation: "meccan" }
    ];
    res.json(surahs);
  });

  app.get("/api/quran/verses/:surahId", (req, res) => {
    const { surahId } = req.params;
    // Sample verses from Al-Fatiha for demonstration
    if (surahId === "1") {
      const verses = [
        {
          id: 1,
          number: 1,
          arabicText: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
          translationEn: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
          translationFr: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.",
          translationUr: "اللہ کے نام سے جو بہت مہربان، نہایت رحم والا ہے۔"
        },
        {
          id: 2,
          number: 2,
          arabicText: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
          translationEn: "[All] praise is [due] to Allah, Lord of the worlds -",
          translationFr: "Louange à Allah, Seigneur de l'univers.",
          translationUr: "تمام تعریفیں اللہ کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے۔"
        }
      ];
      res.json(verses);
    } else {
      res.json([]);
    }
  });

  app.get("/api/seerah/topics", (req, res) => {
    const topics = [
      {
        id: "birth",
        title: "ولادة النبي ﷺ",
        titleEn: "Birth of the Prophet ﷺ",
        titleFr: "Naissance du Prophète ﷺ",
        titleUr: "نبی ﷺ کی ولادت",
        description: "ولادة خاتم الأنبياء والمرسلين في مكة المكرمة",
        category: "early_life",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
      },
      {
        id: "hijra",
        title: "الهجرة النبوية",
        titleEn: "The Prophet's Migration",
        titleFr: "L'Hégire du Prophète",
        titleUr: "نبوی ہجرت",
        description: "هجرة النبي ﷺ من مكة إلى المدينة المنورة",
        category: "hijra",
        imageUrl: "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=800"
      },
      {
        id: "first_revelation",
        title: "نزول الوحي",
        titleEn: "First Revelation",
        titleFr: "Première Révélation",
        titleUr: "پہلی وحی",
        description: "نزول الوحي الأول في غار حراء",
        category: "prophethood",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
      }
    ];
    res.json(topics);
  });

  app.get("/api/prayer-times/:city", async (req, res) => {
    try {
      const { city } = req.params;
      const date = new Date().toISOString().split('T')[0];
      
      // Sample prayer times - in production this would use a real API
      const times = {
        fajr: "05:30",
        sunrise: "06:45",
        dhuhr: "12:15",
        asr: "15:30",
        maghrib: "18:20",
        isha: "19:45"
      };

      res.json({
        city,
        date,
        times
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Assistant route
  app.post("/api/ai/ask", authenticateToken, async (req: any, res) => {
    try {
      const { question } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }

      // This would integrate with Google Gemini API in production
      const response = {
        question,
        answer: `بناءً على سؤالك: "${question}"

هذا مثال على إجابة من المساعد الإسلامي الذكي. في الإنتاج الفعلي، سيتم استخدام API خدمة Google Gemini للحصول على إجابات دقيقة ومفصلة من المصادر الإسلامية الموثوقة.

المصادر المعتمدة:
- القرآن الكريم
- السنة النبوية الصحيحة
- أقوال العلماء المعتبرين

يرجى ملاحظة أن هذه إجابة تجريبية. للحصول على إجابات دقيقة، يُنصح بمراجعة العلماء المختصين.`,
        sources: ["القرآن الكريم", "السنة النبوية", "أقوال العلماء"],
        timestamp: new Date().toISOString()
      };

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Daily reminders and Azkar
  app.get("/api/azkar/:category", (req, res) => {
    const { category } = req.params;
    
    const azkarData = {
      morning: [
        {
          id: "morning-1",
          arabicText: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
          transliteration: "Asbahnaa wa asbahal-mulku lillah, walhamdu lillah",
          translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah",
          repetitions: 1,
          source: "مسلم",
          benefits: "حماية وبركة في بداية اليوم"
        }
      ],
      evening: [
        {
          id: "evening-1",
          arabicText: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
          transliteration: "Amsaynaa wa amsal-mulku lillah, walhamdu lillah",
          translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah",
          repetitions: 1,
          source: "مسلم",
          benefits: "حماية وطمأنينة في نهاية اليوم"
        }
      ],
      general: [
        {
          id: "general-1",
          arabicText: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
          transliteration: "Subhanallahi wa bihamdihi",
          translation: "Glory is to Allah and praise is to Him",
          repetitions: 100,
          source: "البخاري ومسلم",
          benefits: "محو الذنوب وزيادة الحسنات"
        }
      ]
    };

    res.json(azkarData[category as keyof typeof azkarData] || []);
  });

  // Islamic calendar
  app.get("/api/calendar/events", (req, res) => {
    const events = [
      {
        id: "ramadan-2024",
        title: "شهر رمضان المبارك",
        titleEn: "Holy Month of Ramadan",
        date: "2024-03-11",
        type: "religious",
        description: "بداية شهر رمضان المبارك - شهر الصيام والقيام"
      },
      {
        id: "eid-fitr-2024",
        title: "عيد الفطر المبارك",
        titleEn: "Eid Al-Fitr",
        date: "2024-04-10",
        type: "celebration",
        description: "عيد الفطر المبارك - نهاية شهر رمضان"
      },
      {
        id: "hajj-2024",
        title: "موسم الحج",
        titleEn: "Hajj Season",
        date: "2024-06-15",
        type: "pilgrimage",
        description: "موسم الحج إلى بيت الله الحرام"
      }
    ];
    res.json(events);
  });

  // Children's content
  app.get("/api/children/stories", (req, res) => {
    const stories = [
      {
        id: "kindness-story",
        title: "قصة الرفق بالحيوان",
        titleEn: "Story of Kindness to Animals",
        description: "تعليم الأطفال الرحمة والرفق بالحيوانات",
        ageGroup: "5-10",
        lesson: "الرفق والرحمة",
        imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800"
      },
      {
        id: "honesty-story",
        title: "قصة الصدق",
        titleEn: "Story of Honesty",
        description: "أهمية الصدق في حياة المسلم",
        ageGroup: "6-12",
        lesson: "الصدق والأمانة",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800"
      }
    ];
    res.json(stories);
  });

  const httpServer = createServer(app);
  return httpServer;
}

import type { Express, Request, Response } from "express";
import { z } from "zod";
import {
  insertBookmarkSchema,
  insertPrayerTimesSchema,
  insertProgressSchema,
} from "@shared/schema";
import {
  authenticateToken,
  hashPassword,
  signAccessToken,
  verifyPasswordAgainstUser,
  type AuthedRequest,
} from "./auth";
import { getPersistenceMode } from "./env";
import { registerQuarantinedDemoRoutes } from "./legacy-endpoints";
import { rateLimit } from "./rate-limit";
import { storage } from "./storage";

const registerSchema = z.object({
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(200),
  preferredLanguage: z.string().min(2).max(8).optional(),
  theme: z.string().min(2).max(16).optional(),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(200),
});

const profileUpdateSchema = z.object({
  username: z.string().trim().min(3).max(40).regex(/^[a-zA-Z0-9._-]+$/).optional(),
  preferredLanguage: z.string().min(2).max(8).optional(),
  theme: z.string().min(2).max(16).optional(),
});

const authWindow = rateLimit({ windowMs: 60_000, max: 10 });

function publicUser(user: { password?: string } & Record<string, unknown>) {
  const { password: _password, ...safe } = user;
  return safe;
}

export function registerRoutes(app: Express): void {
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      service: "ya-rasool-allah",
      persistence: getPersistenceMode(),
      auth: "jwt-hs256",
      demoEndpoints: "quarantined",
    });
  });

  app.post("/api/register", authWindow, async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      const existingEmail = await storage.getUserByEmail(userData.email);
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingEmail || existingUsername) {
        res.status(409).json({ message: "User already exists", requestId: req.requestId });
        return;
      }

      const user = await storage.createUser({
        ...userData,
        password: await hashPassword(userData.password),
      });
      const token = signAccessToken({ userId: user.id, username: user.username });
      res.status(201).json({ token, user: publicUser(user), expiresIn: 60 * 60 * 12 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid registration";
      res.status(400).json({ message, requestId: req.requestId });
    }
  });

  app.post("/api/login", authWindow, async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      const valid = await verifyPasswordAgainstUser(password, user?.password);
      if (!user || !valid) {
        res.status(401).json({ message: "Invalid credentials", requestId: req.requestId });
        return;
      }

      const token = signAccessToken({ userId: user.id, username: user.username });
      res.json({ token, user: publicUser(user), expiresIn: 60 * 60 * 12 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Invalid login";
      res.status(400).json({ message, requestId: req.requestId });
    }
  });

  app.get("/api/user/profile", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      const profile = await storage.getUser(user.userId);
      if (!profile) {
        res.status(404).json({ message: "User not found", requestId: req.requestId });
        return;
      }
      res.json(publicUser(profile));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Profile read failed";
      res.status(500).json({ message, requestId: req.requestId });
    }
  });

  app.patch("/api/user/profile", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      const updates = profileUpdateSchema.parse(req.body);
      const profile = await storage.updateUser(user.userId, updates);
      if (!profile) {
        res.status(404).json({ message: "User not found", requestId: req.requestId });
        return;
      }
      res.json(publicUser(profile));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Profile update failed";
      res.status(400).json({ message, requestId: req.requestId });
    }
  });

  app.get("/api/progress", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      res.json(await storage.getUserProgress(user.userId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Progress read failed";
      res.status(500).json({ message, requestId: req.requestId });
    }
  });

  app.post("/api/progress", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      const progressData = insertProgressSchema.parse({
        ...req.body,
        userId: user.userId,
      });

      const existing = await storage.getProgress(
        user.userId,
        progressData.contentType,
        progressData.contentId,
      );

      if (existing) {
        res.json(await storage.updateProgress(existing.id, progressData));
        return;
      }

      res.status(201).json(await storage.createProgress(progressData));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Progress write failed";
      res.status(400).json({ message, requestId: req.requestId });
    }
  });

  app.get("/api/bookmarks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      res.json(await storage.getUserBookmarks(user.userId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bookmark read failed";
      res.status(500).json({ message, requestId: req.requestId });
    }
  });

  app.post("/api/bookmarks", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      const bookmarkData = insertBookmarkSchema.parse({
        ...req.body,
        userId: user.userId,
      });
      res.status(201).json(await storage.createBookmark(bookmarkData));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bookmark write failed";
      res.status(400).json({ message, requestId: req.requestId });
    }
  });

  app.delete("/api/bookmarks/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      const id = Number.parseInt(req.params.id, 10);
      if (!Number.isInteger(id) || id < 1) {
        res.status(400).json({ message: "Invalid bookmark id", requestId: req.requestId });
        return;
      }
      const deleted = await storage.deleteBookmark(id, user.userId);
      if (!deleted) {
        res.status(404).json({ message: "Bookmark not found", requestId: req.requestId });
        return;
      }
      res.status(204).send();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Bookmark delete failed";
      res.status(400).json({ message, requestId: req.requestId });
    }
  });

  app.get("/api/prayer-settings", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      res.json(await storage.getPrayerSettings(user.userId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Prayer settings read failed";
      res.status(500).json({ message, requestId: req.requestId });
    }
  });

  app.post("/api/prayer-settings", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { user } = req as AuthedRequest;
      const settingsData = insertPrayerTimesSchema.parse({
        ...req.body,
        userId: user.userId,
      });

      const existing = await storage.getPrayerSettings(user.userId);
      if (existing) {
        res.json(await storage.updatePrayerSettings(user.userId, settingsData));
        return;
      }

      res.status(201).json(await storage.createPrayerSettings(settingsData));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Prayer settings write failed";
      res.status(400).json({ message, requestId: req.requestId });
    }
  });

  registerQuarantinedDemoRoutes(app);
}

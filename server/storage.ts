import { and, eq } from "drizzle-orm";
import {
  users,
  progress,
  bookmarks,
  prayerTimes,
  type User,
  type InsertUser,
  type Progress,
  type InsertProgress,
  type Bookmark,
  type InsertBookmark,
  type PrayerTimes,
  type InsertPrayerTimes,
} from "@shared/schema";
import { getDb } from "./db";
import { getPersistenceMode } from "./env";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  getUserProgress(userId: number): Promise<Progress[]>;
  getProgress(
    userId: number,
    contentType: string,
    contentId: string,
  ): Promise<Progress | undefined>;
  createProgress(progress: InsertProgress): Promise<Progress>;
  updateProgress(
    id: number,
    updates: Partial<InsertProgress>,
  ): Promise<Progress | undefined>;

  getUserBookmarks(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number, userId: number): Promise<boolean>;

  getPrayerSettings(userId: number): Promise<PrayerTimes | undefined>;
  createPrayerSettings(settings: InsertPrayerTimes): Promise<PrayerTimes>;
  updatePrayerSettings(
    userId: number,
    updates: Partial<InsertPrayerTimes>,
  ): Promise<PrayerTimes | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private progress: Map<number, Progress>;
  private bookmarks: Map<number, Bookmark>;
  private prayerSettings: Map<number, PrayerTimes>;
  private currentUserId: number;
  private currentProgressId: number;
  private currentBookmarkId: number;
  private currentPrayerSettingsId: number;

  constructor() {
    this.users = new Map();
    this.progress = new Map();
    this.bookmarks = new Map();
    this.prayerSettings = new Map();
    this.currentUserId = 1;
    this.currentProgressId = 1;
    this.currentBookmarkId = 1;
    this.currentPrayerSettingsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      preferredLanguage: insertUser.preferredLanguage ?? null,
      theme: insertUser.theme ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserProgress(userId: number): Promise<Progress[]> {
    return Array.from(this.progress.values()).filter((item) => item.userId === userId);
  }

  async getProgress(
    userId: number,
    contentType: string,
    contentId: string,
  ): Promise<Progress | undefined> {
    return Array.from(this.progress.values()).find(
      (item) => item.userId === userId && item.contentType === contentType && item.contentId === contentId,
    );
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const id = this.currentProgressId++;
    const progressItem: Progress = {
      ...insertProgress,
      id,
      lastAccessed: new Date(),
    };
    this.progress.set(id, progressItem);
    return progressItem;
  }

  async updateProgress(
    id: number,
    updates: Partial<InsertProgress>,
  ): Promise<Progress | undefined> {
    const progressItem = this.progress.get(id);
    if (!progressItem) return undefined;

    const updatedProgress = {
      ...progressItem,
      ...updates,
      lastAccessed: new Date(),
    };
    this.progress.set(id, updatedProgress);
    return updatedProgress;
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter((item) => item.userId === userId);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentBookmarkId++;
    const bookmark: Bookmark = {
      ...insertBookmark,
      id,
      notes: insertBookmark.notes ?? null,
      createdAt: new Date(),
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(id: number, userId: number): Promise<boolean> {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark || bookmark.userId !== userId) return false;
    return this.bookmarks.delete(id);
  }

  async getPrayerSettings(userId: number): Promise<PrayerTimes | undefined> {
    return Array.from(this.prayerSettings.values()).find((item) => item.userId === userId);
  }

  async createPrayerSettings(insertSettings: InsertPrayerTimes): Promise<PrayerTimes> {
    const id = this.currentPrayerSettingsId++;
    const settings: PrayerTimes = {
      ...insertSettings,
      id,
      notificationsEnabled: insertSettings.notificationsEnabled ?? true,
      updatedAt: new Date(),
    };
    this.prayerSettings.set(id, settings);
    return settings;
  }

  async updatePrayerSettings(
    userId: number,
    updates: Partial<InsertPrayerTimes>,
  ): Promise<PrayerTimes | undefined> {
    const settings = Array.from(this.prayerSettings.values()).find((item) => item.userId === userId);
    if (!settings) return undefined;

    const updatedSettings = { ...settings, ...updates, updatedAt: new Date() };
    this.prayerSettings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

export class PgStorage implements IStorage {
  constructor(private readonly db = getDb()) {}

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await this.db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await this.db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  async getUserProgress(userId: number): Promise<Progress[]> {
    return this.db.select().from(progress).where(eq(progress.userId, userId));
  }

  async getProgress(
    userId: number,
    contentType: string,
    contentId: string,
  ): Promise<Progress | undefined> {
    const [item] = await this.db
      .select()
      .from(progress)
      .where(
        and(
          eq(progress.userId, userId),
          eq(progress.contentType, contentType),
          eq(progress.contentId, contentId),
        ),
      )
      .limit(1);
    return item;
  }

  async createProgress(insertProgress: InsertProgress): Promise<Progress> {
    const [item] = await this.db.insert(progress).values(insertProgress).returning();
    return item;
  }

  async updateProgress(
    id: number,
    updates: Partial<InsertProgress>,
  ): Promise<Progress | undefined> {
    const [item] = await this.db
      .update(progress)
      .set({ ...updates, lastAccessed: new Date() })
      .where(eq(progress.id, id))
      .returning();
    return item;
  }

  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return this.db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const [item] = await this.db.insert(bookmarks).values(insertBookmark).returning();
    return item;
  }

  async deleteBookmark(id: number, userId: number): Promise<boolean> {
    const deleted = await this.db
      .delete(bookmarks)
      .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, userId)))
      .returning({ id: bookmarks.id });
    return deleted.length > 0;
  }

  async getPrayerSettings(userId: number): Promise<PrayerTimes | undefined> {
    const [item] = await this.db
      .select()
      .from(prayerTimes)
      .where(eq(prayerTimes.userId, userId))
      .limit(1);
    return item;
  }

  async createPrayerSettings(insertSettings: InsertPrayerTimes): Promise<PrayerTimes> {
    const [item] = await this.db.insert(prayerTimes).values(insertSettings).returning();
    return item;
  }

  async updatePrayerSettings(
    userId: number,
    updates: Partial<InsertPrayerTimes>,
  ): Promise<PrayerTimes | undefined> {
    const [item] = await this.db
      .update(prayerTimes)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(prayerTimes.userId, userId))
      .returning();
    return item;
  }
}

export function createStorage(): IStorage {
  return getPersistenceMode() === "postgres" ? new PgStorage() : new MemStorage();
}

export const storage = createStorage();

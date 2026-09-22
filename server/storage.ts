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

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  
  // Progress
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
  
  // Bookmarks
  getUserBookmarks(userId: number): Promise<Bookmark[]>;
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  deleteBookmark(id: number, userId: number): Promise<boolean>;
  
  // Prayer Settings
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

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      preferredLanguage: insertUser.preferredLanguage ?? null,
      theme: insertUser.theme ?? null,
      createdAt: new Date()
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

  // Progress
  async getUserProgress(userId: number): Promise<Progress[]> {
    return Array.from(this.progress.values()).filter(p => p.userId === userId);
  }

  async getProgress(
    userId: number,
    contentType: string,
    contentId: string,
  ): Promise<Progress | undefined> {
    return Array.from(this.progress.values()).find(
      p => p.userId === userId && p.contentType === contentType && p.contentId === contentId
    );
  }

  async createProgress(
    insertProgress: InsertProgress,
  ): Promise<Progress> {
    const id = this.currentProgressId++;
    const progressItem: Progress = {
      ...insertProgress,
      id,
      lastAccessed: new Date()
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
      lastAccessed: new Date()
    };
    this.progress.set(id, updatedProgress);
    return updatedProgress;
  }

  // Bookmarks
  async getUserBookmarks(userId: number): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values()).filter(b => b.userId === userId);
  }

  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = this.currentBookmarkId++;
    const bookmark: Bookmark = {
      ...insertBookmark,
      id,
      notes: insertBookmark.notes ?? null,
      createdAt: new Date()
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async deleteBookmark(id: number, userId: number): Promise<boolean> {
    const bookmark = this.bookmarks.get(id);
    if (!bookmark || bookmark.userId !== userId) return false;
    
    return this.bookmarks.delete(id);
  }

  // Prayer Settings
  async getPrayerSettings(userId: number): Promise<PrayerTimes | undefined> {
    return Array.from(this.prayerSettings.values()).find(s => s.userId === userId);
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
    const settings = Array.from(this.prayerSettings.values()).find(s => s.userId === userId);
    if (!settings) return undefined;

    const updatedSettings = { ...settings, ...updates };
    this.prayerSettings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();

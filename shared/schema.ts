import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  preferredLanguage: text("preferred_language").default("ar"),
  theme: text("theme").default("light"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const progress = pgTable("progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  contentType: text("content_type").notNull(),
  contentId: text("content_id").notNull(),
  lastAccessed: timestamp("last_accessed").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  lastVisitedPage: text("last_visited_page").default("/"),
  completedLessons: jsonb("completed_lessons").default([]),
  currentStreak: integer("current_streak").default(0),
  totalPoints: integer("total_points").default(0),
  bookmarks: jsonb("bookmarks").default([]),
  readingProgress: jsonb("reading_progress").default({}),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const prayerTimes = pgTable("prayer_times", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  location: text("location").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  timezone: text("timezone").notNull(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  contentType: text("content_type").notNull(), // "verse", "hadith", "seerah", "knowledge"
  contentId: text("content_id").notNull(),
  title: text("title").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const islamicContent = pgTable("islamic_content", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "verse", "hadith", "seerah", "pillar", "knowledge"
  category: text("category").notNull(),
  title: text("title").notNull(),
  content: jsonb("content").notNull(), // Multi-language content
  metadata: jsonb("metadata").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  messages: jsonb("messages").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  author: text("author").notNull(),
  authorEn: text("author_en"),
  category: text("category").notNull(),
  language: text("language").notNull().default("ar"),
  format: text("format").notNull().default("pdf"),
  pages: integer("pages").default(0),
  description: text("description"),
  descriptionEn: text("description_en"),
  downloadUrl: text("download_url").notNull(),
  coverImage: text("cover_image"),
  tags: jsonb("tags").default([]),
  publishedYear: integer("published_year"),
  size: text("size"),
  isAudioAvailable: boolean("is_audio_available").default(false),
  audioUrl: text("audio_url"),
  rating: text("rating").default("0"),
  downloads: integer("downloads").default(0),
  featured: boolean("featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const audioTracks = pgTable("audio_tracks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  titleEn: text("title_en"),
  reciter: text("reciter"),
  reciterEn: text("reciter_en"),
  type: text("type").notNull(), // "quran", "hadith", "seerah", "lecture"
  language: text("language").notNull().default("ar"),
  totalDuration: text("total_duration"),
  totalTracks: integer("total_tracks").default(1),
  description: text("description"),
  downloadUrl: text("download_url").notNull(),
  coverImage: text("cover_image"),
  quality: text("quality").default("128kbps"),
  size: text("size"),
  featured: boolean("featured").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const readingProgress = pgTable("reading_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  bookId: integer("book_id")
    .references(() => books.id)
    .notNull(),
  currentPage: integer("current_page").default(1),
  totalPages: integer("total_pages").default(0),
  readingTime: integer("reading_time").default(0), // in seconds
  bookmarks: jsonb("bookmarks").default([]),
  notes: jsonb("notes").default([]),
  lastReadAt: timestamp("last_read_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Source governance is intentionally separate from content tables. A work,
// digital artifact and provider endpoint can have different rights decisions.
export const sourceRegistryEntries = pgTable("source_registry", {
  sourceId: text("source_id").primaryKey(),
  title: text("title").notNull(),
  provider: text("provider").notNull(),
  kind: text("kind").notNull(),
  canonicalUrl: text("canonical_url"),
  version: text("version"),
  artifactSha256: text("artifact_sha256"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull(),
  editorialStatus: text("editorial_status").notNull(),
  notes: text("notes").notNull(),
});

export const rightsLedgerEntries = pgTable("rights_ledger", {
  rightsId: text("rights_id").primaryKey(),
  sourceId: text("source_id")
    .references(() => sourceRegistryEntries.sourceId)
    .notNull(),
  decision: text("decision").notNull(),
  licenseName: text("license_name"),
  licenseUrl: text("license_url"),
  termsSnapshotPath: text("terms_snapshot_path"),
  attribution: text("attribution"),
  permissions: jsonb("permissions").notNull(),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull(),
  reviewNote: text("review_note").notNull(),
});

export const providerResourceRegistryEntries = pgTable(
  "provider_resource_registry",
  {
    resourceId: text("resource_id").primaryKey(),
    sourceId: text("source_id")
      .references(() => sourceRegistryEntries.sourceId)
      .notNull(),
    rightsId: text("rights_id")
      .references(() => rightsLedgerEntries.rightsId)
      .notNull(),
    provider: text("provider").notNull(),
    resourceType: text("resource_type").notNull(),
    integrationMode: text("integration_mode").notNull(),
    endpoint: text("endpoint"),
    acquisitionStatus: text("acquisition_status").notNull(),
    credentialsRequired: boolean("credentials_required").notNull().default(false),
    credentialsConfigured: boolean("credentials_configured").notNull().default(false),
    allowedUsages: jsonb("allowed_usages").notNull().default([]),
    productionReady: boolean("production_ready").notNull().default(false),
  },
);

// Schema validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  lastAccessed: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  updatedAt: true,
});

export const insertPrayerTimesSchema = createInsertSchema(prayerTimes).omit({
  id: true,
  updatedAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertIslamicContentSchema = createInsertSchema(
  islamicContent,
).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAudioTrackSchema = createInsertSchema(audioTracks).omit({
  id: true,
  createdAt: true,
});

export const insertReadingProgressSchema = createInsertSchema(
  readingProgress,
).omit({
  id: true,
  lastReadAt: true,
  completedAt: true,
});

export const insertSourceRegistryEntrySchema = createInsertSchema(sourceRegistryEntries);
export const insertRightsLedgerEntrySchema = createInsertSchema(rightsLedgerEntries);
export const insertProviderResourceRegistryEntrySchema = createInsertSchema(
  providerResourceRegistryEntries,
);

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Progress = typeof progress.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type PrayerTimes = typeof prayerTimes.$inferSelect;
export type InsertPrayerTimes = z.infer<typeof insertPrayerTimesSchema>;

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;

export type IslamicContent = typeof islamicContent.$inferSelect;
export type InsertIslamicContent = z.infer<typeof insertIslamicContentSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

export type AudioTrack = typeof audioTracks.$inferSelect;
export type InsertAudioTrack = z.infer<typeof insertAudioTrackSchema>;

export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;

export type SourceRegistryRow = typeof sourceRegistryEntries.$inferSelect;
export type InsertSourceRegistryRow = z.infer<typeof insertSourceRegistryEntrySchema>;

export type RightsLedgerRow = typeof rightsLedgerEntries.$inferSelect;
export type InsertRightsLedgerRow = z.infer<typeof insertRightsLedgerEntrySchema>;

export type ProviderResourceRegistryRow =
  typeof providerResourceRegistryEntries.$inferSelect;
export type InsertProviderResourceRegistryRow = z.infer<
  typeof insertProviderResourceRegistryEntrySchema
>;

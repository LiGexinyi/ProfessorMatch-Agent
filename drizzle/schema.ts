import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  researchDirection: text("researchDirection"),
  targetSchools: text("targetSchools"),
  degreeBackground: varchar("degreeBackground", { length: 255 }),
  gpa: varchar("gpa", { length: 10 }),
  languageScores: text("languageScores"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export const professors = mysqlTable("professors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  university: varchar("university", { length: 255 }),
  department: varchar("department", { length: 255 }),
  researchAreas: text("researchAreas"),
  recentPublications: text("recentPublications"), // JSON string of titles and abstracts
  homepageUrl: text("homepageUrl"),
  googleScholarUrl: text("googleScholarUrl"),
  labWebsiteUrl: text("labWebsiteUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Professor = typeof professors.$inferSelect;
export type InsertProfessor = typeof professors.$inferInsert;

export const emailDrafts = mysqlTable("emailDrafts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  professorId: int("professorId").notNull().references(() => professors.id, { onDelete: "cascade" }),
  subject: text("subject"),
  body: text("body"),
  aiSuggestions: text("aiSuggestions"), // JSON string of AI suggestions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailDraft = typeof emailDrafts.$inferSelect;
export type InsertEmailDraft = typeof emailDrafts.$inferInsert;

export const userProfessorInteractions = mysqlTable("userProfessorInteractions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  professorId: int("professorId").notNull().references(() => professors.id, { onDelete: "cascade" }),
  isFavorited: int("isFavorited").default(0).notNull(), // 0 for false, 1 for true
  contactStatus: mysqlEnum("contactStatus", ["pending", "contacted", "replied"]).default("pending").notNull(),
  matchScore: int("matchScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfessorInteraction = typeof userProfessorInteractions.$inferSelect;
export type InsertUserProfessorInteraction = typeof userProfessorInteractions.$inferInsert;

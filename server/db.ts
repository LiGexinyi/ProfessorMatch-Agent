import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, userProfiles, professors, emailDrafts, userProfessorInteractions, InsertUserProfile, InsertProfessor, InsertEmailDraft, InsertUserProfessorInteraction } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProfile(userId: number, profile: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) return;
  await db.insert(userProfiles).values({ userId, ...profile }).onDuplicateKeyUpdate({
    set: profile,
  });
}

export async function createProfessor(professor: InsertProfessor) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(professors).values(professor);
  return result[0]?.insertId;
}

export async function getProfessorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(professors).where(eq(professors.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProfessors() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(professors);
}

export async function createEmailDraft(draft: InsertEmailDraft) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(emailDrafts).values(draft);
  return result[0]?.insertId;
}

export async function getEmailDraftById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailDrafts).where(eq(emailDrafts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateEmailDraft(id: number, updates: Partial<InsertEmailDraft>) {
  const db = await getDb();
  if (!db) return;
  await db.update(emailDrafts).set(updates).where(eq(emailDrafts.id, id));
}

export async function createUserProfessorInteraction(interaction: InsertUserProfessorInteraction) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(userProfessorInteractions).values(interaction);
  return result[0]?.insertId;
}

export async function getUserProfessorInteraction(userId: number, professorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProfessorInteractions).where(
    eq(userProfessorInteractions.userId, userId) && eq(userProfessorInteractions.professorId, professorId)
  ).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfessorInteraction(userId: number, professorId: number, updates: Partial<InsertUserProfessorInteraction>) {
  const db = await getDb();
  if (!db) return;
  await db.update(userProfessorInteractions).set(updates).where(
    eq(userProfessorInteractions.userId, userId) && eq(userProfessorInteractions.professorId, professorId)
  );
}

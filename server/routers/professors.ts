import { z } from "zod";
import { eq } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getAllProfessors, getProfessorById, createProfessor, getUserProfessorInteraction, createUserProfessorInteraction, updateUserProfessorInteraction, getDb } from "../db";
import { userProfessorInteractions } from "../../drizzle/schema";

export const professorsRouter = router({
  list: publicProcedure.query(async () => {
    return await getAllProfessors();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getProfessorById(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        university: z.string().optional(),
        department: z.string().optional(),
        researchAreas: z.string().optional(),
        recentPublications: z.string().optional(),
        homepageUrl: z.string().optional(),
        googleScholarUrl: z.string().optional(),
        labWebsiteUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const id = await createProfessor(input);
      return { id, success: true };
    }),

  favorite: protectedProcedure
    .input(z.object({ professorId: z.number(), isFavorited: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const interaction = await getUserProfessorInteraction(ctx.user.id, input.professorId);
      if (interaction) {
        await updateUserProfessorInteraction(ctx.user.id, input.professorId, {
          isFavorited: input.isFavorited ? 1 : 0,
        });
      } else {
        await createUserProfessorInteraction({
          userId: ctx.user.id,
          professorId: input.professorId,
          isFavorited: input.isFavorited ? 1 : 0,
          contactStatus: "pending",
        });
      }
      return { success: true };
    }),

  updateContactStatus: protectedProcedure
    .input(
      z.object({
        professorId: z.number(),
        contactStatus: z.enum(["pending", "contacted", "replied"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const interaction = await getUserProfessorInteraction(ctx.user.id, input.professorId);
      if (interaction) {
        await updateUserProfessorInteraction(ctx.user.id, input.professorId, {
          contactStatus: input.contactStatus,
        });
      } else {
        await createUserProfessorInteraction({
          userId: ctx.user.id,
          professorId: input.professorId,
          contactStatus: input.contactStatus,
          isFavorited: 0,
        });
      }
      return { success: true };
    }),

  getUserInteractions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const interactions = await db.select().from(userProfessorInteractions).where(
      eq(userProfessorInteractions.userId, ctx.user.id)
    );
    return interactions;
  }),

  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const favorites = await db.select().from(userProfessorInteractions).where(
      eq(userProfessorInteractions.userId, ctx.user.id)
    );
    return favorites.filter(f => f.isFavorited === 1);
  }),
});

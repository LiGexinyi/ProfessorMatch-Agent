import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserProfile, upsertUserProfile } from "../db";

export const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getUserProfile(ctx.user.id);
  }),

  update: protectedProcedure
    .input(
      z.object({
        researchDirection: z.string().optional(),
        targetSchools: z.string().optional(),
        degreeBackground: z.string().optional(),
        gpa: z.string().optional(),
        languageScores: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertUserProfile(ctx.user.id, input);
      return { success: true };
    }),
});


import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { scraperRouter } from "./routers/scraper";
import { profileRouter } from "./routers/profile";
import { professorsRouter } from "./routers/professors";
import { emailRouter } from "./routers/email";
import { urlExtractorRouter } from "./routers/urlExtractor";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  scraper: scraperRouter,
  urlExtractor: urlExtractorRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  profile: profileRouter,
  professors: professorsRouter,
  email: emailRouter,
});

export type AppRouter = typeof appRouter;

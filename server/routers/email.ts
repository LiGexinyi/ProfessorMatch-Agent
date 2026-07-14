import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createEmailDraft, getEmailDraftById, updateEmailDraft, getUserProfile, getProfessorById } from "../db";
import { invokeLLM } from "../_core/llm";

function extractContent(content: any): string {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) {
    return content.map((c: any) => c.text || JSON.stringify(c)).join('\n');
  }
  return JSON.stringify(content);
}

export const emailRouter = router({
  generate: protectedProcedure
    .input(
      z.object({
        professorId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const professor = await getProfessorById(input.professorId);
      const userProfile = await getUserProfile(ctx.user.id);

      if (!professor) {
        throw new Error("Professor not found");
      }

      const prompt = `You are an expert in writing professional cold emails to professors for research opportunities.

User Profile:
- Name: ${ctx.user.name || "Applicant"}
- Email: ${ctx.user.email || "N/A"}
- Research Direction: ${userProfile?.researchDirection || "Not specified"}
- Target Schools: ${userProfile?.targetSchools || "Not specified"}
- Degree Background: ${userProfile?.degreeBackground || "Not specified"}
- GPA: ${userProfile?.gpa || "Not specified"}
- Language Scores: ${userProfile?.languageScores || "Not specified"}

Professor Information:
- Name: ${professor.name}
- University: ${professor.university || "Not specified"}
- Department: ${professor.department || "Not specified"}
- Research Areas: ${professor.researchAreas || "Not specified"}
- Recent Publications: ${professor.recentPublications || "Not specified"}

Please generate a professional, personalized cold email in English that:
1. Is concise and respectful (3-4 paragraphs)
2. Demonstrates genuine interest in the professor's research
3. Highlights relevant aspects of the applicant's background
4. Clearly expresses interest in research opportunities
5. Includes a professional closing

Return the email in the following JSON format:
{
  "subject": "Email subject line",
  "body": "Email body text"
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt as any,
          },
        ],
      });

      const content = extractContent(response.choices[0]?.message?.content);
      if (!content) {
        throw new Error("Failed to generate email");
      }

      let emailData;
      try {
        emailData = JSON.parse(content);
      } catch {
        emailData = {
          subject: "Research Opportunity Inquiry",
          body: content,
        };
      }

      const draftId = await createEmailDraft({
        userId: ctx.user.id,
        professorId: input.professorId,
        subject: emailData.subject,
        body: emailData.body,
      });

      return {
        id: draftId,
        subject: emailData.subject,
        body: emailData.body,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const draft = await getEmailDraftById(input.id);
      if (!draft || draft.userId !== ctx.user.id) {
        throw new Error("Email draft not found");
      }
      return draft;
    }),

  optimize: protectedProcedure
    .input(
      z.object({
        draftId: z.number(),
        focusArea: z.enum(["tone", "structure", "personalization", "professionalism"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const draft = await getEmailDraftById(input.draftId);
      if (!draft || draft.userId !== ctx.user.id) {
        throw new Error("Email draft not found");
      }

      const prompt = `You are an expert in optimizing professional emails. Please review and improve the following email draft.

Current Email:
Subject: ${draft.subject}
Body: ${draft.body}

${input.focusArea ? `Focus on improving: ${input.focusArea}` : "Provide overall improvements"}

Please provide:
1. Specific suggestions for improvement (3-5 key points)
2. An improved version of the email

Return in JSON format:
{
  "suggestions": ["suggestion 1", "suggestion 2", ...],
  "improvedSubject": "improved subject",
  "improvedBody": "improved body"
}`;

      const response = await invokeLLM({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt as any,
          },
        ],
      });

      const content = extractContent(response.choices[0]?.message?.content);
      if (!content) {
        throw new Error("Failed to optimize email");
      }

      let suggestions;
      try {
        suggestions = JSON.parse(content);
      } catch {
        suggestions = {
          suggestions: [content],
          improvedSubject: "Optimized",
          improvedBody: content,
        };
      }

      return {
        suggestions: suggestions.suggestions,
        improvedEmail: {
          subject: suggestions.improvedSubject,
          body: suggestions.improvedBody,
        },
      };
    }),

  update: protectedProcedure
    .input(
      z.object({
        draftId: z.number(),
        subject: z.string().optional(),
        body: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const draft = await getEmailDraftById(input.draftId);
      if (!draft || draft.userId !== ctx.user.id) {
        throw new Error("Email draft not found");
      }

      await updateEmailDraft(input.draftId, {
        subject: input.subject,
        body: input.body,
      });

      return { success: true };
    }),
});

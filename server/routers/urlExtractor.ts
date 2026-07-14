import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

export const urlExtractorRouter = router({
  extractProfessorInfo: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `请访问以下教授主页 URL 并提取相关信息：

URL: ${input.url}

请从该网页中提取以下信息：
1. 教授姓名
2. 所在大学和部门
3. 研究方向（列出所有主要研究领域）
4. 近期论文标题和摘要（列出最近 5-10 篇）
5. 个人主页 URL
6. Google Scholar 链接（如果有）
7. 实验室网站链接（如果有）

请返回一个 JSON 对象，包含以下字段：
{
  "name": "教授姓名",
  "university": "大学名称",
  "department": "部门名称",
  "researchAreas": "研究方向1, 研究方向2, ...",
  "recentPublications": "论文1摘要; 论文2摘要; ...",
  "homepageUrl": "个人主页 URL",
  "googleScholarUrl": "Google Scholar URL",
  "labWebsiteUrl": "实验室网站 URL",
  "extractionNotes": "提取过程中的任何注意事项或困难"
}

请只返回 JSON 对象，不要包含其他文本。如果无法访问该 URL 或信息不完整，请在 extractionNotes 中说明。`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const textContent = response.choices[0]?.message.content;
        if (!textContent || typeof textContent !== "string") {
          throw new Error("Invalid response format from LLM");
        }

        // Parse the response as JSON
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Failed to parse professor data from URL");
        }

        const professorData = JSON.parse(jsonMatch[0]);

        return {
          success: true,
          data: professorData,
          message: "成功从 URL 提取教授信息",
        };
      } catch (error) {
        console.error("Error extracting professor info from URL:", error);
        throw error;
      }
    }),

  extractAndCreateProfessor: protectedProcedure
    .input(
      z.object({
        url: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { invokeLLM: invokeLLMFunc } = await import("../_core/llm");
      const { createProfessor } = await import("../db");

      const prompt = `请访问以下教授主页 URL 并提取相关信息：

URL: ${input.url}

请从该网页中提取以下信息：
1. 教授姓名
2. 所在大学和部门
3. 研究方向（列出所有主要研究领域）
4. 近期论文标题和摘要（列出最近 5-10 篇）
5. 个人主页 URL
6. Google Scholar 链接（如果有）
7. 实验室网站链接（如果有）

请返回一个 JSON 对象，包含以下字段：
{
  "name": "教授姓名",
  "university": "大学名称",
  "department": "部门名称",
  "researchAreas": "研究方向1, 研究方向2, ...",
  "recentPublications": "论文1摘要; 论文2摘要; ...",
  "homepageUrl": "个人主页 URL",
  "googleScholarUrl": "Google Scholar URL",
  "labWebsiteUrl": "实验室网站 URL"
}

请只返回 JSON 对象，不要包含其他文本。`;

      try {
        const response = await invokeLLMFunc({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const textContent = response.choices[0]?.message.content;
        if (!textContent || typeof textContent !== "string") {
          throw new Error("Invalid response format from LLM");
        }

        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Failed to parse professor data from URL");
        }

        const professorData = JSON.parse(jsonMatch[0]);

        // Create professor in database
        const professorId = await createProfessor({
          name: professorData.name,
          university: professorData.university,
          department: professorData.department,
          researchAreas: professorData.researchAreas,
          recentPublications: professorData.recentPublications,
          homepageUrl: professorData.homepageUrl || input.url,
          googleScholarUrl: professorData.googleScholarUrl,
          labWebsiteUrl: professorData.labWebsiteUrl,
        });

        return {
          success: true,
          professorId,
          data: professorData,
          message: "成功从 URL 提取并创建教授信息",
        };
      } catch (error) {
        console.error("Error extracting and creating professor:", error);
        throw error;
      }
    }),
});

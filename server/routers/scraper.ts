import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { createProfessor } from "../db";

export const scraperRouter = router({
  fetchProfessors: protectedProcedure
    .input(
      z.object({
        university: z.string(),
        department: z.string(),
        researchArea: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `请根据以下信息搜索并列出相关的教授信息：

大学：${input.university}
部门：${input.department}
研究方向：${input.researchArea}

请返回一个 JSON 数组，包含至少 5 位教授的信息。每位教授应包含以下字段：
- name: 教授姓名
- university: 所在大学
- department: 所在部门
- researchAreas: 研究方向（用逗号分隔）
- recentPublications: 近期论文标题和摘要（用分号分隔）
- homepageUrl: 个人主页 URL（如果有）
- googleScholarUrl: Google Scholar URL（如果有）
- labWebsiteUrl: 实验室网站 URL（如果有）

返回格式：
[
  {
    "name": "教授姓名",
    "university": "大学名称",
    "department": "部门名称",
    "researchAreas": "研究方向1, 研究方向2",
    "recentPublications": "论文1摘要; 论文2摘要",
    "homepageUrl": "URL",
    "googleScholarUrl": "URL",
    "labWebsiteUrl": "URL"
  }
]

请只返回 JSON 数组，不要包含其他文本。`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        // Extract text content from response
        const textContent = response.choices[0]?.message.content;
        if (!textContent || typeof textContent !== "string") {
          throw new Error("Invalid response format from LLM");
        }

        // Parse the response as JSON
        const jsonMatch = textContent.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error("Failed to parse professor data from LLM response");
        }

        const professorsData = JSON.parse(jsonMatch[0]);

        // Save professors to database
        const createdProfessors = [];
        for (const prof of professorsData) {
          const id = await createProfessor({
            name: prof.name,
            university: prof.university,
            department: prof.department,
            researchAreas: prof.researchAreas,
            recentPublications: prof.recentPublications,
            homepageUrl: prof.homepageUrl,
            googleScholarUrl: prof.googleScholarUrl,
            labWebsiteUrl: prof.labWebsiteUrl,
          });
          createdProfessors.push({ id, ...prof });
        }

        return {
          success: true,
          count: createdProfessors.length,
          professors: createdProfessors,
        };
      } catch (error) {
        console.error("Error fetching professors:", error);
        throw error;
      }
    }),

  generateMatchScore: protectedProcedure
    .input(
      z.object({
        userBackground: z.string(),
        professorResearch: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const prompt = `请根据以下信息计算用户与教授的匹配度评分（0-100）：

用户背景：
${input.userBackground}

教授研究方向：
${input.professorResearch}

请评估以下几个方面的匹配度：
1. 研究方向的契合度
2. 学术背景的相关性
3. 研究兴趣的一致性

请返回一个 JSON 对象，包含：
- score: 总体匹配度评分（0-100）
- reasoning: 评分原因（简要说明）
- strengths: 匹配的优势（数组）
- gaps: 需要改进的地方（数组）

返回格式：
{
  "score": 85,
  "reasoning": "用户的研究背景与教授的研究方向高度契合...",
  "strengths": ["优势1", "优势2"],
  "gaps": ["需改进1", "需改进2"]
}

请只返回 JSON 对象，不要包含其他文本。`;

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

        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("Failed to parse match score from LLM response");
        }

        const matchData = JSON.parse(jsonMatch[0]);
        return matchData;
      } catch (error) {
        console.error("Error generating match score:", error);
        throw error;
      }
    }),
});

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send } from "lucide-react";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "你好！我是您的 AI 申请助手。我可以帮助您：\n\n1. **分析学术背景** - 评估您的申请竞争力\n2. **推荐学校** - 根据您的背景推荐合适的大学和项目\n3. **套磁建议** - 提供教授联系和邮件撰写指导\n4. **申请策略** - 制定个性化的申请计划\n5. **答疑解惑** - 解答申请流程中的各种问题\n\n请告诉我您的背景信息，比如专业、GPA、语言成绩、研究兴趣等，我会为您提供专业建议。",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Simulate AI response with a placeholder
    // In production, this would call a backend API
    setTimeout(() => {
      const assistantResponse = `感谢您分享这些信息。根据您的背景，我建议：

1. **选校策略**：根据您的 GPA 和语言成绩，您可以考虑申请美国 Top 20 的学校。

2. **套磁准备**：
   - 准备一份简洁的研究计划（Research Statement）
   - 列出 5-10 位与您研究方向匹配的教授
   - 准备个性化的套磁邮件

3. **时间规划**：
   - 现在开始准备材料
   - 9-10 月投递申请
   - 12-1 月进行套磁

4. **建议**：
   - 充分利用本平台的教授匹配功能
   - 使用 AI 邮件生成功能优化您的套磁邮件
   - 定期更新您的联系进度

需要我帮您详细分析某个方面吗？`;

      setMessages((prev) => [...prev, { role: "assistant", content: assistantResponse }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">AI 申请助手</h1>
          <p className="text-slate-600">获取个性化的申请策略和选校建议</p>
        </div>

        <Card className="shadow-lg border-0 h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles size={20} className="text-blue-600" />
              申请顾问
            </CardTitle>
            <CardDescription>实时对话，获取专业建议</CardDescription>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-blue-600 text-white rounded-br-none"
                          : "bg-slate-100 text-slate-900 rounded-bl-none"
                      }`}
                    >
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 text-slate-900 px-4 py-3 rounded-lg rounded-bl-none">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="输入您的问题..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Send size={18} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

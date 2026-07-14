import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Wand2, Copy, Download } from "lucide-react";

export default function EmailComposer() {
  const [location] = useLocation();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [focusArea, setFocusArea] = useState<"tone" | "structure" | "personalization" | "professionalism">("tone");

  // Extract query parameters
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const professorId = searchParams.get("professorId") ? parseInt(searchParams.get("professorId")!) : null;
  const draftId = searchParams.get("draftId") ? parseInt(searchParams.get("draftId")!) : null;

  const generateMutation = trpc.email.generate.useMutation({
    onSuccess: (data) => {
      setSubject(data.subject);
      setBody(data.body);
      toast.success("邮件已生成");
    },
    onError: () => {
      toast.error("生成失败，请重试");
    },
  });

  const optimizeMutation = trpc.email.optimize.useMutation({
    onSuccess: (data) => {
      setSuggestions(data.suggestions);
      toast.success("优化建议已生成");
    },
    onError: () => {
      toast.error("优化失败，请重试");
    },
  });

  const updateMutation = trpc.email.update.useMutation({
    onSuccess: () => {
      toast.success("邮件已保存");
    },
    onError: () => {
      toast.error("保存失败，请重试");
    },
  });

  // Auto-generate email when component mounts with professorId
  useEffect(() => {
    if (professorId && !subject && !body) {
      generateMutation.mutate({ professorId });
    }
  }, [professorId]);

  const handleGenerate = () => {
    if (professorId) {
      generateMutation.mutate({ professorId });
    }
  };

  const handleOptimize = () => {
    if (draftId) {
      optimizeMutation.mutate({ draftId, focusArea });
    }
  };

  const handleSave = () => {
    if (draftId) {
      updateMutation.mutate({ draftId, subject, body });
    }
  };

  const handleCopy = () => {
    const emailText = `Subject: ${subject}\n\n${body}`;
    navigator.clipboard.writeText(emailText);
    toast.success("已复制到剪贴板");
  };

  const handleDownload = () => {
    const emailText = `Subject: ${subject}\n\n${body}`;
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(emailText));
    element.setAttribute("download", "email.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("邮件已下载");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">套磁邮件编辑器</h1>
          <p className="text-slate-600">编辑、优化和完善您的套磁邮件</p>
        </div>

        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="compose">编辑邮件</TabsTrigger>
            <TabsTrigger value="optimize">优化建议</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>邮件内容</CardTitle>
                <CardDescription>编辑您的套磁邮件</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">主题</label>
                  <Input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="输入邮件主题"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">邮件正文</label>
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="输入邮件正文"
                    className="min-h-64 resize-none"
                  />
                </div>

                <div className="flex gap-3 flex-wrap">
                  {professorId && (
                    <Button
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Wand2 size={16} className="mr-2" />
                      {generateMutation.isPending ? "生成中..." : "AI 生成邮件"}
                    </Button>
                  )}
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="border-slate-300"
                  >
                    <Copy size={16} className="mr-2" />
                    复制
                  </Button>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="border-slate-300"
                  >
                    <Download size={16} className="mr-2" />
                    下载
                  </Button>
                  {draftId && (
                    <Button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {updateMutation.isPending ? "保存中..." : "保存"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimize" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>AI 优化建议</CardTitle>
                <CardDescription>获取邮件优化的建议</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">优化重点</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["tone", "structure", "personalization", "professionalism"] as const).map((area) => (
                      <Button
                        key={area}
                        variant={focusArea === area ? "default" : "outline"}
                        onClick={() => setFocusArea(area)}
                        className={focusArea === area ? "bg-blue-600" : ""}
                      >
                        {area === "tone" && "语气"}
                        {area === "structure" && "结构"}
                        {area === "personalization" && "个性化"}
                        {area === "professionalism" && "专业性"}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleOptimize}
                  disabled={optimizeMutation.isPending || !draftId}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Wand2 size={16} className="mr-2" />
                  {optimizeMutation.isPending ? "分析中..." : "获取优化建议"}
                </Button>

                {suggestions.length > 0 && (
                  <div className="space-y-3 mt-6">
                    <h3 className="font-semibold text-slate-900">建议：</h3>
                    {suggestions.map((suggestion, idx) => (
                      <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-slate-700">{suggestion}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

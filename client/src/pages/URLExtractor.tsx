import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Link as LinkIcon, Check } from "lucide-react";

export default function URLExtractor() {
  const [url, setUrl] = useState("");
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  const extractMutation = trpc.urlExtractor.extractProfessorInfo.useMutation({
    onSuccess: (data) => {
      toast.success("成功提取教授信息");
      setExtractedData(data.data);
      setShowPreview(true);
      setUrl("");
    },
    onError: (error) => {
      toast.error("提取失败，请检查 URL 是否正确");
      console.error(error);
    },
  });

  const createMutation = trpc.urlExtractor.extractAndCreateProfessor.useMutation({
    onSuccess: (data) => {
      toast.success("成功添加教授到数据库");
      setExtractedData(null);
      setShowPreview(false);
      setUrl("");
    },
    onError: (error) => {
      toast.error("添加失败，请重试");
      console.error(error);
    },
  });

  const handleExtract = () => {
    if (!url.trim()) {
      toast.error("请输入教授主页 URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("请输入有效的 URL");
      return;
    }

    extractMutation.mutate({ url });
  };

  const handleCreate = () => {
    if (!url && extractedData) {
      // Use the original URL from extracted data if available
      const originalUrl = extractedData.homepageUrl || url;
      if (!originalUrl) {
        toast.error("缺少 URL 信息");
        return;
      }
      createMutation.mutate({ url: originalUrl });
    } else if (url) {
      createMutation.mutate({ url });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">从 URL 提取教授信息</h1>
          <p className="text-slate-600">输入教授的主页链接，AI 将自动提取研究方向和论文信息</p>
        </div>

        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>输入教授主页 URL</CardTitle>
            <CardDescription>支持大学官网、Google Scholar 等教授主页链接</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url">教授主页 URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  placeholder="例如：https://cs.stanford.edu/~karpathy/"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={extractMutation.isPending || createMutation.isPending}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleExtract();
                    }
                  }}
                />
                <Button
                  onClick={handleExtract}
                  disabled={extractMutation.isPending || createMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {extractMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      提取中...
                    </>
                  ) : (
                    <>
                      <LinkIcon size={18} className="mr-2" />
                      提取信息
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {showPreview && extractedData && (
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader>
              <CardTitle>提取的教授信息</CardTitle>
              <CardDescription>请检查信息是否正确，然后添加到数据库</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-700 font-semibold">姓名</Label>
                  <p className="text-slate-900 mt-1">{extractedData.name}</p>
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold">大学</Label>
                  <p className="text-slate-900 mt-1">{extractedData.university}</p>
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold">部门</Label>
                  <p className="text-slate-900 mt-1">{extractedData.department}</p>
                </div>
                <div>
                  <Label className="text-slate-700 font-semibold">研究方向</Label>
                  <p className="text-slate-900 mt-1 text-sm">{extractedData.researchAreas}</p>
                </div>
              </div>

              <div>
                <Label className="text-slate-700 font-semibold">近期论文</Label>
                <div className="mt-2 bg-slate-50 rounded p-3 max-h-48 overflow-y-auto">
                  <p className="text-slate-700 text-sm whitespace-pre-wrap">
                    {extractedData.recentPublications}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {extractedData.homepageUrl && (
                  <div>
                    <Label className="text-slate-700 font-semibold text-xs">个人主页</Label>
                    <a
                      href={extractedData.homepageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-1 block truncate"
                    >
                      查看主页
                    </a>
                  </div>
                )}
                {extractedData.googleScholarUrl && (
                  <div>
                    <Label className="text-slate-700 font-semibold text-xs">Google Scholar</Label>
                    <a
                      href={extractedData.googleScholarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-1 block truncate"
                    >
                      查看 Scholar
                    </a>
                  </div>
                )}
                {extractedData.labWebsiteUrl && (
                  <div>
                    <Label className="text-slate-700 font-semibold text-xs">实验室网站</Label>
                    <a
                      href={extractedData.labWebsiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm mt-1 block truncate"
                    >
                      查看实验室
                    </a>
                  </div>
                )}
              </div>

              {extractedData.extractionNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-yellow-800 text-sm">
                    <strong>提取注记：</strong> {extractedData.extractionNotes}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      添加中...
                    </>
                  ) : (
                    <>
                      <Check size={18} className="mr-2" />
                      添加到数据库
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => {
                    setShowPreview(false);
                    setExtractedData(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  取消
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg border-0 bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 使用提示</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800 space-y-2 text-sm">
            <p>• 输入教授的个人主页、Google Scholar 或实验室网站 URL</p>
            <p>• 系统将自动提取教授的基本信息、研究方向和近期论文</p>
            <p>• 检查提取的信息是否准确，然后添加到数据库</p>
            <p>• 支持的 URL 格式：http:// 或 https:// 开头的完整链接</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

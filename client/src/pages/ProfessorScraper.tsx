import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

export default function ProfessorScraper() {
  const [university, setUniversity] = useState("");
  const [department, setDepartment] = useState("");
  const [researchArea, setResearchArea] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const scrapeMutation = trpc.scraper.fetchProfessors.useMutation({
    onSuccess: (data) => {
      toast.success(`成功添加 ${data.count} 位教授`);
      setResults(data.professors);
      setUniversity("");
      setDepartment("");
      setResearchArea("");
    },
    onError: (error) => {
      toast.error("抓取失败，请重试");
      console.error(error);
    },
  });

  const handleScrape = () => {
    if (!university.trim() || !department.trim() || !researchArea.trim()) {
      toast.error("请填写所有字段");
      return;
    }

    scrapeMutation.mutate({
      university,
      department,
      researchArea,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">AI 教授信息抓取</h1>
          <p className="text-slate-600">输入学校、部门和研究方向，AI 自动搜索并添加相关教授</p>
        </div>

        <Card className="shadow-lg border-0 mb-8">
          <CardHeader>
            <CardTitle>搜索参数</CardTitle>
            <CardDescription>提供学校、部门和研究方向信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="university">大学名称</Label>
              <Input
                id="university"
                placeholder="例如：Stanford University"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                disabled={scrapeMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="department">部门名称</Label>
              <Input
                id="department"
                placeholder="例如：Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={scrapeMutation.isPending}
              />
            </div>

            <div>
              <Label htmlFor="researchArea">研究方向</Label>
              <Input
                id="researchArea"
                placeholder="例如：Machine Learning, AI"
                value={researchArea}
                onChange={(e) => setResearchArea(e.target.value)}
                disabled={scrapeMutation.isPending}
              />
            </div>

            <Button
              onClick={handleScrape}
              disabled={scrapeMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {scrapeMutation.isPending ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  正在搜索...
                </>
              ) : (
                <>
                  <Search size={18} className="mr-2" />
                  搜索教授
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>搜索结果</CardTitle>
              <CardDescription>找到 {results.length} 位教授</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((prof, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-4">
                    <h3 className="font-bold text-slate-900 mb-2">{prof.name}</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p><span className="font-semibold">大学：</span> {prof.university}</p>
                      <p><span className="font-semibold">部门：</span> {prof.department}</p>
                      <p><span className="font-semibold">研究方向：</span> {prof.researchAreas}</p>
                      {prof.recentPublications && (
                        <p><span className="font-semibold">近期论文：</span> {prof.recentPublications}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

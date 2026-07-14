import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function ProfileSetup() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    researchDirection: "",
    targetSchools: "",
    degreeBackground: "",
    gpa: "",
    languageScores: "",
  });

  const updateProfileMutation = trpc.profile.update.useMutation({
    onSuccess: () => {
      toast.success("个人背景已保存");
    },
    onError: () => {
      toast.error("保存失败，请重试");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="text-2xl">个人背景信息</CardTitle>
            <CardDescription className="text-blue-100">
              请填写您的学术背景和申请目标，这将帮助我们为您推荐最匹配的导师
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="researchDirection" className="text-sm font-semibold text-slate-700">
                  研究方向
                </Label>
                <Textarea
                  id="researchDirection"
                  name="researchDirection"
                  placeholder="请描述您的主要研究兴趣和方向，例如：机器学习、自然语言处理、计算机视觉等"
                  value={formData.researchDirection}
                  onChange={handleChange}
                  className="min-h-24 resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetSchools" className="text-sm font-semibold text-slate-700">
                  目标学校
                </Label>
                <Textarea
                  id="targetSchools"
                  name="targetSchools"
                  placeholder="请列出您感兴趣的学校，用逗号分隔，例如：MIT, Stanford, Berkeley"
                  value={formData.targetSchools}
                  onChange={handleChange}
                  className="min-h-20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="degreeBackground" className="text-sm font-semibold text-slate-700">
                    学位背景
                  </Label>
                  <Input
                    id="degreeBackground"
                    name="degreeBackground"
                    placeholder="例如：Bachelor's in CS"
                    value={formData.degreeBackground}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpa" className="text-sm font-semibold text-slate-700">
                    GPA
                  </Label>
                  <Input
                    id="gpa"
                    name="gpa"
                    placeholder="例如：3.8/4.0"
                    value={formData.gpa}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="languageScores" className="text-sm font-semibold text-slate-700">
                  语言成绩
                </Label>
                <Textarea
                  id="languageScores"
                  name="languageScores"
                  placeholder="例如：TOEFL 110, GRE 330"
                  value={formData.languageScores}
                  onChange={handleChange}
                  className="min-h-20 resize-none"
                />
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg transition-all duration-200"
              >
                {updateProfileMutation.isPending ? "保存中..." : "保存个人背景"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

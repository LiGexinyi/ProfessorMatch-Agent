import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Heart, Mail, ExternalLink, Trash2 } from "lucide-react";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const [professors, setProfessors] = useState<Map<number, any>>(new Map());
  const [favorites, setFavorites] = useState<any[]>([]);

  const interactionsQuery = trpc.professors.getFavorites.useQuery();
  const professorsListQuery = trpc.professors.list.useQuery();
  const favoriteMutation = trpc.professors.favorite.useMutation({
    onSuccess: () => {
      toast.success("已移除收藏");
      interactionsQuery.refetch();
    },
    onError: () => {
      toast.error("操作失败，请重试");
    },
  });

  useEffect(() => {
    if (interactionsQuery.data) {
      setFavorites(interactionsQuery.data);
    }
  }, [interactionsQuery.data]);

  useEffect(() => {
    if (professorsListQuery.data) {
      const map = new Map();
      professorsListQuery.data.forEach((prof: any) => {
        map.set(prof.id, prof);
      });
      setProfessors(map);
    }
  }, [professorsListQuery.data]);

  const handleRemoveFavorite = (professorId: number) => {
    favoriteMutation.mutate({
      professorId,
      isFavorited: false,
    });
  };

  const handleGenerateEmail = (professorId: number) => {
    setLocation(`/email?professorId=${professorId}`);
  };

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">我的收藏</h1>
            <p className="text-slate-600">管理您收藏的教授</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="py-16 text-center">
              <Heart size={48} className="mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">暂无收藏</h3>
              <p className="text-slate-600 mb-6">浏览教授并点击心形图标来收藏您感兴趣的教授</p>
              <a href="/professors">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  浏览教授
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">我的收藏</h1>
          <p className="text-slate-600">您已收藏 {favorites.length} 位教授</p>
        </div>

        <div className="grid gap-4">
          {favorites.map((favorite) => {
            const professor = professors.get(favorite.professorId);
            if (!professor) return null;

            return (
              <Card key={favorite.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-900">
                          {professor.name}
                        </h3>
                        <Heart size={20} className="text-red-500 fill-red-500" />
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-slate-600">
                          <span className="font-semibold">学校：</span>
                          {professor.university || "Unknown"}
                        </p>
                        {professor.department && (
                          <p className="text-sm text-slate-600">
                            <span className="font-semibold">部门：</span>
                            {professor.department}
                          </p>
                        )}
                        {professor.researchAreas && (
                          <p className="text-sm text-slate-600">
                            <span className="font-semibold">研究方向：</span>
                            {professor.researchAreas}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {professor.homepageUrl && (
                          <a href={professor.homepageUrl} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                              <ExternalLink size={14} className="mr-1" />
                              个人主页
                            </Badge>
                          </a>
                        )}
                        {professor.googleScholarUrl && (
                          <a href={professor.googleScholarUrl} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100">
                              <ExternalLink size={14} className="mr-1" />
                              Google Scholar
                            </Badge>
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => handleGenerateEmail(professor.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Mail size={16} className="mr-2" />
                        生成邮件
                      </Button>
                      <Button
                        onClick={() => handleRemoveFavorite(professor.id)}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50"
                        disabled={favoriteMutation.isPending}
                      >
                        <Trash2 size={16} className="mr-2" />
                        移除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

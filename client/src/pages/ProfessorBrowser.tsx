import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function ProfessorBrowser() {
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const { data: professors, isLoading } = trpc.professors.list.useQuery();
  const favoriteMutation = trpc.professors.favorite.useMutation({
    onSuccess: () => {
      toast.success("已更新收藏状态");
    },
  });

  const filteredProfessors = professors?.filter((prof) =>
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prof.researchAreas?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleFavorite = (professorId: number) => {
    const isFavorited = !favorites.has(professorId);
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (isFavorited) {
        newSet.add(professorId);
      } else {
        newSet.delete(professorId);
      }
      return newSet;
    });
    favoriteMutation.mutate({ professorId, isFavorited });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">教授库</h1>
          <p className="text-slate-600">浏览和搜索全球顶尖大学的研究导师</p>
        </div>

        <div className="mb-8">
          <Input
            placeholder="搜索教授名字、学校或研究方向..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredProfessors && filteredProfessors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessors.map((professor) => (
              <Card key={professor.id} className="shadow-md hover:shadow-lg transition-shadow duration-200 border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-900">{professor.name}</CardTitle>
                      <CardDescription className="text-sm text-slate-600">
                        {professor.university}
                        {professor.department && ` · ${professor.department}`}
                      </CardDescription>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(professor.id)}
                      className="ml-2 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Heart
                        size={20}
                        className={favorites.has(professor.id) ? "fill-red-500 text-red-500" : "text-slate-400"}
                      />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {professor.researchAreas && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-1">研究方向</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{professor.researchAreas}</p>
                    </div>
                  )}

                  {professor.recentPublications && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-1">近期成果</h4>
                      <p className="text-sm text-slate-600 line-clamp-2">{professor.recentPublications}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    {professor.homepageUrl && (
                      <a
                        href={professor.homepageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink size={14} className="mr-1" />
                          主页
                        </Button>
                      </a>
                    )}
                    {professor.googleScholarUrl && (
                      <a
                        href={professor.googleScholarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <ExternalLink size={14} className="mr-1" />
                          Scholar
                        </Button>
                      </a>
                    )}
                  </div>

                  <a href={`/email?professorId=${professor.id}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      生成套磁邮件
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600">未找到匹配的教授</p>
          </div>
        )}
      </div>
    </div>
  );
}

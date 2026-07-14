import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Search, Mail, Sparkles, BookOpen } from "lucide-react";
import { startLogin } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: BookOpen,
      title: "智能教授库",
      description: "浏览全球顶尖大学的研究导师，快速找到与您研究方向匹配的教授",
    },
    {
      icon: Sparkles,
      title: "AI 智能匹配",
      description: "基于您的学术背景和研究兴趣，AI 自动评分并推荐最合适的导师",
    },
    {
      icon: Mail,
      title: "一键生成套磁邮件",
      description: "结合您的背景和教授研究内容，自动生成专业、个性化的英文套磁邮件",
    },
    {
      icon: Search,
      title: "进度追踪",
      description: "记录每位教授的联系状态，管理您的申请进度",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <span className="text-xl font-bold text-slate-900">ProfessorMatch</span>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/profile")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  个人背景
                </Button>
                <Button
                  onClick={() => setLocation("/professors")}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  浏览教授
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/tracker")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  进度追踪
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/assistant")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  AI 助手
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/favorites")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  收藏夹
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/scraper")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  AI 抬取
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLocation("/url-extractor")}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  URL 提取
                </Button>
              </>
            ) : (
              <Button
                onClick={() => startLogin()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                登录
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          找到您的理想导师
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            AI 助力套磁申请
          </span>
        </h1>
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          ProfessorMatch 是一个智能平台，帮助留学申请者快速找到匹配的海外导师，并生成专业的套磁邮件。
        </p>
        {!isAuthenticated && (
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 text-lg"
          >
            开始使用
          </Button>
        )}
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">核心功能</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="shadow-md hover:shadow-lg transition-all duration-200 border-0 bg-white">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="text-blue-600" size={24} />
                  </div>
                  <CardTitle className="text-lg text-slate-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      {isAuthenticated && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4">准备好了吗？</h2>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              完成您的个人背景信息，让 AI 为您推荐最匹配的导师
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setLocation("/profile")}
                variant="outline"
                className="bg-white text-blue-600 hover:bg-blue-50 border-0"
              >
                填写背景信息
              </Button>
              <Button
                onClick={() => setLocation("/professors")}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                浏览教授库
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-600">
          <p>&copy; 2026 ProfessorMatch. 帮助您找到理想的学术导师。</p>
        </div>
      </footer>
    </div>
  );
}

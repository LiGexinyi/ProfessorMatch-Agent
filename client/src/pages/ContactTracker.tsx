import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Clock, CheckCircle, MessageCircle, Trash2 } from "lucide-react";

export default function ContactTracker() {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [professors, setProfessors] = useState<Map<number, any>>(new Map());

  const interactionsQuery = trpc.professors.getUserInteractions.useQuery();
  const professorsListQuery = trpc.professors.list.useQuery();
  const updateStatusMutation = trpc.professors.updateContactStatus.useMutation({
    onSuccess: () => {
      toast.success("状态已更新");
      interactionsQuery.refetch();
    },
    onError: () => {
      toast.error("更新失败，请重试");
    },
  });

  useEffect(() => {
    if (interactionsQuery.data) {
      setInteractions(interactionsQuery.data);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={18} className="text-yellow-500" />;
      case "contacted":
        return <MessageCircle size={18} className="text-blue-500" />;
      case "replied":
        return <CheckCircle size={18} className="text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "待联系";
      case "contacted":
        return "已联系";
      case "replied":
        return "已回复";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "contacted":
        return "bg-blue-100 text-blue-800";
      case "replied":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (professorId: number, newStatus: "pending" | "contacted" | "replied") => {
    updateStatusMutation.mutate({
      professorId,
      contactStatus: newStatus,
    });
  };

  const pendingInteractions = interactions.filter(i => i.contactStatus === "pending");
  const contactedInteractions = interactions.filter(i => i.contactStatus === "contacted");
  const repliedInteractions = interactions.filter(i => i.contactStatus === "replied");

  const renderInteractionList = (list: any[]) => {
    if (list.length === 0) {
      return (
        <div className="text-center py-8 text-slate-500">
          <p>暂无记录</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {list.map((interaction) => {
          const professor = professors.get(interaction.professorId);
          return (
            <Card key={interaction.id} className="border-slate-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {professor?.name || "Unknown Professor"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {professor?.university || "Unknown University"}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {professor?.department || "Unknown"}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={interaction.contactStatus === "pending" ? "default" : "outline"}
                        onClick={() => handleStatusChange(interaction.professorId, "pending")}
                        disabled={updateStatusMutation.isPending}
                        className="text-xs"
                      >
                        <Clock size={14} className="mr-1" />
                        待联系
                      </Button>
                      <Button
                        size="sm"
                        variant={interaction.contactStatus === "contacted" ? "default" : "outline"}
                        onClick={() => handleStatusChange(interaction.professorId, "contacted")}
                        disabled={updateStatusMutation.isPending}
                        className="text-xs"
                      >
                        <MessageCircle size={14} className="mr-1" />
                        已联系
                      </Button>
                      <Button
                        size="sm"
                        variant={interaction.contactStatus === "replied" ? "default" : "outline"}
                        onClick={() => handleStatusChange(interaction.professorId, "replied")}
                        disabled={updateStatusMutation.isPending}
                        className="text-xs"
                      >
                        <CheckCircle size={14} className="mr-1" />
                        已回复
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">联系进度追踪</h1>
          <p className="text-slate-600">管理您与教授的联系状态</p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">全部 ({interactions.length})</TabsTrigger>
            <TabsTrigger value="pending">待联系 ({pendingInteractions.length})</TabsTrigger>
            <TabsTrigger value="contacted">已联系 ({contactedInteractions.length})</TabsTrigger>
            <TabsTrigger value="replied">已回复 ({repliedInteractions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>所有教授</CardTitle>
                <CardDescription>查看所有教授的联系状态</CardDescription>
              </CardHeader>
              <CardContent>
                {renderInteractionList(interactions)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>待联系</CardTitle>
                <CardDescription>还未联系的教授</CardDescription>
              </CardHeader>
              <CardContent>
                {renderInteractionList(pendingInteractions)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacted" className="space-y-4">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>已联系</CardTitle>
                <CardDescription>已发送邮件的教授</CardDescription>
              </CardHeader>
              <CardContent>
                {renderInteractionList(contactedInteractions)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="replied" className="space-y-4">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>已回复</CardTitle>
                <CardDescription>已收到回复的教授</CardDescription>
              </CardHeader>
              <CardContent>
                {renderInteractionList(repliedInteractions)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

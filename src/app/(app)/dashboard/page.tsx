import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardCharts } from "./DashboardCharts";
import { FileText, Inbox, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) return null;

  const workspaceId = session.user.workspaceId;

  // Parallel data fetching for metrics
  const [
    totalFeedback,
    newFeedback,
    sentimentData,
    channelData,
    themeData,
  ] = await Promise.all([
    prisma.feedback.count({ where: { workspaceId } }),
    prisma.feedback.count({ where: { workspaceId, status: "NEW" } }),
    prisma.feedback.groupBy({
      by: ["sentiment"],
      where: { workspaceId },
      _count: { id: true },
    }),
    prisma.feedback.groupBy({
      by: ["channel"],
      where: { workspaceId },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.feedbackTheme.groupBy({
      by: ["themeId"],
      _count: { feedbackId: true },
      orderBy: { _count: { feedbackId: "desc" } },
      take: 6,
    }),
  ]);

  // Map themeIds to real names (Prisma groupBy doesn't support relation fetching natively in one step)
  const themeIds = themeData.map(t => t.themeId);
  const themes = await prisma.theme.findMany({
    where: { id: { in: themeIds } }
  });
  
  const mappedThemeData = themeData.map(t => ({
    ...t,
    theme: themes.find(th => th.id === t.themeId) || { name: "Unknown" }
  }));

  const percentNew = totalFeedback > 0 ? Math.round((newFeedback / totalFeedback) * 100) : 0;
  const negativeCount = sentimentData.find(s => s.sentiment === 'NEG')?._count.id || 0;
  const percentNeg = totalFeedback > 0 ? Math.round((negativeCount / totalFeedback) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-neutral-400">Welcome back. Here is the latest on your customer feedback.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <Inbox className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-400">Total Feedback</p>
              <h2 className="text-3xl font-bold text-white">{totalFeedback}</h2>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-400">Needs Review (New)</p>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-white">{newFeedback}</h2>
                <span className="text-sm text-neutral-500">({percentNew}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-400">Negative Sentiment</p>
               <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-bold text-white">{percentNeg}%</h2>
                <span className="text-sm text-neutral-500">of total</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DashboardCharts 
        channelData={channelData} 
        sentimentData={sentimentData}
        themeData={mappedThemeData}
      />
    </div>
  );
}

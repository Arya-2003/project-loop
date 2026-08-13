import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { InboxClient } from "./InboxClient";

export const dynamic = "force-dynamic";

export default async function InboxPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.workspaceId) return null;

  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page) : 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const channel = typeof searchParams.channel === "string" ? searchParams.channel : undefined;
  const sentiment = typeof searchParams.sentiment === "string" ? searchParams.sentiment : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;

  const whereClause: any = {
    workspaceId: session.user.workspaceId,
  };

  if (search) {
    whereClause.content = { contains: search, mode: "insensitive" };
  }
  if (channel && channel !== "All") {
    whereClause.channel = channel;
  }
  if (sentiment && sentiment !== "All") {
    whereClause.sentiment = sentiment;
  }
  if (status && status !== "All") {
    whereClause.status = status;
  }

  const [items, totalCount] = await Promise.all([
    prisma.feedback.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        themes: {
          include: {
            theme: true,
          },
        },
      },
    }),
    prisma.feedback.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Feedback Inbox</h1>
        <p className="text-neutral-400">Manage and analyze incoming customer feedback.</p>
      </div>

      <InboxClient 
        initialItems={items} 
        totalPages={totalPages} 
        currentPage={page} 
        totalCount={totalCount}
        searchParams={searchParams}
      />
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { classifyFeedback } from "@/lib/ai";

const querySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("20"),
  search: z.string().optional(),
  channel: z.string().optional(),
  sentiment: z.string().optional(),
  status: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse(Object.fromEntries(searchParams.entries()));

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid query parameters" }, { status: 400 });
    }

    const { page, limit, search, channel, sentiment, status } = parsed.data;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

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
        take: limitNum,
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

    return NextResponse.json({
      items,
      totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    console.error("GET Feedback Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Single feedback ingestion
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content, channel, sourceRef, customerLabel } = body;

    if (!content || !channel) {
      return NextResponse.json({ message: "Content and channel are required" }, { status: 400 });
    }

    // Classify using AI
    const aiResult = await classifyFeedback(content);

    const newFeedback = await prisma.$transaction(async (tx) => {
      const feedback = await tx.feedback.create({
        data: {
          content,
          channel,
          sourceRef,
          customerLabel,
          workspaceId: session.user.workspaceId as string,
          sentiment: aiResult.sentiment,
        },
      });

      for (const themeName of aiResult.themes) {
        const theme = await tx.theme.upsert({
          where: {
            workspaceId_name: {
              workspaceId: session.user.workspaceId as string,
              name: themeName,
            },
          },
          update: {},
          create: {
            name: themeName,
            workspaceId: session.user.workspaceId as string,
          },
        });

        await tx.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: theme.id,
          },
        });
      }

      return feedback;
    });

    return NextResponse.json(newFeedback, { status: 201 });
  } catch (error) {
    console.error("POST Feedback Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

// Update feedback status
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ message: "Feedback ID and new status are required" }, { status: 400 });
    }

    const updated = await prisma.feedback.updateMany({
      where: {
        id,
        workspaceId: session.user.workspaceId, // Security check
      },
      data: {
        status,
      },
    });

    if (updated.count === 0) {
       return NextResponse.json({ message: "Not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Status updated" });
  } catch (error) {
    console.error("PATCH Feedback Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { classifyFeedback } from "@/lib/ai";

const bulkSchema = z.array(
  z.object({
    content: z.string().min(1),
    channel: z.string().min(1),
    customerLabel: z.string().optional(),
    sourceRef: z.string().optional(),
  })
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.workspaceId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = bulkSchema.safeParse(body.items);
    if (!parsed.success) {
      return NextResponse.json({ 
        message: "Invalid input", 
        errors: parsed.error.flatten()
      }, { status: 400 });
    }

    const workspaceId = session.user.workspaceId as string;

    // Process each item: Classify with AI, then save
    const processedItems = await Promise.all(
      parsed.data.map(async (item) => {
        // 1. Ask AI for sentiment and themes
        const aiResult = await classifyFeedback(item.content);
        
        // 2. Save Feedback and link Themes in a transaction
        return prisma.$transaction(async (tx) => {
          // Create the feedback with AI sentiment
          const feedback = await tx.feedback.create({
            data: {
              content: item.content,
              channel: item.channel,
              customerLabel: item.customerLabel,
              sourceRef: item.sourceRef,
              workspaceId,
              sentiment: aiResult.sentiment,
            },
          });

          // Ensure all themes exist and link them
          for (const themeName of aiResult.themes) {
            // Upsert the theme for this workspace
            const theme = await tx.theme.upsert({
              where: {
                workspaceId_name: {
                  workspaceId,
                  name: themeName,
                },
              },
              update: {},
              create: {
                name: themeName,
                workspaceId,
              },
            });

            // Link the theme to the feedback
            await tx.feedbackTheme.create({
              data: {
                feedbackId: feedback.id,
                themeId: theme.id,
              },
            });
          }

          return feedback;
        });
      })
    );

    return NextResponse.json({
      message: `Successfully imported and AI-analyzed ${processedItems.length} items`,
      count: processedItems.length,
    }, { status: 201 });
  } catch (error) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

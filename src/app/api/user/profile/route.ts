import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    return NextResponse.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

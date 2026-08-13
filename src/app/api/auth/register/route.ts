import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcrypt";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { name, email, password, workspaceName } = await req.json();

    if (!name || !email || !password || !workspaceName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create workspace and user together
    const user = await prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: { name: workspaceName },
      });

      return await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: Role.ADMIN,
          workspaceId: workspace.id,
        },
      });
    });

    return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Settings } from "lucide-react";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  let workspaceName = "My Workspace";
  if (session?.user?.workspaceId) {
    const ws = await prisma.workspace.findUnique({ where: { id: session.user.workspaceId }});
    if (ws) workspaceName = ws.name;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Settings <Settings className="w-6 h-6 text-neutral-400" />
        </h1>
        <p className="text-neutral-400">Manage your account and workspace preferences.</p>
      </div>

      <SettingsClient user={session?.user} workspaceName={workspaceName} />
    </div>
  );
}

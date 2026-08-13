import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Inbox, TrendingUp, HelpCircle, FileText, Settings, LogOut, Home } from "lucide-react";
import LogoutButton from "@/components/logout-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link href="/dashboard" className="font-bold text-xl text-blue-600 flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18Z" fill="currentColor"/>
              <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14Z" fill="currentColor"/>
            </svg>
            LOOP
          </Link>
        </div>
        
        <div className="px-6 py-4 flex flex-col gap-1 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspace</p>
          <p className="text-sm font-medium text-gray-900 truncate">
            {session.user.workspaceId ? "Acme Corp" : "My Workspace"} {/* We'd fetch real name normally */}
          </p>
          <p className="text-xs text-gray-500 capitalize">{session.user.role.toLowerCase()}</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50">
            <Home className="w-5 h-5" /> Home
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/inbox" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50">
            <Inbox className="w-5 h-5" /> Inbox
          </Link>
          <Link href="/trends" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50">
            <TrendingUp className="w-5 h-5" /> Trends
          </Link>
          <Link href="/ask" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50">
            <HelpCircle className="w-5 h-5" /> Ask LOOP
          </Link>
          <Link href="/reports" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50">
            <FileText className="w-5 h-5" /> Reports
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-1">
          <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50">
            <Settings className="w-5 h-5" /> Settings
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Welcome, {session.user.name}</h1>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-gray-50">
          {children}
        </div>
      </main>
    </div>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50"
    >
      <LogOut className="w-5 h-5" /> Log out
    </button>
  );
}

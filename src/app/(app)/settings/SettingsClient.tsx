"use client";

import { useState } from "react";
import { User, Briefcase, Bell } from "lucide-react";
import { useRouter } from "next/navigation";

export function SettingsClient({ user, workspaceName }: { user: any, workspaceName: string }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      
      if (res.ok) {
        setMessage("Profile updated successfully! (Note: You may need to log out and back in to see the new name in the top bar)");
        router.refresh();
      } else {
        setMessage("Failed to update profile.");
      }
    } catch (e) {
      setMessage("An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {/* Sidebar Tabs */}
      <div className="md:col-span-1 space-y-2">
        <div 
          onClick={() => setActiveTab("profile")}
          className={`rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3 border ${
            activeTab === "profile" ? "bg-neutral-900 border-indigo-500" : "bg-neutral-950 border-neutral-800 hover:border-neutral-600"
          }`}
        >
           <User className={`w-5 h-5 ${activeTab === "profile" ? "text-indigo-400" : "text-neutral-500"}`} />
           <span className={activeTab === "profile" ? "text-neutral-200 font-medium" : "text-neutral-400 font-medium"}>Profile</span>
        </div>
        <div 
          onClick={() => setActiveTab("workspace")}
          className={`rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3 border ${
            activeTab === "workspace" ? "bg-neutral-900 border-indigo-500" : "bg-neutral-950 border-neutral-800 hover:border-neutral-600"
          }`}
        >
           <Briefcase className={`w-5 h-5 ${activeTab === "workspace" ? "text-indigo-400" : "text-neutral-500"}`} />
           <span className={activeTab === "workspace" ? "text-neutral-200 font-medium" : "text-neutral-400 font-medium"}>Workspace</span>
        </div>
        <div 
          onClick={() => setActiveTab("notifications")}
          className={`rounded-xl p-4 cursor-pointer transition-colors flex items-center gap-3 border ${
            activeTab === "notifications" ? "bg-neutral-900 border-indigo-500" : "bg-neutral-950 border-neutral-800 hover:border-neutral-600"
          }`}
        >
           <Bell className={`w-5 h-5 ${activeTab === "notifications" ? "text-indigo-400" : "text-neutral-500"}`} />
           <span className={activeTab === "notifications" ? "text-neutral-200 font-medium" : "text-neutral-400 font-medium"}>Notifications</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
         {activeTab === "profile" && (
           <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-6">Profile Details</h3>
              {message && <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg text-sm">{message}</div>}
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Full Name</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-200 focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Email Address</label>
                <input 
                  disabled 
                  defaultValue={user?.email || ""} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-500 cursor-not-allowed" 
                />
                <p className="text-xs text-neutral-600 mt-1">Email addresses cannot be changed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Role</label>
                <input 
                  disabled 
                  defaultValue={user?.role || ""} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-500 cursor-not-allowed uppercase" 
                />
              </div>
              
              <div className="pt-4 border-t border-neutral-800 mt-6 flex justify-end">
                 <button 
                   onClick={handleSaveProfile}
                   disabled={isSaving || !name.trim()} 
                   className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                 >
                   {isSaving ? "Saving..." : "Save Changes"}
                 </button>
              </div>
           </div>
         )}

         {activeTab === "workspace" && (
           <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-6">Workspace Settings</h3>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Workspace Name</label>
                <input 
                  disabled 
                  defaultValue={workspaceName} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-500 cursor-not-allowed" 
                />
                <p className="text-xs text-neutral-600 mt-1">Only Workspace Owners can rename the workspace.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-1">Workspace ID</label>
                <input 
                  disabled 
                  defaultValue={user?.workspaceId || ""} 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-neutral-500 cursor-not-allowed font-mono text-xs" 
                />
              </div>
           </div>
         )}

         {activeTab === "notifications" && (
           <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-6">Notification Preferences</h3>
              
              <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg bg-neutral-950">
                 <div>
                   <h4 className="text-sm font-medium text-neutral-200">Daily Digest</h4>
                   <p className="text-xs text-neutral-500">Receive a daily email summary of new feedback.</p>
                 </div>
                 <div className="w-10 h-6 bg-indigo-600 rounded-full flex items-center p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full translate-x-4"></div>
                 </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-neutral-800 rounded-lg bg-neutral-950">
                 <div>
                   <h4 className="text-sm font-medium text-neutral-200">Negative Sentiment Alerts</h4>
                   <p className="text-xs text-neutral-500">Get notified immediately when highly negative feedback arrives.</p>
                 </div>
                 <div className="w-10 h-6 bg-neutral-700 rounded-full flex items-center p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-neutral-400 rounded-full"></div>
                 </div>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}

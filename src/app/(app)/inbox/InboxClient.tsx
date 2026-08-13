"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import Papa from "papaparse";

export function InboxClient({ 
  initialItems, 
  totalPages, 
  currentPage, 
  totalCount,
  searchParams
}: any) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [isUploading, setIsUploading] = useState(false);
  const [items, setItems] = useState(initialItems); // Optimistic UI updates

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const p = new URLSearchParams(params.toString());
      if (value === "All" || !value) {
        p.delete(name);
      } else {
        p.set(name, value);
      }
      p.set("page", "1"); // Reset page on filter change
      return p.toString();
    },
    [params]
  );

  const handleFilterChange = (key: string, value: string) => {
    router.push(`${pathname}?${createQueryString(key, value)}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    handleFilterChange("search", formData.get("search") as string);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setItems((prev: any) => prev.map((item: any) => 
      item.id === id ? { ...item, status: newStatus } : item
    ));

    await fetch("/api/feedback", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    router.refresh();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const payload = results.data.map((row: any) => ({
          content: row.content || row.feedback || row.text,
          channel: row.channel || row.source || "CSV",
          customerLabel: row.customer || row.email || "Anonymous",
        })).filter(item => item.content); // Only keep valid rows

        try {
          await fetch("/api/feedback/bulk", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: payload }),
          });
          router.refresh(); // Refresh the page to show new data
        } catch (err) {
          console.error("Upload failed", err);
        } finally {
          setIsUploading(false);
        }
      }
    });
  };

  const simulateZendesk = async () => {
    setIsUploading(true);
    const mockTickets = Array.from({ length: 5 }).map((_, i) => ({
      content: `Simulated ticket #${Math.floor(Math.random() * 1000)}: Customer having issues with login.`,
      channel: "Zendesk",
      customerLabel: `user${i}@example.com`,
    }));
    
    try {
      await fetch("/api/feedback/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: mockTickets }),
      });
      router.refresh();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between bg-neutral-900 p-4 rounded-xl border border-neutral-800">
        <form onSubmit={handleSearch} className="flex-1 max-w-md flex gap-2">
          <input
            name="search"
            defaultValue={params.get("search") || ""}
            placeholder="Search feedback..."
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          <select 
            onChange={(e) => handleFilterChange("status", e.target.value)}
            defaultValue={params.get("status") || "All"}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="NEW">New</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ACTIONED">Actioned</option>
          </select>

          <select 
            onChange={(e) => handleFilterChange("sentiment", e.target.value)}
            defaultValue={params.get("sentiment") || "All"}
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-200 focus:outline-none"
          >
            <option value="All">All Sentiments</option>
            <option value="POS">Positive</option>
            <option value="NEU">Neutral</option>
            <option value="NEG">Negative</option>
          </select>

          <label className="cursor-pointer px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium rounded-lg transition-colors border border-neutral-700">
            {isUploading ? "..." : "CSV"}
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          </label>
          
          <button 
            onClick={simulateZendesk}
            disabled={isUploading}
            className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/20 text-sm font-medium rounded-lg transition-colors"
          >
            Sync Zendesk
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-950/50 text-neutral-400 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-medium">Feedback</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Source</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Sentiment</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Date</th>
                <th className="px-6 py-4 font-medium whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-neutral-500">
                    No feedback found matching your criteria.
                  </td>
                </tr>
              )}
              {items.map((item: any) => (
                <tr key={item.id} className="hover:bg-neutral-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="line-clamp-2 leading-relaxed">{item.content}</p>
                    {item.themes?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {item.themes.map((t: any) => (
                          <span key={t.theme.id} className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700">
                            {t.theme.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="font-medium text-neutral-200">{item.channel}</span>
                      <span className="text-xs text-neutral-500">{item.customerLabel || "Anonymous"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${item.sentiment === 'POS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        item.sentiment === 'NEG' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}
                    >
                      {item.sentiment === 'POS' ? 'Positive' : item.sentiment === 'NEG' ? 'Negative' : 'Neutral'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-neutral-400">
                    {format(new Date(item.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className={`text-xs font-medium rounded-full px-2.5 py-1 pr-6 border appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500
                        ${item.status === 'NEW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          item.status === 'REVIEWED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}
                    >
                      <option value="NEW" className="bg-neutral-900">New</option>
                      <option value="REVIEWED" className="bg-neutral-900">Reviewed</option>
                      <option value="ACTIONED" className="bg-neutral-900">Actioned</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="bg-neutral-950/50 border-t border-neutral-800 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              Showing <span className="font-medium text-neutral-200">{items.length}</span> of <span className="font-medium text-neutral-200">{totalCount}</span> results
            </div>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => {
                  const p = new URLSearchParams(params.toString());
                  p.set("page", (currentPage - 1).toString());
                  router.push(`${pathname}?${p.toString()}`);
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => {
                  const p = new URLSearchParams(params.toString());
                  p.set("page", (currentPage + 1).toString());
                  router.push(`${pathname}?${p.toString()}`);
                }}
                className="px-3 py-1.5 text-sm font-medium rounded-md bg-neutral-800 text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

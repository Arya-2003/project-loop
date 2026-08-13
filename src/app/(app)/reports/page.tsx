export const dynamic = "force-dynamic";
import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Automated Reports <FileText className="w-6 h-6 text-blue-400" />
          </h1>
          <p className="text-neutral-400">View and download your weekly AI-generated summaries.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <Download className="w-4 h-4" /> Generate Report
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <FileText className="w-16 h-16 text-neutral-700 mb-4" />
          <h3 className="text-xl font-medium text-neutral-300">No reports generated yet</h3>
          <p className="text-neutral-500 mt-2 max-w-md">
            Click the "Generate Report" button above to run the AI summary engine on this week's feedback data.
          </p>
        </div>
      </div>
    </div>
  );
}

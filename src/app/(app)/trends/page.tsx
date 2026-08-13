export const dynamic = "force-dynamic";
import { TrendingUp, BarChart2 } from "lucide-react";

export default function TrendsPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Feedback Trends <TrendingUp className="w-6 h-6 text-emerald-400" />
        </h1>
        <p className="text-neutral-400">Deep dive into historical sentiment and volume changes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center text-center min-h-[300px]">
          <BarChart2 className="w-12 h-12 text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-neutral-300">Sentiment Over Time</h3>
          <p className="text-sm text-neutral-500 mt-2">Historical charting module pending data aggregation pipeline.</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 shadow-xl flex flex-col items-center justify-center text-center min-h-[300px]">
          <TrendingUp className="w-12 h-12 text-neutral-600 mb-4" />
          <h3 className="text-lg font-medium text-neutral-300">Volume Forecast</h3>
          <p className="text-sm text-neutral-500 mt-2">Predictive analytics module pending AI integration.</p>
        </div>
      </div>
    </div>
  );
}

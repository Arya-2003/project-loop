"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const SENTIMENT_COLORS = {
  POS: "#10b981", // emerald
  NEU: "#6366f1", // indigo
  NEG: "#f43f5e", // rose
};

export function DashboardCharts({ 
  channelData, 
  sentimentData, 
  themeData 
}: { 
  channelData: any[],
  sentimentData: any[],
  themeData: any[]
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Channels Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-medium text-neutral-100 mb-6">Feedback by Channel</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="channel" type="category" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: '#262626' }}
                contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#e5e5e5' }}
              />
              <Bar dataKey="_count.id" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Chart */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-lg font-medium text-neutral-100 mb-6">Sentiment Overview</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={110}
                paddingAngle={5}
                dataKey="_count.id"
                nameKey="sentiment"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SENTIMENT_COLORS[entry.sentiment as keyof typeof SENTIMENT_COLORS] || '#a3a3a3'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#171717', border: '1px solid #262626', borderRadius: '8px', color: '#e5e5e5' }}
                formatter={(value, name) => [value, name === 'POS' ? 'Positive' : name === 'NEG' ? 'Negative' : 'Neutral']}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                formatter={(value) => <span className="text-neutral-400">{value === 'POS' ? 'Positive' : value === 'NEG' ? 'Negative' : 'Neutral'}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Themes List (could also be a chart) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl lg:col-span-2">
         <h3 className="text-lg font-medium text-neutral-100 mb-6">Top Themes Identified by AI</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themeData.map((t) => (
              <div key={t.themeId} className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 flex justify-between items-center">
                <span className="text-neutral-200 font-medium">{t.theme.name}</span>
                <span className="bg-neutral-800 text-neutral-400 px-2 py-1 rounded text-xs">
                  {t._count.feedbackId} items
                </span>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}

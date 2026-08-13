export const dynamic = "force-dynamic";
import { Search, Sparkles } from "lucide-react";

export default function AskLoopPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Ask LOOP <Sparkles className="w-6 h-6 text-indigo-400" />
        </h1>
        <p className="text-neutral-400">Ask natural language questions about your customer feedback.</p>
      </div>

      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center text-center space-y-4">
         <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mb-4">
           <Search className="w-8 h-8 text-indigo-400" />
         </div>
         <h2 className="text-xl font-semibold text-white">Semantic Search (Coming Soon)</h2>
         <p className="text-neutral-400 max-w-md">
           This interface will soon be powered by `pgvector` and an embedding model, allowing you to ask questions like: <br/><br/>
           <span className="italic text-indigo-300">"What are users saying about the new checkout flow?"</span>
         </p>
         
         <div className="w-full max-w-xl mt-8 relative">
           <input 
             disabled 
             placeholder="Type your question here (Simulated Preview)..." 
             className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-6 py-4 text-neutral-400 cursor-not-allowed focus:outline-none"
           />
           <button disabled className="absolute right-2 top-2 px-4 py-2 bg-indigo-600/50 text-white rounded-lg cursor-not-allowed">
             Ask
           </button>
         </div>
      </div>
    </div>
  );
}

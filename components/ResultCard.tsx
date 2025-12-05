
import React, { useState } from 'react';
import { SynthesisResult, ExplorationResult, AppMode, DemoResult } from '../types';
import { synthesizeDemo } from '../services/geminiService';
import { Box, Loader2, Zap, GitCommit, ArrowRight, MousePointer2, RefreshCw } from 'lucide-react';

interface ResultCardProps {
  result: SynthesisResult | ExplorationResult;
  mode: AppMode;
  imageUrl: string | null;
  onVisualize?: (prompt: string) => void;
  isGeneratingImage?: boolean;
}

const ScoreBar: React.FC<{ label: string; score: number; colorClass: string }> = ({ label, score, colorClass }) => (
  <div className="w-full">
    <div className="flex justify-between mb-1">
      <span className="text-xs font-mono uppercase text-slate-400">{label}</span>
      <span className={`text-xs font-mono font-bold ${colorClass}`}>{score}%</span>
    </div>
    <div className="w-full bg-slate-800 rounded-full h-2">
      <div 
        className={`h-2 rounded-full ${colorClass.replace('text-', 'bg-')} transition-all duration-1000`} 
        style={{ width: `${score}%` }}
      ></div>
    </div>
  </div>
);

// Graph Theory Bridge Visualizer
const LogicBridge: React.FC<{ path?: string[] }> = ({ path }) => {
  if (!path || path.length < 2) return null;

  return (
    <div className="mb-6 bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <GitCommit className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-mono uppercase tracking-widest text-slate-400">Graph Theory Logic Bridge</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {path.map((node, idx) => (
          <React.Fragment key={idx}>
            <div className={`
              px-3 py-1.5 rounded-md text-sm font-mono font-semibold border
              ${idx === 0 || idx === path.length - 1 
                ? 'bg-slate-700 text-white border-slate-600' 
                : 'bg-cyan-950/30 text-cyan-300 border-cyan-800/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]'}
            `}>
              {node}
            </div>
            {idx < path.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-600" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const DemoSection: React.FC<{ title: string; description: string; variant?: 'full' | 'compact' }> = ({ title, description, variant = 'full' }) => {
  const [loading, setLoading] = useState(false);
  const [demo, setDemo] = useState<DemoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await synthesizeDemo(title, description);
      setDemo(result);
    } catch (e: any) {
      console.error("Demo gen failed", e);
      setError("Prototype simulation unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const DemoDisplay = () => {
    if (!demo) return null;
    return (
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden animate-fade-in shadow-xl relative mt-4">
        <div className="absolute top-0 left-0 right-0 h-8 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-3 z-10">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-2">
            <Box className="w-3 h-3" /> {demo.label}
          </span>
          <span className="text-[10px] text-slate-500 flex items-center gap-2">
             {demo.instructions} <MousePointer2 className="w-3 h-3" />
          </span>
        </div>
        <div className="pt-8 h-80 bg-[#020617] relative">
           <iframe 
             srcDoc={demo.code}
             title="Interactive Demo"
             className="w-full h-full border-0"
             sandbox="allow-scripts allow-same-origin"
           />
        </div>
        <button 
           onClick={handleGenerateDemo} 
           className="absolute bottom-2 right-2 p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded transition-colors"
           title="Regenerate Simulation"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    );
  };

  if (variant === 'compact') {
     return (
       <div className="mt-3 pt-3 border-t border-slate-800/50">
          {!demo ? (
            <button 
              onClick={handleGenerateDemo}
              disabled={loading}
              className="w-full py-2 bg-slate-800/50 hover:bg-slate-700 text-xs font-mono text-fuchsia-400 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-transparent hover:border-fuchsia-500/30"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
              {loading ? 'CODING SIMULATION...' : 'LAUNCH SIMULATION'}
            </button>
          ) : (
            <DemoDisplay />
          )}
          {error && <div className="text-[10px] text-red-400 mt-1">{error}</div>}
       </div>
     );
  }

  // Full Variant
  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
       <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Zap className="w-4 h-4 text-fuchsia-500" /> Prototype Lab
          </h3>
          {!demo && !error && (
            <button 
              onClick={handleGenerateDemo}
              disabled={loading}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Box className="w-3 h-3" />}
              {loading ? 'INITIALIZING...' : 'GENERATE INTERACTIVE DEMO'}
            </button>
          )}
       </div>
       
       {error && (
         <div className="bg-red-900/10 border border-red-500/20 text-red-400 text-xs p-3 rounded">
           {error}
         </div>
       )}

       {demo && <DemoDisplay />}
    </div>
  );
};

const ResultCard: React.FC<ResultCardProps> = ({ result, mode, imageUrl, onVisualize, isGeneratingImage }) => {
  
  // --- COLLISION MODE VIEW ---
  if (mode === AppMode.COLLISION) {
    const data = result as SynthesisResult;
    return (
      <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
        {/* Banner Image */}
        <div className="relative h-64 md:h-80 bg-slate-950 overflow-hidden group">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Generated Blueprint" 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-600 space-y-2">
               {isGeneratingImage ? (
                  <>
                     <div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                     <span className="font-mono text-xs">RENDERING BLUEPRINT...</span>
                  </>
               ) : (
                 <span className="font-mono text-xs text-slate-700">VISUAL DATA UNAVAILABLE</span>
               )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          
          <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 font-sans tracking-tight drop-shadow-lg">
                {data.disciplineName}
              </h2>
              <p className="text-slate-300 italic font-serif text-lg mt-2 opacity-90">"{data.tagline}"</p>
          </div>
        </div>

        <div className="p-6 md:p-10 space-y-8">
          
          {/* LOGIC BRIDGE */}
          <LogicBridge path={data.logicPath} />

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-slate-800/30 p-5 rounded-xl border border-slate-700/50">
               <ScoreBar label="Feasibility" score={data.feasibilityScore} colorClass="text-emerald-400" />
               <p className="mt-3 text-sm text-slate-400 leading-relaxed">{data.feasibilityAnalysis}</p>
            </div>
          </div>

          <section>
            <h3 className="text-xs font-mono text-cyan-500 uppercase tracking-widest mb-2">Definition</h3>
            <p className="text-slate-200 text-lg leading-relaxed border-l-2 border-cyan-500/30 pl-4">
              {data.definition}
            </p>
          </section>

          <section>
            <h3 className="text-xs font-mono text-fuchsia-500 uppercase tracking-widest mb-4">Core Axioms</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.axioms.map((axiom, idx) => (
                <div key={idx} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 hover:border-fuchsia-500/50 transition-colors">
                  <div className="text-fuchsia-500/50 font-bold text-xl mb-2">0{idx + 1}</div>
                  <p className="text-slate-300 text-sm">{axiom}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
            <h3 className="text-xs font-mono text-emerald-400 uppercase tracking-widest mb-2">Real-World Application</h3>
            <p className="text-slate-200">{data.application}</p>
          </section>

          {/* DEMO SECTION */}
          <DemoSection title={data.disciplineName} description={data.application} />
        </div>
      </div>
    );
  }

  // --- EXPLORATION MODE VIEW ---
  const data = result as ExplorationResult;
  return (
    <div className="w-full space-y-8 animate-fade-in-up">
      
      {/* Overview & Chart */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-slate-100 mb-6">
          Fringe Analysis: <span className="text-cyan-400">{data.rootConcept}</span>
        </h2>
        
        {/* Comparative Chart */}
        <div className="space-y-4">
           <div className="flex justify-between text-xs font-mono text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">
              <span>Discipline Name</span>
              <div className="flex gap-12 text-right">
                <span className="w-24">Feasibility</span>
              </div>
           </div>
           {data.fields.map((field, idx) => (
             <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 group">
                <div className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">{field.name}</div>
                <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full md:w-auto">
                   <div className="w-full md:w-24 relative h-2 md:h-auto bg-slate-800 md:bg-transparent rounded-full overflow-hidden md:overflow-visible">
                      <div className="absolute inset-0 bg-emerald-500/20 hidden md:block rounded-sm" style={{ width: `${field.feasibilityScore}%` }}></div>
                      <div className="h-full bg-emerald-500 md:hidden" style={{ width: `${field.feasibilityScore}%` }}></div>
                      <span className="relative z-10 text-emerald-400 text-sm font-mono hidden md:block">{field.feasibilityScore}%</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Main Visual */}
      <div className="relative w-full h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
         {imageUrl ? (
           <>
            <img src={imageUrl} alt="Visualization" className="w-full h-full object-cover" />
            <div className="absolute bottom-2 right-2 bg-black/70 px-3 py-1 text-xs text-white font-mono rounded backdrop-blur">
               FIG 1.0: CONCEPTUAL SCHEMATIC
            </div>
           </>
         ) : (
            <div className="flex items-center justify-center w-full h-full text-slate-500 font-mono text-xs gap-3">
               {isGeneratingImage ? <div className="w-4 h-4 rounded-full border-2 border-slate-500 border-t-white animate-spin"/> : null}
               {isGeneratingImage ? 'GENERATING SCHEMATIC...' : 'VISUALIZATION PENDING...'}
            </div>
         )}
      </div>

      {/* Cards for each field */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.fields.map((field, idx) => (
          <div key={idx} className={`bg-slate-900 border ${imageUrl && idx === 0 ? 'border-cyan-500/50' : 'border-slate-800'} p-6 rounded-xl hover:bg-slate-800/50 transition-colors flex flex-col`}>
             <div className="mb-4">
               <div className="text-xs font-mono text-slate-500 mb-1">OPTION 0{idx+1}</div>
               <h3 className="text-xl font-bold text-white mb-2">{field.name}</h3>
               <p className="text-sm text-slate-400 leading-relaxed min-h-[80px]">{field.description}</p>
             </div>
             <div className="mt-auto pt-4 border-t border-slate-800">
               <div className="text-xs uppercase tracking-widest text-slate-500 mb-2">Application</div>
               <p className="text-xs text-slate-300">{field.application}</p>
               
               {/* Schematic Button */}
               {onVisualize && (
                 <button 
                   onClick={() => onVisualize(field.visualPrompt)}
                   disabled={isGeneratingImage}
                   className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-400 rounded transition-colors disabled:opacity-50"
                 >
                   {isGeneratingImage ? 'PROCESSING...' : 'GENERATE SCHEMATIC'}
                 </button>
               )}

               {/* COMPACT DEMO SECTION FOR EXPLORATION ITEMS */}
               <DemoSection title={field.name} description={field.application} variant="compact" />

             </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ResultCard;

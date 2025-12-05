
import React, { useEffect, useState } from 'react';
import { ColliderStatus, AppMode } from '../types';

interface CollisionVisualizerProps {
  status: ColliderStatus;
  mode: AppMode;
  conceptA: string;
  conceptB?: string;
}

const CollisionVisualizer: React.FC<CollisionVisualizerProps> = ({ status, mode, conceptA, conceptB }) => {
  const [showImpact, setShowImpact] = useState(false);

  useEffect(() => {
    if (status === ColliderStatus.COLLIDING) {
      const timer = setTimeout(() => setShowImpact(true), 1200); 
      return () => clearTimeout(timer);
    } else if (status === ColliderStatus.IDLE) {
      setShowImpact(false);
    }
  }, [status]);

  if (status === ColliderStatus.IDLE || status === ColliderStatus.COMPLETE || status === ColliderStatus.ERROR) {
    return null;
  }

  return (
    <div className="relative w-full h-64 md:h-80 flex items-center justify-center overflow-hidden bg-slate-950/50 rounded-xl border border-slate-800 my-8">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

      {/* --- COLLISION MODE ANIMATION --- */}
      {mode === AppMode.COLLISION && (
        <>
          {/* Particle A (Left) */}
          <div className={`absolute left-0 flex flex-col items-center transition-all duration-[2000ms] ease-in
            ${status === ColliderStatus.ACCELERATING ? 'translate-x-[10%]' : ''}
            ${status === ColliderStatus.COLLIDING ? 'translate-x-[calc(50vw-20px)] opacity-0' : ''}
            ${status === ColliderStatus.SYNTHESIZING ? 'opacity-0' : ''}
          `}>
            <div className="w-12 h-12 rounded-full bg-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.8)] animate-pulse"></div>
            <div className="mt-4 text-cyan-400 font-mono text-sm opacity-70 whitespace-nowrap">{conceptA}</div>
          </div>

          {/* Particle B (Right) */}
          <div className={`absolute right-0 flex flex-col items-center transition-all duration-[2000ms] ease-in
             ${status === ColliderStatus.ACCELERATING ? '-translate-x-[10%]' : ''}
             ${status === ColliderStatus.COLLIDING ? '-translate-x-[calc(50vw-20px)] opacity-0' : ''}
             ${status === ColliderStatus.SYNTHESIZING ? 'opacity-0' : ''}
          `}>
            <div className="w-12 h-12 rounded-full bg-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.8)] animate-pulse"></div>
            <div className="mt-4 text-fuchsia-400 font-mono text-sm opacity-70 whitespace-nowrap">{conceptB}</div>
          </div>
        </>
      )}

      {/* --- EXPLORATION MODE ANIMATION --- */}
      {mode === AppMode.EXPLORATION && (
        <>
           {/* Single Source Particle */}
           <div className={`absolute flex flex-col items-center transition-all duration-[2000ms] ease-in-out
             ${status === ColliderStatus.ACCELERATING ? 'scale-150' : ''}
             ${status === ColliderStatus.COLLIDING ? 'scale-0 opacity-0' : ''}
           `}>
             <div className="w-16 h-16 rounded-full bg-white shadow-[0_0_50px_rgba(255,255,255,0.8)] animate-pulse"></div>
             <div className="mt-4 text-slate-200 font-mono text-sm opacity-70">{conceptA}</div>
           </div>

           {/* Splitting Particles (The Prism Effect) */}
           {showImpact && (
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-white animate-ping absolute"></div>
                {/* 3 Directions */}
                <div className="absolute w-4 h-4 bg-emerald-500 rounded-full animate-[ping_1s_infinite] translate-y-[-50px] translate-x-[-50px]"></div>
                <div className="absolute w-4 h-4 bg-amber-500 rounded-full animate-[ping_1.2s_infinite] translate-y-[-50px] translate-x-[50px]"></div>
                <div className="absolute w-4 h-4 bg-purple-500 rounded-full animate-[ping_1.5s_infinite] translate-y-[60px]"></div>
             </div>
           )}
        </>
      )}

      {/* Explosion / Flash (Common) */}
      {showImpact && mode === AppMode.COLLISION && (
        <div className="absolute z-10 flex flex-col items-center justify-center">
             <div className="relative">
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75 blur-xl w-32 h-32"></div>
                <div className="relative rounded-full bg-white w-4 h-4 shadow-[0_0_100px_50px_rgba(255,255,255,0.8)]"></div>
             </div>
        </div>
      )}

      {/* Synthesis Spinner */}
      {status === ColliderStatus.SYNTHESIZING && (
        <div className="absolute z-20 flex flex-col items-center animate-fade-in">
           <div className="w-24 h-24 border-4 border-t-cyan-500 border-r-fuchsia-500 border-b-emerald-500 border-l-amber-500 rounded-full animate-spin shadow-2xl"></div>
           <p className="mt-6 text-slate-300 font-mono tracking-widest animate-pulse">
             {mode === AppMode.COLLISION ? 'SYNTHESIZING REALITY...' : 'MAPPING FRINGE VECTORS...'}
           </p>
        </div>
      )}
    </div>
  );
};

export default CollisionVisualizer;

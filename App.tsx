import React, { useState, useCallback } from 'react';
import { synthesizeConcepts, generateBlueprint, exploreConcept, generateLogicPath } from './services/geminiService';
import { SynthesisResult, ExplorationResult, ColliderStatus, AppMode, AnyResult } from './types';
import CollisionVisualizer from './components/CollisionVisualizer';
import ResultCard from './components/ResultCard';
import { Atom, Zap, Layers, Microscope } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.COLLISION);
  const [conceptA, setConceptA] = useState('');
  const [conceptB, setConceptB] = useState('');

  const [status, setStatus] = useState<ColliderStatus>(ColliderStatus.IDLE);
  const [result, setResult] = useState<AnyResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const handleStart = useCallback(async () => {
    if (!conceptA) return;
    if (mode === AppMode.COLLISION && !conceptB) return;

    // Reset State
    setResult(null);
    setImageUrl(null);
    setErrorMsg(null);
    setIsGeneratingImage(false);

    // Step 1: Animation Sequence
    setStatus(ColliderStatus.ACCELERATING);

    try {
      // 1.5 Graph Theory Logic Bridge (Collision Mode Only)
      let logicPath: string[] | undefined;

      if (mode === AppMode.COLLISION) {
        // Wait briefly for animation
        await new Promise(resolve => setTimeout(resolve, 500));
        setStatus(ColliderStatus.SEARCHING_GRAPH);

        // AI Logic Path Generation (Step 1: Generate Chain)
        // We strictly use AI now to ensure a rich 4-6 step semantic chain is created
        // instead of relying on sparse Wikipedia links.
        try {
          logicPath = await generateLogicPath(conceptA, conceptB);
        } catch (e) {
          console.warn("Logic path generation failed, proceeding without bridge", e);
        }
      }

      // Step 2: Gemini Synthesis (Step 2: Generate Rest based on Chain)
      setStatus(ColliderStatus.COLLIDING); // Animation Impact

      // Parallelize API call with animation
      let apiPromise: Promise<AnyResult>;
      if (mode === AppMode.COLLISION) {
        // Pass the generated chain to the synthesizer
        apiPromise = synthesizeConcepts(conceptA, conceptB, logicPath);
      } else {
        apiPromise = exploreConcept(conceptA);
      }

      // Animation wait
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus(ColliderStatus.SYNTHESIZING);

      // Wait for API Result
      const data = await apiPromise;
      setResult(data);
      setStatus(ColliderStatus.COMPLETE);

      // Auto-start Image Gen for the best result
      let promptToUse = '';
      if (mode === AppMode.COLLISION) {
        promptToUse = (data as SynthesisResult).visualPrompt;
      } else {
        // For exploration, pick the first field by default
        promptToUse = (data as ExplorationResult).fields[0].visualPrompt;
      }

      handleVisualize(promptToUse);

    } catch (error) {
      console.error(error);
      setErrorMsg("Experiment failed. The data stream was unstable.");
      setStatus(ColliderStatus.ERROR);
    }
  }, [conceptA, conceptB, mode]);

  const handleVisualize = async (prompt: string) => {
    try {
      setIsGeneratingImage(true);
      setImageUrl(null); // clear old image
      const url = await generateBlueprint(prompt);
      if (url) {
        setImageUrl(url);
      }
    } catch (e) {
      console.error("Visual gen failed", e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleReset = () => {
    setConceptA('');
    setConceptB('');
    setStatus(ColliderStatus.IDLE);
    setResult(null);
    setImageUrl(null);
  };

  const toggleMode = (newMode: AppMode) => {
    if (status !== ColliderStatus.IDLE && status !== ColliderStatus.COMPLETE && status !== ColliderStatus.ERROR) return;
    setMode(newMode);
    handleReset();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-100 flex flex-col">

      {/* Header */}
      <header className="w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <Atom className="text-cyan-400 w-6 h-6 animate-spin-slow" />
            <h1 className="font-bold text-xl tracking-tighter">CONCEPT<span className="text-cyan-400">COLLIDER</span></h1>
          </div>

          {/* Mode Switcher in Header */}
          <div className="flex bg-slate-900 rounded-full p-1 border border-slate-800">
            <button
              onClick={() => toggleMode(AppMode.COLLISION)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === AppMode.COLLISION ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Layers className="w-3 h-3" /> FUSION
            </button>
            <button
              onClick={() => toggleMode(AppMode.EXPLORATION)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 ${mode === AppMode.EXPLORATION ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Microscope className="w-3 h-3" /> EXPLORE
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">

        {/* Intro Text */}
        {status === ColliderStatus.IDLE && !result && (
          <div className="text-center mb-12 max-w-2xl animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
              {mode === AppMode.COLLISION ? 'Synthesize the Unknown' : 'Map the Fringe'}
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              {mode === AppMode.COLLISION
                ? 'Collide two unrelated concepts to generate a new, theoretically self-consistent discipline.'
                : 'Input a single domain to discover three underdeveloped, high-potential research vectors.'}
            </p>
          </div>
        )}

        {/* Input Stage */}
        <div className={`w-full transition-all duration-500 ${status !== ColliderStatus.IDLE && status !== ColliderStatus.COMPLETE ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className={`flex flex-col md:flex-row gap-4 items-center justify-center relative ${mode === AppMode.EXPLORATION ? 'max-w-xl mx-auto' : ''}`}>

            {/* Concept A */}
            <div className="w-full relative group">
              <input
                type="text"
                value={conceptA}
                onChange={(e) => setConceptA(e.target.value)}
                placeholder={mode === AppMode.COLLISION ? "Concept A (e.g. Mycology)" : "Root Domain (e.g. Cognitive Science)"}
                disabled={status !== ColliderStatus.IDLE && status !== ColliderStatus.COMPLETE && status !== ColliderStatus.ERROR}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-6 py-4 text-xl md:text-2xl focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-700 text-center"
              />
            </div>

            {/* VS Icon or Spacer */}
            {mode === AppMode.COLLISION && (
              <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-500 font-mono text-xs z-10">
                X
              </div>
            )}

            {/* Concept B (Only for Collision) */}
            {mode === AppMode.COLLISION && (
              <div className="w-full relative group">
                <input
                  type="text"
                  value={conceptB}
                  onChange={(e) => setConceptB(e.target.value)}
                  placeholder="Concept B (e.g. Architecture)"
                  disabled={status !== ColliderStatus.IDLE && status !== ColliderStatus.COMPLETE && status !== ColliderStatus.ERROR}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-6 py-4 text-xl md:text-2xl focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-all placeholder:text-slate-700 text-center"
                />
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-center">
            {(status === ColliderStatus.IDLE || status === ColliderStatus.ERROR) && (
              <button
                onClick={handleStart}
                disabled={!conceptA || (mode === AppMode.COLLISION && !conceptB)}
                className="group relative px-8 py-4 bg-slate-100 text-slate-950 font-bold text-lg rounded-full overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 via-white to-fuchsia-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span className="flex items-center gap-2">
                  {mode === AppMode.COLLISION ? 'INITIATE COLLISION' : 'RUN SPECTRAL ANALYSIS'} <Zap className="w-4 h-4" />
                </span>
              </button>
            )}

            {status === ColliderStatus.COMPLETE && (
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-white rounded-full transition-all text-sm font-mono uppercase tracking-widest"
              >
                Reset System
              </button>
            )}
          </div>
        </div>

        {/* Animation Visualizer */}
        <CollisionVisualizer status={status} mode={mode} conceptA={conceptA} conceptB={conceptB} />

        {/* Error Message */}
        {errorMsg && (
          <div className="mt-8 p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg max-w-md text-center animate-fade-in">
            {errorMsg}
          </div>
        )}

        {/* Result Display */}
        {result && status === ColliderStatus.COMPLETE && (
          <div className="mt-12 w-full">
            <ResultCard
              result={result}
              mode={mode}
              imageUrl={imageUrl}
              onVisualize={handleVisualize}
              isGeneratingImage={isGeneratingImage}
            />
          </div>
        )}

      </main>

      <footer className="w-full py-6 border-t border-slate-900 text-center text-slate-600 text-sm">
        <p>© 2025 Concept Collider. Created by Jerry and Daniel</p>
      </footer>
    </div>
  );
};

export default App;
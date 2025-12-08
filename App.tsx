import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Node, OptimizationParams, OptimizationResponse, AppState, ScenarioType } from './types';
import { SCENARIOS } from './data/scenarios';
import ControlPanel from './components/ControlPanel';
import Visualizer from './components/Visualizer';
import Metrics from './components/Metrics';
import { runOptimization } from './services/geminiService';
import { PlayCircle, PauseCircle, SkipForward } from 'lucide-react';

const INITIAL_NODES_COUNT = 15;

const generateNodes = (count: number): Node[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.floor(Math.random() * 90) + 5, // Keep within 5-95 margin
    y: Math.floor(Math.random() * 90) + 5,
  }));
};

const App: React.FC = () => {
  const [nodeCount, setNodeCount] = useState(INITIAL_NODES_COUNT);
  
  const [state, setState] = useState<AppState>({
    nodes: [],
    params: {
      steps: 5000,
      init_temp: 50,
      tunneling_rate: 0.25,
    },
    result: null,
    isOptimizing: false,
    playbackIndex: -1,
    isPlaying: false,
    error: null,
    scenario: 'random',
    startNodeId: 0,
  });

  // Handle Scenario Switching
  useEffect(() => {
    const scenarioConfig = SCENARIOS[state.scenario];
    
    let newNodes: Node[] = [];
    if (scenarioConfig.fixedNodes && 'nodes' in scenarioConfig) {
      newNodes = [...scenarioConfig.nodes!];
    } else {
      newNodes = generateNodes(nodeCount);
    }

    setState(prev => ({
      ...prev,
      nodes: newNodes,
      result: null,
      playbackIndex: -1,
      isPlaying: false,
      startNodeId: 0, // Reset start node to first available
    }));
  }, [state.scenario, nodeCount]);

  const handleSetScenario = (scenario: ScenarioType) => {
    setState(prev => ({ ...prev, scenario }));
  };

  const handleSetStartNodeId = (id: number) => {
     setState(prev => ({ ...prev, startNodeId: id }));
  };

  const handleResetNodes = () => {
    if (state.scenario !== 'random') return;
    setState(prev => ({ 
      ...prev, 
      nodes: generateNodes(nodeCount), 
      result: null, 
      playbackIndex: -1,
      isPlaying: false,
      startNodeId: 0,
    }));
  };

  const handleParamsChange = (newParams: React.SetStateAction<OptimizationParams>) => {
    setState(prev => ({
      ...prev,
      params: typeof newParams === 'function' ? newParams(prev.params) : newParams
    }));
  };

  const handleOptimize = async () => {
    setState(prev => ({ ...prev, isOptimizing: true, error: null, result: null, playbackIndex: -1 }));
    try {
      // Pass the scenario description as context
      const context = SCENARIOS[state.scenario].description;
      const result = await runOptimization(state.nodes, state.params, state.startNodeId, context);
      
      setState(prev => ({
        ...prev,
        result,
        isOptimizing: false,
        playbackIndex: 0,
        isPlaying: true, // Auto play on success
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isOptimizing: false,
        error: err.message || "An unexpected error occurred",
      }));
    }
  };

  // Animation Loop
  const animationRef = useRef<number>();
  
  const tick = useCallback(() => {
    setState(prev => {
      if (!prev.isPlaying || !prev.result || prev.playbackIndex >= prev.result.iterations.length - 1) {
        return { ...prev, isPlaying: false };
      }
      return { ...prev, playbackIndex: prev.playbackIndex + 1 };
    });
    animationRef.current = requestAnimationFrame(() => {
        // Slow down animation slightly for visibility
        setTimeout(tick, 200); 
    });
  }, []);

  useEffect(() => {
    if (state.isPlaying) {
      animationRef.current = requestAnimationFrame(tick);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [state.isPlaying, tick]);


  // Derived state for Visualizer
  const currentIteration = state.result && state.playbackIndex >= 0 
    ? state.result.iterations[state.playbackIndex] 
    : null;
    
  const displayRoute = currentIteration ? currentIteration.current_route : null;
  const bestRoute = currentIteration ? currentIteration.best_route : null;
  const isTunneling = currentIteration ? currentIteration.tunneling : false;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-qdark text-slate-200 font-sans overflow-hidden">
      
      {/* Left Panel: Controls */}
      <ControlPanel 
        params={state.params}
        setParams={handleParamsChange}
        onOptimize={handleOptimize}
        onReset={handleResetNodes}
        isOptimizing={state.isOptimizing}
        nodeCount={nodeCount}
        setNodeCount={setNodeCount}
        scenario={state.scenario}
        setScenario={handleSetScenario}
        nodes={state.nodes}
        startNodeId={state.startNodeId}
        setStartNodeId={handleSetStartNodeId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden p-4 gap-4">
        
        {/* Top Bar: Playback Controls */}
        <div className="flex justify-between items-center bg-qpanel p-3 rounded-lg border border-slate-800">
          <div className="text-sm font-mono text-slate-400">
            CONTEXT: <span className="text-white mr-4">{SCENARIOS[state.scenario].label}</span>
            STATUS: <span className={state.isOptimizing ? "text-yellow-400 animate-pulse" : "text-qcyan"}>
              {state.isOptimizing ? "OPTIMIZING..." : state.result ? "COMPLETE" : "READY"}
            </span>
          </div>
          
          {state.result && (
             <div className="flex items-center gap-4">
               <span className="text-xs text-slate-500 font-mono">
                 FRAME {state.playbackIndex + 1} / {state.result.iterations.length}
               </span>
               <button 
                 onClick={() => setState(prev => ({...prev, isPlaying: !prev.isPlaying}))}
                 className="hover:text-qcyan transition-colors"
               >
                 {state.isPlaying ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
               </button>
               <button 
                 onClick={() => setState(prev => ({...prev, playbackIndex: prev.result!.iterations.length - 1, isPlaying: false}))}
                 className="hover:text-qcyan transition-colors"
               >
                  <SkipForward className="w-6 h-6" />
               </button>
             </div>
          )}
        </div>

        {/* Visualization & Metrics Split */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
          
          {/* Visualizer */}
          <div className="flex-[2] relative min-h-[400px]">
            <Visualizer 
              nodes={state.nodes} 
              route={displayRoute} 
              bestRoute={bestRoute}
              tunneling={isTunneling}
              startNodeId={state.startNodeId}
            />
            {state.error && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8">
                 <div className="text-red-500 border border-red-900 bg-red-950/30 p-6 rounded-lg max-w-md text-center">
                   <h3 className="font-bold text-lg mb-2">Simulation Error</h3>
                   <p>{state.error}</p>
                   <button 
                    onClick={() => setState(prev => ({...prev, error: null}))}
                    className="mt-4 px-4 py-2 bg-red-900 hover:bg-red-800 text-white rounded text-sm"
                   >
                     Dismiss
                   </button>
                 </div>
              </div>
            )}
          </div>

          {/* Metrics Panel */}
          <div className="flex-1 min-h-[300px] bg-qpanel rounded-xl border border-slate-800 p-4 overflow-hidden">
            <Metrics 
              data={state.result} 
              currentStepIndex={state.playbackIndex} 
              nodes={state.nodes}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
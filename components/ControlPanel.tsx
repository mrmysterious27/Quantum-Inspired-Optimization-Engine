import React from 'react';
import { OptimizationParams, ScenarioType, Node, AlgorithmType } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { Play, RotateCcw, Cpu, Zap, Thermometer, Settings, Globe, Navigation, Brain, ExternalLink } from 'lucide-react';

interface ControlPanelProps {
  params: OptimizationParams;
  setParams: React.Dispatch<React.SetStateAction<OptimizationParams>>;
  onOptimize: () => void;
  onReset: () => void;
  isOptimizing: boolean;
  nodeCount: number;
  setNodeCount: (n: number) => void;
  scenario: ScenarioType;
  setScenario: (s: ScenarioType) => void;
  nodes: Node[];
  startNodeId: number;
  setStartNodeId: (id: number) => void;
}

const ALGORITHMS: { [key in AlgorithmType]: string } = {
  quantum_annealing: 'Quantum-Inspired Annealing',
  simulated_annealing: 'Simulated Annealing',
  greedy: 'Greedy Baseline',
  random: 'Random Search'
};

const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  setParams,
  onOptimize,
  onReset,
  isOptimizing,
  nodeCount,
  setNodeCount,
  scenario,
  setScenario,
  nodes,
  startNodeId,
  setStartNodeId
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParams((prev) => ({
      ...prev,
      [name]: parseFloat(value),
    }));
  };

  const isQuantum = params.algorithm === 'quantum_annealing';
  const isAnnealing = params.algorithm === 'simulated_annealing';
  const isGreedy = params.algorithm === 'greedy';
  const isRandom = params.algorithm === 'random';

  return (
    <div className="bg-qpanel border-r border-slate-800 p-6 flex flex-col gap-6 w-full md:w-80 h-full overflow-y-auto shadow-2xl z-10">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="text-qcyan w-8 h-8" />
        <h1 className="text-2xl font-bold bg-gradient-to-r from-qcyan to-qpurple bg-clip-text text-transparent">
          QIOE
        </h1>
      </div>

      {/* Scenario Selector */}
      <div className="space-y-4">
        <h2 className="text-slate-400 text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
          <Globe className="w-4 h-4" /> Real-World Context
        </h2>
        
        <div className="grid grid-cols-1 gap-2">
          {(Object.keys(SCENARIOS) as ScenarioType[]).map((key) => (
             <button
               key={key}
               onClick={() => setScenario(key)}
               disabled={isOptimizing}
               className={`text-left px-3 py-2 rounded text-xs font-medium transition-all border ${
                 scenario === key 
                   ? 'bg-qcyan/10 border-qcyan text-qcyan' 
                   : 'bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
               }`}
             >
               <div className="text-sm font-bold mb-0.5">{SCENARIOS[key].label}</div>
               <div className="opacity-70 font-normal truncate">{SCENARIOS[key].description}</div>
             </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-800 my-2" />

      {/* Algorithm Selector */}
      <div className="space-y-4">
        <h2 className="text-slate-400 text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
          <Brain className="w-4 h-4" /> Optimization Strategy
        </h2>
        <select
          value={params.algorithm}
          onChange={(e) => setParams(prev => ({ ...prev, algorithm: e.target.value as AlgorithmType }))}
          disabled={isOptimizing}
          className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:ring-1 focus:ring-qcyan outline-none"
        >
          {Object.entries(ALGORITHMS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div className="text-[10px] text-slate-500 italic leading-tight">
          {isQuantum && "Probabilistic tunneling escapes local minima effectively."}
          {isAnnealing && "Classic cooling schedule. Good exploration, slower convergence."}
          {isGreedy && "Nearest neighbor selection. Fast but gets stuck easily."}
          {isRandom && "Stochastic baseline. High variance, usually poor results."}
        </div>
      </div>

      <div className="h-px bg-slate-800 my-2" />

      {/* Topology & Configuration */}
      <div className="space-y-4">
        <h2 className="text-slate-400 text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
          <Settings className="w-4 h-4" /> Topology & Route
        </h2>
        
        {scenario === 'random' && (
          <div>
            <label className="block text-slate-300 text-xs mb-1">Node Count: {nodeCount}</label>
            <input
              type="range"
              min="5"
              max="50"
              value={nodeCount}
              onChange={(e) => setNodeCount(parseInt(e.target.value))}
              className="w-full accent-qcyan h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              disabled={isOptimizing}
            />
          </div>
        )}

        <div>
          <label className="block text-slate-300 text-xs mb-1 flex items-center gap-2">
             <Navigation className="w-3 h-3 text-green-500" /> Start Node (Depot)
          </label>
          <select 
            value={startNodeId} 
            onChange={(e) => setStartNodeId(Number(e.target.value))}
            disabled={isOptimizing}
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded p-2 focus:ring-1 focus:ring-qcyan outline-none"
          >
            {nodes.map(node => (
              <option key={node.id} value={node.id}>
                 Node {node.id} {node.label ? `(${node.label})` : ''}
              </option>
            ))}
          </select>
        </div>

        {scenario === 'random' && (
             <button
              onClick={onReset}
              disabled={isOptimizing}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors disabled:opacity-50 text-xs"
            >
              <RotateCcw className="w-3 h-3" /> Reshuffle Field
            </button>
        )}
      </div>

      <div className="h-px bg-slate-800 my-2" />

      <div className="space-y-6">
        <h2 className="text-slate-400 text-sm uppercase tracking-wider font-semibold flex items-center gap-2">
          <Zap className="w-4 h-4" /> Algorithm Params
        </h2>

        <div className={isGreedy || isRandom ? "opacity-30 pointer-events-none grayscale" : ""}>
          <label className="block text-slate-300 text-xs mb-1 flex justify-between">
            <span>Initial Temperature</span>
            <span className="text-qcyan">{params.init_temp}</span>
          </label>
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-slate-500" />
            <input
              type="range"
              name="init_temp"
              min="1"
              max="100"
              value={params.init_temp}
              onChange={handleChange}
              className="w-full accent-qpurple h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              disabled={isOptimizing || isGreedy || isRandom}
            />
          </div>
        </div>

        <div className={!isQuantum ? "opacity-30 pointer-events-none grayscale" : ""}>
          <label className="block text-slate-300 text-xs mb-1 flex justify-between">
            <span>Tunneling Rate</span>
            <span className="text-qcyan">{params.tunneling_rate}</span>
          </label>
          <input
            type="range"
            name="tunneling_rate"
            min="0"
            max="1"
            step="0.05"
            value={params.tunneling_rate}
            onChange={handleChange}
            className="w-full accent-qpurple h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            disabled={isOptimizing || !isQuantum}
          />
          <p className="text-[10px] text-slate-500 mt-1">Probability of accepting higher energy states (Quantum Tunneling emulation).</p>
        </div>
        
        <div>
          <label className="block text-slate-300 text-xs mb-1 flex justify-between">
            <span>Steps (Simulation)</span>
            <span className="text-qcyan">{params.steps}</span>
          </label>
          <input
            type="range"
            name="steps"
            min="1000"
            max="20000"
            step="1000"
            value={params.steps}
            onChange={handleChange}
            className="w-full accent-qpurple h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            disabled={isOptimizing}
          />
        </div>
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={onOptimize}
          disabled={isOptimizing}
          className={`w-full py-4 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all duration-300
            ${isOptimizing 
              ? 'bg-slate-700 cursor-not-allowed' 
              : 'bg-gradient-to-r from-qpurple to-blue-600 hover:from-qpurple hover:to-blue-500 hover:shadow-qpurple/50 shadow-qpurple/20'
            }`}
        >
          {isOptimizing ? (
            <>Processing...</>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" /> Initialize Engine
            </>
          )}
        </button>

        <div className="mt-4 flex justify-center">
            <a 
              href="https://aistudio.google.com/app/prompts?state=%7B%22ids%22:%5B%221VZYKLWVWL2clUc2famXWpAjrbCMfDh_S%22%5D,%22action%22:%22open%22,%22userId%22:%22105952408949759950015%22,%22resourceKeys%22:%7B%7D%7D&usp=sharing"
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[10px] text-slate-600 hover:text-qcyan transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View System Prompt</span>
            </a>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { OptimizationResponse, Node } from '../types';
import { Activity, Zap, CheckCircle, Brain, Target, Map, Timer, TrendingUp, BarChart3, Ruler } from 'lucide-react';

interface MetricsProps {
  data: OptimizationResponse | null;
  currentStepIndex: number;
  nodes: Node[];
  executionTime: number;
}

const Metrics: React.FC<MetricsProps> = ({ data, currentStepIndex, nodes, executionTime }) => {
  
  // Helper to calculate total route distance
  const calculateRouteDistance = (routeIds: number[]) => {
    if (!routeIds || routeIds.length < 2 || !nodes.length) return 0;
    
    return routeIds.reduce((total, id, index) => {
        const nextId = routeIds[(index + 1) % routeIds.length];
        const n1 = nodes.find(n => n.id === id);
        const n2 = nodes.find(n => n.id === nextId);
        
        if (n1 && n2) {
            const dist = Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
            return total + dist;
        }
        return total;
    }, 0);
  };

  // Memoize cumulative calculations to avoid recalculating on every render if not needed
  const { cumulativeTunneling, chartData, latest, isFinished, routeDetails, performanceStats, currentRealDist, bestRealDist } = useMemo(() => {
    if (!data) return { 
        cumulativeTunneling: 0, 
        chartData: [], 
        latest: null, 
        isFinished: false, 
        routeDetails: [],
        performanceStats: null,
        currentRealDist: 0,
        bestRealDist: 0
    };

    const sliced = data.iterations.slice(0, currentStepIndex + 1);
    const tunnelingCount = sliced.filter(it => it.tunneling).length;
    
    // Calculate route details for the current displayed route
    const currentIteration = data.iterations[currentStepIndex];
    const currentRouteIds = currentIteration.current_route;
    
    // Calculate real-time distances
    const currentRealDist = calculateRouteDistance(currentRouteIds);
    const bestRealDist = calculateRouteDistance(currentIteration.best_route);

    // Performance Calculations
    const initialEnergy = data.iterations[0].current_energy;
    const finalEnergy = data.final_result.best_energy;
    const improvement = ((initialEnergy - finalEnergy) / initialEnergy) * 100;
    
    // Find the step where best energy was first achieved
    const bestIter = data.iterations.find(it => Math.abs(it.best_energy - finalEnergy) < 0.001);
    const convergenceStep = bestIter ? bestIter.step : data.iterations[data.iterations.length - 1].step;
    
    const performanceStats = {
        initialEnergy,
        finalEnergy,
        improvement,
        convergenceStep,
        tunnelingTotal: data.final_result.tunneling_events
    };

    return {
      cumulativeTunneling: tunnelingCount,
      chartData: sliced,
      latest: currentIteration,
      isFinished: currentStepIndex === data.iterations.length - 1,
      routeDetails: currentRouteIds,
      performanceStats,
      currentRealDist,
      bestRealDist
    };
  }, [data, currentStepIndex, nodes]);

  if (!data || !latest) {
    return (
      <div className="h-full flex items-center justify-center text-slate-600 flex-col gap-2">
        <Brain className="w-12 h-12 opacity-20" />
        <p>Awaiting Quantum Simulation Data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Summary Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
           <Target className="w-3 h-3" />
           <span className="uppercase tracking-widest">{data.summary.problem_type}</span>
        </div>
        <div>
           NODES: <span className="text-slate-300">{data.summary.total_nodes}</span>
        </div>
      </div>

      {/* Performance Metrics Panel */}
      {performanceStats && (
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-lg p-3 border border-slate-700/50 shadow-lg relative overflow-hidden flex-shrink-0">
             <div className="absolute top-0 right-0 p-1 opacity-20">
                <BarChart3 className="w-16 h-16 text-slate-400" />
             </div>
             <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                 <Activity className="w-3 h-3 text-qcyan" /> Optimization Performance
             </h3>
             <div className="grid grid-cols-4 gap-2 relative z-10">
                
                {/* Improvement */}
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase">Improvement</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-green-400">{performanceStats.improvement.toFixed(1)}%</span>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                    </div>
                </div>

                {/* Distance Delta */}
                <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase">Dist. Reduction</span>
                     <div className="text-lg font-bold text-slate-200">
                        {Math.round(performanceStats.initialEnergy)} <span className="text-slate-500 text-xs">→</span> {Math.round(performanceStats.finalEnergy)} <span className="text-[9px] text-slate-500">km</span>
                     </div>
                </div>

                {/* Convergence */}
                <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase">Convergence</span>
                     <div className="text-lg font-bold text-qcyan">
                        Step {performanceStats.convergenceStep}
                     </div>
                </div>

                {/* Time */}
                <div className="flex flex-col">
                     <span className="text-[10px] text-slate-500 uppercase">Compute Time</span>
                     <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-slate-200">{(executionTime / 1000).toFixed(2)}s</span>
                        <Timer className="w-3 h-3 text-slate-500" />
                     </div>
                </div>
             </div>
        </div>
      )}

      {/* Live Playback Stats Cards */}
      <div className="grid grid-cols-4 gap-2 flex-shrink-0">
        <div className="bg-slate-800/30 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase mb-0.5 flex items-center gap-1">
            Current Dist <Ruler className="w-2 h-2" />
          </div>
          <div className="text-sm font-mono text-white">
            {currentRealDist.toFixed(1)} <span className="text-xs text-slate-500">km</span>
          </div>
        </div>
        
        <div className={`p-2 rounded border transition-colors ${isFinished ? 'bg-qcyan/5 border-qcyan/30' : 'bg-slate-800/30 border-slate-800'}`}>
          <div className="text-[10px] text-slate-500 uppercase mb-0.5 flex items-center gap-1">
             Best Dist <CheckCircle className="w-2 h-2" />
          </div>
          <div className={`text-sm font-mono ${isFinished ? 'text-qcyan' : 'text-slate-300'}`}>
            {bestRealDist.toFixed(1)} <span className="text-xs opacity-70">km</span>
          </div>
        </div>

        <div className="bg-slate-800/30 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase mb-0.5 flex items-center gap-1">
             Tunnels <Zap className={`w-2 h-2 ${latest.tunneling ? 'text-qpurple animate-pulse' : 'text-slate-600'}`} />
          </div>
          <div className="text-sm font-mono text-qpurple">
            {cumulativeTunneling} <span className="text-[10px] text-slate-600">/ {data.final_result.tunneling_events}</span>
          </div>
        </div>

        <div className="bg-slate-800/30 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase mb-0.5">Iter</div>
          <div className="text-sm font-mono text-white">
            {latest.step}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="flex-1 min-h-[150px] bg-slate-900/50 rounded-lg p-3 border border-slate-800 relative group flex flex-col">
        <h3 className="text-[10px] font-semibold text-slate-500 mb-2 z-10 opacity-60">ENERGY LANDSCAPE</h3>
        <div className="flex-1 w-full min-h-0 relative">
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                dataKey="step" 
                stroke="#475569" 
                tick={{fontSize: 9}}
                tickLine={false}
                axisLine={false}
                />
                <YAxis 
                stroke="#475569" 
                domain={['auto', 'auto']} 
                tick={{fontSize: 9}}
                tickLine={false}
                axisLine={false}
                width={25}
                />
                <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#f1f5f9', borderRadius: '4px' }}
                itemStyle={{ fontSize: '11px' }}
                cursor={{ stroke: '#334155', strokeWidth: 1 }}
                />
                <Line 
                type="monotone" 
                dataKey="current_energy" 
                stroke="#bc13fe" 
                strokeWidth={1.5} 
                dot={false}
                animationDuration={0}
                name="Energy"
                isAnimationActive={false}
                />
                <Line 
                type="stepAfter" 
                dataKey="best_energy" 
                stroke="#00f0ff" 
                strokeWidth={2} 
                dot={false}
                animationDuration={0}
                name="Minima"
                isAnimationActive={false}
                />
            </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Route Details Log */}
      <div className="flex-1 bg-slate-900/30 rounded-lg border border-slate-800 overflow-hidden flex flex-col min-h-[120px]">
         <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900/50">
           <Map className="w-3 h-3 text-qcyan" />
           <span className="text-[10px] font-bold text-slate-400 uppercase">Active Route Sequence</span>
         </div>
         <div className="overflow-y-auto p-2 text-xs font-mono space-y-1">
           {routeDetails.map((nodeId, idx) => {
             const nextNodeId = routeDetails[(idx + 1) % routeDetails.length];
             
             // Look up actual nodes to calculate distance and get names
             const currentNode = nodes.find(n => n.id === nodeId);
             const nextNode = nodes.find(n => n.id === nextNodeId);
             
             let distText = "--";
             let currentLabel = `Node ${nodeId}`;
             let nextLabel = `Node ${nextNodeId}`;

             if (currentNode && nextNode) {
               const d = Math.sqrt(Math.pow(currentNode.x - nextNode.x, 2) + Math.pow(currentNode.y - nextNode.y, 2));
               distText = d.toFixed(1);
               if (currentNode.label) currentLabel = currentNode.label;
               if (nextNode.label) nextLabel = nextNode.label;
             }

             return (
               <div key={idx} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors p-1 rounded hover:bg-slate-800/30">
                  <span className="w-5 text-right opacity-50">{idx + 1}.</span>
                  <div className="flex-1 flex justify-between items-center">
                    <span className={idx === 0 ? "text-green-400 font-bold truncate max-w-[60px]" : "text-slate-300 truncate max-w-[60px]"}>{currentLabel}</span>
                    <div className="flex items-center gap-1 mx-1 opacity-60">
                      <span className="h-px w-2 bg-slate-500"></span>
                      <span className="text-[9px] text-qcyan">{distText}</span>
                      <span className="h-px w-2 bg-slate-500"></span>
                      <span className="text-[9px]">→</span>
                    </div>
                    <span className={idx === routeDetails.length - 1 ? "text-green-400 truncate max-w-[60px]" : "text-slate-300 truncate max-w-[60px]"}>
                      {nextLabel}
                    </span>
                  </div>
               </div>
             );
           })}
         </div>
      </div>

      {/* Explanation Text */}
      <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 transition-all hover:bg-slate-800/50 flex-shrink-0">
        <div className="flex items-start gap-2">
          <div className="mt-1 min-w-[3px] h-[3px] rounded-full bg-qcyan" />
          <p>
            <span className="text-qcyan font-bold mr-1 uppercase text-[10px] tracking-wider">Analysis:</span>
            {data.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Metrics;